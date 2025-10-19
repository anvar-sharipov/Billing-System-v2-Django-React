import React from "react";
import { motion, AnimatePresence } from "framer-motion";

export default function MyModal({ 
  isOpen, 
  onClose, 
  children, 
  title,
  closeOnBackdropClick = true // по умолчанию true
}) {
  const handleBackdropClick = () => {
    if (closeOnBackdropClick) {
      onClose();
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Фон - клик закрывает модалку (если разрешено) */}
          <motion.div
            className="fixed inset-0 bg-black/50 z-40"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleBackdropClick}
          />

          {/* Контейнер для центрирования */}
          <div className="fixed inset-0 flex items-center justify-center z-50 p-4 pointer-events-none">
            {/* Модальное окно */}
            <motion.div
              className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl max-w-lg w-full p-6 relative pointer-events-auto"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              transition={{ duration: 0.3 }}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Кнопка закрытия */}
              <button
                onClick={onClose}
                className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 dark:hover:text-gray-200 transition text-2xl leading-none"
                aria-label="Close"
              >
                ✕
              </button>

              {/* Заголовок */}
              {title && (
                <h2 className="text-xl font-bold mb-4 text-gray-900 dark:text-gray-100 pr-8">
                  {title}
                </h2>
              )}

              {/* Контент */}
              <div className="text-gray-700 dark:text-gray-300">{children}</div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}