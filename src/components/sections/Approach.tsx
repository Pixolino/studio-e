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

/* ─── 01 Artful Precision — compass geometry ────────────────── */
function PrecisionVisual({ progress }: { progress: MotionValue<number> }) {
  const outerCircle = useTransform(progress, [0,    0.40], [0, 1]);
  const hAxis       = useTransform(progress, [0.18, 0.48], [0, 1]);
  const vAxis       = useTransform(progress, [0.22, 0.52], [0, 1]);
  const innerCircle = useTransform(progress, [0.38, 0.62], [0, 1]);
  const tickT       = useTransform(progress, [0.54, 0.65], [0, 1]);
  const tickR       = useTransform(progress, [0.56, 0.67], [0, 1]);
  const tickB       = useTransform(progress, [0.58, 0.69], [0, 1]);
  const tickL       = useTransform(progress, [0.60, 0.71], [0, 1]);
  const diamond     = useTransform(progress, [0.64, 0.76], [0, 1]);
  const arc         = useTransform(progress, [0.70, 0.86], [0, 1]);

  const [finished, setFinished] = useState(() => progress.get() >= 0.87);
  useMotionValueEvent(progress, "change", (v) => setFinished(v >= 0.87));

  return (
    <svg viewBox="0 0 140 90" className="h-full w-full" fill="none">
      {/* Crosshair axes — static */}
      <motion.line x1="26"  y1="45" x2="114" y2="45" stroke="rgba(178,180,31,0.2)" strokeWidth="0.5" style={{ pathLength: hAxis }} />
      <motion.line x1="70"  y1="7"  x2="70"  y2="83" stroke="rgba(178,180,31,0.2)" strokeWidth="0.5" style={{ pathLength: vAxis }} />

      {/* Outer circle + cardinal ticks — rotate clockwise when finished */}
      <motion.g
        style={{ transformBox: "fill-box", transformOrigin: "center" }}
        animate={finished ? { rotate: 360 } : {}}
        transition={finished ? { duration: 20, ease: "linear", repeat: Infinity } : {}}
      >
        <motion.circle cx="70" cy="45" r="30" stroke="rgba(178,180,31,0.45)" strokeWidth="0.65" style={{ pathLength: outerCircle }} />
        <motion.line x1="66.5" y1="15"   x2="73.5" y2="15"   stroke="rgba(178,180,31,0.55)" strokeWidth="0.85" style={{ pathLength: tickT }} />
        <motion.line x1="100"  y1="41.5" x2="100"  y2="48.5" stroke="rgba(178,180,31,0.55)" strokeWidth="0.85" style={{ pathLength: tickR }} />
        <motion.line x1="66.5" y1="75"   x2="73.5" y2="75"   stroke="rgba(178,180,31,0.55)" strokeWidth="0.85" style={{ pathLength: tickB }} />
        <motion.line x1="40"   y1="41.5" x2="40"   y2="48.5" stroke="rgba(178,180,31,0.55)" strokeWidth="0.85" style={{ pathLength: tickL }} />
      </motion.g>

      {/* Inner circle + arc — rotate counterclockwise when finished */}
      <motion.g
        style={{ transformBox: "fill-box", transformOrigin: "center" }}
        animate={finished ? { rotate: -360 } : {}}
        transition={finished ? { duration: 28, ease: "linear", repeat: Infinity } : {}}
      >
        {/* Invisible r=18 circle anchors the bounding box symmetrically around (70,45)
            so transform-origin:"center" lands exactly on the visual center */}
        <circle cx="70" cy="45" r="18" fill="none" stroke="none" />
        <motion.circle cx="70" cy="45" r="15" stroke="rgba(178,180,31,0.18)" strokeWidth="0.5" style={{ pathLength: innerCircle }} />
        <motion.path d="M88 45 A18 18 0 0 0 70 27" stroke="rgba(178,180,31,0.22)" strokeWidth="0.5" style={{ pathLength: arc }} />
      </motion.g>

      {/* Diamond center — pulsate when finished */}
      <motion.path
        d="M70 41 L74 45 L70 49 L66 45 Z"
        fill="rgba(178,180,31,0.72)"
        style={{ opacity: finished ? undefined : diamond }}
        animate={finished ? { opacity: [0.15, 0.9, 0.15] } : {}}
        transition={finished ? { duration: 2.2, ease: "easeInOut", repeat: Infinity } : {}}
      />
    </svg>
  );
}

