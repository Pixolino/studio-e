"use client";

import { useState } from "react";
import { motion, useScroll, useMotionValueEvent } from "framer-motion";
import { siteConfig } from "@/lib/site";

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const { scrollY } = useScroll();

  useMotionValueEvent(scrollY, "change", (v) => {
    setScrolled(v > 60);
  });

  return (
    <motion.header
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.7, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
      className={`fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-8 py-5 transition-all duration-500 md:px-16 ${
        scrolled ? "bg-ink/95 backdrop-blur-sm border-b border-gold/10" : ""
      }`}
    >
      <a
        href="/"
        data-cursor="pointer"
        className="font-display text-xl font-medium tracking-tight text-cream"
      >
        Studio<span className="italic text-gold">&mdash;E</span>
      </a>

      <nav className="hidden items-center gap-8 md:flex">
        {siteConfig.nav.map((item) => (
          <a
            key={item.label}
            href={item.href}
            data-cursor="pointer"
            className="group relative text-sm tracking-wide text-muted transition-colors duration-300 hover:text-cream"
          >
            {item.label}
            <span className="absolute -bottom-0.5 left-0 h-px w-0 bg-gold transition-all duration-300 group-hover:w-full" />
          </a>
        ))}
      </nav>

      <motion.a
        href={siteConfig.cta.href}
        data-cursor="pointer"
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.97 }}
        className="hidden items-center gap-2 rounded-full border border-gold/40 px-5 py-2.5 text-sm font-medium text-gold transition-all duration-300 hover:border-gold hover:bg-gold hover:text-ink md:inline-flex"
      >
        {siteConfig.cta.label}
        <span>↗</span>
      </motion.a>
    </motion.header>
  );
}
