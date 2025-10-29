import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, Check } from "lucide-react";
import { useState, useRef, useEffect } from "react";

const Select = ({ 
  options, 
  value, 
  onChange, 
  className,
  placeholder = "Select an option",
  disabled = false
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const selectRef = useRef(null);

  const selectedOption = options.find(opt => opt.value === value);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (selectRef.current && !selectRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSelect = (optionValue) => {
    onChange(optionValue);
    setIsOpen(false);
  };

  return (
    <motion.div
      ref={selectRef}
      className={`relative w-full ${className || ""}`}
      initial={false}
      animate={isOpen ? "open" : "closed"}
    >
      {/* Trigger Button */}
      <motion.button
        type="button"
        disabled={disabled}
        whileHover={!disabled ? { scale: 1.02, y: -1 } : {}}
        whileTap={!disabled ? { scale: 0.98 } : {}}
        onClick={() => !disabled && setIsOpen(!isOpen)}
        transition={{ type: "spring", stiffness: 400, damping: 25 }}
        className={`
          w-full px-6 py-3
          bg-gradient-to-r from-purple-500 via-indigo-500 to-blue-500
          hover:from-purple-600 hover:via-indigo-600 hover:to-blue-600
          text-white font-semibold
          shadow-lg hover:shadow-xl
          focus:outline-none focus:ring-4 focus:ring-purple-400 focus:ring-opacity-50
          dark:from-purple-600 dark:via-indigo-600 dark:to-blue-600
          dark:hover:from-purple-700 dark:hover:via-indigo-700 dark:hover:to-blue-700
          dark:focus:ring-purple-500 dark:focus:ring-opacity-60
          transition-all duration-300 ease-out
          text-left
          relative
          overflow-hidden
          group
          ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
        `}
      >
        {/* Animated background shine */}
        <motion.div
          className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -skew-x-12 transform"
          initial={{ x: "-100%" }}
          whileHover={{ x: "200%" }}
          transition={{ duration: 0.8, ease: "easeInOut" }}
        />
        
        <div className="flex items-center justify-between relative z-10">
          <span className="text-sm md:text-base truncate">
            {selectedOption ? selectedOption.label : placeholder}
          </span>
          <motion.div
            animate={{ rotate: isOpen ? 180 : 0 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
          >
            <ChevronDown className="w-4 h-4 md:w-5 md:h-5 flex-shrink-0" />
          </motion.div>
        </div>
      </motion.button>

      {/* Dropdown Menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="
              absolute top-full left-0 right-0 mt-2
              bg-white dark:bg-gray-800
              rounded-2xl
              shadow-2xl
              border border-gray-200 dark:border-gray-700
              overflow-hidden
              z-50
            "
          >
            <motion.ul className="py-2 max-h-60 overflow-y-auto">
              {options.map((option, index) => (
                <motion.li
                  key={option.value}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <button
                    type="button"
                    onClick={() => handleSelect(option.value)}
                    className={`
                      w-full px-6 py-3
                      text-left
                      flex items-center justify-between
                      transition-all duration-200
                      group
                      ${
                        option.value === value
                          ? "bg-purple-50 text-purple-600 dark:bg-purple-900/30 dark:text-purple-300"
                          : "hover:bg-gray-50 dark:hover:bg-gray-700/50 text-gray-700 dark:text-gray-300"
                      }
                    `}
                  >
                    <span className="text-sm md:text-base font-medium">
                      {option.label}
                    </span>
                    
                    {option.value === value && (
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="text-purple-600 dark:text-purple-400"
                      >
                        <Check className="w-4 h-4" />
                      </motion.div>
                    )}
                  </button>
                </motion.li>
              ))}
            </motion.ul>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Backdrop */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsOpen(false)}
            className="fixed inset-0 bg-black/10 dark:bg-black/20 backdrop-blur-sm z-40"
            style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0 }}
          />
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default Select;