from django.db import models

# Create your models here.

class Track(models.Model):

    name = models.CharField(max_length=150)
    genre = models.ManyToManyField('Genre', blank=True)
    rating = models.IntegerField(default=0)

    def __unicode__(self):
        return self.name


class Genre(models.Model):

    name = models.CharField(max_length=50)

    def __unicode__(self):
        return self.name
