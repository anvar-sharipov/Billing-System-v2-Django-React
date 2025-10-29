import { useState, useEffect } from 'react';
import { Search, X, Users, MessageSquare } from 'lucide-react';
import chatService from '../../services/chatService';

export default function UserSearch({ onClose, onChatCreated }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [isGroupMode, setIsGroupMode] = useState(false);
  const [groupName, setGroupName] = useState('');

  useEffect(() => {
    if (searchQuery.length >= 2) {
      searchUsers();
    } else {
      setUsers([]);
    }
  }, [searchQuery]);

  const searchUsers = async () => {
    setLoading(true);
    try {
      const data = await chatService.searchUsers(searchQuery);
      setUsers(data);
    } catch (error) {
      console.error('Error searching users:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreatePrivateChat = async (userId) => {
    try {
      const room = await chatService.createPrivateChat(userId);
      onChatCreated(room);
      onClose();
    } catch (error) {
      console.error('Error creating private chat:', error);
      alert('Ошибка создания чата');
    }
  };

  const toggleUserSelection = (user) => {
    setSelectedUsers(prev => {
      const exists = prev.find(u => u.id === user.id);
      if (exists) {
        return prev.filter(u => u.id !== user.id);
      } else {
        return [...prev, user];
      }
    });
  };

  const handleCreateGroupChat = async () => {
    if (!groupName.trim()) {
      alert('Введите название группы');
      return;
    }

    if (selectedUsers.length === 0) {
      alert('Выберите хотя бы одного участника');
      return;
    }

    try {
      const participantIds = selectedUsers.map(u => u.id);
      const room = await chatService.createGroupChat(groupName, participantIds);
      onChatCreated(room);
      onClose();
    } catch (error) {
      console.error('Error creating group chat:', error);
      alert('Ошибка создания группового чата');
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[80vh] flex flex-col">
        {/* Заголовок */}
        <div className="p-4 border-b border-gray-200 flex items-center justify-between">
          <h2 className="text-xl font-semibold">
            {isGroupMode ? 'Создать группу' : 'Новый чат'}
          </h2>
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-100 rounded-full transition"
          >
            <X size={20} />
          </button>
        </div>

        {/* Переключатель режима */}
        <div className="p-4 border-b border-gray-200 flex gap-2">
          <button
            onClick={() => setIsGroupMode(false)}
            className={`flex-1 py-2 px-4 rounded-lg flex items-center justify-center gap-2 transition ${
              !isGroupMode
                ? 'bg-blue-500 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            <MessageSquare size={18} />
            <span>Личный чат</span>
          </button>
          <button
            onClick={() => setIsGroupMode(true)}
            className={`flex-1 py-2 px-4 rounded-lg flex items-center justify-center gap-2 transition ${
              isGroupMode
                ? 'bg-blue-500 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            <Users size={18} />
            <span>Группа</span>
          </button>
        </div>

        {/* Название группы (только для группового чата) */}
        {isGroupMode && (
          <div className="p-4 border-b border-gray-200">
            <input
              type="text"
              value={groupName}
              onChange={(e) => setGroupName(e.target.value)}
              placeholder="Название группы"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        )}

        {/* Поиск */}
        <div className="p-4 border-b border-gray-200">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Поиск пользователей..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              autoFocus
            />
          </div>
        </div>

        {/* Выбранные пользователи (только для группового чата) */}
        {isGroupMode && selectedUsers.length > 0 && (
          <div className="p-4 border-b border-gray-200">
            <div className="flex flex-wrap gap-2">
              {selectedUsers.map(user => (
                <div
                  key={user.id}
                  className="flex items-center gap-2 px-3 py-1 bg-blue-100 text-blue-700 rounded-full"
                >
                  <span className="text-sm">
                    {user.first_name} {user.last_name}
                  </span>
                  <button
                    onClick={() => toggleUserSelection(user)}
                    className="hover:bg-blue-200 rounded-full p-0.5"
                  >
                    <X size={14} />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Список пользователей */}
        <div className="flex-1 overflow-y-auto">
          {loading ? (
            <div className="p-8 text-center text-gray-500">
              Поиск...
            </div>
          ) : users.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              {searchQuery.length >= 2
                ? 'Пользователи не найдены'
                : 'Введите минимум 2 символа для поиска'}
            </div>
          ) : (
            <div>
              {users.map(user => {
                const isSelected = selectedUsers.find(u => u.id === user.id);
                
                return (
                  <div
                    key={user.id}
                    onClick={() => {
                      if (isGroupMode) {
                        toggleUserSelection(user);
                      } else {
                        handleCreatePrivateChat(user.id);
                      }
                    }}
                    className={`p-4 border-b border-gray-100 hover:bg-gray-50 cursor-pointer transition ${
                      isSelected ? 'bg-blue-50' : ''
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center text-white font-medium">
                        {user.first_name?.[0] || user.username[0].toUpperCase()}
                      </div>
                      <div className="flex-1">
                        <h3 className="font-medium text-gray-900">
                          {user.first_name} {user.last_name}
                        </h3>
                        <p className="text-sm text-gray-500">@{user.username}</p>
                      </div>
                      {isGroupMode && isSelected && (
                        <div className="w-6 h-6 rounded-full bg-blue-500 flex items-center justify-center">
                          <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Кнопка создания группы */}
        {isGroupMode && (
          <div className="p-4 border-t border-gray-200">
            <button
              onClick={handleCreateGroupChat}
              disabled={!groupName.trim() || selectedUsers.length === 0}
              className="w-full py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition"
            >
              Создать группу ({selectedUsers.length})
            </button>
          </div>
        )}
      </div>
    </div>
  );
}