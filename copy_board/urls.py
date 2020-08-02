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
    path('<int:c_id>/', views.workspace, name='workspace'),
    path('collection/create/', views.CollectionView.create, name='collection_create'),
    path('collection/remove/', views.CollectionView.remove, name='collection_remove'),
    path('card/regular/create/', views.CardView.create_regular, name='card_regular_create'),
    path('card/number/create/', views.CardView.create_number, name='card_number_create'),
    path('card/text/create/', views.CardView.create_text, name='card_text_create'),
]
