
import { ChevronDown } from "lucide-react";

const MiniSelect = ({ options = [], placeholder = "", value, onChange, className = "", disabled = false }) => {
  return (
    <div className={`relative inline-block w-full ${className}`}>
      <select
        value={value}
        onChange={onChange}
        disabled={disabled}
        className="
          block w-full appearance-none
          bg-white/80 dark:bg-gray-800/70
          border border-gray-300/40 dark:border-gray-700/60
          rounded-full
          px-3 sm:px-4 py-2
          text-gray-800 dark:text-gray-200
          shadow-md hover:shadow-lg
          focus:outline-none focus:ring-2 focus:ring-blue-500
          transition-all duration-300
          cursor-pointer
        "
      >
        {placeholder && (
          <option value="" disabled>
            {placeholder}
          </option>
        )}
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
      <span className="pointer-events-none absolute inset-y-0 right-3 flex items-center">
        <ChevronDown size={18} className="text-gray-500 dark:text-gray-400" />
      </span>
    </div>
  );
};

export default MiniSelect;
