from django.urls import path

from . import views

urlpatterns = [
    path('', views.index, name='index'),
    path('<int:collection_id>/', views.workspace, name='workspace'),
]