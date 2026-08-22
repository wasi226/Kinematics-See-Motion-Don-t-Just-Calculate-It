import { useState, useEffect, useRef } from "react";
import { Hero } from "./components/sections/Hero";
import { MotionBasics } from "./components/sections/MotionBasics";
import { SpeedVsVelocity } from "./components/sections/SpeedVsVelocity";
import { Acceleration } from "./components/sections/Acceleration";
import { MotionGraphs } from "./components/sections/MotionGraphs";
import { EquationExplorer } from "./components/sections/EquationExplorer";
import { WorkedExample } from "./components/sections/WorkedExample";
import { ProjectileMotion } from "./components/sections/ProjectileMotion";
import { AirResistance } from "./components/sections/AirResistance";
import { Quiz } from "./components/sections/Quiz";
import { MasteryChallenge } from "./components/sections/MasteryChallenge";
import { NavBar } from "./components/layout/NavBar";
import { SECTIONS, useProgress } from "./components/layout/sections";
import { Button } from "./components/ui/Button";
import { Card, Callout, Pill } from "./components/ui/Primitives";

export default function App() {
  const [view, setView] = useState("hero"); // "hero" | section id
  const { completed, markComplete } = useProgress();
  const topRef = useRef(null);

  const scrollToTop = () => {
    topRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const navigate = (id) => {
    setView(id);
    setTimeout(scrollToTop, 50);
  };

  const goNext = () => {
    const idx = SECTIONS.findIndex((s) => s.id === view);
    if (idx >= 0 && idx < SECTIONS.length - 1) navigate(SECTIONS[idx + 1].id);
  };
  const goPrev = () => {
    const idx = SECTIONS.findIndex((s) => s.id === view);
    if (idx > 0) navigate(SECTIONS[idx - 1].id);
  };

  if (view === "hero") {
    return (
      <div ref={topRef}>
        <Hero onStart={() => navigate("motion-basics")} onExplore={() => navigate("projectile")} />
        <IntroOverview onNavigate={navigate} completed={completed} />
        <Footer />
      </div>
    );
  }

  const current = SECTIONS.findIndex((s) => s.id === view);
  const isLast = current === SECTIONS.length - 1;

  return (
    <div ref={topRef} className="min-h-screen bg-slate-50">
      <NavBar active={view} completed={completed} onNavigate={navigate} onHome={() => navigate("hero")} />
      <main>
        {view === "motion-basics" && <MotionBasics onProgress={markComplete} />}
        {view === "speed-velocity" && <SpeedVsVelocity onProgress={markComplete} />}
        {view === "acceleration" && <Acceleration onProgress={markComplete} />}
        {view === "graphs" && <MotionGraphs onProgress={markComplete} />}
        {view === "equations" && <EquationExplorer onProgress={markComplete} />}
        {view === "worked" && <WorkedExample onProgress={markComplete} />}
        {view === "projectile" && <ProjectileMotion onProgress={markComplete} />}
        {view === "air-resistance" && <AirResistance onProgress={markComplete} />}
        {view === "quiz" && <Quiz onProgress={markComplete} />}
        {view === "mastery" && <MasteryChallenge onProgress={markComplete} />}
      </main>

      {/* Section navigation footer */}
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-6 sm:px-6">
        <Button variant="secondary" size="sm" onClick={goPrev} disabled={current <= 0}>
          ← Previous
        </Button>
        <span className="text-xs text-slate-400">
          {current + 1} / {SECTIONS.length}
        </span>
        {!isLast ? (
          <Button size="sm" onClick={goNext}>Next →</Button>
        ) : (
          <Button size="sm" variant="success" onClick={() => navigate("hero")}>Complete ✓</Button>
        )}
      </div>
      <Footer />
    </div>
  );
}

const IntroOverview = ({ onNavigate, completed }) => {
  const cards = [
    { id: "motion-basics", title: "Motion Basics", desc: "Distance, displacement, speed & velocity", icon: "→" },
    { id: "speed-velocity", title: "Speed vs Velocity", desc: "Why direction matters", icon: "↔" },
    { id: "acceleration", title: "Acceleration", desc: "Equations of kinematics, live simulator", icon: "▲" },
    { id: "graphs", title: "Motion Graphs", desc: "Slope, area, linked graphs", icon: "∿" },
    { id: "equations", title: "Equation Explorer", desc: "Which equation should I use?", icon: "Σ" },
    { id: "worked", title: "Worked Example", desc: "Step-by-step problem solving", icon: "✓" },
    { id: "projectile", title: "Projectile Motion", desc: "The visual centerpiece", icon: "⌒" },
    { id: "air-resistance", title: "Air Resistance", desc: "Ideal vs real trajectories", icon: "≈" },
    { id: "quiz", title: "Practice Quiz", desc: "10 questions with feedback", icon: "?" },
    { id: "mastery", title: "Mastery Challenge", desc: "Hit the target", icon: "◎" },
  ];
  return (
    <section className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
      <h2 className="mb-1 font-[Fraunces] text-3xl font-semibold text-slate-900">
        Your learning journey
      </h2>
      <p className="mb-6 text-slate-600">
        Work through each section in order, or jump to any topic. Your progress is
        saved automatically.
      </p>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {cards.map((c) => (
          <button
            key={c.id}
            onClick={() => onNavigate(c.id)}
            className="group flex items-start gap-3 rounded-xl border border-slate-200 bg-white p-4 text-left transition hover:border-blue-400 hover:shadow-md"
          >
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-lg font-bold text-blue-600 transition group-hover:bg-blue-600 group-hover:text-white">
              {c.icon}
            </span>
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <h3 className="font-semibold text-slate-800">{c.title}</h3>
                {completed[c.id] && (
                  <span className="text-xs font-semibold text-emerald-600">✓ done</span>
                )}
              </div>
              <p className="text-sm text-slate-500">{c.desc}</p>
            </div>
          </button>
        ))}
      </div>
    </section>
  );
};

const Footer = () => (
  <footer className="border-t border-slate-200 bg-white">
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
      <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <p className="font-semibold text-slate-800">Kinematics — See Motion, Don't Just Calculate It</p>
          <p className="mt-1 text-sm text-slate-500">
            An interactive learning experience for IB Diploma Physics · Chapter 1
          </p>
        </div>
        <div className="text-sm text-slate-500">
          <p>Conceptual reference:</p>
          <p className="font-medium text-slate-600">Physics for the IB Diploma, 7th Edition — K.A. Tsokos</p>
          <p className="mt-1 text-xs text-slate-400">Original explanations & visualizations. No copyrighted content reproduced.</p>
        </div>
      </div>
    </div>
  </footer>
);
