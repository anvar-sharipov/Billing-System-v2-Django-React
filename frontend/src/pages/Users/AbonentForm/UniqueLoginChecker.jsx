import { useEffect, useState } from "react";
import myAxios from "../../../services/myAxios";

import { useTranslation } from "react-i18next";

const UniqueLoginChecker = ({ values, setHasDuplicateLogin, editedLoginId }) => {
  const { t } = useTranslation();
  const [checking, setChecking] = useState(false);

  const checkUnique = async (login) => {
    if (!login) {
      setHasDuplicateLogin(false);
      setChecking(false);
      return;
    }

    try {
      setChecking(true);
      const res = await myAxios.get("core/checkUniqueLogin", {
        params: { login, login_type: "telefon", id: editedLoginId },
      });
      setHasDuplicateLogin(res.data.exists);
    } catch (err) {
      console.log("Ошибка проверки:", err);
      setHasDuplicateLogin(false);
    } finally {
      setChecking(false);
    }
  };

  useEffect(() => {
    const { login } = values;
    
    // Сбрасываем состояние при каждом изменении
    setHasDuplicateLogin(false);
    
    if (login) {
      const timeoutId = setTimeout(() => {
        checkUnique(login);
      }, 500);
      
      return () => clearTimeout(timeoutId);
    } else {
      setHasDuplicateLogin(false);
    }
  }, [values.login]);

  return null;
};

export default UniqueLoginChecker;