import { motion } from "framer-motion";

const Button = ({ 
  children, 
  onClick, 
  className, 
  Icon, 
  variant = "primary",
  size = "medium",
  disabled = false,
  loading = false,
  type = "button"
}) => {
  // Варианты стилей
  const variants = {
    primary: `
      bg-gradient-to-r from-purple-500 via-indigo-500 to-blue-500
      hover:from-purple-600 hover:via-indigo-600 hover:to-blue-600
      dark:from-purple-600 dark:via-indigo-600 dark:to-blue-600
      dark:hover:from-purple-700 dark:hover:via-indigo-700 dark:hover:to-blue-700
      text-white
      shadow-lg hover:shadow-xl
      focus:ring-4 focus:ring-purple-400 focus:ring-opacity-50
      dark:focus:ring-purple-500 dark:focus:ring-opacity-60
    `,
    secondary: `
      bg-gradient-to-r from-gray-100 to-gray-200
      hover:from-gray-200 hover:to-gray-300
      dark:from-gray-700 dark:to-gray-800
      dark:hover:from-gray-600 dark:hover:to-gray-700
      text-gray-800 dark:text-gray-200
      border border-gray-300 dark:border-gray-600
      shadow-md hover:shadow-lg
      focus:ring-4 focus:ring-gray-400 focus:ring-opacity-50
      dark:focus:ring-gray-500 dark:focus:ring-opacity-60
    `,
    danger: `
      bg-gradient-to-r from-red-500 to-pink-500
      hover:from-red-600 hover:to-pink-600
      dark:from-red-600 dark:to-pink-600
      dark:hover:from-red-700 dark:hover:to-pink-700
      text-white
      shadow-lg hover:shadow-xl
      focus:ring-4 focus:ring-red-400 focus:ring-opacity-50
      dark:focus:ring-red-500 dark:focus:ring-opacity-60
    `,
    success: `
      bg-gradient-to-r from-green-500 to-emerald-500
      hover:from-green-600 hover:to-emerald-600
      dark:from-green-600 dark:to-emerald-600
      dark:hover:from-green-700 dark:hover:to-emerald-700
      text-white
      shadow-lg hover:shadow-xl
      focus:ring-4 focus:ring-green-400 focus:ring-opacity-50
      dark:focus:ring-green-500 dark:focus:ring-opacity-60
    `,
    ghost: `
      bg-transparent
      hover:bg-gray-100 dark:hover:bg-gray-800
      text-gray-700 dark:text-gray-300
      border border-gray-300 dark:border-gray-600
      shadow-sm hover:shadow-md
      focus:ring-4 focus:ring-gray-400 focus:ring-opacity-50
      dark:focus:ring-gray-500 dark:focus:ring-opacity-60
    `
  };

  // Размеры
  const sizes = {
    small: "px-4 py-2 text-xs md:text-sm",
    medium: "px-6 py-3 text-sm md:text-base",
    large: "px-8 py-4 text-base md:text-lg",
    xlarge: "px-10 py-5 text-lg md:text-xl"
  };

  return (
    <motion.button
      type={type}
      whileHover={!disabled && !loading ? { 
        scale: 1.05, 
        y: -2,
        transition: { type: "spring", stiffness: 400, damping: 10 }
      } : {}}
      whileTap={!disabled && !loading ? { 
        scale: 0.95,
        transition: { type: "spring", stiffness: 400, damping: 30 }
      } : {}}
      onClick={!disabled && !loading ? onClick : undefined}
      disabled={disabled || loading}
      className={`
        relative
        flex items-center justify-center gap-3
        font-semibold
        focus:outline-none focus:ring-offset-2
        transition-all duration-300 ease-out
        overflow-hidden
        group
        ${variants[variant]}
        ${sizes[size]}
        ${disabled || loading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
        ${className || ""}
      `}
    >
      {/* Animated background shine */}
      {!disabled && !loading && (
        <motion.div
          className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent -skew-x-12 transform"
          initial={{ x: "-100%" }}
          whileHover={{ x: "200%" }}
          transition={{ duration: 0.8, ease: "easeInOut" }}
        />
      )}

      {/* Loading spinner */}
      {loading && (
        <motion.div
          initial={{ scale: 0, rotate: 0 }}
          animate={{ scale: 1, rotate: 360 }}
          transition={{ duration: 0.5, ease: "easeInOut" }}
          className="absolute"
        >
          <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
        </motion.div>
      )}

      {/* Content */}
      <div className={`flex items-center justify-center gap-2 relative z-10 ${loading ? 'opacity-0' : 'opacity-100'}`}>
        {Icon && (
          <motion.div
            whileHover={{ rotate: 360 }}
            transition={{ duration: 0.5, ease: "easeInOut" }}
          >
            <Icon className={`${size === 'small' ? 'w-4 h-4' : size === 'large' ? 'w-6 h-6' : 'w-5 h-5'}`} />
          </motion.div>
        )}
        {children}
      </div>

      {/* Ripple effect */}
      {!disabled && !loading && (
        <motion.div
          className="absolute inset-0 bg-white/20 rounded-2xl"
          initial={{ scale: 0, opacity: 0 }}
          whileTap={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.2 }}
        />
      )}
    </motion.button>
  );
};

export default Button;