import React, { createContext, useContext, useState, useCallback, useRef } from 'react';
import { X, CheckCircle, AlertCircle, Info, AlertTriangle } from 'lucide-react';

const NotificationContext = createContext(null);

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications must be used within NotificationProvider');
  }
  return context;
};

// Звуковые файлы (можно заменить на свои)
const soundUrls = {
  success: '/sounds/success.mp3',
  error: '/sounds/error.mp3', 
  warning: '/sounds/warning.mp3',
  info: '/sounds/info.mp3'
};

const notificationStyles = {
  success: {
    bg: 'bg-emerald-500/90 dark:bg-emerald-600/90',
    border: 'border-emerald-600 dark:border-emerald-500',
    icon: CheckCircle,
    iconColor: 'text-white',
    sound: 'success'
  },
  error: {
    bg: 'bg-red-500/90 dark:bg-red-600/90',
    border: 'border-red-600 dark:border-red-500',
    icon: AlertCircle,
    iconColor: 'text-white',
    sound: 'error'
  },
  warning: {
    bg: 'bg-amber-500/90 dark:bg-amber-600/90',
    border: 'border-amber-600 dark:border-amber-500',
    icon: AlertTriangle,
    iconColor: 'text-white',
    sound: 'warning'
  },
  info: {
    bg: 'bg-blue-500/90 dark:bg-blue-600/90',
    border: 'border-blue-600 dark:border-blue-500',
    icon: Info,
    iconColor: 'text-white',
    sound: 'info'
  }
};

const Notification = ({ notification, onClose }) => {
  const [isExiting, setIsExiting] = useState(false);
  const style = notificationStyles[notification.type] || notificationStyles.info;
  const Icon = style.icon;

  const handleClose = () => {
    setIsExiting(true);
    setTimeout(() => onClose(notification.id), 300);
  };

  return (
    <div
      className={`
        flex items-start gap-3 p-4 rounded-lg border-l-4 shadow-lg backdrop-blur-sm
        ${style.bg} ${style.border}
        transform transition-all duration-300 ease-out
        ${isExiting ? 'translate-x-full opacity-0' : 'translate-x-0 opacity-100'}
        animate-slideIn
      `}
      style={{
        animation: isExiting ? 'none' : 'slideIn 0.3s ease-out'
      }}
    >
      <Icon className={`w-6 h-6 flex-shrink-0 ${style.iconColor}`} />
      
      <div className="flex-1 min-w-0">
        {notification.title && (
          <h4 className="font-semibold text-white mb-1">
            {notification.title}
          </h4>
        )}
        <p className="text-sm text-white/95">
          {notification.message}
        </p>
      </div>

      <button
        onClick={handleClose}
        className="flex-shrink-0 text-white/80 hover:text-white transition-colors"
        aria-label="Close notification"
      >
        <X className="w-5 h-5" />
      </button>
    </div>
  );
};

export const NotificationProvider = ({ children }) => {
  const [notifications, setNotifications] = useState([]);
  const audioRefs = useRef({});

  // Предзагрузка аудио
  const preloadSounds = useCallback(() => {
    Object.entries(soundUrls).forEach(([type, url]) => {
      if (!audioRefs.current[type]) {
        audioRefs.current[type] = new Audio(url);
        audioRefs.current[type].load();
      }
    });
  }, []);

  // Воспроизведение звука
  const playSound = useCallback((type) => {
    // Проверяем настройки пользователя (можно добавить в localStorage)
    const soundEnabled = localStorage.getItem('notificationSound') !== 'false';
    
    if (soundEnabled && audioRefs.current[type]) {
      try {
        audioRefs.current[type].currentTime = 0; // Перемотать в начало
        audioRefs.current[type].play().catch(e => {
          console.log('Audio play failed:', e);
        });
      } catch (error) {
        console.log('Sound error:', error);
      }
    }
  }, []);

  const removeNotification = useCallback((id) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  }, []);

  const addNotification = useCallback((type, message, title = '', duration = 5000, playSoundFlag = true) => {
    const id = Date.now() + Math.random();
    const notification = { id, type, message, title };
    
    setNotifications(prev => [...prev, notification]);

    // Воспроизводим звук
    if (playSoundFlag) {
      playSound(type);
    }

    if (duration > 0) {
      setTimeout(() => {
        removeNotification(id);
      }, duration);
    }

    return id;
  }, [playSound, removeNotification]);

  // Версии с префиксом notification
  const notificationSuccess = useCallback((message, title = '', duration = 5000, playSound = true) => {
    return addNotification('success', message, title, duration, playSound);
  }, [addNotification]);

  const notificationError = useCallback((message, title = '', duration = 5000, playSound = true) => {
    return addNotification('error', message, title, duration, playSound);
  }, [addNotification]);

  const notificationWarning = useCallback((message, title = '', duration = 5000, playSound = true) => {
    return addNotification('warning', message, title, duration, playSound);
  }, [addNotification]);

  const notificationInfo = useCallback((message, title = '', duration = 5000, playSound = true) => {
    return addNotification('info', message, title, duration, playSound);
  }, [addNotification]);

  // Короткие версии
  const success = notificationSuccess;
  const error = notificationError;
  const warning = notificationWarning;
  const info = notificationInfo;

  const clear = useCallback(() => {
    setNotifications([]);
  }, []);

  // Предзагружаем звуки при монтировании
  React.useEffect(() => {
    preloadSounds();
  }, [preloadSounds]);

  return (
    <NotificationContext.Provider 
      value={{ 
        notificationSuccess, 
        notificationError, 
        notificationWarning, 
        notificationInfo,
        success,
        error,
        warning,
        info,
        clear,
        playSound, // Экспортируем функцию воспроизведения звука
        toggleSound: () => {
          const current = localStorage.getItem('notificationSound') !== 'false';
          localStorage.setItem('notificationSound', !current);
          return !current;
        }
      }}
    >
      {children}
      
      <div className="fixed top-4 right-4 z-50 flex flex-col gap-3 max-w-sm w-full pointer-events-none sm:max-w-md">
        <style>{`
          @keyframes slideIn {
            from {
              transform: translateX(100%);
              opacity: 0;
            }
            to {
              transform: translateX(0);
              opacity: 1;
            }
          }
          .animate-slideIn {
            animation: slideIn 0.3s ease-out;
          }
        `}</style>
        {notifications.map(notification => (
          <div key={notification.id} className="pointer-events-auto">
            <Notification
              notification={notification}
              onClose={removeNotification}
            />
          </div>
        ))}
      </div>
    </NotificationContext.Provider>
  );
};

