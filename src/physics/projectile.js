// Projectile motion physics — 2D, no air resistance, uniform gravity.
// SI units throughout. Angles in degrees at the API boundary; radians internally.

import { clamp } from "./kinematics.js";

export const toRadians = (deg) => (deg * Math.PI) / 180;
export const toDegrees = (rad) => (rad * 180) / Math.PI;

// Velocity components from speed u and launch angle theta (degrees).
export const velocityComponents = (u, thetaDeg) => {
  const th = toRadians(thetaDeg);
  return {
    vx: u * Math.cos(th),
    vy: u * Math.sin(th),
  };
};

// Position at time t, given u, theta, g, and initial height h (default 0).
export const calculateProjectilePosition = (u, thetaDeg, g, t, h = 0) => {
  const { vx, vy } = velocityComponents(u, thetaDeg);
  return {
    x: vx * t,
    y: h + vy * t - 0.5 * g * t * t,
  };
};

// Velocity at time t.
export const calculateProjectileVelocity = (u, thetaDeg, g, t) => {
  const { vx, vy } = velocityComponents(u, thetaDeg);
  return {
    vx,
    vy: vy - g * t,
  };
};

// Time the projectile returns to y = h (launch height). 0 if it never lands.
export const timeOfFlight = (u, thetaDeg, g, h = 0) => {
  const { vy } = velocityComponents(u, thetaDeg);
  // y(t) = h + vy*t - 0.5*g*t^2 = h  ->  t(vy - 0.5*g*t) = 0
  // t = 0 or t = 2*vy/g
  if (g <= 0) return 0;
  if (h === 0) {
    if (vy <= 0) return 0;
    return (2 * vy) / g;
  }
  // Solve 0.5*g*t^2 - vy*t - h = 0  (return to ground, y=0)
  const disc = vy * vy + 2 * g * h;
  if (disc < 0) return 0;
  return (vy + Math.sqrt(disc)) / g;
};

// Maximum height above launch point (same-height case).
export const maximumHeight = (u, thetaDeg, g) => {
  if (g <= 0) return 0;
  const { vy } = velocityComponents(u, thetaDeg);
  return (vy * vy) / (2 * g);
};

// Maximum height above ground when launched from height h.
export const maximumHeightFromGround = (u, thetaDeg, g, h = 0) => {
  if (g <= 0) return h;
  const { vy } = velocityComponents(u, thetaDeg);
  if (vy <= 0) return h;
  return h + (vy * vy) / (2 * g);
};

// Range on level ground (same launch & landing height).
export const calculateRange = (u, thetaDeg, g) => {
  if (g <= 0) return 0;
  const th = toRadians(thetaDeg);
  const sin2th = Math.sin(2 * th);
  if (sin2th <= 0) return 0;
  return (u * u * sin2th) / g;
};

// Range when launched from height h (lands at y=0).
export const calculateRangeFromHeight = (u, thetaDeg, g, h = 0) => {
  if (g <= 0) return 0;
  const T = timeOfFlight(u, thetaDeg, g, h);
  const { vx } = velocityComponents(u, thetaDeg);
  return vx * T;
};

// Sample the trajectory as an array of {x, y, t} points.
export const sampleTrajectory = (u, thetaDeg, g, h = 0, samples = 120) => {
  const T = timeOfFlight(u, thetaDeg, g, h);
  if (T <= 0) return [];
  const pts = [];
  for (let i = 0; i <= samples; i++) {
    const t = (T * i) / samples;
    const p = calculateProjectilePosition(u, thetaDeg, g, t, h);
    pts.push({ ...p, t });
  }
  return pts;
};

// Simplified drag model (conceptual only): quadratic drag opposing velocity,
// integrated with small Euler steps. NOT a rigorous aerodynamic model —
// labelled as "conceptual" in the UI. Used only for the air-resistance
// comparison section so students see the qualitative effect.
export const sampleTrajectoryWithDrag = (u, thetaDeg, g, h = 0, dragK = 0.02, dt = 0.02) => {
  const { vx, vy } = velocityComponents(u, thetaDeg);
  let x = 0, y = h, vxv = vx, vyv = vy, t = 0;
  const pts = [{ x, y, t }];
  const maxSteps = 4000;
  for (let i = 0; i < maxSteps; i++) {
    const speed = Math.sqrt(vxv * vxv + vyv * vyv);
    const fx = -dragK * speed * vxv;
    const fy = -dragK * speed * vyv;
    const ax = fx;
    const ay = fy - g;
    vxv += ax * dt;
    vyv += ay * dt;
    x += vxv * dt;
    y += vyv * dt;
    t += dt;
    pts.push({ x, y, t });
    if (y <= 0 && t > 0.01) break;
  }
  return pts;
};

export const safeNumber = (v, digits = 2) => {
  if (v === null || v === undefined || Number.isNaN(v) || !Number.isFinite(v)) return "0";
  return String(Number(v.toFixed(digits)));
};

export const clampAngle = (a) => clamp(a, 0, 90);
export const clampPositive = (v, min = 0, max = 200) => clamp(v, min, max);
