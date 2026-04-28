"use client";

import { useRef, useState, useEffect } from "react";
import { motion, useInView, useScroll, useTransform, AnimatePresence } from "framer-motion";
import { siteConfig } from "@/lib/site";
import PeriodicGlitch from "@/components/ui/PeriodicGlitch";

/* ─── Olive ASCII panel ──────────────────────────────────────── */
function ServicesAscii() {
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

      const RW = 0.52, RH = 1.0;
      const rows = maxR - minR + 1;
      const fs = Math.min(h / (rows * RH), 13);
      fontSize = fs;
      const CW = fs * RW, CH = fs * RH;
      const ox = w - (maxC + 0.5) * CW;
      const oy = h / 2 - ((minR + maxR) / 2) * CH;

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

    fetch("/approach-partnership.txt")
      .then(r => r.text())
      .then(text => {
        const lines = text.split("\n");
        resize();
        build(lines, cw, cvh);

        const ro = new ResizeObserver(() => {
          resize();
          build(lines, cw, cvh);
        });
        ro.observe(cv);

        function draw() {
          rafRef.current = requestAnimationFrame(draw);
          cx.clearRect(0, 0, cw, cvh);
          cx.font         = `${fontSize}px "Geist Mono", monospace`;
          cx.textBaseline = "middle";
          cx.textAlign    = "center";
          cx.fillStyle    = "rgba(178,180,31,0.55)";
          cx.shadowBlur   = 0;
          for (const p of pts) cx.fillText(p.ch, p.x, p.y);
        }
        rafRef.current = requestAnimationFrame(draw);

        return () => { cancelAnimationFrame(rafRef.current); ro.disconnect(); };
      });

    return () => cancelAnimationFrame(rafRef.current);
  }, []);

  return <canvas ref={canvasRef} aria-hidden className="h-full w-full" />;
}

/* ─── Accordion row ──────────────────────────────────────────── */
function ServiceRow({
  service,
  open,
  onToggle,
}: {
  service: (typeof siteConfig.services)[number];
  open: boolean;
  onToggle: () => void;
}) {
  return (
    <div
      id={`service-${service.name.toLowerCase().replace(/\s+/g, "-")}`}
      className="border-t border-violet/30"
    >
      <button
        onClick={onToggle}
        data-cursor="pointer"
        className="group flex w-full items-center gap-5 py-5 text-left"
      >
        <span className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-ink font-mono text-sm leading-none transition-all duration-300 ${open ? "bg-periwinkle" : "bg-transparent group-hover:bg-gold"}`}>
          {open ? "−" : "+"}
        </span>
        <span className="font-display text-xl font-medium uppercase tracking-tight text-ink md:text-2xl lg:text-[1.7vw]">
          {service.name}
        </span>
      </button>

      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            key="body"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
            className="overflow-hidden"
          >
            <div className="pb-8 pl-[52px]">
              <p className="mb-6 max-w-sm text-sm leading-relaxed text-muted md:text-base">
                {service.description}
              </p>
              <a
                href={siteConfig.cta.href}
                data-cursor="pointer"
                className="group/btn inline-flex items-center gap-3 rounded-full border border-violet/50 px-6 py-2.5 font-mono text-[10px] uppercase tracking-[0.12em] text-violet transition-all duration-300 hover:border-gold hover:bg-gold hover:text-ink md:text-xs"
              >
                {service.cta}
                <span className="transition-transform duration-300 group-hover/btn:translate-x-1.5">→</span>
              </a>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ─── Section ────────────────────────────────────────────────── */
export default function Services() {
  const ref         = useRef<HTMLDivElement>(null);
  const sectionRef  = useRef<HTMLElement>(null);
  const inView      = useInView(ref, { once: true, margin: "-80px" });
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start end", "start 0.25"],
  });

  const xLeft  = useTransform(scrollYProgress, [0, 1], ["-110%", "0%"]);
  const xRight = useTransform(scrollYProgress, [0, 1], ["110%",  "0%"]);

  const headlineLines = [
    { text: "Everything Your Brand",   align: "text-left",  x: xLeft  },
    { text: "Needs To Command",        align: "text-right", x: xRight },
    { text: "The Room.",               align: "text-right", x: xRight },
  ];

  return (
    <section ref={sectionRef} id="services" className="relative overflow-hidden bg-cream-mid">
      {/* Top inset divider — starts at left line, runs to right edge */}
      <div className="absolute top-8 left-8 right-0 h-px bg-violet/50 z-20 md:top-14 md:left-14" />
      {/* Left inset divider — full height of section */}
      <div className="absolute inset-y-0 left-8 w-px bg-violet/50 z-20 md:left-14" />

      {/* Content wrapper — clears left line and top line */}
      <div className="ml-10 md:ml-16">

        {/* Overline — top right, below top line */}
        <div className="flex justify-end pr-8 pt-14 md:pr-16 md:pt-20">
          <motion.p
            ref={ref}
            initial={{ opacity: 0, x: 12 }}
            animate={inView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.5 }}
            className="font-mono text-sm uppercase tracking-[0.25em] text-violet"
          >
            <PeriodicGlitch text="/Studio—E Services/" inView={inView} />
          </motion.p>
        </div>

        {/* Staggered headline */}
        <div className="pb-10 pt-6 px-6 md:px-14">
          <h2 className="font-display text-5xl font-medium uppercase leading-[0.88] tracking-tight text-ink md:text-6xl lg:text-7xl">
            {headlineLines.map((line, i) => (
              <div key={i} className={`overflow-hidden ${line.align}`}>
                <motion.span
                  className="block"
                  style={{ x: line.x }}
                >
                  {line.text}
                </motion.span>
              </div>
            ))}
          </h2>
        </div>

        {/* Body: accordion left + ASCII right */}
        <div className="flex items-stretch">

          {/* Left: accordion */}
          <div className="w-full px-6 pb-20 md:w-[55%] md:px-14">
            {siteConfig.services.map((service, i) => (
              <ServiceRow
                key={service.name}
                service={service}
                open={activeIndex === i}
                onToggle={() => setActiveIndex(activeIndex === i ? null : i)}
              />
            ))}
            <div className="border-t border-violet/30" />
          </div>

          {/* Right: ASCII art — desktop only */}
          <div className="relative hidden md:block md:w-[45%]">
            <ServicesAscii />
          </div>

        </div>
      </div>
    </section>
  );
}
