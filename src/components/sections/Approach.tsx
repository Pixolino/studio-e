"use client";

import { useRef, useState, useEffect, forwardRef, useImperativeHandle } from "react";
import {
  motion,
  useInView,
  useScroll,
  useMotionValue,
  useMotionValueEvent,
  animate,
  AnimatePresence,
  type MotionValue,
} from "framer-motion";
import { lenisStore } from "@/lib/lenis-store";
import PeriodicGlitch from "@/components/ui/PeriodicGlitch";

/* ─── data ──────────────────────────────────────────────────── */
const pillars = [
  {
    number: "01",
    title: "Artful Precision",
    description:
      "We don\u2019t design\u2014we curate. A rigorous aesthetic standard applied to every surface of your brand, from identity system to interface. We signal quality and trust on contact.",
  },
  {
    number: "02",
    title: "Technical Fluidity",
    description:
      "We build high-performance digital ecosystems\u2014refined on the surface, sophisticated underneath. Your technology will never limit your ambition.",
  },
  {
    number: "03",
    title: "Direct Partnership",
    description:
      "No account managers. No junior designers. You work directly with the principals on every decision. A founder-to-founder relationship built on candor and shared ambition.",
  },
];

/* ─── helper: timed MotionValue for mobile inView trigger ───── */

/* ─── ASCII canvas types ─────────────────────────────────────── */
interface Pt { x: number; y: number; ch: string; dist: number }

/* ─── ApproachAscii: loads a .txt file and renders on canvas ─── */
interface ApproachAsciiProps {
  src: string;
  progress: MotionValue<number>;
  /** "center" = center-outward | "outside" = outside-in | "top" = top-to-bottom */
  revealOrder?: "center" | "outside" | "top";
}

// Chars that render in gold; everything else renders in periwinkle
const ACCENT = new Set(["◆", "◇", "◈", "◉", "◯", "○", "●", "×", "✦", "✧", "+", "*"]);

function ApproachAscii({
  src,
  progress,
  revealOrder = "center",
}: ApproachAsciiProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rafRef    = useRef(0);
  const [artLines, setArtLines] = useState<string[]>([]);

  useEffect(() => {
    fetch(src)
      .then((r) => r.text())
      .then((text) => setArtLines(text.split("\n").filter((l) => l.length > 0)));
  }, [src]);

  useEffect(() => {
    if (!artLines.length) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    let cw = 0, ch = 0, pts: Pt[] = [], fontSize = 13;
    const c = canvas;
    const cx = ctx;

    function reparse() {
      cw = c.offsetWidth  || 300;
      ch = c.offsetHeight || 200;
      c.width  = cw * dpr;
      c.height = ch * dpr;
      cx.setTransform(dpr, 0, 0, dpr, 0, 0);

      // Use actual content bounding box so spaces don't shrink the font
      let minC = Infinity, maxC = -Infinity, minR = Infinity, maxR = -Infinity;
      for (let r = 0; r < artLines.length; r++)
        for (let ci = 0; ci < artLines[r].length; ci++)
          if (artLines[r][ci] !== " " && artLines[r][ci] !== "\r") {
            if (ci < minC) minC = ci; if (ci > maxC) maxC = ci;
            if (r  < minR) minR = r;  if (r  > maxR) maxR = r;
          }

      const RW = 0.52, RH = 1.0;
      const COLS = maxC - minC + 1;
      const ROWS = maxR - minR + 1;
      const fs = Math.min(cw / (COLS * RW), ch / (ROWS * RH), 20);
      const CW = fs * RW, CH = fs * RH;
      const ox = cw / 2 - ((minC + maxC) / 2) * CW;
      const oy = ch / 2 - ((minR + maxR) / 2) * CH;
      fontSize = fs;

      const raw: Pt[] = [];
      for (let r = 0; r < artLines.length; r++) {
        for (let ci = 0; ci < artLines[r].length; ci++) {
          const char = artLines[r][ci];
          if (char === " " || char === "\r") continue;
          const x = ox + ci * CW + CW / 2;
          const y = oy + r  * CH + CH / 2;
          raw.push({ x, y, ch: char, dist: Math.hypot(x - cw / 2, y - ch / 2) });
        }
      }

      if (revealOrder === "center")   pts = raw.sort((a, b) => a.dist - b.dist);
      else if (revealOrder === "outside") pts = raw.sort((a, b) => b.dist - a.dist);
      else pts = raw.sort((a, b) => a.y - b.y || a.x - b.x);
    }

    reparse();
    const ro = new ResizeObserver(reparse);
    ro.observe(canvas);

    function draw() {
      rafRef.current = requestAnimationFrame(draw);
      if (!pts.length) return;

      const prog = progress.get();
      const nVis = Math.min(pts.length, Math.ceil(prog * pts.length + 0.5));

      cx.clearRect(0, 0, cw, ch);
      cx.font         = `${fontSize}px "Geist Mono", monospace`;
      cx.textBaseline = "middle";
      cx.textAlign    = "center";

      for (let i = 0; i < nVis; i++) {
        const p = pts[i];
        const isAccent = ACCENT.has(p.ch);
        const rr = isAccent ? 178 : 208;
        const gg = isAccent ? 180 : 209;
        const bb = isAccent ? 31  : 255;
        const alpha = isAccent ? 0.92 : 0.85;
        cx.shadowColor = `rgba(${rr},${gg},${bb},0.5)`;
        cx.shadowBlur  = isAccent ? 6 : 4;
        cx.fillStyle   = `rgba(${rr},${gg},${bb},${alpha})`;
        cx.fillText(p.ch, p.x, p.y);
      }

      cx.shadowBlur = 0;
    }

    rafRef.current = requestAnimationFrame(draw);
    return () => { cancelAnimationFrame(rafRef.current); ro.disconnect(); };
  }, [artLines, progress, revealOrder]);

  return <canvas ref={canvasRef} aria-hidden className="h-full w-full" />;
}

