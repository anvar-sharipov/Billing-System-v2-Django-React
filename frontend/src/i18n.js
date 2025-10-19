import i18n from "i18next";
import { initReactI18next } from "react-i18next";

// Импорт переводов
import ruTranslation from "./locales/ru/translation.json";
import tmTranslation from "./locales/tm/translation.json";

const resources = {
  ru: { translation: ruTranslation },
  tm: { translation: tmTranslation },
};

// Сначала проверяем, есть ли сохранённый язык
const savedLang = localStorage.getItem("lang") || "ru";

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: savedLang, // берем язык из localStorage
    fallbackLng: "ru",
    interpolation: {
      escapeValue: false, // React уже экранирует значения
    },
  });

export default i18n;
