"use client";

import { useRef, useEffect, useImperativeHandle, forwardRef } from "react";
import { MotionValue, useMotionValue, animate } from "framer-motion";

interface MagnoliaScrollProps {
  progress: MotionValue<number>;
}

export interface MagnoliaScrollHandle {
  triggerClick: () => void;
}

const PERIWINKLE_RGB: [number, number, number] = [208, 209, 255];
const CHAR_W_RATIO   = 0.55;
const SWEEP_BAND     = 0.07;
const GLITCH_BAND    = 0.04;
const GLITCH_CHARS   = "01<>{}[]|/\\!#@%*+=~^?;:アイウエカキ".split("");
const GLITCH_MS      = 65;
const CLICK_DURATION = 0.9; // seconds (for framer-motion animate)

interface ParsedArt {
  sorted: { c: number; r: number; ch: string }[];
  minC: number; maxC: number;
  minR: number; maxR: number;
}

function parseAll(text: string): ParsedArt {
  const lines = text.split("\n");
  const pts: { c: number; r: number; ch: string }[] = [];
  let minC = Infinity, maxC = 0, minR = Infinity, maxR = 0;
  for (let r = 0; r < lines.length; r++) {
    const line = lines[r];
    for (let c = 0; c < line.length; c++) {
      const ch = line[c];
      if (ch !== " " && ch !== "\r") {
        pts.push({ c, r, ch });
        if (c < minC) minC = c;
        if (c > maxC) maxC = c;
        if (r < minR) minR = r;
        if (r > maxR) maxR = r;
      }
    }
  }
  const sorted = pts.sort((a, b) => a.r !== b.r ? a.r - b.r : a.c - b.c);
  return { sorted, minC, maxC, minR, maxR };
}

function smoothstep(edge0: number, edge1: number, x: number): number {
  const t = Math.max(0, Math.min(1, (x - edge0) / (edge1 - edge0)));
  return t * t * (3 - 2 * t);
}

function srand(c: number, r: number): number {
  let h = (c * 374761393 + r * 1234567891) | 0;
  h = ((h ^ (h >>> 13)) * 1540483477) | 0;
  h = h ^ (h >>> 15);
  return (h >>> 0) / 0xffffffff;
}

interface RenderPt {
  x: number; y: number; ch: string;
  sweepFrac: number;
  c: number; r: number;
}

interface RenderCache {
  budRenderPoints:   RenderPt[];
  bloomRpts: RenderPt[];
  fontSize:  number;
  cw: number; ch: number;
}

function buildCache(bud: ParsedArt, bloom: ParsedArt, cw: number, ch: number): RenderCache {
  const unionMinC = Math.min(bud.minC, bloom.minC);
  const unionMaxC = Math.max(bud.maxC, bloom.maxC);
  const unionMinR = Math.min(bud.minR, bloom.minR);
  const unionMaxR = Math.max(bud.maxR, bloom.maxR);

  const fontSize = Math.min(
    cw / ((unionMaxC - unionMinC + 1) * CHAR_W_RATIO),
    ch /  (unionMaxR - unionMinR + 1),
    14,
  );
  const charW = fontSize * CHAR_W_RATIO;
  const charH = fontSize;

  const ox = cw / 2 - ((unionMinC + unionMaxC) / 2) * charW;
  const oy = ch / 2 - ((unionMinR + unionMaxR) / 2) * charH;
  const rowSpan = Math.max(1, unionMaxR - unionMinR);

  function toRpts(art: ParsedArt): RenderPt[] {
    return art.sorted.map(p => ({
      x:         ox + p.c * charW + charW * 0.5,
      y:         oy + p.r * charH + charH * 0.5,
      ch:        p.ch,
      sweepFrac: (p.r - unionMinR) / rowSpan,
      c:         p.c,
      r:         p.r,
    }));
  }

  return { budRenderPoints: toRpts(bud), bloomRpts: toRpts(bloom), fontSize, cw, ch };
}

