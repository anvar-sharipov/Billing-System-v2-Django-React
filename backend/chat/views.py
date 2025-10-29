from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.contrib.auth import get_user_model
from django.db.models import Q
from .models import ChatRoom, Message
from .serializers import ChatRoomSerializer, MessageSerializer, UserSerializer

User = get_user_model()


class ChatRoomViewSet(viewsets.ModelViewSet):
    serializer_class = ChatRoomSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        return ChatRoom.objects.filter(
            participants=self.request.user
        ).prefetch_related('participants', 'messages')
    
    @action(detail=False, methods=['post'])
    def create_private_chat(self, request):
        """Создать приватный чат с пользователем"""
        other_user_id = request.data.get('user_id')
        
        try:
            other_user = User.objects.get(id=other_user_id)
        except User.DoesNotExist:
            return Response(
                {'error': 'User not found'}, 
                status=status.HTTP_404_NOT_FOUND
            )
        
        # Проверить существующий приватный чат
        existing_room = ChatRoom.objects.filter(
            room_type='private',
            participants=request.user
        ).filter(
            participants=other_user
        ).first()
        
        if existing_room:
            serializer = self.get_serializer(existing_room)
            return Response(serializer.data)
        
        # Создать новый приватный чат
        room = ChatRoom.objects.create(room_type='private')
        room.participants.add(request.user, other_user)
        
        serializer = self.get_serializer(room)
        return Response(serializer.data, status=status.HTTP_201_CREATED)
    
    @action(detail=False, methods=['post'])
    def create_group_chat(self, request):
        """Создать групповой чат"""
        name = request.data.get('name')
        participant_ids = request.data.get('participant_ids', [])
        
        if not name:
            return Response(
                {'error': 'Group name is required'}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        room = ChatRoom.objects.create(
            name=name,
            room_type='group'
        )
        
        # Добавить создателя
        room.participants.add(request.user)
        
        # Добавить других участников
        if participant_ids:
            users = User.objects.filter(id__in=participant_ids)
            room.participants.add(*users)
        
        serializer = self.get_serializer(room)
        return Response(serializer.data, status=status.HTTP_201_CREATED)
    
    @action(detail=True, methods=['get'])
    def messages(self, request, pk=None):
        """Получить сообщения комнаты"""
        room = self.get_object()
        messages = room.messages.all()[:100]  # Последние 100 сообщений
        serializer = MessageSerializer(messages, many=True)
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'])
    def search_users(self, request):
        """Поиск пользователей для чата"""
        query = request.query_params.get('q', '')
        
        if len(query) < 2:
            return Response([])
        
        users = User.objects.filter(
            Q(username__icontains=query) |
            Q(first_name__icontains=query) |
            Q(last_name__icontains=query)
        ).exclude(id=request.user.id)[:10]
        
        serializer = UserSerializer(users, many=True)
        return Response(serializer.data)