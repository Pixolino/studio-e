"use client";

import { useRef, useEffect } from "react";
import { motion, useInView, useScroll, MotionValue } from "framer-motion";
import PeriodicGlitch from "@/components/ui/PeriodicGlitch";
import { siteConfig } from "@/lib/site";

/* ─── Nebula background (same blobs as Approach) ────────────── */
const blobs = [
  {
    color: "radial-gradient(ellipse at center, #4a3db0 0%, #2a1a7a 55%, transparent 78%)",
    opacity: 0.35, size: "56vw",
    x: ["-10%", "25%", "5%", "35%", "-5%", "-10%"],
    y: ["-8%",  "20%", "55%", "10%", "40%", "-8%"],
    scale: [1, 1.12, 0.9, 1.08, 0.95, 1],
    duration: 38, delay: 0,
  },
  {
    color: "radial-gradient(ellipse at center, #5c4ec8 0%, #351f90 50%, transparent 74%)",
    opacity: 0.23, size: "42vw",
    x: ["95%", "65%", "85%", "45%", "78%", "95%"],
    y: ["10%", "50%", "20%", "75%", "35%", "10%"],
    scale: [0.9, 1.1, 0.85, 1.15, 1, 0.9],
    duration: 44, delay: -8,
  },
  {
    color: "radial-gradient(ellipse at center, #3d2f9e 0%, #1e1460 58%, transparent 80%)",
    opacity: 0.30, size: "49vw",
    x: ["20%", "70%", "40%", "88%", "15%", "20%"],
    y: ["90%", "65%", "95%", "50%", "75%", "90%"],
    scale: [1.05, 0.88, 1.1, 0.92, 1.03, 1.05],
    duration: 52, delay: -18,
  },
  {
    color: "radial-gradient(ellipse at center, #6a5ac4 0%, #3d2f9e 45%, transparent 70%)",
    opacity: 0.19, size: "36vw",
    x: ["80%", "50%", "95%", "30%", "70%", "80%"],
    y: ["-5%", "30%", "15%", "60%", "5%", "-5%"],
    scale: [1, 0.92, 1.08, 0.88, 1.05, 1],
    duration: 30, delay: -12,
  },
  {
    color: "radial-gradient(ellipse at center, #2e1e80 0%, #120d40 60%, transparent 82%)",
    opacity: 0.33, size: "45vw",
    x: ["-5%", "15%", "50%", "10%", "35%", "-5%"],
    y: ["80%", "45%", "70%", "20%", "90%", "80%"],
    scale: [0.95, 1.1, 0.9, 1.05, 0.88, 0.95],
    duration: 46, delay: -24,
  },
];

