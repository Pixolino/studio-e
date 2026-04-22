"use client";

import { useRef } from "react";
import { motion, useInView } from "framer-motion";
import PeriodicGlitch from "@/components/ui/PeriodicGlitch";

const projects = [
  {
    id: "01",
    name: "Aurum Coffee",
    category: "Brand & Web",
    description:
      "Full brand identity and digital presence for a specialty single-origin roaster.",
    bg: "bg-gradient-to-br from-[#422DA2] via-[#2d1f6e] to-[#151514]",
    light: true,
  },
  {
    id: "02",
    name: "Meridian Capital",
    category: "Web Design",
    description:
      "Marketing site and client portal for a boutique investment firm.",
    bg: "bg-gradient-to-br from-[#E6E6DB] to-[#B2B41F]",
    light: false,
  },
  {
    id: "03",
    name: "Vela Skincare",
    category: "Brand Identity",
    description:
      "Minimal luxury branding for a clean beauty startup targeting Gen Z.",
    bg: "bg-gradient-to-br from-[#B2B41F] to-[#D0D1FF]",
    light: false,
  },
  {
    id: "04",
    name: "Flux Studios",
    category: "Digital Experience",
    description:
      "Immersive portfolio site for a Miami-based motion design collective.",
    bg: "bg-gradient-to-br from-[#151514] to-[#0e0e0d]",
    light: true,
  },
];

type Project = (typeof projects)[0];

function WorkCard({
  project,
  className,
  delay,
}: {
  project: Project;
  className?: string;
  delay: number;
}) {
  const ref = useRef<HTMLElement>(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });

  return (
    <motion.article
      ref={ref}
      initial={{ opacity: 0, y: 40 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.85, delay, ease: [0.22, 1, 0.36, 1] }}
      data-cursor="pointer"
      className={`group relative overflow-hidden rounded-2xl ${project.bg} ${className}`}
    >
      {/* Hover overlay */}
      <div className="absolute inset-0 bg-ink/80 opacity-0 transition-opacity duration-500 group-hover:opacity-100" />

      <div className="relative z-10 flex h-full flex-col justify-between p-8">
        <div className="flex items-start justify-between">
          <span
            className={`font-mono text-[10px] md:text-xs uppercase tracking-[0.22em] transition-colors duration-300 ${
              project.light ? "text-gold/50" : "text-ink/45"
            } group-hover:text-gold/50`}
          >
            {project.category}
          </span>
          <span
            className={`font-mono text-xs transition-colors duration-300 ${
              project.light ? "text-cream/25" : "text-ink/20"
            } group-hover:text-cream/25`}
          >
            {project.id}
          </span>
        </div>

        <div>
          <h3
            className={`font-display text-3xl font-medium tracking-tight transition-colors duration-300 ${
              project.light ? "text-cream" : "text-ink"
            } group-hover:text-cream`}
          >
            {project.name}
          </h3>
          <p className="mt-2 max-w-xs translate-y-3 text-sm leading-relaxed text-cream/65 opacity-0 transition-all duration-500 group-hover:translate-y-0 group-hover:opacity-100">
            {project.description}
          </p>
          <div className="mt-5 flex translate-y-3 items-center gap-2 opacity-0 transition-all delay-75 duration-500 group-hover:translate-y-0 group-hover:opacity-100">
            <span className="font-mono text-[11px] md:text-xs uppercase tracking-[0.08em] text-gold">View project</span>
            <span className="text-gold">→</span>
          </div>
        </div>
      </div>
    </motion.article>
  );
}

export default function Work() {
  const titleRef = useRef<HTMLDivElement>(null);
  const titleInView = useInView(titleRef, { once: true, margin: "-60px" });

  return (
    <section id="work" className="bg-cream px-8 py-28 md:px-16">
      <div ref={titleRef} className="mb-16 flex items-end justify-between">
        <div>
          <motion.p
            initial={{ opacity: 0, x: -12 }}
            animate={titleInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.5 }}
            className="mb-3 font-mono text-sm uppercase tracking-[0.25em] text-violet"
          >
            <PeriodicGlitch text="/Selected Work/" inView={titleInView} />
          </motion.p>
          <div className="overflow-hidden">
            <motion.h2
              initial={{ y: "100%" }}
              animate={titleInView ? { y: 0 } : {}}
              transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
              className="font-display text-5xl font-medium tracking-tight text-ink md:text-6xl lg:text-7xl"
            >
              Our projects.
            </motion.h2>
          </div>
        </div>
        <motion.a
          href="#"
          data-cursor="pointer"
          initial={{ opacity: 0 }}
          animate={titleInView ? { opacity: 1 } : {}}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="hidden font-mono text-[11px] md:text-xs uppercase tracking-[0.08em] text-violet underline decoration-violet underline-offset-4 transition-colors hover:text-ink md:block"
        >
          All work →
        </motion.a>
      </div>

      {/* 5-column grid: tall left + 2 stacked right */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-5">
        <WorkCard
          project={projects[0]}
          className="min-h-[480px] md:col-span-3 md:row-span-2"
          delay={0}
        />
        <WorkCard
          project={projects[1]}
          className="min-h-[228px] md:col-span-2"
          delay={0.1}
        />
        <WorkCard
          project={projects[2]}
          className="min-h-[228px] md:col-span-2"
          delay={0.2}
        />
      </div>

      {/* Full-width bottom card */}
      <div className="mt-4">
        <WorkCard project={projects[3]} className="min-h-[220px]" delay={0.3} />
      </div>
    </section>
  );
}
