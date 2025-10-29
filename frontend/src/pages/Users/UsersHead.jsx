import { UserPlus, Loader2 } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { ROUTES } from "../../routes";
import MiniButton from "../UI/MiniButton";
import MiniSelect from "../UI/MiniSelect";
import { useState } from "react";

const UsersHead = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [loadingAddUser, setLoadingAddUser] = useState(false);
  const [selectedOption, setSelectedOption] = useState("");

  return (
    <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 md:gap-6 p-1 bg-white/80 dark:bg-gray-900/80 backdrop-blur-lg border border-gray-200/50 dark:border-gray-700/50 shadow-lg hover:shadow-xl transition-all duration-300">
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 md:gap-4 w-full md:w-auto">
        
        {/* Add User Button */}
        <MiniButton
          text={t("Add user")}
          iconDefault={<UserPlus size={20} />}
          iconActive={<Loader2 size={20} />}
          loading={loadingAddUser}
          onClick={async () => {
            setLoadingAddUser(true);
            // имитация загрузки
            // await new Promise((res) => setTimeout(res, 500));
            setLoadingAddUser(false);
            navigate(ROUTES.ABONENT_FORM);
          }}
        />

        {/* Mini Select */}
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

    </div>
  );
};

export default UsersHead;
