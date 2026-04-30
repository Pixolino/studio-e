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

/** Animated nebula of blurred radial-gradient blobs; reused from Approach section. */
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
        className="lg:hidden absolute inset-0"
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
/** ASCII art canvas that wipes to the founders photo row-by-row as the section scrolls into view. */
function FoundersCanvas({
  txtSrc, imgSrc, scrollProgress, start, end,
}: {
  txtSrc: string; imgSrc: string;
  scrollProgress: MotionValue<number>;
  start: number; end: number;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rafRef    = useRef(0);
  const canvasState = useRef({
    pts:       [] as { x: number; y: number; ch: string; a: number; r: number; c: number }[],
    img:       null as HTMLImageElement | null,
    imgReady:  false,
    drawX: 0, drawY: 0, drawW: 0, drawH: 0,
    fontSize: 10, CH: 10, CW: 5.5,
    minR: 0, maxR: 0, minC: 0, spanC: 1,
    totalCols: 1, totalRows: 1,
    ox: 0, oy: 0, cw: 0, ch: 0,
    linesReady: false,
    ready: false,
  });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const cv = canvas, cx = ctx;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const s = canvasState.current;
    let lines: string[] = [];

    // Compute ASCII bounds — called once per text load
    function parseBounds() {
      let minC = Infinity, maxC = 0, minR = Infinity, maxR = 0, totalCols = 0;
      for (let r = 0; r < lines.length; r++) {
        totalCols = Math.max(totalCols, lines[r].length);
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
      s.minR = minR; s.maxR = maxR; s.minC = minC;
      s.spanC = maxC - minC + 1;
      s.totalCols = totalCols;
      s.totalRows = lines.length;
      s.linesReady = true;
    }

    // Derive font size + position from the photo rect so they always overlay exactly.
    // Called on every resize and after the image loads.
    function computePlacement() {
      if (!s.linesReady || !s.cw || !s.ch) return;


      // Photo rect: object-contain
      let pX = 0, pY = 0, pW = s.cw, pH = s.ch;
      if (s.img) {
        const isDesktop = typeof window !== "undefined" && window.innerWidth >= 1024;
        const scale = Math.min(s.cw / s.img.naturalWidth, s.ch / s.img.naturalHeight);
        pW = s.img.naturalWidth  * scale;
        pH = s.img.naturalHeight * scale;
        // Desktop: right-aligned + small rightward nudge; mobile: right-aligned
        pX = s.cw - pW + (isDesktop ? s.cw * 0.06 : -s.cw * 0.20);
        // Desktop: offset down to align with text content; mobile: top-aligned
        pY = isDesktop ? s.ch * 0.08 : 0;
        s.drawX = pX; s.drawY = pY; s.drawW = pW; s.drawH = pH;
      }

      // Scale using full ASCII dimensions so each col/row maps 1:1 to photo pixels
      s.fontSize = Math.min(pW / (s.totalCols * 0.55), pH / s.totalRows);
      if (s.fontSize < 2) s.fontSize = 2;
      s.CW = s.fontSize * 0.55;
      s.CH = s.fontSize;

      // col 0 = photo left edge, row 0 = photo top edge — correct overlay at every viewport
      s.ox = pX;
      s.oy = pY;

      // Rebuild point list
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
      s.ready = true;
    }

    function buildLayout() {
      if (!lines.length) return;
      s.cw = cv.offsetWidth; s.ch = cv.offsetHeight;
      cv.width = s.cw * dpr; cv.height = s.ch * dpr;
      cx.setTransform(dpr, 0, 0, dpr, 0, 0);
      computePlacement();
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
      parseBounds();
      buildLayout();
      rafRef.current = requestAnimationFrame(draw);
    });

    const imgEl = new window.Image();
    imgEl.src = imgSrc;
    imgEl.onload = () => { s.img = imgEl; s.imgReady = true; computePlacement(); };

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
      <div className="absolute inset-0">
        <FoundersCanvas
          txtSrc={txtSrc}
          imgSrc={imgSrc}
          scrollProgress={scrollProgress}
          start={0.35}
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
      <div className="absolute top-8 left-8 right-0 h-px bg-violet/50 z-20 md:top-14 md:left-14 lg:top-20 lg:left-20" />
      {/* Left inset divider */}
      <div className="absolute inset-y-0 left-8 w-px bg-violet/50 z-20 md:left-14 lg:left-20" />

      {/* Content wrapper — block on mobile (float layout), flex-row on desktop */}
      <div ref={ref} className="relative z-10 ml-10 md:ml-16 lg:ml-16 pt-20 md:pt-28 lg:pt-0 lg:min-h-screen lg:flex lg:flex-row">

        {/* ── Portrait — floats right on mobile, left column on desktop */}
        <div className="relative float-right -mt-4 ml-3 w-[40%] h-[46vw] overflow-hidden md:mt-0 lg:ml-0 lg:mt-20 lg:float-none lg:w-[40%] lg:h-auto">
          <FoundersReveal txtSrc="/founders-ascii.txt" imgSrc="/founders.png" scrollProgress={scrollYProgress} />
        </div>

        {/* ── Text — flows beside float on mobile, right column on desktop */}
        <div className="block px-4 pb-14 md:pb-20 lg:flex lg:flex-col lg:flex-1 lg:justify-center lg:px-40 lg:py-28">

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

          {/* Body — clears the portrait float on mobile so it spans full width */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.7, delay: 0.3 }}
            className="clear-right mt-20 flex flex-col gap-5 max-w-lg lg:mt-0 lg:clear-none"
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
            className="clear-right mt-12 font-mono text-[11px] uppercase tracking-[0.2em] text-gold lg:clear-none lg:text-[13px]"
          >
            Intentional.&nbsp;&nbsp;Strategic.&nbsp;&nbsp;Human.
          </motion.p>

        </div>
      </div>
    </section>
  );
}
