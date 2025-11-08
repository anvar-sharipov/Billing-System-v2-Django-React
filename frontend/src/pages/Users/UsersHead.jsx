import { UserPlus, Loader2, Download, ChevronDown } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { ROUTES } from "../../routes";
import { useState } from "react";

const UsersHead = ({ selectedRows, totalRows, etraps }) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [loadingAddUser, setLoadingAddUser] = useState(false);
  const [selectedOption, setSelectedOption] = useState("");

  return (
    <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 p-6 bg-gray-100 dark:bg-gray-900/50 rounded-2xl shadow-2xl border border-white/10 dark:border-gray-600/30">
      
      {/* Левая часть - кнопки и селекты */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full lg:w-auto">
        
        {/* Add User Button */}
        <button
          onClick={async () => {
            setLoadingAddUser(true);
            await new Promise((res) => setTimeout(res, 500));
            setLoadingAddUser(false);
            navigate(ROUTES.ABONENT_FORM);
          }}
          disabled={loadingAddUser}
          className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-500/90 to-blue-600/90 hover:from-blue-600/90 hover:to-blue-700/90 text-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 backdrop-blur-sm border border-white/20 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loadingAddUser ? (
            <Loader2 size={20} className="animate-spin" />
          ) : (
            <UserPlus size={20} />
          )}
          <span>{t("Add user")}</span>
        </button>

        {/* Select для экспорта */}
        <div className="relative flex-1 sm:flex-none min-w-[200px]">
          <select
            value={selectedOption}
            onChange={(e) => setSelectedOption(e.target.value)}
            className="w-full px-4 py-2 pr-10 bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm border border-white/20 dark:border-gray-600/50 rounded-xl text-gray-800 dark:text-gray-200 focus:border-blue-500/50 focus:ring-2 focus:ring-blue-500/20 transition-all duration-300 appearance-none cursor-pointer"
          >
            <option value="">{t("Download")}</option>
            <option value="Only choosed">{t("Only choosed")}</option>
            <option value="Only this page">{t("Only this page")}</option>
            <option value="All">{t("All")}</option>
          </select>
          <div className="absolute right-3 top-1/2 transform -translate-y-1/2 flex items-center gap-1 pointer-events-none">
            <Download size={16} className="text-gray-400 dark:text-gray-500" />
            <ChevronDown size={16} className="text-gray-400 dark:text-gray-500" />
          </div>
        </div>
      </div>

      {/* Правая часть - информация о выборе */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full lg:w-auto">
        
        {/* Информация о выборе */}
        {selectedRows.size > 0 && (
          <div className="text-sm font-medium text-blue-600 dark:text-blue-400 bg-blue-100/80 dark:bg-blue-900/40 backdrop-blur-sm px-4 py-2 rounded-xl border border-blue-200/50 dark:border-blue-700/50 shadow-lg">
            {t('selected')}: <span className="font-bold">{selectedRows.size}</span> {t('of')} <span className="font-bold">{totalRows}</span>
          </div>
        )}

        {/* Общее количество пользователей */}
        <div className="text-sm font-medium text-gray-700 dark:text-gray-300 bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm px-4 py-2 rounded-xl border border-white/20 dark:border-gray-600/50">
          {t('Total abonents')}: <span className="font-bold text-blue-600 dark:text-blue-400">{totalRows}</span>
        </div>
      </div>
    </div>
  );
};

export default UsersHead;