/* ─── 02 Technical Fluidity — flowing sine waves ────────────── */
function FluidityVisual({ active }: { active: boolean }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rafRef    = useRef(0);
  const liveRef   = useRef(false);

  useEffect(() => {
    if (!active) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const w   = canvas.offsetWidth  || 240;
    const h   = canvas.offsetHeight || 100;
    canvas.width  = w * dpr;
    canvas.height = h * dpr;
    ctx.scale(dpr, dpr);

    liveRef.current = true;
    let t = 0;
    const waves = [
      { amp: 9,  freq: 0.032, speed: 0.50, alpha: 0.48, lw: 1.5 },
      { amp: 5,  freq: 0.060, speed: 0.85, alpha: 0.28, lw: 1.0 },
      { amp: 14, freq: 0.018, speed: 0.28, alpha: 0.15, lw: 1.0 },
    ];

    function frame() {
      if (!liveRef.current) return;
      ctx.clearRect(0, 0, w, h);
      const cy = h / 2;
      for (const wave of waves) {
        ctx.beginPath();
        ctx.strokeStyle = `rgba(178,180,31,${wave.alpha})`;
        ctx.lineWidth   = wave.lw;
        for (let x = 0; x <= w; x++) {
          const y = cy + Math.sin(x * wave.freq + t * wave.speed) * wave.amp;
          x === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
        }
        ctx.stroke();
      }
      t += 0.04;
      rafRef.current = requestAnimationFrame(frame);
    }

    rafRef.current = requestAnimationFrame(frame);
    return () => { liveRef.current = false; cancelAnimationFrame(rafRef.current); };
  }, [active]);

  return (
    <motion.canvas
      ref={canvasRef} aria-hidden className="h-full w-full"
      initial={{ opacity: 0 }}
      animate={active ? { opacity: 1 } : { opacity: 0 }}
      transition={{ duration: 0.9, delay: 0.2 }}
    />
  );
}

