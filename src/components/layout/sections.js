import { usePersistentState } from "../../hooks/useAnimation";

export const SECTIONS = [
  { id: "motion-basics", label: "Motion Basics", num: 1 },
  { id: "speed-velocity", label: "Speed vs Velocity", num: 2 },
  { id: "acceleration", label: "Acceleration", num: 3 },
  { id: "graphs", label: "Motion Graphs", num: 4 },
  { id: "equations", label: "Equations", num: 5 },
  { id: "worked", label: "Worked Example", num: 6 },
  { id: "projectile", label: "Projectile", num: 7 },
  { id: "air-resistance", label: "Air Resistance", num: 8 },
  { id: "quiz", label: "Practice", num: 9 },
  { id: "mastery", label: "Mastery", num: 10 },
];

export const useProgress = () => {
  const [completed, setCompleted] = usePersistentState("kin-progress", {});
  const markComplete = (id) => setCompleted((c) => ({ ...c, [id]: true }));
  return { completed, markComplete };
};