// Демо компонент для тестирования с звуками
export function NotificationDemo() {
  const { 
    notificationSuccess, 
    notificationError, 
    notificationWarning, 
    notificationInfo,
    toggleSound 
  } = useNotifications();

  const [soundEnabled, setSoundEnabled] = useState(
    localStorage.getItem('notificationSound') !== 'false'
  );

  const handleToggleSound = () => {
    const newState = toggleSound();
    setSoundEnabled(newState);
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                🔔 Система уведомлений
              </h1>
              <p className="text-gray-600 dark:text-gray-400">
                Протестируйте разные типы уведомлений
              </p>
            </div>
            
            <button
              onClick={handleToggleSound}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                soundEnabled 
                  ? 'bg-green-500 hover:bg-green-600 text-white' 
                  : 'bg-gray-300 hover:bg-gray-400 text-gray-700'
              }`}
            >
              {soundEnabled ? '🔊 Звук вкл' : '🔇 Звук выкл'}
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <button
              onClick={() => notificationSuccess('Операция выполнена успешно!', 'Успех')}
              className="px-6 py-3 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg font-medium transition-colors shadow-lg hover:shadow-xl transform hover:scale-105 transition-transform"
            >
              🔊 Success
            </button>

            <button
              onClick={() => notificationError('Что-то пошло не так', 'Ошибка')}
              className="px-6 py-3 bg-red-500 hover:bg-red-600 text-white rounded-lg font-medium transition-colors shadow-lg hover:shadow-xl transform hover:scale-105 transition-transform"
            >
              🔊 Error
            </button>

            <button
              onClick={() => notificationWarning('Пожалуйста, проверьте данные', 'Внимание')}
              className="px-6 py-3 bg-amber-500 hover:bg-amber-600 text-white rounded-lg font-medium transition-colors shadow-lg hover:shadow-xl transform hover:scale-105 transition-transform"
            >
              🔊 Warning
            </button>

            <button
              onClick={() => notificationInfo('Новое обновление доступно', 'Информация')}
              className="px-6 py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-medium transition-colors shadow-lg hover:shadow-xl transform hover:scale-105 transition-transform"
            >
              🔊 Info
            </button>
          </div>

          <div className="mt-8 p-6 bg-gray-50 dark:bg-gray-900 rounded-xl">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
              📝 Как использовать с звуками:
            </h3>
            <pre className="text-sm text-gray-700 dark:text-gray-300 overflow-x-auto whitespace-pre-wrap">
{`// Базовое использование (со звуком по умолчанию)
notificationSuccess('Данные сохранены!', 'Успех');

// Без звука
notificationError('Ошибка сети', 'Ошибка', 5000, false);

// С кастомной длительностью и звуком
notificationWarning('Сессия истекает', 'Внимание', 10000, true);

// Переключение звука в настройках
const { toggleSound } = useNotifications();
const handleToggle = () => {
  const newState = toggleSound();
  setSoundEnabled(newState);
};`}
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
}