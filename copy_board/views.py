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
                try:
                    source['access_type'] = request.POST['access_type']
                except KeyError:
                    pass
                try:
                    source['color'] = request.POST['color']
                except KeyError:
                    pass
            ccollection = CCollection.objects.create(**source)
            return JsonResponse(ccollection.as_json())
        raise Http404('Not found')
