// import axios from 'axios';
import myAxios from './myAxios';

const chatService = {
  // Получить список чатов
  getChatRooms: async () => {
    const response = await myAxios.get('chat/rooms/');
    return response.data;
  },

  // Создать приватный чат
  createPrivateChat: async (userId) => {
    const response = await myAxios.post('chat/rooms/create_private_chat/', {
      user_id: userId
    });
    return response.data;
  },

  // Создать групповой чат
  createGroupChat: async (name, participantIds) => {
    const response = await myAxios.post('chat/rooms/create_group_chat/', {
      name,
      participant_ids: participantIds
    });
    return response.data;
  },

  // Получить сообщения комнаты
  getRoomMessages: async (roomId) => {
    const response = await myAxios.get(`chat/rooms/${roomId}/messages/`);
    return response.data;
  },

  // Поиск пользователей
  searchUsers: async (query) => {
    const response = await myAxios.get('chat/rooms/search_users/', {
      params: { q: query }
    });
    return response.data;
  }
};

export default chatService;