import json
from django.template import loader
from django.http import HttpResponse
from django.http import HttpResponseBadRequest
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


# TODO Do not allow to create too much collections if user is not auth.


@require_GET
def index(request):
    return HttpResponse(loader.get_template('copy_board/html/index.html').render({
        'user': request.user if request.user.is_authenticated else None
    }))


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
            return JsonResponse(Constants.api(error='User already exist!'))  # Resource exist
        else:
            form = RegistrationForm(request.POST)
            if form.is_valid():
                user = form.save()
                Collection.objects.create(user=user, title=Constants.default_title)
                login(request, user)
                return redirect(reverse('index'))
            else:
                return JsonResponse(Constants.api(error=list(form.errors.values())[0]))


@require_GET
def workspace(request, c_id):
    template = loader.get_template('copy_board/html/workspace.html')
    user = request.user
    collection = CollectionView.get(user, c_id)
    collections = Collection.objects.filter(user=user) if user.is_authenticated else []
    cards = collection.regularcard_set.all().union(collection.numbercard_set.all(), collection.textcard_set.all())
    cards.order_by('index')
    return HttpResponse(template.render({
        'collection_builder': user.is_authenticated,
        'collections': collections,
        'cards': cards,
        'Constants': Constants,
    }, request))


class CollectionView:
    @staticmethod
    @require_POST
    def create(request):
        user = request.user
        try:
            collection = Collection.objects.create(user, **request.POST) if user.is_authenticated else Collection(
                **request.POST)
        except IntegrityError:  # TODO check
            return HttpResponseBadRequest('Not enough data')
        return JsonResponse(collection.json())

    @classmethod
    def get(cls, user, c_id):
        try:
            return Collection.objects.get(pk=c_id, user=user)
        except ObjectDoesNotExist:
            return Collection.objects.get_or_create(title=Constants.default_title,
                                                    user=user if user.is_authenticated else None)[0]


class CardView:
    @staticmethod
    def create(request, card):
        try:
            collection = CollectionView.get(request.user, request.POST['c_id'])
        except KeyError:
            return HttpResponseBadRequest(Constants.bad_request)
        try:
            return JsonResponse(card.objects.create(collection=collection, **request.POST).json())
        except IntegrityError:
            return HttpResponseBadRequest(Constants.bad_request)

    @classmethod
    @require_POST
    def create_regular(cls, request):
        return cls.create(request, RegularCard)

    @classmethod
    @require_POST
    def create_number(cls, request):
        return cls.create(request, NumberCard)

    @classmethod
    @require_POST
    def create_text(cls, request):
        return cls.create(request, TextCard)
