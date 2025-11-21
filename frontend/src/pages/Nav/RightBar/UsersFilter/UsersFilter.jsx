import { useFormik } from "formik";
import { motion, AnimatePresence } from "framer-motion";
import { User, Phone, FileText, Building, Activity, Hash, MapPin, X, ChevronDown, Search } from "lucide-react";
import { useTranslation } from "react-i18next";
import { memo, useEffect, useCallback } from "react";
import { useNavigate, useLocation } from "react-router-dom";

// Исправленный SearchInput
const SearchInput = memo(({ field, placeholder, icon: Icon, label, value, onChange, hidden = false }) => {
  if (hidden) return null; // Полностью убираем из DOM вместо скрытия через CSS
  
  return (
    <motion.div 
      className="relative mb-3"
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: "auto" }}
      exit={{ opacity: 0, height: 0 }}
      transition={{ duration: 0.2 }}
    >
      <label htmlFor={field} className="block text-sm font-medium text-white mb-1">
        {label}
      </label>
      <div className="relative">
        <Icon size={16} className="absolute top-1/2 left-3 -translate-y-1/2 text-gray-400 pointer-events-none" />
        <input
          id={field}
          name={field}
          type="text"
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          className="w-full pl-10 pr-4 py-2 rounded-xl bg-white/10 backdrop-blur-sm text-white placeholder-gray-400 
                     focus:outline-none focus:ring-2 focus:ring-blue-400 
                     transition-all duration-200 text-sm border border-white/20
                     hover:bg-white/15"
        />
      </div>
    </motion.div>
  );
});

SearchInput.displayName = "SearchInput";

// Исправленный FilterSelect
const FilterSelect = memo(({ field, options, placeholder, icon: Icon, label, value, onChange, hidden = false }) => {
  if (hidden) return null; // Полностью убираем из DOM
  
  return (
    <motion.div 
      className="relative mb-3"
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: "auto" }}
      exit={{ opacity: 0, height: 0 }}
      transition={{ duration: 0.2 }}
    >
      <label htmlFor={field} className="block text-sm font-medium text-white mb-1">
        {label}
      </label>
      <div className="relative">
        <Icon size={14} className="absolute top-1/2 left-3 -translate-y-1/2 text-gray-400 pointer-events-none" />
        <select
          id={field}
          name={field}
          value={value}
          onChange={onChange}
          className="w-full pl-10 pr-8 py-2 rounded-xl bg-white/10 backdrop-blur-sm text-white 
                     focus:outline-none focus:ring-2 focus:ring-purple-400 
                     appearance-none cursor-pointer transition-all duration-200 text-sm 
                     border border-white/20 hover:bg-white/15"
        >
          <option value="" className="bg-gray-800 text-white">
            {placeholder}
          </option>
          {options.map((option) => (
            <option key={option.value} value={option.value} className="bg-gray-800 text-white">
              {option.label}
            </option>
          ))}
        </select>
        <ChevronDown size={16} className="absolute top-1/2 right-2 -translate-y-1/2 text-gray-400 pointer-events-none" />
      </div>
    </motion.div>
  );
});

FilterSelect.displayName = "FilterSelect";

