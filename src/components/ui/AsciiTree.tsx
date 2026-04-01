"use client";

import { useRef, useEffect, useCallback } from "react";

// ── palette ────────────────────────────────────────────────────────────────
const OLIVE = (a: number) => `rgba(178,180,31,${a})`;
const PERI  = (a: number) => `rgba(208,209,255,${a})`;

// ── metrics ────────────────────────────────────────────────────────────────
const CELL       = 18;
const FONT_SM    = `${Math.round(CELL * 0.72)}px "Geist Mono",ui-monospace,monospace`;
const FONT_BUD   = `${Math.round(CELL * 0.95)}px "Geist Mono",ui-monospace,monospace`;
const FONT_OPEN  = `${Math.round(CELL * 1.1)}px "Geist Mono",ui-monospace,monospace`;

// ── ascii characters ───────────────────────────────────────────────────────
const LEAF_CHARS  = [".", "'", "`", ",", "~", "·", ";", "'"];
const BLOOM_CHARS = ["·", "*", "+", "·", "*", "✦", "·"];
const CLOSED_BUD  = "⊙";
const OPEN_FLOWER = "✿";

const BLOOM_DUR   = 1500; // ms
const BLOOM_SPEED = 155;  // px/s
const SHAKE_DUR   = 750;  // ms per shake episode

// ── tree skeleton — fractional [x1,y1 → x2,y2] of the canvas ─────────────
const BRANCHES: [number, number, number, number][] = [
  [0.50, 0.99, 0.50, 0.56],  // trunk
  [0.50, 0.68, 0.26, 0.43],  // left main
  [0.50, 0.63, 0.74, 0.41],  // right main
  [0.50, 0.56, 0.49, 0.18],  // upper trunk
  [0.26, 0.43, 0.13, 0.27],  // left sub-1
  [0.26, 0.43, 0.38, 0.28],  // left sub-2
  [0.74, 0.41, 0.85, 0.24],  // right sub-1
  [0.74, 0.41, 0.63, 0.25],  // right sub-2
  [0.49, 0.18, 0.38, 0.08],  // top-left twig
  [0.49, 0.18, 0.60, 0.09],  // top-right twig
];

// leaf cluster centres
const LEAF_CLUSTERS: [number, number][] = [
  [0.13, 0.27],
  [0.38, 0.28],
  [0.49, 0.18],
  [0.38, 0.08],
  [0.60, 0.09],
  [0.85, 0.24],
  [0.63, 0.25],
];

// bud positions (on branch tips)
const BUD_FRACS: [number, number][] = [
  [0.13, 0.27],
  [0.38, 0.08],
  [0.60, 0.09],
  [0.85, 0.24],
];

// ── types ──────────────────────────────────────────────────────────────────
interface BudState {
  open:    boolean;
  shakeTs: number; // perf.now() when shake started; 0 = idle
  bloomTs: number; // perf.now() when bloom started; 0 = none
}

interface BranchPt { x: number; y: number; char: string; alpha: number }
interface LeafPt    { x: number; y: number; char: string; alpha: number }

interface Props {
  onBudClick?: (heroX: number, heroY: number) => void;
}

