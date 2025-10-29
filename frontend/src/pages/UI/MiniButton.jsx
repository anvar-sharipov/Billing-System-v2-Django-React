

const MiniButton = ({
  text = "",
  iconDefault = null,
  iconActive = null,
  active = false,
  loading = false,
  onClick,
  className = "",
  disabled = false,
}) => {
  return (
    <button
      onClick={onClick}
      disabled={disabled || loading}
      className={`
        flex items-center gap-2
        px-3 sm:px-4 py-2
        rounded-full
        shadow-md hover:shadow-xl
        transition-all duration-300
        bg-white/80 dark:bg-gray-800/70
        text-gray-800 dark:text-gray-200
        border border-gray-300/40 dark:border-gray-700/60
        hover:bg-gray-100 dark:hover:bg-gray-700
        text-sm sm:text-base font-medium
        ${className}
      `}
    >
      {loading ? (
        <span className="animate-spin">{iconActive || iconDefault}</span>
      ) : (
        active ? iconActive || iconDefault : iconDefault
      )}

      {text && <span className="whitespace-nowrap select-none">{text}</span>}
    </button>
  );
};

export default MiniButton;
