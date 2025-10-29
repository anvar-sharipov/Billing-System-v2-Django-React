import { Sun, Moon, LogOut, User, Settings, Bell, Menu, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useTranslation } from "react-i18next";
import MyModal from "../UI/MyModal";
import { useState, useContext, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AuthContext } from "../Auth/AuthContext";
import { UserContext } from "../Auth/UserContext";
import { useNotifications } from "../../components/Notifications";

function Header({ theme, toggleTheme }) {
  const { t, i18n } = useTranslation();
  const { userInfo } = useContext(UserContext);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const { user, logout } = useContext(AuthContext);
  const { notificationSuccess } = useNotifications();
  const navigate = useNavigate();

  const switchLanguage = (lang) => {
    i18n.changeLanguage(lang);
    localStorage.setItem("lang", lang);
  };

  useEffect(() => {
    const savedLang = localStorage.getItem("lang");
    if (savedLang) {
      i18n.changeLanguage(savedLang);
    }
  }, []);

  const handleLogout = () => {
    logout();
    notificationSuccess("Вы успешно вышли из системы", "До встречи!");
    setTimeout(() => {
      navigate("/login");
    }, 1500);
  };

  return (
    <>
      <motion.header
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="bg-gray-200 dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 h-16 flex items-center px-4 sm:px-6 lg:px-8 justify-between shadow-lg backdrop-blur-xl sticky top-0 z-50"
      >
        {/* Logo */}
        <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="flex items-center gap-3 cursor-pointer group">
          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 rounded-xl flex items-center justify-center shadow-lg group-hover:shadow-xl transition-shadow">
            <span className="text-white font-bold text-lg">SB</span>
          </div>
          <span className="text-xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 dark:from-blue-400 dark:via-purple-400 dark:to-pink-400 bg-clip-text text-transparent hidden sm:block">
            Smart Billing
          </span>
        </motion.div>

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center gap-4">
          {/* Theme Toggle */}
          <motion.button
            whileHover={{ scale: 1.1, rotate: 180 }}
            whileTap={{ scale: 0.9 }}
            onClick={toggleTheme}
            className="p-2.5 rounded-xl bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-all duration-300 shadow-md hover:shadow-lg"
            aria-label={t("Toggle Theme")}
          >
            <AnimatePresence mode="wait">
              {theme === "light" ? (
                <motion.div key="moon" initial={{ rotate: -180, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: 180, opacity: 0 }} transition={{ duration: 0.3 }}>
                  <Moon className="w-5 h-5 text-gray-700 dark:text-gray-300" />
                </motion.div>
              ) : (
                <motion.div key="sun" initial={{ rotate: 180, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: -180, opacity: 0 }} transition={{ duration: 0.3 }}>
                  <Sun className="w-5 h-5 text-yellow-500" />
                </motion.div>
              )}
            </AnimatePresence>
          </motion.button>

          {/* Language Switcher */}
          <div className="flex gap-2 bg-gray-100 dark:bg-gray-800 p-1 rounded-xl shadow-md">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => switchLanguage("tm")}
              className={`px-3 py-1.5 rounded-lg font-medium text-sm transition-all duration-300 ${
                i18n.language === "tm" ? "bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-md" : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
              }`}
            >
              TM
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => switchLanguage("ru")}
              className={`px-3 py-1.5 rounded-lg font-medium text-sm transition-all duration-300 ${
                i18n.language === "ru" ? "bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-md" : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
              }`}
            >
              RU
            </motion.button>
          </div>

          {/* Notifications Icon */}
          {/* <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            className="relative p-2.5 rounded-xl bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-all duration-300 shadow-md hover:shadow-lg"
          >
            <Bell className="w-5 h-5 text-gray-700 dark:text-gray-300" />
            <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full text-white text-xs flex items-center justify-center">
              3
            </span>
          </motion.button> */}

          {/* User Section */}
          {user ? (
            <div className="relative">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                className="flex items-center gap-3 px-3 py-2 rounded-xl bg-gradient-to-r from-blue-50 to-purple-50 dark:from-gray-800 dark:to-gray-700 hover:from-blue-100 hover:to-purple-100 dark:hover:from-gray-700 dark:hover:to-gray-600 transition-all duration-300 shadow-md hover:shadow-lg"
              >
                <div className="w-9 h-9 rounded-full overflow-hidden flex items-center justify-center bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 shadow-md">
                  {user.image ? (
                    <img src={user.image} alt={user.username} className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-white font-bold text-sm">{user.username[0].toUpperCase()}</span>
                  )}
                </div>
                <span className="font-semibold text-gray-700 dark:text-gray-200 hidden lg:block">{user.username}</span>
              </motion.button>

              {/* Dropdown Menu */}
              <AnimatePresence>
                {isUserMenuOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: -10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -10, scale: 0.95 }}
                    transition={{ duration: 0.2 }}
                    className="absolute right-0 mt-2 w-56 bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 overflow-hidden"
                  >
                    <div className="p-4 border-b border-gray-200 dark:border-gray-700 bg-gradient-to-br from-blue-50 to-purple-50 dark:from-gray-700 dark:to-gray-800">
                      <p className="font-semibold text-gray-900 dark:text-white">{user.username}</p>
                      {/* <p className="text-sm text-gray-600 dark:text-gray-400">{user.email || 'user@example.com'}</p> */}
                    </div>

                    <div className="py-2">
                      <button
                        onClick={() => {
                          setIsModalOpen(true);
                          setIsUserMenuOpen(false);
                        }}
                        className="w-full px-4 py-2.5 flex items-center gap-3 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors text-left text-gray-700 dark:text-gray-300"
                      >
                        <User className="w-5 h-5" />
                        <span>{t("Profile")}</span>
                      </button>

                      <button className="w-full px-4 py-2.5 flex items-center gap-3 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors text-left text-gray-700 dark:text-gray-300">
                        <Settings className="w-5 h-5" />
                        <span>{t("Settings")}</span>
                      </button>

                      <div className="my-2 border-t border-gray-200 dark:border-gray-700"></div>

                      <button
                        onClick={handleLogout}
                        className="w-full px-4 py-2.5 flex items-center gap-3 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors text-left text-red-600 dark:text-red-400"
                      >
                        <LogOut className="w-5 h-5" />
                        <span>{t("Logout")}</span>
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link to="/login">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="px-4 py-2 rounded-xl bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white font-medium shadow-md hover:shadow-lg transition-all duration-300"
                >
                  {t("Login")}
                </motion.button>
              </Link>
              <Link to="/register">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="px-4 py-2 rounded-xl bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 font-medium shadow-md hover:shadow-lg transition-all duration-300"
                >
                  {t("Register")}
                </motion.button>
              </Link>
            </div>
          )}
        </div>

        {/* Mobile Menu Button */}
        <motion.button
          whileTap={{ scale: 0.9 }}
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="md:hidden p-2 rounded-xl bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300"
        >
          {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </motion.button>
      </motion.header>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 shadow-lg overflow-hidden"
          >
            <div className="p-4 space-y-3">
              {/* Theme & Language in Mobile */}
              <div className="flex items-center justify-between pb-3 border-b border-gray-200 dark:border-gray-800">
                <button onClick={toggleTheme} className="flex items-center gap-2 px-3 py-2 rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300">
                  {theme === "light" ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
                  <span className="text-sm">{theme === "light" ? "Dark" : "Light"}</span>
                </button>

                <div className="flex gap-2">
                  <button
                    onClick={() => switchLanguage("tm")}
                    className={`px-3 py-1.5 rounded-lg text-sm font-medium ${
                      i18n.language === "tm" ? "bg-gradient-to-r from-blue-500 to-purple-500 text-white" : "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400"
                    }`}
                  >
                    TM
                  </button>
                  <button
                    onClick={() => switchLanguage("ru")}
                    className={`px-3 py-1.5 rounded-lg text-sm font-medium ${
                      i18n.language === "ru" ? "bg-gradient-to-r from-blue-500 to-purple-500 text-white" : "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400"
                    }`}
                  >
                    RU
                  </button>
                </div>
              </div>

              {user ? (
                <>
                  <button
                    onClick={() => {
                      setIsModalOpen(true);
                      setIsMobileMenuOpen(false);
                    }}
                    className="w-full flex items-center gap-3 px-4 py-3 rounded-xl bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300"
                  >
                    <User className="w-5 h-5" />
                    <span>{t("Profile")}</span>
                  </button>
                  <button onClick={handleLogout} className="w-full flex items-center gap-3 px-4 py-3 rounded-xl bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400">
                    <LogOut className="w-5 h-5" />
                    <span>{t("Logout")}</span>
                  </button>
                </>
              ) : (
                <div className="space-y-2">
                  <Link to="/login" className="block w-full">
                    <button className="w-full px-4 py-3 rounded-xl bg-gradient-to-r from-blue-500 to-purple-500 text-white font-medium">{t("Login")}</button>
                  </Link>
                  <Link to="/register" className="block w-full">
                    <button className="w-full px-4 py-3 rounded-xl bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 font-medium">{t("Register")}</button>
                  </Link>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Modal */}
      <MyModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={t("Profile")}>
        {user ? (
          <div className="flex flex-col items-center gap-4">
            <div className="w-32 h-32 rounded-full overflow-hidden bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 p-1 shadow-xl">
              <div className="w-full h-full rounded-full overflow-hidden bg-white dark:bg-gray-800 flex items-center justify-center">
                {user.image ? (
                  <img src={user.image} alt={user.username} className="w-full h-full object-cover" />
                ) : (
                  <span className="text-4xl font-bold text-gray-700 dark:text-gray-300">{user.username[0].toUpperCase()}</span>
                )}
              </div>
            </div>

            <div className="w-full space-y-3 text-center">
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">{t("User")}</p>
                <p className="text-lg font-semibold text-gray-900 dark:text-white">{user.username}</p>
              </div>

              {user.last_name && (
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">{t("Last Name")}</p>
                  <p className="text-lg font-semibold text-gray-900 dark:text-white">{user.last_name}</p>
                </div>
              )}

              {user.first_name && (
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">{t("First Name")}</p>
                  <p className="text-lg font-semibold text-gray-900 dark:text-white">{user.first_name}</p>
                </div>
              )}

              {userInfo?.groups && (
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">{t("Groups")}</p>
                  <div className="flex flex-wrap gap-2 justify-center mt-2">
                    {userInfo.groups.map((group, index) => (
                      <span key={index} className="px-3 py-1 bg-gradient-to-r from-blue-500 to-purple-500 text-white text-sm rounded-full">
                        {group}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        ) : (
          <p className="text-center text-gray-600 dark:text-gray-400">{t("No user data")}</p>
        )}
      </MyModal>

      {/* Click outside to close user menu */}
      {isUserMenuOpen && <div className="fixed inset-0 z-40" onClick={() => setIsUserMenuOpen(false)} />}
    </>
  );
}

export default Header;
