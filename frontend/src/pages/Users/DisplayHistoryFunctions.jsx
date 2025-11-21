import { useTranslation } from "react-i18next";

// Компонент для отображения структурированных данных
const DataDisplay = ({ data, title }) => {
  const { t } = useTranslation();
  if (!data) return null;

  // Если это строка (не JSON объект)
  if (typeof data === "string") {
    return (
      <div className="mb-2">
        {title && <span className="font-medium text-gray-700 dark:text-gray-300">{title}: </span>}
        <span className="text-gray-900 dark:text-white">{data}</span>
      </div>
    );
  }

  // Если это объект - отображаем как список
  return (
    <div className="mb-3">
      {title && <div className="font-medium text-gray-700 dark:text-gray-300 mb-2">{title}:</div>}
      <div className="space-y-1 pl-4 border-l-2 border-gray-200 dark:border-gray-600">
        {Object.entries(data).map(([key, value]) => {
          let key_;
          if (!isNaN(Number(key))) {
            key_ = String(parseFloat(key) + 1);
          } else {
            key_ = key.replace(/_/g, " ");
          }
          return (
            <div key={key} className="flex flex-wrap items-start gap-1">
              <span className="font-medium text-gray-600 dark:text-gray-400 text-sm capitalize">{t(key_)}:</span>
              {typeof value === "object" && value !== null ? (
                <DataDisplay data={value} />
              ) : (
                <span className="text-gray-900 dark:text-white text-sm">{value === "" ? "(пусто)" : value?.toString() || "-"}</span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

// Компонент для отображения изменений
const ChangesDisplay = ({ oldValue, newValue }) => {
  console.log("oldValue", typeof oldValue);

  const { t } = useTranslation();
  return (
    <div className="space-y-2 mb-3">
      {oldValue && Object.keys(oldValue).length > 0 && (
        <div className="flex items-start gap-2">
          <span className="text-red-600 dark:text-red-400 text-sm font-medium min-w-12">{t("Was")}:</span>
          <div className="flex-1 bg-red-50 dark:bg-red-500/10 px-3 py-2 rounded border border-red-200 dark:border-red-500/20">
            <DataDisplay data={oldValue} />
          </div>
        </div>
      )}

      {newValue && (
        <div className="flex items-start gap-2">
          {oldValue && Object.keys(oldValue).length > 0 && <span className="text-green-600 dark:text-green-400 text-sm font-medium min-w-12">{t("Now")}:</span>}

          <div className="flex-1 bg-green-50 dark:bg-green-500/10 px-3 py-2 rounded border border-green-200 dark:border-green-500/20">
            <DataDisplay data={newValue} />
          </div>
        </div>
      )}
    </div>
  );
};

export { DataDisplay, ChangesDisplay };
