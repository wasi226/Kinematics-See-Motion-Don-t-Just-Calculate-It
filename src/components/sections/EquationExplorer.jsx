import { useState } from "react";
import { SectionShell, SectionHeading, Card, Callout, Pill } from "../ui/Primitives";
import { Eq } from "../ui/Math";
import { EQUATIONS, recommendEquation } from "../../physics/kinematics";

const VARIABLES = ["u", "v", "a", "t", "s"];

const SCENARIOS = [
  { id: "s1", text: "Given u, a and t — find v", known: ["u", "a", "t"], target: "v" },
  { id: "s2", text: "Given u, a and t — find s", known: ["u", "a", "t"], target: "s" },
  { id: "s3", text: "Given u, a and s — find v (no time)", known: ["u", "a", "s"], target: "v" },
  { id: "s4", text: "Given u, v and t — find s (no acceleration)", known: ["u", "v", "t"], target: "s" },
  { id: "s5", text: "Given u, v and t — find a", known: ["u", "v", "t"], target: "a" },
];

// Section 5 — Equation Explorer: "which equation should I use?"
export const EquationExplorer = ({ onProgress }) => {
  const [selected, setSelected] = useState(null);
  const recommendation = selected ? recommendEquation(selected.known, selected.target) : null;

  return (
    <SectionShell id="equations">
      <SectionHeading
        id="equations"
        eyebrow="1.2 · Equation Explorer"
        title="Which equation should I use?"
      >
        Don't memorise — learn to choose. Pick a scenario and the module
        recommends the right equation, and explains why.
      </SectionHeading>

      <div className="grid gap-6 lg:grid-cols-[1fr_1.2fr]">
        <Card>
          <h3 className="mb-3 font-semibold text-slate-800">Choose a scenario</h3>
          <div className="space-y-2">
            {SCENARIOS.map((s) => (
              <button
                key={s.id}
                onClick={() => setSelected(s)}
                className={`w-full rounded-lg border px-4 py-3 text-left text-sm font-medium transition ${
                  selected?.id === s.id
                    ? "border-blue-500 bg-blue-50 text-blue-800 ring-2 ring-blue-200"
                    : "border-slate-200 bg-white text-slate-700 hover:border-blue-300 hover:bg-blue-50/40"
                }`}
              >
                {s.text}
              </button>
            ))}
          </div>
          <div className="mt-4 flex flex-wrap gap-1.5">
            {VARIABLES.map((v) => (
              <Pill key={v} color="slate">{v}</Pill>
            ))}
          </div>
          <p className="mt-2 text-xs text-slate-500">
            u = initial velocity · v = final velocity · a = acceleration · t = time · s = displacement
          </p>
        </Card>

        <div className="space-y-4">
          <Card>
            <h3 className="mb-3 font-semibold text-slate-800">The three core equations</h3>
            <Eq>{String.raw`v = u + at`}</Eq>
            <Eq>{String.raw`s = ut + \tfrac{1}{2}at^2`}</Eq>
            <Eq>{String.raw`v^2 = u^2 + 2as`}</Eq>
            <p className="mt-2 text-sm text-slate-600">
              Each equation connects four of the five variables. The art is picking
              the one that uses what you <em>know</em> and solves for what you
              <em> need</em>.
            </p>
          </Card>

          {recommendation ? (
            <Card className="kin-fade-in border-blue-300">
              <p className="text-xs font-semibold uppercase tracking-wide text-blue-600">Recommendation</p>
              <h4 className="mt-1 text-lg font-semibold text-slate-800">
                Use <MathInline>{recommendation.formula}</MathInline>
              </h4>
              <p className="mt-3 text-sm text-slate-600">{recommendation.reason}</p>
              <div className="mt-3 flex flex-wrap gap-2">
                <Pill color="emerald">Known: {recommendation.needs.join(", ")}</Pill>
                <Pill color="blue">Solves: {recommendation.gives.join(", ")}</Pill>
              </div>
            </Card>
          ) : (
            <Callout variant="info" title="Pick a scenario">
              Select a scenario on the left to see which equation fits and why.
            </Callout>
          )}
        </div>
      </div>
    </SectionShell>
  );
};

import { InlineMath } from "react-katex";
const MathInline = ({ children }) => <InlineMath math={children} />;
