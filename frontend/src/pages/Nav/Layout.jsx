import React from "react";
import { Outlet } from "react-router-dom";
import Header from "./Header";
import LeftBar from "./LeftBar/LeftBar";
import RightBar from "./RightBar/RightBar";
import { motion } from "framer-motion";

export default function Layout({ theme, toggleTheme }) {
  const containerVariants = {
    hidden: { opacity: 0, scale: 0.95 },
    visible: { opacity: 1, scale: 1, transition: { duration: 0.5, ease: "easeOut" } },
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-900 dark:via-blue-900 dark:to-purple-900 flex">
      
      {/* Left Sidebar */}
      <LeftBar />

      {/* Main content wrapper */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="flex-1 flex flex-col ml-64 mr-64 transition-colors duration-300 bg-white dark:bg-gray-800 rounded-3xl shadow-2xl border border-gray-100 dark:border-gray-700 backdrop-blur-sm"
      >
        {/* Header */}
        <Header theme={theme} toggleTheme={toggleTheme} />

        {/* Main content */}
        <main className="overflow-auto flex-1 text-gray-900 dark:text-gray-100">
          <Outlet />
        </main>
      </motion.div>

      {/* Right Sidebar */}
      <RightBar />
    </div>
  );
}
