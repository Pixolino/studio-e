"use client";

import { useRef, useEffect } from "react";
import { MotionValue } from "framer-motion";

interface MagnoliaScrollProps {
  progress: MotionValue<number>;
}

const PERIWINKLE: [number, number, number] = [208, 209, 255];
const CHAR_W_RATIO = 0.55;
const SWEEP_BAND   = 0.07;
const GLITCH_BAND  = 0.04;
const GLITCH_CHARS = "01<>{}[]|/\\!#@%*+=~^?;:アイウエカキ".split("");
const GLITCH_MS    = 65;

interface ParsedArt {
  sorted: { c: number; r: number; ch: string }[];
  minC: number; maxC: number;
  minR: number; maxR: number;
  centroidC: number;
  centroidR: number;
}

function parseAll(text: string): ParsedArt {
  const lines = text.split("\n");
  const pts: { c: number; r: number; ch: string }[] = [];
  let minC = Infinity, maxC = 0, minR = Infinity, maxR = 0;
  let sumC = 0, sumR = 0;
  for (let r = 0; r < lines.length; r++) {
    const line = lines[r];
    for (let c = 0; c < line.length; c++) {
      const ch = line[c];
      if (ch !== " " && ch !== "\r") {
        pts.push({ c, r, ch });
        sumC += c; sumR += r;
        if (c < minC) minC = c;
        if (c > maxC) maxC = c;
        if (r < minR) minR = r;
        if (r > maxR) maxR = r;
      }
    }
  }
  const sorted = pts.sort((a, b) => a.r !== b.r ? a.r - b.r : a.c - b.c);
  const n = pts.length || 1;
  return { sorted, minC, maxC, minR, maxR, centroidC: sumC / n, centroidR: sumR / n };
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
  x: number;
  y: number;
  ch: string;
  sweepFrac: number;
  c: number;
  r: number;
}

interface RenderCache {
  budRpts:   RenderPt[];
  bloomRpts: RenderPt[];
  fontSize:  number;
  cw: number;
  ch: number;
}

function buildCache(bud: ParsedArt, bloom: ParsedArt, cw: number, ch: number): RenderCache {
  const sharedVisualW = Math.max(bud.maxC - bud.minC, bloom.maxC - bloom.minC) + 1;
  const sharedVisualH = Math.max(bud.maxR - bud.minR, bloom.maxR - bloom.minR) + 1;
  const fontSize = Math.min(
    cw / (sharedVisualW * CHAR_W_RATIO),
    ch / sharedVisualH,
    14,
  );
  const charW = fontSize * CHAR_W_RATIO;
  const charH = fontSize;

  function toRpts(art: ParsedArt): RenderPt[] {
    const ox = cw / 2 - art.centroidC * charW;
    const oy = ch / 2 - art.centroidR * charH;
    const span = Math.max(1, art.maxR - art.minR);
    return art.sorted.map(p => ({
      x:         ox + p.c * charW + charW * 0.5,
      y:         oy + p.r * charH + charH * 0.5,
      ch:        p.ch,
      sweepFrac: (p.r - art.minR) / span,
      c:         p.c,
      r:         p.r,
    }));
  }

  return { budRpts: toRpts(bud), bloomRpts: toRpts(bloom), fontSize, cw, ch };
}

export default function MagnoliaScroll({ progress }: MagnoliaScrollProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const budRef    = useRef<ParsedArt | null>(null);
  const bloomRef  = useRef<ParsedArt | null>(null);
  const cacheRef  = useRef<RenderCache | null>(null);
  const rafRef    = useRef(0);

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

    function resize() {
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      cw  = canvas.offsetWidth;
      ch  = canvas.offsetHeight;
      canvas.width  = cw * dpr;
      canvas.height = ch * dpr;
      ctx.scale(dpr, dpr);
      cacheRef.current = null;
    }

    function draw(ts: number) {
      rafRef.current = requestAnimationFrame(draw);
      if (!budRef.current || !bloomRef.current) return;

      if (!cacheRef.current || cacheRef.current.cw !== cw || cacheRef.current.ch !== ch) {
        cacheRef.current = buildCache(budRef.current, bloomRef.current, cw, ch);
      }

      const { budRpts, bloomRpts, fontSize } = cacheRef.current;
      const prog = Math.max(0, Math.min(1, progress.get()));

      ctx.clearRect(0, 0, cw, ch);
      ctx.font         = `${fontSize}px "Geist Mono", ui-monospace, monospace`;
      ctx.textBaseline = "middle";
      ctx.textAlign    = "center";

      const [R, G, B] = PERIWINKLE;
      const gi = Math.floor(ts / GLITCH_MS);

      // ── Bud: fades out as wave sweeps top→bottom ──────────────────────
      for (const p of budRpts) {
        const dist = p.sweepFrac - prog;
        if (dist < -SWEEP_BAND) continue;

        const envA  = dist > SWEEP_BAND ? 1 : smoothstep(-SWEEP_BAND, SWEEP_BAND, dist);
        const baseA = 0.45 + srand(p.c, p.r) * 0.55;
        const alpha = baseA * envA;
        if (alpha < 0.004) continue;

        const inGlitch = Math.abs(dist) < GLITCH_BAND;
        const ch_d     = inGlitch ? GLITCH_CHARS[gi % GLITCH_CHARS.length] : p.ch;

        ctx.shadowColor = `rgba(${R},${G},${B},${alpha * 0.35})`;
        ctx.shadowBlur  = inGlitch ? 7 : 3;
        ctx.fillStyle   = `rgba(${R},${G},${B},${alpha})`;
        ctx.fillText(ch_d, p.x, p.y);
      }

      // ── Bloom: fades in as wave passes ────────────────────────────────
      for (const p of bloomRpts) {
        const dist = prog - p.sweepFrac;
        if (dist < -SWEEP_BAND) continue;

        const envA  = dist > SWEEP_BAND ? 1 : smoothstep(-SWEEP_BAND, SWEEP_BAND, dist);
        const baseA = 0.45 + srand(p.c + 999, p.r + 999) * 0.55;
        const alpha = baseA * envA;
        if (alpha < 0.004) continue;

        const inGlitch = Math.abs(dist) < GLITCH_BAND;
        const ch_d     = inGlitch ? GLITCH_CHARS[(gi + 7) % GLITCH_CHARS.length] : p.ch;

        ctx.shadowColor = `rgba(${R},${G},${B},${alpha * 0.35})`;
        ctx.shadowBlur  = inGlitch ? 7 : 3;
        ctx.fillStyle   = `rgba(${R},${G},${B},${alpha})`;
        ctx.fillText(ch_d, p.x, p.y);
      }

      ctx.shadowBlur = 0;
    }

    resize();
    rafRef.current = requestAnimationFrame(draw);
    const ro = new ResizeObserver(resize);
    ro.observe(canvas);

    return () => {
      cancelAnimationFrame(rafRef.current);
      ro.disconnect();
    };
  }, [progress]);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden
      className="pointer-events-none absolute inset-y-0 right-0 h-full w-[44%] opacity-90"
    />
  );
}
