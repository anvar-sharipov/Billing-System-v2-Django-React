import { useState } from "react";
import { useTranslation } from "react-i18next";
import { motion } from "framer-motion";
import { Upload, FileSpreadsheet, CheckCircle, AlertCircle, X } from "lucide-react";
import myAxios from "../../../services/myAxios";

const AddUsersFromBilling = () => {
  const { t } = useTranslation();
  const [selectedFile, setSelectedFile] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState(null); // 'success', 'error'
  const [errorMessage, setErrorMessage] = useState("");

  const handleFileSelect = (event) => {
    const file = event.target.files[0];
    if (file) {
      // Проверяем что файл Excel
      const validTypes = [
        'application/vnd.ms-excel',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        '.xls',
        '.xlsx'
      ];
      
      if (!validTypes.some(type => file.type.includes(type) || file.name.endsWith(type))) {
        setUploadStatus('error');
        setErrorMessage('Пожалуйста, выберите файл Excel (.xls или .xlsx)');
        return;
      }

      setSelectedFile(file);
      setUploadStatus(null);
      setErrorMessage("");
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      setUploadStatus('error');
      setErrorMessage('Пожалуйста, выберите файл');
      return;
    }

    setIsUploading(true);
    setUploadStatus(null);
    setErrorMessage("");

    try {
      const formData = new FormData();
      formData.append('excel_file', selectedFile);

      const res = await myAxios.post("core/users/upload-from-excel/", formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        timeout: 60000, // Увеличил таймаут до 60 секунд для больших файлов
      });

      setUploadStatus('success');
      console.log('Файл успешно загружен:', res.data);
      
      // Очищаем выбранный файл после успешной загрузки
      setTimeout(() => {
        setSelectedFile(null);
        setUploadStatus(null);
      }, 3000);

    } catch (err) {
      console.error("Ошибка загрузки файла", err);
      setUploadStatus('error');
      
      if (err.response?.data?.message) {
        setErrorMessage(err.response.data.message);
      } else if (err.response?.data?.detail) {
        setErrorMessage(err.response.data.detail);
      } else if (err.code === 'ECONNABORTED') {
        setErrorMessage('Время загрузки истекло. Файл может быть слишком большим.');
      } else {
        setErrorMessage('Произошла ошибка при загрузке файла. Попробуйте еще раз.');
      }
    } finally {
      setIsUploading(false);
    }
  };

  const handleRemoveFile = () => {
    setSelectedFile(null);
    setUploadStatus(null);
    setErrorMessage("");
  };

  const handleDragOver = (event) => {
    event.preventDefault();
  };

  const handleDrop = (event) => {
    event.preventDefault();
    const files = event.dataTransfer.files;
    if (files.length > 0) {
      const file = files[0];
      const inputEvent = {
        target: { files: [file] }
      };
      handleFileSelect(inputEvent);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 dark:from-gray-900 dark:to-blue-900 p-4 sm:p-6 lg:p-8">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8 text-center"
        >
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl flex items-center justify-center shadow-lg">
              <FileSpreadsheet className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 dark:text-gray-100">
              Добавление пользователей из биллинга
            </h1>
          </div>
          <p className="text-gray-600 dark:text-gray-400">
            Загрузите Excel файл для массового добавления пользователей
          </p>
        </motion.div>

        {/* Upload Area */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1 }}
          className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border-2 border-dashed border-gray-300 dark:border-gray-600 p-6 sm:p-8 mb-6"
        >
          {/* Drag & Drop Area */}
          <div
            onDragOver={handleDragOver}
            onDrop={handleDrop}
            className={`text-center p-8 rounded-xl transition-all duration-300 cursor-pointer
              ${!selectedFile ? 'bg-gray-50 dark:bg-gray-700/50 hover:bg-gray-100 dark:hover:bg-gray-700' : 'bg-transparent'}
              border-2 border-dashed border-gray-300 dark:border-gray-600 hover:border-green-500 dark:hover:border-green-400`}
            onClick={() => !selectedFile && document.getElementById('file-input').click()}
          >
            {!selectedFile ? (
              <>
                <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  Выберите Excel файл
                </h3>
                <p className="text-gray-500 dark:text-gray-400 mb-4">
                  Перетащите файл сюда или нажмите для выбора
                </p>
                <p className="text-sm text-gray-400 dark:text-gray-500">
                  Поддерживаются файлы .xls, .xlsx (без ограничений по размеру)
                </p>
              </>
            ) : (
              <div className="flex items-center justify-between bg-green-50 dark:bg-green-900/20 rounded-xl p-4">
                <div className="flex items-center gap-3">
                  <FileSpreadsheet className="w-8 h-8 text-green-600 dark:text-green-400" />
                  <div className="text-left">
                    <p className="font-semibold text-gray-800 dark:text-gray-200">
                      {selectedFile.name}
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                    </p>
                  </div>
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleRemoveFile();
                  }}
                  className="p-2 hover:bg-red-100 dark:hover:bg-red-900/30 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5 text-red-500" />
                </button>
              </div>
            )}
          </div>

          <input
            id="file-input"
            type="file"
            accept=".xls,.xlsx,application/vnd.ms-excel,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
            onChange={handleFileSelect}
            className="hidden"
          />

          {/* Status Messages */}
          {uploadStatus === 'success' && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center gap-3 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-xl mt-4"
            >
              <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400" />
              <span className="text-green-800 dark:text-green-300 font-medium">
                Файл успешно загружен! Пользователи добавлены в систему.
              </span>
            </motion.div>
          )}

          {uploadStatus === 'error' && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center gap-3 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl mt-4"
            >
              <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0" />
              <span className="text-red-800 dark:text-red-300">
                {errorMessage}
              </span>
            </motion.div>
          )}

          {/* Upload Button */}
          <motion.button
            whileHover={!isUploading && selectedFile ? { scale: 1.02 } : {}}
            whileTap={!isUploading && selectedFile ? { scale: 0.98 } : {}}
            onClick={handleUpload}
            disabled={!selectedFile || isUploading}
            className={`
              w-full mt-6 px-6 py-4
              bg-gradient-to-r from-green-500 to-emerald-600
              hover:from-green-600 hover:to-emerald-700
              text-white font-semibold rounded-xl
              shadow-lg hover:shadow-xl
              focus:outline-none focus:ring-4 focus:ring-green-400 focus:ring-opacity-50
              transition-all duration-300
              flex items-center justify-center gap-3
              ${(!selectedFile || isUploading) ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
            `}
          >
            {isUploading ? (
              <>
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                  className="w-5 h-5 border-2 border-white border-t-transparent rounded-full"
                />
                Загрузка...
              </>
            ) : (
              <>
                <Upload className="w-5 h-5" />
                Загрузить файл
              </>
            )}
          </motion.button>
        </motion.div>

        {/* Instructions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-blue-50 dark:bg-blue-900/20 rounded-2xl p-6 border border-blue-200 dark:border-blue-800"
        >
          <h3 className="font-semibold text-blue-900 dark:text-blue-300 mb-3 flex items-center gap-2">
            <AlertCircle className="w-5 h-5" />
            Требования к файлу:
          </h3>
          <ul className="text-sm text-blue-800 dark:text-blue-400 space-y-2">
            <li>• Файл должен быть в формате Excel (.xls или .xlsx)</li>
            <li>• Первая строка должна содержать заголовки столбцов</li>
            <li>• Обязательные поля: Номер, Имя, Фамилия</li>
            <li>• Поддерживаемые поля: Отчество, Улица, Дом, Квартира, Тип HB, Счет</li>
            <li>• Ограничений по размеру файла нет</li>
          </ul>
        </motion.div>
      </div>
    </div>
  );
};

export default AddUsersFromBilling;