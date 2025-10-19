import { useEffect } from "react";
import { useTranslation } from "react-i18next";

export default function WelcomePage() {
  const { t } = useTranslation();
  useEffect(() => {
    document.title = `${t("Welcome")} Smart Billing`;
  },[t])
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-100">
      <div className="p-6 bg-white rounded-lg shadow-md text-blue-600">
        Tailwind работает ✅
      </div>
    </div>
  );
}
