import { useState } from "react";
import { SectionShell, SectionHeading, Card, Callout, Pill } from "../ui/Primitives";
import { Slider } from "../ui/Slider";
import { Button } from "../ui/Button";
import { Eq } from "../ui/Math";
import {
  sampleTrajectory,
  sampleTrajectoryWithDrag,
} from "../../physics/projectile";

// Section 8 — Air resistance conceptual comparison.
export const AirResistance = ({ onProgress }) => {
  const [u, setU] = useState(25);
  const [theta, setTheta] = useState(45);
  const [g, setG] = useState(9.81);
  const [dragK, setDragK] = useState(0.02);

  const ideal = sampleTrajectory(u, theta, g, 0, 120);
  const drag = sampleTrajectoryWithDrag(u, theta, g, 0, dragK, 0.02);

  const idealRange = ideal[ideal.length - 1]?.x || 0;
  const dragRange = drag[drag.length - 1]?.x || 0;
  const idealH = Math.max(...ideal.map((p) => p.y), 0);
  const dragH = Math.max(...drag.map((p) => p.y), 0);

  return (
    <SectionShell id="air-resistance">
      <SectionHeading
        id="air-resistance"
        eyebrow="1.4 · Air Resistance"
        title="What air resistance actually does"
      >
        A conceptual comparison — not a full aerodynamic model. See how drag
        changes the trajectory qualitatively.
      </SectionHeading>

      <div className="grid gap-6 lg:grid-cols-[1.5fr_1fr]">
        <Card>
          <DualTrajectoryCanvas ideal={ideal} drag={drag} />
          <div className="mt-4 grid grid-cols-2 gap-3">
            <div className="rounded-lg border border-blue-200 bg-blue-50/40 p-3">
              <p className="text-xs font-semibold text-blue-700">Ideal (no drag)</p>
              <p className="text-sm text-slate-600">Range: <strong>{idealRange.toFixed(1)} m</strong></p>
              <p className="text-sm text-slate-600">Max height: <strong>{idealH.toFixed(1)} m</strong></p>
            </div>
            <div className="rounded-lg border border-rose-200 bg-rose-50/40 p-3">
              <p className="text-xs font-semibold text-rose-700">With drag (conceptual)</p>
              <p className="text-sm text-slate-600">Range: <strong>{dragRange.toFixed(1)} m</strong></p>
              <p className="text-sm text-slate-600">Max height: <strong>{dragH.toFixed(1)} m</strong></p>
            </div>
          </div>
        </Card>

        <div className="space-y-4">
          <Card>
            <h3 className="mb-3 font-semibold text-slate-800">Controls</h3>
            <div className="space-y-4">
              <Slider label="Initial speed u" value={u} min={5} max={50} step={1} unit=" m/s" onChange={setU} />
              <Slider label="Launch angle θ" value={theta} min={0} max={90} step={1} unit="°" accent="red" onChange={setTheta} format={(v) => `${v}°`} />
              <Slider label="Drag coefficient" value={dragK} min={0} max={0.1} step={0.005} accent="slate" onChange={setDragK} format={(v) => v.toFixed(3)} />
            </div>
          </Card>
          <Callout variant="warning" title="Scientific honesty">
            This is a <Pill color="slate">conceptual model</Pill>. Drag here is a
            simple quadratic force (F = −k|v|v̂) integrated with small time steps —
            enough to show the qualitative effect, not a complete aerodynamic
            simulation. Real projectiles depend on shape, air density, and more.
          </Callout>
        </div>
      </div>

      <div className="mt-6 grid gap-4 md:grid-cols-3">
        <Card>
          <h4 className="mb-1 font-semibold text-slate-800">1. Reduced range</h4>
          <p className="text-sm text-slate-600">
            Drag opposes motion, so the projectile covers less horizontal distance
            than the ideal model predicts.
          </p>
        </Card>
        <Card>
          <h4 className="mb-1 font-semibold text-slate-800">2. Lower peak</h4>
          <p className="text-sm text-slate-600">
            Air resistance also acts upward on the way up, reducing maximum height.
          </p>
        </Card>
        <Card>
          <h4 className="mb-1 font-semibold text-slate-800">3. Asymmetric path</h4>
          <p className="text-sm text-slate-600">
            The descent is steeper than the ascent — the trajectory is no longer a
            symmetric parabola.
          </p>
        </Card>
      </div>

      <div className="mt-6">
        <Callout variant="info" title="The key takeaway">
          <Eq>{String.raw`\text{Ideal: symmetric parabola}\quad\text{Real: shorter, lower, steeper descent}`}</Eq>
          <p className="mt-2 text-sm">
            The ideal model is a useful first approximation. In exam problems,
            always state "assuming no air resistance" — and know that real life
            is messier.
          </p>
        </Callout>
      </div>
    </SectionShell>
  );
};

const DualTrajectoryCanvas = ({ ideal, drag }) => {
  const ref = useRef(null);
  useTrajRender(ref, ideal, drag);
  return <canvas ref={ref} className="w-full rounded-xl border border-slate-200 bg-gradient-to-b from-sky-50/40 to-white" style={{ height: 300 }} />;
};

import { useRef, useEffect } from "react";
function useTrajRender(ref, ideal, drag) {
  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    const dpr = window.devicePixelRatio || 1;
    const w = canvas.clientWidth;
    const ch = 300;
    canvas.width = w * dpr;
    canvas.height = ch * dpr;
    canvas.style.height = ch + "px";
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, w, ch);

    const all = [...ideal, ...drag];
    let xMax = 1, yMax = 1;
    for (const p of all) {
      xMax = Math.max(xMax, p.x);
      yMax = Math.max(yMax, p.y);
    }
    xMax *= 1.05; yMax *= 1.1;
    const padL = 40, padR = 20, padT = 16, padB = 36;
    const plotW = w - padL - padR;
    const plotH = ch - padT - padB;
    const sx = (x) => padL + (x / xMax) * plotW;
    const sy = (y) => padT + plotH - (y / yMax) * plotH;

    // axes
    ctx.strokeStyle = "#94a3b8";
    ctx.lineWidth = 1.4;
    ctx.beginPath();
    ctx.moveTo(padL, padT); ctx.lineTo(padL, padT + plotH); ctx.lineTo(padL + plotW, padT + plotH);
    ctx.stroke();
    ctx.fillStyle = "#94a3b8";
    ctx.font = "10px Inter, sans-serif";
    ctx.textAlign = "center";
    ctx.fillText("x (m)", padL + plotW / 2, ch - 8);
    ctx.save();
    ctx.translate(12, padT + plotH / 2);
    ctx.rotate(-Math.PI / 2);
    ctx.fillText("y (m)", 0, 0);
    ctx.restore();

    const drawTraj = (pts, color, dash) => {
      if (pts.length < 2) return;
      ctx.strokeStyle = color;
      ctx.lineWidth = 2.5;
      if (dash) ctx.setLineDash(dash);
      ctx.beginPath();
      ctx.moveTo(sx(pts[0].x), sy(pts[0].y));
      for (const p of pts) ctx.lineTo(sx(p.x), sy(p.y));
      ctx.stroke();
      ctx.setLineDash([]);
    };
    drawTraj(ideal, "#2563eb");
    drawTraj(drag, "#dc2626", [5, 4]);
  }, [ideal, drag, ref]);
}
