"use client";

import { useRef, useEffect, useLayoutEffect, useState } from "react";
import { motion, useInView, useScroll, useTransform } from "framer-motion";
import { siteConfig } from "@/lib/site";

/* ─── ASCII canvas ───────────────────────────────────────────── */
function FooterAscii({ dashRef }: { dashRef: React.RefObject<HTMLSpanElement | null> }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rafRef    = useRef(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const cv = canvas, cx = ctx;
    let pts: { x: number; y: number; ch: string }[] = [];
    let fontSize = 10;
    let cw = 0, cvh = 0;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);

    function build(lines: string[], w: number, h: number) {
      let minC = Infinity, maxC = -Infinity, minR = Infinity, maxR = -Infinity;
      for (let r = 0; r < lines.length; r++)
        for (let c = 0; c < lines[r].length; c++)
          if (lines[r][c] !== " " && lines[r][c] !== "\r") {
            if (c < minC) minC = c; if (c > maxC) maxC = c;
            if (r < minR) minR = r; if (r > maxR) maxR = r;
          }

      if (minC === Infinity) return;

      const RW = 0.52, RH = 1.0;
      const rows = maxR - minR + 1;
      // scale to ~90% of canvas height so most of the art is visible
      const fs = (h / (rows * RH)) * 1.1;
      fontSize = fs;
      const CW = fs * RW, CH = fs * RH;

      // Anchor art center to the em-dash in the wordmark, measured fresh each build
      const artW = (maxC - minC + 1) * CW;
      let ox: number;
      const dashEl = dashRef.current;
      const cvRect = cv.getBoundingClientRect();
      if (dashEl && cvRect.width > 0) {
        const dashRect = dashEl.getBoundingClientRect();
        // center of dash relative to canvas left edge
        const dashX = dashRect.left + dashRect.width / 2 - cvRect.left;
        // center the art horizontally on the dash
        ox = dashX - ((minC + maxC) / 2 + 0.5) * CW;
      } else {
        // fallback: near right edge
        ox = w - (maxC + 1) * CW - artW * 0.65;
      }

      const oy = h * 0.02 - minR * CH;

      pts = [];
      for (let r = 0; r < lines.length; r++)
        for (let c = 0; c < lines[r].length; c++) {
          const char = lines[r][c];
          if (char === " " || char === "\r") continue;
          pts.push({ x: ox + c * CW + CW * 0.5, y: oy + r * CH + CH * 0.5, ch: char });
        }
    }

    function resize() {
      cw = cv.offsetWidth; cvh = cv.offsetHeight;
      cv.width  = cw * dpr;
      cv.height = cvh * dpr;
      cx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }

    fetch("/footer-ascii.txt")
      .then(r => r.text())
      .then(text => {
        if (!text.trim()) return;
        const lines = text.split("\n");
        resize();
        build(lines, cw, cvh);

        const ro = new ResizeObserver(() => { resize(); build(lines, cw, cvh); });
        ro.observe(cv);

        let visible = true;
        const io = new IntersectionObserver(([e]) => {
          visible = e.isIntersecting;
          if (visible && rafRef.current === 0) rafRef.current = requestAnimationFrame(draw);
        }, { rootMargin: "200px" });
        io.observe(cv);

        function draw() {
          if (!visible) { rafRef.current = 0; return; }
          rafRef.current = requestAnimationFrame(draw);
          cx.clearRect(0, 0, cw, cvh);
          cx.font         = `${fontSize}px "Geist Mono", monospace`;
          cx.textBaseline = "middle";
          cx.textAlign    = "center";
          cx.fillStyle    = "rgba(255,255,255,0.55)";
          for (const p of pts) cx.fillText(p.ch, p.x, p.y);
        }
        rafRef.current = requestAnimationFrame(draw);

        return () => { cancelAnimationFrame(rafRef.current); ro.disconnect(); io.disconnect(); };
      });

    return () => cancelAnimationFrame(rafRef.current);
  }, [dashRef]);

  return <canvas ref={canvasRef} aria-hidden className="h-full w-full" />;
}

