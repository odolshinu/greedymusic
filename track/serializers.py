from rest_framework import serializers

from .models import Track, Genre


class TrackSerializer(serializers.ModelSerializer):

    genre = serializers.PrimaryKeyRelatedField(
        many=True, queryset=Genre.objects.all(), allow_null=True)

    class Meta:
        model = Track
        fields = '__all__'


class GenreSerializer(serializers.ModelSerializer):

    class Meta:
        model = Genre
        fields = '__all__'


class TrackDetailSerializer(serializers.ModelSerializer):

    genre_label = serializers.SerializerMethodField()

    class Meta:
        model = Track
        fields = ('id', 'name', 'genre', 'genre_label', 'rating')

    def get_genre_label(self, obj):
        return ' | '.join(obj.genre.values_list('name', flat=True))
