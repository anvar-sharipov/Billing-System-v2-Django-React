import axios from "axios";
import { jwtDecode } from "jwt-decode";

const rawEnvUrl = import.meta.env.VITE_API_URL || "http://127.0.0.1:8000";

const normalizeToApi = (u) => {
  if (!u) return "http://127.0.0.1:8000/api/";
  let url = String(u).trim();
  if (url.endsWith("/api/")) return url;
  if (url.endsWith("/api")) return url + "/";
  if (url.endsWith("/")) return url + "api/";
  return url + "/api/";
};

const BASE_URL = normalizeToApi(rawEnvUrl);

const myAxios = axios.create({
  baseURL: BASE_URL,
});

// Обновление access токена
const refreshToken = async () => {
  const refresh = localStorage.getItem("refresh");
  if (!refresh) throw new Error("Нет refresh токена");

  const response = await axios.post(`${BASE_URL}accounts/token/refresh/`, { refresh });
  const { access } = response.data;
  localStorage.setItem("access", access);
  return access;
};

// Интерцептор запроса
myAxios.interceptors.request.use(async (config) => {
  let access = localStorage.getItem("access");
  if (access) {
    const decoded = jwtDecode(access);
    const now = Date.now() / 1000;
    if (decoded.exp < now) {
      try {
        access = await refreshToken();
      } catch (err) {
        console.error("Не удалось обновить токен", err);
        localStorage.removeItem("access");
        localStorage.removeItem("refresh");
      }
    }
    config.headers["Authorization"] = `Bearer ${access}`;
  }
  return config;
}, (error) => Promise.reject(error));

// Интерцептор ответа
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
        // НЕ ДЕЛАЕМ window.location.href здесь
      }
    }
    return Promise.reject(error);
  }
);

export default myAxios;
