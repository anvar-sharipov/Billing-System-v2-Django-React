import axios from "axios";
import { jwtDecode } from "jwt-decode"; // ✅ Правильно для версии 4.0.0

const BASE_URL = "http://127.0.0.1:8000/";

const myAxios = axios.create({
  baseURL: BASE_URL,
});

// Функция обновления access токена
const refreshToken = async () => {
  const refresh = localStorage.getItem("refresh");
  if (!refresh) throw new Error("Нет refresh токена");

  const response = await axios.post(`${BASE_URL}accounts/token/refresh/`, { refresh });
  const { access } = response.data;
  localStorage.setItem("access", access);
  return access;
};

// Интерцептор для добавления токена к запросам
myAxios.interceptors.request.use(
  async (config) => {
    let access = localStorage.getItem("access");
    if (access) {
      const decoded = jwtDecode(access); // ✅ Используем jwtDecode
      const now = Date.now() / 1000;

      if (decoded.exp < now) {
        try {
          access = await refreshToken();
        } catch (err) {
          console.error("Не удалось обновить токен", err);
          localStorage.removeItem("access");
          localStorage.removeItem("refresh");
          window.location.href = "/login";
          throw err;
        }
      }

      config.headers["Authorization"] = `Bearer ${access}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Интерцептор для обработки 401
myAxios.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response && error.response.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      try {
        const newAccess = await refreshToken();
        originalRequest.headers["Authorization"] = `Bearer ${newAccess}`;
        return myAxios(originalRequest);
      } catch (err) {
        localStorage.removeItem("access");
        localStorage.removeItem("refresh");
        window.location.href = "/login";
      }
    }

    return Promise.reject(error);
  }
);

export default myAxios;