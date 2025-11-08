from rest_framework import generics, permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView
from .models import User
from .serializers import UserSerializer
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from django.contrib.auth.models import Group
from rest_framework.parsers import MultiPartParser, FormParser
from django.db import IntegrityError


from django.core.files.storage import default_storage

class RegisterView(generics.CreateAPIView):
    queryset = User.objects.all()
    serializer_class = UserSerializer
    parser_classes = (MultiPartParser, FormParser)  # для обработки файлов

    def create(self, request, *args, **kwargs):
        password = request.data.get("password")
        username = request.data.get("username")
        first_name = request.data.get("first_name", "")
        last_name = request.data.get("last_name", "")
        image = request.data.get("image")
        groups_ids = request.data.getlist("groups")  # получаем список групп

        # создаем пользователя
        try:
            user = User.objects.create_user(
                username=username,
                password=password,
                first_name=first_name,
                last_name=last_name,
                image=image
            )
        except IntegrityError:
            return Response(
                {"message": "Пользователь с таким именем уже существует"},
                status=status.HTTP_400_BAD_REQUEST
            )

        # добавляем пользователя в группы
        if groups_ids:
            groups = Group.objects.filter(id__in=groups_ids)
            user.groups.set(groups)

        serializer = self.get_serializer(user)
        return Response(serializer.data)


# Получение данных профиля текущего пользователя
class ProfileView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        serializer = UserSerializer(request.user)
        return Response(serializer.data)




@api_view(['GET'])
@permission_classes([IsAuthenticated])
def current_user(request):
    user = request.user
    return Response({
        "id": user.id,
        "username": user.username,
        "first_name": user.first_name,
        "last_name": user.last_name,
        "image": user.image.url if user.image else None
    })
    
    
    
@api_view(['GET'])
def list_groups(request):
    groups = Group.objects.all()
    data = [{"id": g.id, "name": g.name} for g in groups]
    return Response(data)



@api_view(['GET'])
# @permission_classes([IsAuthenticated])
def get_users(request):
    """
    Возвращает список всех пользователей.
    Только для авторизованных пользователей.
    """
    users = User.objects.all()
    serializer = UserSerializer(users, many=True)
    return Response(serializer.data)


class MeView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        serializer = UserSerializer(request.user)
        return Response(serializer.data)
    
    




@api_view(['PATCH'])
@permission_classes([IsAuthenticated])
def update_user_profile(request):
    user = request.user
    
    # Проверяем, является ли пользователь админом для изменения имени/фамилии
    is_admin = user.groups.filter(name='admin').exists()
    
    updated = False
    
    # Обновляем изображение (доступно всем аутентифицированным пользователям)
    if 'image' in request.FILES:
        # Удаляем старое изображение если оно существует
        if user.image:
            try:
                default_storage.delete(user.image.path)
            except Exception as e:
                print(f"Error deleting old image: {e}")
        user.image = request.FILES['image']
        updated = True
    
    # Обновляем имя и фамилию только если пользователь админ
    if is_admin:
        if 'first_name' in request.data:
            user.first_name = request.data['first_name']
            updated = True
        if 'last_name' in request.data:
            user.last_name = request.data['last_name']
            updated = True
    
    if updated:
        user.save()
    
    return Response({
        'id': user.id,
        'username': user.username,
        'first_name': user.first_name,
        'last_name': user.last_name,
        'image': user.image.url if user.image else None,
        'groups': list(user.groups.values_list('name', flat=True))
    })