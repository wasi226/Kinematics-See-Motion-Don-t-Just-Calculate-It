import { useState } from "react";
import { SectionShell, SectionHeading, Card, Callout, Pill } from "../ui/Primitives";
import { Slider } from "../ui/Slider";
import { Button } from "../ui/Button";
import { Math, Eq } from "../ui/Math";
import { Prediction } from "../learning/Prediction";

// Section 1 — Motion Basics: distance, displacement, speed, velocity.
// Interactive 1D track the student drags an object along.
export const MotionBasics = ({ onProgress }) => {
  const [position, setPosition] = useState(0); // metres, -10..10
  const [path, setPath] = useState([]); // history of positions for distance
  const [predictionDone, setPredictionDone] = useState(false);

  const handleMove = (newPos) => {
    setPath((prev) => [...prev, newPos]);
    setPosition(newPos);
  };

  const distanceTravelled = path.reduce((acc, p, i) => {
    if (i === 0) return 0;
    return acc + Math.abs(p - path[i - 1]);
  }, 0);

  const displacement = position; // start at 0

  const reset = () => {
    setPosition(0);
    setPath([]);
  };

  return (
    <SectionShell id="motion-basics">
      <SectionHeading
        id="motion-basics"
        eyebrow="1.1 · Motion Basics"
        title="Distance, displacement, speed & velocity"
      >
        Four words that students constantly confuse. Move the cart below and watch
        the difference appear.
      </SectionHeading>

      <div className="grid gap-6 lg:grid-cols-[1.4fr_1fr]">
        <Card>
          <div className="mb-4 flex items-center justify-between">
            <h3 className="font-semibold text-slate-800">Interactive track</h3>
            <Button variant="ghost" size="sm" onClick={reset}>
              Reset
            </Button>
          </div>
          <TrackCanvas position={position} onMove={handleMove} path={path} />
          <div className="mt-4">
            <Slider
              label="Cart position"
              value={position}
              min={-10}
              max={10}
              step={0.5}
              unit=" m"
              onChange={handleMove}
              format={(v) => `${v.toFixed(1)} m`}
            />
          </div>
          <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
            <Readout label="Position x" value={position.toFixed(1)} unit="m" color="#2563eb" />
            <Readout label="Distance travelled" value={distanceTravelled.toFixed(1)} unit="m" color="#0891b2" />
            <Readout label="Displacement Δx" value={displacement.toFixed(1)} unit="m" color="#7c3aed" />
            <Readout label="Start x₀" value="0.0" unit="m" color="#64748b" />
          </div>
          <p className="mt-3 text-xs text-slate-500">
            Tip: move the slider left and right several times. Distance adds up
            with every move — displacement only cares where you end up.
          </p>
        </Card>

        <div className="space-y-4">
          <Card>
            <h3 className="mb-2 font-semibold text-slate-800">The key idea</h3>
            <p className="text-sm text-slate-600">
              <strong className="text-slate-800">Distance</strong> is the total
              length of path travelled. It is a <Pill>scalar</Pill> — magnitude only.
            </p>
            <p className="mt-3 text-sm text-slate-600">
              <strong className="text-slate-800">Displacement</strong> is the change
              in position: Δx = x − x₀. It is a <Pill color="teal">vector</Pill> —
              magnitude <em>and</em> direction.
            </p>
            <Eq>{String.raw`\Delta x = x - x_0`}</Eq>
          </Card>

          <Card>
            <h3 className="mb-2 font-semibold text-slate-800">Speed vs velocity</h3>
            <Eq>{String.raw`\text{speed} = \frac{\text{distance}}{\text{time}}`}</Eq>
            <Eq>{String.raw`\text{velocity} = \frac{\text{displacement}}{\text{time}}`}</Eq>
            <p className="mt-2 text-sm text-slate-600">
              Same trip, two numbers. Run a lap of a 400 m track in 80 s: your
              <strong> speed</strong> is 5 m/s, but your <strong>velocity</strong> is
              0 m/s — you finished where you started.
            </p>
          </Card>
        </div>
      </div>

      <div className="mt-6">
        <Prediction
          question="An object moves 5 m to the right, then 5 m back to its starting point. What is its final displacement?"
          options={["0 m", "5 m", "10 m", "25 m"]}
          correctIndex={0}
          explanation="Displacement is final position minus initial position. The object returns to x₀, so Δx = 0 m. The distance travelled, however, is 10 m. This is the classic distance-vs-displacement distinction."
          formula={String.raw`\Delta x = x - x_0 = 0 - 0 = 0\,\text{m}`}
          onResolved={(ok) => {
            if (ok && !predictionDone) {
              setPredictionDone(true);
              onProgress?.("motion-basics");
            }
          }}
        />
      </div>

      <div className="mt-6">
        <Callout variant="info" title="Aha moment #1">
          Drag the cart back and forth. Notice how <em>distance</em> keeps climbing
          while <em>displacement</em> flips sign and can return to zero. That
          difference is the whole point of this section.
        </Callout>
      </div>
    </SectionShell>
  );
};

