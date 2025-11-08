// components/SettingsModal.jsx
import { useState, useContext, useRef, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { UserContext } from "../Auth/UserContext";
import { AuthContext } from "../Auth/AuthContext";
import { useNotifications } from "../../components/Notifications";
import { X, Upload, Save } from "lucide-react";
import myAxios from "../../services/myAxios";


function SettingsModal({ isOpen, onClose }) {
  const { t } = useTranslation();
  const { userInfo, setUserInfo } = useContext(UserContext);
  const { user } = useContext(AuthContext);
  const { notificationSuccess, notificationError } = useNotifications();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    first_name: "",
    last_name: "",
    image: null
  });
  const [imagePreview, setImagePreview] = useState(null);
  const fileInputRef = useRef(null);

  const isAdmin = userInfo?.groups?.includes("admin");

  useEffect(() => {
    if (userInfo) {
      setFormData({
        first_name: userInfo.first_name || "",
        last_name: userInfo.last_name || "",
        image: null
      });
      setImagePreview(userInfo.image);
    }
  }, [userInfo]);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        notificationError(t("Please select an image file"));
        return;
      }
      
      if (file.size > 5 * 1024 * 1024) {
        notificationError(t("Image size should be less than 5MB"));
        return;
      }

      setFormData(prev => ({
        ...prev,
        image: file
      }));

      const previewUrl = URL.createObjectURL(file);
      setImagePreview(previewUrl);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const submitData = new FormData();
      
      if (formData.image) {
        submitData.append("image", formData.image);
      }
      
      if (isAdmin) {
        submitData.append("first_name", formData.first_name);
        submitData.append("last_name", formData.last_name);
      }

      const response = await myAxios.patch("accounts/user/profile/", submitData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      if (response.data) {
        const updatedUser = response.data;
        
        if (updatedUser.image) {
          updatedUser.image = `${import.meta.env.VITE_API_URL}${updatedUser.image}`;
        }
        
        setUserInfo(updatedUser);
        notificationSuccess(t("Profile updated successfully"));
        onClose();
        
        if (formData.image) {
            console.log("formData.image", formData.image);
          URL.revokeObjectURL(imagePreview);
        }
      }
    } catch (error) {
      console.error("Update profile error:", error);
      if (error.response?.data) {
        const errorData = error.response.data;
        if (typeof errorData === 'object') {
          const errorMessages = Object.values(errorData).flat().join(', ');
          notificationError(errorMessages);
        } else {
          notificationError(errorData.detail || t("Failed to update profile"));
        }
      } else {
        notificationError(t("Network error"));
      }
    } finally {
      setIsLoading(false);
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  const handleClose = () => {
    if (formData.image && imagePreview) {
      URL.revokeObjectURL(imagePreview);
    }
    setFormData({
      first_name: userInfo?.first_name || "",
      last_name: userInfo?.last_name || "",
      image: null
    });
    setImagePreview(userInfo?.image || null);
    onClose();
  };

  const getImageUrl = () => {
    if (imagePreview && formData.image) {
        
        
      return imagePreview;
    }
    if (userInfo?.image) {
      return userInfo.image;
    }
    return "/default-avatar.png";
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg w-full max-w-md">
        <div className="flex items-center justify-between p-6 border-b dark:border-gray-700">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            {t("Settings")}
          </h2>
          <button
            onClick={handleClose}
            className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6">
          {/* Avatar Section */}
          <div className="flex flex-col items-center mb-6">
            <div className="relative mb-4">
              <img
                src={getImageUrl()}
                // src={user.image ? user.image : getImageUrl()}

                
                alt={userInfo?.username}
                className="w-24 h-24 rounded-full object-cover border-2 border-gray-300 dark:border-gray-600"
              />
              <button
                type="button"
                onClick={triggerFileInput}
                className="absolute bottom-0 right-0 bg-blue-500 text-white p-2 rounded-full hover:bg-blue-600 transition-colors"
              >
                <Upload className="w-4 h-4" />
              </button>
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleImageChange}
                accept="image/*"
                className="hidden"
              />
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400 text-center">
              {t("Click the upload button to change your photo")}
            </p>
          </div>

          {/* Name Fields - Only for Admin */}
          {isAdmin && (
            <div className="space-y-4 mb-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  {t("First Name")}
                </label>
                <input
                  type="text"
                  name="first_name"
                  value={formData.first_name}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                  placeholder={t("Enter first name")}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  {t("Last Name")}
                </label>
                <input
                  type="text"
                  name="last_name"
                  value={formData.last_name}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                  placeholder={t("Enter last name")}
                />
              </div>
            </div>
          )}

          {/* Username (readonly) */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              {t("User")}
            </label>
            <input
              type="text"
              value={userInfo?.username || ""}
              readOnly
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-gray-100 dark:bg-gray-600 text-gray-500 dark:text-gray-400 cursor-not-allowed"
            />
          </div>

          <div className="flex justify-end space-x-3">
            <button
              type="button"
              onClick={handleClose}
              className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 transition-colors"
              disabled={isLoading}
            >
              {t("Cancel")}
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
            >
              <Save className="w-4 h-4" />
              {isLoading ? t("Saving...") : t("Save Changes")}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default SettingsModal;