// ── component ──────────────────────────────────────────────────────────────
export default function AsciiTree({ onBudClick }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef    = useRef<HTMLCanvasElement>(null);
  const budsRef      = useRef<BudState[]>(
    BUD_FRACS.map(() => ({ open: false, shakeTs: 0, bloomTs: 0 }))
  );
  const rafRef = useRef(0);

  // ── click handler ─────────────────────────────────────────────────────
  const handleBudClick = useCallback((index: number) => {
    const canvas    = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    const bud = budsRef.current[index];
    if (bud.open) return;

    const cw = canvas.offsetWidth;
    const ch = canvas.offsetHeight;
    const [fx, fy] = BUD_FRACS[index];
    const px = fx * cw;
    const py = fy * ch;

    bud.bloomTs = performance.now();
    bud.open    = true;
    bud.shakeTs = 0;

    // fire position back to Hero so AsciiGlitch can trigger its own burst
    const containerRect = container.getBoundingClientRect();
    const heroEl = container.parentElement;
    const heroRect = heroEl?.getBoundingClientRect();
    if (heroRect) {
      onBudClick?.(
        containerRect.left - heroRect.left + px,
        containerRect.top  - heroRect.top  + py,
      );
    }
  }, [onBudClick]);

  // ── shake scheduler ───────────────────────────────────────────────────
  useEffect(() => {
    let timer: ReturnType<typeof setTimeout>;

    function schedule() {
      const delay = 1800 + Math.random() * 3000;
      timer = setTimeout(() => {
        const closed = budsRef.current
          .map((b, i) => ({ b, i }))
          .filter(({ b }) => !b.open && b.shakeTs === 0);
        if (closed.length) {
          const { i } = closed[Math.floor(Math.random() * closed.length)];
          budsRef.current[i].shakeTs = performance.now();
          setTimeout(() => { budsRef.current[i].shakeTs = 0; }, SHAKE_DUR);
        }
        schedule();
      }, delay);
    }

    schedule();
    return () => clearTimeout(timer);
  }, []);

  // ── canvas loop ───────────────────────────────────────────────────────
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let cw = 0, ch = 0, dpr = 1;
    let branchPts: BranchPt[] = [];
    let leafPts:   LeafPt[]   = [];

    function buildGeometry(w: number, h: number) {
      branchPts = [];
      leafPts   = [];

      // branch points
      BRANCHES.forEach(([fx1, fy1, fx2, fy2]) => {
        const x1 = fx1 * w, y1 = fy1 * h;
        const x2 = fx2 * w, y2 = fy2 * h;
        const dx = x2 - x1, dy = y2 - y1;
        const len = Math.sqrt(dx * dx + dy * dy);
        const aDy = Math.abs(dy), aDx = Math.abs(dx);

        let char: string;
        if (aDy / len > 0.85)      char = "|";
        else if (aDx / len > 0.85) char = "~";
        else if (dx * dy > 0)      char = "\\";
        else                       char = "/";

        const steps = Math.ceil(len / (CELL * 0.78));
        for (let s = 0; s <= steps; s++) {
          const t  = s / steps;
          const gx = Math.round((x1 + dx * t) / CELL) * CELL + CELL * 0.5;
          const gy = Math.round((y1 + dy * t) / CELL) * CELL + CELL * 0.5;
          branchPts.push({ x: gx, y: gy, char, alpha: 0.42 + Math.random() * 0.42 });
        }
      });

      // leaf clusters
      LEAF_CLUSTERS.forEach(([fx, fy]) => {
        const cx = fx * w, cy = fy * h;
        const count = 12 + Math.floor(Math.random() * 9);
        for (let i = 0; i < count; i++) {
          const angle = Math.random() * Math.PI * 2;
          const dist  = CELL * (0.7 + Math.random() * 2.4);
          leafPts.push({
            x:     cx + Math.cos(angle) * dist,
            y:     cy + Math.sin(angle) * dist,
            char:  LEAF_CHARS[Math.floor(Math.random() * LEAF_CHARS.length)],
            alpha: 0.25 + Math.random() * 0.28,
          });
        }
      });
    }

    function resize() {
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      cw  = canvas.offsetWidth;
      ch  = canvas.offsetHeight;
      canvas.width  = cw * dpr;
      canvas.height = ch * dpr;
      ctx.scale(dpr, dpr);
      buildGeometry(cw, ch);
    }

    function drawBloom(bx: number, by: number, elapsed: number) {
      if (elapsed > BLOOM_DUR) return;
      const progress = elapsed / BLOOM_DUR;
      const radius   = elapsed * BLOOM_SPEED / 1000;

      for (let ring = 0; ring < 4; ring++) {
        const r     = radius * (1 - ring * 0.22);
        if (r <= 0) continue;
        const alpha = Math.max(0, (1 - progress) * (1 - ring * 0.25) * 0.95);
        const count = Math.max(6, Math.ceil(r / CELL * 5));
        for (let i = 0; i < count; i++) {
          const a = (i / count) * Math.PI * 2;
          ctx.fillStyle = PERI(alpha);
          ctx.fillText(
            BLOOM_CHARS[Math.floor(Math.random() * BLOOM_CHARS.length)],
            bx + Math.cos(a) * r,
            by + Math.sin(a) * r,
          );
        }
      }
    }

    function draw(ts: number) {
      rafRef.current = requestAnimationFrame(draw);
      ctx.clearRect(0, 0, cw, ch);

      ctx.textBaseline = "middle";
      ctx.textAlign    = "center";

      // ── tree structure ─────────────────────────────────────────────
      ctx.font = FONT_SM;
      for (const pt of branchPts) {
        ctx.fillStyle = OLIVE(pt.alpha);
        ctx.fillText(pt.char, pt.x, pt.y);
      }
      for (const pt of leafPts) {
        ctx.fillStyle = OLIVE(pt.alpha);
        ctx.fillText(pt.char, pt.x, pt.y);
      }

      // ── buds ──────────────────────────────────────────────────────
      budsRef.current.forEach((bud, i) => {
        const [fx, fy] = BUD_FRACS[i];
        let bx = fx * cw;
        let by = fy * ch;

        // shake
        if (!bud.open && bud.shakeTs > 0) {
          const age = ts - bud.shakeTs;
          const amp = 3.2 * Math.exp(-age / 220);
          bx += Math.sin(age * 0.048) * amp;
          by += Math.cos(age * 0.039) * amp * 0.6;
        }

        if (bud.open) {
          // open flower centre
          ctx.font      = FONT_OPEN;
          ctx.fillStyle = PERI(0.95);
          ctx.fillText(OPEN_FLOWER, bx, by);

          // static petal ring
          ctx.font      = FONT_SM;
          ctx.fillStyle = PERI(0.40);
          for (let p = 0; p < 8; p++) {
            const a = p * Math.PI / 4;
            ctx.fillText("·", bx + Math.cos(a) * CELL * 1.3, by + Math.sin(a) * CELL * 1.3);
          }

          // bloom animation
          if (bud.bloomTs > 0) {
            drawBloom(bx, by, ts - bud.bloomTs);
          }
        } else {
          // closed bud — pulse glow when shaking
          const glowing = bud.shakeTs > 0;
          ctx.font      = FONT_BUD;
          ctx.fillStyle = PERI(glowing ? 0.92 : 0.72);
          if (glowing) {
            ctx.shadowColor = PERI(0.45);
            ctx.shadowBlur  = 8;
          }
          ctx.fillText(CLOSED_BUD, bx, by);
          ctx.shadowBlur = 0;
        }
      });
    }

    resize();
    rafRef.current = requestAnimationFrame(draw);

    const ro = new ResizeObserver(resize);
    ro.observe(canvas);

    return () => {
      cancelAnimationFrame(rafRef.current);
      ro.disconnect();
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className="pointer-events-none absolute inset-y-0 right-0 hidden w-[44%] md:block"
      style={{ zIndex: 2 }}
    >
      <canvas
        ref={canvasRef}
        aria-hidden
        className="absolute inset-0 h-full w-full"
      />

      {/* invisible click targets over each bud */}
      {BUD_FRACS.map(([fx, fy], i) => (
        <button
          key={i}
          onClick={() => handleBudClick(i)}
          aria-label={`Open flower bud ${i + 1}`}
          style={{
            position:       "absolute",
            left:           `${fx * 100}%`,
            top:            `${fy * 100}%`,
            width:          CELL * 2.8,
            height:         CELL * 2.8,
            transform:      "translate(-50%, -50%)",
            background:     "transparent",
            border:         "none",
            cursor:         "pointer",
            pointerEvents:  "auto",
          }}
        />
      ))}
    </div>
  );
}
