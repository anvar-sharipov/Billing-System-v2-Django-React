import { useTranslation } from "react-i18next";
import { NavLink } from "react-router-dom";
import { motion } from "framer-motion";

export default function LeftBar() {
  const { t } = useTranslation();

  const links = [
    { name: t("Dashboard"), path: "/" },
    { name: t("Users"), path: "/users" },
    { name: t("Products"), path: "/products" },
    { name: t("Reports"), path: "/reports" },
  ];

  return (
    <motion.aside
      initial={{ x: -200, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className="w-64 bg-gradient-to-b from-blue-600 to-blue-800 h-screen shadow-xl p-6 text-white fixed top-0 left-0"
    >
      <div className="text-2xl font-bold mb-8 select-none">{t("Menu")}</div>
      <ul className="flex flex-col gap-3">
        {links.map((link) => (
          <li key={link.name}>
            <NavLink
              to={link.path}
              className={({ isActive }) =>
                `block p-3 rounded-lg hover:bg-white/20 transition-colors duration-200 ${
                  isActive ? "bg-white/25 font-semibold" : ""
                }`
              }
            >
              {link.name}
            </NavLink>
          </li>
        ))}
      </ul>
    </motion.aside>
  );
}
