import { useState, useEffect } from 'react';
import { MessageSquarePlus } from 'lucide-react';
import ChatList from '../../components/Chat/ChatList';
import ChatWindow from '../../components/Chat/ChatWindow';
import UserSearch from '../../components/Chat/UserSearch';
import ChatNotification from '../../components/Chat/ChatNotification';
import chatService from '../../services/chatService';

export default function ChatPage() {
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [showUserSearch, setShowUserSearch] = useState(false);
  const [rooms, setRooms] = useState([]);
  const [notification, setNotification] = useState(null);

  useEffect(() => {
    loadRooms();
  }, []);

  const loadRooms = async () => {
    try {
      const data = await chatService.getChatRooms();
      setRooms(data);
    } catch (error) {
      console.error('Error loading rooms:', error);
    }
  };

  const handleSelectRoom = (room) => {
    setSelectedRoom(room);
  };

  const handleChatCreated = (room) => {
    setRooms(prev => [room, ...prev]);
    setSelectedRoom(room);
  };

  const handleNewMessage = (message) => {
    // Показать уведомление, если сообщение не от текущего пользователя
    // и не в текущем открытом чате
    const currentUser = localStorage.getItem('username');
    
    if (
      message.sender.username !== currentUser &&
      (!selectedRoom || selectedRoom.id !== message.room_id)
    ) {
      setNotification(message);
    }
  };

  const handleNotificationClick = async () => {
    if (notification) {
      // Найти комнату и открыть её
      const room = rooms.find(r => r.id === notification.room_id);
      if (room) {
        setSelectedRoom(room);
      }
      setNotification(null);
    }
  };

  return (
    <div className="h-screen flex bg-gray-100">
      {/* Боковая панель с чатами */}
      <div className="flex flex-col bg-white border-r border-gray-200">
        {/* Кнопка создания нового чата */}
        <div className="p-4 border-b border-gray-200">
          <button
            onClick={() => setShowUserSearch(true)}
            className="w-full py-2 px-4 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition flex items-center justify-center gap-2"
          >
            <MessageSquarePlus size={20} />
            <span>Новый чат</span>
          </button>
        </div>

        {/* Список чатов */}
        <ChatList
          onSelectRoom={handleSelectRoom}
          selectedRoomId={selectedRoom?.id}
        />
      </div>

      {/* Окно чата */}
      <ChatWindow room={selectedRoom} />

      {/* Модальное окно поиска пользователей */}
      {showUserSearch && (
        <UserSearch
          onClose={() => setShowUserSearch(false)}
          onChatCreated={handleChatCreated}
        />
      )}

      {/* Уведомление о новом сообщении */}
      {notification && (
        <ChatNotification
          message={notification}
          onClose={() => setNotification(null)}
          onClick={handleNotificationClick}
        />
      )}
    </div>
  );
}