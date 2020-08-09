from django.db import models
from django.contrib.auth.models import User
from django.urls import reverse
import json


class Constants:
    color_set = (
        ('blue', 'Blue'),
        ('cyan', 'Cyan'),
        ('teal', 'Teal'),
        ('green', 'Green'),
        ('amber', 'Amber'),
        ('orange', 'Orange'),
        ('red', 'Red'),
        ('pink', 'Pink'),
        ('purple', 'Purple'),
        ('indigo', 'Indigo'),
    )
    access_type_set = (
        # ('public', 'Public'),
        ('private', 'Private'),
        # ('protected', 'Protected'),
    )

    default_color = 'teal'
    default_access_type = 'private'
    activated = 'on'
    undefined = 'undefined'
    default_title = 'Main'
    bad_request = 'Not enough data'


class Collection(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, null=True)
    title = models.CharField(max_length=200)
    creation_date = models.DateTimeField(auto_now_add=True)
    access_type = models.CharField(max_length=10, choices=Constants.access_type_set,
                                   default=Constants.default_access_type)
    color = models.CharField(max_length=10, choices=Constants.color_set, default=Constants.default_color)
    last_index = models.IntegerField(default=0)
    is_main = models.BooleanField(default=False)

    def __str__(self):
        return self.title

    class Meta:
        verbose_name = 'Collection'
        verbose_name_plural = 'Collections'
        ordering = ['-creation_date']

    def json(self):
        return {
            'id': self.id,
            'is_main': self.is_main,
            'title': self.title,
            'creation_date': self.creation_date.isoformat() if self.creation_date is not None else Constants.undefined,
            'access_type': self.access_type,
            'color': self.color,
            'href': reverse('workspace', kwargs={'c_id': self.id})
        }


class Card(models.Model):
    collection = models.ForeignKey(Collection, on_delete=models.CASCADE, null=True)
    title = models.CharField(max_length=200)
    creation_date = models.DateTimeField(auto_now_add=True)
    color = models.CharField(max_length=10, choices=Constants.color_set, default=Constants.default_color)
    index = models.IntegerField()

    def __str__(self):
        return self.title

    class Meta:
        abstract = True

    def json(self, **kwargs):
        return {
            'id': self.id,
            'title': self.title,
            'creation_date': self.creation_date.isoformat() if self.creation_date is not None else Constants.undefined,
            'index': self.index,
            'color': self.color,
            **kwargs
        }


class RegularCard(Card):
    copy_content = models.TextField(verbose_name='Content to be copied', max_length=2000)

    class Meta:
        verbose_name = 'Regular card'
        verbose_name_plural = 'Regular cards'

    def json(self):
        return super().json(**{
            'card_type': 'regular',
            'copy_content': self.copy_content,
        })


class NumberCard(Card):
    from_val = models.IntegerField()
    to_val = models.IntegerField(null=True)
    step_val = models.IntegerField()
    auto_copy = models.BooleanField(default=False)
    endless = models.BooleanField(default=False)
    repeat = models.BooleanField(default=False)
    random = models.BooleanField(default=False)

    class Meta:
        verbose_name = 'Iterative card(number)'
        verbose_name_plural = 'Iterative cards(number)'

    def json(self):
        return super().json(**{
            'card_type': 'number',
            'value': float(self.from_val),
            'from_val': float(self.from_val),
            'to_val': float(self.to_val) if self.to_val is not None else Constants.undefined,
            'step_val': float(self.step_val),
            'auto_copy': self.auto_copy,
            'endless': self.endless,
            'repeat': self.repeat,
            'random': self.random,
        })


class TextCard(Card):
    content = models.TextField()
    delimiter = models.CharField(max_length=50)
    remove_whitespace = models.BooleanField(default=False)
    auto_copy = models.BooleanField(default=False)
    repeat = models.BooleanField(default=False)
    random = models.BooleanField(default=False)

    class Meta:
        verbose_name = 'Iterative card(text)'
        verbose_name_plural = 'Iterative cards(text)'

    def json(self):
        return super().json(**{
            'card_type': 'text',
            'last_index': 0,
            'values': self.content.split(self.delimiter),
            'value': self.content.split(self.delimiter)[0],
            'content': self.content,
            'delimiter': self.delimiter,
            'remove_whitespace': self.remove_whitespace,
            'auto_copy': self.auto_copy,
            'repeat': self.repeat,
            'random': self.random,
        })
