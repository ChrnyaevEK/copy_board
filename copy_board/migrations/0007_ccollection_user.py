# Generated by Django 3.0.8 on 2020-07-26 16:42

from django.conf import settings
from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
        ('copy_board', '0006_auto_20200725_1204'),
    ]

    operations = [
        migrations.AddField(
            model_name='ccollection',
            name='user',
            field=models.ForeignKey(null=True, on_delete=django.db.models.deletion.CASCADE, to=settings.AUTH_USER_MODEL),
        ),
    ]
