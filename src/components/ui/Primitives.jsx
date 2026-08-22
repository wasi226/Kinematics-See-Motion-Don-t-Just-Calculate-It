export const Card = ({ children, className = "", as: Tag = "div" }) => (
  <Tag
    className={`rounded-2xl border border-slate-200 bg-white p-5 shadow-sm ${className}`}
  >
    {children}
  </Tag>
);

export const SectionShell = ({ id, children, className = "" }) => (
  <section
    id={id}
    className={`mx-auto w-full max-w-6xl px-4 py-10 sm:px-6 md:py-14 ${className}`}
    aria-labelledby={`${id}-title`}
  >
    {children}
  </section>
);

export const SectionHeading = ({ id, eyebrow, title, children }) => (
  <div className="mb-6 max-w-2xl">
    {eyebrow && (
      <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-blue-600">
        {eyebrow}
      </p>
    )}
    <h2
      id={`${id}-title`}
      className="font-[Fraunces] text-3xl font-semibold leading-tight text-slate-900 sm:text-4xl"
    >
      {title}
    </h2>
    {children && <p className="mt-3 text-base text-slate-600">{children}</p>}
  </div>
);

export const Pill = ({ children, color = "blue" }) => {
  const colors = {
    blue: "bg-blue-50 text-blue-700 border-blue-200",
    teal: "bg-teal-50 text-teal-700 border-teal-200",
    red: "bg-rose-50 text-rose-700 border-rose-200",
    emerald: "bg-emerald-50 text-emerald-700 border-emerald-200",
    slate: "bg-slate-100 text-slate-700 border-slate-200",
  };
  return (
    <span
      className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium ${colors[color]}`}
    >
      {children}
    </span>
  );
};

export const Callout = ({ children, variant = "info", title }) => {
  const styles = {
    info: "border-blue-200 bg-blue-50/60",
    success: "border-emerald-200 bg-emerald-50/60",
    warning: "border-amber-200 bg-amber-50/60",
    danger: "border-rose-200 bg-rose-50/60",
  };
  const titleColor = {
    info: "text-blue-700",
    success: "text-emerald-700",
    warning: "text-amber-700",
    danger: "text-rose-700",
  };
  return (
    <div className={`rounded-xl border p-4 ${styles[variant]}`}>
      {title && (
        <p className={`mb-1 text-sm font-semibold ${titleColor[variant]}`}>
          {title}
        </p>
      )}
      <div className="text-sm text-slate-700">{children}</div>
    </div>
  );
};
