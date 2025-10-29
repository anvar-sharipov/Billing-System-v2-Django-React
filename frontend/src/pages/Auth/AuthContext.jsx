import { createContext, useState, useEffect } from "react";
import myAxios from "../../services/myAxios";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true); // <--- добавили

  useEffect(() => {
    const getUser = async () => {
      const token = localStorage.getItem("access");
      if (!token) {
        setLoading(false);
        return;
      }

      try {
        const res = await myAxios.get("accounts/user/");
        const userData = res.data;
        if (userData.image) {
          userData.image = `${import.meta.env.VITE_API_URL}${userData.image}`;
        }
        setUser(userData);
      } catch (error) {
        console.log("Can't get user", error);
        setUser(null);
      } finally {
        setLoading(false); // <--- загрузка закончена
      }
    };

    getUser();
  }, []);

  const login = async (access, refresh) => {
    localStorage.setItem("access", access);
    localStorage.setItem("refresh", refresh);

    try {
      const res = await myAxios.get("accounts/user/");
      const userData = res.data;
      if (userData.image) {
        userData.image = `${import.meta.env.VITE_API_URL}${userData.image}`;
      }
      setUser(userData);
    } catch (err) {
      console.error("Can't get user after login", err);
      setUser(null);
    }
  };

  const logout = () => {
    localStorage.removeItem("access");
    localStorage.removeItem("refresh");
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, setUser, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};
