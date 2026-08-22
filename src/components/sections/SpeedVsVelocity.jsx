import { useState } from "react";
import { SectionShell, SectionHeading, Card, Callout, Pill } from "../ui/Primitives";
import { Slider } from "../ui/Slider";
import { Eq } from "../ui/Math";

// Section 2 — Speed vs Velocity: interactive example with distance, time, direction.
export const SpeedVsVelocity = ({ onProgress }) => {
  const [distance, setDistance] = useState(20); // total path length (m)
  const [time, setTime] = useState(4); // seconds
  const [direction, setDirection] = useState(1); // +1 or -1

  const avgSpeed = time > 0 ? distance / time : 0;
  const displacement = direction * distance; // returns to start scenario removed; simple directed
  const avgVelocity = time > 0 ? displacement / time : 0;

  return (
    <SectionShell id="speed-velocity">
      <SectionHeading
        id="speed-velocity"
        eyebrow="1.1 · Speed vs Velocity"
        title="Direction changes everything"
      >
        Same distance, same time — but velocity depends on which way you go.
      </SectionHeading>

      <div className="grid gap-6 lg:grid-cols-[1fr_1fr]">
        <Card>
          <div className="space-y-5">
            <Slider
              label="Distance travelled"
              value={distance}
              min={1}
              max={100}
              step={1}
              unit=" m"
              onChange={setDistance}
              format={(v) => `${v} m`}
            />
            <Slider
              label="Time taken"
              value={time}
              min={0.5}
              max={20}
              step={0.5}
              unit=" s"
              accent="teal"
              onChange={setTime}
              format={(v) => `${v} s`}
            />
            <div>
              <p className="mb-2 text-sm font-medium text-slate-700">Direction</p>
              <div className="inline-flex rounded-lg border border-slate-200 bg-slate-50 p-1">
                <button
                  onClick={() => setDirection(1)}
                  className={`rounded-md px-4 py-1.5 text-sm font-medium transition ${direction === 1 ? "bg-blue-600 text-white" : "text-slate-600 hover:bg-white"}`}
                >
                  → Right (+)
                </button>
                <button
                  onClick={() => setDirection(-1)}
                  className={`rounded-md px-4 py-1.5 text-sm font-medium transition ${direction === -1 ? "bg-blue-600 text-white" : "text-slate-600 hover:bg-white"}`}
                >
                  ← Left (−)
                </button>
              </div>
            </div>
          </div>

          <div className="mt-6 grid grid-cols-2 gap-3">
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Average speed</p>
              <p className="mt-1 text-2xl font-bold tabular-nums text-teal-600">
                {avgSpeed.toFixed(2)} <span className="text-sm text-slate-400">m/s</span>
              </p>
              <p className="mt-1 text-xs text-slate-500"><Pill>scalar</Pill></p>
            </div>
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Average velocity</p>
              <p className="mt-1 text-2xl font-bold tabular-nums text-blue-600">
                {avgVelocity.toFixed(2)} <span className="text-sm text-slate-400">m/s</span>
              </p>
              <p className="mt-1 text-xs text-slate-500"><Pill color="teal">vector</Pill></p>
            </div>
          </div>
        </Card>

        <div className="space-y-4">
          <Card>
            <h3 className="mb-2 font-semibold text-slate-800">The formulas</h3>
            <Eq>{String.raw`\text{average speed} = \frac{\text{total distance}}{\text{total time}}`}</Eq>
            <Eq>{String.raw`\text{average velocity} = \frac{\text{displacement}}{\text{total time}}`}</Eq>
            <p className="mt-2 text-sm text-slate-600">
              Speed is always positive. Velocity carries a sign — flip the direction
              and velocity flips too, while speed stays the same.
            </p>
          </Card>
          <Callout variant="info" title="Try it">
            Set the same distance and time, then switch direction. Watch velocity
            change sign while speed is unchanged. That sign is what makes velocity
            a vector.
          </Callout>
          <button
            className="hidden"
            onClick={() => onProgress?.("speed-velocity")}
            aria-hidden
          />
        </div>
      </div>
    </SectionShell>
  );
};
