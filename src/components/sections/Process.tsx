"use client";

import { useRef } from "react";
import { motion, useInView } from "framer-motion";

const steps = [
  {
    number: "01",
    title: "Discover",
    description:
      "We dig into your world — your goals, your audience, your competitive landscape — before a single pixel is placed.",
  },
  {
    number: "02",
    title: "Define",
    description:
      "Strategy, positioning, and direction. We establish a clear creative brief and visual language that guides every decision.",
  },
  {
    number: "03",
    title: "Design",
    description:
      "Craft over speed. We build with intention — typography, motion, interaction — until every detail feels right.",
  },
  {
    number: "04",
    title: "Deploy",
    description:
      "Launch-ready and built for performance. We hand off a complete system: brand, site, and documentation.",
  },
];

function StepCard({ step, index }: { step: (typeof steps)[0]; index: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-60px" });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 32 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.8, delay: index * 0.1, ease: [0.22, 1, 0.36, 1] }}
      className="relative border-t border-ink/10 pb-8 pr-8 pt-8"
    >
      {/* Expanding gold top line */}
      <motion.div
        initial={{ scaleX: 0 }}
        animate={inView ? { scaleX: 1 } : {}}
        transition={{ duration: 0.65, delay: index * 0.1 + 0.2, ease: [0.22, 1, 0.36, 1] }}
        className="absolute left-0 top-0 h-px w-full origin-left bg-gold/50"
      />

      <p className="mb-5 font-display text-sm font-medium italic text-gold/60">
        {step.number}
      </p>
      <h3 className="mb-3 font-display text-2xl font-medium tracking-tight text-ink">
        {step.title}
      </h3>
      <p className="text-sm leading-relaxed text-muted">{step.description}</p>
    </motion.div>
  );
}

export default function Process() {
  const titleRef = useRef<HTMLDivElement>(null);
  const titleInView = useInView(titleRef, { once: true, margin: "-80px" });

  return (
    <section id="process" className="bg-cream-mid px-8 py-32 md:px-16">
      <div ref={titleRef} className="mb-20">
        <motion.p
          initial={{ opacity: 0, x: -12 }}
          animate={titleInView ? { opacity: 1, x: 0 } : {}}
          transition={{ duration: 0.5 }}
          className="mb-3 text-xs font-medium uppercase tracking-[0.25em] text-muted"
        >
          How We Work
        </motion.p>
        <div className="overflow-hidden">
          <motion.h2
            initial={{ y: "100%" }}
            animate={titleInView ? { y: 0 } : {}}
            transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
            className="font-display text-5xl font-medium tracking-tight text-ink md:text-6xl"
          >
            Our process.
          </motion.h2>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-0 md:grid-cols-4">
        {steps.map((step, i) => (
          <StepCard key={step.number} step={step} index={i} />
        ))}
      </div>
    </section>
  );
}
