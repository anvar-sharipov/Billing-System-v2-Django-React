import { useTranslation } from "react-i18next";
import { NavLink } from "react-router-dom";
import { motion } from "framer-motion";
import { Home, Users, Package, BarChart3, Shield } from "lucide-react";
import { ROUTES } from "../../../routes";

export default function LeftBar() {
  const { t } = useTranslation();

  const links = [
    { name: t("Users"), path: ROUTES.USERS, icon: <Users size={18} /> },
    { name: t("Products"), path: "/products", icon: <Package size={18} /> },
    { name: t("Admin"), path: ROUTES.ADMIN, icon: <Shield size={18} /> },
  ];

  return (
    <motion.aside
      initial={{ x: -150, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className="fixed left-0 top-0 h-screen w-64 bg-gradient-to-b from-blue-700/90 to-indigo-800/90 
                 dark:from-gray-800 dark:to-gray-900 text-white p-6 flex flex-col shadow-2xl backdrop-blur-lg z-20"
    >
      <h1 className="text-xl font-bold tracking-wide mb-8 text-center">MyPanel</h1>

      <ul className="flex flex-col gap-3 flex-1">
        {links.map((link) => (
          <li key={link.name}>
            <NavLink
              to={link.path}
              className={({ isActive }) =>
                `flex items-center gap-3 p-3 rounded-xl transition-all duration-200 
                 hover:bg-white/20 hover:translate-x-1 ${
                   isActive ? "bg-white/25 font-semibold shadow-inner" : ""
                 }`
              }
            >
              {link.icon}
              <span>{link.name}</span>
            </NavLink>
          </li>
        ))}
      </ul>

      <div className="text-sm opacity-70 text-center mt-6">
        © 2025 MyApp
      </div>
    </motion.aside>
  );
}