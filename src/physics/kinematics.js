// Kinematics physics calculations for 1D uniformly accelerated motion.
// All SI units: metres, seconds, metres/second, metres/second^2.

export const clamp = (value, min, max) => Math.min(max, Math.max(min, value));

export const toFixed = (value, digits = 2) => {
  if (value === null || value === undefined || Number.isNaN(value) || !Number.isFinite(value)) {
    return "0";
  }
  const rounded = Number(value.toFixed(digits));
  return String(rounded);
};

// velocity = u + a*t
export const calculateVelocity = (u, a, t) => u + a * t;

// displacement = u*t + 1/2*a*t^2
export const calculateDisplacement = (u, a, t) => u * t + 0.5 * a * t * t;

// position = x0 + displacement
export const calculatePosition = (x0, u, a, t) => x0 + calculateDisplacement(u, a, t);

// v^2 = u^2 + 2*a*s  ->  v = sqrt(u^2 + 2*a*s)
export const calculateVelocitySquared = (u, a, s) => {
  const v2 = u * u + 2 * a * s;
  return Math.sqrt(Math.max(0, v2));
};

// Sample position/velocity/acceleration arrays across a time range.
// Returns arrays suitable for graphing.
export const sampleMotion = (u, a, tMax, samples = 120) => {
  const points = [];
  for (let i = 0; i <= samples; i++) {
    const t = (tMax * i) / samples;
    points.push({
      t,
      x: calculateDisplacement(u, a, t),
      v: calculateVelocity(u, a, t),
      a,
    });
  }
  return points;
};

// Given known values, recommend the appropriate kinematic equation.
// Returns { id, needs, solvesFor, reason }
export const EQUATIONS = [
  {
    id: "vua",
    solvesFor: "v",
    needs: ["u", "a", "t"],
    gives: ["v"],
    missing: ["s"],
    formula: "v = u + at",
    reason: "You know initial velocity, acceleration and time, and need the final velocity — time is available, so use v = u + at.",
  },
  {
    id: "suat",
    solvesFor: "s",
    needs: ["u", "a", "t"],
    gives: ["s"],
    missing: ["v"],
    formula: "s = ut + \\tfrac{1}{2}at^2",
    reason: "You know initial velocity, acceleration and time, and need displacement — time is available, so use s = ut + ½at².",
  },
  {
    id: "vuas",
    solvesFor: "v",
    needs: ["u", "a", "s"],
    gives: ["v"],
    missing: ["t"],
    formula: "v^2 = u^2 + 2as",
    reason: "You know initial velocity, acceleration and displacement, but NOT time — so use v² = u² + 2as to find velocity without time.",
  },
  {
    id: "suvat",
    solvesFor: "s",
    needs: ["u", "v", "a"],
    gives: ["s"],
    missing: ["t"],
    formula: "v^2 = u^2 + 2as \\Rightarrow s = \\tfrac{v^2 - u^2}{2a}",
    reason: "You know both velocities and acceleration, but not time — rearrange v² = u² + 2as to solve for displacement.",
  },
  {
    id: "svt",
    solvesFor: "s",
    needs: ["u", "v", "t"],
    gives: ["s"],
    missing: ["a"],
    formula: "s = \\tfrac{(u+v)}{2}t",
    reason: "You know both velocities and time, but not acceleration — use the average-velocity form s = ½(u+v)t.",
  },
  {
    id: "auvt",
    solvesFor: "a",
    needs: ["u", "v", "t"],
    gives: ["a"],
    missing: ["s"],
    formula: "a = \\tfrac{v-u}{t}",
    reason: "You know both velocities and time, and need acceleration — use a = (v − u)/t.",
  },
];

export const recommendEquation = (known, target) => {
  const knownSet = new Set(known);
  const match = EQUATIONS.find(
    (eq) => eq.gives.includes(target) && eq.needs.every((n) => knownSet.has(n))
  );
  return match || null;
};

// Area under velocity-time graph between t1 and t2 (trapezoidal for linear v).
// For constant acceleration: displacement = 0.5*(v1+v2)*(t2-t1)
export const areaUnderVT = (u, a, t1, t2) => {
  const v1 = calculateVelocity(u, a, t1);
  const v2 = calculateVelocity(u, a, t2);
  return 0.5 * (v1 + v2) * (t2 - t1);
};
