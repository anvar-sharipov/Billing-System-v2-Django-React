import { useState, useEffect } from 'react';
import chatService from '../../services/chatService';

export default function ChatList({ onSelectRoom, selectedRoomId }) {
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadRooms();
  }, []);

  const loadRooms = async () => {
    try {
      const data = await chatService.getChatRooms();
      setRooms(data);
    } catch (error) {
      console.error('Error loading rooms:', error);
    } finally {
      setLoading(false);
    }
  };

  const getRoomName = (room) => {
    if (room.room_type === 'group') {
      return room.name;
    }
    // Для приватного чата показываем имя другого пользователя
    const otherUser = room.participants.find(
      p => p.username !== localStorage.getItem('username')
    );
    return otherUser ? `${otherUser.first_name} ${otherUser.last_name}` : 'Unknown';
  };

  if (loading) {
    return <div className="p-4">Загрузка чатов...</div>;
  }

  return (
    <div className="w-80 bg-white border-r border-gray-200 flex flex-col">
      <div className="p-4 border-b border-gray-200">
        <h2 className="text-xl font-semibold">Чаты</h2>
      </div>

      <div className="flex-1 overflow-y-auto">
        {rooms.length === 0 ? (
          <div className="p-4 text-gray-500 text-center">
            Нет активных чатов
          </div>
        ) : (
          rooms.map((room) => (
            <div
              key={room.id}
              onClick={() => onSelectRoom(room)}
              className={`p-4 border-b border-gray-100 cursor-pointer hover:bg-gray-50 transition ${
                selectedRoomId === room.id ? 'bg-blue-50' : ''
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className="font-medium text-gray-900 truncate">
                      {getRoomName(room)}
                    </h3>
                    {room.unread_count > 0 && (
                      <span className="px-2 py-1 text-xs font-medium text-white bg-blue-500 rounded-full">
                        {room.unread_count}
                      </span>
                    )}
                  </div>
                  {room.last_message && (
                    <p className="text-sm text-gray-500 truncate">
                      {room.last_message.content}
                    </p>
                  )}
                </div>
                {room.last_message && (
                  <span className="text-xs text-gray-400 ml-2">
                    {new Date(room.last_message.created_at).toLocaleTimeString('ru-RU', {
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </span>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}