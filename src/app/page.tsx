"use client";

import { motion } from "framer-motion";
import { siteConfig } from "@/lib/site";

const headline = siteConfig.tagline;
const words = headline.split(" ");

const container = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.08, delayChildren: 0.4 },
  },
};

const wordReveal = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] as const },
  },
};

const fade = (delay: number) => ({
  hidden: { opacity: 0, y: 12 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, delay, ease: "easeOut" as const },
  },
});

export default function Home() {
  return (
    <section className="relative flex min-h-dvh flex-col items-center justify-center bg-ink grain-overlay px-6 text-center">
      {/* Eyebrow */}
      <motion.p
        variants={fade(0.1)}
        initial="hidden"
        animate="visible"
        className="mb-6 text-sm font-medium tracking-widest uppercase text-gold"
      >
        Web design&ensp;&middot;&ensp;Branding&ensp;&middot;&ensp;Development
      </motion.p>

      {/* Headline — word-by-word reveal */}
      <motion.h1
        variants={container}
        initial="hidden"
        animate="visible"
        className="mx-auto max-w-3xl text-4xl font-medium leading-tight tracking-tight text-cream sm:text-5xl md:text-6xl lg:text-7xl"
      >
        {words.map((word, i) => (
          <motion.span
            key={i}
            variants={wordReveal}
            className="mr-[0.3em] inline-block"
          >
            {word}
          </motion.span>
        ))}
      </motion.h1>

      {/* Body */}
      <motion.p
        variants={fade(1)}
        initial="hidden"
        animate="visible"
        className="mx-auto mt-6 max-w-xl text-base leading-relaxed text-muted sm:text-lg"
      >
        {siteConfig.description}
      </motion.p>

      {/* CTAs */}
      <motion.div
        variants={fade(1.3)}
        initial="hidden"
        animate="visible"
        className="mt-10 flex flex-wrap items-center justify-center gap-6"
      >
        <a
          href="#contact"
          className="inline-flex items-center rounded-full bg-gold px-7 py-3.5 text-sm font-medium text-ink transition-colors hover:bg-gold-light"
        >
          Start a project
        </a>
        <a
          href="#work"
          className="text-sm text-muted underline decoration-gold-deep underline-offset-4 transition-colors hover:text-cream"
        >
          See our work
        </a>
      </motion.div>
    </section>
  );
}
