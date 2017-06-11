from django.conf.urls import url

from .views import Home, Tracks, Genres, TrackDetail, GenreDetail

urlpatterns = [
    url(r'^$', Home.as_view(), name='home'),
    url(r'^tracks/$', Tracks.as_view(), name='tracks'),
    url(
        r'^tracks/(?P<pk>[0-9]+)/$', TrackDetail.as_view(),
        name='track_detail'),
    url(r'^genres/$', Genres.as_view(), name='genres'),
    url(
        r'^genres/(?P<pk>[0-9]+)/$', GenreDetail.as_view(),
        name='genre_detail'),
]
