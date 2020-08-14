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
import json


def client_ip(request):
    x_forwarded_for = request.META.get('HTTP_X_FORWARDED_FOR')
    if x_forwarded_for:
        ip = x_forwarded_for.split(',')[0]
    else:
        ip = request.META.get('REMOTE_ADDR')
    print(f'Request IP: {ip}')


@require_GET
def index(request):
    client_ip(request)
    template = loader.get_template('copy_board/html/index.html')
    return HttpResponse(template.render({
        'Constants': Constants,
        'user': request.user
    }))


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
            login(request, user)
            collection = Collection.objects.create(user=user, title=Constants.default_title, is_main=True)
            request.session['c_id'] = collection.id
            return redirect(reverse('main_workspace'))
        else:
            template = loader.get_template('registration/registration.html')
            return HttpResponse(template.render({
                'form': form,
                'errors': list(form.errors.items())[0][1]
            }, request))


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
                if c_id == request.session['c_id']:
                    collection = Collection.objects.get(pk=c_id)
                else:
                    return redirect(reverse('workspace', kwargs={'c_id': request.session['c_id']}))
            except KeyError:
                return HttpResponseForbidden()
    else:
        if user.is_authenticated:
            try:
                collection = Collection.objects.get(user=user, is_main=True)
            except ObjectDoesNotExist:
                collection = Collection.objects.create(user=user, is_main=True, title=Constants.default_title)
        else:
            try:
                collection = Collection.objects.get(pk=request.session['c_id'])
            except (KeyError, ObjectDoesNotExist):
                collection = Collection.objects.create(is_main=True, title=Constants.default_title)
                request.session['c_id'] = collection.id
                return redirect(reverse('workspace', kwargs={'c_id': collection.id}))
    if user.is_authenticated:
        collections = Collection.objects.filter(user=user)
    else:
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
        'c_id': collection.id,
        'workspace': True,
        'collection_builder': user.is_authenticated,
        'collections': Common.iter_json(collections),
        'cards': Common.iter_json(cards),
        'Constants': Constants,
        'user': request.user,
    }, request))


class CollectionView:
    @staticmethod
    @require_POST
    def create(request):
        user = request.user
        data = Common.pick(Common.get_data(request.POST), [field.name for field in Collection._meta.get_fields()])
        try:
            if not data['title'].strip(): raise KeyError()
        except KeyError:
            return HttpResponseBadRequest(Constants.bad_request)
        try:
            collection = Collection.objects.create(user=user, **data)
        except IntegrityError:
            return HttpResponseBadRequest(Constants.bad_request)
        return JsonResponse(collection.json())

    @staticmethod
    @require_POST
    def remove(request):
        user = request.user
        try:
            Collection.objects.get(user=user, pk=Common.get_data(request.POST)['id']).delete()
        except (KeyError, ObjectDoesNotExist):
            return HttpResponseBadRequest('Not enough data')
        return JsonResponse(Common.api(success='OK'))


class CardView:
    @staticmethod
    @require_POST
    def create(request, card_type):
        try:
            card = {
                'regular': RegularCard,
                'number': NumberCard,
                'text': TextCard,
            }[card_type]
        except KeyError:
            return HttpResponseBadRequest(Constants.bad_request)
        user = request.user
        data = Common.get_data(request.POST)
        if user.is_authenticated:
            try:
                collection = Collection.objects.get(user=user, pk=data['c_id'])
            except (KeyError, ObjectDoesNotExist):
                return HttpResponseBadRequest(Constants.bad_request)
        else:
            try:
                c_id = int(data['c_id'])
            except (KeyError, TypeError):
                return HttpResponseBadRequest(Constants.bad_request)
            try:
                if c_id == request.session['c_id']:
                    collection = Collection.objects.get(pk=c_id)
                else:
                    return HttpResponseForbidden()
            except KeyError:
                return HttpResponseForbidden()
        try:
            data = Common.pick(data, [field.name for field in card._meta.get_fields()])
            card = card.objects.create(collection=collection, index=collection.last_index, **data)
        except IntegrityError:
            return HttpResponseBadRequest(Constants.bad_request)
        else:
            collection.last_index += 1
            collection.save()
            return JsonResponse(card.json())

    @staticmethod
    @require_POST
    def remove(request, card_type):
        try:
            card = {
                'regular': RegularCard,
                'number': NumberCard,
                'text': TextCard,
            }[card_type]
        except KeyError:
            return HttpResponseBadRequest(Constants.bad_request)
        user = request.user
        data = Common.get_data(request.POST)
        if user.is_authenticated:
            try:
                collection = Collection.objects.get(user=user, pk=data['c_id'])
            except (KeyError, ObjectDoesNotExist):
                return HttpResponseBadRequest(Constants.bad_request)
        else:
            try:
                c_id = int(data['c_id'])
            except (KeyError, TypeError):
                return HttpResponseBadRequest(Constants.bad_request)
            try:
                if c_id == request.session['c_id']:
                    collection = Collection.objects.get(pk=c_id)
                else:
                    return HttpResponseForbidden()
            except KeyError:
                return HttpResponseForbidden()
        try:
            card.objects.get(collection=collection, pk=data['id']).delete()
        except (KeyError, ObjectDoesNotExist):
            return HttpResponseBadRequest(Constants.bad_request)
        else:
            return JsonResponse(Common.api(success='OK'))

    @staticmethod
    @require_POST
    def update(request, card_type):
        try:
            card = {
                'regular': RegularCard,
                'number': NumberCard,
                'text': TextCard,
            }[card_type]
        except KeyError:
            return HttpResponseBadRequest(Constants.bad_request)
        user = request.user
        data = Common.get_data(request.POST)
        if user.is_authenticated:
            try:
                collection = Collection.objects.get(user=user, pk=data['c_id'])
            except (KeyError, ObjectDoesNotExist):
                return HttpResponseBadRequest(Constants.bad_request)
        else:
            try:
                c_id = int(data['c_id'])
            except (KeyError, TypeError):
                return HttpResponseBadRequest(Constants.bad_request)
            try:
                if c_id == request.session['c_id']:
                    collection = Collection.objects.get(pk=c_id)
                else:
                    return HttpResponseForbidden()
            except KeyError:
                return HttpResponseForbidden()
        try:
            data = Common.pick(data, [field.name for field in card._meta.get_fields()])
            card = card.objects.filter(collection=collection, pk=data['id']).update(**data)
        except (KeyError, ObjectDoesNotExist):
            return HttpResponseBadRequest(Constants.bad_request)
        else:
            return JsonResponse(Common.api(success='OK'))


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
    def get_data(obj):
        return json.loads(obj['data'])

    @staticmethod
    def pick(source, fields):
        res = {}
        for key in fields:
            try:
                res[key] = source[key]
            except KeyError:
                pass
        return res
