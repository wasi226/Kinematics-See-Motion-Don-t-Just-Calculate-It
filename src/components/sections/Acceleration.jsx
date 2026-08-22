import { useState, useRef, useEffect } from "react";
import { SectionShell, SectionHeading, Card, Callout, Pill } from "../ui/Primitives";
import { Slider } from "../ui/Slider";
import { Button } from "../ui/Button";
import { Eq } from "../ui/Math";
import { LineGraph } from "../graphs/LineGraph";
import {
  calculateVelocity,
  calculateDisplacement,
  sampleMotion,
  toFixed,
} from "../../physics/kinematics";

// Section 3 — Uniformly accelerated motion: the core motion simulator.
export const Acceleration = ({ onProgress }) => {
  const [u, setU] = useState(5);
  const [a, setA] = useState(2);
  const [tMax, setTMax] = useState(6);
  const [running, setRunning] = useState(false);
  const [t, setT] = useState(0);
  const rafRef = useRef(null);
  const lastRef = useRef(0);

  // animation loop
  useEffect(() => {
    if (!running) return;
    const loop = (now) => {
      if (!lastRef.current) lastRef.current = now;
      const dt = (now - lastRef.current) / 1000;
      lastRef.current = now;
      setT((prev) => {
        const next = prev + dt;
        if (next >= tMax) {
          setRunning(false);
          return tMax;
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
  }, [running, tMax]);

  const stop = () => {
    setRunning(false);
    lastRef.current = 0;
  };
  const reset = () => {
    stop();
    setT(0);
  };
  const step = () => {
    setT((prev) => Math.min(tMax, +(prev + 0.2).toFixed(2)));
  };

  const v = calculateVelocity(u, a, t);
  const s = calculateDisplacement(u, a, t);
  const vFinal = calculateVelocity(u, a, tMax);

  const samples = sampleMotion(u, a, tMax, 120);
  const xSeries = { points: samples.map((p) => ({ x: p.t, y: p.x })), color: "#2563eb" };
  const vSeries = { points: samples.map((p) => ({ x: p.t, y: p.v })), color: "#0891b2" };
  const aSeries = { points: samples.map((p) => ({ x: p.t, y: p.a })), color: "#dc2626" };

  return (
    <SectionShell id="acceleration">
      <SectionHeading
        id="acceleration"
        eyebrow="1.2 · Uniformly Accelerated Motion"
        title="Acceleration: when velocity changes"
      >
        Acceleration is the rate of change of velocity. Change u, a or t and watch
        the cart, the numbers and the graphs respond together.
      </SectionHeading>

      <div className="grid gap-6 lg:grid-cols-[1.5fr_1fr]">
        {/* Simulator */}
        <Card>
          <SimCanvas u={u} a={a} t={t} tMax={tMax} />
          <div className="mt-4 flex flex-wrap items-center gap-2">
            <Button size="sm" onClick={() => setRunning((r) => !r)} disabled={t >= tMax && !running}>
              {running ? "Pause" : t >= tMax ? "Done" : "Play"}
            </Button>
            <Button size="sm" variant="secondary" onClick={step} disabled={running}>
              Step +0.2s
            </Button>
            <Button size="sm" variant="ghost" onClick={reset}>
              Reset
            </Button>
          </div>
          <div className="mt-4 grid grid-cols-3 gap-3">
            <Readout label="Time" value={toFixed(t)} unit="s" color="#64748b" />
            <Readout label="Velocity v" value={toFixed(v)} unit="m/s" color="#0891b2" />
            <Readout label="Displacement s" value={toFixed(s)} unit="m" color="#2563eb" />
          </div>
        </Card>

        {/* Controls */}
        <div className="space-y-4">
          <Card>
            <h3 className="mb-4 font-semibold text-slate-800">Controls</h3>
            <div className="space-y-5">
              <Slider label="Initial velocity u" value={u} min={0} max={20} step={0.5} unit=" m/s" onChange={(v) => { setU(v); reset(); }} />
              <Slider label="Acceleration a" value={a} min={-5} max={5} step={0.5} unit=" m/s²" accent="red" onChange={(v) => { setA(v); reset(); }} />
              <Slider label="Duration t" value={tMax} min={2} max={12} step={1} unit=" s" accent="teal" onChange={(v) => { setTMax(v); reset(); }} />
            </div>
          </Card>
          <Card>
            <h3 className="mb-2 font-semibold text-slate-800">Kinematic equations</h3>
            <Eq>{String.raw`v = u + at`}</Eq>
            <Eq>{String.raw`v = u + at \;=\; ${toFixed(u)} + (${toFixed(a)})(${toFixed(t)}) \;=\; ${toFixed(v)}\,\text{m/s}`}</Eq>
            <p className="mt-2 text-xs text-slate-500">
              The equation updates live as you change the controls.
            </p>
          </Card>
        </div>
      </div>

      {/* Graphs */}
      <div className="mt-6 grid gap-4 md:grid-cols-3">
        <Card>
          <h4 className="mb-2 flex items-center gap-2 text-sm font-semibold text-slate-700">
            <span className="h-2.5 w-2.5 rounded-full bg-blue-600" /> Position vs time
          </h4>
          <LineGraph
            series={[xSeries]}
            xLabel="t (s)"
            yLabel="s (m)"
            cursor={{ x: t }}
            marker={{ x: t, y: s, color: "#2563eb", label: `(${toFixed(t)},${toFixed(s)})` }}
            height={180}
          />
        </Card>
        <Card>
          <h4 className="mb-2 flex items-center gap-2 text-sm font-semibold text-slate-700">
            <span className="h-2.5 w-2.5 rounded-full bg-teal-600" /> Velocity vs time
          </h4>
          <LineGraph
            series={[vSeries]}
            xLabel="t (s)"
            yLabel="v (m/s)"
            cursor={{ x: t }}
            marker={{ x: t, y: v, color: "#0891b2", label: `(${toFixed(t)},${toFixed(v)})` }}
            height={180}
          />
        </Card>
        <Card>
          <h4 className="mb-2 flex items-center gap-2 text-sm font-semibold text-slate-700">
            <span className="h-2.5 w-2.5 rounded-full bg-rose-600" /> Acceleration vs time
          </h4>
          <LineGraph
            series={[aSeries]}
            xLabel="t (s)"
            yLabel="a (m/s²)"
            cursor={{ x: t }}
            marker={{ x: t, y: a, color: "#dc2626" }}
            height={180}
          />
        </Card>
      </div>

      <div className="mt-6 grid gap-4 md:grid-cols-2">
        <Callout variant="info" title="Aha moment #2">
          Change acceleration and watch all three graphs change together. The slope
          of the position graph equals the velocity; the slope of the velocity
          graph equals the acceleration. They are not three separate stories.
        </Callout>
        <Card>
          <h3 className="mb-2 font-semibold text-slate-800">At t = {tMax} s (end of run)</h3>
          <div className="space-y-1 text-sm text-slate-600">
            <p>Final velocity: <strong className="text-teal-600">{toFixed(vFinal)} m/s</strong></p>
            <p>Final displacement: <strong className="text-blue-600">{toFixed(calculateDisplacement(u, a, tMax))} m</strong></p>
          </div>
          <div className="mt-3">
            <Pill color={a > 0 ? "red" : a < 0 ? "slate" : "blue"}>
              {a > 0 ? "Accelerating" : a < 0 ? "Decelerating" : "Constant velocity"}
            </Pill>
          </div>
        </Card>
      </div>
    </SectionShell>
  );
};

const Readout = ({ label, value, unit, color }) => (
  <div className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2">
    <p className="text-[11px] font-medium uppercase tracking-wide text-slate-500">{label}</p>
    <p className="text-lg font-semibold tabular-nums" style={{ color }}>
      {value} <span className="text-xs text-slate-400">{unit}</span>
    </p>
  </div>
);

// Particle on a track canvas
const SimCanvas = ({ u, a, t, tMax }) => {
  const ref = useRef(null);
  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    const dpr = window.devicePixelRatio || 1;
    const w = canvas.clientWidth;
    const h = 90;
    canvas.width = w * dpr;
    canvas.height = h * dpr;
    canvas.style.height = h + "px";
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, w, h);

    // compute x range over full run
    const xMin = Math.min(0, calculateDisplacement(u, a, 0));
    let xMaxVal = -Infinity;
    for (let i = 0; i <= 60; i++) {
      const tt = (tMax * i) / 60;
      xMaxVal = Math.max(xMaxVal, calculateDisplacement(u, a, tt));
    }
    xMaxVal = Math.max(xMaxVal, 1);
    const xMinVal = Math.min(0, xMaxVal * -0.1);
    const range = xMaxVal - xMinVal || 1;

    const x = calculateDisplacement(u, a, t);
    const v = calculateVelocity(u, a, t);
    const trackY = h * 0.6;

    // track
    ctx.strokeStyle = "#cbd5e1";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(20, trackY);
    ctx.lineTo(w - 20, trackY);
    ctx.stroke();

    const px = 20 + ((w - 40) * (x - xMinVal)) / range;
    // trail
    ctx.strokeStyle = "rgba(37,129,235,0.2)";
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(20 + ((w - 40) * (0 - xMinVal)) / range, trackY);
    ctx.lineTo(px, trackY);
    ctx.stroke();
    // particle
    ctx.fillStyle = "#2563eb";
    ctx.beginPath();
    ctx.arc(px, trackY, 10, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = "#fff";
    ctx.lineWidth = 2;
    ctx.stroke();
    // velocity arrow
    const vScale = 8;
    ctx.strokeStyle = "#0891b2";
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.moveTo(px, trackY - 22);
    ctx.lineTo(px + v * vScale, trackY - 22);
    ctx.stroke();
    if (Math.abs(v) > 0.1) {
      const dir = v > 0 ? 1 : -1;
      ctx.beginPath();
      ctx.moveTo(px + v * vScale, trackY - 22);
      ctx.lineTo(px + v * vScale - 6 * dir, trackY - 26);
      ctx.lineTo(px + v * vScale - 6 * dir, trackY - 18);
      ctx.closePath();
      ctx.fillStyle = "#0891b2";
      ctx.fill();
    }
  }, [u, a, t, tMax]);
  return <canvas ref={ref} className="w-full rounded-xl border border-slate-200 bg-gradient-to-b from-slate-50 to-white" />;
};
