"use client";

import { useRef } from "react";
import { motion, useInView } from "framer-motion";
import PeriodicGlitch from "@/components/ui/PeriodicGlitch";

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

        {/* Headline — per-line staggered reveal */}
        <h2 className="font-display text-4xl font-light uppercase leading-[0.88] tracking-tight text-ink md:text-5xl lg:text-6xl xl:text-7xl">
          {(
            [
              ["You’ve built",   0.05],
              ["something real.",     0.16],
              ["Your brand",          0.27],
              ["should prove it.",    0.38],
            ] as [string, number][]
          ).map(([text, delay]) => (
            <div key={text} className="overflow-hidden">
              <motion.span
                className="block"
                initial={{ y: "105%" }}
                animate={inView ? { y: 0 } : {}}
                transition={{ duration: 1, delay, ease: [0.22, 1, 0.36, 1] }}
              >
                {text}
              </motion.span>
            </div>
          ))}
        </h2>

        {/* Body — paragraphs staggered individually */}
        <div className="mt-16 flex max-w-xl flex-col gap-6">
          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.65, delay: 0.42 }}
            className="text-sm leading-relaxed text-charcoal md:text-base"
          >
            You&rsquo;ve done the hard part: built a business that delivers. But your brand still
            looks like version one. The website that served you at launch is now the ceiling on your
            credibility. The visual identity that was &ldquo;good for now&rdquo; is costing you the
            clients you actually want.
          </motion.p>
          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.65, delay: 0.54 }}
            className="text-sm leading-relaxed text-charcoal md:text-base"
          >
            Most agencies will hand you a prettier version of the same problem. A beautiful brand
            with no technical depth. A powerful build with no soul. They&rsquo;ll make you choose.
          </motion.p>
        </div>

        {/* Tagline */}
        <motion.p
          initial={{ opacity: 0, y: 12 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.55 }}
          className="mt-16 font-mono text-[11px] md:text-[13px] uppercase tracking-[0.2em] text-violet"
        >
          We built{" "}
          <strong className="font-bold tracking-[0.2em]">Studio&mdash;E</strong>
          {" "}to bridge beauty and technicality.
        </motion.p>

      </div>
    </section>
  );
}
