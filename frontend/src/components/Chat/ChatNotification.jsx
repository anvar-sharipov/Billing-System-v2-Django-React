import { useEffect, useState } from 'react';
import { X, MessageSquare } from 'lucide-react';

export default function ChatNotification({ message, onClose, onClick }) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Анимация появления
    setTimeout(() => setIsVisible(true), 100);

    // Автоматическое закрытие через 5 секунд
    const timer = setTimeout(() => {
      handleClose();
    }, 5000);

    return () => clearTimeout(timer);
  }, []);

  const handleClose = () => {
    setIsVisible(false);
    setTimeout(onClose, 300);
  };

  return (
    <div
      className={`fixed top-4 right-4 bg-white rounded-lg shadow-lg p-4 max-w-sm w-full border-l-4 border-blue-500 cursor-pointer transform transition-all duration-300 z-50 ${
        isVisible ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'
      }`}
      onClick={onClick}
    >
      <div className="flex items-start gap-3">
        <div className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center text-white flex-shrink-0">
          <MessageSquare size={20} />
        </div>
        
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1 min-w-0">
              <h4 className="font-semibold text-gray-900 truncate">
                {message.sender.first_name} {message.sender.last_name}
              </h4>
              <p className="text-sm text-gray-600 line-clamp-2 mt-1">
                {message.content}
              </p>
            </div>
            
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleClose();
              }}
              className="text-gray-400 hover:text-gray-600 transition flex-shrink-0"
            >
              <X size={18} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}