import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState, useContext } from "react";
import myAxios from "../../../services/myAxios";
import { Formik, Form, Field } from "formik";
import { useTranslation } from "react-i18next";
import { motion, AnimatePresence } from "framer-motion";
import { User, MapPin, FileText, Monitor, Wifi, Tv, ArrowLeft, Save, Building, User as UserIcon, X } from "lucide-react";
import { UserContext } from "../../Auth/UserContext";
import { useNotifications } from "../../../components/Notifications";

const AddDogowor = () => {
  const { t } = useTranslation();
  const { notificationSuccess, notificationError } = useNotifications();
  const { userInfo } = useContext(UserContext);
  const { userId } = useParams();
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [selectedType, setSelectedType] = useState("");
  const [pointCount, setPointCount] = useState(0);

  const isAdmin = userInfo?.groups?.includes("admin");
  const userGroups = userInfo?.groups;

  const serviceTypes = [
    { value: "IPTV", label: "IPTV", icon: Tv, color: "bg-purple-500" },
    { value: "INTERNET", label: "INTERNET", icon: Wifi, color: "bg-blue-500" },
    { value: "CTV", label: "CTV", icon: Monitor, color: "bg-green-500" },
  ];

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await myAxios.get(`core/users/${userId}/`);
        setUser(res.data);
        console.log("res.data", res.data);
      } catch (error) {
        console.error("Error fetching user:", error);
      }
    };
    fetchUser();
  }, [userId]);

  const initialValues = {
    type: "",
    dogowor: "",
    login: "",
    activateDate: new Date().toISOString().split("T")[0],
    deactivateDate: "",
    installationPrice: "", // Изменено с "0" на пустую строку
    comment: "",
    pointCount: "", // Уже было пустым
    pointPrices: [],
  };

  const validateForm = (values) => {
    const errors = {};

    // Валидация для всех пользователей
    if (!values.type) {
      errors.type = t("Required");
    }

    if (!values.activateDate) {
      errors.activateDate = t("Required");
    }

    // Валидация для всех пользователей - login и dogowor обязательны
    if (!values.dogowor) {
      errors.dogowor = t("Required");
    }

    if (!values.login) {
      errors.login = t("Required");
    }

    // Валидация для не-админов
    if (!isAdmin) {
      // Валидация для CTV
      if (values.type === "CTV") {
        if (!values.dogowor.includes(user.number)) {
          errors.dogowor = t("Dogowor must contain user number");
        }
        if (!values.login.includes(user.number)) {
          errors.login = t("Login must contain user number");
        }
        if (!values.dogowor.toLowerCase().includes("ctv")) {
          errors.dogowor = t("Dogowor must contain 'ctv'");
        }
        if (!values.login.toLowerCase().includes("ctv")) {
          errors.login = t("Login must contain 'ctv'");
        }
      }

      // Валидация для IPTV
      if (values.type === "IPTV") {
        if (!values.dogowor.includes(user.number)) {
          errors.dogowor = t("Dogowor must contain user number");
        }
        if (!values.login.includes(user.number)) {
          errors.login = t("Login must contain user number");
        }
        if (!values.dogowor.toLowerCase().includes("iptv")) {
          errors.dogowor = t("Dogowor must contain 'iptv'");
        }
        if (!values.login.toLowerCase().includes("iptv")) {
          errors.login = t("Login must contain 'iptv'");
        }
      }
    }

    // Валидация для CTV (обязательные поля)
    if (values.type === "CTV") {
      if (values.pointCount === undefined || values.pointCount === null || values.pointCount === "") {
        errors.pointCount = t("Required");
      } else if (values.pointCount < 0) {
        errors.pointCount = t("Cannot be negative");
      }

      // Валидация цен точек
      if (values.pointPrices && values.pointPrices.length > 0) {
        const pointPriceErrors = [];
        values.pointPrices.forEach((price, index) => {
          if (!price && price !== 0) {
            pointPriceErrors[index] = t("Required");
          } else if (price < 0) {
            pointPriceErrors[index] = t("Cannot be negative");
          }
        });
        if (pointPriceErrors.some((error) => error)) {
          errors.pointPrices = pointPriceErrors;
        }
      }
    }

    return errors;
  };

  const handleSubmit = async (values, { setSubmitting }) => {
    try {
      // Преобразуем числовые поля перед отправкой
      const submitValues = {
        ...values,
        pointCount: values.pointCount === "" ? 0 : parseInt(values.pointCount) || 0,
        installationPrice: values.installationPrice === "" ? "0" : values.installationPrice,
      };
      const res = await myAxios.post(`core/users/${userId}/save-dogowor/`, submitValues);
      // navigate(`/users`);
      console.log("values", submitValues);
      notificationSuccess(t(res.data.message), "success");
    } catch (err) {
      console.log("err.response?.data", err);

      notificationError(t(err.response?.data?.error || "Unknown error"), "error");
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  // Функция для обработки вставки текста
  const handlePaste = (e, setFieldValue, fieldName) => {
    e.preventDefault();
    const pastedText = e.clipboardData.getData("text");
    setFieldValue(fieldName, pastedText);
  };

  // Функция для очистки поля
  const handleClearField = (setFieldValue, fieldName) => {
    setFieldValue(fieldName, "");
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  const ServiceIcon = ({ type }) => {
    const service = serviceTypes.find((s) => s.value === type);
    const IconComponent = service?.icon || FileText;
    return <IconComponent className="w-5 h-5" />;
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8 px-4 sm:px-6 lg:px-8">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <button onClick={() => navigate(-1)} className="flex items-center text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white mb-4 transition-colors duration-200">
            <ArrowLeft className="w-5 h-5 mr-2" />
            {t("Back")}
          </button>

          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">{t("Add new dogowor")}</h1>
            </div>
          </div>
        </div>

        {/* User Info Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 mb-8"
        >
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
              <UserIcon className="w-6 h-6 text-white" />
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                {user.surname} {user.name} {user.patronymic}
              </h3>
              <div className="flex items-center text-gray-600 dark:text-gray-400 mt-1">
                <MapPin className="w-4 h-4 mr-1" />
                <span className="text-sm">
                  {user.etrap?.etrap} ({user.etrap?.code}) {user.number}
                </span>
              </div>
            </div>
          </div>
        </motion.div>

        <Formik initialValues={initialValues} onSubmit={handleSubmit} validate={validateForm}>
          {({ values, isSubmitting, setFieldValue, errors, touched }) => (
            <Form>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 mb-6"
              >
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6 flex items-center">
                  <FileText className="w-6 h-6 mr-2 text-blue-500" />
                  {t("Choose dogowor Type")}
                </h2>

                {/* Service Type Selection */}
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-8">
                  {serviceTypes.map((service) => (
                    <motion.div key={service.value} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                      <label className="relative">
                        <Field
                          type="radio"
                          name="type"
                          value={service.value}
                          className="hidden peer"
                          onChange={(e) => {
                            setFieldValue("type", e.target.value);
                            setSelectedType(e.target.value);
                            setPointCount(0); // Сбрасываем количество точек при смене типа
                            setFieldValue("pointCount", ""); // Устанавливаем пустую строку вместо 0
                            setFieldValue("pointPrices", []);
                          }}
                        />
                        <div className="cursor-pointer rounded-lg border-2 border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-4 transition-all duration-200 peer-checked:border-blue-500 peer-checked:ring-2 peer-checked:ring-blue-200 dark:peer-checked:ring-blue-800 peer-checked:shadow-md hover:border-gray-300 dark:hover:border-gray-600">
                          <div className={`w-10 h-10 ${service.color} rounded-lg flex items-center justify-center mb-2`}>
                            <service.icon className="w-6 h-6 text-white" />
                          </div>
                          <div className="font-medium text-gray-900 dark:text-white">{service.label}</div>
                        </div>
                      </label>
                    </motion.div>
                  ))}
                </div>
                {errors.type && touched.type && <div className="text-red-500 text-sm mt-1">{errors.type}</div>}
              </motion.div>

              {/* Service Details */}
              <AnimatePresence>
                {values.type && (
                  <>
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.3 }}
                      className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 mb-6"
                    >
                      <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6 flex items-center">
                        <ServiceIcon type={values.type} />
                        <span className="ml-2">{values.type}</span>
                      </h2>

                      {/* Основные поля для всех типов услуг */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                        {/* Dogowor Field */}
                        <div className="relative">
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Dogowor *</label>
                          <div className="relative">
                            <Field
                              name="dogowor"
                              type="text"
                              required
                              readOnly={!isAdmin}
                              onPaste={(e) => handlePaste(e, setFieldValue, "dogowor")}
                              className={`w-full px-4 py-3 pr-10 border ${
                                errors.dogowor && touched.dogowor ? "border-red-500" : "border-gray-300 dark:border-gray-600"
                              } rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white transition-colors duration-200 ${
                                !isAdmin ? "bg-gray-100 dark:bg-gray-600" : ""
                              }`}
                              placeholder="Dogowor"
                              onWheel={(e) => e.target.blur()}
                            />
                            {values.dogowor && (
                              <button
                                type="button"
                                onClick={() => handleClearField(setFieldValue, "dogowor")}
                                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors duration-200"
                              >
                                <X className="w-4 h-4" />
                              </button>
                            )}
                          </div>
                          {errors.dogowor && touched.dogowor && <div className="text-red-500 text-sm mt-1">{errors.dogowor}</div>}
                          {!isAdmin && <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">{t("Use Ctrl+V to paste text")}</div>}
                        </div>

                        {/* Login Field */}
                        <div className="relative">
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Login *</label>
                          <div className="relative">
                            <Field
                              name="login"
                              type="text"
                              required
                              readOnly={!isAdmin}
                              onPaste={(e) => handlePaste(e, setFieldValue, "login")}
                              className={`w-full px-4 py-3 pr-10 border ${
                                errors.login && touched.login ? "border-red-500" : "border-gray-300 dark:border-gray-600"
                              } rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white transition-colors duration-200 ${
                                !isAdmin ? "bg-gray-100 dark:bg-gray-600" : ""
                              }`}
                              placeholder="Login"
                              onWheel={(e) => e.target.blur()}
                            />
                            {values.login && (
                              <button
                                type="button"
                                onClick={() => handleClearField(setFieldValue, "login")}
                                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors duration-200"
                              >
                                <X className="w-4 h-4" />
                              </button>
                            )}
                          </div>
                          {errors.login && touched.login && <div className="text-red-500 text-sm mt-1">{errors.login}</div>}
                          {!isAdmin && <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">{t("Use Ctrl+V to paste text")}</div>}
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">{t("Activate At")} *</label>
                          <Field
                            name="activateDate"
                            type="datetime-local"
                            required
                            className={`w-full px-4 py-3 border ${
                              errors.activateDate && touched.activateDate ? "border-red-500" : "border-gray-300 dark:border-gray-600"
                            } rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white transition-colors duration-200`}
                            onWheel={(e) => e.target.blur()}
                          />
                          {errors.activateDate && touched.activateDate && <div className="text-red-500 text-sm mt-1">{errors.activateDate}</div>}
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">{t("Deactivate At")}</label>
                          <Field
                            name="deactivateDate"
                            type="datetime-local"
                            className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white transition-colors duration-200"
                            onWheel={(e) => e.target.blur()}
                          />
                        </div>
                      </div>

                      {/* CTV Specific Fields */}
                      {values.type === "CTV" && (
                        <div className="space-y-6 mb-6">
                          {/* Поле для количества точек */}
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">{t("Number of points")} *</label>
                              <Field
                                name="pointCount"
                                type="number"
                                min="0"
                                required
                                className={`w-full px-4 py-3 border ${
                                  errors.pointCount && touched.pointCount ? "border-red-500" : "border-gray-300 dark:border-gray-600"
                                } rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white transition-colors duration-200`}
                                placeholder="0"
                                onWheel={(e) => e.target.blur()}
                                onChange={(e) => {
                                  const value = e.target.value;
                                  const count = value === "" ? 0 : parseInt(value) || 0;
                                  setPointCount(count);
                                  setFieldValue("pointCount", value); // Сохраняем исходное значение (может быть пустой строкой)
                                  // Инициализируем массив цен для точек
                                  const newPointPrices = Array(count).fill("");
                                  setFieldValue("pointPrices", newPointPrices);
                                }}
                              />
                              {errors.pointCount && touched.pointCount && <div className="text-red-500 text-sm mt-1">{errors.pointCount}</div>}
                            </div>
                          </div>

                          {/* Динамические поля для цен точек */}
                          <AnimatePresence>
                            {pointCount > 0 && (
                              <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: "auto" }}
                                exit={{ opacity: 0, height: 0 }}
                                transition={{ duration: 0.3 }}
                                className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-6"
                              >
                                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">{t("Monthly prices for points")} *</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                  {Array.from({ length: pointCount }, (_, index) => (
                                    <motion.div key={index} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.2, delay: index * 0.1 }}>
                                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                        {t("Monthly price for point")} {index + 1} *
                                      </label>
                                      <Field
                                        name={`pointPrices[${index}]`}
                                        type="number"
                                        step="0.01"
                                        min="0"
                                        required
                                        className={`w-full px-4 py-3 border ${
                                          errors.pointPrices && errors.pointPrices[index] ? "border-red-500" : "border-gray-300 dark:border-gray-600"
                                        } rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white transition-colors duration-200`}
                                        placeholder="0.00"
                                        onWheel={(e) => e.target.blur()}
                                      />
                                      {errors.pointPrices && errors.pointPrices[index] && <div className="text-red-500 text-sm mt-1">{errors.pointPrices[index]}</div>}
                                    </motion.div>
                                  ))}
                                </div>
                              </motion.div>
                            )}
                          </AnimatePresence>

                          {/* Цена установки */}
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">{t("Installation Price")}</label>
                              <Field
                                name="installationPrice"
                                type="number"
                                step="0.01"
                                min="0"
                                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white transition-colors duration-200"
                                placeholder="0.00"
                                onWheel={(e) => e.target.blur()}
                              />
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Comment Field for All Types */}
                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">{t("Comment")}</label>
                        <Field
                          as="textarea"
                          name="comment"
                          rows={3}
                          className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white transition-colors duration-200 resize-none"
                          placeholder={t("comment")}
                        />
                      </div>
                    </motion.div>

                    {/* Submit Button - теперь внутри AnimatePresence */}
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 20 }}
                      transition={{ duration: 0.3, delay: 0.1 }}
                      className="flex justify-end space-x-4"
                    >
                      <button
                        type="button"
                        onClick={() => navigate(-1)}
                        className="px-6 py-3 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-200 font-medium"
                      >
                        {t("Cancel")}
                      </button>
                      <motion.button
                        type="submit"
                        disabled={isSubmitting}
                        whileHover={{ scale: !isSubmitting ? 1.02 : 1 }}
                        whileTap={{ scale: !isSubmitting ? 0.98 : 1 }}
                        className="px-8 py-3 bg-blue-600 text-white rounded-lg font-medium disabled:opacity-50 disabled:cursor-not-allowed hover:bg-blue-700 transition-colors duration-200 flex items-center"
                      >
                        {isSubmitting ? (
                          <>
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                            {t("Creating...")}
                          </>
                        ) : (
                          <>
                            <Save className="w-5 h-5 mr-2" />
                            {t("Install")}
                          </>
                        )}
                      </motion.button>
                    </motion.div>
                  </>
                )}
              </AnimatePresence>
            </Form>
          )}
        </Formik>
      </motion.div>
    </div>
  );
};

export default AddDogowor;
