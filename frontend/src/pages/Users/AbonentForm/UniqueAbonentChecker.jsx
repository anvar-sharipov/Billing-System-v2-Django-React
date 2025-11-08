import { useEffect, useState } from "react";
import myAxios from "../../../services/myAxios";
import { Loader2 } from "lucide-react";
import { useTranslation } from "react-i18next";

const UniqueAbonentChecker = ({ values, setHasDuplicate, editedUserId }) => {
  const { t } = useTranslation();
  const [checking, setChecking] = useState(false);

  const checkUnique = async (number, etrap, activate_at, deactivate_at) => {
    if (!activate_at || deactivate_at || !number || !etrap || number.length !== 5) {
      setHasDuplicate(false);
      setChecking(false);
      return;
    }

    try {
      setChecking(true);
      const res = await myAxios.get("core/checkActiveOrNot", {
        params: { number, etrap, activate_at, deactivate_at, id: editedUserId },
      });
      setHasDuplicate(res.data.exists);
    } catch (err) {
      console.log("Ошибка проверки:", err);
      setHasDuplicate(false);
    } finally {
      setChecking(false);
    }
  };

  useEffect(() => {
    const { number, etrap, activate_at, deactivate_at } = values;

    
    
    // Сбрасываем состояние при каждом изменении
    setHasDuplicate(false);
    
    if (number && etrap) {
      const timeoutId = setTimeout(() => {
        checkUnique(number, etrap, activate_at, deactivate_at);
      }, 500);
      
      return () => clearTimeout(timeoutId);
    } else {
      setHasDuplicate(false);
    }
  }, [values.number, values.etrap, values.activate_at, values.deactivate_at]);

  return null;
};

export default UniqueAbonentChecker;