/* ─── ButterflyMorph: three-frame scroll-driven morph ───────── */
const MORPH_BAND = 0.07;

function smoothstep(e0: number, e1: number, x: number) {
  const t = Math.max(0, Math.min(1, (x - e0) / (e1 - e0)));
  return t * t * (3 - 2 * t);
}

function getBlend(s: number): number {
  const T1S = 0.15, T1E = 0.37, T2S = 0.51, T2E = 0.74;
  if (s < T1S) return 0;
  if (s < T1E) return (s - T1S) / (T1E - T1S);
  if (s < T2S) return 1;
  if (s < T2E) return 1 + (s - T2S) / (T2E - T2S);
  return 2;
}

export interface ButterflyMorphHandle {
  jumpTo: (frame: number) => void;
}

interface MorphPt { x: number; y: number; ch: string; sweepFrac: number; seed: number }

function parseRawArt(text: string): { c: number; r: number; ch: string }[] {
  const lines = text.split("\n");
  const pts: { c: number; r: number; ch: string }[] = [];
  for (let r = 0; r < lines.length; r++)
    for (let c = 0; c < lines[r].length; c++) {
      const ch = lines[r][c];
      if (ch !== " " && ch !== "\r") pts.push({ c, r, ch });
    }
  return pts;
}

function buildMorphFrames(
  raws: { c: number; r: number; ch: string }[][],
  cw: number, ch: number,
): { frames: MorphPt[][]; fontSize: number } {
  let minC = Infinity, maxC = -Infinity, minR = Infinity, maxR = -Infinity;
  for (const art of raws)
    for (const p of art) {
      if (p.c < minC) minC = p.c; if (p.c > maxC) maxC = p.c;
      if (p.r < minR) minR = p.r; if (p.r > maxR) maxR = p.r;
    }
  const RW = 0.62, RH = 1.35;
  const fontSize = Math.min(cw / ((maxC - minC + 1) * RW), ch / ((maxR - minR + 1) * RH), 16);
  const CW = fontSize * RW, CH = fontSize * RH;
  const ox = cw / 2 - ((minC + maxC) / 2) * CW;
  const oy = ch / 2 - ((minR + maxR) / 2) * CH;
  const rowSpan = Math.max(1, maxR - minR);
  const frames = raws.map(art => art.map(p => ({
    x: ox + p.c * CW + CW * 0.5,
    y: oy + p.r * CH + CH * 0.5,
    ch: p.ch,
    sweepFrac: (p.r - minR) / rowSpan,
    seed: ((p.c * 374761393 + p.r * 1234567891) >>> 0) / 0xffffffff,
  })));
  return { frames, fontSize };
}

