import { useState } from "react";
import { SectionShell, SectionHeading, Card, Callout, Pill } from "../ui/Primitives";
import { Slider } from "../ui/Slider";
import { Button } from "../ui/Button";
import { Math } from "../ui/Math";
import {
  calculateRange,
  timeOfFlight,
  maximumHeight,
  sampleTrajectory,
  safeNumber,
} from "../../physics/projectile";

// Final Mastery Challenge: hit the target by choosing u and theta.
export const MasteryChallenge = ({ onProgress }) => {
  const target = 40; // metres
  const [u, setU] = useState(25);
  const [theta, setTheta] = useState(45);
  const [g] = useState(9.81);
  const [launched, setLaunched] = useState(false);
  const [score, setScore] = useState(null);
  const [attempts, setAttempts] = useState([]);

  const range = calculateRange(u, theta, g);
  const traj = sampleTrajectory(u, theta, g, 0, 120);
  const error = Math.abs(range - target);
  const accuracy = Math.max(0, Math.round((1 - error / target) * 100));

  const launch = () => {
    setLaunched(true);
    setScore({ range, error, accuracy });
    setAttempts((a) => [...a, { u, theta, range, accuracy }]);
  };

  const best = attempts.reduce((b, a) => (a.accuracy > b ? a.accuracy : b), 0);

  return (
    <SectionShell id="mastery">
      <SectionHeading
        id="mastery"
        eyebrow="Mastery Challenge"
        title="Hit the target"
      >
        Apply what you've learned. Adjust the launch speed and angle to land as
        close as possible to {target} m.
      </SectionHeading>

      <div className="grid gap-6 lg:grid-cols-[1.6fr_1fr]">
        <Card>
          <TargetCanvas traj={traj} target={target} launched={launched} u={u} theta={theta} g={g} />
          <div className="mt-4 grid grid-cols-3 gap-3">
            <div className="rounded-lg border border-slate-200 bg-slate-50 p-3 text-center">
              <p className="text-[11px] uppercase text-slate-500">Your range</p>
              <p className="text-xl font-bold text-blue-600">{safeNumber(range)} m</p>
            </div>
            <div className="rounded-lg border border-slate-200 bg-slate-50 p-3 text-center">
              <p className="text-[11px] uppercase text-slate-500">Target</p>
              <p className="text-xl font-bold text-emerald-600">{target} m</p>
            </div>
            <div className="rounded-lg border border-slate-200 bg-slate-50 p-3 text-center">
              <p className="text-[11px] uppercase text-slate-500">Error</p>
              <p className="text-xl font-bold text-rose-600">{safeNumber(error)} m</p>
            </div>
          </div>
        </Card>

        <div className="space-y-4">
          <Card>
            <h3 className="mb-3 font-semibold text-slate-800">Your controls</h3>
            <div className="space-y-4">
              <Slider label="Launch speed u" value={u} min={5} max={50} step={0.5} unit=" m/s" onChange={(v) => { setU(v); setLaunched(false); setScore(null); }} />
              <Slider label="Launch angle θ" value={theta} min={0} max={90} step={1} unit="°" accent="red" onChange={(v) => { setTheta(v); setLaunched(false); setScore(null); }} format={(v) => `${v}°`} />
            </div>
            <div className="mt-4">
              <Button onClick={launch} disabled={launched} className="w-full">
                {launched ? "Launched — adjust to retry" : "Launch!"}
              </Button>
            </div>
          </Card>

          {score && (
            <Card className="kin-fade-in border-blue-300">
              <p className="text-xs font-semibold uppercase tracking-wide text-blue-600">Result</p>
              <p className="my-2 text-4xl font-bold text-blue-600">{score.accuracy}%</p>
              <p className="text-sm text-slate-600">
                {score.accuracy >= 95 ? "Bullseye! You've mastered the relationship." :
                 score.accuracy >= 80 ? "Very close. Fine-tune the angle a degree or two." :
                 "Off target. Remember: at 45° you maximise range — adjust u to reach the target distance."}
              </p>
              <div className="mt-3">
                <Math>{String.raw`R = \frac{u^2\sin(2\theta)}{g} = \frac{${u}^2\sin(${2 * theta}^\circ)}{${g}} \approx ${safeNumber(range)}\,\text{m}`}</Math>
              </div>
            </Card>
          )}

          {attempts.length > 0 && (
            <Card>
              <h4 className="mb-2 text-sm font-semibold text-slate-700">Attempts: {attempts.length} · Best: {best}%</h4>
              <div className="space-y-1">
                {attempts.slice(-5).map((att, i) => (
                  <div key={i} className="flex justify-between text-xs text-slate-600">
                    <span>u={att.u}, θ={att.theta}°</span>
                    <span className="tabular-nums">{safeNumber(att.range)} m · {att.accuracy}%</span>
                  </div>
                ))}
              </div>
            </Card>
          )}
        </div>
      </div>

      <div className="mt-6">
        <Callout variant="info" title="The physics">
          <p className="text-sm">
            For a flat target at distance <strong>R</strong>, the ideal launch
            angle is 45° (maximum range). If you need a specific shorter range,
            either reduce the speed or pick a different angle — recall that 30°
            and 60° give the same range at the same speed.
          </p>
        </Callout>
      </div>
    </SectionShell>
  );
};

// Canvas with target marker
const TargetCanvas = ({ traj, target, launched, u, theta, g }) => {
  const ref = useRef(null);
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

    let xMax = Math.max(target * 1.15, ...traj.map((p) => p.x), 1);
    let yMax = Math.max(...traj.map((p) => p.y), 10);
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

    // target marker
    const tx = sx(target);
    ctx.fillStyle = "#ef4444";
    ctx.beginPath();
    ctx.arc(tx, sy(0), 6, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = "#ef4444";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(tx, sy(0) - 14);
    ctx.lineTo(tx, sy(0) + 14);
    ctx.stroke();
    ctx.fillStyle = "#ef4444";
    ctx.font = "11px Inter, sans-serif";
    ctx.textAlign = "center";
    ctx.fillText(`target ${target}m`, tx, sy(0) + 28);

    // trajectory
    if (traj.length > 1 && launched) {
      ctx.strokeStyle = "#2563eb";
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.moveTo(sx(traj[0].x), sy(traj[0].y));
      for (const p of traj) ctx.lineTo(sx(p.x), sy(p.y));
      ctx.stroke();
    } else if (traj.length > 1) {
      ctx.strokeStyle = "rgba(37,99,235,0.3)";
      ctx.lineWidth = 2;
      ctx.setLineDash([4, 4]);
      ctx.beginPath();
      ctx.moveTo(sx(traj[0].x), sy(traj[0].y));
      for (const p of traj) ctx.lineTo(sx(p.x), sy(p.y));
      ctx.stroke();
      ctx.setLineDash([]);
    }

    // launch point
    ctx.fillStyle = "#10b981";
    ctx.beginPath();
    ctx.arc(sx(0), sy(0), 4, 0, Math.PI * 2);
    ctx.fill();
  }, [traj, target, launched, u, theta, g]);
  return <canvas ref={ref} className="w-full rounded-xl border border-slate-200 bg-gradient-to-b from-sky-50/40 to-white" />;
};

import { useRef, useEffect } from "react";
