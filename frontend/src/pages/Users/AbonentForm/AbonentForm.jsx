import { useTranslation } from "react-i18next";
import { Formik, Form, Field, useFormikContext } from "formik";
import { motion, AnimatePresence } from "framer-motion";
import { UserPlus, Save, Building, User, MapPin, Home, FileText, Copy, ArrowLeft, Loader2, Phone, X, Calendar, Power, PowerOff, Info, MessageCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useState, useCallback, useEffect, useContext } from "react";
import MiniButton from "../../UI/MiniButton";
import { useEtraps } from "../../../context/EtrapContext";
import { useService } from "../../../context/ServiceContext";
import * as Yup from "yup";
import myAxios from "../../../services/myAxios";
import { useNotifications } from "../../../components/Notifications";
import UniqueAbonentChecker from "./UniqueAbonentChecker";
import UniqueDogoworChecker from "./UniqueDogoworChecker";
import { useLocation } from "react-router-dom";
import FastFillDefaultFields from "./Test/FastFillDefaultFields";
import { UserContext } from "../../Auth/UserContext";

// Функция для расчета общей суммы выбранных услуг
const calculateTotalPrice = (selectedServices, allServices) => {
  if (!selectedServices || !allServices) return 0;
  return selectedServices
    .reduce((total, serviceId) => {
      const service = allServices.find((s) => s.id === serviceId);
      return total + (service?.price || 0);
    }, 0)
    .toFixed(2);
};

// Функция для расчета общей суммы (абонплата + услуги + установка)
const calculateGrandTotal = (values, servicesData) => {
  const servicesTotal = calculateTotalPrice(values.services, servicesData);
  const abonplata = parseFloat(values.abonplata) || 0;
  const installationFee = values.nach_for_install ? parseFloat(values.install_price) || 0 : 0;

  return (parseFloat(servicesTotal) + abonplata + installationFee).toFixed(2);
};

// Компонент для кнопки Save с доступом к Formik контексту
const SaveButton = ({ loadingSave, setLoadingSave, hasDuplicate, hasDuplicateDogowor, disabled }) => {
  const { submitForm, validateForm, setTouched } = useFormikContext();
  const { t } = useTranslation();
  const { notificationError } = useNotifications();

  const handleSave = async () => {
    // Помечаем ВСЕ поля как touched чтобы показать все ошибки
    const allFields = ["number", "mobile_number", "surname", "name", "patronymic", "address", "etrap", "dogowor", "account", "hb_type", "activate_at", "abonplata"];

    if (hasDuplicate) {
      notificationError(t("Cannot save - duplicate abonent found"), t("Error"));
      return;
    }

    if (hasDuplicateDogowor) {
      notificationError(t("Cannot save - duplicate dogowor found"), t("Error"));
      return;
    }

    const touchedFields = {};
    allFields.forEach((field) => {
      touchedFields[field] = true;
    });

    setTouched(touchedFields);

    // Валидируем форму после установки touched
    const errors = await validateForm();

    // Если есть ошибки, не отправляем форму и скроллим к первой ошибке
    if (Object.keys(errors).length > 0) {
      const firstErrorField = Object.keys(errors)[0];
      const element = document.querySelector(`[name="${firstErrorField}"]`);
      element?.scrollIntoView({
        behavior: "smooth",
        block: "center",
      });
      return;
    }

    // Если ошибок нет, отправляем форму
    setLoadingSave(true);
    await submitForm();
    setLoadingSave(false);
  };

  return (
    <MiniButton
      text={useTranslation().t("Save")}
      iconDefault={<Save size={20} />}
      iconActive={<Loader2 size={20} />}
      loading={loadingSave}
      onClick={handleSave}
      disabled={hasDuplicate || hasDuplicateDogowor || disabled}
    />
  );
};

// Компонент для поля с возможностью очистки
const ClearableField = ({ name, placeholder, setFieldValue, handlePaste, handleKeyDown, className, values, isAdmin, disabled }) => {
  const handleClear = () => {
    if (!disabled) {
      setFieldValue(name, "");
    }
  };

  return (
    <div className="relative flex-1">
      <Field
        name={name}
        placeholder={placeholder}
        autoComplete="off"
        className={className}
        onPaste={isAdmin ? undefined : (e) => handlePaste(e, setFieldValue, name)}
        onKeyDown={isAdmin ? undefined : handleKeyDown}
        readOnly={!isAdmin || disabled} // Добавляем disabled в условие
        disabled={disabled}
      />
      {values[name] && !disabled && (
        <button
          type="button"
          onClick={handleClear}
          className="absolute right-3 top-1/2 transform -translate-y-1/2 p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors duration-200"
        >
          <X size={16} />
        </button>
      )}
    </div>
  );
};

