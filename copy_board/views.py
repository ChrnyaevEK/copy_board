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
from django.urls import reverse
from django.shortcuts import redirect
from django.contrib.auth.models import Permission, User
from django.core.exceptions import ObjectDoesNotExist
from django.db import IntegrityError
from django.views.decorators.http import require_http_methods, require_GET, require_POST
from itertools import chain


# TODO Do not allow to create too much collections if user is not auth.


@require_http_methods(["GET", "POST"])
def registration(request):
    if request.method == "GET":
        template = loader.get_template('registration/registration.html')
        return HttpResponse(template.render({
            'form': RegistrationForm,
            'next': 'index'
        }, request))
    elif request.method == "POST":
        if User.objects.filter(email__exact=request.POST['email']).exists():
            return JsonResponse(Common.api(error='User already exist!'))  # Resource exist
        else:
            form = RegistrationForm(request.POST)
            if form.is_valid():
                user = form.save()
                Collection.objects.create(user=user, title=Constants.default_title)
                login(request, user)
                return redirect(reverse('index'))
            else:
                return JsonResponse(Common.api(error=list(form.errors.values())[0]))


@require_GET
def workspace(request, c_id=None):
    template = loader.get_template('copy_board/html/workspace.html')
    user = request.user
    if c_id is not None:
        if user.is_authenticated:
            try:
                collection = Collection.objects.get(user=user, pk=c_id)
            except ObjectDoesNotExist:
                return HttpResponseForbidden()
        else:
            try:
                seccion_c_id = request.session['c_id']
            except KeyError:
                return HttpResponseForbidden()
            if seccion_c_id == c_id:
                collection = Collection.objects.get(pk=c_id)
            else:
                return HttpResponseForbidden()
    else:
        collection = Collection.objects.get_or_create(is_main=True, title=Constants.default_title, user=user if user.is_authenticated else None)[0]
    if user.is_authenticated:
        collections = Collection.objects.filter(user=user)
    else:
        request.session['c_id'] = collection.id
        collections = [collection]
    regular_cards = collection.regularcard_set.all()
    number_cards = collection.numbercard_set.all()
    text_cards = collection.textcard_set.all()
    cards = sorted(
        chain(regular_cards, number_cards, text_cards),
        key=lambda instance: instance.index,
        reverse=True,
    )
    return HttpResponse(template.render({
        'c_id': c_id,
        'collection_builder': user.is_authenticated,
        'collections': Common.iter_json(collections),
        'cards': Common.iter_json(cards),
        'Constants': Constants,
    }, request))


class CollectionView:
    @staticmethod
    @require_POST
    def create(request):
        user = request.user
        data = Common.pick(request.POST, [field.name for field in Collection._meta.get_fields()])
        try:
            collection = Collection.objects.create(user=user, **data) if user.is_authenticated else Collection(**data)
        except IntegrityError:  # TODO check
            return HttpResponseBadRequest('Not enough data')
        return JsonResponse(collection.json())

    @staticmethod
    @require_POST
    def remove(request):
        user = request.user
        try:
            Collection.objects.get(user=user, id=request.POST['id']).delete()
        except (KeyError, ObjectDoesNotExist):
            return HttpResponseBadRequest('Not enough data')
        return JsonResponse(Common.api(success='OK'))


class CardView:
    @staticmethod
    def create(request, card):
        try:
            collection = Collection.objects.get(request.user, request.POST['c_id'])
        except (KeyError, ObjectDoesNotExist):
            return HttpResponseBadRequest(Constants.bad_request)
        try:
            data = Common.pick(request.POST, [field.name for field in card._meta.get_fields()])
            card = card.objects.create(collection=collection, index=collection.last_index, **data)
        except IntegrityError:
            return HttpResponseBadRequest(Constants.bad_request)
        else:
            collection.last_index += 1
            collection.save()
            return JsonResponse(card.json())

    @staticmethod
    @require_POST
    def create_regular(request):
        return CardView.create(request, RegularCard)

    @staticmethod
    @require_POST
    def create_number(request):
        return CardView.create(request, NumberCard)

    @staticmethod
    @require_POST
    def create_text(request):
        return CardView.create(request, TextCard)


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
    def pick(source, fields):
        res = {}
        for key in fields:
            try:
                res[key] = source[key]
            except KeyError:
                pass
        return res
