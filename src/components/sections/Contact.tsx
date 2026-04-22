"use client";

import { useRef } from "react";
import { motion, useInView } from "framer-motion";
import { siteConfig } from "@/lib/site";
import PeriodicGlitch from "@/components/ui/PeriodicGlitch";

const lines = ["READY TO BUILD", "SOMETHING", "THAT LASTS?"];

export default function Contact() {
  const ref = useRef<HTMLElement>(null);
  const inView = useInView(ref, { once: true, margin: "-120px" });

  return (
    <section
      id="contact"
      ref={ref}
      className="relative flex min-h-dvh flex-col justify-between overflow-hidden bg-ink grain-overlay px-8 py-24 md:px-16"
    >
      {/* Giant "E" watermark */}
      <div
        aria-hidden
        className="pointer-events-none absolute bottom-[-6vw] right-[-4vw] select-none font-display text-[38vw] font-medium leading-none text-gold/[0.04]"
      >
        E
      </div>

      <div className="relative z-10 flex flex-1 flex-col justify-center">
        <motion.p
          initial={{ opacity: 0, x: -12 }}
          animate={inView ? { opacity: 1, x: 0 } : {}}
          transition={{ duration: 0.5 }}
          className="mb-8 font-mono text-sm uppercase tracking-[0.25em] text-gold/60"
        >
          <PeriodicGlitch text="/Start a conversation/" inView={inView} />
        </motion.p>

        <h2 className="font-display text-[9vw] font-medium leading-[0.88] tracking-tight text-cream md:text-[7.5vw]">
          {lines.map((line, i) => (
            <div key={i} className="overflow-hidden">
              <motion.span
                initial={{ y: "105%" }}
                animate={inView ? { y: 0 } : {}}
                transition={{ duration: 1, delay: 0.1 + i * 0.1, ease: [0.22, 1, 0.36, 1] }}
                className="block"
              >
                {line}
              </motion.span>
            </div>
          ))}
        </h2>

        <motion.p
          initial={{ opacity: 0, y: 16 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7, delay: 0.45 }}
          className="mt-8 max-w-sm text-sm leading-relaxed text-muted md:text-base"
        >
          Every Studio&mdash;E engagement begins with a Discovery Call&mdash;a focused conversation
          to understand where you are, where you&rsquo;re headed, and whether we&rsquo;re the right
          partner to get you there. No pitch. No pressure. Just clarity.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7, delay: 0.6 }}
          className="mt-12 flex flex-col gap-5 md:flex-row md:items-center md:gap-10"
        >
          <motion.a
            href={siteConfig.cta.href}
            data-cursor="pointer"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.97 }}
            className="inline-flex items-center gap-3 self-start rounded-full bg-gold px-8 py-4 font-mono text-[11px] md:text-xs font-medium uppercase tracking-[0.1em] text-ink transition-colors hover:bg-periwinkle"
          >
            {siteConfig.cta.label}
            <span>↗</span>
          </motion.a>
          <a
            href="mailto:hello@studioe.agency"
            data-cursor="pointer"
            className="font-mono text-[11px] md:text-xs text-muted transition-colors hover:text-cream"
          >
            hello@studioe.agency
          </a>
        </motion.div>
      </div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={inView ? { opacity: 1 } : {}}
        transition={{ duration: 0.5, delay: 0.9 }}
        className="relative z-10 flex items-center gap-8"
      >
        {siteConfig.social.map((s) => (
          <a
            key={s.platform}
            href={s.href}
            data-cursor="pointer"
            className="font-mono text-[10px] md:text-xs uppercase tracking-widest text-muted/50 transition-colors hover:text-gold"
          >
            {s.platform}
          </a>
        ))}
      </motion.div>
    </section>
  );
}
