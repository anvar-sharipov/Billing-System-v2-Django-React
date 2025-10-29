import { useEffect, useRef } from 'react';
import { useWebSocket } from '../../hooks/useWebSocket';
import MessageInput from './MessageInput';

export default function ChatWindow({ room }) {
  const { messages, isConnected, typingUsers, sendMessage, sendTyping } = useWebSocket(room?.id);
  const messagesEndRef = useRef(null);
  const currentUser = localStorage.getItem('username');

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  if (!room) {
    return (
      <div className="flex-1 flex items-center justify-center bg-gray-50">
        <div className="text-center text-gray-500">
          <h3 className="text-xl font-medium mb-2">Выберите чат</h3>
          <p>Выберите существующий чат или создайте новый</p>
        </div>
      </div>
    );
  }

  const getRoomName = () => {
    if (room.room_type === 'group') {
      return room.name;
    }
    const otherUser = room.participants.find(p => p.username !== currentUser);
    return otherUser ? `${otherUser.first_name} ${otherUser.last_name}` : 'Unknown';
  };

  return (
    <div className="flex-1 flex flex-col bg-white">
      {/* Шапка чата */}
      <div className="p-4 border-b border-gray-200 bg-white">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold">{getRoomName()}</h2>
            <div className="flex items-center gap-2 text-sm">
              <span className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-gray-400'}`} />
              <span className="text-gray-500">
                {isConnected ? 'Онлайн' : 'Офлайн'}
              </span>
            </div>
          </div>
          {room.room_type === 'group' && (
            <span className="text-sm text-gray-500">
              {room.participants.length} участников
            </span>
          )}
        </div>
      </div>

      {/* Сообщения */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((msg, index) => {
          const isOwn = msg.sender.username === currentUser;
          const showAvatar = index === 0 || messages[index - 1].sender.id !== msg.sender.id;

          return (
            <div
              key={msg.id}
              className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}
            >
              <div className={`flex gap-2 max-w-[70%] ${isOwn ? 'flex-row-reverse' : 'flex-row'}`}>
                {/* Аватар */}
                {showAvatar && (
                  <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-white text-sm font-medium flex-shrink-0">
                    {msg.sender.first_name?.[0] || msg.sender.username[0].toUpperCase()}
                  </div>
                )}
                {!showAvatar && <div className="w-8" />}

                {/* Сообщение */}
                <div>
                  {showAvatar && !isOwn && (
                    <div className="text-xs text-gray-500 mb-1">
                      {msg.sender.first_name} {msg.sender.last_name}
                    </div>
                  )}
                  <div
                    className={`px-4 py-2 rounded-lg ${
                      isOwn
                        ? 'bg-blue-500 text-white'
                        : 'bg-gray-100 text-gray-900'
                    }`}
                  >
                    <p className="break-words">{msg.content}</p>
                  </div>
                  <div className={`text-xs text-gray-400 mt-1 ${isOwn ? 'text-right' : 'text-left'}`}>
                    {new Date(msg.created_at).toLocaleTimeString('ru-RU', {
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </div>
                </div>
              </div>
            </div>
          );
        })}

        {/* Индикатор печати */}
        {typingUsers.length > 0 && (
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <div className="flex gap-1">
              <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
              <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
              <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
            </div>
            <span>{typingUsers.join(', ')} печатает...</span>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Поле ввода */}
      <MessageInput onSendMessage={sendMessage} onTyping={sendTyping} />
    </div>
  );
}