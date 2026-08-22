export const Button = ({
  children,
  onClick,
  variant = "primary",
  size = "md",
  disabled,
  className = "",
  ...rest
}) => {
  const base =
    "inline-flex items-center justify-center gap-2 rounded-lg font-semibold transition-all duration-150 disabled:opacity-40 disabled:cursor-not-allowed active:scale-[0.97]";
  const sizes = {
    sm: "px-3 py-1.5 text-sm",
    md: "px-4 py-2 text-sm",
    lg: "px-6 py-3 text-base",
  };
  const variants = {
    primary:
      "bg-blue-600 text-white hover:bg-blue-700 shadow-sm shadow-blue-600/20",
    secondary:
      "bg-white text-slate-700 border border-slate-300 hover:border-blue-400 hover:text-blue-700",
    ghost: "text-slate-600 hover:bg-slate-100",
    success:
      "bg-emerald-600 text-white hover:bg-emerald-700 shadow-sm shadow-emerald-600/20",
    danger:
      "bg-rose-600 text-white hover:bg-rose-700 shadow-sm shadow-rose-600/20",
  };
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`${base} ${sizes[size]} ${variants[variant]} ${className}`}
      {...rest}
    >
      {children}
    </button>
  );
};
