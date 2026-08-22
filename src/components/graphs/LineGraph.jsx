import { useRef, useEffect } from "react";

// Reusable canvas-based line graph.
// Props:
//   series: [{ points: [{x,y}], color, label, fill? }]
//   xLabel, yLabel
//   xDomain: [min,max], yDomain: [min,max] (auto if omitted)
//   cursor: { x, color } | null   — vertical cursor line
//   marker: { x, y, color, label } | null
//   shadeArea: { x1, x2, color } | null
//   height (default 220)
//   showSlope: { x, dx, color } | null  — draws a tangent triangle at given x
export const LineGraph = ({
  series = [],
  xLabel = "",
  yLabel = "",
  xDomain,
  yDomain,
  cursor = null,
  marker = null,
  shadeArea = null,
  height = 220,
  showSlope = null,
  onPick,
}) => {
  const canvasRef = useRef(null);
  const containerRef = useRef(null);
  const pickRef = useRef(onPick);
  pickRef.current = onPick;

  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;
    const dpr = window.devicePixelRatio || 1;
    const w = container.clientWidth;
    const h = height;
    canvas.width = w * dpr;
    canvas.height = h * dpr;
    canvas.style.width = w + "px";
    canvas.style.height = h + "px";
    const ctx = canvas.getContext("2d");
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, w, h);

    const pad = { l: 44, r: 16, t: 14, b: 30 };
    const plotW = w - pad.l - pad.r;
    const plotH = h - pad.t - pad.b;

    // domains
    let xMin = xDomain ? xDomain[0] : Infinity;
    let xMax = xDomain ? xDomain[1] : -Infinity;
    let yMin = yDomain ? yDomain[0] : Infinity;
    let yMax = yDomain ? yDomain[1] : -Infinity;
    if (!xDomain || !yDomain) {
      for (const s of series) {
        for (const p of s.points) {
          if (!xDomain) { xMin = Math.min(xMin, p.x); xMax = Math.max(xMax, p.x); }
          if (!yDomain) { yMin = Math.min(yMin, p.y); yMax = Math.max(yMax, p.y); }
        }
      }
    }
    if (!isFinite(xMin)) { xMin = 0; xMax = 1; }
    if (!isFinite(yMin)) { yMin = 0; yMax = 1; }
    if (xMin === xMax) { xMin -= 1; xMax += 1; }
    if (yMin === yMax) { yMin -= 1; yMax += 1; }
    // pad y a bit
    const yPad = (yMax - yMin) * 0.08;
    yMin -= yPad; yMax += yPad;
    if (yMin > 0 && yDomain === undefined) yMin = Math.min(yMin, 0);

    const sx = (x) => pad.l + ((x - xMin) / (xMax - xMin)) * plotW;
    const sy = (y) => pad.t + plotH - ((y - yMin) / (yMax - yMin)) * plotH;

    // grid
    ctx.strokeStyle = "#eef2f7";
    ctx.lineWidth = 1;
    const xTicks = 5, yTicks = 4;
    for (let i = 0; i <= xTicks; i++) {
      const x = xMin + ((xMax - xMin) * i) / xTicks;
      ctx.beginPath(); ctx.moveTo(sx(x), pad.t); ctx.lineTo(sx(x), pad.t + plotH); ctx.stroke();
    }
    for (let i = 0; i <= yTicks; i++) {
      const y = yMin + ((yMax - yMin) * i) / yTicks;
      ctx.beginPath(); ctx.moveTo(pad.l, sy(y)); ctx.lineTo(pad.l + plotW, sy(y)); ctx.stroke();
    }

    // axes
    ctx.strokeStyle = "#94a3b8";
    ctx.lineWidth = 1.4;
    ctx.beginPath(); ctx.moveTo(pad.l, pad.t); ctx.lineTo(pad.l, pad.t + plotH); ctx.lineTo(pad.l + plotW, pad.t + plotH); ctx.stroke();

    // zero line
    if (yMin < 0 && yMax > 0) {
      ctx.strokeStyle = "#cbd5e1";
      ctx.setLineDash([4, 4]);
      ctx.beginPath(); ctx.moveTo(pad.l, sy(0)); ctx.lineTo(pad.l + plotW, sy(0)); ctx.stroke();
      ctx.setLineDash([]);
    }

    // axis labels
    ctx.fillStyle = "#64748b";
    ctx.font = "11px Inter, sans-serif";
    ctx.textAlign = "center";
    ctx.fillText(xLabel, pad.l + plotW / 2, h - 6);
    ctx.save();
    ctx.translate(12, pad.t + plotH / 2);
    ctx.rotate(-Math.PI / 2);
    ctx.fillText(yLabel, 0, 0);
    ctx.restore();

    // tick labels
    ctx.fillStyle = "#94a3b8";
    ctx.font = "10px Inter, sans-serif";
    ctx.textAlign = "right";
    for (let i = 0; i <= yTicks; i++) {
      const y = yMin + ((yMax - yMin) * i) / yTicks;
      ctx.fillText(y.toFixed(1), pad.l - 6, sy(y) + 3);
    }
    ctx.textAlign = "center";
    for (let i = 0; i <= xTicks; i++) {
      const x = xMin + ((xMax - xMin) * i) / xTicks;
      ctx.fillText(x.toFixed(1), sx(x), pad.t + plotH + 16);
    }

    // shade area
    if (shadeArea) {
      ctx.fillStyle = shadeArea.color || "rgba(37,99,235,0.15)";
      const x1 = Math.max(shadeArea.x1, xMin);
      const x2 = Math.min(shadeArea.x2, xMax);
      const baseY = sy(Math.max(yMin, 0));
      // find series to shade under (first series)
      const s = series[0];
      if (s && x2 > x1) {
        ctx.beginPath();
        ctx.moveTo(sx(x1), baseY);
        for (const p of s.points) {
          if (p.x >= x1 && p.x <= x2) ctx.lineTo(sx(p.x), sy(p.y));
        }
        ctx.lineTo(sx(x2), baseY);
        ctx.closePath();
        ctx.fill();
      }
    }

    // series
    for (const s of series) {
      if (!s.points || s.points.length < 2) continue;
      ctx.strokeStyle = s.color || "#2563eb";
      ctx.lineWidth = s.lineWidth || 2.2;
      ctx.beginPath();
      ctx.moveTo(sx(s.points[0].x), sy(s.points[0].y));
      for (let i = 1; i < s.points.length; i++) {
        ctx.lineTo(sx(s.points[i].x), sy(s.points[i].y));
      }
      ctx.stroke();
      if (s.fill) {
        ctx.fillStyle = s.fill;
        ctx.lineTo(sx(s.points[s.points.length - 1].x), sy(Math.max(yMin, 0)));
        ctx.lineTo(sx(s.points[0].x), sy(Math.max(yMin, 0)));
        ctx.closePath();
        ctx.fill();
      }
    }

    // slope tangent triangle
    if (showSlope && series[0]) {
      const s = series[0];
      // find point at showSlope.x
      const idx = Math.round((showSlope.x / (xMax - xMin)) * (s.points.length - 1) + 0);
      const p = s.points[Math.max(0, Math.min(s.points.length - 1, idx))];
      if (p) {
        const dx = showSlope.dx || (xMax - xMin) * 0.15;
        // numerical slope at p using neighbors
        const prev = s.points[Math.max(0, idx - 1)];
        const next = s.points[Math.min(s.points.length - 1, idx + 1)];
        const slope = (next.y - prev.y) / (next.x - prev.x || 1e-6);
        const dy = slope * dx;
        ctx.strokeStyle = showSlope.color || "#dc2626";
        ctx.fillStyle = "rgba(220,38,38,0.12)";
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(sx(p.x), sy(p.y));
        ctx.lineTo(sx(p.x + dx), sy(p.y));
        ctx.lineTo(sx(p.x + dx), sy(p.y - dy));
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
        // slope label
        ctx.fillStyle = "#dc2626";
        ctx.font = "11px Inter, sans-serif";
        ctx.textAlign = "left";
        ctx.fillText(`slope = ${slope.toFixed(2)}`, sx(p.x + dx) + 4, sy(p.y - dy / 2));
      }
    }

    // cursor
    if (cursor) {
      ctx.strokeStyle = cursor.color || "#0f172a";
      ctx.lineWidth = 1;
      ctx.setLineDash([4, 3]);
      ctx.beginPath();
      ctx.moveTo(sx(cursor.x), pad.t);
      ctx.lineTo(sx(cursor.x), pad.t + plotH);
      ctx.stroke();
      ctx.setLineDash([]);
    }

    // marker
    if (marker) {
      ctx.fillStyle = marker.color || "#2563eb";
      ctx.beginPath();
      ctx.arc(sx(marker.x), sy(marker.y), 5, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = "#fff";
      ctx.lineWidth = 2;
      ctx.stroke();
      if (marker.label) {
        ctx.fillStyle = "#0f172a";
        ctx.font = "11px Inter, sans-serif";
        ctx.textAlign = "left";
        ctx.fillText(marker.label, sx(marker.x) + 8, sy(marker.y) - 8);
      }
    }

    // click-to-pick
    const handlePick = (e) => {
      if (!pickRef.current) return;
      const rect = canvas.getBoundingClientRect();
      const px = e.clientX - rect.left;
      const xVal = xMin + ((px - pad.l) / plotW) * (xMax - xMin);
      pickRef.current(xVal);
    };
    canvas.onclick = handlePick;
  }, [series, xLabel, yLabel, xDomain, yDomain, cursor, marker, shadeArea, height, showSlope]);

  return (
    <div ref={containerRef} className="w-full">
      <canvas ref={canvasRef} />
    </div>
  );
};
