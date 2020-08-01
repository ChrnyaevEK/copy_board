from django.contrib.auth import views as auth_views
from django.urls import path
from django.urls import include

from . import views

urlpatterns = [
    path('', views.index, name='index'),
    path('accounts/password_reset/',
         auth_views.PasswordResetView.as_view(html_email_template_name='registration/password_reset_email.html'),
         name='password_reset'),
    path('accounts/', include('django.contrib.auth.urls')),
    path('registration/', views.registration, name="registration"),
    path('<int:collection_id>/', views.workspace, name='workspace'),
    path('ccollection/create/', views.CollectionView.create, name='ccollection_create'),
    path('ccard/regular/create/', views.RegularCardView.create, name='ccard_regular_create'),
    path('ccard/iter/number/create/', views.NumberCardView.create, name='ccard_iter_number_create'),
    path('ccard/iter/text/create/', views.TextCardView.create, name='ccard_iter_text_create'),
]
