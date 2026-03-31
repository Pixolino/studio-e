"use client";

import { useRef } from "react";
import { motion, useInView } from "framer-motion";

const pillars = [
  {
    number: "01",
    title: "Artful Precision",
    description:
      "We don't design\u2014we curate. A rigorous aesthetic standard applied to every surface of your brand, from identity system to interface. We signal quality and trust on contact.",
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

function PillarCard({ pillar, index }: { pillar: (typeof pillars)[0]; index: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-60px" });

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
      <p className="mb-5 font-mono text-xs text-gold/50">{pillar.number}</p>
      <h3 className="mb-3 font-display text-2xl font-medium tracking-tight text-cream">
        {pillar.title}
      </h3>
      <p className="text-sm leading-relaxed text-muted">{pillar.description}</p>
    </motion.div>
  );
}

export default function Approach() {
  const titleRef = useRef<HTMLDivElement>(null);
  const titleInView = useInView(titleRef, { once: true, margin: "-80px" });

  return (
    <section id="approach" className="relative bg-ink grain-overlay px-8 py-32 md:px-16">
      <div ref={titleRef} className="mb-20 max-w-2xl">
        <motion.p
          initial={{ opacity: 0, x: -12 }}
          animate={titleInView ? { opacity: 1, x: 0 } : {}}
          transition={{ duration: 0.5 }}
          className="mb-3 font-mono text-[11px] uppercase tracking-[0.25em] text-gold/60"
        >
          The Approach
        </motion.p>
        <div className="overflow-hidden">
          <motion.h2
            initial={{ y: "100%" }}
            animate={titleInView ? { y: 0 } : {}}
            transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
            className="font-display text-5xl font-medium tracking-tight text-cream md:text-6xl"
          >
            Intelligence,{" "}
            <span className="italic text-gold">meet instinct.</span>
          </motion.h2>
        </div>
        <motion.p
          initial={{ opacity: 0, y: 16 }}
          animate={titleInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7, delay: 0.35 }}
          className="mt-6 text-sm leading-relaxed text-muted"
        >
          Every engagement at Studio&mdash;E is governed by three commitments.
        </motion.p>
      </div>

      <div className="grid grid-cols-1 gap-0 md:grid-cols-3">
        {pillars.map((p, i) => (
          <PillarCard key={p.number} pillar={p} index={i} />
        ))}
      </div>
    </section>
  );
}