// Компонент для управления датами подключения/отключения услуги
const ServiceDateField = ({ serviceId, serviceName, values, setFieldValue, isCreating, existingServiceDates, initialValues, disabled }) => {
  const { t } = useTranslation();

  // Определяем isDisabled здесь - услуга disabled если она уже есть у абонента в БД
  const isDisabled = !isCreating && initialValues.services?.includes(serviceId);

  // Получаем текущие даты для услуги
  const currentActivateDate = isCreating ? values.activate_at : values.service_dates?.[serviceId]?.activate_at || values.activate_at;
  const currentDeactivateDate = values.service_dates?.[serviceId]?.deactivate_at || "";
  const currentComment = values.service_dates?.[serviceId]?.comment || "";

  // Проверяем, была ли услуга ранее активна
  const wasServiceActive = existingServiceDates?.[serviceId]?.activate_at;
  const isServiceDeactivated = currentDeactivateDate && currentDeactivateDate !== "";

  // Проверяем, является ли услуга новой (не было в initialValues.services из БД)
  const isNewService = !isCreating && !initialValues.services?.includes(serviceId);

  return (
    <div className="mt-3 p-3 bg-white dark:bg-gray-600 rounded-lg border border-gray-200 dark:border-gray-500">
      <div className="flex items-center gap-2 mb-2">
        <FileText size={16} className="text-blue-500 dark:text-blue-400" />
        <span className="font-medium text-gray-700 dark:text-gray-300">{serviceName}</span>
        {isNewService && <span className="text-xs bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300 px-2 py-1 rounded">{t("New service")}</span>}
        {isDisabled && <span className="text-xs bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300 px-2 py-1 rounded">{t("Existing service")}</span>}
      </div>

      {/* Дата подключения - ДЛЯ УЖЕ ПОДКЛЮЧЕННЫХ УСЛУГ DISABLED */}
      <div className="flex items-center gap-3 mb-2">
        <Power size={16} className="text-green-500 dark:text-green-400" />
        <label className="text-sm text-gray-700 dark:text-gray-300 min-w-[140px]">{t("Activation date")}:</label>
        <Field
          name={`service_dates.${serviceId}.activate_at`}
          type="datetime-local"
          value={currentActivateDate || ""}
          onChange={(e) => {
            if (!disabled) {
              // Добавить проверку
              if (isCreating) {
                setFieldValue("activate_at", e.target.value);
              } else {
                setFieldValue(`service_dates.${serviceId}.activate_at`, e.target.value);
              }
            }
          }}
          disabled={isDisabled || disabled}
          className={`flex-1 px-3 py-1 text-sm rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-purple-500 ${
            isDisabled || disabled ? "bg-gray-100 dark:bg-gray-600 cursor-not-allowed opacity-60" : ""
          }`}
        />
        {!isCreating && !isDisabled && !disabled && (
          <button
            type="button"
            onClick={() => setFieldValue(`service_dates.${serviceId}.activate_at`, values.activate_at)}
            className="px-2 py-1 text-xs bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 rounded hover:bg-blue-200 dark:hover:bg-blue-800 transition-colors"
          >
            {t("Reset to main date")}
          </button>
        )}
      </div>

      {/* Дата отключения - показываем только для существующих подключенных услуг */}
      {!isCreating && isDisabled && (
        <div className="flex items-center gap-3 mb-2">
          <PowerOff size={16} className="text-red-500 dark:text-red-400" />
          <label className="text-sm text-gray-700 dark:text-gray-300 min-w-[140px]">{t("Deactivation date")}:</label>
          <Field
            name={`service_dates.${serviceId}.deactivate_at`}
            type="datetime-local"
            value={currentDeactivateDate || ""}
            onChange={(e) => setFieldValue(`service_dates.${serviceId}.deactivate_at`, e.target.value)}
            className="flex-1 px-3 py-1 text-sm rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-purple-500"
          />
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setFieldValue(`service_dates.${serviceId}.deactivate_at`, "")}
              className="px-2 py-1 text-xs bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
            >
              {t("Clear")}
            </button>
            {wasServiceActive && !isServiceDeactivated && (
              <button
                type="button"
                onClick={() => {
                  const now = new Date();
                  const currentDateTime = now.toISOString().slice(0, 16);
                  setFieldValue(`service_dates.${serviceId}.deactivate_at`, currentDateTime);
                }}
                className="px-2 py-1 text-xs bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-300 rounded hover:bg-red-200 dark:hover:bg-red-800 transition-colors"
              >
                {t("Deactivate now")}
              </button>
            )}
          </div>
        </div>
      )}

      {/* ⭐⭐⭐ КОММЕНТАРИЙ ДЛЯ УСЛУГИ ⭐⭐⭐ */}
      <div className="flex items-start gap-3 mt-2">
        <MessageCircle size={16} className="text-gray-500 dark:text-gray-400 mt-1" />
        <label className="text-sm text-gray-700 dark:text-gray-300 min-w-[140px]">{t("Service comment")}:</label>
        <div className="flex-1">
          <Field
            as="textarea"
            name={`service_dates.${serviceId}.comment`}
            placeholder={t("Enter reason for activation/deactivation...")}
            value={currentComment}
            rows={2}
            className="w-full px-3 py-2 text-sm rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-purple-500 resize-vertical"
          />
          <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">{t("Optional: specify the reason for service activation or deactivation")}</div>
        </div>
      </div>

      {/* Статус услуги */}
      {!isCreating && (
        <div className="mt-2 text-xs">
          {isServiceDeactivated ? (
            <span className="text-red-600 dark:text-red-400 flex items-center gap-1">
              <PowerOff size={12} />
              {t("Service will be deactivated")} {new Date(currentDeactivateDate).toLocaleString()}
            </span>
          ) : wasServiceActive ? (
            <span className="text-green-600 dark:text-green-400 flex items-center gap-1">
              <Power size={12} />
              {t("Service is active")}
              {currentActivateDate && ` (activated: ${new Date(currentActivateDate).toLocaleString()})`}
            </span>
          ) : isNewService ? (
            <span className="text-blue-600 dark:text-blue-400 flex items-center gap-1">
              <Calendar size={12} />
              {t("New service will be activated")} {currentActivateDate ? new Date(currentActivateDate).toLocaleString() : ""}
            </span>
          ) : (
            <span className="text-blue-600 dark:text-blue-400 flex items-center gap-1">
              <Calendar size={12} />
              {t("Service will be activated")} {currentActivateDate ? new Date(currentActivateDate).toLocaleString() : ""}
            </span>
          )}
        </div>
      )}

      {/* Информационное сообщение для существующих услуг */}
      {!isCreating && isDisabled && <div className="mt-2 text-xs text-blue-600 dark:text-blue-400">{t("For existing services you can only set deactivation date")}</div>}
    </div>
  );
};

