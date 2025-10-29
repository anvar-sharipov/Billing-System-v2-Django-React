import json
from channels.generic.websocket import AsyncWebsocketConsumer
from channels.db import database_sync_to_async
from django.contrib.auth import get_user_model
from .models import ChatRoom, Message, MessageReadStatus

User = get_user_model()


class ChatConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        self.user = self.scope['user']
        
        if not self.user.is_authenticated:
            await self.close()
            return
        
        self.room_id = self.scope['url_route']['kwargs'].get('room_id')
        
        if self.room_id:
            # Приватный/групповой чат
            self.room_group_name = f'chat_{self.room_id}'
            
            # Проверка доступа к комнате
            has_access = await self.check_room_access(self.room_id, self.user)
            if not has_access:
                await self.close()
                return
        else:
            # Глобальный чат для всех
            self.room_group_name = 'global_chat'
        
        # Подключение к группе
        await self.channel_layer.group_add(
            self.room_group_name,
            self.channel_name
        )
        
        await self.accept()
        
        # Отправить историю сообщений при подключении
        if self.room_id:
            await self.send_message_history()

    async def disconnect(self, close_code):
        if hasattr(self, 'room_group_name'):
            await self.channel_layer.group_discard(
                self.room_group_name,
                self.channel_name
            )

    async def receive(self, text_data):
        try:
            data = json.loads(text_data)
            message_type = data.get('type', 'message')
            
            if message_type == 'message':
                await self.handle_message(data)
            elif message_type == 'typing':
                await self.handle_typing(data)
            elif message_type == 'read':
                await self.handle_read_status(data)
                
        except json.JSONDecodeError:
            await self.send(text_data=json.dumps({
                'error': 'Invalid JSON'
            }))

    async def handle_message(self, data):
        content = data.get('message', '').strip()
        
        if not content:
            return
        
        # Сохранить сообщение в БД
        message = await self.save_message(content)
        
        # Отправить всем в группе
        await self.channel_layer.group_send(
            self.room_group_name,
            {
                'type': 'chat_message',
                'message': {
                    'id': message['id'],
                    'content': message['content'],
                    'sender': message['sender'],
                    'created_at': message['created_at'],
                    'is_read': False
                }
            }
        )

    async def handle_typing(self, data):
        is_typing = data.get('is_typing', False)
        
        await self.channel_layer.group_send(
            self.room_group_name,
            {
                'type': 'user_typing',
                'username': self.user.username,
                'is_typing': is_typing
            }
        )

    async def handle_read_status(self, data):
        message_id = data.get('message_id')
        if message_id:
            await self.mark_message_as_read(message_id)

    async def chat_message(self, event):
        await self.send(text_data=json.dumps({
            'type': 'message',
            'message': event['message']
        }))

    async def user_typing(self, event):
        # Не отправлять самому себе
        if event['username'] != self.user.username:
            await self.send(text_data=json.dumps({
                'type': 'typing',
                'username': event['username'],
                'is_typing': event['is_typing']
            }))

    async def send_message_history(self):
        messages = await self.get_room_messages(self.room_id)
        await self.send(text_data=json.dumps({
            'type': 'history',
            'messages': messages
        }))

    @database_sync_to_async
    def check_room_access(self, room_id, user):
        try:
            room = ChatRoom.objects.get(id=room_id)
            return room.participants.filter(id=user.id).exists()
        except ChatRoom.DoesNotExist:
            return False

    @database_sync_to_async
    def save_message(self, content):
        if self.room_id:
            room = ChatRoom.objects.get(id=self.room_id)
        else:
            # Создать или получить глобальную комнату
            room, _ = ChatRoom.objects.get_or_create(
                name='Global Chat',
                room_type='group'
            )
        
        message = Message.objects.create(
            room=room,
            sender=self.user,
            content=content
        )
        
        return {
            'id': message.id,
            'content': message.content,
            'sender': {
                'id': self.user.id,
                'username': self.user.username,
                'first_name': self.user.first_name,
                'last_name': self.user.last_name,
            },
            'created_at': message.created_at.isoformat(),
        }

    @database_sync_to_async
    def get_room_messages(self, room_id):
        messages = Message.objects.filter(room_id=room_id).select_related('sender')[:50]
        return [
            {
                'id': msg.id,
                'content': msg.content,
                'sender': {
                    'id': msg.sender.id,
                    'username': msg.sender.username,
                    'first_name': msg.sender.first_name,
                    'last_name': msg.sender.last_name,
                },
                'created_at': msg.created_at.isoformat(),
                'is_read': msg.is_read,
            }
            for msg in messages
        ]

    @database_sync_to_async
    def mark_message_as_read(self, message_id):
        try:
            message = Message.objects.get(id=message_id)
            MessageReadStatus.objects.get_or_create(
                message=message,
                user=self.user
            )
            message.is_read = True
            message.save()
        except Message.DoesNotExist:
            pass