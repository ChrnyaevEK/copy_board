from django.db import models


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
    default_access = 'public'


class CCollection(models.Model):
    title = models.CharField(max_length=200)
    creation_date = models.DateTimeField(auto_now_add=True)
    access_type = models.CharField(max_length=10, choices=Constants.access_type_set, default=Constants.default_access)
    color = models.CharField(max_length=10, choices=Constants.color_set, default=Constants.color_set[0])

    def __str__(self):
        return self.title

    class Meta:
        verbose_name = 'CCollection'
        verbose_name_plural = 'CCollections'


class CCard(models.Model):
    ccollection = models.ForeignKey(CCollection, on_delete=models.CASCADE)
    title = models.CharField(max_length=200)
    creation_date = models.DateTimeField(auto_now_add=True)
    color = models.CharField(max_length=10, choices=Constants.color_set, default=Constants.color_set[0])

    def __str__(self):
        return self.title

    class Meta:
        abstract = True


class RegularCCard(CCard):
    copy_content = models.TextField(verbose_name='Content to be copied')

    class Meta:
        verbose_name = 'Regular ccard'
        verbose_name_plural = 'Regular ccards'


class IterativeCCardNumber(CCard):
    from_val = models.IntegerField()
    to_val = models.IntegerField()
    step_val = models.IntegerField()
    autoCopy = models.BooleanField(default=False)
    random = models.BooleanField(default=False)

    class Meta:
        verbose_name = 'Iterative ccard(number)'
        verbose_name_plural = 'Iterative ccards(number)'
