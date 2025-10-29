import { UserPlus, Loader2, Download } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { ROUTES } from "../../routes";
import MiniButton from "../UI/MiniButton";
import MiniSelect from "../UI/MiniSelect";
import { useState } from "react";

const UsersHead = ({ selectedRows, totalRows }) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [loadingAddUser, setLoadingAddUser] = useState(false);
  const [selectedOption, setSelectedOption] = useState("");

  return (
    <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 p-6 bg-white/80 dark:bg-gray-900/80 backdrop-blur-lg border border-gray-200/50 dark:border-gray-700/50 shadow-lg rounded-2xl">
      
      {/* Левая часть - кнопки и селекты */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full lg:w-auto">
        
        {/* Add User Button */}
        <MiniButton
          text={t("Add user")}
          iconDefault={<UserPlus size={20} />}
          iconActive={<Loader2 size={20} />}
          loading={loadingAddUser}
          onClick={async () => {
            setLoadingAddUser(true);
            await new Promise((res) => setTimeout(res, 500));
            setLoadingAddUser(false);
            navigate(ROUTES.ABONENT_FORM);
          }}
        />

        {/* Mini Select для экспорта */}
        <MiniSelect
          options={[
            { value: "Only choosed", label: t("Only choosed") },
            { value: "Only this page", label: t("Only this page") },
            { value: "All", label: t("All") },
          ]}
          placeholder={t("Download")}
          value={selectedOption}
          onChange={(e) => setSelectedOption(e.target.value)}
          className="flex-1 sm:flex-none min-w-[200px]"
        />
      </div>

      {/* Правая часть - информация о выборе */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full lg:w-auto">
        
        {/* Информация о выборе */}
        {selectedRows.size > 0 && (
          <div className="text-sm text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/30 px-3 py-2 rounded-lg border border-blue-200 dark:border-blue-700">
            {t('selected')}: {selectedRows.size} {t('of')} {totalRows}
          </div>
        )}
      </div>
    </div>
  );
};

export default UsersHead;