const ButterflyMorph = forwardRef<ButterflyMorphHandle, { scrollYProgress: MotionValue<number> }>(
function ButterflyMorph({ scrollYProgress }, ref) {
  const canvasRef      = useRef<HTMLCanvasElement>(null);
  const rawRef         = useRef<ReturnType<typeof parseRawArt>[] | null>(null);
  const cacheRef       = useRef<{ frames: MorphPt[][]; fontSize: number; cw: number; ch: number } | null>(null);
  const rafRef         = useRef(0);
  const overrideBlend  = useMotionValue(-1);
  const overrideActive = useRef(false);

  useImperativeHandle(ref, () => ({
    jumpTo(frame: number) {
      const current = overrideActive.current
        ? overrideBlend.get()
        : getBlend(Math.max(0, Math.min(1, scrollYProgress.get())));
      overrideBlend.set(current);
      overrideActive.current = true;
      animate(overrideBlend, frame, {
        duration: 0.85,
        ease: [0.22, 1, 0.36, 1],
        onComplete: () => { overrideActive.current = false; },
      });
    },
  }));

  useEffect(() => {
    Promise.all([
      fetch("/approach-precision.txt").then(r => r.text()),
      fetch("/approach-fluidity.txt").then(r => r.text()),
      fetch("/approach-partnership.txt").then(r => r.text()),
    ]).then(texts => {
      rawRef.current = texts.map(parseRawArt);
      cacheRef.current = null;
    });
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const cv = canvas, cx = ctx;
    let cw = 0, cvh = 0, dpr = 1;

    function resize() {
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      cw = cv.offsetWidth; cvh = cv.offsetHeight;
      cv.width = cw * dpr; cv.height = cvh * dpr;
      cx.setTransform(dpr, 0, 0, dpr, 0, 0);
      cacheRef.current = null;
    }

    function draw() {
      rafRef.current = requestAnimationFrame(draw);
      if (!rawRef.current) return;

      if (!cacheRef.current || cacheRef.current.cw !== cw || cacheRef.current.ch !== cvh) {
        const built = buildMorphFrames(rawRef.current, cw, cvh);
        cacheRef.current = { ...built, cw, ch: cvh };
      }

      const { frames, fontSize } = cacheRef.current;
      const blend = overrideActive.current
        ? Math.max(0, Math.min(2, overrideBlend.get()))
        : getBlend(Math.max(0, Math.min(1, scrollYProgress.get())));
      const phase = Math.min(1, Math.floor(blend));
      const frac  = blend - phase;
      const transitioning = frac > 0.01 && frac < 0.99;
      // Sweep only covers the top half — hand rows (sweepFrac >= 0.5) show destination immediately
      const SWEEP_TOP = 0.638;

      cx.clearRect(0, 0, cw, cvh);
      cx.font = `${fontSize}px "Geist Mono", monospace`;
      cx.textBaseline = "middle";
      cx.textAlign    = "center";

      if (!transitioning) {
        for (const p of frames[Math.round(blend)]) {
          const isAccent = ACCENT.has(p.ch);
          const [rr, gg, bb] = isAccent ? [178, 180, 31] : [208, 209, 255];
          const alpha = isAccent ? 0.92 : 0.82;
          cx.shadowColor = `rgba(${rr},${gg},${bb},0.3)`;
          cx.shadowBlur  = isAccent ? 4 : 2;
          cx.fillStyle   = `rgba(${rr},${gg},${bb},${alpha})`;
          cx.fillText(p.ch, p.x, p.y);
        }
      } else {
        // sweepPos: 0→SWEEP_TOP as frac goes 0→1 — wave reaches cutoff exactly at frac=1
        const sweepPos = frac * SWEEP_TOP;
        // Top half of source fades out; bottom half (hand) skipped — dest shows there immediately
        for (const p of frames[phase]) {
          if (p.sweepFrac >= SWEEP_TOP) continue;
          const dist = p.sweepFrac - sweepPos;
          if (dist < -MORPH_BAND) continue;
          const env   = dist > MORPH_BAND ? 1 : smoothstep(-MORPH_BAND, MORPH_BAND, dist);
          const isAccent = ACCENT.has(p.ch);
          const [rr, gg, bb] = isAccent ? [178, 180, 31] : [208, 209, 255];
          const alpha = (isAccent ? 0.92 : 0.82) * env;
          if (alpha < 0.004) continue;
          cx.shadowColor = `rgba(${rr},${gg},${bb},0.3)`;
          cx.shadowBlur  = 2;
          cx.fillStyle   = `rgba(${rr},${gg},${bb},${alpha})`;
          cx.fillText(p.ch, p.x, p.y);
        }
        // Top half of dest fades in; bottom half shows at full opacity immediately
        for (const p of frames[phase + 1]) {
          let env: number;
          if (p.sweepFrac >= SWEEP_TOP) {
            env = 1;
          } else {
            const dist = sweepPos - p.sweepFrac;
            if (dist < -MORPH_BAND) continue;
            env = dist > MORPH_BAND ? 1 : smoothstep(-MORPH_BAND, MORPH_BAND, dist);
          }
          const isAccent = ACCENT.has(p.ch);
          const [rr, gg, bb] = isAccent ? [178, 180, 31] : [208, 209, 255];
          const alpha = (isAccent ? 0.92 : 0.82) * env;
          if (alpha < 0.004) continue;
          cx.shadowColor = `rgba(${rr},${gg},${bb},0.3)`;
          cx.shadowBlur  = 2;
          cx.fillStyle   = `rgba(${rr},${gg},${bb},${alpha})`;
          cx.fillText(p.ch, p.x, p.y);
        }
      }

      cx.shadowBlur = 0;
    }

    resize();
    rafRef.current = requestAnimationFrame(draw);
    const ro = new ResizeObserver(resize);
    ro.observe(cv);
    return () => { cancelAnimationFrame(rafRef.current); ro.disconnect(); };
  }, [scrollYProgress, overrideBlend]);

  return <canvas ref={canvasRef} aria-hidden className="h-full w-full" />;
});
ButterflyMorph.displayName = "ButterflyMorph";

