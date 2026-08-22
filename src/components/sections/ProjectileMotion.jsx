import { useState, useRef, useEffect } from "react";
import { SectionShell, SectionHeading, Card, Callout, Pill } from "../ui/Primitives";
import { Slider } from "../ui/Slider";
import { Button } from "../ui/Button";
import { Eq, Math } from "../ui/Math";
import { LineGraph } from "../graphs/LineGraph";
import { Prediction } from "../learning/Prediction";
import {
  velocityComponents,
  calculateProjectilePosition,
  calculateProjectileVelocity,
  timeOfFlight,
  maximumHeight,
  calculateRange,
  sampleTrajectory,
  toRadians,
  toDegrees,
  safeNumber,
} from "../../physics/projectile";

// Section 7 — Projectile Motion: the visual centerpiece.
export const ProjectileMotion = ({ onProgress }) => {
  const [u, setU] = useState(25);
  const [theta, setTheta] = useState(45);
  const [g, setG] = useState(9.81);
  const [h, setH] = useState(0);
  const [showVectors, setShowVectors] = useState(true);
  const [showGraphs, setShowGraphs] = useState(false);
  const [compareMode, setCompareMode] = useState(false);
  const [thetaB, setThetaB] = useState(60);
  const [running, setRunning] = useState(false);
  const [t, setT] = useState(0);
  const [predDone, setPredDone] = useState(false);

  const T = timeOfFlight(u, theta, g, h);
  const traj = sampleTrajectory(u, theta, g, h, 120);
  const trajB = compareMode ? sampleTrajectory(u, thetaB, g, h, 120) : [];
  const range = h === 0 ? calculateRange(u, theta, g) : traj[traj.length - 1]?.x || 0;
  const maxH = maximumHeight(u, theta, g) + h;
  const sameHeight = h === 0;

  // animation
  const rafRef = useRef(null);
  const lastRef = useRef(0);
  useEffect(() => {
    if (!running) return;
    const loop = (now) => {
      if (!lastRef.current) lastRef.current = now;
      const dt = (now - lastRef.current) / 1000;
      lastRef.current = now;
      setT((prev) => {
        const next = prev + dt;
        if (next >= T) {
          setRunning(false);
          return T;
        }
        return next;
      });
      rafRef.current = requestAnimationFrame(loop);
    };
    rafRef.current = requestAnimationFrame(loop);
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      lastRef.current = 0;
    };
  }, [running, T]);

  const reset = () => {
    setRunning(false);
    setT(0);
    lastRef.current = 0;
  };

  const pos = calculateProjectilePosition(u, theta, g, t, h);
  const vel = calculateProjectileVelocity(u, theta, g, t);
  const { vx, vy } = velocityComponents(u, theta);

  // graphs
  const gx = { points: traj.map((p) => ({ x: p.t, y: p.x })), color: "#2563eb" };
  const gy = { points: traj.map((p) => ({ x: p.t, y: p.y })), color: "#0891b2" };
  const gvx = { points: traj.map((p) => ({ x: p.t, y: velocityComponents(u, theta).vx })), color: "#7c3aed" };
  const gvy = { points: traj.map((p) => ({ x: p.t, y: calculateProjectileVelocity(u, theta, g, p.t).vy })), color: "#dc2626" };

  return (
    <SectionShell id="projectile">
      <SectionHeading
        id="projectile"
        eyebrow="1.4 · Projectile Motion"
        title="Launch it. Watch it fly."
      >
        The visual centerpiece. Adjust speed, angle and gravity, then launch.
        See the trajectory, the velocity components, and the physics behind it.
      </SectionHeading>

      {/* Predict before you launch */}
      <div className="mb-6">
        <Prediction
          question="What launch angle do you think will produce the greatest range (for equal launch and landing height)?"
          options={["30°", "45°", "60°", "90°"]}
          correctIndex={1}
          explanation="For ideal projectile motion with equal launch and landing height, range R = u²sin(2θ)/g is maximised when sin(2θ)=1, i.e. θ = 45°. At 30° and 60° the ranges are equal and shorter; at 90° the range is zero. Test it below!"
          formula={String.raw`R = \frac{u^2 \sin(2\theta)}{g}\quad\text{max at }\theta=45^\circ`}
          onResolved={(ok) => {
            if (ok && !predDone) {
              setPredDone(true);
              onProgress?.("projectile");
            }
          }}
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.6fr_1fr]">
        {/* Simulator canvas */}
        <Card>
          <ProjectileCanvas
            traj={traj}
            trajB={trajB}
            pos={pos}
            vel={vel}
            showVectors={showVectors}
            u={u} theta={theta} g={g} h={h}
            compareMode={compareMode}
            t={t} T={T}
          />
          <div className="mt-4 flex flex-wrap items-center gap-2">
            <Button size="sm" onClick={() => { if (t >= T) reset(); setRunning((r) => !r); }} disabled={t >= T && !running}>
              {running ? "Pause" : t >= T ? "Done" : "Launch"}
            </Button>
            <Button size="sm" variant="secondary" onClick={reset}>Reset</Button>
            <label className="ml-2 flex items-center gap-1.5 text-sm text-slate-600">
              <input type="checkbox" checked={showVectors} onChange={(e) => setShowVectors(e.target.checked)} className="accent-blue-600" />
              Vectors
            </label>
            <label className="flex items-center gap-1.5 text-sm text-slate-600">
              <input type="checkbox" checked={compareMode} onChange={(e) => { setCompareMode(e.target.checked); reset(); }} className="accent-blue-600" />
              Compare
            </label>
            <label className="flex items-center gap-1.5 text-sm text-slate-600">
              <input type="checkbox" checked={showGraphs} onChange={(e) => setShowGraphs(e.target.checked)} className="accent-blue-600" />
              Graphs
            </label>
          </div>
        </Card>

        {/* Controls + readouts */}
        <div className="space-y-4">
          <Card>
            <h3 className="mb-3 font-semibold text-slate-800">Controls</h3>
            <div className="space-y-4">
              <Slider label="Initial speed u" value={u} min={5} max={50} step={1} unit=" m/s" onChange={(v) => { setU(v); reset(); }} />
              <Slider label="Launch angle θ" value={theta} min={0} max={90} step={1} unit="°" accent="red" onChange={(v) => { setTheta(v); reset(); }} format={(v) => `${v}°`} />
              <Slider label="Gravity g" value={g} min={1} max={25} step={0.01} unit=" m/s²" accent="teal" onChange={(v) => { setG(v); reset(); }} format={(v) => `${v.toFixed(2)}`} />
              <Slider label="Initial height h" value={h} min={0} max={20} step={0.5} unit=" m" accent="slate" onChange={(v) => { setH(v); reset(); }} />
              {compareMode && (
                <Slider label="Launch B angle θ" value={thetaB} min={0} max={90} step={1} unit="°" accent="red" onChange={(v) => { setThetaB(v); reset(); }} format={(v) => `${v}°`} />
              )}
            </div>
          </Card>

          <Card>
            <h3 className="mb-2 font-semibold text-slate-800">Live values</h3>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <Readout label="Time" value={safeNumber(t)} unit="s" />
              <Readout label="x" value={safeNumber(pos.x)} unit="m" />
              <Readout label="y" value={safeNumber(pos.y)} unit="m" />
              <Readout label="vx" value={safeNumber(vel.vx)} unit="m/s" />
              <Readout label="vy" value={safeNumber(vel.vy)} unit="m/s" />
              <Readout label="Speed" value={safeNumber(Math.sqrt(vel.vx ** 2 + vel.vy ** 2))} unit="m/s" />
            </div>
            <div className="mt-3 grid grid-cols-3 gap-2 border-t border-slate-200 pt-3">
              <Readout label="Range" value={safeNumber(range)} unit="m" color="#2563eb" />
              <Readout label="Max height" value={safeNumber(maxH)} unit="m" color="#0891b2" />
              <Readout label="Time of flight" value={safeNumber(T)} unit="s" color="#7c3aed" />
            </div>
          </Card>
        </div>
      </div>

      {/* Physics equations */}
      <div className="mt-6 grid gap-4 md:grid-cols-2">
        <Card>
          <h3 className="mb-2 font-semibold text-slate-800">The equations of motion</h3>
          <Eq>{String.raw`x = u\cos(\theta)\,t`}</Eq>
          <Eq>{String.raw`y = h + u\sin(\theta)\,t - \tfrac{1}{2}gt^2`}</Eq>
          <Eq>{String.raw`v_x = u\cos(\theta)\quad(\text{constant})`}</Eq>
          <Eq>{String.raw`v_y = u\sin(\theta) - gt`}</Eq>
        </Card>
        <Card>
          <h3 className="mb-2 font-semibold text-slate-800">
            Simplified formulas {sameHeight ? "" : "(not valid — h ≠ 0)"}
          </h3>
          {sameHeight ? (
            <>
              <Eq>{String.raw`T = \frac{2u\sin(\theta)}{g}`}</Eq>
              <Eq>{String.raw`H = \frac{u^2\sin^2(\theta)}{2g}`}</Eq>
              <Eq>{String.raw`R = \frac{u^2\sin(2\theta)}{g}`}</Eq>
            </>
          ) : (
            <Callout variant="warning" title="Assumption not met">
              The simplified range formula <Math>{String.raw`R = u^2\sin(2\theta)/g`}</Math>{" "}
              assumes the projectile lands at the <strong>same height</strong> it
              was launched from. Set h = 0 to use it. With h ≠ 0, the range is
              computed numerically from the full trajectory.
            </Callout>
          )}
        </Card>
      </div>

      {/* Assumptions */}
      <div className="mt-6">
        <Callout variant="info" title="Assumptions (state them in your exam)">
          <ul className="ml-4 list-disc space-y-1 text-sm">
            <li>No air resistance</li>
            <li>Uniform gravitational acceleration g</li>
            <li>Flat Earth approximation (g points straight down)</li>
            <li>Same launch and landing height for the simplified range formula</li>
          </ul>
        </Callout>
      </div>

      {/* Aha moment 3 */}
      <div className="mt-6">
        <Callout variant="info" title="Aha moment #3">
          Change the angle and relaunch. Watch the trajectory reshape, the range
          change, and vy shrink to zero at the peak then grow negative. vx never
          changes — horizontal and vertical motion are independent.
        </Callout>
      </div>

      {/* Optional graphs via progressive disclosure */}
      {showGraphs && (
        <div className="mt-6 kin-fade-in">
          <h3 className="mb-3 font-semibold text-slate-800">Projectile graphs</h3>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <Card>
              <h4 className="mb-1 text-xs font-semibold text-slate-600">x vs t</h4>
              <LineGraph series={[gx]} xLabel="t" yLabel="x (m)" cursor={{ x: t }} height={150} />
            </Card>
            <Card>
              <h4 className="mb-1 text-xs font-semibold text-slate-600">y vs t</h4>
              <LineGraph series={[gy]} xLabel="t" yLabel="y (m)" cursor={{ x: t }} height={150} />
            </Card>
            <Card>
              <h4 className="mb-1 text-xs font-semibold text-slate-600">vx vs t</h4>
              <LineGraph series={[gvx]} xLabel="t" yLabel="vx (m/s)" cursor={{ x: t }} height={150} />
            </Card>
            <Card>
              <h4 className="mb-1 text-xs font-semibold text-slate-600">vy vs t</h4>
              <LineGraph series={[gvy]} xLabel="t" yLabel="vy (m/s)" cursor={{ x: t }} height={150} />
            </Card>
          </div>
        </div>
      )}

      {/* Comparison summary */}
      {compareMode && (
        <div className="mt-6 kin-fade-in">
          <Card>
            <h3 className="mb-3 font-semibold text-slate-800">Comparison: A vs B</h3>
            <CompareTable
              a={{ u, theta, g, h }}
              b={{ u, theta: thetaB, g, h }}
            />
          </Card>
        </div>
      )}
    </SectionShell>
  );
};

