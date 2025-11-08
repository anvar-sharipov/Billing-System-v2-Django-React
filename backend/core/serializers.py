# core/serializers.py
from rest_framework import serializers
from .models import Etrap, UserDogowor, UserTable, Service, UserService

class ServiceSerializer(serializers.ModelSerializer):
    class Meta:
        model = Service
        fields = ['id', 'service', 'price', 'is_active']

class UserServiceSerializer(serializers.ModelSerializer):
    service = ServiceSerializer(read_only=True)
    
    class Meta:
        model = UserService
        fields = ['id', 'service', 'date_start', 'date_end', 'is_active', 
                 'actual_price', 'connected_by', 'comment', 'date_connected',
                 'updated_by', 'date_updated']

class EtrapSerializer(serializers.ModelSerializer):
    class Meta:
        model = Etrap
        fields = ['id', 'etrap', 'code', 'is_active']
        
class UserDogoworSerializer(serializers.ModelSerializer):
    class Meta:
        model = UserDogowor
        fields = ['id', 'dogowor', 'balance_type', 'activate_at', 'deactivate_at', 'comment']

class UserTableSerializer(serializers.ModelSerializer):
    dogowors = UserDogoworSerializer(many=True, read_only=True)
    # ⭐⭐⭐ ДОБАВЛЯЕМ НОВЫЕ ПОЛЯ ⭐⭐⭐
    services = ServiceSerializer(many=True, read_only=True)
    abonplata = serializers.DecimalField(max_digits=8, decimal_places=2, default=0.00)

    class Meta:
        model = UserTable
        fields = ['id', 'number', 'etrap', 'name', 'surname', 'patronymic',
                  'address', 'mobile_number', 'is_enterprises', 'account',
                  'hb_type', 'dogowors', 'abonplata', 'services']