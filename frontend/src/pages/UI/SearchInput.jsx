import { useState } from "react";
import { motion } from "framer-motion";
import { Search } from "lucide-react";

export default function SearchInput({ placeholder = "Search...", onSearch }) {
  const [value, setValue] = useState("");
  const [focused, setFocused] = useState(false);

  const handleChange = (e) => {
    setValue(e.target.value);
    if (onSearch) onSearch(e.target.value);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      className="relative w-full max-w-md"
    >
      <Search
        size={20}
        className={`absolute top-1/2 left-3 -translate-y-1/2 text-gray-400 dark:text-gray-300 transition-colors duration-200`}
      />
      <input
        type="text"
        value={value}
        onChange={handleChange}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        placeholder={placeholder}
        className={`
          w-full pl-10 pr-4 py-2 rounded-xl
          bg-gray-100 dark:bg-gray-800
          text-gray-900 dark:text-gray-100
          placeholder-gray-500 dark:placeholder-gray-400
          focus:outline-none focus:ring-2 focus:ring-blue-500
          focus:ring-offset-1
          transition-all duration-300
          ${focused ? "shadow-xl scale-105" : "shadow-md"}
        `}
      />
    </motion.div>
  );
}
