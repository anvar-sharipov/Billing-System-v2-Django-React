// import { useContext, useEffect } from "react";
// import { Navigate } from "react-router-dom";
// import { AuthContext } from "./AuthContext";
// import { UserContext } from "./UserContext";
// import { useNotifications } from "../../components/Notifications";


// export default function AdminRoute({ children }) {
//   const { user } = useContext(AuthContext);
//   const { userInfo } = useContext(UserContext);
//   const { notificationSuccess, notificationError } = useNotifications();
  
  

//   // Пока идёт загрузка userInfo
//   if (userInfo === null) {
//     return <div>Loading...</div>;
//   }

//   // Если пользователь не авторизован
//   if (!user) {
//     return <Navigate to="/login" replace />;
//   }

//   // Проверка группы администратора
//   const isAdmin = userInfo?.groups?.includes("admin");

//   // Если не админ — редирект на главную
//   // if (!isAdmin) {
//   //   return <Navigate to="/" replace />;
//   // }
//   if (!isAdmin) {
//     useEffect(() => {
//       console.log("GG");
//       notificationError("Доступ запрещен", "У вас недостаточно прав для доступа к админ панели");
//     }, []);
//     return <Navigate to="/" replace />;
//   }

//   return children;
// }



import { useContext, useEffect } from "react";
import { Navigate } from "react-router-dom";
import { AuthContext } from "./AuthContext";
import { UserContext } from "./UserContext";
import { useNotifications } from "../../components/Notifications";

export default function AdminRoute({ children }) {
  const { user } = useContext(AuthContext);
  const { userInfo } = useContext(UserContext);
  const { notificationError } = useNotifications();

  // useEffect должен быть вызван безусловно на каждом рендере
  useEffect(() => {
    // Проверяем условия внутри useEffect
    if (user && userInfo && !userInfo.groups?.includes("admin")) {
      notificationError("Доступ запрещен", "У вас недостаточно прав для доступа к админ панели");
    }
  }, [user, userInfo, notificationError]);

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