// UserContext.jsx (упрощенная версия)
import { createContext, useState, useEffect } from "react";
import myAxios from "../../services/myAxios";

export const UserContext = createContext();

export const UserProvider = ({ children }) => {
  const [userInfo, setUserInfo] = useState(null);

  useEffect(() => {
    const fetchUserInfo = async () => {
      try {
        const res = await myAxios.get("accounts/me/");
        const userData = res.data;
        // console.log("userData", userData);
        
        if (userData.image) {
          userData.image = `${import.meta.env.VITE_API_URL}${userData.image}`;
        }
        setUserInfo(userData);
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

// // UserContext.jsx
// import { createContext, useState, useEffect } from "react";
// import myAxios from "../../services/myAxios";

// export const UserContext = createContext();

// export const UserProvider = ({ children }) => {
//   const [userInfo, setUserInfo] = useState(null); // null пока не авторизован

//   useEffect(() => {
//     const fetchUserInfo = async () => {
//       try {
//         const res = await myAxios.get("accounts/me/"); // эндпоинт для инфо о текущем user
//         setUserInfo(res.data);
//       } catch (err) {
//         console.error("Ошибка получения пользователя", err);
//         setUserInfo(null);
//       }
//     };

//     fetchUserInfo();
//   }, []);

//   return (
//     <UserContext.Provider value={{ userInfo, setUserInfo }}>
//       {children}
//     </UserContext.Provider>
//   );
// };