const Readout = ({ label, value, unit, color }) => (
  <div className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2">
    <p className="text-[11px] font-medium uppercase tracking-wide text-slate-500">
      {label}
    </p>
    <p className="text-lg font-semibold tabular-nums" style={{ color }}>
      {value} <span className="text-xs text-slate-400">{unit}</span>
    </p>
  </div>
);

// Canvas track rendering
const TrackCanvas = ({ position, onMove, path }) => {
  const handleCanvas = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const frac = (x - 20) / (rect.width - 40);
    const pos = Math.max(-10, Math.min(10, frac * 20 - 10));
    onMove(Math.round(pos * 2) / 2);
  };
  return (
    <div
      onClick={handleCanvas}
      onKeyDown={(e) => {
        if (e.key === "ArrowLeft") onMove(Math.max(-10, position - 0.5));
        if (e.key === "ArrowRight") onMove(Math.min(10, position + 0.5));
      }}
      tabIndex={0}
      role="slider"
      aria-label="Cart position slider"
      aria-valuemin={-10}
      aria-valuemax={10}
      aria-valuenow={position}
      className="relative w-full cursor-pointer rounded-xl border border-slate-200 bg-gradient-to-b from-slate-50 to-white focus:outline-none focus:ring-2 focus:ring-blue-500"
      style={{ height: 120 }}
    >
      <svg width="100%" height="100%" viewBox="0 0 600 120" preserveAspectRatio="none" className="absolute inset-0 pointer-events-none">
        {/* track line */}
        <line x1="20" y1="70" x2="580" y2="70" stroke="#cbd5e1" strokeWidth="2" />
        {/* ticks */}
        {Array.from({ length: 21 }).map((_, i) => {
          const tx = 20 + (560 * i) / 20;
          const isMajor = i % 5 === 0;
          return (
            <g key={i}>
              <line x1={tx} y1="70" x2={tx} y2={isMajor ? 80 : 75} stroke={isMajor ? "#94a3b8" : "#cbd5e1"} strokeWidth={isMajor ? 1.5 : 1} />
              {isMajor && (
                <text x={tx} y="94" fontSize="10" fill="#64748b" textAnchor="middle">
                  {-10 + i}
                </text>
              )}
            </g>
          );
        })}
        {/* start marker */}
        <line x1="300" y1="50" x2="300" y2="80" stroke="#10b981" strokeWidth="2" strokeDasharray="3 3" />
        <text x="300" y="44" fontSize="10" fill="#10b981" textAnchor="middle">x₀</text>
        {/* displacement vector */}
        <line x1="300" y1="70" x2={300 + position * 28} y2="70" stroke="#7c3aed" strokeWidth="3" opacity="0.6" />
        {/* particle */}
        <circle cx={300 + position * 28} cy="70" r="10" fill="#2563eb" stroke="#fff" strokeWidth="2" />
      </svg>
      <div className="absolute inset-x-0 bottom-2 text-center text-[10px] text-slate-400">
        Click or tap the track to move the cart
      </div>
    </div>
  );
};
