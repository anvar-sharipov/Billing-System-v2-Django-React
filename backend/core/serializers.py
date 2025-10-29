# core/serializers.py
from rest_framework import serializers
from .models import Etrap


class EtrapSerializer(serializers.ModelSerializer):
    class Meta:
        model = Etrap
        fields = ['id', 'etrap', 'code', 'is_active']