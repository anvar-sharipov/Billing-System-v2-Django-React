import { Sun, Moon } from "lucide-react";
import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";
import MyModal from "../UI/MyModal";
import { useState, useContext,useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AuthContext } from "../Auth/AuthContext";

function Header({ theme, toggleTheme }) {
  const { t, i18n } = useTranslation();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate(); // для редиректа после выхода

  const switchLanguage = (lang) => {
    i18n.changeLanguage(lang);
    localStorage.setItem("lang", lang); // сохраняем выбранный язык
  };

  useEffect(() => {
  const savedLang = localStorage.getItem("lang");
  if (savedLang) {
    i18n.changeLanguage(savedLang);
  }
}, []);

  const handleLogout = () => {
    logout(); // очищаем токены и user
    navigate("/login"); // редирект на страницу логина
  };

  return (
    <>
      <motion.header
        initial={{ y: -50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="bg-gradient-to-r from-blue-900 via-purple-900 to-pink-900 h-16 flex items-center px-6 justify-between shadow-2xl text-white sticky top-0 z-50"
      >
        <div className="text-2xl font-extrabold drop-shadow-lg select-none">Smart Billing</div>

        <div className="flex items-center gap-4">
          {/* Переключение темы */}
          <button onClick={toggleTheme} className="p-2 rounded-lg bg-white/20 hover:bg-white/30 transition duration-300 backdrop-blur-sm shadow-inner" aria-label={t("Toggle Theme")}>
            {theme === "light" ? <Moon className="w-5 h-5 text-white" /> : <Sun className="w-5 h-5 text-white" />}
          </button>

          {/* Переключение языка */}
          <div className="flex gap-2">
            <button onClick={() => switchLanguage("tm")} className={`px-2 py-1 rounded transition-colors ${i18n.language === "tm" ? "bg-white/30 font-semibold" : "bg-white/20 hover:bg-white/30"}`}>
              TM
            </button>
            <button onClick={() => switchLanguage("ru")} className={`px-2 py-1 rounded transition-colors ${i18n.language === "ru" ? "bg-white/30 font-semibold" : "bg-white/20 hover:bg-white/30"}`}>
              RU
            </button>
          </div>

          {/* User actions */}
          {user ? (
            <>
              {/* Аватар пользователя */}
              <div onClick={() => setIsModalOpen(true)} className="w-10 h-10 rounded-full overflow-hidden flex items-center justify-center bg-white/20 shadow-md cursor-pointer">
                {user.image ? <img src={user.image} alt={user.username} className="w-full h-full object-cover" /> : <span className="text-white font-bold">{user.username[0].toUpperCase()}</span>}
              </div>

              <span className="font-semibold hover:text-gray-200 transition-colors cursor-pointer select-none">{user.username}</span>

              {/* Кнопка выхода */}
              <button onClick={handleLogout} className="px-3 py-1 rounded bg-red-600 hover:bg-red-700 transition-colors">
                {t("Logout")}
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="px-3 py-1 rounded bg-green-600 hover:bg-green-700 transition-colors">
                {t("Login")}
              </Link>
              <Link to="/register" className="px-3 py-1 rounded bg-blue-600 hover:bg-blue-700 transition-colors">
                {t("Register")}
              </Link>
            </>
          )}
        </div>
      </motion.header>

      {/* Модальное окно */}
      <MyModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={t("Profile")}>
        {/* closeOnBackdropClick={false} */}
        {user ? (
          <div className="flex flex-col items-center gap-2">
            {user.image && <img src={user.image} alt={user.username} className="w-40 h-40 rounded-full object-cover" />}
            <p>
              <strong>{t("Username")}: </strong> {user.username}
            </p>
            <p>
              <strong>{t("First Name")}: </strong> {user.first_name}
            </p>
            <p>
              <strong>{t("Last Name")}: </strong> {user.last_name}
            </p>
          </div>
        ) : (
          <p>{t("No user data")}</p>
        )}
      </MyModal>
    </>
  );
}

export default Header;
