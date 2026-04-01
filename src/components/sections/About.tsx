"use client";

import { useRef } from "react";
import { motion, useInView } from "framer-motion";

export default function About() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section className="bg-cream px-8 py-32 md:px-16">
      <div ref={ref} className="max-w-4xl">
        <motion.p
          initial={{ opacity: 0, x: -12 }}
          animate={inView ? { opacity: 1, x: 0 } : {}}
          transition={{ duration: 0.5 }}
          className="mb-8 font-mono text-[11px] uppercase tracking-[0.25em] text-violet"
        >
          The Problem We Solve
        </motion.p>

        <div className="overflow-hidden">
          <motion.h2
            initial={{ y: "100%" }}
            animate={inView ? { y: 0 } : {}}
            transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
            className="font-display text-4xl font-medium leading-tight tracking-tight text-ink md:text-5xl"
          >
            You&rsquo;ve built something real.{" "}
            <span className="italic">Your brand should prove it.</span>
          </motion.h2>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7, delay: 0.4 }}
          className="mt-8 grid grid-cols-1 gap-8 md:grid-cols-2"
        >
          <p className="text-sm leading-relaxed text-muted">
            You&rsquo;ve done the hard part&mdash;built a business that delivers. But your brand
            still looks like version one. The website that served you at launch is now the ceiling
            on your credibility. The visual identity that was &ldquo;good for now&rdquo; is costing
            you the clients you actually want.
          </p>
          <p className="text-sm leading-relaxed text-muted">
            Most agencies will hand you a prettier version of the same problem. A beautiful brand
            with no technical depth. A powerful build with no soul. They&rsquo;ll make you choose.{" "}
            <span className="font-medium text-ink">
              We built Studio&mdash;E to eliminate that compromise.
            </span>
          </p>
        </motion.div>
      </div>
    </section>
  );
}