/* ─── Mobile: stacked pillar cards ──────────────────────────── */
function MobilePillarCard({ pillar, index }: { pillar: (typeof pillars)[0]; index: number }) {
  const ref    = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-60px" });

  // Scroll-driven reveal: starts when card title (~card top) hits 65% viewport, completes at 15%
  const { scrollYProgress: progress } = useScroll({
    target: ref,
    offset: ["start 0.65", "start 0.15"],
  });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 32 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.8, delay: index * 0.12, ease: [0.22, 1, 0.36, 1] }}
      className="relative border-t border-gold/10 pb-10 pr-8 pt-8"
    >
      <motion.div
        initial={{ scaleX: 0 }}
        animate={inView ? { scaleX: 1 } : {}}
        transition={{ duration: 0.65, delay: index * 0.12 + 0.2, ease: [0.22, 1, 0.36, 1] }}
        className="absolute left-0 top-0 h-px w-full origin-left bg-gold/40"
      />
      <div className="mb-7 h-[55vw] w-full overflow-hidden">
        {index === 0 && (
          <ApproachAscii src="/approach-precision.txt"   progress={progress} revealOrder="top" />
        )}
        {index === 1 && (
          <ApproachAscii src="/approach-fluidity.txt"    progress={progress} revealOrder="top" />
        )}
        {index === 2 && (
          <ApproachAscii src="/approach-partnership.txt" progress={progress} revealOrder="top" />
        )}
      </div>
      <p className="mb-5 font-mono text-[10px] md:text-xs text-gold/50">{pillar.number}</p>
      <h3 className="mb-3 font-display text-2xl font-medium tracking-tight text-cream">{pillar.title}</h3>
      <p className="text-sm leading-relaxed text-cream md:text-base">{pillar.description}</p>
    </motion.div>
  );
}

