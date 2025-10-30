// App.jsx
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Login from "./pages/Auth/Login";
import Register from "./pages/Auth/Register";
import WelcomePage from "./pages/WelcomePage";
import Layout from "./pages/Nav/Layout";
import { useState, useEffect } from "react";
import Test2 from "./pages/test2";
import { AuthProvider } from "./pages/Auth/AuthContext";
import { ROUTES } from "./routes";
import Chat from "./pages/Chat/Chat";
import ChatPage from "./pages/Chat/ChatPage";
import Users from "./pages/Users/Users";
import Admin from "./pages/Admin/Admin";
import AddUsersFromBilling from "./pages/Admin/addUsersFromBilling/AddUsersFromBilling";
import { EtrapProvider } from "./context/EtrapContext";
import AbonentForm from "./pages/Users/AbonentForm/AbonentForm";
import { NotificationProvider } from "./components/Notifications";
import ProtectedRoute from "./pages/Auth/ProtectedRoute";
import AdminRoute from "./pages/Auth/AdminRoute";
import { UserProvider } from "./pages/Auth/UserContext";
import AddTestData from "./pages/Admin/addTestData/AddTestData";

function App() {
  const [theme, setTheme] = useState(() => localStorage.getItem("theme") || "light");

  // Когда тема меняется, добавляем или убираем класс 'dark' на <html>
  useEffect(() => {
    const html = document.documentElement;
    if (theme === "dark") {
      html.classList.add("dark");
    } else {
      html.classList.remove("dark");
    }
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prev) => {
      const newTheme = prev === "light" ? "dark" : "light";
      localStorage.setItem("theme", newTheme);
      return newTheme;
    });
  };

  return (
    <NotificationProvider>
      <EtrapProvider>
        <AuthProvider>
          <UserProvider>
            <Router>
              <Routes>
                <Route path={ROUTES.LOGIN} element={<Login />} />
                <Route path={ROUTES.REGISTER} element={
                  <AdminRoute>
                    <Register />
                  </AdminRoute>
                } />

                <Route path="/" element={<Layout theme={theme} toggleTheme={toggleTheme} />}>
                  <Route index element={<ProtectedRoute><WelcomePage /></ProtectedRoute>} />
                  <Route path={ROUTES.CHAT} element={<ProtectedRoute><ChatPage /></ProtectedRoute>} />
                  <Route path={ROUTES.USERS} element={<ProtectedRoute><Users /></ProtectedRoute>} />
                  <Route path={ROUTES.ABONENT_FORM} element={<ProtectedRoute><AbonentForm /></ProtectedRoute>} />
                
                  <Route path="test2" element={<ProtectedRoute><Test2 /></ProtectedRoute>} />

                  {/* admin */}
                  <Route path={ROUTES.ADMIN} element={<AdminRoute><ProtectedRoute><Admin /></ProtectedRoute></AdminRoute>} />
                  <Route path={ROUTES.ADD_USERS_FROM_BILLING} element={<AdminRoute><ProtectedRoute><AddUsersFromBilling /></ProtectedRoute></AdminRoute>} />
                  <Route path={ROUTES.ADD_TEST_DATA} element={<AdminRoute><ProtectedRoute><AddTestData /></ProtectedRoute></AdminRoute>} />

                </Route>
              </Routes>
            </Router>
          </UserProvider>
        </AuthProvider>
      </EtrapProvider>
    </NotificationProvider>
  );
}

export default App;
