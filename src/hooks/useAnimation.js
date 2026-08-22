import { useEffect, useRef, useState } from "react";

// requestAnimationFrame loop with clean-up. The callback receives dt (seconds)
// and the elapsed time. Pass a `running` flag to control play/pause.
export const useAnimation = (callback, running = true) => {
  const cbRef = useRef(callback);
  const rafRef = useRef(null);
  const lastRef = useRef(0);
  const startRef = useRef(0);

  useEffect(() => {
    cbRef.current = callback;
  });

  useEffect(() => {
    if (!running) {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
      return;
    }
    const loop = (now) => {
      if (!startRef.current) startRef.current = now;
      const dt = lastRef.current ? (now - lastRef.current) / 1000 : 0;
      lastRef.current = now;
      const elapsed = (now - startRef.current) / 1000;
      cbRef.current(dt, elapsed);
      rafRef.current = requestAnimationFrame(loop);
    };
    rafRef.current = requestAnimationFrame(loop);
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
      lastRef.current = 0;
      startRef.current = 0;
    };
  }, [running]);

  return { reset: () => { startRef.current = 0; lastRef.current = 0; } };
};

// Persistent state synced to localStorage.
export const usePersistentState = (key, initial) => {
  const [state, setState] = useState(() => {
    try {
      const raw = localStorage.getItem(key);
      return raw ? JSON.parse(raw) : initial;
    } catch {
      return initial;
    }
  });
  useEffect(() => {
    try {
      localStorage.setItem(key, JSON.stringify(state));
    } catch {
      /* ignore quota errors */
    }
  }, [key, state]);
  return [state, setState];
};

// Track element size for responsive canvas rendering.
export const useElementSize = () => {
  const ref = useRef(null);
  const [size, setSize] = useState({ width: 0, height: 0 });
  useEffect(() => {
    if (!ref.current) return;
    const ro = new ResizeObserver((entries) => {
      const r = entries[0].contentRect;
      setSize({ width: r.width, height: r.height });
    });
    ro.observe(ref.current);
    return () => ro.disconnect();
  }, []);
  return [ref, size];
};