/* ─── Desktop: sticky scroll ────────────────────────────────── */
function DesktopApproach() {
  const containerRef  = useRef<HTMLDivElement>(null);
  const butterflyRef  = useRef<ButterflyMorphHandle>(null);

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"],
  });

  const containerInView = useInView(containerRef, { once: true });

  const [active, setActive] = useState(0);
  const [finished0, setFinished0] = useState(false);
  const [finished1, setFinished1] = useState(false);
  const [finished2, setFinished2] = useState(false);
  const [isJumping, setIsJumping] = useState(false);
  const jumpTimerRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  // P1 = T1E: label flips to Technical Fluidity when butterfly arrives at frame 1
  // P2 = T2S: label flips to Direct Partnership when butterfly starts leaving frame 1
  const P1 = 0.37;
  const P2 = 0.51;

  // Land just past T1E / T2E so sweep is already complete on arrival
  const PILLAR_TARGETS = [0.05, 0.38, 0.75];

  useEffect(() => {
    const v = scrollYProgress.get();
    setActive(v < P1 ? 0 : v < P2 ? 1 : 2);
    if (v >= PILLAR_TARGETS[0]) setFinished0(true);
    if (v >= PILLAR_TARGETS[1]) setFinished1(true);
    if (v >= PILLAR_TARGETS[2]) setFinished2(true);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useMotionValueEvent(scrollYProgress, "change", (v) => {
    const next = v < P1 ? 0 : v < P2 ? 1 : 2;
    if (next !== active) setActive(next);
    if (v >= PILLAR_TARGETS[0]) setFinished0(true);
    if (v >= PILLAR_TARGETS[1]) setFinished1(true);
    if (v >= PILLAR_TARGETS[2]) setFinished2(true);
  });

  const descVisible = [finished0, finished1, finished2];

  function scrollToPillar(index: number) {
    const container = containerRef.current;
    if (!container) return;
    const containerTop = container.getBoundingClientRect().top + window.scrollY;
    const targetScrollY =
      containerTop + PILLAR_TARGETS[index] * (container.offsetHeight - window.innerHeight);
    const lenis = lenisStore.get();
    setIsJumping(true);
    clearTimeout(jumpTimerRef.current);
    jumpTimerRef.current = setTimeout(() => setIsJumping(false), 350);
    butterflyRef.current?.jumpTo(index);
    if (lenis) {
      lenis.scrollTo(targetScrollY, { duration: 0.9, easing: (t: number) => 1 - Math.pow(1 - t, 3) });
    } else {
      window.scrollTo({ top: targetScrollY, behavior: "smooth" });
    }
  }


  return (
    <div ref={containerRef} style={{ height: "320vh" }} className="relative">
      <div className="sticky top-0 flex h-screen items-stretch overflow-hidden">
        <GradientBg />

        {/* ── Left panel ── */}
        <div className="relative z-10 flex w-1/2 flex-col justify-center">
          {/* padded header block */}
          <div className="px-16 lg:px-24">
            <motion.p
              initial={{ opacity: 0, x: -12 }}
              animate={containerInView ? { opacity: 1, x: 0 } : {}}
              transition={{ duration: 0.5 }}
              className="mb-6 font-mono text-sm uppercase tracking-[0.25em] text-gold/80"
            >
              <PeriodicGlitch text="/The Approach/" inView={containerInView} />
            </motion.p>

            <div className="overflow-hidden">
              <motion.h2
                initial={{ y: "100%" }}
                animate={containerInView ? { y: 0 } : {}}
                transition={{ duration: 0.9, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
                className="font-display text-[4.8vw] font-medium uppercase leading-[0.92] tracking-tight text-cream"
              >
                Intelligence,{" "}
                <span className="text-periwinkle">meet instinct.</span>
              </motion.h2>
            </div>

            <motion.p
              initial={{ opacity: 0, y: 12 }}
              animate={containerInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="mt-5 max-w-[300px] text-sm leading-relaxed text-cream"
            >
              Every engagement at Studio&mdash;E is governed by three commitments.
            </motion.p>
          </div>

          {/* Pillar list — borders run edge-to-edge so they touch the vertical separators */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={containerInView ? { opacity: 1 } : {}}
            transition={{ duration: 0.5, delay: 0.5 }}
            className="mt-10"
          >
            {pillars.map((p, i) => (
              <motion.button
                key={i}
                onClick={() => scrollToPillar(i)}
                data-cursor="pointer"
                className={`group w-full px-16 py-4 text-left lg:px-24 ${active === i ? "border-t border-violet/40" : ""}`}
                animate={{ opacity: active === i ? 1 : 0.32 }}
                transition={{ duration: 0.4 }}
              >
                <div className="flex items-center gap-4">
                  <motion.div
                    className="h-px shrink-0 bg-periwinkle"
                    animate={{ width: active === i ? 28 : 14 }}
                    transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                  />
                  <span className="font-mono text-xs uppercase tracking-widest text-periwinkle/60 lg:text-[0.8vw]">
                    {p.number}
                  </span>
                  <span className="font-display text-2xl font-medium tracking-tight text-gold lg:text-[1.6vw]">
                    {p.title}
                  </span>
                </div>
                <AnimatePresence initial={false}>
                  {active === i && descVisible[i] && !isJumping && (
                    <motion.div
                      key="desc"
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
                      className="overflow-hidden"
                    >
                      <p className="ml-[calc(14px+1rem+2.5rem)] mt-2 max-w-[380px] text-sm leading-relaxed text-cream">
                        {p.description}
                      </p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.button>
            ))}
          </motion.div>
        </div>

        {/* ── Right panel: ASCII art + right label strip ── */}
        <div className="relative z-10 flex w-1/2 border-l border-violet/40">

          {/* ASCII area — butterfly morph across all three frames */}
          <div className="relative flex flex-1 items-center justify-center px-14 lg:px-20">
            <div className="h-[58vh] w-full">
              <ButterflyMorph ref={butterflyRef} scrollYProgress={scrollYProgress} />
            </div>
          </div>

          {/* Right label strip */}
          <div className="relative flex w-60 shrink-0 flex-col items-center border-l border-violet/40 pt-[18vh]">
            {/* Number — aligned with /The Approach/ overline */}
            <motion.span
              key={`num-${active}`}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3 }}
              className="font-mono text-base uppercase tracking-widest text-periwinkle"
            >
              {pillars[active].number}
            </motion.span>

            {/* Name — pinned to bottom, centered, wraps word-per-line */}
            <div className="absolute bottom-10 w-full px-6">
              <AnimatePresence mode="wait">
                <motion.div
                  key={`label-${active}`}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.35 }}
                  className="mx-auto w-fit font-mono text-sm uppercase leading-snug tracking-[0.25em] text-periwinkle"
                >
                  {pillars[active].title.split(" ").map((word, i) => (
                    <span key={i} className="block text-right">{word}</span>
                  ))}
                </motion.div>
              </AnimatePresence>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}

/* ─── Fluid gas/nebula background ───────────────────────────── */
const blobs = [
  {
    color: "radial-gradient(ellipse at center, #4a3db0 0%, #2a1a7a 55%, transparent 78%)",
    opacity: 0.35,
    size: "56vw",
    x: ["-10%", "25%", "5%", "35%", "-5%", "-10%"],
    y: ["-8%",  "20%", "55%", "10%", "40%", "-8%"],
    scale: [1, 1.12, 0.9, 1.08, 0.95, 1],
    duration: 38,
    delay: 0,
  },
  {
    color: "radial-gradient(ellipse at center, #5c4ec8 0%, #351f90 50%, transparent 74%)",
    opacity: 0.23,
    size: "42vw",
    x: ["95%", "65%", "85%", "45%", "78%", "95%"],
    y: ["10%", "50%", "20%", "75%", "35%", "10%"],
    scale: [0.9, 1.1, 0.85, 1.15, 1, 0.9],
    duration: 44,
    delay: -8,
  },
  {
    color: "radial-gradient(ellipse at center, #3d2f9e 0%, #1e1460 58%, transparent 80%)",
    opacity: 0.30,
    size: "49vw",
    x: ["20%", "70%", "40%", "88%", "15%", "20%"],
    y: ["90%", "65%", "95%", "50%", "75%", "90%"],
    scale: [1.05, 0.88, 1.1, 0.92, 1.03, 1.05],
    duration: 52,
    delay: -18,
  },
  {
    color: "radial-gradient(ellipse at center, #6a5ac4 0%, #3d2f9e 45%, transparent 70%)",
    opacity: 0.19,
    size: "36vw",
    x: ["80%", "50%", "95%", "30%", "70%", "80%"],
    y: ["-5%", "30%", "15%", "60%", "5%", "-5%"],
    scale: [1, 0.92, 1.08, 0.88, 1.05, 1],
    duration: 30,
    delay: -12,
  },
  {
    color: "radial-gradient(ellipse at center, #2e1e80 0%, #120d40 60%, transparent 82%)",
    opacity: 0.33,
    size: "45vw",
    x: ["-5%", "15%", "50%", "10%", "35%", "-5%"],
    y: ["80%", "45%", "70%", "20%", "90%", "80%"],
    scale: [0.95, 1.1, 0.9, 1.05, 0.88, 0.95],
    duration: 46,
    delay: -24,
  },
];

function GradientBg() {
  return (
    <div className="pointer-events-none absolute inset-0 z-0 overflow-hidden" aria-hidden>
      {/* Animated blobs */}
      <div className="absolute inset-0" style={{ filter: "blur(90px)" }}>
        {blobs.map((b, i) => (
          <motion.div
            key={i}
            className="absolute"
            style={{
              background: b.color,
              width: b.size,
              height: b.size,
              borderRadius: "50%",
              translateX: "-50%",
              translateY: "-50%",
              opacity: b.opacity,
            }}
            animate={{
              left: b.x,
              top: b.y,
              scale: b.scale,
            }}
            transition={{
              duration: b.duration,
              ease: "easeInOut",
              repeat: Infinity,
              repeatDelay: 0,
              delay: b.delay,
              times: [0, 0.2, 0.4, 0.6, 0.8, 1],
            }}
          />
        ))}
      </div>

      {/* Mobile-only: two extra static blobs to fill the dark center */}
      <div
        className="md:hidden absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse at 40% 30%, rgba(74,61,176,0.28) 0%, rgba(42,26,122,0.18) 50%, transparent 72%)," +
            "radial-gradient(ellipse at 68% 72%, rgba(58,47,158,0.22) 0%, rgba(30,18,96,0.14) 48%, transparent 70%)",
          filter: "blur(70px)",
        }}
      />
    </div>
  );
}

/* ─── Section export ─────────────────────────────────────────── */
export default function Approach() {
  const mobileRef = useRef<HTMLDivElement>(null);
  const mobileInView = useInView(mobileRef, { once: true, margin: "-80px" });

  return (
    <section id="approach" className="relative bg-ink grain-overlay">

      {/* Mobile: stacked */}
      <div ref={mobileRef} className="relative md:hidden px-8 py-32">
        <GradientBg />
        <div className="relative z-10">
          <p className="mb-3 font-mono text-sm uppercase tracking-[0.25em] text-gold/60">
            <PeriodicGlitch text="/The Approach/" inView={mobileInView} />
          </p>
          <div className="overflow-hidden mb-6">
            <h2 className="font-display text-5xl font-medium tracking-tight text-cream">
              Intelligence,{" "}
              <span className="italic text-">meet instinct.</span>
            </h2>
          </div>
          <p className="mb-20 text-sm leading-relaxed text-cream md:text-base">
            Every engagement at Studio&mdash;E is governed by three commitments.
          </p>
          <div className="grid grid-cols-1 gap-0">
            {pillars.map((p, i) => (
              <MobilePillarCard key={p.number} pillar={p} index={i} />
            ))}
          </div>
        </div>
      </div>

      {/* Desktop: sticky scroll */}
      <div className="hidden md:block">
        <DesktopApproach />
      </div>

    </section>
  );
}