/** Renders ASCII bud→bloom morph on canvas, driven by a scroll MotionValue or click toggle. */
const MagnoliaScroll = forwardRef<MagnoliaScrollHandle, MagnoliaScrollProps>(
  function MagnoliaScroll({ progress }, ref) {
    const canvasRef    = useRef<HTMLCanvasElement>(null);
    const budRef       = useRef<ParsedArt | null>(null);
    const bloomRef     = useRef<ParsedArt | null>(null);
    const cacheRef     = useRef<RenderCache | null>(null);
    const rafRef       = useRef(0);
    const clickStateRef = useRef(0); // 0 = bud, 1 = bloom
    const clickProg    = useMotionValue(0); // 0=bud, 1=bloom; animated on click

    useImperativeHandle(ref, () => ({
      triggerClick() {
        const target = clickStateRef.current === 0 ? 1 : 0;
        clickStateRef.current = target;
        animate(clickProg, target, {
          duration: CLICK_DURATION,
          ease: [0.22, 1, 0.36, 1],
        });
      },
    }));

    useEffect(() => {
      async function load() {
        const [budText, bloomText] = await Promise.all([
          fetch("/ascii-bud.txt").then(r => r.text()),
          fetch("/ascii-bloom.txt").then(r => r.text()),
        ]);
        budRef.current   = parseAll(budText);
        bloomRef.current = parseAll(bloomText);
        cacheRef.current = null;
      }
      load();
    }, []);

    useEffect(() => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      let cw = 0, ch = 0, dpr = 1;
      const cv = canvas;
      const cx = ctx;

      function resize() {
        dpr = Math.min(window.devicePixelRatio || 1, 2);
        cw  = cv.offsetWidth;
        ch  = cv.offsetHeight;
        cv.width  = cw * dpr;
        cv.height = ch * dpr;
        cx.scale(dpr, dpr);
        cacheRef.current = null;
      }

      let visible = true;
      const io = new IntersectionObserver(([e]) => {
        visible = e.isIntersecting;
        if (visible && rafRef.current === 0) rafRef.current = requestAnimationFrame(draw);
      }, { rootMargin: "200px" });
      io.observe(cv);

      function draw(ts: number) {
        if (!visible) { rafRef.current = 0; return; }
        rafRef.current = requestAnimationFrame(draw);
        if (!budRef.current || !bloomRef.current) return;

        if (!cacheRef.current || cacheRef.current.cw !== cw || cacheRef.current.ch !== ch) {
          cacheRef.current = buildCache(budRef.current, bloomRef.current, cw, ch);
        }

        const { budRenderPoints, bloomRpts, fontSize } = cacheRef.current;

        // Click animation (via Framer Motion MotionValue) overrides scroll when active or locked at bloom
        const cp = clickProg.get();
        const scrollProg = Math.max(0, Math.min(1, progress.get()));

        // When bloomed (state=1) or mid-click-animation, use clickProg; otherwise use scroll
        let prog: number;
        if (clickStateRef.current === 1 || cp > 0) {
          prog = cp;
        } else {
          prog = scrollProg;
        }

        // Only show glitch while transitioning; GLITCH_BAND narrows it to a thin strip at the sweep front.
        const transitioning = prog > 0.01 && prog < 0.99;

        cx.clearRect(0, 0, cw, ch);
        cx.font         = `${fontSize}px "Geist Mono", ui-monospace, monospace`;
        cx.textBaseline = "middle";
        cx.textAlign    = "center";

        const [R, G, B] = PERIWINKLE_RGB;
        const gi = Math.floor(ts / GLITCH_MS);

        // ── Bud: fades out as wave sweeps top→bottom ─────────────────────
        for (const p of budRenderPoints) {
          const dist = p.sweepFrac - prog;
          if (dist < -SWEEP_BAND) continue;

          const envA     = dist > SWEEP_BAND ? 1 : smoothstep(-SWEEP_BAND, SWEEP_BAND, dist);
          const baseA    = 0.45 + srand(p.c, p.r) * 0.55;
          const alpha    = baseA * envA;
          if (alpha < 0.004) continue;

          const inGlitch = transitioning && Math.abs(dist) < GLITCH_BAND;
          cx.shadowColor = `rgba(${R},${G},${B},${alpha * 0.35})`;
          cx.shadowBlur  = inGlitch ? 7 : 3;
          cx.fillStyle   = `rgba(${R},${G},${B},${alpha})`;
          cx.fillText(inGlitch ? GLITCH_CHARS[gi % GLITCH_CHARS.length] : p.ch, p.x, p.y);
        }

        // ── Bloom: fades in as wave passes ───────────────────────────────
        for (const p of bloomRpts) {
          const dist = prog - p.sweepFrac;
          if (dist < -SWEEP_BAND) continue;

          const envA     = dist > SWEEP_BAND ? 1 : smoothstep(-SWEEP_BAND, SWEEP_BAND, dist);
          const baseA    = 0.45 + srand(p.c + 999, p.r + 999) * 0.55;
          const alpha    = baseA * envA;
          if (alpha < 0.004) continue;

          const inGlitch = transitioning && Math.abs(dist) < GLITCH_BAND;
          cx.shadowColor = `rgba(${R},${G},${B},${alpha * 0.35})`;
          cx.shadowBlur  = inGlitch ? 7 : 3;
          cx.fillStyle   = `rgba(${R},${G},${B},${alpha})`;
          cx.fillText(inGlitch ? GLITCH_CHARS[(gi + 7) % GLITCH_CHARS.length] : p.ch, p.x, p.y);
        }

        cx.shadowBlur = 0;
      }

      resize();
      rafRef.current = requestAnimationFrame(draw);
      const ro = new ResizeObserver(resize);
      ro.observe(cv);

      return () => {
        cancelAnimationFrame(rafRef.current);
        ro.disconnect();
        io.disconnect();
      };
    }, [progress, clickProg]);

    return (
      <canvas
        ref={canvasRef}
        aria-hidden
        className="pointer-events-none absolute inset-y-0 right-0 h-full w-[44%] opacity-90"
      />
    );
  }
);

MagnoliaScroll.displayName = "MagnoliaScroll";
export default MagnoliaScroll;
