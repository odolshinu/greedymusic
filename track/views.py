from django.shortcuts import render
from django.views.generic import TemplateView
from django.db.models import Q

from rest_framework import generics, pagination
from rest_framework.response import Response

from .models import Track, Genre
from .serializers import TrackSerializer, GenreSerializer, \
    TrackDetailSerializer

# Create your views here.

class Home(TemplateView):

    template_name = 'home.html'


class Tracks(generics.GenericAPIView):

    serializer_class = TrackDetailSerializer
    queryset = Track.objects.all().order_by('-id')
    pagination_class = pagination.PageNumberPagination

    def get(self, request, *args, **kwargs):
        queryset = self.get_queryset()
        if request.query_params.get('keyword'):
            queryset = queryset.filter(
                Q(name__icontains=request.query_params['keyword'])|Q(
                    genre__name__icontains=request.query_params['keyword']))
        paginate_queryset = self.paginate_queryset(queryset)
        serializer = self.get_serializer(paginate_queryset, many=True)
        return Response({
            "success": 1, "tracks": serializer.data,
            "count": queryset.count()})

    def post(self, request, *args, **kwargs):
        serializer = TrackSerializer(data=request.data)
        if serializer.is_valid():
            instance = serializer.save()
            serializer = self.get_serializer(instance)
            return Response({"success": 1, "track": serializer.data})
        return Response({"success": -1, "errors": serializer.errors})


class Genres(generics.GenericAPIView):

    serializer_class = GenreSerializer
    queryset = Genre.objects.all().order_by('-id')

    def get(self, request, *args, **kwargs):
        queryset = self.get_queryset()
        serializer = self.get_serializer(queryset, many=True)
        return Response({"success": 1, "genres": serializer.data})

    def post(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response({"success": 1, "genre": serializer.data})
        return Response({"success": -1, "errors": serializer.errors})


class TrackDetail(generics.GenericAPIView):

    serializer_class = TrackDetailSerializer
    queryset = Track.objects.all()

    def get(self, request, *args, **kwargs):
        instance = self.get_object()
        serializer = self.get_serializer(instance)
        return Response({"success": 1, "track": serializer.data})

    def put(self, request, *args, **kwargs):
        instance = self.get_object()
        serializer = TrackSerializer(instance, data=request.data)
        if serializer.is_valid():
            serializer.save()
            serializer = self.get_serializer(instance)
            return Response({"success": 1, "track": serializer.data})
        return Response({"success": -1, "errors": serializer.errors})

    def delete(self, request, *args, **kwargs):
        instance = self.get_object()
        instance.delete()
        return Response({"success": 1})


class GenreDetail(generics.GenericAPIView):

    serializer_class = GenreSerializer
    queryset = Genre.objects.all()

    def get(self, request, *args, **kwargs):
        instance = self.get_object()
        serializer = self.get_serializer(instance)
        return Response({"success": 1, "genre": serializer.data})

    def put(self, request, *args, **kwargs):
        instance = self.get_object()
        serializer = self.get_serializer(instance, data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response({"success": 1, "genre": serializer.data})
        return Response({"success": -1, "errors": serializer.errors})

    def delete(self, request, *args, **kwargs):
        instance = self.get_object()
        instance.delete()
        return Response({"success": 1})
