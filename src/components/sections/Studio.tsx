"use client";

import { useRef, useEffect } from "react";
import { motion, useInView, useMotionValue, animate } from "framer-motion";
import { siteConfig } from "@/lib/site";

function CountUp({
  target,
  suffix,
  inView,
}: {
  target: number;
  suffix: string;
  inView: boolean;
}) {
  const nodeRef = useRef<HTMLSpanElement>(null);
  const count = useMotionValue(0);

  useEffect(() => {
    if (!inView) return;
    const node = nodeRef.current;
    const controls = animate(count, target, {
      duration: target === 0 ? 0.1 : 1.8,
      ease: "easeOut",
      onUpdate(v) {
        if (node) node.textContent = `${Math.round(v)}${suffix}`;
      },
    });
    return controls.stop;
  }, [inView, count, target, suffix]);

  return <span ref={nodeRef}>{`0${suffix}`}</span>;
}

function FounderCard({
  founder,
  index,
}: {
  founder: (typeof siteConfig.founders)[number];
  index: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-60px" });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 32 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.8, delay: index * 0.12, ease: [0.22, 1, 0.36, 1] }}
      className="rounded-2xl border border-gold/10 p-10"
    >
      <p className="mb-1 font-display text-3xl font-medium text-cream">{founder.name}</p>
      <p className="mb-6 text-xs font-medium uppercase tracking-widest text-gold/60">
        {founder.role}
      </p>
      <p className="text-sm leading-relaxed text-muted">{founder.bio}</p>
    </motion.div>
  );
}

export default function Studio() {
  const titleRef = useRef<HTMLDivElement>(null);
  const titleInView = useInView(titleRef, { once: true, margin: "-80px" });

  const statsRef = useRef<HTMLDivElement>(null);
  const statsInView = useInView(statsRef, { once: true, margin: "-80px" });

  return (
    <section id="studio" className="bg-ink grain-overlay px-8 py-32 md:px-16">
      <div ref={titleRef} className="mb-20">
        <motion.p
          initial={{ opacity: 0, x: -12 }}
          animate={titleInView ? { opacity: 1, x: 0 } : {}}
          transition={{ duration: 0.5 }}
          className="mb-3 text-xs font-medium uppercase tracking-[0.25em] text-gold/60"
        >
          The Studio
        </motion.p>
        <div className="overflow-hidden">
          <motion.h2
            initial={{ y: "100%" }}
            animate={titleInView ? { y: 0 } : {}}
            transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
            className="font-display text-4xl font-medium tracking-tight text-cream md:text-5xl"
          >
            Two principals. 23 years of combined expertise.{" "}
            <span className="italic text-gold">Zero layers.</span>
          </motion.h2>
        </div>
        <motion.p
          initial={{ opacity: 0, y: 16 }}
          animate={titleInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7, delay: 0.35 }}
          className="mt-6 max-w-2xl text-sm leading-relaxed text-muted"
        >
          Studio&mdash;E was founded to end the creative-technical divide. When you hire us,
          you aren&rsquo;t getting a design team and a dev team learning to talk to each other.
          You&rsquo;re getting two multidisciplinary architects who have spent over a decade
          mastering the intersection of high-stakes communication and technical execution.
        </motion.p>
      </div>

      <div className="mb-24 grid grid-cols-1 gap-4 md:grid-cols-2">
        {siteConfig.founders.map((founder, i) => (
          <FounderCard key={founder.name} founder={founder} index={i} />
        ))}
      </div>

      <div
        ref={statsRef}
        className="grid grid-cols-1 gap-12 border-t border-gold/10 pt-16 md:grid-cols-3"
      >
        {siteConfig.stats.map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 24 }}
            animate={statsInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.7, delay: i * 0.12, ease: [0.22, 1, 0.36, 1] }}
          >
            <p className="font-display text-6xl font-light tracking-tight text-gold md:text-7xl">
              <CountUp target={stat.value} suffix={stat.suffix} inView={statsInView} />
            </p>
            <p className="mt-2 text-xs uppercase tracking-widest text-muted/60">{stat.label}</p>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
