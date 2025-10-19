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
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/" element={<Layout theme={theme} toggleTheme={toggleTheme} />}>
            <Route index element={<WelcomePage />} />
            <Route path={ROUTES.LOGIN} element={<Login />} />
            <Route path={ROUTES.REGISTER} element={<Register />} />
            <Route path={ROUTES.CHAT} element={<Chat />} />
            <Route path="test2" element={<Test2 />} />
          </Route>
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
