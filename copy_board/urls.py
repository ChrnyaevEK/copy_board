from django.urls import path

from . import views

urlpatterns = [
    path('<int:collection_id>/', views.workspace, name='workspace'),
    path('ccollection/create/', views.CCollectionView.create, name='ccollection_create'),
    path('ccard/regular/create/', views.RegularCCardView.create, name='ccard_regular_create'),
    path('ccard/iter/number/create/', views.IterativeCCardNumberView.create, name='ccard_iter_number_create'),
]