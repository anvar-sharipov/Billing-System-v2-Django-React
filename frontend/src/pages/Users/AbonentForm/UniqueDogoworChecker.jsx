import { useEffect, useState } from "react";
import myAxios from "../../../services/myAxios";

import { useTranslation } from "react-i18next";

const UniqueDogoworChecker = ({ values, setHasDuplicateDogowor }) => {
  const { t } = useTranslation();
  const [checking, setChecking] = useState(false);

  const checkUnique = async (dogowor) => {
    if (!dogowor) {
      setHasDuplicateDogowor(false);
      setChecking(false);
      return;
    }

    try {
      setChecking(true);
      const res = await myAxios.get("core/checkUniqueDogowor", {
        params: { dogowor, dogowor_type: "telefon" },
      });
      setHasDuplicateDogowor(res.data.exists);
    } catch (err) {
      console.log("Ошибка проверки:", err);
      setHasDuplicateDogowor(false);
    } finally {
      setChecking(false);
    }
  };

  useEffect(() => {
    const { dogowor } = values;
    
    // Сбрасываем состояние при каждом изменении
    setHasDuplicateDogowor(false);
    
    if (dogowor) {
      const timeoutId = setTimeout(() => {
        checkUnique(dogowor);
      }, 500);
      
      return () => clearTimeout(timeoutId);
    } else {
      setHasDuplicateDogowor(false);
    }
  }, [values.dogowor]);

  return null;
};

export default UniqueDogoworChecker;