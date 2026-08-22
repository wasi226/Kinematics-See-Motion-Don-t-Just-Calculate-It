import { useRef, useEffect, useState } from "react";
import { Button } from "../ui/Button";

// Hero with animated motion preview: a particle accelerating along a track,
// with live position/velocity/acceleration readouts.
export const Hero = ({ onStart, onExplore }) => {
  const canvasRef = useRef(null);
  const [stats, setStats] = useState({ x: 0, v: 0, a: 0 });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    let raf;
    let t = 0;
    let last = performance.now();

    const u = 2;
    const a = 1.5;

    const draw = (now) => {
      const dt = (now - last) / 1000;
      last = now;
      t += dt;
      // loop every ~4s
      const loopT = t % 4;
      const x = u * loopT + 0.5 * a * loopT * loopT;
      const v = u + a * loopT;

      const dpr = window.devicePixelRatio || 1;
      const w = canvas.clientWidth;
      const h = canvas.clientHeight;
      if (canvas.width !== w * dpr) {
        canvas.width = w * dpr;
        canvas.height = h * dpr;
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      }
      ctx.clearRect(0, 0, w, h);

      // track
      const trackY = h * 0.55;
      ctx.strokeStyle = "#cbd5e1";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(20, trackY);
      ctx.lineTo(w - 20, trackY);
      ctx.stroke();
      // ticks
      ctx.strokeStyle = "#e2e8f0";
      for (let i = 0; i <= 10; i++) {
        const tx = 20 + ((w - 40) * i) / 10;
        ctx.beginPath();
        ctx.moveTo(tx, trackY);
        ctx.lineTo(tx, trackY + 6);
        ctx.stroke();
      }

      // particle position (scaled)
      const maxX = u * 4 + 0.5 * a * 16;
      const px = 20 + ((w - 40) * x) / maxX;
      // trail
      ctx.strokeStyle = "rgba(37,129,235,0.25)";
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(20, trackY);
      ctx.lineTo(px, trackY);
      ctx.stroke();
      // particle
      ctx.fillStyle = "#2563eb";
      ctx.beginPath();
      ctx.arc(px, trackY, 9, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = "#fff";
      ctx.lineWidth = 2;
      ctx.stroke();

      // velocity arrow
      const vScale = 12;
      ctx.strokeStyle = "#0891b2";
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.moveTo(px, trackY - 18);
      ctx.lineTo(px + v * vScale, trackY - 18);
      ctx.stroke();
      // arrowhead
      ctx.beginPath();
      ctx.moveTo(px + v * vScale, trackY - 18);
      ctx.lineTo(px + v * vScale - 6, trackY - 22);
      ctx.lineTo(px + v * vScale - 6, trackY - 14);
      ctx.closePath();
      ctx.fillStyle = "#0891b2";
      ctx.fill();

      setStats({ x: x, v: v, a: a });
      raf = requestAnimationFrame(draw);
    };
    raf = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(raf);
  }, []);

  return (
    <header className="relative overflow-hidden bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 text-white">
      <div className="absolute inset-0 opacity-30" style={{ background: "radial-gradient(600px 300px at 70% 20%, rgba(37,129,235,0.5), transparent)" }} />
      <div className="relative mx-auto max-w-6xl px-4 py-12 sm:px-6 md:py-20">
        <div className="grid items-center gap-8 md:grid-cols-2">
          <div>
            <p className="mb-3 text-sm font-semibold uppercase tracking-widest text-blue-400">
              Chapter 1 · Physics for the IB Diploma
            </p>
            <h1 className="font-[Fraunces] text-5xl font-bold leading-[1.05] sm:text-6xl md:text-7xl">
              Kinematics
            </h1>
            <p className="mt-4 text-xl text-slate-300 sm:text-2xl">
              See motion, don't just calculate it.
            </p>
            <p className="mt-4 max-w-md text-slate-400">
              An interactive learning experience for understanding motion, graphs,
              equations, and projectile motion.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Button size="lg" onClick={onStart}>
                Start Learning
              </Button>
              <Button size="lg" variant="secondary" onClick={onExplore} className="bg-white/10 text-white border-white/20 hover:bg-white/20 hover:text-white hover:border-white/40">
                Explore Simulation
              </Button>
            </div>
          </div>
          <div className="rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur">
            <canvas ref={canvasRef} className="h-44 w-full" />
            <div className="mt-3 grid grid-cols-3 gap-2 text-center">
              <Stat label="Position" value={stats.x} unit="m" color="#2563eb" />
              <Stat label="Velocity" value={stats.v} unit="m/s" color="#0891b2" />
              <Stat label="Acceleration" value={stats.a} unit="m/s²" color="#dc2626" />
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

const Stat = ({ label, value, unit, color }) => (
  <div className="rounded-lg bg-white/5 px-2 py-2">
    <p className="text-[10px] uppercase tracking-wider text-slate-400">{label}</p>
    <p className="text-sm font-semibold tabular-nums" style={{ color }}>
      {value.toFixed(1)} <span className="text-slate-400">{unit}</span>
    </p>
  </div>
);
