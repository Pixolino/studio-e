"use client";

import { useRef, useState, useEffect } from "react";
import {
  motion,
  useInView,
  useScroll,
  useTransform,
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
function useTimedProgress(active: boolean): MotionValue<number> {
  const p = useMotionValue(0);
  useEffect(() => {
    if (active) animate(p, 1, { duration: 1.8, ease: [0.22, 1, 0.36, 1] });
  }, [active, p]);
  return p;
}

/* ─── ASCII canvas types ─────────────────────────────────────── */
interface Pt { x: number; y: number; ch: string; dist: number }

/* ─── ApproachAscii: loads a .txt file and renders on canvas ─── */
interface ApproachAsciiProps {
  src: string;
  progress: MotionValue<number>;
  /** "center" = center-outward | "outside" = outside-in | "top" = top-to-bottom */
  revealOrder?: "center" | "outside" | "top";
  /** progress threshold at which idle animation begins */
  doneAt?: number;
}

// Chars that render in gold; everything else renders in periwinkle
const ACCENT = new Set(["◆", "◇", "◈", "◉", "◯", "○", "●", "×", "✦", "✧", "+", "*"]);

function ApproachAscii({
  src,
  progress,
  revealOrder = "center",
  doneAt = 0.87,
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

      const ROWS = artLines.length;
      const COLS = artLines[0].length;
      const RW = 0.62, RH = 1.35;
      const fs = Math.min(cw / (COLS * RW), ch / (ROWS * RH), 16);
      const CW = fs * RW, CH = fs * RH;
      const ox = cw / 2 - (COLS * CW) / 2;
      const oy = ch / 2 - (ROWS * CH) / 2;
      fontSize = fs;

      const raw: Pt[] = [];
      for (let r = 0; r < ROWS; r++) {
        for (let c = 0; c < artLines[r].length; c++) {
          const char = artLines[r][c];
          if (char === " ") continue;
          const x = ox + c * CW + CW / 2;
          const y = oy + r * CH + CH / 2;
          raw.push({ x, y, ch: char, dist: Math.hypot(x - cw / 2, y - ch / 2) });
        }
      }

      if (revealOrder === "center")  pts = raw.sort((a, b) => a.dist - b.dist);
      else if (revealOrder === "outside") pts = raw.sort((a, b) => b.dist - a.dist);
      else pts = raw.sort((a, b) => a.y - b.y || a.x - b.x);
    }

    reparse();
    const ro = new ResizeObserver(reparse);
    ro.observe(canvas);

    let t = 0;

    function draw() {
      rafRef.current = requestAnimationFrame(draw);
      if (!pts.length) return;

      const prog  = progress.get();
      const nVis  = Math.min(pts.length, Math.ceil(prog * pts.length + 0.5));
      const done  = prog >= doneAt;

      cx.clearRect(0, 0, cw, ch);
      cx.font         = `${fontSize}px "Geist Mono", monospace`;
      cx.textBaseline = "middle";
      cx.textAlign    = "center";

      for (let i = 0; i < nVis; i++) {
        const p = pts[i];
        const isAccent = ACCENT.has(p.ch);

        let rr: number, gg: number, bb: number, alpha: number, blur: number;

        if (isAccent) {
          rr = 178; gg = 180; bb = 31;
          alpha = done ? 0.5 + 0.45 * Math.sin(t * 2.2 + p.dist * 0.01) : 0.85;
          blur  = done ? 6 + 5 * Math.abs(Math.sin(t * 2.2)) : 6;
        } else {
          rr = 208; gg = 209; bb = 255;
          alpha = done ? 0.18 + 0.2 * Math.sin(t * 1.1 + p.dist * 0.02) : 0.45;
          blur  = done ? 3 : 2;
        }

        cx.shadowColor = `rgba(${rr},${gg},${bb},${alpha * 0.4})`;
        cx.shadowBlur  = blur;
        cx.fillStyle   = `rgba(${rr},${gg},${bb},${alpha})`;
        cx.fillText(p.ch, p.x, p.y);
      }

      cx.shadowBlur = 0;
      t += 0.016;
    }

    rafRef.current = requestAnimationFrame(draw);
    return () => { cancelAnimationFrame(rafRef.current); ro.disconnect(); };
  }, [artLines, progress, revealOrder, doneAt]);

  return <canvas ref={canvasRef} aria-hidden className="h-full w-full" />;
}

