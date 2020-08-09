# Generated by Django 3.0.8 on 2020-07-26 18:02

from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ('copy_board', '0007_ccollection_user'),
    ]

    operations = [
        migrations.AlterField(
            model_name='iterativeccardnumber',
            name='ccollection',
            field=models.ForeignKey(null=True, on_delete=django.db.models.deletion.CASCADE, to='copy_board.CCollection'),
        ),
        migrations.AlterField(
            model_name='iterativeccardtext',
            name='ccollection',
            field=models.ForeignKey(null=True, on_delete=django.db.models.deletion.CASCADE, to='copy_board.CCollection'),
        ),
        migrations.AlterField(
            model_name='regularccard',
            name='ccollection',
            field=models.ForeignKey(null=True, on_delete=django.db.models.deletion.CASCADE, to='copy_board.CCollection'),
        ),
    ]