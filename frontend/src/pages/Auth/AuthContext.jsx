import { createContext, useState, useEffect } from "react";
import myAxios from "../../services/myAxios";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const getUser = async () => {
      const token = localStorage.getItem("access");
      if (!token) return; // нет токена — не делаем запрос

      try {
        const res = await myAxios.get("accounts/user/");
        const userData = res.data;
        console.log("res.data", res.data);

        // если есть image, делаем полный URL
        if (userData.image) {
          userData.image = `${import.meta.env.VITE_API_URL}${userData.image}`;
        }

        setUser(userData);
      } catch (error) {
        console.log("Can't get user", error);
        setUser(null);
      }
    };

    getUser();
  }, []);

  const logout = () => {
    localStorage.removeItem("access");
    localStorage.removeItem("refresh");
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, setUser, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
