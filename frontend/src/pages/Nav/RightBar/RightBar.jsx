// RightBar.jsx
import { motion } from "framer-motion";
import { Bell, UserCircle, MessageSquare } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useLocation } from "react-router-dom";
import UsersFilter from "./UsersFilter/UsersFilter";
import { useEtraps } from "../../../context/EtrapContext"; // добавьте этот хук

export default function RightBar() {
  const { t } = useTranslation();
  const location = useLocation();
  const { etraps } = useEtraps(); // получаем этрапы

  const handleFilter = (filters) => {
    console.log("Applied filters:", filters);
    // Здесь делайте запрос к API
  };

  const handleSearch = (searchData) => {
    console.log("Search data:", searchData);
    // Здесь делайте запрос к API
  };

  return (
    <motion.aside
      initial={{ x: 150, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className="fixed right-0 top-0 h-screen w-64 bg-gradient-to-b from-indigo-800/90 to-blue-700/90 
                 dark:from-gray-900 dark:to-gray-800 text-white p-6 flex flex-col shadow-2xl backdrop-blur-lg z-20"
    >
      {/* <h1 className="text-xl font-bold tracking-wide mb-8 text-center">MyPanel</h1> */}
      
      {location.pathname === '/users' && (
        <UsersFilter 
          onFilter={handleFilter}
          onSearch={handleSearch}
          etraps={etraps}
        />
      )}
    </motion.aside>
  );
}