const Readout = ({ label, value, unit, color = "#0f172a" }) => (
  <div className="rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1.5">
    <p className="text-[10px] font-medium uppercase tracking-wide text-slate-500">{label}</p>
    <p className="text-base font-semibold tabular-nums" style={{ color }}>
      {value} <span className="text-[10px] text-slate-400">{unit}</span>
    </p>
  </div>
);

const CompareTable = ({ a, b }) => {
  const Ta = timeOfFlight(a.u, a.theta, a.g, a.h);
  const Tb = timeOfFlight(b.u, b.theta, b.g, b.h);
  const Ra = a.h === 0 ? calculateRange(a.u, a.theta, a.g) : sampleTrajectory(a.u, a.theta, a.g, a.h).at(-1)?.x || 0;
  const Rb = b.h === 0 ? calculateRange(b.u, b.theta, b.g) : sampleTrajectory(b.u, b.theta, b.g, b.h).at(-1)?.x || 0;
  const Ha = maximumHeight(a.u, a.theta, a.g) + a.h;
  const Hb = maximumHeight(b.u, b.theta, b.g) + b.h;
  const rows = [
    ["Angle", `${a.theta}°`, `${b.theta}°`],
    ["Range", `${safeNumber(Ra)} m`, `${safeNumber(Rb)} m`],
    ["Max height", `${safeNumber(Ha)} m`, `${safeNumber(Hb)} m`],
    ["Time of flight", `${safeNumber(Ta)} s`, `${safeNumber(Tb)} s`],
  ];
  return (
    <table className="w-full text-sm">
      <thead>
        <tr className="border-b border-slate-200 text-left text-xs uppercase text-slate-500">
          <th className="py-2">Quantity</th>
          <th className="py-2 text-blue-700">Launch A (θ={a.theta}°)</th>
          <th className="py-2 text-rose-700">Launch B (θ={b.theta}°)</th>
        </tr>
      </thead>
      <tbody>
        {rows.map(([label, va, vb]) => (
          <tr key={label} className="border-b border-slate-100">
            <td className="py-2 font-medium text-slate-700">{label}</td>
            <td className="py-2 tabular-nums text-slate-800">{va}</td>
            <td className="py-2 tabular-nums text-slate-800">{vb}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
};

// Canvas projectile renderer
const ProjectileCanvas = ({ traj, trajB, pos, vel, showVectors, u, theta, g, h, compareMode, t, T }) => {
  const ref = useRef(null);
  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    const dpr = window.devicePixelRatio || 1;
    const w = canvas.clientWidth;
    const ch = 320;
    canvas.width = w * dpr;
    canvas.height = ch * dpr;
    canvas.style.height = ch + "px";
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, w, ch);

    // compute world bounds
    const allPts = [...traj, ...trajB];
    if (allPts.length === 0) return;
    let xMax = 1, yMax = 1;
    for (const p of allPts) {
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
    ctx.moveTo(padL, padT);
    ctx.lineTo(padL, padT + plotH);
    ctx.lineTo(padL + plotW, padT + plotH);
    ctx.stroke();

    // launch height line
    if (h > 0) {
      ctx.strokeStyle = "#cbd5e1";
      ctx.setLineDash([4, 4]);
      ctx.beginPath();
      ctx.moveTo(padL, sy(h));
      ctx.lineTo(padL + plotW, sy(h));
      ctx.stroke();
      ctx.setLineDash([]);
    }

    // grid labels
    ctx.fillStyle = "#94a3b8";
    ctx.font = "10px Inter, sans-serif";
    ctx.textAlign = "center";
    ctx.fillText("x (m)", padL + plotW / 2, ch - 8);
    ctx.save();
    ctx.translate(12, padT + plotH / 2);
    ctx.rotate(-Math.PI / 2);
    ctx.fillText("y (m)", 0, 0);
    ctx.restore();
    for (let i = 0; i <= 4; i++) {
      const xv = (xMax * i) / 4;
      ctx.textAlign = "center";
      ctx.fillText(xv.toFixed(0), sx(xv), padT + plotH + 14);
      const yv = (yMax * i) / 4;
      ctx.textAlign = "right";
      ctx.fillText(yv.toFixed(0), padL - 4, sy(yv) + 3);
    }

    // trajectory B (dashed)
    if (compareMode && trajB.length > 1) {
      ctx.strokeStyle = "#dc2626";
      ctx.lineWidth = 2;
      ctx.setLineDash([5, 4]);
      ctx.beginPath();
      ctx.moveTo(sx(trajB[0].x), sy(trajB[0].y));
      for (const p of trajB) ctx.lineTo(sx(p.x), sy(p.y));
      ctx.stroke();
      ctx.setLineDash([]);
    }

    // trajectory A (solid, partial up to t)
    if (traj.length > 1) {
      ctx.strokeStyle = "#2563eb";
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.moveTo(sx(traj[0].x), sy(traj[0].y));
      for (const p of traj) {
        if (p.t <= t + 0.001) ctx.lineTo(sx(p.x), sy(p.y));
        else break;
      }
      ctx.stroke();
      // full trajectory ghost
      ctx.strokeStyle = "rgba(37,99,235,0.2)";
      ctx.lineWidth = 1.5;
      ctx.setLineDash([3, 3]);
      ctx.beginPath();
      ctx.moveTo(sx(traj[0].x), sy(traj[0].y));
      for (const p of traj) ctx.lineTo(sx(p.x), sy(p.y));
      ctx.stroke();
      ctx.setLineDash([]);
    }

    // launch point
    ctx.fillStyle = "#10b981";
    ctx.beginPath();
    ctx.arc(sx(0), sy(h), 4, 0, Math.PI * 2);
    ctx.fill();

    // landing point
    if (traj.length > 0) {
      const land = traj[traj.length - 1];
      ctx.fillStyle = "#ef4444";
      ctx.beginPath();
      ctx.arc(sx(land.x), sy(0), 4, 0, Math.PI * 2);
      ctx.fill();
    }

    // projectile
    if (t > 0 && t <= T) {
      const px = sx(pos.x);
      const py = sy(pos.y);
      ctx.fillStyle = "#2563eb";
      ctx.beginPath();
      ctx.arc(px, py, 8, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = "#fff";
      ctx.lineWidth = 2;
      ctx.stroke();

      // vectors
      if (showVectors) {
        const vscale = 3;
        // vx (blue)
        drawArrow(ctx, px, py, px + vel.vx * vscale, py, "#7c3aed");
        // vy (red)
        drawArrow(ctx, px, py, px, py - vel.vy * vscale, "#dc2626");
        // g (down, grey)
        drawArrow(ctx, px, py, px, py + 18, "#64748b");
      }
    }
  }, [traj, trajB, pos, vel, showVectors, u, theta, g, h, compareMode, t, T]);
  return <canvas ref={ref} className="w-full rounded-xl border border-slate-200 bg-gradient-to-b from-sky-50/40 to-white" />;
};

function drawArrow(ctx, x1, y1, x2, y2, color) {
  ctx.strokeStyle = color;
  ctx.fillStyle = color;
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(x1, y1);
  ctx.lineTo(x2, y2);
  ctx.stroke();
  const angle = Math.atan2(y2 - y1, x2 - x1);
  const head = 6;
  ctx.beginPath();
  ctx.moveTo(x2, y2);
  ctx.lineTo(x2 - head * Math.cos(angle - Math.PI / 6), y2 - head * Math.sin(angle - Math.PI / 6));
  ctx.lineTo(x2 - head * Math.cos(angle + Math.PI / 6), y2 - head * Math.sin(angle + Math.PI / 6));
  ctx.closePath();
  ctx.fill();
}
