"use client";

import { useRef } from "react";
import { motion, useInView } from "framer-motion";
import { siteConfig } from "@/lib/site";

export default function Footer() {
  const ref = useRef<HTMLElement>(null);
  const inView = useInView(ref, { once: true, margin: "-60px" });

  return (
    <footer
      ref={ref}
      className="relative flex min-h-[55vh] flex-col overflow-hidden bg-ink md:min-h-[62vh]"
    >
      {/* Meta row */}
      <div className="relative z-10 flex flex-col gap-4 px-8 pt-12 md:flex-row md:items-center md:justify-between md:px-14 md:pt-14">
        <p className="font-mono text-[10px] uppercase tracking-[0.1em] text-muted/40 md:text-xs">
          © {new Date().getFullYear()} Studio—E. All rights reserved.
        </p>
        <p className="font-mono text-[10px] tracking-[0.08em] text-periwinkle/50 md:text-xs">
          South Florida
        </p>
        <div className="flex gap-6">
          {siteConfig.social.map((s) => (
            <a
              key={s.platform}
              href={s.href}
              data-cursor="pointer"
              className="font-mono text-[10px] uppercase tracking-[0.1em] text-muted/40 transition-colors hover:text-periwinkle md:text-xs"
            >
              {s.platform}
            </a>
          ))}
        </div>
      </div>

      {/* Spacer */}
      <div className="flex-1" />

      {/* Hand ASCII — bottom-right, full footer height */}
      <div
        aria-hidden
        className="pointer-events-none absolute bottom-0 right-0 h-full select-none overflow-hidden"
      >
        <img
          src="/hand-ascii.png"
          alt=""
          className="block h-full w-auto"
          style={{ filter: "invert(1)", mixBlendMode: "screen" }}
        />
      </div>

      {/* STUDIO—E wordmark */}
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={inView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
        className="relative z-10 overflow-hidden px-6 md:px-10"
      >
        <p
          className="font-display font-medium uppercase leading-none tracking-tight text-gold"
          style={{ fontSize: "clamp(3.5rem, 16.5vw, 22rem)" }}
        >
          STUDIO—E
        </p>
      </motion.div>
    </footer>
  );
}
