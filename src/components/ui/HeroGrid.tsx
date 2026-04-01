"use client";

import { useRef, useEffect } from "react";

interface Point {
  x: number;
  y: number;
  ox: number; // resting x
  oy: number; // resting y
  vx: number;
  vy: number;
}

interface HeroGridProps {
  mouseRef: React.MutableRefObject<{ x: number; y: number }>;
}

const SPACING = 32;
const REPEL_RADIUS = 150;
const REPEL_STRENGTH = 95;
const WAVE_SPEED = 0.00055;
const WAVE_AMP = 7;
const SPRING = 0.062;
const DAMPING = 0.85;

export default function HeroGrid({ mouseRef }: HeroGridProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let points: Point[] = [];
    let cols = 0;
    let rows = 0;
    let raf = 0;
    let dpr = 1;

    function resize() {
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      const w = canvas.offsetWidth;
      const h = canvas.offsetHeight;
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      ctx.scale(dpr, dpr);
      buildGrid(w, h);
    }

    function buildGrid(w: number, h: number) {
      cols = Math.ceil(w / SPACING) + 2;
      rows = Math.ceil(h / SPACING) + 2;
      points = [];
      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          const ox = c * SPACING - SPACING / 2;
          const oy = r * SPACING - SPACING / 2;
          points.push({ x: ox, y: oy, ox, oy, vx: 0, vy: 0 });
        }
      }
    }

    function draw(ts: number) {
      raf = requestAnimationFrame(draw);
      const t = ts * WAVE_SPEED;
      const w = canvas.width / dpr;
      const h = canvas.height / dpr;
      ctx.clearRect(0, 0, w, h);

      const mx = mouseRef.current.x;
      const my = mouseRef.current.y;

      // Update point physics
      for (const p of points) {
        // Wave: two overlapping sine waves for organic feel
        const wx =
          Math.sin(t + p.ox * 0.016 + p.oy * 0.008) * WAVE_AMP +
          Math.sin(t * 0.6 + p.ox * 0.009 - p.oy * 0.013) * WAVE_AMP * 0.4;
        const wy =
          Math.cos(t * 0.9 + p.oy * 0.016 + p.ox * 0.008) * WAVE_AMP +
          Math.cos(t * 0.5 - p.oy * 0.009 + p.ox * 0.013) * WAVE_AMP * 0.4;

        const tx = p.ox + wx;
        const ty = p.oy + wy;

        // Mouse repulsion with quadratic falloff
        const dx = p.x - mx;
        const dy = p.y - my;
        const dist = Math.sqrt(dx * dx + dy * dy);
        let rx = 0;
        let ry = 0;
        if (dist < REPEL_RADIUS && dist > 0.1) {
          const t2 = 1 - dist / REPEL_RADIUS;
          const f = t2 * t2 * REPEL_STRENGTH;
          rx = (dx / dist) * f;
          ry = (dy / dist) * f;
        }

        // Spring toward wave target + repulsion offset
        p.vx = (p.vx + (tx + rx - p.x) * SPRING) * DAMPING;
        p.vy = (p.vy + (ty + ry - p.y) * SPRING) * DAMPING;
        p.x += p.vx;
        p.y += p.vy;
      }

      // Draw horizontal lines
      ctx.strokeStyle = "rgba(178, 180, 31, 0.075)";
      ctx.lineWidth = 0.6;
      for (let r = 0; r < rows; r++) {
        ctx.beginPath();
        for (let c = 0; c < cols; c++) {
          const p = points[r * cols + c];
          if (c === 0) ctx.moveTo(p.x, p.y);
          else ctx.lineTo(p.x, p.y);
        }
        ctx.stroke();
      }

      // Draw vertical lines
      for (let c = 0; c < cols; c++) {
        ctx.beginPath();
        for (let r = 0; r < rows; r++) {
          const p = points[r * cols + c];
          if (r === 0) ctx.moveTo(p.x, p.y);
          else ctx.lineTo(p.x, p.y);
        }
        ctx.stroke();
      }

      // Draw intersection dots — brighter near the mouse
      for (const p of points) {
        const dx = p.x - mx;
        const dy = p.y - my;
        const dist = Math.sqrt(dx * dx + dy * dy);
        const proximity = Math.max(0, 1 - dist / (REPEL_RADIUS * 1.4));
        const alpha = 0.12 + proximity * 0.5;
        const radius = 0.9 + proximity * 1.4;
        ctx.beginPath();
        ctx.arc(p.x, p.y, radius, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(178, 180, 31, ${alpha})`;
        ctx.fill();
      }
    }

    resize();
    raf = requestAnimationFrame(draw);

    const ro = new ResizeObserver(resize);
    ro.observe(canvas);

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
    };
  }, [mouseRef]);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden
      className="pointer-events-none absolute inset-0 h-full w-full"
    />
  );
}