/* ─── Mobile: stacked pillar cards ──────────────────────────── */
function MobilePillarCard({ pillar, index }: { pillar: (typeof pillars)[0]; index: number }) {
  const ref      = useRef<HTMLDivElement>(null);
  const inView   = useInView(ref, { once: true, margin: "-60px" });
  const progress = useTimedProgress(inView);

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
      <div className="mb-7 h-[180px] w-full overflow-hidden">
        {index === 0 && (
          <ApproachAscii src="/approach-precision.txt"   progress={progress} revealOrder="center"  />
        )}
        {index === 1 && (
          <ApproachAscii src="/approach-fluidity.txt"    progress={progress} revealOrder="top"     doneAt={0.75} />
        )}
        {index === 2 && (
          <ApproachAscii src="/approach-partnership.txt" progress={progress} revealOrder="outside" />
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
  const containerRef = useRef<HTMLDivElement>(null);

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"],
  });

  const containerInView = useInView(containerRef, { once: true });

  const [active, setActive] = useState(0);
  const [dir,    setDir   ] = useState<1 | -1>(1);

  const [finished0, setFinished0] = useState(false);
  const [finished1, setFinished1] = useState(false);
  const [finished2, setFinished2] = useState(false);

  const P1 = 0.26;
  const P2 = 0.72;

  useEffect(() => {
    const v = scrollYProgress.get();
    setActive(v < P1 ? 0 : v < P2 ? 1 : 2);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useMotionValueEvent(scrollYProgress, "change", (v) => {
    const next = v < P1 ? 0 : v < P2 ? 1 : 2;
    if (next !== active) {
      setDir(next > active ? 1 : -1);
      setActive(next);
    }
  });

  const p0 = useTransform(scrollYProgress, [0,  0.20], [0, 1]);
  const p1 = useTransform(scrollYProgress, [P1, P1 + 0.18], [0, 1]);
  const p2 = useTransform(scrollYProgress, [P2, 0.93], [0, 1]);

  useMotionValueEvent(p0, "change", (v) => setFinished0(v >= 0.12));
  useMotionValueEvent(p1, "change", (v) => setFinished1(v >= 0.12));
  useMotionValueEvent(p2, "change", (v) => setFinished2(v >= 0.12));

  const descVisible = [finished0, finished1, finished2];

  const PILLAR_TARGETS = [0.22, 0.49, 0.90];

  function scrollToPillar(index: number) {
    const container = containerRef.current;
    if (!container) return;
    const containerTop = container.getBoundingClientRect().top + window.scrollY;
    const targetScrollY =
      containerTop + PILLAR_TARGETS[index] * (container.offsetHeight - window.innerHeight);
    const lenis = lenisStore.get();
    if (lenis) {
      lenis.scrollTo(targetScrollY, { duration: 1.4, easing: (t: number) => 1 - Math.pow(1 - t, 3) });
    } else {
      window.scrollTo({ top: targetScrollY, behavior: "smooth" });
    }
  }

  const variants = {
    enter:  (d: number) => ({ y: d > 0 ? 48 : -48, opacity: 0 }),
    center: { y: 0, opacity: 1 },
    exit:   (d: number) => ({ y: d > 0 ? -48 : 48, opacity: 0 }),
  };

  const progByPillar = [p0, p1, p2];
  const revealOrders: ApproachAsciiProps["revealOrder"][] = ["center", "top", "outside"];
  const srcByPillar = [
    "/approach-precision.txt",
    "/approach-fluidity.txt",
    "/approach-partnership.txt",
  ];

  return (
    <div ref={containerRef} style={{ height: "500vh" }} className="relative">
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
                  {active === i && descVisible[i] && (
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

          {/* ASCII area */}
          <div className="relative flex flex-1 items-center justify-center px-14 lg:px-20">
            <AnimatePresence mode="wait" custom={dir}>
              <motion.div
                key={active}
                custom={dir}
                variants={variants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ duration: 0.38, ease: [0.22, 1, 0.36, 1] }}
                className="h-[58vh] w-full"
              >
                <ApproachAscii
                  src={srcByPillar[active]}
                  progress={progByPillar[active]}
                  revealOrder={revealOrders[active]}
                />
              </motion.div>
            </AnimatePresence>
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
    <div
      className="pointer-events-none absolute inset-0 z-0 overflow-hidden"
      aria-hidden
      style={{ filter: "blur(90px)" }}
    >
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
