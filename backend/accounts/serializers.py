from rest_framework import serializers
from .models import User
from django.contrib.auth.models import Group

# class UserSerializer(serializers.ModelSerializer):
#     class Meta:
#         model = User
#         fields = ['id', 'username', 'first_name', 'last_name', 'image']






class UserSerializer(serializers.ModelSerializer):
    groups = serializers.SlugRelatedField(
        many=True,
        read_only=True,
        slug_field='name'  # вернёт названия групп
    )
    
    class Meta:
        model = User
        fields = ['id', 'username', 'first_name', 'last_name', 'groups']




# class UserSerializer(serializers.ModelSerializer):
#     groups = serializers.SlugRelatedField(
#         many=True,
#         read_only=True,
#         slug_field='name'
#     )
#     permissions = serializers.SerializerMethodField()

#     class Meta:
#         model = User
#         fields = ['id', 'username', 'first_name', 'last_name', 'groups', 'permissions']

#     def get_permissions(self, obj):
#         # Возвращает все права пользователя (индивидуальные + от групп)
#         return list(obj.get_all_permissions())
