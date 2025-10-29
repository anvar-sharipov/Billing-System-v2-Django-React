import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { User, Lock, Users, UserPlus, Eye, EyeOff, Upload } from "lucide-react";
import myAxios from "../../services/myAxios";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";

export default function Register() {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [image, setImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  // const [group, setGroup] = useState("");
  const [groups, setGroups] = useState([]);
  const [groupsSelected, setGroupsSelected] = useState([]);
  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    document.title = `${t("Register")} - Smart Billing`;
  }, [t]);

  useEffect(() => {
    const fetchGroups = async () => {
      try {
        const res = await myAxios.get("accounts/groups/");
        setGroups(res.data);
      } catch (err) {
        console.error("Ошибка получения групп", err);
      }
    };
    fetchGroups();
  }, []);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImage(file);
      const reader = new FileReader();
      reader.onloadend = () => setImagePreview(reader.result);
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors({});
    setIsLoading(true);

    // Валидация полей
    const newErrors = {};
    if (!username.trim()) newErrors.username = t("Username is required");
    if (!password.trim()) newErrors.password = t("Password is required");
    if (!firstName.trim()) newErrors.firstName = t("First Name is required");
    if (!lastName.trim()) newErrors.lastName = t("Last Name is required");
    if (groupsSelected.length === 0) newErrors.groups = t("At least one group must be selected"); // <-- здесь

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      setIsLoading(false);
      return; // <-- возвращаемся, если есть ошибки
    }

    try {
      const formData = new FormData();
      formData.append("username", username);
      formData.append("password", password);
      formData.append("first_name", firstName);
      formData.append("last_name", lastName);
      if (image) formData.append("image", image);
      groupsSelected.forEach((g) => formData.append("groups", g));

      await myAxios.post("accounts/register/", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      navigate("/login");
    } catch (err) {
      console.error(err);
      setErrors({ form: t("Registration error. Please check your data.") });
    } finally {
      setIsLoading(false);
    }
  };

  const containerVariants = {
    hidden: { opacity: 0, y: 50 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } },
  };

  const itemVariants = {
    hidden: { opacity: 0, x: -20 },
    visible: { opacity: 1, x: 0, transition: { duration: 0.3 } },
  };

  const inputClass = "w-full px-4 py-3 border-2 rounded-xl focus:outline-none transition-colors bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100";

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 dark:from-gray-900 dark:via-purple-900 dark:to-blue-900 p-4">
      <motion.div variants={containerVariants} initial="hidden" animate="visible" className="w-full max-w-2xl">
        <motion.div className="text-center mb-8" initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", stiffness: 200, delay: 0.2 }}>
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl shadow-lg mb-4">
            <UserPlus className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-400 dark:to-purple-400 bg-clip-text text-transparent">{t("Register")}</h2>
        </motion.div>

        <motion.form onSubmit={handleSubmit} className="bg-white dark:bg-gray-800 p-8 rounded-3xl shadow-2xl border border-gray-100 dark:border-gray-700">
          {/* Avatar */}
          <motion.div variants={itemVariants} className="mb-6 flex justify-center">
            <div className="relative">
              <div className="w-24 h-24 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 p-1">
                <div className="w-full h-full rounded-full bg-white dark:bg-gray-700 flex items-center justify-center overflow-hidden">
                  {imagePreview ? <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" /> : <User className="w-10 h-10 text-gray-400" />}
                </div>
              </div>
              <label className="absolute bottom-0 right-0 bg-blue-500 hover:bg-blue-600 text-white p-2 rounded-full cursor-pointer shadow-lg transition-all hover:scale-110">
                <Upload className="w-4 h-4" />
                <input type="file" accept="image/*" onChange={handleImageChange} className="hidden" />
              </label>
            </div>
          </motion.div>

          {/* Username */}
          <motion.div variants={itemVariants} className="mb-4">
            <label className="block mb-2 text-sm font-semibold text-gray-700 dark:text-gray-300">{t("User login")}</label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className={`${inputClass} border-gray-200 dark:border-gray-600 ${errors.username ? "border-red-500" : ""} pl-10`}
                placeholder={t("User login")}
              />
            </div>
            {errors.username && <p className="text-red-500 text-sm mt-1">{errors.username}</p>}
          </motion.div>

          {/* Password */}
          <motion.div variants={itemVariants} className="mb-4">
            <label className="block mb-2 text-sm font-semibold text-gray-700 dark:text-gray-300">{t("Password")}</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className={`${inputClass} border-gray-200 dark:border-gray-600 ${errors.password ? "border-red-500" : ""} pl-10`}
                placeholder="••••••••"
              />
              <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
            {errors.password && <p className="text-red-500 text-sm mt-1">{errors.password}</p>}
          </motion.div>

          {/* First & Last Name */}
          <motion.div variants={itemVariants} className="mb-4 grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block mb-2 text-sm font-semibold text-gray-700 dark:text-gray-300">{t("First Name")}</label>
              <input
                type="text"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                className={`${inputClass} border-gray-200 dark:border-gray-600 ${errors.firstName ? "border-red-500" : ""}`}
                placeholder={t("First Name")}
              />
              {errors.firstName && <p className="text-red-500 text-sm mt-1">{errors.firstName}</p>}
            </div>
            <div>
              <label className="block mb-2 text-sm font-semibold text-gray-700 dark:text-gray-300">{t("Last Name")}</label>
              <input
                type="text"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                className={`${inputClass} border-gray-200 dark:border-gray-600 ${errors.lastName ? "border-red-500" : ""}`}
                placeholder={t("Last Name")}
              />
              {errors.lastName && <p className="text-red-500 text-sm mt-1">{errors.lastName}</p>}
            </div>
          </motion.div>

          {/* Group */}
          <motion.div variants={itemVariants} className="mb-6">
            <label className="block mb-2 text-sm font-semibold text-gray-700 dark:text-gray-300">{t("Group")}</label>
            <div className="relative">
              <Users className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <select
                multiple
                value={groupsSelected}
                onChange={(e) => {
                  const selected = Array.from(e.target.selectedOptions, (option) => option.value);
                  setGroupsSelected(selected);
                }}
                className={`${inputClass} pl-11 appearance-none cursor-pointer ${errors.groups ? "border-red-500" : ""}`}
              >
                {groups.map((g) => (
                  <option key={g.id} value={g.id}>
                    {g.name}
                  </option>
                ))}
              </select>
            </div>
            {errors.groups && <p className="text-red-500 text-sm mt-1">{errors.groups}</p>}
          </motion.div>

          {/* Form error */}
          {errors.form && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl text-red-600 dark:text-red-400 text-sm"
            >
              {errors.form}
            </motion.div>
          )}

          {/* Submit */}
          <motion.button
            type="submit"
            disabled={isLoading}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-semibold py-3 rounded-xl transition-all shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <div className="flex items-center justify-center gap-2">
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                {t("Register")}...
              </div>
            ) : (
              t("Register")
            )}
          </motion.button>

          {/* Login Link */}
          <motion.p variants={itemVariants} className="text-center mt-6 text-gray-600 dark:text-gray-400">
            {t("Already have an account?")}{" "}
            <a href="/login" className="text-blue-500 hover:text-blue-600 dark:text-blue-400 dark:hover:text-blue-300 font-semibold transition-colors">
              {t("Login")}
            </a>
          </motion.p>
        </motion.form>
      </motion.div>
    </div>
  );
}
