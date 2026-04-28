"use client";

import { useRef } from "react";
import { motion, useInView } from "framer-motion";
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

/* ─── Section ────────────────────────────────────────────────── */
export default function AboutUs() {
  const ref    = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });

  return (
    <section id="about-us" className="relative overflow-hidden bg-ink">
      <GradientBg />

      {/* Top inset divider */}
      <div className="absolute top-8 left-8 right-0 h-px bg-violet/50 z-20 md:top-14 md:left-14" />
      {/* Left inset divider */}
      <div className="absolute inset-y-0 left-8 w-px bg-violet/50 z-20 md:left-14" />

      {/* Content wrapper — clears inset lines */}
      <div ref={ref} className="relative z-10 ml-10 md:ml-16 flex min-h-screen flex-col md:flex-row">

        {/* ── Left: portrait — framed between left inset line and separator */}
        <div className="relative w-full overflow-hidden md:w-[40%] min-h-[50vw] md:min-h-0">
          {/*
            Replace src with your portrait image (light-on-dark or white PNG).
            filter + mix-blend-mode make the white background disappear on ink.
          */}
          {/* Replace src with your portrait image path once available */}
          {false && (
            <img
              src=""
              alt="Studio—E founders"
              className="absolute inset-0 h-full w-full object-cover object-top"
              style={{ filter: "invert(1)", mixBlendMode: "screen", opacity: 0.85 }}
            />
          )}
        </div>

        {/* ── Right: text ──────────────────────────────────────── */}
        <div className="flex flex-col justify-center px-8 py-20 md:flex-1 md:px-16 md:py-28">

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
