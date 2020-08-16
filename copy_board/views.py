from django.template import loader
from django.http import HttpResponse
from django.http import HttpResponseBadRequest
from django.http import HttpResponseForbidden
from django.http import JsonResponse
from .models import Collection
from .models import NumberCard
from .models import TextCard
from .models import RegularCard
from .models import Constants
from copy_board.forms import RegistrationForm
from django.contrib.auth import login
from django.contrib.auth.decorators import login_required
from django.urls import reverse
from django.shortcuts import redirect
from django.contrib.auth.models import Permission, User
from django.core.exceptions import ObjectDoesNotExist
from django.db import IntegrityError
from django.views.decorators.http import require_http_methods, require_GET, require_POST
from itertools import chain
import json


@require_GET
def index(request):
    template = loader.get_template('copy_board/html/index.html')
    return HttpResponse(template.render({
        'Constants': Constants,
        'user': request.user
    }))


class TTException(Exception):
    """ Base exception class """
    pass


class CollectionException(TTException):
    """ Collection level exceptions """
    pass


class CollectionNotFound(CollectionException):
    """ Collection was not found """
    pass


class CollectionPermissionDenied(CollectionException):
    """ User has no permissions """
    pass


class TTId:
    """ TTid stands for Top Tools Identity """

    def __init__(self, collection, user, location_redirect=False):
        self.collection = collection
        self.user = user
        self.location_redirect = location_redirect  # cid is None, redirect to ss_cid for anon users

    @classmethod
    def inspect(cls, request, data, cid=None, strict=False):
        """
        Identify user and collection
        :param request: request object
        :param data: depends on method: request.POST, request,GET ...
        :param cid: cid from URL
        :param strict: True will forbid using main collection and will require cid directly
        :return: TTID instance or raise
        """
        user = request.user
        use_main = False  # cid is None and user is auth-ed
        ss_cid = None  # For anon users session cid should be equal to request cid

        if cid is None:
            try:  # Try to get cid from request
                cid = int(data['cid'])
            except (KeyError, TypeError):
                pass
        try:
            ss_cid = request.session['cid']
        except KeyError:
            pass
        if user.is_authenticated and cid is None and not strict: use_main = True
        if cid is None and ss_cid is None and not use_main: raise CollectionNotFound()  # No collection info supplied
        if not user.is_authenticated and cid is not None and cid != ss_cid: raise CollectionPermissionDenied()
        try:
            if user.is_authenticated:
                if use_main:
                    collection = Collection.objects.get(user=user, is_main=True)
                else:
                    collection = Collection.objects.get(user=user, id=cid)
            else:
                collection = Collection.objects.get(id=ss_cid)
        except ObjectDoesNotExist:
            raise CollectionNotFound()
        return cls(collection, user, location_redirect=((not user.is_authenticated) and cid is None))


class StdProcedure:
    @staticmethod
    def default_kit(request):
        """ Check for main collection, create it and set session values """
        try:
            cid = request.session['cid']
        except KeyError:
            # Create default main collection
            if not request.user.is_authenticated:
                collection = Collection.objects.create(is_main=True, title=Constants.default_title)
                # Set ss_cid for security reasons
                request.session['cid'] = collection.id
            else:
                collection = Collection.objects.get_or_create(is_main=True,
                                                              title=Constants.default_title,
                                                              user=request.user)
        else:
            # Bind collection to user
            collection = Collection.objects.get(pk=cid)
            if request.user.is_authenticated:
                collection.user = request.user
                collection.save()
        return collection


@require_http_methods(["GET", "POST"])
def registration(request):
    if request.method == "GET":
        template = loader.get_template('registration/registration.html')
        return HttpResponse(template.render({
            'form': RegistrationForm,
        }, request))
    elif request.method == "POST":
        form = RegistrationForm(request.POST)
        if form.is_valid():
            user = form.save()
            login(request, user, backend='django.contrib.auth.backends.ModelBackend')
            StdProcedure.default_kit(request)
            return redirect(reverse('main_workspace'))
        else:
            template = loader.get_template('registration/registration.html')
            return HttpResponse(template.render({
                'form': form,
                'errors': list(form.errors.items())[0][1]
            }, request))


