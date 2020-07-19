from django.urls import path

from . import views

urlpatterns = [
    path('<int:collection_id>/', views.workspace, name='workspace'),
    path('create/', views.CCollectionView.create, name='ccollection_create'),
]