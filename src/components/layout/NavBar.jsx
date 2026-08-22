import { SECTIONS } from "./sections";

// Top navigation with progress indicator. Sticky on desktop, horizontal scroll on mobile.
export const NavBar = ({ active, completed, onNavigate, onHome }) => {
  const doneCount = Object.values(completed).filter(Boolean).length;
  const pct = Math.round((doneCount / SECTIONS.length) * 100);

  return (
    <nav className="sticky top-0 z-40 border-b border-slate-200 bg-white/90 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center gap-3 px-4 py-2.5 sm:px-6">
        <button
          onClick={onHome}
          className="flex shrink-0 items-center gap-2 text-left"
          aria-label="Go to start"
        >
          <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-blue-600 text-xs font-bold text-white">K</span>
          <span className="hidden text-sm font-semibold text-slate-800 sm:inline">Kinematics</span>
        </button>

        <div className="flex flex-1 items-center gap-1 overflow-x-auto sm:justify-center">
          {SECTIONS.map((s) => {
            const isActive = active === s.id;
            const isDone = completed[s.id];
            return (
              <button
                key={s.id}
                onClick={() => onNavigate(s.id)}
                className={`flex shrink-0 items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-medium transition sm:text-sm ${
                  isActive
                    ? "bg-blue-600 text-white"
                    : isDone
                    ? "text-emerald-700 hover:bg-emerald-50"
                    : "text-slate-500 hover:bg-slate-100"
                }`}
                aria-current={isActive ? "page" : undefined}
              >
                <span className={`flex h-4 w-4 items-center justify-center rounded-full text-[10px] ${
                  isActive ? "bg-white/25" : isDone ? "bg-emerald-100" : "bg-slate-200"
                }`}>
                  {isDone ? "✓" : s.num}
                </span>
                <span className="hidden md:inline">{s.label}</span>
              </button>
            );
          })}
        </div>

        <div className="hidden shrink-0 items-center gap-2 lg:flex">
          <div className="h-1.5 w-24 overflow-hidden rounded-full bg-slate-200">
            <div className="h-full rounded-full bg-emerald-500 transition-all" style={{ width: `${pct}%` }} />
          </div>
          <span className="text-xs font-medium text-slate-500">{pct}%</span>
        </div>
      </div>
    </nav>
  );
};
