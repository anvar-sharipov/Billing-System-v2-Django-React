import { useTranslation } from "react-i18next";
import { Formik, Form, Field, useFormikContext } from "formik";
import { motion, AnimatePresence } from "framer-motion";
import { UserPlus, Save, Building, User, MapPin, Home, FileText, Copy, ArrowLeft, Loader2, Phone, X } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useState, useCallback, useEffect } from "react";
import MiniButton from "../../UI/MiniButton";
import { useEtraps } from "../../../context/EtrapContext";
import * as Yup from "yup";
import myAxios from "../../../services/myAxios";
import { useNotifications } from "../../../components/Notifications";
import UniqueAbonentChecker from "./UniqueAbonentChecker";
import UniqueDogoworChecker from "./UniqueDogoworChecker";

// Компонент для кнопки Save с доступом к Formik контексту
const SaveButton = ({ loadingSave, setLoadingSave, hasDuplicate, hasDuplicateDogowor }) => {
  const { submitForm, validateForm, setTouched } = useFormikContext();

  const handleSave = async () => {
    // Помечаем ВСЕ поля как touched чтобы показать все ошибки
    const allFields = ["number", "mobile_number", "surname", "name", "patronymic", "address", "etrap", "dogowor", "account", "hb_type"];

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
      disabled={hasDuplicate || hasDuplicateDogowor}
      // УБРАТЬ disabled - всегда позволять клик
    />
  );
};

