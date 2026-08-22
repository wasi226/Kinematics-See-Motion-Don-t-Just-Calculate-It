import { useState } from "react";
import { SectionShell, SectionHeading, Card, Callout, Pill } from "../ui/Primitives";
import { Button } from "../ui/Button";
import { Eq } from "../ui/Math";

// Section 6 — Worked example with reveal-steps and a final motion visual.
export const WorkedExample = ({ onProgress }) => {
  const [step, setStep] = useState(0);
  const steps = [
    {
      title: "Step 1 — Identify known values",
      content: (
        <>
          <p className="text-sm text-slate-600">A car starts from rest and accelerates uniformly at 2 m/s² for 5 seconds.</p>
          <div className="mt-2 flex flex-wrap gap-2">
            <Pill color="slate">u = 0 m/s</Pill>
            <Pill color="red">a = 2 m/s²</Pill>
            <Pill color="teal">t = 5 s</Pill>
          </div>
        </>
      ),
    },
    {
      title: "Step 2 — Identify unknowns",
      content: (
        <p className="text-sm text-slate-600">
          We need the final velocity <strong>v</strong> and the displacement{" "}
          <strong>s</strong>.
        </p>
      ),
    },
    {
      title: "Step 3 — Select equations",
      content: (
        <>
          <p className="mb-2 text-sm text-slate-600">
            We know u, a, t. For v use the equation with u, a, t; for s use the
            displacement equation:
          </p>
          <Eq>{String.raw`v = u + at`}</Eq>
          <Eq>{String.raw`s = ut + \tfrac{1}{2}at^2`}</Eq>
        </>
      ),
    },
    {
      title: "Step 4 — Substitute",
      content: (
        <>
          <Eq>{String.raw`v = 0 + (2)(5) = 10\,\text{m/s}`}</Eq>
          <Eq>{String.raw`s = (0)(5) + \tfrac{1}{2}(2)(5^2) = 0 + 25 = 25\,\text{m}`}</Eq>
        </>
      ),
    },
    {
      title: "Step 5 — State the answer",
      content: (
        <div className="space-y-1 text-sm text-slate-600">
          <p>Final velocity: <strong className="text-teal-600">v = 10 m/s</strong></p>
          <p>Displacement: <strong className="text-blue-600">s = 25 m</strong></p>
        </div>
      ),
    },
    {
      title: "Step 6 — Interpret",
      content: (
        <p className="text-sm text-slate-600">
          In 5 s the car reaches 10 m/s (about 36 km/h) and covers 25 m. Because
          acceleration is uniform, the velocity–time graph is a straight line from
          0 to 10 m/s, and the area under it (a triangle: ½ × 5 × 10 = 25) exactly
          matches the displacement — a good consistency check.
        </p>
      ),
    },
  ];

  const done = step >= steps.length - 1;
  const allRevealed = step === steps.length - 1;

  return (
    <SectionShell id="worked">
      <SectionHeading
        id="worked"
        eyebrow="1.2 · Worked Example"
        title="Solve it step by step"
      >
        Reveal one step at a time. Don't jump to the answer — work through the
        reasoning.
      </SectionHeading>

      <div className="grid gap-6 lg:grid-cols-[1.2fr_1fr]">
        <Card>
          <div className="mb-4 flex items-center justify-between">
            <h3 className="font-semibold text-slate-800">
              Step {step + 1} of {steps.length}
            </h3>
            <div className="flex gap-2">
              <Button size="sm" variant="ghost" onClick={() => setStep(0)} disabled={step === 0}>
                Restart
              </Button>
            </div>
          </div>

          {/* progress bar */}
          <div className="mb-4 h-1.5 w-full overflow-hidden rounded-full bg-slate-200">
            <div
              className="h-full rounded-full bg-blue-600 transition-all duration-300"
              style={{ width: `${((step + 1) / steps.length) * 100}%` }}
            />
          </div>

          <div className="rounded-xl border border-slate-200 bg-slate-50/60 p-4 kin-fade-in" key={step}>
            <h4 className="mb-2 font-semibold text-slate-800">{steps[step].title}</h4>
            {steps[step].content}
          </div>

          <div className="mt-4 flex justify-between">
            <Button size="sm" variant="secondary" onClick={() => setStep((s) => Math.max(0, s - 1))} disabled={step === 0}>
              ← Previous
            </Button>
            <Button size="sm" onClick={() => setStep((s) => Math.min(steps.length - 1, s + 1))} disabled={done}>
              Next step →
            </Button>
          </div>
        </Card>

        <div className="space-y-4">
          <Card>
            <h3 className="mb-2 font-semibold text-slate-800">Motion at a glance</h3>
            {allRevealed ? (
              <ResultVisual />
            ) : (
              <p className="text-sm text-slate-500">
                Complete all steps to see the motion visualised.
              </p>
            )}
          </Card>
          {allRevealed && (
            <Callout variant="success" title="Consistency check">
              The area under the v–t triangle (½ × 5 × 10 = 25 m) equals the
              displacement we computed. Two methods, same answer.
            </Callout>
          )}
        </div>
      </div>
    </SectionShell>
  );
};

// Simple SVG visual of the final motion
const ResultVisual = () => {
  const width = 400, height = 120;
  return (
    <svg viewBox={`0 0 ${width} ${height}`} className="w-full" style={{ maxHeight: 140 }}>
      <line x1="20" y1="80" x2={width - 20} y2="80" stroke="#cbd5e1" strokeWidth="2" />
      {/* start */}
      <circle cx="40" cy="80" r="6" fill="#10b981" />
      <text x="40" y="100" fontSize="10" fill="#10b981" textAnchor="middle">0 m</text>
      {/* end */}
      <circle cx={width - 40} cy="80" r="6" fill="#2563eb" />
      <text x={width - 40} y="100" fontSize="10" fill="#2563eb" textAnchor="middle">25 m</text>
      {/* arrow */}
      <line x1="48" y1="80" x2={width - 48} y2="80" stroke="#2563eb" strokeWidth="2" strokeDasharray="4 3" />
      <text x={width / 2} y="70" fontSize="11" fill="#2563eb" textAnchor="middle">v = 10 m/s after 5 s</text>
    </svg>
  );
};
