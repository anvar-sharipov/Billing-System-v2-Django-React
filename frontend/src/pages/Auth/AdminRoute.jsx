import { useContext } from "react";
import { Navigate } from "react-router-dom";
import { AuthContext } from "./AuthContext";
import { UserContext } from "./UserContext";

export default function AdminRoute({ children }) {
  const { user } = useContext(AuthContext);
  const { userInfo } = useContext(UserContext);

  // Пока идёт загрузка userInfo
  if (userInfo === null) {
    return <div>Loading...</div>;
  }

  // Если пользователь не авторизован
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // Проверка группы администратора
  const isAdmin = userInfo?.groups?.includes("admin");

  // Если не админ — редирект на главную
  if (!isAdmin) {
    return <Navigate to="/" replace />;
  }

  return children;
}
