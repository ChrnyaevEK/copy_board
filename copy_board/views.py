import json
from django.template import loader
from django.http import HttpResponse
from django.http import HttpResponseBadRequest
from django.http import JsonResponse
from django.http import Http404
from .models import CCollection
from .models import IterativeCCardNumber
from .models import RegularCCard
from .models import Constants
from django.forms.models import model_to_dict


def workspace(request, collection_id):
    template = loader.get_template('copy_board/html/workspace.html')
    return HttpResponse(template.render({
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
                    'to_val': request.POST['to_val'],
                    'step_val': request.POST['step_val'],
                }
            except KeyError:
                return HttpResponseBadRequest('Not enough data')
            else:
                try:
                    source['color'] = request.POST['color']
                except KeyError:
                    pass
                for optional in ('repeat', 'auto_copy', 'random'):
                    try:
                        source[optional] = True if request.POST[optional] == Constants.activated else False
                    except KeyError:
                        pass
            card = IterativeCCardNumber.objects.create(**source)
            return JsonResponse(model_to_dict(card))
        raise Http404('Not found')
