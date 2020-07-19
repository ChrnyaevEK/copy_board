from django.contrib import admin
from .models import CCollection, IterativeCCardNumber, RegularCCard

admin.site.register(CCollection)
admin.site.register(IterativeCCardNumber)
admin.site.register(RegularCCard)