/* ─── 03 Direct Partnership — two nodes reaching inward ─────── */
function PartnershipVisual({ progress }: { progress: MotionValue<number> }) {
  const orbitL  = useTransform(progress, [0,    0.28], [0, 1]);
  const orbitR  = useTransform(progress, [0.04, 0.32], [0, 1]);
  const nodeL   = useTransform(progress, [0.12, 0.38], [0, 1]);
  const nodeR   = useTransform(progress, [0.16, 0.42], [0, 1]);
  const dotL    = useTransform(progress, [0.32, 0.46], [0, 1]);
  const dotR    = useTransform(progress, [0.36, 0.50], [0, 1]);
  const lineL   = useTransform(progress, [0.46, 0.65], [0, 1]);
  const lineR   = useTransform(progress, [0.46, 0.65], [0, 1]);
  const centerO = useTransform(progress, [0.63, 0.74], [0, 1]);

  const [finished, setFinished] = useState(() => progress.get() >= 0.75);
  useMotionValueEvent(progress, "change", (v) => setFinished(v >= 0.75));

  // 3s repeating cycle: orbit pulse → dots travel inward → center bursts
  const CYCLE   = 3.0;
  const ORB_DUR = 1.5;
  const DOT_DLY = 0.3;
  const DOT_DUR = 1.2;
  const CTR_DLY = DOT_DLY + DOT_DUR; // 1.5
  const CTR_DUR = 0.7;

  return (
    <svg viewBox="0 0 140 90" className="h-full w-full" fill="none">
      {/* Orbit rings */}
      <motion.circle cx="35"  cy="45" r="15" stroke="rgba(178,180,31,0.1)" strokeWidth="0.5" style={{ pathLength: orbitL }} />
      <motion.circle cx="105" cy="45" r="15" stroke="rgba(178,180,31,0.1)" strokeWidth="0.5" style={{ pathLength: orbitR }} />

      {/* Orbit ring pulse overlays — brighten both sides simultaneously */}
      {finished && (
        <>
          <motion.circle cx="35"  cy="45" r="15" stroke="rgba(178,180,31,0.7)" strokeWidth="0.65" fill="none"
            animate={{ opacity: [0, 0.55, 0] }}
            transition={{ duration: ORB_DUR, ease: "easeInOut", repeat: Infinity, repeatDelay: CYCLE - ORB_DUR }}
          />
          <motion.circle cx="105" cy="45" r="15" stroke="rgba(178,180,31,0.7)" strokeWidth="0.65" fill="none"
            animate={{ opacity: [0, 0.55, 0] }}
            transition={{ duration: ORB_DUR, ease: "easeInOut", repeat: Infinity, repeatDelay: CYCLE - ORB_DUR }}
          />
        </>
      )}

      {/* Node circles + dots */}
      <motion.circle cx="35"  cy="45" r="6.5" stroke="rgba(178,180,31,0.6)" strokeWidth="0.7" fill="rgba(178,180,31,0.07)" style={{ pathLength: nodeL }} />
      <motion.circle cx="105" cy="45" r="6.5" stroke="rgba(178,180,31,0.6)" strokeWidth="0.7" fill="rgba(178,180,31,0.07)" style={{ pathLength: nodeR }} />
      <motion.circle cx="35"  cy="45" r="2"   fill="rgba(178,180,31,0.75)" style={{ opacity: dotL }} />
      <motion.circle cx="105" cy="45" r="2"   fill="rgba(178,180,31,0.75)" style={{ opacity: dotR }} />

      {/* Connecting lines */}
      <motion.line x1="41.5" y1="45" x2="70"  y2="45" stroke="rgba(178,180,31,0.4)" strokeWidth="0.7" style={{ pathLength: lineL }} />
      <motion.line x1="98.5" y1="45" x2="70"  y2="45" stroke="rgba(178,180,31,0.4)" strokeWidth="0.7" style={{ pathLength: lineR }} />

      {/* Traveling pulse dots — move from outer nodes to center */}
      {finished && (
        <>
          <motion.circle cx="41.5" cy="45" r="1.5" fill="rgba(178,180,31,0.85)"
            animate={{ x: [0, 28.5], opacity: [0, 0.85, 0] }}
            transition={{ duration: DOT_DUR, ease: "easeIn", delay: DOT_DLY, repeat: Infinity, repeatDelay: CYCLE - DOT_DLY - DOT_DUR }}
          />
          <motion.circle cx="98.5" cy="45" r="1.5" fill="rgba(178,180,31,0.85)"
            animate={{ x: [0, -28.5], opacity: [0, 0.85, 0] }}
            transition={{ duration: DOT_DUR, ease: "easeIn", delay: DOT_DLY, repeat: Infinity, repeatDelay: CYCLE - DOT_DLY - DOT_DUR }}
          />
        </>
      )}

      {/* Center point */}
      <motion.circle cx="70" cy="45" r="3" fill="rgba(178,180,31,0.65)" style={{ opacity: centerO }} />

      {/* Center burst when pulses arrive */}
      {finished && (
        <motion.circle cx="70" cy="45" r="5" fill="rgba(178,180,31,0.9)"
          style={{ transformOrigin: "70px 45px" }}
          animate={{ opacity: [0, 1, 0], scale: [0.4, 1.3, 0.4] }}
          transition={{ duration: CTR_DUR, ease: "easeOut", delay: CTR_DLY, repeat: Infinity, repeatDelay: CYCLE - CTR_DLY - CTR_DUR }}
        />
      )}
    </svg>
  );
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
      <div className="mb-7 h-[100px] w-full overflow-hidden">
        {index === 0 && <PrecisionVisual progress={progress} />}
        {index === 1 && <FluidityVisual  active={inView} />}
        {index === 2 && <PartnershipVisual progress={progress} />}
      </div>
      <p className="mb-5 font-mono text-xs text-gold/50">{pillar.number}</p>
      <h3 className="mb-3 font-display text-2xl font-medium tracking-tight text-cream">{pillar.title}</h3>
      <p className="text-sm leading-relaxed text-muted md:text-base">{pillar.description}</p>
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

  // "finished" per pillar — description only reveals once animation is fully drawn
  const [finished0, setFinished0] = useState(false);
  const [finished1, setFinished1] = useState(false);
  const [finished2, setFinished2] = useState(false);

  // Pillar scroll windows: 0=[0,0.26], 1=[0.26,0.72], 2=[0.72,1]
  // Pillar 1 (Technical Fluidity) gets a wider window (~230vh) for more dwell
  const P1 = 0.26;
  const P2 = 0.72;

  // Sync on mount in case page loads mid-scroll
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

  // Drawing completes well before end of each pillar's window, leaving generous dwell
  const p0 = useTransform(scrollYProgress, [0,  0.20], [0, 1]);
  const p2 = useTransform(scrollYProgress, [P2, 0.93], [0, 1]);

  // Description reveals shortly after drawing begins (not when finished)
  useMotionValueEvent(p0, "change", (v) => setFinished0(v >= 0.12));
  useMotionValueEvent(p2, "change", (v) => setFinished2(v >= 0.12));

  // Technical Fluidity has no drawing — short delay after it becomes active
  useEffect(() => {
    if (active !== 1) { setFinished1(false); return; }
    const t = setTimeout(() => setFinished1(true), 300);
    return () => clearTimeout(t);
  }, [active]);

  const descVisible = [finished0, finished1, finished2];

  // Click targets: land well into each pillar's dwell zone after drawing is done
  // p0 finishes at scrollYProgress ≈ 0.174 (0.20 × 0.87); pillar 0 runs [0, 0.26]
  // p2 finishes at scrollYProgress ≈ 0.887 (0.72 + 0.75 × 0.21); pillar 2 runs [0.72, 1]
  const PILLAR_TARGETS = [0.22, 0.49, 0.90];

  function scrollToPillar(index: number) {
    const container = containerRef.current;
    if (!container) return;
    // getBoundingClientRect().top is viewport-relative; add scrollY for absolute page position
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

  return (
    <div ref={containerRef} style={{ height: "500vh" }} className="relative">
      <div className="sticky top-0 flex h-screen items-stretch overflow-hidden">

        {/* ── Left panel: section header + pillar indicator ── */}
        <div className="flex w-1/2 flex-col justify-center px-20 lg:px-28">
          <motion.p
            initial={{ opacity: 0, x: -12 }}
            animate={containerInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.5 }}
            className="mb-4 font-mono text-sm uppercase tracking-[0.25em] text-periwinkle/60"
          >
            /The Approach/
          </motion.p>
          <div className="overflow-hidden">
            <motion.h2
              initial={{ y: "100%" }}
              animate={containerInView ? { y: 0 } : {}}
              transition={{ duration: 0.9, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
              className="font-display text-5xl font-medium tracking-tight text-cream md:text-5xl lg:text-6xl"
            >
              Intelligence,{" "}
              <span className="italic text-gold">meet instinct.</span>
            </motion.h2>
          </div>
          <motion.p
            initial={{ opacity: 0, y: 12 }}
            animate={containerInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="mt-6 max-w-[280px] text-sm leading-relaxed text-muted md:text-base"
          >
            Every engagement at Studio&mdash;E is governed by three commitments.
          </motion.p>

          {/* Pillar indicator */}
          <div className="mt-14 flex flex-col gap-7">
            {pillars.map((p, i) => (
              <motion.button
                key={i}
                onClick={() => scrollToPillar(i)}
                data-cursor="pointer"
                className="group flex items-start gap-5 text-left"
                animate={{ opacity: active === i ? 1 : 0.3 }}
                transition={{ duration: 0.4 }}
              >
                <motion.div
                  className="mt-[11px] h-px shrink-0 bg-gold"
                  animate={{ width: active === i ? 36 : 12 }}
                  transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                />
                <div className="min-w-0">
                  <p className="mb-1 font-mono text-[10px] md:text-xs uppercase tracking-widest text-gold/60">
                    {p.number}
                  </p>
                  <p className="font-display text-3xl font-medium tracking-tight text-cream transition-colors duration-300 group-hover:text-gold lg:text-4xl">
                    {p.title}
                  </p>
                  <AnimatePresence initial={false}>
                    {active === i && descVisible[i] && (
                      <motion.div
                        key="desc"
                        initial={{ height: 0 }}
                        animate={{ height: "auto" }}
                        exit={{ height: 0 }}
                        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                        className="overflow-hidden"
                      >
                        <p className="mt-3 max-w-[520px] text-sm leading-relaxed text-muted md:text-base">
                          {p.description}
                        </p>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </motion.button>
            ))}
          </div>
        </div>

        {/* ── Right panel: animation only, full height ── */}
        <div className="flex w-1/2 items-center justify-center border-l border-gold/10 px-16 lg:px-24">
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
              {active === 0 && <PrecisionVisual   progress={p0} />}
              {active === 1 && <FluidityVisual    active={true} />}
              {active === 2 && <PartnershipVisual progress={p2} />}
            </motion.div>
          </AnimatePresence>
        </div>

      </div>
    </div>
  );
}

/* ─── Section export ─────────────────────────────────────────── */
export default function Approach() {
  return (
    <section id="approach" className="relative bg-ink grain-overlay">

      {/* Mobile: stacked */}
      <div className="md:hidden px-8 py-32">
        <p className="mb-3 font-mono text-sm uppercase tracking-[0.25em] text-gold/60">
          /The Approach/
        </p>
        <div className="overflow-hidden mb-6">
          <h2 className="font-display text-5xl font-medium tracking-tight text-cream lg:text-6xl">
            Intelligence,{" "}
            <span className="italic text-gold">meet instinct.</span>
          </h2>
        </div>
        <p className="mb-20 text-sm leading-relaxed text-muted md:text-base">
          Every engagement at Studio&mdash;E is governed by three commitments.
        </p>
        <div className="grid grid-cols-1 gap-0">
          {pillars.map((p, i) => (
            <MobilePillarCard key={p.number} pillar={p} index={i} />
          ))}
        </div>
      </div>

      {/* Desktop: sticky scroll */}
      <div className="hidden md:block">
        <DesktopApproach />
      </div>

    </section>
  );
}