/* ─── Footer ─────────────────────────────────────────────────── */
export default function Footer() {
  const ref     = useRef<HTMLElement>(null);
  const dashRef = useRef<HTMLSpanElement>(null);
  const inView  = useInView(ref, { once: true, margin: "-60px" });

  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const handY = useTransform(scrollYProgress, [0, 0.5], ["30%", "0%"]);

  const [dashCenterX, setDashCenterX] = useState<number | null>(null);
  const [socialsWide, setSocialsWide] = useState(false);
  useLayoutEffect(() => {
    function measure() {
      const dash = dashRef.current;
      const footer = ref.current;
      if (!dash || !footer) return;
      const dRect = dash.getBoundingClientRect();
      const fRect = footer.getBoundingClientRect();
      setDashCenterX(dRect.left + dRect.width / 2 - fRect.left);
      setSocialsWide(window.innerWidth >= 700);
    }
    measure();
    const ro = new ResizeObserver(measure);
    if (ref.current) ro.observe(ref.current);
    return () => ro.disconnect();
  }, []);

  return (
    <footer
      ref={ref}
      className="relative flex flex-col overflow-hidden bg-ink"
    >
      {/* Meta row */}
      <div className="relative z-10 flex flex-col gap-4 px-8 pt-12 md:flex-row md:items-center md:justify-between md:px-14 md:pt-14">
        <motion.p
          initial={{ opacity: 0, y: 8 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="font-mono text-[10px] uppercase tracking-[0.1em] text-muted/95 md:text-xs"
        >
          © {new Date().getFullYear()} Studio—E. All rights reserved.
        </motion.p>
      </div>

      {/* South Florida — centered on footer; stacks below copyright below 1000px */}
      <motion.p
        initial={{ opacity: 0, y: 8 }}
        animate={inView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="relative z-10 mt-2 px-8 font-mono text-[10px] tracking-[0.08em] text-periwinkle/50 md:px-14 md:text-xs min-[1000px]:absolute min-[1000px]:left-1/2 min-[1000px]:top-14 min-[1000px]:mt-0 min-[1000px]:-translate-x-1/2 min-[1000px]:px-0 min-[1000px]:text-center"
      >
        South Florida
      </motion.p>

      {/* Social links — centered on the ASCII art (em-dash anchor) */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={inView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.5, delay: 0.3 }}
        className="relative z-10 mt-2 flex gap-6 px-8 md:px-14 min-[700px]:absolute min-[700px]:top-12 min-[700px]:mt-0 min-[700px]:-translate-x-1/2 min-[700px]:px-0 md:top-14"
        style={socialsWide ? { left: dashCenterX ?? "75%" } : undefined}
      >
        {siteConfig.social.map((s) => (
          <a
            key={s.platform}
            href={s.href}
            target="_blank"
            rel="noopener noreferrer"
            data-cursor="pointer"
            className="font-mono text-[10px] uppercase tracking-[0.1em] text-muted/95 transition-colors hover:text-periwinkle md:text-xs"
          >
            {s.platform}
          </a>
        ))}
      </motion.div>

      {/* Spacer */}
      <div className="h-40 md:h-72" />

      {/* ASCII art — pinned behind the em-dash in the wordmark */}
      <motion.div
        aria-hidden
        style={{ y: handY }}
        className="pointer-events-none absolute top-0 right-0 h-full w-[70%] select-none"
      >
        <FooterAscii dashRef={dashRef} />
      </motion.div>

      {/* STUDIO—E wordmark
          19.25vw fills exactly 100vw at all breakpoints
          (derived from: 356.98px font → 1854.44px text width → 356.98/1854.44 = 19.25%)      */}
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={inView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
        className="relative z-10 w-full overflow-hidden"
      >
        <p
          className="whitespace-nowrap font-display font-medium uppercase leading-none tracking-tight text-gold [font-size:19.5vw]"
        >
          STUDIO<span ref={dashRef}>—</span>E
        </p>
      </motion.div>
    </footer>
  );
}