@require_GET
def workspace(request, cid=None):
    template = loader.get_template('copy_board/html/workspace.html')
    try:
        ttid = TTId.inspect(request, data=request.GET, cid=cid)
    except CollectionNotFound:  # New user - create collection and redirect
        collection = StdProcedure.default_kit(request)
        return redirect(reverse('workspace', kwargs={'cid': collection.id}))
    except CollectionPermissionDenied:  # Denied permission
        return HttpResponseForbidden()
    else:
        if ttid.location_redirect:
            return redirect(reverse('workspace', kwargs={'cid': ttid.collection.id}))
        # Find user's collections
        if ttid.user.is_authenticated:
            collections = Collection.objects.filter(user=ttid.user)
        else:
            collections = [ttid.collection]
        regular_cards = ttid.collection.regularcard_set.all()
        number_cards = ttid.collection.numbercard_set.all()
        text_cards = ttid.collection.textcard_set.all()
        cards = sorted(
            chain(regular_cards, number_cards, text_cards),
            key=lambda instance: instance.index,
            reverse=True,
        )
        return HttpResponse(template.render({
            'cid': ttid.collection.id,
            'workspace': True,
            'collection_builder': ttid.user.is_authenticated,
            'collections': Common.iter_json(collections),
            'cards': Common.iter_json(cards),
            'Constants': Constants,
            'user': ttid.user,
        }, request))


class CollectionView:
    @staticmethod
    @require_POST
    @login_required
    def create(request):
        data = Common.pick(json.loads(request.body), Common.model_fields(Collection))
        if 'title' not in data or not data['title'].strip():
            return HttpResponseBadRequest(Constants.bad_request)
        else:
            try:
                return JsonResponse(Collection.objects.create(user=request.user, **data).json())
            except IntegrityError:
                return HttpResponseBadRequest(Constants.bad_request)

    @staticmethod
    @require_POST
    @login_required
    def remove(request):
        try:
            Collection.objects.get(user=request.user, pk=json.loads(request.body)['id']).delete()
        except (KeyError, ObjectDoesNotExist):
            return HttpResponseBadRequest(Constants.bad_request)
        return JsonResponse(Common.api(success='OK'))


class CardView:
    @staticmethod
    @require_POST
    def remove(request, card_type):
        try:
            card_class = {
                'regular': RegularCard,
                'number': NumberCard,
                'text': TextCard,
            }[card_type]
        except KeyError:
            return HttpResponseBadRequest(Constants.bad_request)
        data = Common.pick(json.loads(request.body), Common.model_fields(card_class))
        try:
            ttid = TTId.inspect(request, data, strict=True)
        except CollectionNotFound:
            return HttpResponseBadRequest(Constants.bad_request)
        except CollectionPermissionDenied:
            return HttpResponseForbidden()
        try:
            card_class.objects.get(collection=ttid.collection, pk=data['id']).delete()
        except (KeyError, ObjectDoesNotExist):
            return HttpResponseBadRequest(Constants.bad_request)
        else:
            return JsonResponse(Common.api(success='OK'))

    @staticmethod
    @require_POST
    def update_create(request, card_type):
        try:
            card_class = {
                'regular': RegularCard,
                'number': NumberCard,
                'text': TextCard,
            }[card_type]
        except KeyError:
            return HttpResponseBadRequest(Constants.bad_request)
        data = json.loads(request.body)
        try:
            ttid = TTId.inspect(request, data, strict=True)
        except CollectionNotFound:
            return HttpResponseBadRequest(Constants.bad_request)
        except CollectionPermissionDenied:
            return HttpResponseForbidden()
        data = Common.pick(json.loads(request.body), Common.model_fields(card_class))
        try:
            card_class.objects.filter(collection=ttid.collection, pk=data['id']).update(**data)
            card = card_class.objects.get(collection=ttid.collection, pk=data['id'])
        except (KeyError, ObjectDoesNotExist):
            data['index'] = ttid.collection.last_index
            card = card_class.objects.create(collection=ttid.collection, **data)
            ttid.collection.last_index += 1
            ttid.collection.save()
        return JsonResponse(card.json())


class Common:

    @staticmethod
    def iter_json(query):
        for item in query:
            yield item.json()

    @staticmethod
    def api(error='', success='', data={}):
        return {
            'success': success,
            'error': error,
            'data': data,
        }

    @staticmethod
    def model_fields(model):
        return [field.name for field in model._meta.get_fields()]

    @staticmethod
    def pick(source, fields):
        res = {}
        for key in fields:
            try:
                res[key] = source[key]
            except KeyError:
                pass
        return res
