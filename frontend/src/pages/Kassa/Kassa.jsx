import { useEtraps } from "../../context/EtrapContext";
import { UserContext } from "../Auth/UserContext";
import { useContext, useEffect, useState } from "react";
import myAxios from "../../services/myAxios";
import { useNavigation, useParams } from "react-router-dom";
import { useNotifications } from "../../components/Notifications";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { User, MapPin, Phone, CreditCard, Building, Hash, Badge, Zap, FileText, Calendar, Wallet } from "lucide-react";
import formatNumber from "../UI/formatNumber" 
import { formatDateTime } from "../UI/formatDateTime";

const Kassa = () => {
  const { etraps, loading } = useEtraps();
  const { userInfo } = useContext(UserContext);
  const { userId } = useParams();
  const { notificationSuccess, notificationError } = useNotifications();
  const [userData, setUserData] = useState(null);
  const [dogowors, setDogowors] = useState([]);

  const { t } = useTranslation();
  const navigate = useNavigate();

  useEffect(() => {
    console.log("userData", userData);
  }, [userData]);

  useEffect(() => {
    if (userId) {
      const get_user_for_kassa = async () => {
        try {
          const res = await myAxios.get(`core/get_user_for_kassa/${userId}/`);
          console.log("res", res);
          setUserData(res.data.user_data);
          setDogowors(res.data.dogowors_json);
        } catch (err) {
          if (err.response.data.error === "Authentication required") {
            notificationError(t(err.response.data.error), t("Access Denied"));
            navigate("/login");
          }
          console.log("err.response.data ==", err.response.data.error);
        }
      };
      get_user_for_kassa();
    }
  }, [userId]);

  // Функция для определения статуса договора
  const getDogoworStatus = (dogowor) => {
    const now = new Date();
    const activateAt = new Date(dogowor.activate_at);
    const deactivateAt = dogowor.deactivate_at ? new Date(dogowor.deactivate_at) : null;

    if (deactivateAt && deactivateAt < now) {
      return { status: "expired", text: t("deactiv"), color: "bg-red-100 text-red-800 dark:bg-red-800 dark:text-red-100" };
    } else if (activateAt > now) {
      return { status: "pending", text: "Ожидает", color: "bg-yellow-100 text-yellow-800 dark:bg-yellow-800 dark:text-yellow-100" };
    } else {
      return { status: "active", text: t("Active"), color: "bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-100" };
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4">
      {userData && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="max-w-6xl mx-auto">
          {/* Компактная шапка */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-4 mb-4">
            <div className="flex flex-wrap items-center gap-4">
              {/* Основная информация пользователя */}
              <div className="flex items-center gap-3 min-w-[200px]">
                <div className="p-2 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg">
                  <User className="w-4 h-4 text-white" />
                </div>
                <div>
                  <h1 className="font-bold text-gray-900 dark:text-white text-base">
                    {userData.surname} {userData.name} {userData.patronymic}
                  </h1>
                  <div className="flex items-center gap-1 font-bold text-blue-600 dark:text-blue-400 text-sm bg-blue-50 dark:bg-blue-900/30 px-2 py-1 rounded-full">
                    <Phone className="w-3 h-3" />
                    {userData.number}
                  </div>
                </div>
              </div>

              {/* Адрес */}
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                <span className="text-sm text-gray-700 dark:text-gray-300">{userData.address}</span>
              </div>

              {/* Телефон */}
              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                <span className="text-sm text-gray-700 dark:text-gray-300">{userData.mobile_number}</span>
              </div>

              {/* Регион */}
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded-full">
                  {userData.etrap?.etrap} ({userData.etrap?.code})
                </span>
              </div>

              {/* Абонплата */}
              <div className="flex items-center gap-2">
                <span className="text-sm font-semibold text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/30 px-2 py-1 rounded-full">
                  {userData.abonplata}
                </span>
              </div>

              {/* Статус предприятия */}
              <div className="flex items-center gap-2">
                <span className={`text-xs px-2 py-1 rounded-full ${
                  userData.is_enterprises 
                    ? "bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300" 
                    : "bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300"
                }`}>
                  {userData.is_enterprises ? t("is_enterprises") : t("ilat")}
                </span>
              </div>

              {/* Тип подключения */}
              {userData.hb_type && (
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded-full">
                    {userData.hb_type}
                  </span>
                </div>
              )}
            </div>

            {/* Счет - если есть */}
            {userData.account && (
              <div className="mt-3 pt-3 border-t border-gray-100 dark:border-gray-700">
                <div className="flex items-center gap-2 text-sm">
                  <span className="text-gray-600 dark:text-gray-400">{t("account")}:</span>
                  <span className="font-medium text-gray-900 dark:text-white bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">
                    {userData.account}
                  </span>
                </div>
              </div>
            )}

            {/* Услуги - компактный просмотр */}
            {userData.service_json && userData.service_json.length > 0 && (
              <div className="mt-3 pt-3 border-t border-gray-100 dark:border-gray-700">
                <div className="flex items-center gap-3">
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Услуги:</span>
                  <div className="flex flex-wrap gap-1">
                    {userData.service_json.map((service, index) => (
                      <span
                        key={service.id}
                        className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs ${
                          service.is_active 
                            ? "bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300 border border-blue-200 dark:border-blue-700" 
                            : "bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400"
                        }`}
                      >
                        {service.name}
                        <span className="font-semibold">({service.actual_price})</span>
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Договоры */}
          {dogowors.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 mb-4"
            >
              <div className="flex items-center gap-2 mb-4">
                <FileText className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">{t("dogowors")}</h2>
                <span className="bg-blue-100 text-blue-800 dark:bg-blue-800 dark:text-blue-100 text-xs px-2 py-1 rounded-full">
                  {dogowors.length}
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {dogowors.map((dogowor, index) => {
                  const status = getDogoworStatus(dogowor);
                  return (
                    <motion.div
                      key={dogowor.dogowor}
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 0.2 + index * 0.1 }}
                      className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:shadow-md transition-all duration-200 hover:border-blue-200 dark:hover:border-blue-700"
                    >
                      <div className="flex justify-between items-start mb-3">
                        <div className="flex-1">
                          <h3 className="font-bold text-gray-900 dark:text-white text-sm mb-1">
                            {dogowor.dogowor}
                          </h3>
                          <div className="flex items-center gap-2">
                            <span className={`text-xs px-2 py-1 rounded-full ${status.color}`}>
                              {status.text}
                            </span>
                            <span className={`text-sm font-bold ${
                              dogowor.balance < 0 
                                ? "text-red-600 dark:text-red-400" 
                                : "text-green-600 dark:text-green-400"
                            }`}>
                              {formatNumber(dogowor.balance, 4)}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="space-y-2 text-sm">
                        <div className="flex items-center gap-2">
                          <Calendar className="w-3 h-3 text-gray-400" />
                          <span className="text-gray-600 dark:text-gray-400 text-xs">
                            {t("activated")}: {formatDateTime(dogowor.activate_at)}
                          </span>
                        </div>

                        {dogowor.deactivate_at && (
                          <div className="flex items-center gap-2">
                            <Calendar className="w-3 h-3 text-gray-400" />
                            <span className="text-gray-600 dark:text-gray-400 text-xs">
                              {t("deactivated")}: {formatDateTime(dogowor.deactivate_at)}
                            </span>
                          </div>
                        )}
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </motion.div>
          )}

          {/* Здесь будет остальной контент */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <div className="text-gray-500 dark:text-gray-400 text-center py-8">
              Основной контент будет здесь...
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default Kassa;