function GradientBg() {
  return (
    <div className="pointer-events-none absolute inset-0 z-0 overflow-hidden" aria-hidden>
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
            animate={{ left: b.x, top: b.y, scale: b.scale }}
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

/* ─── Canvas: ASCII art + photo, line-by-line L→R wipe ──────── */
function FoundersCanvas({
  txtSrc, imgSrc, scrollProgress, start, end,
}: {
  txtSrc: string; imgSrc: string;
  scrollProgress: MotionValue<number>;
  start: number; end: number;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rafRef    = useRef(0);
  const S = useRef({
    pts:       [] as { x: number; y: number; ch: string; a: number; r: number; c: number }[],
    img:       null as HTMLImageElement | null,
    imgReady:  false,
    drawX: 0, drawY: 0, drawW: 0, drawH: 0,
    fontSize: 10, CH: 10, CW: 5.5,
    minR: 0, maxR: 0, minC: 0, spanC: 1,
    ox: 0, oy: 0, cw: 0, ch: 0,
    ready: false,
  });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const cv = canvas, cx = ctx;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const s = S.current;
    let lines: string[] = [];

    function buildLayout() {
      if (!lines.length) return;
      s.cw = cv.offsetWidth; s.ch = cv.offsetHeight;
      cv.width = s.cw * dpr; cv.height = s.ch * dpr;
      cx.setTransform(dpr, 0, 0, dpr, 0, 0);

      let minC = Infinity, maxC = 0, minR = Infinity, maxR = 0;
      for (let r = 0; r < lines.length; r++) {
        for (let c = 0; c < lines[r].length; c++) {
          const ch = lines[r][c];
          if (ch !== " " && ch !== "\r") {
            if (c < minC) minC = c;
            if (c > maxC) maxC = c;
            if (r < minR) minR = r;
            if (r > maxR) maxR = r;
          }
        }
      }
      if (!isFinite(minC)) return;

      const spanC = maxC - minC + 1;
      const spanR = maxR - minR + 1;
      s.fontSize = Math.min(s.cw / (spanC * 0.55), s.ch / spanR, 13) * 0.98;
      if (s.fontSize < 3) s.fontSize = 3;
      s.CW = s.fontSize * 0.55;
      s.CH = s.fontSize;
      s.ox = s.cw / 2 - ((minC + maxC) / 2) * s.CW + s.cw * 0.09 - 1.5 * s.CW;
      s.oy = s.ch - (maxR + 1) * s.CH + s.ch * 0.01 - s.CH;
      s.minR = minR; s.maxR = maxR; s.minC = minC; s.spanC = spanC;

      s.pts = [];
      for (let r = 0; r < lines.length; r++) {
        for (let c = 0; c < lines[r].length; c++) {
          const ch = lines[r][c];
          if (ch === " " || ch === "\r") continue;
          s.pts.push({
            x: s.ox + c * s.CW + s.CW * 0.5,
            y: s.oy + r * s.CH + s.CH * 0.5,
            ch, a: 0.5 + Math.random() * 0.4, r, c,
          });
        }
      }
      updateImageLayout();
      s.ready = true;
    }

    function updateImageLayout() {
      if (!s.img || !s.cw || !s.ch) return;
      const iw = s.img.naturalWidth, ih = s.img.naturalHeight;
      const scale = Math.min(s.cw / iw, s.ch / ih);
      s.drawW = iw * scale; s.drawH = ih * scale;
      s.drawX = s.cw - s.drawW;  // right-aligned
      s.drawY = s.ch - s.drawH;  // bottom-aligned
    }

    let visible = true;
    const io = new IntersectionObserver(([e]) => {
      visible = e.isIntersecting;
      if (visible && rafRef.current === 0) rafRef.current = requestAnimationFrame(draw);
    }, { rootMargin: "200px" });
    io.observe(cv);

    function draw() {
      if (!visible) { rafRef.current = 0; return; }
      rafRef.current = requestAnimationFrame(draw);
      if (!s.ready) return;

      const raw = scrollProgress.get();
      const p   = Math.max(0, Math.min(1, (raw - start) / (end - start)));

      const { cw, ch, pts, fontSize, CH, CW, ox, oy, minR, maxR, minC, spanC } = s;
      const totalRows  = maxR - minR + 1;
      const rowProg    = p * totalRows;
      const fullRows   = Math.floor(rowProg);
      const partFrac   = rowProg - fullRows;

      cx.clearRect(0, 0, cw, ch);

      // ── 1. Photo in the revealed region ─────────────────────
      if (s.img && s.imgReady && p > 0) {
        cx.save();
        cx.beginPath();
        // Fully erased rows → full-width photo strip
        for (let i = 0; i < fullRows && i < totalRows; i++) {
          cx.rect(0, oy + (minR + i) * CH, cw, CH);
        }
        // Partial row → photo up to cursor x
        if (fullRows < totalRows) {
          const curX = ox + (minC + partFrac * spanC) * CW;
          cx.rect(0, oy + (minR + fullRows) * CH, curX, CH);
        }
        cx.clip();
        cx.drawImage(s.img, s.drawX, s.drawY, s.drawW, s.drawH);
        cx.restore();
      }

      // ── 2. ASCII chars not yet erased ────────────────────────
      cx.font = `${fontSize}px "Geist Mono", monospace`;
      cx.textBaseline = "middle";
      cx.textAlign    = "center";
      for (const pt of pts) {
        const ri = pt.r - minR;
        if (ri < fullRows) continue;
        if (ri === fullRows && (pt.c - minC) < partFrac * spanC) continue;
        cx.fillStyle = `rgba(208,209,255,${pt.a})`;
        cx.fillText(pt.ch, pt.x, pt.y);
      }

    }

    fetch(txtSrc).then(r => r.text()).then(text => {
      lines = text.split("\n");
      buildLayout();
      rafRef.current = requestAnimationFrame(draw);
    });

    const imgEl = new window.Image();
    imgEl.src = imgSrc;
    imgEl.onload = () => { s.img = imgEl; s.imgReady = true; updateImageLayout(); };

    const ro = new ResizeObserver(buildLayout);
    ro.observe(cv);

    return () => { cancelAnimationFrame(rafRef.current); ro.disconnect(); io.disconnect(); };
  }, [txtSrc, imgSrc, scrollProgress, start, end]);

  return <canvas ref={canvasRef} aria-hidden className="absolute inset-0 h-full w-full" />;
}

/* ─── Scroll reveal wrapper ──────────────────────────────────── */
function FoundersReveal({ txtSrc, imgSrc, scrollProgress }: {
  txtSrc: string; imgSrc: string; scrollProgress: MotionValue<number>;
}) {
  return (
    <div className="absolute inset-0">
      <div className="absolute inset-x-0 bottom-0 h-[90%]">
        <FoundersCanvas
          txtSrc={txtSrc}
          imgSrc={imgSrc}
          scrollProgress={scrollProgress}
          start={0.32}
          end={0.50}
        />
      </div>
    </div>
  );
}

/* ─── Section ────────────────────────────────────────────────── */
export default function AboutUs() {
  const ref        = useRef<HTMLDivElement>(null);
  const sectionRef = useRef<HTMLElement>(null);
  const inView     = useInView(ref, { once: true, margin: "-80px" });
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start end", "end start"],
  });

  return (
    <section ref={sectionRef} id="about-us" className="relative overflow-hidden bg-ink">
      <GradientBg />

      {/* Top inset divider */}
      <div className="absolute top-8 left-8 right-0 h-px bg-violet/50 z-20 md:top-20 md:left-20" />
      {/* Left inset divider */}
      <div className="absolute inset-y-0 left-8 w-px bg-violet/50 z-20 md:left-20" />

      {/* Content wrapper — clears inset lines */}
      <div ref={ref} className="relative z-10 ml-10 md:ml-16 flex min-h-screen flex-col md:flex-row">

        {/* ── Left: founders ASCII portrait (hover to reveal photo) */}
        <div className="relative w-full overflow-hidden md:w-[40%] min-h-[50vw] md:min-h-0">
          <FoundersReveal txtSrc="/founders-ascii.txt" imgSrc="/founders.png" scrollProgress={scrollYProgress} />
        </div>

        {/* ── Right: text ──────────────────────────────────────── */}
        <div className="flex flex-col justify-center px-8 py-20 md:flex-1 md:px-40 md:py-28">

          {/* Overline */}
          <motion.p
            initial={{ opacity: 0, x: 12 }}
            animate={inView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.5 }}
            className="mb-8 font-mono text-sm uppercase tracking-[0.25em] text-gold/80"
          >
            <PeriodicGlitch text="/About Us/" inView={inView} />
          </motion.p>

          {/* Headline */}
          <div className="overflow-hidden mb-10">
            <motion.h2
              initial={{ y: "105%" }}
              animate={inView ? { y: 0 } : {}}
              transition={{ duration: 0.9, delay: 0.05, ease: [0.22, 1, 0.36, 1] }}
              className="font-display text-5xl font-medium uppercase leading-[0.88] tracking-tight text-cream md:text-6xl lg:text-7xl"
            >
              The Studio
            </motion.h2>
          </div>

          {/* Body */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.7, delay: 0.3 }}
            className="flex flex-col gap-5 max-w-lg"
          >
            <p className="text-sm leading-relaxed text-cream md:text-base">
              Studio&mdash;E is a multi-disciplinary brand studio nearly a decade in the making,
              founded on a single conviction: your brand should be as sophisticated as your business.
            </p>
            <p className="text-sm leading-relaxed text-cream md:text-base">
              We work with founders who have built something real and need a brand to prove it.
              Our engagements synthesize strategy, identity design, and digital engineering into
              one seamless process&mdash;so you&rsquo;re never choosing between a beautiful brand
              and a powerful one.
            </p>
            <p className="text-sm leading-relaxed text-cream md:text-base">
              At Studio&mdash;E, you work directly with two principals who bring{" "}
              {siteConfig.stats[0].value}+ years of combined expertise across brand architecture,
              narrative systems, and web development. {siteConfig.founders[0].name} leads brand
              strategy and creative direction&mdash;drawing on nearly a decade of client work to
              shape the visual and verbal language that makes a brand impossible to ignore.{" "}
              {siteConfig.founders[1].name} leads technical architecture and narrative
              systems&mdash;engineering the digital infrastructure that brings it to life. No account
              managers. No junior designers. Just two multidisciplinary architects committed to
              building brands that outlast the market.
            </p>
          </motion.div>

          {/* Tagline */}
          <motion.p
            initial={{ opacity: 0, y: 12 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.55 }}
            className="mt-12 font-mono text-[10px] uppercase tracking-[0.2em] text-gold md:text-xs"
          >
            Intentional.&nbsp;&nbsp;Strategic.&nbsp;&nbsp;Human.
          </motion.p>

        </div>
      </div>
    </section>
  );
}
