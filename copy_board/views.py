from django.shortcuts import render
from django.template import loader
from django.http import HttpResponse


def index(request):
    return HttpResponse('<h3><span style="color: white; background-color: teal; display: inline-flex; padding: 5px">ʕ•́ᴥ•̀ʔっ</br>Coming soon!</span></h3>')


def workspace(request, collection_id):
    template = loader.get_template('copy_board/workspace.html')
    return HttpResponse(template.render({}, request))
