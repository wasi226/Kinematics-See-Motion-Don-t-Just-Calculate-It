export const Slider = ({
  label,
  value,
  min,
  max,
  step = 1,
  onChange,
  unit = "",
  format,
  accent = "blue",
}) => {
  const accentColor =
    accent === "red" ? "#dc2626" : accent === "teal" ? "#0891b2" : "#2563eb";
  const display = format ? format(value) : `${value}${unit}`;
  return (
    <div className="w-full">
      <div className="mb-1.5 flex items-baseline justify-between gap-2">
        <label className="text-sm font-medium text-slate-700">{label}</label>
        <span
          className="rounded-md px-2 py-0.5 text-sm font-semibold tabular-nums"
          style={{ color: accentColor, background: `${accentColor}14` }}
        >
          {display}
        </span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        aria-label={`${label}: ${display}`}
        style={{ accentColor }}
        className="w-full"
      />
    </div>
  );
};
