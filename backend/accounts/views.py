from rest_framework import generics, permissions
from rest_framework.response import Response
from rest_framework.views import APIView
from .models import User
from .serializers import UserSerializer
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from django.contrib.auth.models import Group
from rest_framework.parsers import MultiPartParser, FormParser

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
        user = User.objects.create_user(
            username=username,
            password=password,
            first_name=first_name,
            last_name=last_name,
            image=image
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