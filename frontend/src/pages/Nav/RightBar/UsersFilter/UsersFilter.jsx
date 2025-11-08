import { useFormik } from "formik";
import { motion } from "framer-motion";
import { User, Phone, FileText, Building, Activity, Hash, MapPin, X, ChevronDown, Search } from "lucide-react";
import { useTranslation } from "react-i18next";
import { memo, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";

// Выносим компоненты наружу и мемоизируем
const SearchInput = memo(({ field, placeholder, icon: Icon, label, value, onChange, hidden = false }) => (
  <div className={`relative mb-3 transition-opacity duration-200 ${hidden ? "opacity-0 invisible pointer-events-none h-0" : "opacity-100 visible"}`}>
    <label htmlFor={field} className="block text-sm font-medium text-white dark:text-gray-200 mb-1">
      {label}
    </label>
    <div className="relative">
      <Icon size={16} className="absolute top-1/2 left-3 -translate-y-1/2 text-gray-400 dark:text-gray-500" />
      <input
        id={field}
        name={field}
        type="text"
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        disabled={hidden}
        className="w-full pl-10 pr-4 py-2 rounded-xl bg-white/10 dark:bg-gray-700 text-white dark:text-gray-100 placeholder-gray-300 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-400 dark:focus:ring-blue-500 transition-all duration-200 text-sm border border-white/20 dark:border-gray-600"
      />
    </div>
  </div>
));

SearchInput.displayName = "SearchInput";

const FilterSelect = memo(({ field, options, placeholder, icon: Icon, label, value, onChange, hidden = false }) => (
  <div className={`relative mb-3 transition-opacity duration-200 ${hidden ? "opacity-0 invisible pointer-events-none h-0" : "opacity-100 visible"}`}>
    <label htmlFor={field} className="block text-sm font-medium text-white dark:text-gray-200 mb-1">
      {label}
    </label>
    <div className="relative">
      <Icon size={14} className="absolute top-1/2 left-3 -translate-y-1/2 text-gray-400 dark:text-gray-500 z-10" />
      <select
        id={field}
        name={field}
        value={value}
        onChange={onChange}
        disabled={hidden}
        className="w-full pl-10 pr-8 py-2 rounded-xl bg-white/10 dark:bg-gray-700 text-white dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-purple-400 dark:focus:ring-purple-500 appearance-none cursor-pointer transition-all duration-200 text-sm border border-white/20 dark:border-gray-600 relative z-0 bg-gradient-to-b from-white/5 to-white/10"
      >
        <option value="" className="bg-gray-800 dark:bg-gray-700 text-white dark:text-gray-100">
          {placeholder}
        </option>
        {options.map((option) => (
          <option key={option.value} value={option.value} className="bg-gray-800 dark:bg-gray-700 text-white dark:text-gray-100">
            {option.label}
          </option>
        ))}
      </select>
      <ChevronDown size={16} className="absolute top-1/2 right-2 -translate-y-1/2 text-gray-400 dark:text-gray-500 pointer-events-none" />
    </div>
  </div>
));

FilterSelect.displayName = "FilterSelect";

const UsersFilter = ({ onSearch, onFilter, etraps }) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();

  // Функция для получения значений из URL
  const getInitialValuesFromURL = () => {
    const searchParams = new URLSearchParams(location.search);
    
    return {
      searchType: searchParams.get('searchType') || "users",
      // Поиск поля
      surname: searchParams.get('surname') || "",
      name: searchParams.get('name') || "",
      patronymic: searchParams.get('patronymic') || "",
      phone: searchParams.get('phone') || "",
      dogowor: searchParams.get('dogowor') || "",
      address: searchParams.get('address') || "",
      // Фильтры
      is_active: searchParams.get('is_active') || "",
      is_enterprises: searchParams.get('is_enterprises') || "",
      hb_type: searchParams.get('hb_type') || "",
      account: searchParams.get('account') || "",
      etrap: searchParams.get('etrap') || "",
    };
  };

  const formik = useFormik({
    initialValues: getInitialValuesFromURL(),
    
    onSubmit: (values) => {
      // Собираем только те поля, где есть значение
      const params = new URLSearchParams();
      Object.entries(values).forEach(([key, val]) => {
        if (val !== "" && val !== null && val !== undefined) {
          params.append(key, val);
        }
      });

      // Сбрасываем пагинацию на первую страницу при новом поиске/фильтре
      params.set('page', '1');

      // Обновляем URL (но без перезагрузки страницы)
      navigate(`?${params.toString()}`, { replace: true });

      // при желании — можно оставить вызовы onFilter/onSearch
      if (onFilter) onFilter(values);
    },
  });

  const { values, handleSubmit, setFieldValue, resetForm } = formik;

  // Синхронизация формы с URL при изменении location
  useEffect(() => {
    const urlValues = getInitialValuesFromURL();
    
    // Обновляем все поля формы значениями из URL
    Object.entries(urlValues).forEach(([key, value]) => {
      if (formik.values[key] !== value) {
        setFieldValue(key, value);
      }
    });
  }, [location.search]);

  const handleSelectChange = (field, value) => {
    setFieldValue(field, value);

    const params = new URLSearchParams(window.location.search);

    // --- Логика для типа абонента ---
    if (field === "is_enterprises") {
      if (value === "true") {
        setFieldValue("surname", "");
        setFieldValue("patronymic", "");
        params.delete("surname");
        params.delete("patronymic");
      } else if (value === "false") {
        setFieldValue("account", "");
        setFieldValue("hb_type", "");
        params.delete("account");
        params.delete("hb_type");
      }
    }

    // --- Логика для searchType ---
    if (field === "searchType") {
      if (value === "users") {
        setFieldValue("dogowor", "");
        setFieldValue("phone", "");
        params.delete("dogowor");
        params.delete("phone");
      } else if (value === "phone") {
        setFieldValue("surname", "");
        setFieldValue("name", "");
        setFieldValue("patronymic", "");
        setFieldValue("dogowor", "");
        params.delete("surname");
        params.delete("name");
        params.delete("patronymic");
        params.delete("dogowor");
      } else if (value === "dogowor") {
        setFieldValue("surname", "");
        setFieldValue("name", "");
        setFieldValue("patronymic", "");
        setFieldValue("phone", "");
        params.delete("surname");
        params.delete("name");
        params.delete("patronymic");
        params.delete("phone");
      } else if (value === "address") {
        setFieldValue("surname", "");
        setFieldValue("name", "");
        setFieldValue("patronymic", "");
        setFieldValue("phone", "");
        params.delete("surname");
        params.delete("name");
        params.delete("patronymic");
        params.delete("phone");
      }
    }

    // Сбрасываем страницу на 1 при изменении фильтра и обновляем URL без перезагрузки
    params.set('page', '1');
    window.history.replaceState({}, "", `${window.location.pathname}?${params.toString()}`);
  };

  const clearAllFilters = () => {
    resetForm();
    // Очистить параметры из URL, не обновляя страницу
    const url = window.location.origin + window.location.pathname;
    window.history.replaceState({}, "", url);
    if (onFilter) onFilter({});
  };

  const showEnterpriseFields = values.is_enterprises === "true";

  return (
    <div className="space-y-4">
      {/* Кнопка Gözle сверху */}
      <motion.button
        type="button"
        onClick={handleSubmit}
        className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-xl font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2 focus:ring-offset-indigo-800 shadow-lg hover:shadow-xl"
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
      >
        <Search size={18} />
        {t("search")}
      </motion.button>

      <h3 className="text-lg font-semibold mb-4 text-white dark:text-gray-100">{t("filters")}</h3>

      {/* Görnüşi gözleg */}
      <div className="relative mb-4">
        <label htmlFor="searchType" className="block text-sm font-medium text-white dark:text-gray-200 mb-1">
          {t("searchType")}
        </label>
        <div className="relative">
          <User size={14} className="absolute top-1/2 left-3 -translate-y-1/2 text-gray-400 dark:text-gray-500 z-10" />
          <select
            id="searchType"
            name="searchType"
            value={values.searchType}
            onChange={(e) => handleSelectChange("searchType", e.target.value)}
            className="w-full pl-10 pr-8 py-2 rounded-xl bg-white/10 dark:bg-gray-700 text-white dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-400 dark:focus:ring-blue-500 appearance-none cursor-pointer transition-all duration-200 text-sm border border-white/20 dark:border-gray-600 relative z-0 bg-gradient-to-b from-white/5 to-white/10"
          >
            <option value="users" className="bg-gray-800 dark:bg-gray-700 text-white dark:text-gray-100">
              {t("people")}
            </option>
            <option value="phone" className="bg-gray-800 dark:bg-gray-700 text-white dark:text-gray-100">
              {t("phone")}
            </option>
            <option value="dogowor" className="bg-gray-800 dark:bg-gray-700 text-white dark:text-gray-100">
              {t("contract")}
            </option>
            <option value="address" className="bg-gray-800 dark:bg-gray-700 text-white dark:text-gray-100">
              {t("address")}
            </option>
          </select>
          <ChevronDown size={16} className="absolute top-1/2 right-2 -translate-y-1/2 text-gray-400 dark:text-gray-500 pointer-events-none" />
        </div>
      </div>

      {/* Gözleg meýdanlary - ПОЛНОСТЬЮ ФИКСИРОВАННАЯ СТРУКТУРА */}
      <div className="mb-4">
        {/* СЛОТ 1: Фамилия ИЛИ Хоз/Бюджет */}
        <SearchInput
          field="surname"
          placeholder={t("enterSurname")}
          icon={User}
          label={t("surname")}
          value={values.surname}
          onChange={(e) => setFieldValue("surname", e.target.value)}
          hidden={values.searchType !== "users" || showEnterpriseFields}
        />
        <FilterSelect
          field="hb_type"
          options={[
            { value: "hoz", label: t("economic") },
            { value: "budjet", label: t("budget") },
          ]}
          placeholder={t("selectType")}
          icon={Hash}
          label={t("economicBudget")}
          value={values.hb_type}
          onChange={(e) => handleSelectChange("hb_type", e.target.value)}
          hidden={values.searchType !== "users" || !showEnterpriseFields}
        />

        {/* СЛОТ 2: Имя (всегда на этом месте) */}
        <SearchInput
          field="name"
          placeholder={t("enterName")}
          icon={User}
          label={t("name")}
          value={values.name}
          onChange={(e) => setFieldValue("name", e.target.value)}
          hidden={values.searchType !== "users"}
        />

        {/* СЛОТ 3: Отчество ИЛИ Счет */}
        <SearchInput
          field="patronymic"
          placeholder={t("enterPatronymic")}
          icon={User}
          label={t("patronymic")}
          value={values.patronymic}
          onChange={(e) => setFieldValue("patronymic", e.target.value)}
          hidden={values.searchType !== "users" || showEnterpriseFields}
        />
        <SearchInput
          field="account"
          placeholder={t("enterAccount")}
          icon={Hash}
          label={t("account")}
          value={values.account}
          onChange={(e) => setFieldValue("account", e.target.value)}
          hidden={values.searchType !== "users" || !showEnterpriseFields}
        />

        {/* СЛОТ 4: Телефон */}
        <SearchInput
          field="phone"
          placeholder={t("enterPhone")}
          icon={Phone}
          label={t("phoneNumber")}
          value={values.phone}
          onChange={(e) => setFieldValue("phone", e.target.value)}
          hidden={values.searchType !== "phone"}
        />

        {/* СЛОТ 5: Договор */}
        <SearchInput
          field="dogowor"
          placeholder={t("enterContract")}
          icon={FileText}
          label={t("contractNumber")}
          value={values.dogowor}
          onChange={(e) => setFieldValue("dogowor", e.target.value)}
          hidden={values.searchType !== "dogowor"}
        />
        {/* СЛОТ 5: Address */}
        <SearchInput
          field="address"
          placeholder={t("enterAddress")}
          icon={MapPin}
          label={t("Address")}
          value={values.address}
          onChange={(e) => setFieldValue("address", e.target.value)}
          hidden={values.searchType !== "address"}
        />
      </div>

      {/* Esasy filterler - FIXED STRUCTURE */}
      <div className="space-y-2 pt-4 border-t border-white/20 dark:border-gray-600">
        {/* Statusy */}
        <FilterSelect
          field="is_active"
          options={[
            { value: "true", label: t("active") },
            { value: "false", label: t("inactive") },
          ]}
          placeholder={t("selectStatus")}
          icon={Activity}
          label={t("status")}
          value={values.is_active}
          onChange={(e) => handleSelectChange("is_active", e.target.value)}
        />

        {/* Abonent görnüşi */}
        <FilterSelect
          field="is_enterprises"
          options={[
            { value: "true", label: t("enterprises") },
            { value: "false", label: t("individuals") },
          ]}
          placeholder={t("selectType")}
          icon={Building}
          label={t("subscriberType")}
          value={values.is_enterprises}
          onChange={(e) => handleSelectChange("is_enterprises", e.target.value)}
        />

        {/* Etrap - hemişe görünýär */}
        <FilterSelect
          field="etrap"
          options={
            etraps?.map((etrap) => ({
              value: etrap.id,
              label: `${t(etrap.etrap)} (${t(etrap.code)})`,
            })) || []
          }
          placeholder={t("selectEtrap")}
          icon={MapPin}
          label={t("etrap")}
          value={values.etrap}
          onChange={(e) => handleSelectChange("etrap", e.target.value)}
        />
      </div>

      {/* Arassala düwmesi */}
      {Object.values(values).some((val, key) => key !== "searchType" && val !== "") && (
        <motion.button
          type="button"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          onClick={clearAllFilters}
          className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-300 dark:text-red-400 hover:text-red-200 dark:hover:text-red-300 bg-white/5 dark:bg-gray-700 rounded-lg transition-colors duration-200 mt-4 border border-white/10 dark:border-gray-600"
        >
          <X size={14} />
          {t("resetFilters")}
        </motion.button>
      )}
    </div>
  );
};

export default UsersFilter;