const UsersFilter = ({ onSearch, onFilter, etraps }) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();

  const getInitialValuesFromURL = useCallback(() => {
    const searchParams = new URLSearchParams(location.search);
    
    return {
      searchType: searchParams.get('searchType') || "users",
      surname: searchParams.get('surname') || "",
      name: searchParams.get('name') || "",
      patronymic: searchParams.get('patronymic') || "",
      phone: searchParams.get('phone') || "",
      dogowor: searchParams.get('dogowor') || "",
      address: searchParams.get('address') || "",
      is_active: searchParams.get('is_active') || "",
      is_enterprises: searchParams.get('is_enterprises') || "",
      hb_type: searchParams.get('hb_type') || "",
      account: searchParams.get('account') || "",
      etrap: searchParams.get('etrap') || "",
    };
  }, [location.search]);

  const formik = useFormik({
    initialValues: getInitialValuesFromURL(),
    enableReinitialize: true,
    
    onSubmit: (values) => {
      updateURLWithValues(values);
      if (onFilter) onFilter(values);
    },
  });

  const { values, handleSubmit, setFieldValue, resetForm } = formik;

  const updateURLWithValues = useCallback((values) => {
    const params = new URLSearchParams();
    
    Object.entries(values).forEach(([key, val]) => {
      if (val !== "" && val !== null && val !== undefined) {
        params.append(key, val);
      }
    });

    params.set('page', '1');
    navigate(`?${params.toString()}`, { replace: true });
  }, [navigate]);

  useEffect(() => {
    const urlValues = getInitialValuesFromURL();
    
    const hasChanges = Object.keys(urlValues).some(key => 
      formik.values[key] !== urlValues[key]
    );

    if (hasChanges) {
      formik.setValues(urlValues);
    }
  }, [location.search, getInitialValuesFromURL]);

  const handleSelectChange = useCallback((field, value) => {
    setFieldValue(field, value);

    const updatedValues = { ...values, [field]: value };
    const params = new URLSearchParams(window.location.search);

    if (field === "is_enterprises") {
      if (value === "true") {
        updatedValues.surname = "";
        updatedValues.patronymic = "";
        params.delete("surname");
        params.delete("patronymic");
      } else if (value === "false") {
        updatedValues.account = "";
        updatedValues.hb_type = "";
        params.delete("account");
        params.delete("hb_type");
      }
    }

    if (field === "searchType") {
      if (value === "users") {
        updatedValues.dogowor = "";
        updatedValues.phone = "";
        updatedValues.address = "";
        params.delete("dogowor");
        params.delete("phone");
        params.delete("address");
      } else if (value === "phone") {
        updatedValues.surname = "";
        updatedValues.name = "";
        updatedValues.patronymic = "";
        updatedValues.dogowor = "";
        updatedValues.address = "";
        params.delete("surname");
        params.delete("name");
        params.delete("patronymic");
        params.delete("dogowor");
        params.delete("address");
      } else if (value === "dogowor") {
        updatedValues.surname = "";
        updatedValues.name = "";
        updatedValues.patronymic = "";
        updatedValues.phone = "";
        updatedValues.address = "";
        params.delete("surname");
        params.delete("name");
        params.delete("patronymic");
        params.delete("phone");
        params.delete("address");
      } else if (value === "address") {
        updatedValues.surname = "";
        updatedValues.name = "";
        updatedValues.patronymic = "";
        updatedValues.phone = "";
        updatedValues.dogowor = "";
        params.delete("surname");
        params.delete("name");
        params.delete("patronymic");
        params.delete("phone");
        params.delete("dogowor");
      }
    }

    Object.entries(updatedValues).forEach(([key, val]) => {
      if (formik.values[key] !== val) {
        setFieldValue(key, val);
      }
    });

    // updateURLWithValues(updatedValues);
  }, [values, setFieldValue, updateURLWithValues]);

  const clearAllFilters = useCallback(() => {
    const defaultValues = {
      searchType: "users",
      surname: "",
      name: "",
      patronymic: "",
      phone: "",
      dogowor: "",
      address: "",
      is_active: "",
      is_enterprises: "",
      hb_type: "",
      account: "",
      etrap: "",
    };
    
    resetForm({ values: defaultValues });
    const url = window.location.pathname;
    navigate(url, { replace: true });
    
    if (onFilter) onFilter(defaultValues);
  }, [resetForm, navigate, onFilter]);

  const showEnterpriseFields = values.is_enterprises === "true";

  const hasActiveFilters = Object.entries(values).some(
    ([key, value]) => key !== "searchType" && value !== "" && value !== null
  );

  return (
    <div className="space-y-4">
      {/* Кнопка поиска */}
      <motion.button
        type="button"
        onClick={handleSubmit}
        className="w-full flex items-center justify-center gap-2 px-4 py-3 
                   bg-blue-500 hover:bg-blue-600 text-white rounded-xl font-medium 
                   transition-all duration-200 shadow-lg hover:shadow-xl
                   focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2"
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
      >
        <Search size={18} />
        {t("search")}
      </motion.button>

      <h3 className="text-lg font-semibold mb-4 text-white">{t("filters")}</h3>

      {/* Тип поиска */}
      <div className="relative mb-4">
        <label htmlFor="searchType" className="block text-sm font-medium text-white mb-1">
          {t("searchType")}
        </label>
        <div className="relative">
          <User size={14} className="absolute top-1/2 left-3 -translate-y-1/2 text-gray-400 pointer-events-none" />
          <select
            id="searchType"
            name="searchType"
            value={values.searchType}
            onChange={(e) => handleSelectChange("searchType", e.target.value)}
            className="w-full pl-10 pr-8 py-2 rounded-xl bg-white/10 backdrop-blur-sm text-white 
                       focus:outline-none focus:ring-2 focus:ring-blue-400 
                       appearance-none cursor-pointer transition-all duration-200 text-sm 
                       border border-white/20 hover:bg-white/15"
          >
            <option value="users" className="bg-gray-800 text-white">{t("people")}</option>
            <option value="phone" className="bg-gray-800 text-white">{t("phone")}</option>
            <option value="dogowor" className="bg-gray-800 text-white">{t("contract")}</option>
            <option value="address" className="bg-gray-800 text-white">{t("address")}</option>
          </select>
          <ChevronDown size={16} className="absolute top-1/2 right-2 -translate-y-1/2 text-gray-400 pointer-events-none" />
        </div>
      </div>

      {/* Поля поиска с AnimatePresence для плавной анимации */}
      <AnimatePresence mode="wait">
        <div className="mb-4">
          {/* Фамилия / Хоз-Бюджет */}
          {values.searchType === "users" && !showEnterpriseFields && (
            <SearchInput
              key="surname"
              field="surname"
              placeholder={t("enterSurname")}
              icon={User}
              label={t("surname")}
              value={values.surname}
              onChange={(e) => setFieldValue("surname", e.target.value)}
            />
          )}
          {values.searchType === "users" && showEnterpriseFields && (
            <FilterSelect
              key="hb_type"
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
            />
          )}

          {/* Имя */}
          {values.searchType === "users" && (
            <SearchInput
              key="name"
              field="name"
              placeholder={t("enterName")}
              icon={User}
              label={t("name")}
              value={values.name}
              onChange={(e) => setFieldValue("name", e.target.value)}
            />
          )}

          {/* Отчество / Счет */}
          {values.searchType === "users" && !showEnterpriseFields && (
            <SearchInput
              key="patronymic"
              field="patronymic"
              placeholder={t("enterPatronymic")}
              icon={User}
              label={t("patronymic")}
              value={values.patronymic}
              onChange={(e) => setFieldValue("patronymic", e.target.value)}
            />
          )}
          {values.searchType === "users" && showEnterpriseFields && (
            <SearchInput
              key="account"
              field="account"
              placeholder={t("enterAccount")}
              icon={Hash}
              label={t("account")}
              value={values.account}
              onChange={(e) => setFieldValue("account", e.target.value)}
            />
          )}

          {/* Телефон */}
          {values.searchType === "phone" && (
            <SearchInput
              key="phone"
              field="phone"
              placeholder={t("enterPhone")}
              icon={Phone}
              label={t("phoneNumber")}
              value={values.phone}
              onChange={(e) => setFieldValue("phone", e.target.value)}
            />
          )}

          {/* Договор */}
          {values.searchType === "dogowor" && (
            <SearchInput
              key="dogowor"
              field="dogowor"
              placeholder={t("enterContract")}
              icon={FileText}
              label={t("contractNumber")}
              value={values.dogowor}
              onChange={(e) => setFieldValue("dogowor", e.target.value)}
            />
          )}
          
          {/* Адрес */}
          {values.searchType === "address" && (
            <SearchInput
              key="address"
              field="address"
              placeholder={t("enterAddress")}
              icon={MapPin}
              label={t("Address")}
              value={values.address}
              onChange={(e) => setFieldValue("address", e.target.value)}
            />
          )}
        </div>
      </AnimatePresence>

      {/* Основные фильтры */}
      <div className="space-y-2 pt-4 border-t border-white/20">
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

      {/* Кнопка сброса */}
      <AnimatePresence>
        {hasActiveFilters && (
          <motion.button
            type="button"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            onClick={clearAllFilters}
            className="w-full flex items-center justify-center gap-2 px-3 py-2 text-sm 
                       text-red-300 hover:text-red-200 bg-white/5 hover:bg-white/10 
                       rounded-lg transition-all duration-200 mt-4 border border-white/10"
          >
            <X size={14} />
            {t("resetFilters")}
          </motion.button>
        )}
      </AnimatePresence>
    </div>
  );
};

export default UsersFilter;