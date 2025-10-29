// UserContext.jsx
import { createContext, useState, useEffect } from "react";
import myAxios from "../../services/myAxios";

export const UserContext = createContext();

export const UserProvider = ({ children }) => {
  const [userInfo, setUserInfo] = useState(null); // null пока не авторизован

  useEffect(() => {
    const fetchUserInfo = async () => {
      try {
        const res = await myAxios.get("accounts/me/"); // эндпоинт для инфо о текущем user
        setUserInfo(res.data);
      } catch (err) {
        console.error("Ошибка получения пользователя", err);
        setUserInfo(null);
      }
    };

    fetchUserInfo();
  }, []);

  return (
    <UserContext.Provider value={{ userInfo, setUserInfo }}>
      {children}
    </UserContext.Provider>
  );
};
