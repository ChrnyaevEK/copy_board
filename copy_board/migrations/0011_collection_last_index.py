# Generated by Django 3.0.8 on 2020-08-02 12:36

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('copy_board', '0010_auto_20200802_1228'),
    ]

    operations = [
        migrations.AddField(
            model_name='collection',
            name='last_index',
            field=models.IntegerField(default=0),
        ),
    ]