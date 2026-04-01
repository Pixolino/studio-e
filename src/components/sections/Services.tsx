"use client";

import { useRef } from "react";
import { motion, useInView } from "framer-motion";
import { siteConfig } from "@/lib/site";

function ServiceCard({
  service,
  index,
}: {
  service: (typeof siteConfig.services)[number];
  index: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-60px" });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 36 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.85, delay: index * 0.12, ease: [0.22, 1, 0.36, 1] }}
      className="group relative flex flex-col justify-between rounded-2xl border border-gold/10 bg-cream-mid p-10 transition-colors duration-500 hover:border-gold/25"
    >
      <div>
        <p className="mb-6 font-mono text-[10px] uppercase tracking-[0.25em] text-violet">
          0{index + 1}
        </p>
        <h3 className="mb-4 font-display text-3xl font-medium tracking-tight text-ink">
          {service.name}
        </h3>
        <p className="mb-8 text-sm leading-relaxed text-muted">{service.description}</p>
        <ul className="flex flex-wrap gap-2">
          {service.includes.map((item) => (
            <li
              key={item}
              className="rounded-full bg-periwinkle/20 border border-periwinkle/60 px-3 py-1 font-mono text-[10px] text-violet"
            >
              {item}
            </li>
          ))}
        </ul>
      </div>
      <a
        href="#contact"
        data-cursor="pointer"
        className="mt-10 inline-flex items-center gap-2 self-start font-mono text-[11px] uppercase tracking-[0.08em] text-ink underline decoration-violet underline-offset-4 transition-colors hover:text-gold"
      >
        {service.cta} →
      </a>
    </motion.div>
  );
}

export default function Services() {
  const titleRef = useRef<HTMLDivElement>(null);
  const titleInView = useInView(titleRef, { once: true, margin: "-80px" });

  return (
    <section id="services" className="bg-cream px-8 py-32 md:px-16">
      <div ref={titleRef} className="mb-16">
        <motion.p
          initial={{ opacity: 0, x: -12 }}
          animate={titleInView ? { opacity: 1, x: 0 } : {}}
          transition={{ duration: 0.5 }}
          className="mb-3 font-mono text-[11px] uppercase tracking-[0.25em] text-violet"
        >
          Services
        </motion.p>
        <div className="overflow-hidden">
          <motion.h2
            initial={{ y: "100%" }}
            animate={titleInView ? { y: 0 } : {}}
            transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
            className="font-display text-5xl font-medium tracking-tight text-ink md:text-6xl"
          >
            Everything your brand needs{" "}
            <span className="italic">to command the room.</span>
          </motion.h2>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        {siteConfig.services.map((service, i) => (
          <ServiceCard key={service.name} service={service} index={i} />
        ))}
      </div>
    </section>
  );
}
