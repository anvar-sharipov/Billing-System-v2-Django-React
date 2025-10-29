import { useEffect, useState, useContext } from "react";
import { motion } from "framer-motion";
import { User, Lock, LogIn, Eye, EyeOff, AlertCircle } from "lucide-react";
import { useTranslation } from "react-i18next";
import myAxios from "../../services/myAxios";
import { useNotifications } from "../../components/Notifications";
import { useNavigate } from "react-router-dom";
import { ROUTES } from "../../routes";
import { AuthContext } from "./AuthContext";

export default function Login() {
  const { t } = useTranslation();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { notificationSuccess, notificationError } = useNotifications();
  const navigate = useNavigate();

  useEffect(() => {
    document.title = `${t("Login")} - Smart Billing`;
  }, [t]);

  const { login } = useContext(AuthContext);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await myAxios.post("accounts/login/", { username, password });

      if (response.status === 200 && response.data.access) {
        const { access, refresh } = response.data;

        await login(access, refresh); // <-- обновляем контекст и user
        notificationSuccess(t("Success login"), t("success"));
        navigate(ROUTES.WELCOME_PAGE);
      } else {
        notificationError(t("Error login or password"), t("error"));
      }
    } catch (err) {
      notificationError(t("Error login or password"), t("error"));
    } finally {
      setIsLoading(false);
    }
  };

  const containerVariants = {
    hidden: { opacity: 0, scale: 0.9 },
    visible: { opacity: 1, scale: 1, transition: { duration: 0.5, ease: "easeOut" } },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-900 dark:via-blue-900 dark:to-purple-900 p-4">
      <motion.div variants={containerVariants} initial="hidden" animate="visible" className="w-full max-w-md">
        {/* Заголовок */}
        <motion.div className="text-center mb-8" initial={{ y: -50, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.2, type: "spring", stiffness: 200 }}>
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-blue-500 via-indigo-500 to-purple-600 rounded-3xl shadow-xl mb-4 transform hover:rotate-6 transition-transform">
            <LogIn className="w-10 h-10 text-white" />
          </div>
          <h2 className="text-4xl font-bold bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 dark:from-blue-400 dark:via-indigo-400 dark:to-purple-400 bg-clip-text text-transparent mb-2">
            {t("Welcome back!")}
          </h2>
          <p className="text-gray-600 dark:text-gray-400">{t("Log in to your account")}</p>
        </motion.div>

        {/* Форма */}
        <motion.form onSubmit={handleSubmit} className="bg-white dark:bg-gray-800 p-8 rounded-3xl shadow-2xl border border-gray-100 dark:border-gray-700 backdrop-blur-sm">
          {/* Username */}
          <motion.div variants={itemVariants} className="mb-5">
            <label className="block mb-2 text-sm font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-2">
              <User className="w-4 h-4" />
              {t("User login")}
            </label>
            <div className="relative group">
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                className="relative w-full px-4 py-3 pl-12 border-2 border-gray-200 dark:border-gray-600 rounded-xl focus:outline-none focus:border-blue-500 dark:focus:border-blue-400 transition-all bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                placeholder={t("User login")}
              />
              <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            </div>
          </motion.div>

          {/* Password */}
          <motion.div variants={itemVariants} className="mb-6">
            <label className="block mb-2 text-sm font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-2">
              <Lock className="w-4 h-4" />
              {t("Enter your password")}
            </label>
            <div className="relative group">
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="relative w-full px-4 py-3 pl-12 pr-12 border-2 border-gray-200 dark:border-gray-600 rounded-xl focus:outline-none focus:border-blue-500 dark:focus:border-blue-400 transition-all bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                placeholder={t("Enter your password")}
              />
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
          </motion.div>

          {/* Error */}
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              className="mb-5 p-4 bg-red-50 dark:bg-red-900/20 border-l-4 border-red-500 rounded-lg flex items-start gap-3"
            >
              <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-red-700 dark:text-red-400 text-sm">Ошибка входа</p>
                <p className="text-red-600 dark:text-red-300 text-sm">{error}</p>
              </div>
            </motion.div>
          )}

          {/* Submit */}
          <motion.button
            type="submit"
            disabled={isLoading}
            variants={itemVariants}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="w-full bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-600 hover:from-blue-600 hover:via-indigo-600 hover:to-purple-700 text-white font-bold py-3.5 rounded-xl transition-all shadow-lg hover:shadow-2xl disabled:opacity-50 disabled:cursor-not-allowed relative overflow-hidden group"
          >
            <span className="relative z-10 flex items-center justify-center gap-2">
              {isLoading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  {t("Login2")}...
                </>
              ) : (
                <>
                  <LogIn className="w-5 h-5" />
                  {t("Login")}
                </>
              )}
            </span>
            <div className="absolute inset-0 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-700 opacity-0 group-hover:opacity-100 transition-opacity" />
          </motion.button>
        </motion.form>
      </motion.div>
    </div>
  );
}
