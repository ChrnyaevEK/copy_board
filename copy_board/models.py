from django.db import models
from django.contrib.auth.models import User
from django.urls import reverse


class Constants:
    color_set = (
        ('blue', 'Blue'),
        ('cyan', 'Cyan'),
        ('teal', 'Teal'),
        ('green', 'Green'),
        ('lime', 'Lime'),
        ('orange', 'Orange'),
        ('red', 'Red'),
        ('pink', 'Pink'),
        ('purple', 'Purple'),
        ('indigo', 'Indigo'),
    )
    access_type_set = (
        ('public', 'public'),
        ('private', 'private'),
        ('protected', 'protected'),
    )

    default_api_response = {
        'error': None,
        'data': None,
    }

    default_color = 'blue'
    default_access_type = 'public'
    default_Collection_id = 1
    activated = 'on'
    undefined = 'undefined'
    default_title = 'Main'

    @staticmethod
    def api(error='', data={}):
        return {
            'error': error,
            'data': data,
        }

    bad_request = 'Not enough data'


class Collection(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, null=True)
    title = models.CharField(max_length=200)
    creation_date = models.DateTimeField(auto_now_add=True)
    access_type = models.CharField(max_length=10, choices=Constants.access_type_set,
                                   default=Constants.default_access_type)
    color = models.CharField(max_length=10, choices=Constants.color_set, default=Constants.color_set[0])

    def __str__(self):
        return self.title

    class Meta:
        verbose_name = 'Collection'
        verbose_name_plural = 'Collections'
        ordering = ['-creation_date']

    def json(self):
        return {
            'id': self.id if self.id is not None else Constants.undefined,
            'title': self.title,
            'creation_date': self.creation_date.isoformat() if self.creation_date is not None else Constants.undefined,
            'access_type': self.access_type,
            'color': self.color,
        }


class Card(models.Model):
    collection = models.ForeignKey(Collection, on_delete=models.CASCADE, null=True)
    title = models.CharField(max_length=200)
    creation_date = models.DateTimeField(auto_created=True)
    color = models.CharField(max_length=10, choices=Constants.color_set, default=Constants.color_set[0])
    index = models.IntegerField()

    def __str__(self):
        return self.title

    class Meta:
        abstract = True

    def json(self, **kwargs):
        return {
            'title': self.title,
            'creation_date': self.creation_date.isoformat() if self.creation_date is not None else Constants.undefined,
            'index': self.index,
            'color': self.color,
            **kwargs
        }


class RegularCard(Card):
    card_type = 'regular'
    copy_content = models.TextField(verbose_name='Content to be copied', max_length=2000)

    class Meta:
        verbose_name = 'Regular card'
        verbose_name_plural = 'Regular cards'

    def json(self):
        return super().json(**{
            'copy_content': self.copy_content,
        })


class NumberCard(Card):
    card_type = 'number'
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
            'from_val': self.from_val,
            'to_val': self.to_val if self.to_val is not None else Constants.undefined,
            'step_val': self.step_val,
            'auto_copy': self.auto_copy,
            'endless': self.endless,
            'repeat': self.repeat,
            'random': self.random,
        })


class TextCard(Card):
    card_type = 'text'
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
            'content': self.content,
            'delimiter': self.delimiter,
            'remove_whitespace': self.remove_whitespace,
            'auto_copy': self.auto_copy,
            'repeat': self.repeat,
            'random': self.random,
        })
