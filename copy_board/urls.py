from django.contrib.auth import views as auth_views
from django.urls import path
from django.urls import include

from . import views

urlpatterns = [
    path('', views.workspace, name='main_workspace'),
    path('accounts/password_reset/',
         auth_views.PasswordResetView.as_view(html_email_template_name='registration/password_reset_email.html'),
         name='password_reset'),
    path('accounts/', include('django.contrib.auth.urls')),
    path('registration/', views.registration, name="registration"),
    path('<int:cid>/', views.workspace, name='workspace'),
    path('collection/create/', views.CollectionView.create, name='collection_create'),
    path('collection/remove/', views.CollectionView.remove, name='collection_remove'),
    path('card/<str:card_type>/update_create/', views.CardView.update_create, name='card_update_create'),
    path('card/<str:card_type>/remove/', views.CardView.remove, name='card_remove'),
]
