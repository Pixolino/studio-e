"use client";

import { useRef, useState, useEffect } from "react";
import { motion, useInView } from "framer-motion";

const GLITCH_CHARS = "01<>{}[]|/\\!#@%*+=~^?;:";

function PeriodicGlitch({ text, inView }: { text: string; inView: boolean }) {
  const [display, setDisplay] = useState(text);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const tickRef = useRef<ReturnType<typeof setInterval> | null>(null);

  function runGlitch() {
    let iteration = 0;
    clearInterval(tickRef.current!);
    tickRef.current = setInterval(() => {
      setDisplay(
        text.split("").map((ch, i) => {
          if (ch === " ") return " ";
          if (i < iteration) return ch;
          return GLITCH_CHARS[Math.floor(Math.random() * GLITCH_CHARS.length)];
        }).join("")
      );
      iteration += 1.5;
      if (iteration > text.length) {
        clearInterval(tickRef.current!);
        setDisplay(text);
      }
    }, 30);
  }

  // Fire once on first appearance
  useEffect(() => {
    if (inView) runGlitch();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [inView]);

  // Then repeat every 8 seconds
  useEffect(() => {
    intervalRef.current = setInterval(runGlitch, 6000);
    return () => {
      clearInterval(intervalRef.current!);
      clearInterval(tickRef.current!);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [text]);

  return <span>{display}</span>;
}

export default function About() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });

  return (
    <section id="about" className="bg-cream-mid px-8 py-28 md:px-16 md:py-36">
      <div ref={ref} className="mx-auto flex flex-col items-center text-center">

        {/* Overline */}
        <motion.p
          initial={{ opacity: 0, y: 8 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5 }}
          className="mb-10 font-mono text-sm uppercase tracking-[0.25em] text-violet"
        >
          <PeriodicGlitch text="/The Problem We Solve/" inView={inView} />
        </motion.p>

        {/* Headline */}
        <div className="overflow-hidden w-full">
          <motion.h2
            initial={{ y: "105%" }}
            animate={inView ? { y: 0 } : {}}
            transition={{ duration: 1, ease: [0.22, 1, 0.36, 1], delay: 0.05 }}
            className="font-display text-[10vw] font-light uppercase leading-[0.88] tracking-tight text-ink md:text-[7.5vw] xl:text-[clamp(4rem,7.5vw,8.5rem)]"
          >
            You&rsquo;ve built<br />
            something real.<br />
            Your brand<br />
            should prove it.
          </motion.h2>
        </div>

        {/* Body */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7, delay: 0.35 }}
          className="mt-16 flex max-w-xl flex-col gap-6"
        >
          <p className="text-sm leading-relaxed text-muted md:text-base">
            You&rsquo;ve done the hard part: built a business that delivers. But your brand still
            looks like version one. The website that served you at launch is now the ceiling on your
            credibility. The visual identity that was &ldquo;good for now&rdquo; is costing you the
            clients you actually want.
          </p>
          <p className="text-sm leading-relaxed text-muted md:text-base">
            Most agencies will hand you a prettier version of the same problem. A beautiful brand
            with no technical depth. A powerful build with no soul. They&rsquo;ll make you choose.
          </p>
        </motion.div>

        {/* Tagline */}
        <motion.p
          initial={{ opacity: 0, y: 12 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.55 }}
          className="mt-16 font-mono text-[11px] md:text-xs uppercase tracking-[0.2em] text-violet"
        >
          We built{" "}
          <strong className="font-bold tracking-[0.2em]">Studio&mdash;E</strong>
          {" "}to bridge beauty and technicality.
        </motion.p>

      </div>
    </section>
  );
}