const AbonentForm = () => {
  const { t } = useTranslation();
  const location = useLocation();
  const { userInfo } = useContext(UserContext);
  const isAdmin = userInfo?.groups?.includes("admin");
  const userGroups = userInfo?.groups;

  const isViewer = userGroups?.includes("viewer");
  const isFormDisabled = isViewer;


  // console.log("userGroups", userGroups);
  // const canUpdateAkdepe = userInfo?.groups?.includes("admin");
  console.log("userGroups", userGroups);
  console.log("isFormDisabled", isFormDisabled);

  const [initialValues, setInitialValues] = useState({
    user_id: null,
    number: "",
    mobile_number: "",
    surname: "",
    name: "",
    patronymic: "",
    address: "",
    etrap: "",
    is_enterprises: false,
    account: "",
    hb_type: "",
    dogowor_id: null,
    dogowor: "",
    comment: "",
    activate_at: "",
    deactivate_at: "",
    abonplata: "0.00",
    services: [],
    nach_for_install: false,
    install_price: "80",
    service_dates: {},
    already_deactivated: false,
  });

  // Определяем, создаем мы нового абонента или редактируем существующего
  const isCreating = !initialValues.user_id;

  // Состояние для хранения исходных данных об услугах (при редактировании)
  const [existingServiceDates, setExistingServiceDates] = useState({});

  useEffect(() => {
    const dogoworId = location.state?.dogoworId;
    if (!dogoworId) return;

    const fetchData = async () => {
      try {
        const res = await myAxios.get("core/get-user-for-update-telefoniya", {
          params: { dogoworId: dogoworId },
        });
        const { user, dogowor } = res.data;

        console.log("user", user);

        // Форматируем даты услуг из существующих данных
        const formattedServiceDates = {};
        if (user.service_dates) {
          Object.keys(user.service_dates).forEach((serviceId) => {
            const serviceData = user.service_dates[serviceId];
            formattedServiceDates[serviceId] = {
              activate_at: serviceData.activate_at ? new Date(serviceData.activate_at).toISOString().slice(0, 16) : "",
              deactivate_at: serviceData.deactivate_at ? new Date(serviceData.deactivate_at).toISOString().slice(0, 16) : "",
              comment: serviceData.comment || "", // ← ДОБАВЬТЕ КОММЕНТАРИЙ
            };
          });
        }

        console.log("formattedServiceDates", formattedServiceDates);

        setExistingServiceDates(formattedServiceDates);

        setInitialValues({
          user_id: user.id || null,
          number: user.number || "",
          mobile_number: user.mobile_number || "",
          surname: user.surname || "",
          name: user.name || "",
          patronymic: user.patronymic || "",
          address: user.address || "",
          etrap: user.etrap || "",
          is_enterprises: user.is_enterprises || false,
          account: user.account || "",
          hb_type: user.hb_type || "",
          dogowor_id: dogowor.id || null,
          dogowor: dogowor.dogowor || "",
          comment: dogowor.comment || "",
          activate_at: dogowor.activate_at ? new Date(dogowor.activate_at).toISOString().slice(0, 16) : "",
          deactivate_at: dogowor.deactivate_at ? new Date(dogowor.deactivate_at).toISOString().slice(0, 16) : "",
          abonplata: user.abonplata || "0.00",
          services: user.services || [],
          nach_for_install: false,
          install_price: "80",
          service_dates: formattedServiceDates,
          already_deactivated: dogowor.already_deactivated,
        });
      } catch (err) {
        console.error("Cannot get user data", err);
      }
    };

    fetchData();
  }, [location.state]);

  const { notificationSuccess, notificationError } = useNotifications();
  const navigate = useNavigate();
  const [loadingBack, setLoadingBack] = useState(false);
  const [loadingSave, setLoadingSave] = useState(false);
  const { etraps, loading } = useEtraps();
  const [hasDuplicate, setHasDuplicate] = useState(false);
  const [hasDuplicateDogowor, setHasDuplicateDogowor] = useState(false);

  const filtered_etraps = isAdmin ? etraps : etraps.filter((e) => userGroups.includes(e.etrap)).map((e) => ({ id: e.id, etrap: e.etrap, code: e.code }));

  const { services, loadingService } = useService();

  // Валидационная схема
  const validationSchema = Yup.object({
    number: Yup.string()
      .required(t("Number is required"))
      .matches(/^\d{5}$/, t("Number must be exactly 5 digits")),
    etrap: Yup.string().required(t("Etrap is required")),
    abonplata: Yup.number().typeError(t("Abonplata must be a valid number")).min(0, t("Abonplata cannot be negative")).required(t("Abonplata is required")),
    dogowor: Yup.string()
      .required(t("Dogowor is required"))
      .test("dogowor-match", t("Dogowor must end with the number"), function (value) {
        const { number } = this.parent;
        return value.includes(String(number));
      })
      .test("dogowor-code-match", t("Dogowor dont have etrap code"), function (value) {
        const { etrap } = this.parent;
        if (etrap) {
          const choosed_etrap = etraps.find((e) => parseFloat(e.id) === parseFloat(etrap));
          return String(value).includes(String(choosed_etrap.code));
        }
      }),
    name: Yup.string().when("is_enterprises", {
      is: true,
      then: (schema) => schema.required(t("Enterprises name is required")),
      otherwise: (schema) => schema.required(t("Name is required")),
    }),
    surname: Yup.string().when("is_enterprises", {
      is: false,
      then: (schema) => schema.required(t("Surname is required")),
      otherwise: (schema) => schema.notRequired(),
    }),
    account: Yup.string().when("is_enterprises", {
      is: true,
      then: (schema) => schema.required(t("Account is required for enterprises")),
      otherwise: (schema) => schema.notRequired(),
    }),
    hb_type: Yup.string().when("is_enterprises", {
      is: true,
      then: (schema) => schema.required(t("HB type is required for enterprises")),
      otherwise: (schema) => schema.notRequired(),
    }),
    activate_at: Yup.string().required(t("Activate_at is required")),
  });

  const handlePaste = (e, setFieldValue, fieldName) => {
    if (!isAdmin) {
      e.preventDefault();
      const pastedText = e.clipboardData.getData("text");
      setFieldValue(fieldName, pastedText);
    }
  };

  const handleKeyDown = (e) => {
    const allowedKeys = ["Backspace", "Delete", "ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown", "Tab", "Home", "End", "Control", "Meta", "Alt"];
    if (e.ctrlKey || e.metaKey) return;
    if (!allowedKeys.includes(e.key)) e.preventDefault();
  };

  const formClass =
    "w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200";
  const pasteFieldClass = `${formClass} cursor-copy focus:ring-blue-500 placeholder-gray-500 dark:placeholder-gray-400 pr-10`;
  const sectionTitleClass = "text-lg font-semibold text-gray-800 dark:text-gray-200 flex items-center gap-2";
  const labelClass = "text-sm font-medium text-gray-700 dark:text-gray-300 min-w-[140px]";

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900/50 p-2">
      <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded-xl shadow-md max-w-7xl mx-auto relative">
        <Formik
          enableReinitialize={true}
          initialValues={initialValues}
          validationSchema={validationSchema}
          onSubmit={async (values, { resetForm, setSubmitting }) => {
            if (isViewer) {
              notificationError(t("Viewers cannot save changes"), t("Access Denied"));
              setSubmitting(false);
              return;
            }
            try {
              if (hasDuplicate) {
                notificationError(t("Abonent with this number already exists"), t("Cannot create abonent"));
                setSubmitting(false);
                return;
              }

              if (hasDuplicateDogowor) {
                notificationError(t("Abonent with this dogowor already exists"), t("Cannot create abonent"));
                setSubmitting(false);
                return;
              }

              // Подготавливаем данные для отправки
              const submitData = {
                ...values,
                abonplata: parseFloat(values.abonplata),
                services: values.services || [],
                nach_for_install: values.nach_for_install,
                install_price: values.nach_for_install ? parseFloat(values.install_price) : null,
                // Передаем даты услуг только при редактировании
                ...(isCreating
                  ? {}
                  : {
                      service_dates: values.service_dates,
                      existing_service_dates: existingServiceDates,
                    }),
              };

              const res = await myAxios.post("core/save-abonent/", submitData);
              notificationSuccess(t(res.data.message), t("success"));
            } catch (err) {
              console.error("Error creating abonent:", err.response?.data?.error || err.message);
              notificationError(t(err.response?.data?.error || "Unknown error"), t("error"));
            } finally {
              setSubmitting(false);
            }
          }}
        >
          {({ values, isSubmitting, setFieldValue, errors, touched }) => {
            return (
              <>
                <UniqueAbonentChecker values={values} setHasDuplicate={setHasDuplicate} editedUserId={values.user_id} />
                <UniqueDogoworChecker values={values} setHasDuplicateDogowor={setHasDuplicateDogowor} editedDogoworId={values.dogowor_id} />

                <div className="flex items-center justify-between mb-4">
                  <motion.div initial={{ scale: 0, rotate: -180 }} animate={{ scale: 1, rotate: 0 }} transition={{ type: "spring", stiffness: 200, damping: 15 }}>
                    <div className="p-4 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-3xl shadow-lg">
                      <UserPlus className="w-8 h-8 text-white" />
                    </div>
                  </motion.div>

                  <div className="flex gap-2">
                    <MiniButton
                      text={t("Back to list")}
                      iconDefault={<ArrowLeft size={20} />}
                      iconActive={<Loader2 size={20} />}
                      loading={loadingBack}
                      onClick={async () => {
                        setLoadingBack(true);
                        setLoadingBack(false);
                        navigate(-1);
                      }}
                    />
                    <SaveButton loadingSave={loadingSave} setLoadingSave={setLoadingSave} hasDuplicate={hasDuplicate} hasDuplicateDogowor={hasDuplicateDogowor} disabled={isFormDisabled} />
                    {isAdmin && <FastFillDefaultFields setFieldValue={setFieldValue} values={values} />}
                  </div>
                </div>

                <Form className="space-y-6">
                  {/* Добавляем overlay для disabled состояния */}
                  {isFormDisabled && (
                    <div className="absolute inset-0 bg-gray-500 bg-opacity-50 z-10 rounded-xl flex items-center justify-center">
                      <div className="bg-white dark:bg-gray-700 p-4 rounded-lg shadow-lg">
                        <p className="text-gray-700 dark:text-gray-300 font-medium">{t("View mode only - no editing allowed")}</p>
                      </div>
                    </div>
                  )}

                  {/* Checkboxes Section */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="flex flex-col sm:flex-row gap-6 p-4 bg-gray-50 dark:bg-gray-700 rounded-2xl relative"
                  >
                    {[{ name: "is_enterprises", label: t("Is enterprise"), icon: <Building className="w-4 h-4" /> }].map(({ name, label, icon }) => (
                      <label key={name} className={`flex items-center gap-3 ${isFormDisabled ? "cursor-not-allowed opacity-60" : "cursor-pointer group"}`}>
                        <div className="relative">
                          <Field
                            type="checkbox"
                            name={name}
                            className="sr-only"
                            disabled={isFormDisabled} // Добавляем disabled
                          />
                          <div
                            className={`w-5 h-5 border-2 border-gray-400 rounded-md group-hover:border-${
                              name === "is_enterprises" ? "purple" : "green"
                            }-500 transition-colors duration-200 flex items-center justify-center`}
                          >
                            <AnimatePresence>
                              {values[name] && (
                                <motion.div
                                  initial={{ scale: 0 }}
                                  animate={{ scale: 1 }}
                                  exit={{ scale: 0 }}
                                  className={`w-3 h-3 bg-${name === "is_enterprises" ? "purple" : "green"}-600 rounded-sm`}
                                />
                              )}
                            </AnimatePresence>
                          </div>
                        </div>
                        <span className="text-gray-700 dark:text-gray-300 font-medium flex items-center gap-2">
                          {icon}
                          {label}
                        </span>
                      </label>
                    ))}
                  </motion.div>

                  {/* Basic Information */}
                  <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="space-y-4">
                    <div className="grid grid-cols-1 gap-4">
                      {/* Number - обязательное поле */}
                      <div className="flex items-center gap-4">
                        <label className={labelClass}>{t("Number")} *</label>
                        <div className="flex-1">
                          <Field
                            name="number"
                            placeholder={t("Enter number")}
                            autoComplete="off"
                            disabled={isFormDisabled} // Добавляем disabled
                            className={`${formClass} ${errors.number && touched.number ? "border-red-500 focus:ring-red-500" : ""} ${hasDuplicate ? "border-red-500" : ""} ${
                              isFormDisabled ? "bg-gray-100 dark:bg-gray-600 cursor-not-allowed opacity-60" : ""
                            }`}
                          />
                          {errors.number && touched.number && <div className="text-red-500 text-xs mt-1">{errors.number}</div>}
                          {hasDuplicate && !errors.number && (
                            <div className="text-red-500 text-xs mt-1 flex items-center gap-1">
                              <X className="w-3 h-3" />
                              {t("Active abonent with this number already exists")}
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Cell Number */}
                      <div className="flex items-center gap-4">
                        <label className={`${labelClass} flex items-center gap-2`}>
                          {t("Cell Number")}
                          {!isFormDisabled && ( // Показываем только если не disabled
                            <div className="flex items-center gap-1 px-2 py-1 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                              <Copy className="w-3 h-3 text-blue-600 dark:text-blue-400" />
                              <span className="text-xs text-blue-600 dark:text-blue-400">Ctrl+V</span>
                            </div>
                          )}
                        </label>
                        <ClearableField
                          name="mobile_number"
                          placeholder={t("Paste cell number")}
                          setFieldValue={setFieldValue}
                          handlePaste={handlePaste}
                          handleKeyDown={handleKeyDown}
                          className={`${pasteFieldClass} ${isFormDisabled ? "bg-gray-100 dark:bg-gray-600 cursor-not-allowed opacity-60" : ""}`}
                          values={values}
                          isAdmin={isAdmin}
                          disabled={isFormDisabled}
                        />
                      </div>

                      {values.is_enterprises ? (
                        <div className="flex items-center gap-4">
                          {/* Name для предприятий */}
                          <label className={`${labelClass} flex items-center gap-2`}>
                            {t("Enterprises name")} *
                            <div className="flex items-center gap-1 px-2 py-1 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                              <Copy className="w-3 h-3 text-blue-600 dark:text-blue-400" />
                              <span className="text-xs text-blue-600 dark:text-blue-400">Ctrl+V</span>
                            </div>
                          </label>
                          <div className="flex-1">
                            <ClearableField
                              name="name"
                              placeholder={t("Paste enterprises name")}
                              setFieldValue={setFieldValue}
                              handlePaste={handlePaste}
                              handleKeyDown={handleKeyDown}
                              className={`${pasteFieldClass} ${errors.name && touched.name ? "border-red-500 focus:ring-red-500" : ""}`}
                              values={values}
                              isAdmin={isAdmin}
                              disabled={isFormDisabled}
                            />
                            {errors.name && touched.name && <div className="text-red-500 text-xs mt-1">{errors.name}</div>}
                          </div>
                        </div>
                      ) : (
                        <>
                          {/* Surname */}
                          <div className="flex items-center gap-4">
                            <label className={`${labelClass} flex items-center gap-2`}>
                              {t("Surname")} *
                              <div className="flex items-center gap-1 px-2 py-1 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                                <Copy className="w-3 h-3 text-blue-600 dark:text-blue-400" />
                                <span className="text-xs text-blue-600 dark:text-blue-400">Ctrl+V</span>
                              </div>
                            </label>
                            <div className="flex-1">
                              <ClearableField
                                name="surname"
                                placeholder={t("Paste surname")}
                                setFieldValue={setFieldValue}
                                handlePaste={handlePaste}
                                handleKeyDown={handleKeyDown}
                                className={`${pasteFieldClass} ${errors.surname && touched.surname ? "border-red-500 focus:ring-red-500" : ""}`}
                                values={values}
                                isAdmin={isAdmin}
                                disabled={isFormDisabled}
                              />
                              {errors.surname && touched.surname && <div className="text-red-500 text-xs mt-1">{errors.surname}</div>}
                            </div>
                          </div>

                          {/* Name для физических лиц */}
                          <div className="flex items-center gap-4">
                            <label className={`${labelClass} flex items-center gap-2`}>
                              {t("Name")} *
                              <div className="flex items-center gap-1 px-2 py-1 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                                <Copy className="w-3 h-3 text-blue-600 dark:text-blue-400" />
                                <span className="text-xs text-blue-600 dark:text-blue-400">Ctrl+V</span>
                              </div>
                            </label>
                            <div className="flex-1">
                              <ClearableField
                                name="name"
                                placeholder={t("Paste name")}
                                setFieldValue={setFieldValue}
                                handlePaste={handlePaste}
                                handleKeyDown={handleKeyDown}
                                className={`${pasteFieldClass} ${errors.name && touched.name ? "border-red-500 focus:ring-red-500" : ""}`}
                                values={values}
                                isAdmin={isAdmin}
                                disabled={isFormDisabled}
                              />
                              {errors.name && touched.name && <div className="text-red-500 text-xs mt-1">{errors.name}</div>}
                            </div>
                          </div>

                          {/* Patronymic */}
                          <div className="flex items-center gap-4">
                            <label className={`${labelClass} flex items-center gap-2`}>
                              {t("Patronymic")}
                              <div className="flex items-center gap-1 px-2 py-1 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                                <Copy className="w-3 h-3 text-blue-600 dark:text-blue-400" />
                                <span className="text-xs text-blue-600 dark:text-blue-400">Ctrl+V</span>
                              </div>
                            </label>
                            <ClearableField
                              name="patronymic"
                              placeholder={t("Paste patronymic")}
                              setFieldValue={setFieldValue}
                              handlePaste={handlePaste}
                              handleKeyDown={handleKeyDown}
                              className={pasteFieldClass}
                              values={values}
                              isAdmin={isAdmin}
                              disabled={isFormDisabled}
                            />
                          </div>
                        </>
                      )}
                    </div>
                  </motion.div>

                  {/* Location Information */}
                  <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }} className="space-y-4">
                    <div className="grid grid-cols-1 gap-4">
                      {/* Etrap - обязательное поле */}
                      <div className="flex items-center gap-4">
                        <label className={labelClass}>{t("Select Etrap")} *</label>
                        <div className="flex-1">
                          {loading ? (
                            <div className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-gray-100 dark:bg-gray-600 animate-pulse">
                              <div className="h-4 bg-gray-300 dark:bg-gray-500 rounded"></div>
                            </div>
                          ) : (
                            <>
                              <Field
                                as="select"
                                name="etrap"
                                disabled={isFormDisabled}
                                className={`${formClass} appearance-none ${errors.etrap && touched.etrap ? "border-red-500 focus:ring-red-500" : ""} ${
                                  isFormDisabled ? "bg-gray-100 dark:bg-gray-600 cursor-not-allowed opacity-60" : "cursor-pointer"
                                }`}
                              >
                                <option value="">{t("Select etrap")}</option>
                                {filtered_etraps?.map((etrap) => (
                                  <option key={etrap.id} value={etrap.id}>
                                    {t(etrap.etrap)} ({etrap.code})
                                  </option>
                                ))}
                              </Field>
                              {errors.etrap && touched.etrap && <div className="text-red-500 text-xs mt-1">{errors.etrap}</div>}
                            </>
                          )}
                        </div>
                      </div>

                      {/* Address */}
                      <div className="flex items-center gap-4">
                        <label className={`${labelClass} flex items-center gap-2`}>
                          {t("Address")}
                          <div className="flex items-center gap-1 px-2 py-1 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                            <Copy className="w-3 h-3 text-blue-600 dark:text-blue-400" />
                            <span className="text-xs text-blue-600 dark:text-blue-400">Ctrl+V</span>
                          </div>
                        </label>
                        <ClearableField
                          name="address"
                          placeholder={t("Paste full address")}
                          setFieldValue={setFieldValue}
                          handlePaste={handlePaste}
                          handleKeyDown={handleKeyDown}
                          className={pasteFieldClass}
                          values={values}
                          isAdmin={isAdmin}
                          disabled={isFormDisabled}
                        />
                      </div>
                    </div>
                  </motion.div>

                  {/* Contract Information */}
                  <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="space-y-4">
                    <div className="grid grid-cols-1 gap-4">
                      {/* Dogowor - обязательное поле */}
                      <div className="flex items-center gap-4">
                        <label className={`${labelClass} flex items-center gap-2`}>
                          {t("Dogowor")} *
                          <div className="flex items-center gap-1 px-2 py-1 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                            <Copy className="w-3 h-3 text-blue-600 dark:text-blue-400" />
                            <span className="text-xs text-blue-600 dark:text-blue-400">Ctrl+V</span>
                          </div>
                        </label>
                        <div className="flex-1">
                          <ClearableField
                            name="dogowor"
                            placeholder={t("Paste dogowor number")}
                            setFieldValue={setFieldValue}
                            handlePaste={handlePaste}
                            handleKeyDown={handleKeyDown}
                            className={`${pasteFieldClass} ${errors.dogowor && touched.dogowor ? "border-red-500 focus:ring-red-500" : ""} ${hasDuplicateDogowor ? "border-red-500" : ""} ${
                              isFormDisabled ? "bg-gray-100 dark:bg-gray-600 cursor-not-allowed opacity-60" : ""
                            }`}
                            values={values}
                            isAdmin={isAdmin}
                            disabled={isFormDisabled}
                          />
                          {errors.dogowor && touched.dogowor && <div className="text-red-500 text-xs mt-1">{errors.dogowor}</div>}
                          {hasDuplicateDogowor && !errors.dogowor && (
                            <div className="text-red-500 text-xs mt-1 flex items-center gap-1">
                              <X className="w-3 h-3" />
                              {t("Abonent with this dogowor already exists")}
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* Activate At */}
                        <div className="flex items-center gap-4">
                          <label className={labelClass}>{t("Activate At")} *</label>
                          <div className="flex-1">
                            <Field
                              name="activate_at"
                              type="datetime-local"
                              className={`${formClass} ${
                                !isCreating && !isAdmin
                                  ? "bg-gray-100 dark:bg-gray-600 border-gray-300 dark:border-gray-500 text-gray-500 dark:text-gray-400 cursor-not-allowed opacity-80"
                                  : errors.activate_at && touched.activate_at
                                  ? "border-red-500 focus:ring-red-500"
                                  : ""
                              }`}
                              disabled={!isCreating && !isAdmin}
                            />
                            {!isCreating && !isAdmin && (
                              <div className="mt-1 text-xs text-blue-600 dark:text-blue-400 flex items-center gap-1">
                                <Info className="w-3 h-3" />
                                {t("Activation date cannot be changed for existing abonent")}
                              </div>
                            )}
                            {errors.activate_at && touched.activate_at && <div className="text-red-500 text-xs mt-1">{errors.activate_at}</div>}
                          </div>
                        </div>

                        {/* Deactivate At */}
                        <div className="flex items-center gap-4">
                          <label className={labelClass}>{t("Deactivate At")}</label>
                          <div className="flex-1">
                            <Field
                              name="deactivate_at"
                              type="datetime-local"
                              className={`${formClass} ${
                                values.already_deactivated && !isAdmin
                                  ? "bg-gray-100 dark:bg-gray-600 border-gray-300 dark:border-gray-500 text-gray-500 dark:text-gray-400 cursor-not-allowed opacity-80"
                                  : ""
                              }`}
                              disabled={values.already_deactivated && !isAdmin}
                            />
                            {values.already_deactivated && !isAdmin && (
                              <div className="mt-1 text-xs text-blue-600 dark:text-blue-400 flex items-center gap-1">
                                <Info className="w-3 h-3" />
                                {t("This abonent is already deactivated")}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </motion.div>

                  {/* Enterprise Information */}
                  <AnimatePresence>
                    {values.is_enterprises && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.3 }}
                        className="space-y-4 overflow-hidden"
                      >
                        <div className="grid grid-cols-1 gap-4">
                          {/* Account */}
                          <div className="flex items-center gap-4">
                            <label className={labelClass}>{t("Account")} *</label>
                            <div className="flex-1">
                              <Field
                                name="account"
                                placeholder={t("Enter account number")}
                                autoComplete="off"
                                disabled={isFormDisabled}
                                className={`${formClass} ${errors.account && touched.account ? "border-red-500 focus:ring-red-500" : ""} ${
                                  isFormDisabled ? "bg-gray-100 dark:bg-gray-600 cursor-not-allowed opacity-60" : ""
                                }`}
                              />
                              {errors.account && touched.account && <div className="text-red-500 text-xs mt-1">{errors.account}</div>}
                            </div>
                          </div>

                          {/* HB Type */}
                          <div className="flex items-center gap-4">
                            <label className={labelClass}>{t("HB Type")} *</label>
                            <div className="flex-1">
                              <Field
                                as="select"
                                name="hb_type"
                                disabled={isFormDisabled} // Добавьте
                                className={`${formClass} appearance-none cursor-pointer ${errors.hb_type && touched.hb_type ? "border-red-500 focus:ring-red-500" : ""} ${
                                  isFormDisabled ? "bg-gray-100 dark:bg-gray-600 cursor-not-allowed opacity-60" : ""
                                }`}
                              >
                                <option value="">{t("Select type")}</option>
                                <option value="hoz">{t("Hoz")}</option>
                                <option value="budjet">{t("Budjet")}</option>
                              </Field>
                              {errors.hb_type && touched.hb_type && <div className="text-red-500 text-xs mt-1">{errors.hb_type}</div>}
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* Abonplata and Services */}
                  <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }} className="space-y-4">
                    <h3 className={sectionTitleClass}>
                      <FileText className="w-5 h-5" />
                      {t("Services and Abonplata")}
                    </h3>

                    <div className="grid grid-cols-1 gap-4">
                      {/* Abonplata Field */}
                      <div className="flex items-center gap-4">
                        <label className={labelClass}>{t("Abonplata")} *</label>
                        <div className="flex-1">
                          <Field
                            name="abonplata"
                            step="0.01"
                            placeholder={t("Enter abonplata amount")}
                            autoComplete="off"
                            disabled={isFormDisabled} // Добавить
                            className={`${formClass} ${errors.abonplata && touched.abonplata ? "border-red-500 focus:ring-red-500" : ""} ${
                              isFormDisabled ? "bg-gray-100 dark:bg-gray-600 cursor-not-allowed opacity-60" : ""
                            }`}
                          />
                          {errors.abonplata && touched.abonplata && <div className="text-red-500 text-xs mt-1">{errors.abonplata}</div>}
                        </div>
                      </div>

                      {/* Services Checkboxes */}
                      <div className="flex items-start gap-4">
                        <label className={`${labelClass} mt-3`}>{t("Services")}</label>
                        <div className="flex-1">
                          {loadingService ? (
                            <div className="animate-pulse">Loading...</div>
                          ) : (
                            <>
                              {/* ИНФОРМАЦИЯ О ВЫБРАННЫХ УСЛУГАХ */}
                              {values.services && values.services.length > 0 && (
                                <div className="mb-4 p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                                  <div className="flex justify-between items-center">
                                    <span className="text-sm font-medium text-blue-800 dark:text-blue-300">
                                      {t("Selected services")}: {values.services.length}
                                    </span>
                                    <span className="text-sm font-bold text-green-600 dark:text-green-400">
                                      {t("Total")}: {calculateTotalPrice(values.services, services?.data)} man
                                    </span>
                                  </div>

                                  {/* ⭐⭐⭐ ДАТЫ ПОДКЛЮЧЕНИЯ/ОТКЛЮЧЕНИЯ УСЛУГ ⭐⭐⭐ */}
                                  <div className="mt-3 space-y-3">
                                    {values.services.map((serviceId) => {
                                      const service = services?.data?.find((s) => s.id === serviceId);
                                      return service ? (
                                        <ServiceDateField
                                          key={serviceId}
                                          serviceId={serviceId}
                                          serviceName={service.service}
                                          values={values}
                                          setFieldValue={setFieldValue}
                                          isCreating={isCreating}
                                          existingServiceDates={existingServiceDates}
                                          initialValues={initialValues} // ← ДОБАВЬТЕ ЭТУ СТРОКУ
                                          disabled={isFormDisabled}
                                        />
                                      ) : null;
                                    })}
                                  </div>

                                  {/* СПИСОК ВЫБРАННЫХ УСЛУГ */}
                                  <div className="mt-2 flex flex-wrap gap-2">
                                    {values.services.map((serviceId) => {
                                      const service = services?.data?.find((s) => s.id === serviceId);
                                      return service ? (
                                        <span key={service.id} className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 dark:bg-blue-800/30 text-blue-800 dark:text-blue-300 rounded-lg text-xs">
                                          {service.service}
                                          <span className="text-green-600 font-medium">({service.price} man)</span>
                                        </span>
                                      ) : null;
                                    })}
                                  </div>
                                </div>
                              )}

                              {/* ЧЕКБОКСЫ УСЛУГ */}
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 p-4 bg-gray-50 dark:bg-gray-700 rounded-xl">
                                {services?.data?.map((service) => {
                                  const serviceId = service.id;
                                  const isChecked = values.services?.includes(serviceId);

                                  // ИСПРАВЛЕНИЕ: Услуга disabled если она уже есть у абонента в БД
                                  // Проверяем, есть ли serviceId в initialValues.services (данные из БД)
                                  const isDisabled = (!isCreating && initialValues.services?.includes(serviceId)) || (values.already_deactivated && !isAdmin);
                                  // console.log(values.dogowor);

                                  return (
                                    <label key={service.id} className={`flex items-center gap-3 ${isDisabled ? "opacity-60 cursor-not-allowed" : "cursor-pointer"}`}>
                                      <input
                                        type="checkbox"
                                        name="services"
                                        value={serviceId}
                                        checked={isChecked}
                                        onChange={(e) => {
                                          if (isDisabled) return; // Не позволяем изменять если disabled

                                          if (e.target.checked) {
                                            setFieldValue("services", [...(values.services || []), serviceId]);
                                            // При добавлении услуги инициализируем её даты
                                            if (!isCreating && !values.service_dates?.[serviceId]) {
                                              setFieldValue(`service_dates.${serviceId}`, {
                                                activate_at: values.activate_at,
                                                deactivate_at: "",
                                              });
                                            }
                                          } else {
                                            setFieldValue("services", values.services?.filter((id) => id !== serviceId) || []);
                                            // При удалении услуги очищаем её даты
                                            if (!isCreating) {
                                              setFieldValue(`service_dates.${serviceId}`, undefined);
                                            }
                                          }
                                        }}
                                        // disabled={isDisabled}
                                        disabled={isDisabled}
                                        className={`w-4 h-4 text-purple-600 rounded focus:ring-purple-500 ${isDisabled ? "opacity-50 cursor-not-allowed" : ""}`}
                                      />
                                      <span className={`text-gray-700 dark:text-gray-300 ${isDisabled ? "opacity-70" : ""}`}>
                                        {service.service} <span className="text-green-600 font-medium">({service.price} man)</span>
                                        {isDisabled && <span className="text-xs text-blue-500 ml-2">({t("Use deactivation date")})</span>}
                                      </span>
                                    </label>
                                  );
                                })}
                              </div>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  </motion.div>

                  {/* Installation Fee Section */}
                  <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="space-y-4">
                    <h3 className={sectionTitleClass}>
                      <Home className="w-5 h-5" />
                      {t("Installation")}
                    </h3>

                    <div className="grid grid-cols-1 gap-4">
                      {/* Installation Fee Checkbox and Price Selection */}
                      <div className="flex items-start gap-4">
                        <label className={`${labelClass} mt-3`}>{t("Charge for installation")}</label>
                        <div className="flex-1">
                          <div className="flex flex-col gap-4 p-4 bg-gray-50 dark:bg-gray-700 rounded-xl">
                            {/* Checkbox */}
                            <label className="flex items-center gap-3 cursor-pointer">
                              <input
                                type="checkbox"
                                checked={values.nach_for_install}
                                onChange={(e) => {
                                  setFieldValue("nach_for_install", e.target.checked);
                                  if (!e.target.checked) {
                                    setFieldValue("install_price", "80");
                                  }
                                }}
                                disabled={!!values.user_id}
                                className="w-4 h-4 text-purple-600 rounded focus:ring-purple-500 disabled:opacity-50 disabled:cursor-not-allowed"
                              />
                              <span className={`text-gray-700 dark:text-gray-300 ${!!values.user_id ? "opacity-50" : ""}`}>{t("Charge installation fee")}</span>
                            </label>

                            {/* Price Selection */}
                            <AnimatePresence>
                              {values.nach_for_install && (
                                <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} className="space-y-3">
                                  <div className="flex items-center gap-4">
                                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{t("Select installation price")}:</span>
                                    <div className="flex gap-4">
                                      {["80", "40"].map((price) => (
                                        <label key={price} className="flex items-center gap-2 cursor-pointer">
                                          <input
                                            type="radio"
                                            name="install_price"
                                            value={price}
                                            checked={values.install_price === price}
                                            onChange={(e) => setFieldValue("install_price", e.target.value)}
                                            disabled={!!values.user_id}
                                            className="w-4 h-4 text-purple-600 focus:ring-purple-500 disabled:opacity-50"
                                          />
                                          <span className={`text-gray-700 dark:text-gray-300 ${!!values.user_id ? "opacity-50" : ""}`}>
                                            {price} {t("man")}
                                          </span>
                                        </label>
                                      ))}
                                    </div>
                                  </div>

                                  {/* ИТОГОВАЯ СУММА */}
                                  <div className="mt-4 p-4 bg-gradient-to-r from-green-50 to-blue-50 dark:from-green-900/20 dark:to-blue-900/20 border border-green-200 dark:border-green-800 rounded-lg">
                                    <h4 className="text-lg font-bold text-green-800 dark:text-green-400 mb-3 text-center">{t("Total amount to be charged")}</h4>

                                    <div className="space-y-2 text-sm">
                                      {/* Абонплата */}
                                      <div className="flex justify-between items-center">
                                        <span className="text-gray-600 dark:text-gray-400">{t("Abonplata")}:</span>
                                        <span className="font-medium">
                                          {parseFloat(values.abonplata) || 0} {t("man")}
                                        </span>
                                      </div>

                                      {/* Услуги */}
                                      <div className="flex justify-between items-center">
                                        <span className="text-gray-600 dark:text-gray-400">{t("Services")}:</span>
                                        <span className="font-medium">
                                          {calculateTotalPrice(values.services, services?.data)} {t("man")}
                                        </span>
                                      </div>

                                      {/* Установка */}
                                      <div className="flex justify-between items-center">
                                        <span className="text-gray-600 dark:text-gray-400">{t("Installation")}:</span>
                                        <span className="font-medium">
                                          {values.install_price} {t("man")}
                                        </span>
                                      </div>

                                      {/* Разделительная линия */}
                                      <div className="border-t border-gray-300 dark:border-gray-600 my-2"></div>

                                      {/* ИТОГО */}
                                      <div className="flex justify-between items-center text-base font-bold">
                                        <span className="text-gray-800 dark:text-gray-200">{t("Grand Total")}:</span>
                                        <span className="text-green-600 dark:text-green-400 text-lg">
                                          {calculateGrandTotal(values, services?.data)} {t("man")}
                                        </span>
                                      </div>
                                    </div>
                                  </div>

                                  {/* Информационное сообщение при update */}
                                  {!!values.user_id && (
                                    <div className="p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
                                      <p className="text-sm text-yellow-800 dark:text-yellow-300">{t("Installation fee can only be charged when creating a new abonent")}</p>
                                    </div>
                                  )}
                                </motion.div>
                              )}
                            </AnimatePresence>
                          </div>
                        </div>
                      </div>
                    </div>
                  </motion.div>

                  {/* Comment Field */}
                  <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }} className="space-y-4">
                    <div className="grid grid-cols-1 gap-4">
                      <div className="flex items-start gap-4">
                        <label className={`${labelClass} mt-3`}>{t("Comment")}</label>
                        <div className="flex-1">
                          <Field
                            as="textarea"
                            name="comment"
                            placeholder={t("Enter comment")}
                            rows={4}
                            disabled={isFormDisabled} // Добавить
                            className={`${formClass} resize-vertical min-h-[100px] ${isFormDisabled ? "bg-gray-100 dark:bg-gray-600 cursor-not-allowed opacity-60" : ""}`}
                          />
                        </div>
                      </div>
                    </div>
                  </motion.div>
                </Form>
              </>
            );
          }}
        </Formik>
      </div>
    </div>
  );
};

export default AbonentForm;