// Компонент для поля с возможностью очистки
const ClearableField = ({ name, placeholder, setFieldValue, handlePaste, handleKeyDown, className, values }) => {
  const handleClear = () => {
    setFieldValue(name, "");
  };

  return (
    <div className="relative flex-1">
      <Field name={name} placeholder={placeholder} autoComplete="off" className={className} onPaste={(e) => handlePaste(e, setFieldValue, name)} onKeyDown={handleKeyDown} readOnly />
      {values[name] && (
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

const AbonentForm = () => {
  const { t } = useTranslation();
  const { notificationSuccess, notificationError } = useNotifications();
  const navigate = useNavigate();
  const [loadingBack, setLoadingBack] = useState(false);
  const [loadingSave, setLoadingSave] = useState(false);
  const { etraps, loading } = useEtraps();
  const [hasDuplicate, setHasDuplicate] = useState(false);
  const [hasDuplicateDogowor, setHasDuplicateDogowor] = useState(false);

  // Валидационная схема внутри компонента
  const validationSchema = Yup.object({
    number: Yup.string().required(t("Number is required")),
  //   .test("unique-abonent", t("Abonent with this number already exists"), function (value) {
  //   console.log("hasDuplicate", hasDuplicate);
    
  //   return !hasDuplicate;
  // }),

    etrap: Yup.string().required(t("Etrap is required")),
    dogowor: Yup.string()
      .required(t("Dogowor is required"))
      .test("dogowor-match", t("Dogowor must end with the number"), function (value) {
        const { number } = this.parent;
        // return value.endsWith(number);
        return value.includes(String(number));
      })
      .test("dogowor-code-match", t("Dogowor dont have etrap code"), function (value) {
        const { etrap } = this.parent;
        console.log("etrap ==", etrap);
        if (etrap) {
          const choosed_etrap = etraps.find((e) => parseFloat(e.id) === parseFloat(etrap));
          return String(value).includes(String(choosed_etrap.code));
        }
      }),
    // Name с разными сообщениями в зависимости от типа
    name: Yup.string().when("is_enterprises", {
      is: true,
      then: (schema) => schema.required(t("Enterprises name is required")),
      otherwise: (schema) => schema.required(t("Name is required")),
    }),
    // Фамилия обязательна только для физических лиц
    surname: Yup.string().when("is_enterprises", {
      is: false,
      then: (schema) => schema.required(t("Surname is required")),
      otherwise: (schema) => schema.notRequired(),
    }),
    // Поля для предприятий
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
  });

  const handlePaste = (e, setFieldValue, fieldName) => {
    e.preventDefault();
    const pastedText = e.clipboardData.getData("text");
    setFieldValue(fieldName, pastedText);
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
    <div className="p-2">
      <div className="bg-gray-200 dark:bg-gray-900 p-4 rounded-xl shadow-md">
        <Formik
          initialValues={{
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
            is_active: false,
            dogowor: "",
          }}
          validationSchema={validationSchema}
          onSubmit={async (values, { resetForm, setSubmitting }) => {
            console.log("Form values:", values);
            try {
              // const uniqueCheck = await getCheckActiveOrNot(values.number, values.etrap, values.is_active);

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

              const res = await myAxios.post("core/create-abonent/", values);
              console.log("Success:", res.data);
              notificationSuccess(t(res.data.message), t("success"));
            } catch (err) {
              console.error("Error creating abonent:", err.response.data.error);
              notificationError(t(err.response.data.error), t("error"));
            } finally {
              setSubmitting(false);
            }
            // TEPER OTPRAWLYAT TUT DA?
            // setTimeout(() => {
            //   // resetForm();
            //   setSubmitting(false);
            // }, 500);
          }}
        >
          {({ values, isSubmitting, setFieldValue, errors, touched }) => {
            return (
              <>
                <UniqueAbonentChecker values={values} setHasDuplicate={setHasDuplicate} />
                <UniqueDogoworChecker values={values} setHasDuplicateDogowor={setHasDuplicateDogowor} />
                {/* Иконка и кнопки в одном ряду */}
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
                    <SaveButton loadingSave={loadingSave} setLoadingSave={setLoadingSave} hasDuplicate={hasDuplicate} hasDuplicateDogowor={hasDuplicateDogowor} />
                  </div>
                </div>

                <Form className="space-y-6">
                  {/* Checkboxes Section */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="flex flex-col sm:flex-row gap-6 p-4 bg-gray-50 dark:bg-gray-800 rounded-2xl"
                  >
                    {[
                      { name: "is_active", label: t("Active") },
                      { name: "is_enterprises", label: t("Is enterprise"), icon: <Building className="w-4 h-4" /> },
                    ].map(({ name, label, icon }) => (
                      <label key={name} className="flex items-center gap-3 cursor-pointer group">
                        <div className="relative">
                          <Field type="checkbox" name={name} className="sr-only" />
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
                            className={`${formClass} ${errors.number && touched.number ? "border-red-500 focus:ring-red-500" : ""} ${hasDuplicate ? "border-red-500" : ""}`}
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
                          <div className="flex items-center gap-1 px-2 py-1 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                            <Copy className="w-3 h-3 text-blue-600 dark:text-blue-400" />
                            <span className="text-xs text-blue-600 dark:text-blue-400">Ctrl+V</span>
                          </div>
                        </label>
                        <ClearableField
                          name="mobile_number"
                          placeholder={t("Paste cell number")}
                          setFieldValue={setFieldValue}
                          handlePaste={handlePaste}
                          handleKeyDown={handleKeyDown}
                          className={pasteFieldClass}
                          values={values}
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
                            />
                            {errors.name && touched.name && <div className="text-red-500 text-xs mt-1">{errors.name}</div>}
                          </div>
                        </div>
                      ) : (
                        <>
                          {/* Surname */}
                          {/* Surname для физических лиц */}
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
                            <div className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-gray-100 dark:bg-gray-700 animate-pulse">
                              <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded"></div>
                            </div>
                          ) : (
                            <>
                              <Field as="select" name="etrap" className={`${formClass} appearance-none cursor-pointer ${errors.etrap && touched.etrap ? "border-red-500 focus:ring-red-500" : ""}`}>
                                <option value="">{t("Select etrap")}</option>
                                {etraps?.map((etrap) => (
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
                            className={`${pasteFieldClass} ${errors.dogowor && touched.dogowor ? "border-red-500 focus:ring-red-500" : ""} ${hasDuplicateDogowor ? "border-red-500" : ""}`}
                            values={values}
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
                                type="number"
                                placeholder={t("Enter account number")}
                                autoComplete="off"
                                className={`${formClass} ${errors.account && touched.account ? "border-red-500 focus:ring-red-500" : ""}`}
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
                                className={`${formClass} appearance-none cursor-pointer ${errors.hb_type && touched.hb_type ? "border-red-500 focus:ring-red-500" : ""}`}
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
