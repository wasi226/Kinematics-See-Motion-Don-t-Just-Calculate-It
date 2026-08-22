import { useState } from "react";
import { SectionShell, SectionHeading, Card, Callout } from "../ui/Primitives";
import { Slider } from "../ui/Slider";
import { Eq } from "../ui/Math";
import { LineGraph } from "../graphs/LineGraph";
import { sampleMotion, calculateVelocity, areaUnderVT, toFixed } from "../../physics/kinematics";

// Section 4 — Motion graphs: linked position/velocity/acceleration graphs,
// slope teaching, and area under v-t.
export const MotionGraphs = ({ onProgress }) => {
  const [u, setU] = useState(4);
  const [a, setA] = useState(2);
  const [tMax] = useState(6);
  const [slopeT, setSlopeT] = useState(3); // time point for slope demo
  const [areaT1, setAreaT1] = useState(1);
  const [areaT2, setAreaT2] = useState(5);

  const samples = sampleMotion(u, a, tMax, 120);
  const xSeries = { points: samples.map((p) => ({ x: p.t, y: p.x })), color: "#2563eb" };
  const vSeries = { points: samples.map((p) => ({ x: p.t, y: p.v })), color: "#0891b2" };
  const aSeries = { points: samples.map((p) => ({ x: p.t, y: p.a })), color: "#dc2626" };

  const vAtSlope = calculateVelocity(u, a, slopeT);
  const area = areaUnderVT(u, a, areaT1, areaT2);

  return (
    <SectionShell id="graphs">
      <SectionHeading
        id="graphs"
        eyebrow="1.3 · Graphs of Motion"
        title="Graphs that talk to each other"
      >
        Position, velocity and acceleration are three views of the same motion.
        Here they are linked — and you can interrogate the slopes and areas.
      </SectionHeading>

      <div className="mb-6">
        <Card>
          <div className="flex flex-wrap items-end gap-4">
            <div className="min-w-[180px] flex-1">
              <Slider label="Initial velocity u" value={u} min={0} max={15} step={0.5} unit=" m/s" onChange={setU} />
            </div>
            <div className="min-w-[180px] flex-1">
              <Slider label="Acceleration a" value={a} min={-4} max={4} step={0.5} unit=" m/s²" accent="red" onChange={setA} />
            </div>
          </div>
        </Card>
      </div>

      {/* Linked graphs with cursor at slopeT */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <h4 className="mb-2 text-sm font-semibold text-slate-700">Position–time</h4>
          <LineGraph
            series={[xSeries]}
            xLabel="t (s)" yLabel="s (m)"
            cursor={{ x: slopeT, color: "#0f172a" }}
            marker={{ x: slopeT, y: samples[Math.round((slopeT / tMax) * 120)]?.x ?? 0, color: "#2563eb" }}
            height={200}
          />
        </Card>
        <Card>
          <h4 className="mb-2 text-sm font-semibold text-slate-700">Velocity–time</h4>
          <LineGraph
            series={[vSeries]}
            xLabel="t (s)" yLabel="v (m/s)"
            cursor={{ x: slopeT, color: "#0f172a" }}
            marker={{ x: slopeT, y: vAtSlope, color: "#0891b2" }}
            shadeArea={{ x1: areaT1, x2: areaT2, color: "rgba(8,145,178,0.18)" }}
            height={200}
          />
        </Card>
        <Card>
          <h4 className="mb-2 text-sm font-semibold text-slate-700">Acceleration–time</h4>
          <LineGraph
            series={[aSeries]}
            xLabel="t (s)" yLabel="a (m/s²)"
            cursor={{ x: slopeT, color: "#0f172a" }}
            marker={{ x: slopeT, y: a, color: "#dc2626" }}
            height={200}
          />
        </Card>
      </div>

      {/* Slope teaching */}
      <div className="mt-6 grid gap-4 md:grid-cols-2">
        <Card>
          <h3 className="mb-1 font-semibold text-slate-800">Slope = rate of change</h3>
          <p className="mb-3 text-sm text-slate-600">
            Drag the time slider. The red triangle shows the tangent slope at that
            instant on the position–time graph — that slope <em>is</em> the velocity.
          </p>
          <Slider label="Time point" value={slopeT} min={0.5} max={tMax - 0.5} step={0.5} unit=" s" accent="red" onChange={setSlopeT} />
          <div className="mt-4">
            <LineGraph
              series={[xSeries]}
              xLabel="t (s)" yLabel="s (m)"
              showSlope={{ x: slopeT, dx: 1, color: "#dc2626" }}
              marker={{ x: slopeT, y: samples[Math.round((slopeT / tMax) * 120)]?.x ?? 0, color: "#2563eb" }}
              height={200}
            />
          </div>
          <div className="mt-3 rounded-lg bg-rose-50 px-3 py-2 text-sm text-rose-700">
            Slope of x–t at t={toFixed(slopeT)} s = velocity ≈ <strong>{toFixed(vAtSlope)} m/s</strong>
          </div>
        </Card>

        <Card>
          <h3 className="mb-1 font-semibold text-slate-800">Area = displacement</h3>
          <p className="mb-3 text-sm text-slate-600">
            Adjust the interval. The shaded area under the velocity–time graph
            equals the displacement over that interval.
          </p>
          <div className="space-y-3">
            <Slider label="Start t₁" value={areaT1} min={0} max={areaT2 - 0.5} step={0.5} unit=" s" accent="teal" onChange={setAreaT1} />
            <Slider label="End t₂" value={areaT2} min={areaT1 + 0.5} max={tMax} step={0.5} unit=" s" accent="teal" onChange={setAreaT2} />
          </div>
          <div className="mt-4">
            <LineGraph
              series={[vSeries]}
              xLabel="t (s)" yLabel="v (m/s)"
              shadeArea={{ x1: areaT1, x2: areaT2, color: "rgba(8,145,178,0.22)" }}
              marker={{ x: areaT1, y: calculateVelocity(u, a, areaT1), color: "#0891b2" }}
              height={200}
            />
          </div>
          <div className="mt-3 rounded-lg bg-teal-50 px-3 py-2 text-sm text-teal-700">
            Shaded area = displacement = <strong>{toFixed(area)} m</strong>
          </div>
        </Card>
      </div>

      <div className="mt-6">
        <Callout variant="info" title="The two rules to remember">
          <div className="grid gap-2 sm:grid-cols-2">
            <div>
              <Eq>{String.raw`\text{slope of } x\text{–}t = \frac{\Delta x}{\Delta t} = v`}</Eq>
            </div>
            <div>
              <Eq>{String.raw`\text{area under } v\text{–}t = \int v\,dt = \Delta x`}</Eq>
            </div>
          </div>
          <p className="mt-2 text-sm">
            The same logic chains: slope of v–t gives acceleration; area under a–t
            gives change in velocity.
          </p>
        </Callout>
      </div>
    </SectionShell>
  );
};
