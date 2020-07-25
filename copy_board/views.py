import json
from django.template import loader
from django.http import HttpResponse
from django.http import HttpResponseBadRequest
from django.http import JsonResponse
from django.http import Http404
from .models import CCollection
from .models import IterativeCCardNumber
from .models import IterativeCCardText
from .models import RegularCCard
from .models import Constants
from django.forms.models import model_to_dict


def index(request):
    tempalte = loader.get_template('copy_board/html/index.html')
    return HttpResponse(tempalte.render({
        'user': request.user if request.user.is_authenticated else None
    }))


def workspace(request, collection_id=1):
    template = loader.get_template('copy_board/html/workspace.html')
    collection = CCollection.objects.get(id=collection_id)
    collections = [model_to_dict(c) for c in CCollection.objects.all()]
    cards = []
    cards.extend(collection.regularccard_set.all())
    cards.extend(collection.iterativeccardnumber_set.all())
    cards.extend(collection.iterativeccardtext_set.all())
    for i in range(1, len(cards)):
        item_to_insert = cards[i]
        j = i - 1
        while j >= 0 and cards[j].creation_date > item_to_insert.creation_date:
            cards[j + 1] = cards[j]
            j -= 1
        cards[j + 1] = item_to_insert
    for i in range(len(cards)):
        if isinstance(cards[i], RegularCCard):
            cards[i] = ('reg', json.dumps(model_to_dict(cards[i])))
        elif isinstance(cards[i], IterativeCCardNumber):
            cards[i] = ('num', json.dumps(model_to_dict(cards[i])))
        else:
            cards[i] = ('text', json.dumps(model_to_dict(cards[i])))
    return HttpResponse(template.render({
        'collections': collections,
        'cards': cards,
        'color_set': [item[0] for item in Constants.color_set],
        'default_color': Constants.default_color,
        'access_type_set': [item[0] for item in Constants.access_type_set],
        'default_access_type': Constants.default_access_type,
    }, request))


class CCollectionView:
    @staticmethod
    def create(request):
        if request.method == 'POST':
            try:
                source = {
                    'title': request.POST['title'],
                }
            except KeyError:
                return HttpResponseBadRequest('Not enough data')
            else:
                for optional in ('color', 'access_type'):
                    try:
                        source[optional] = request.POST[optional]
                    except KeyError:
                        pass
            ccollection = CCollection.objects.create(**source)
            return JsonResponse(model_to_dict(ccollection))
        raise Http404('Not found')


class RegularCCardView:
    @staticmethod
    def create(request):
        if request.method == 'POST':
            try:
                source = {  # TODO bind ccollection
                    'title': request.POST['title'],
                    'copy_content': request.POST['copy_content'],
                }
            except KeyError:
                return HttpResponseBadRequest('Not enough data')
            else:
                try:
                    source['color'] = request.POST['color']
                except KeyError:
                    pass
            card = RegularCCard.objects.create(**source)
            return JsonResponse(model_to_dict(card))
        raise Http404('Not found')


class IterativeCCardNumberView:
    @staticmethod
    def create(request):
        if request.method == 'POST':
            try:
                source = {  # TODO bind ccollection
                    'title': request.POST['title'],
                    'from_val': request.POST['from_val'],
                    'step_val': request.POST['step_val'],
                }
            except KeyError:
                return HttpResponseBadRequest('Not enough data')
            else:
                try:
                    source['endless'] = request.POST['endless'] == Constants.activated
                except KeyError:
                    try:
                        source['to_val'] = request.POST['to_val']
                    except KeyError:
                        return HttpResponseBadRequest('Not enough data')
                try:
                    source['color'] = request.POST['color']
                except KeyError:
                    pass
                for option in ('repeat', 'auto_copy', 'random'):
                    try:
                        source[option] = request.POST[option] == Constants.activated
                    except KeyError:
                        pass
            card = IterativeCCardNumber.objects.create(**source)
            card = model_to_dict(card)
            for option in ('from_val', 'to_val', 'step_val'):
                try:
                    card[option] = int(card[option])
                except TypeError:
                    pass
            return JsonResponse(card)
        raise Http404('Not found')


class IterativeCCardTextView:
    @staticmethod
    def create(request):
        if request.method == 'POST':
            try:
                source = {  # TODO bind ccollection
                    'title': request.POST['title'],
                    'content': request.POST['content'],
                    'delimiter': request.POST['delimiter'],
                }
            except KeyError:
                return HttpResponseBadRequest('Not enough data')
            else:
                try:
                    source['color'] = request.POST['color']
                except KeyError:
                    pass
                for optional in ('remove_whitespace', 'repeat', 'auto_copy', 'random'):
                    try:
                        source[optional] = request.POST[optional] == Constants.activated
                    except KeyError:
                        pass
            card = IterativeCCardText.objects.create(**source)
            return JsonResponse(model_to_dict(card))
        raise Http404('Not found')
