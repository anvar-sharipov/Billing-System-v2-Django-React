import MyModal from "../UI/MyModal";
import { useTranslation } from "react-i18next";
import { Formik, Form, Field } from "formik";
import { motion, AnimatePresence } from "framer-motion";
import { UserPlus, Save, Building, User, MapPin, Home, FileText, Copy, AlertCircle } from "lucide-react";
import { useEtraps } from "../../context/EtrapContext";

const AddUserModal = ({ addUserModal, setAddUserModal, onSubmit }) => {
  const { t } = useTranslation();
  const { etraps, loading } = useEtraps();

  console.log("etraps", etraps);

  // Функция для обработки вставки текста
  const handlePaste = (e, setFieldValue, fieldName) => {
    e.preventDefault();
    const pastedText = e.clipboardData.getData('text');
    setFieldValue(fieldName, pastedText);
  };

  // Функция для блокировки ручного ввода
  const handleKeyDown = (e) => {
    // Разрешаем только специальные клавиши и комбинации
    const allowedKeys = [
      'Backspace', 'Delete', 'ArrowLeft', 'ArrowRight', 
      'ArrowUp', 'ArrowDown', 'Tab', 'Home', 'End',
      'Control', 'Meta', 'Alt'
    ];
    
    // Разрешаем Ctrl+A, Ctrl+C, Ctrl+V, Ctrl+X
    if (e.ctrlKey || e.metaKey) {
      return;
    }
    
    // Блокируем все остальные клавиши
    if (!allowedKeys.includes(e.key)) {
      e.preventDefault();
    }
  };

  return (
    <MyModal isOpen={addUserModal} onClose={() => setAddUserModal(false)} title={t("Add user")} closeOnBackdropClick={false}>
      <Formik
        initialValues={{
          number: "",
          name: "",
          address: "",
          etrap: "",
          is_enterprises: false,
          account: "",
          hb_type: "",
          is_active: false,
          dogowor: "",
        }}
        onSubmit={(values, { resetForm, setSubmitting }) => {
          console.log("Form values:", values);
          if (onSubmit) onSubmit(values);

          setTimeout(() => {
            resetForm();
            setAddUserModal(false);
            setSubmitting(false);
          }, 500);
        }}
      >
        {({ values, isSubmitting, setFieldValue }) => (
          <Form className="space-y-6">
            {/* Header Icon */}
            <motion.div initial={{ scale: 0, rotate: -180 }} animate={{ scale: 1, rotate: 0 }} transition={{ type: "spring", stiffness: 200, damping: 15 }} className="flex justify-center">
              <div className="p-4 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-3xl shadow-lg">
                <UserPlus className="w-8 h-8 text-white" />
              </div>
            </motion.div>

            {/* Basic Information Section */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 flex items-center gap-2">
                <User className="w-5 h-5" />
                {t("Basic Information")}
              </h3>

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">{t("Number")} *</label>
                <Field
                  name="number"
                  placeholder={t("Enter number")}
                  autoComplete="off"
                  className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 
                             bg-white dark:bg-gray-700 text-gray-900 dark:text-white
                             focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent
                             transition-all duration-200 placeholder-gray-500 dark:placeholder-gray-400"
                  required
                />
              </div>

              {/* Name Field - только copy/paste */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center gap-2">
                  {t("Name")}
                  <div className="flex items-center gap-1 px-2 py-1 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                    <Copy className="w-3 h-3 text-blue-600 dark:text-blue-400" />
                    <span className="text-xs text-blue-600 dark:text-blue-400">Ctrl+V</span>
                  </div>
                </label>
                <Field
                  name="name"
                  placeholder={t("Paste name or department")}
                  autoComplete="off"
                  className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 
                             bg-white dark:bg-gray-700 text-gray-900 dark:text-white
                             focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
                             transition-all duration-200 placeholder-gray-500 dark:placeholder-gray-400
                             cursor-copy"
                  onPaste={(e) => handlePaste(e, setFieldValue, 'name')}
                  onKeyDown={handleKeyDown}
                  readOnly
                />
                <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                  <AlertCircle className="w-3 h-3" />
                  {t("Copy paste only")}
                </div>
              </div>
            </motion.div>

            {/* Etrap Selection */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }} className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 flex items-center gap-2">
                <MapPin className="w-5 h-5" />
                {t("Etrap")}
              </h3>

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">{t("Select Etrap")} *</label>
                {loading ? (
                  <div className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-gray-100 dark:bg-gray-700 animate-pulse">
                    <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded"></div>
                  </div>
                ) : (
                  <Field
                    as="select"
                    name="etrap"
                    className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 
                             bg-white dark:bg-gray-700 text-gray-900 dark:text-white
                             focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent
                             transition-all duration-200 appearance-none cursor-pointer"
                    required
                  >
                    <option value="">{t("Select etrap")}</option>
                    {etraps?.map((etrap) => (
                      <option key={etrap.id} value={etrap.id}>
                        {etrap.etrap} ({etrap.code})
                      </option>
                    ))}
                  </Field>
                )}
              </div>
            </motion.div>

            {/* Address Section - только copy/paste */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 flex items-center gap-2">
                <Home className="w-5 h-5" />
                {t("Address")}
              </h3>

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center gap-2">
                  {t("Address")}
                  <div className="flex items-center gap-1 px-2 py-1 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                    <Copy className="w-3 h-3 text-blue-600 dark:text-blue-400" />
                    <span className="text-xs text-blue-600 dark:text-blue-400">Ctrl+V</span>
                  </div>
                </label>
                <Field
                  name="address"
                  placeholder={t("Paste full address")}
                  autoComplete="off"
                  className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 
                           bg-white dark:bg-gray-700 text-gray-900 dark:text-white
                           focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
                           transition-all duration-200 placeholder-gray-500 dark:placeholder-gray-400
                           cursor-copy"
                  onPaste={(e) => handlePaste(e, setFieldValue, 'address')}
                  onKeyDown={handleKeyDown}
                  readOnly
                />
                <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                  <AlertCircle className="w-3 h-3" />
                  {t("Copy paste only")}
                </div>
              </div>
            </motion.div>

            {/* Договор Field - только copy/paste */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }} className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 flex items-center gap-2">
                <FileText className="w-5 h-5" />
                {t("Dogowor")}
              </h3>

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center gap-2">
                  {t("Dogowor")}
                  <div className="flex items-center gap-1 px-2 py-1 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                    <Copy className="w-3 h-3 text-blue-600 dark:text-blue-400" />
                    <span className="text-xs text-blue-600 dark:text-blue-400">Ctrl+V</span>
                  </div>
                </label>
                <Field
                  name="dogowor"
                  placeholder={t("Paste dogowor number")}
                  autoComplete="off"
                  className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 
                           bg-white dark:bg-gray-700 text-gray-900 dark:text-white
                           focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
                           transition-all duration-200 placeholder-gray-500 dark:placeholder-gray-400
                           cursor-copy"
                  onPaste={(e) => handlePaste(e, setFieldValue, 'dogowor')}
                  onKeyDown={handleKeyDown}
                  readOnly
                />
                <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                  <AlertCircle className="w-3 h-3" />
                  {t("Copy paste only")}
                </div>
              </div>
            </motion.div>

            {/* Checkboxes Section */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="flex flex-col sm:flex-row gap-6 p-4 bg-gray-50 dark:bg-gray-800 rounded-2xl"
            >
              <label className="flex items-center gap-3 cursor-pointer group">
                <div className="relative">
                  <Field type="checkbox" name="is_enterprises" className="sr-only" />
                  <div
                    className="w-5 h-5 border-2 border-gray-400 rounded-md group-hover:border-purple-500 
                                transition-colors duration-200 flex items-center justify-center"
                  >
                    <AnimatePresence>
                      {values.is_enterprises && <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }} className="w-3 h-3 bg-purple-600 rounded-sm" />}
                    </AnimatePresence>
                  </div>
                </div>
                <span className="text-gray-700 dark:text-gray-300 font-medium flex items-center gap-2">
                  <Building className="w-4 h-4" />
                  {t("Is enterprise")}
                </span>
              </label>

              <label className="flex items-center gap-3 cursor-pointer group">
                <div className="relative">
                  <Field type="checkbox" name="is_active" className="sr-only" />
                  <div
                    className="w-5 h-5 border-2 border-gray-400 rounded-md group-hover:border-green-500 
                                transition-colors duration-200 flex items-center justify-center"
                  >
                    <AnimatePresence>
                      {values.is_active && <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }} className="w-3 h-3 bg-green-600 rounded-sm" />}
                    </AnimatePresence>
                  </div>
                </div>
                <span className="text-gray-700 dark:text-gray-300 font-medium">{t("Active")}</span>
              </label>
            </motion.div>

            {/* Additional Information - Показывается только если is_enterprises = true */}
            <AnimatePresence>
              {values.is_enterprises && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.3 }}
                  className="space-y-4 overflow-hidden"
                >
                  <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200">
                    {t("Enterprise Information")}
                  </h3>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Account Field */}
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-700 dark:text-gray-300">{t("Account")}</label>
                      <Field
                        name="account"
                        type="number"
                        placeholder={t("Enter account number")}
                        autoComplete="off"
                        className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 
                                 bg-white dark:bg-gray-700 text-gray-900 dark:text-white
                                 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent
                                 transition-all duration-200 placeholder-gray-500 dark:placeholder-gray-400"
                      />
                    </div>

                    {/* HB Type Section */}
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-700 dark:text-gray-300">{t("HB Type")}</label>
                      <Field
                        as="select"
                        name="hb_type"
                        className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 
                                 bg-white dark:bg-gray-700 text-gray-900 dark:text-white
                                 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent
                                 transition-all duration-200 appearance-none cursor-pointer"
                      >
                        <option value="">{t("Select type")}</option>
                        <option value="hoz">{t("Hoz")}</option>
                        <option value="budjet">{t("Budjet")}</option>
                      </Field>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Submit Button */}
            <motion.button
              type="submit"
              disabled={isSubmitting}
              whileHover={!isSubmitting ? { scale: 1.02, y: -2 } : {}}
              whileTap={!isSubmitting ? { scale: 0.98 } : {}}
              className={`
                w-full px-6 py-4 
                bg-gradient-to-r from-purple-500 via-indigo-500 to-blue-500
                text-white font-semibold rounded-2xl 
                shadow-lg hover:shadow-xl
                focus:outline-none focus:ring-4 focus:ring-purple-400 focus:ring-opacity-50
                transition-all duration-300
                flex items-center justify-center gap-3
                ${isSubmitting ? "opacity-70 cursor-not-allowed" : ""}
              `}
            >
              {isSubmitting ? (
                <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: "linear" }} className="w-5 h-5 border-2 border-white border-t-transparent rounded-full" />
              ) : (
                <Save className="w-5 h-5" />
              )}
              {isSubmitting ? t("Saving...") : t("Save User")}
            </motion.button>
          </Form>
        )}
      </Formik>
    </MyModal>
  );
};

export default AddUserModal;