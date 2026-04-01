"use client";

import { useState, useEffect } from "react";
import { motion, useScroll, useMotionValueEvent, AnimatePresence } from "framer-motion";
import { siteConfig } from "@/lib/site";
import { lenisStore } from "@/lib/lenis-store";
import Logo from "@/components/ui/Logo";

export default function Navbar() {
  const [scrolled,  setScrolled]  = useState(false);
  const [menuOpen,  setMenuOpen]  = useState(false);
  const { scrollY } = useScroll();

  useMotionValueEvent(scrollY, "change", (v) => setScrolled(v > 60));

  // Pause / resume Lenis while menu is open
  useEffect(() => {
    const lenis = lenisStore.get();
    if (menuOpen) {
      lenis?.stop();
    } else {
      lenis?.start();
    }
    return () => lenis?.start();
  }, [menuOpen]);

  // Close on Escape
  useEffect(() => {
    if (!menuOpen) return;
    const handler = (e: KeyboardEvent) => e.key === "Escape" && setMenuOpen(false);
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [menuOpen]);

  const closeMenu = () => setMenuOpen(false);

  return (
    <>
      {/* ── Top bar ─────────────────────────────────────────────── */}
      <motion.header
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
        className={`fixed top-0 left-0 right-0 z-50 flex items-center px-8 py-5 transition-all duration-500 md:px-12 lg:px-16 ${
          scrolled || menuOpen ? "bg-ink/95 backdrop-blur-sm border-b border-gold/10" : ""
        }`}
      >
        {/* Logo */}
        <a
          href="/"
          data-cursor="pointer"
          className="shrink-0"
        >
          <Logo width={108} className="text-cream transition-colors duration-300 hover:text-gold" />
        </a>

        {/* Desktop nav */}
        <nav className="hidden flex-1 items-center justify-center gap-5 px-6 md:flex lg:gap-7 lg:px-10">
          {siteConfig.nav.map((item) => (
            <a
              key={item.label}
              href={item.href}
              data-cursor="pointer"
              className="group relative font-mono text-[11px] uppercase tracking-[0.1em] text-muted transition-colors duration-300 hover:text-cream"
            >
              {item.label}
              <span className="absolute -bottom-0.5 left-0 h-px w-0 bg-gold transition-all duration-300 group-hover:w-full" />
            </a>
          ))}
        </nav>

        {/* Desktop CTA */}
        <motion.a
          href={siteConfig.cta.href}
          data-cursor="pointer"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.97 }}
          className="hidden shrink-0 items-center gap-2 rounded-full border border-gold/40 px-5 py-2.5 font-mono text-[11px] font-medium uppercase tracking-[0.1em] text-gold transition-all duration-300 hover:border-gold hover:bg-gold hover:text-ink md:inline-flex"
        >
          {siteConfig.cta.label}
          <span>↗</span>
        </motion.a>

        {/* Hamburger — mobile only */}
        <button
          onClick={() => setMenuOpen((o) => !o)}
          data-cursor="pointer"
          aria-label={menuOpen ? "Close menu" : "Open menu"}
          className="relative ml-auto flex h-8 w-8 flex-col items-center justify-center gap-[6px] md:hidden"
        >
          {/* Line 1 */}
          <motion.span
            animate={menuOpen ? { y: 7, rotate: 45 } : { y: 0, rotate: 0 }}
            transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
            className="block h-px w-5 origin-center bg-cream"
          />
          {/* Line 2 */}
          <motion.span
            animate={menuOpen ? { opacity: 0, scaleX: 0 } : { opacity: 1, scaleX: 1 }}
            transition={{ duration: 0.18 }}
            className="block h-px w-5 origin-center bg-cream"
          />
          {/* Line 3 */}
          <motion.span
            animate={menuOpen ? { y: -7, rotate: -45 } : { y: 0, rotate: 0 }}
            transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
            className="block h-px w-5 origin-center bg-cream"
          />
        </button>
      </motion.header>

      {/* ── Mobile overlay ──────────────────────────────────────── */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            key="mobile-menu"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="fixed inset-0 z-40 flex flex-col justify-between overflow-hidden bg-ink grain-overlay px-8 pb-12 pt-28"
          >
            {/* Nav links */}
            <nav className="flex flex-col">
              {siteConfig.nav.map((item, i) => (
                <div key={item.label} className="overflow-hidden border-b border-gold/10">
                  <motion.a
                    href={item.href}
                    onClick={closeMenu}
                    data-cursor="pointer"
                    initial={{ y: "105%" }}
                    animate={{ y: 0 }}
                    transition={{
                      duration: 0.65,
                      delay: i * 0.07,
                      ease: [0.22, 1, 0.36, 1],
                    }}
                    className="flex items-baseline justify-between py-5"
                  >
                    <span className="font-display text-[11.5vw] font-light leading-none tracking-tight text-cream">
                      {item.label}
                    </span>
                    <span className="font-mono text-[10px] text-gold/40">
                      0{i + 1}
                    </span>
                  </motion.a>
                </div>
              ))}
            </nav>

            {/* Bottom — CTA + social */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.5, delay: 0.38 }}
              className="flex flex-col gap-8"
            >
              <a
                href={siteConfig.cta.href}
                onClick={closeMenu}
                data-cursor="pointer"
                className="inline-flex items-center gap-3 self-start rounded-full bg-gold px-7 py-3.5 font-mono text-[11px] font-medium uppercase tracking-[0.1em] text-ink transition-colors hover:bg-periwinkle"
              >
                {siteConfig.cta.label}
                <span>↗</span>
              </a>

              <div className="flex gap-6">
                {siteConfig.social.map((s) => (
                  <a
                    key={s.platform}
                    href={s.href}
                    data-cursor="pointer"
                    className="font-mono text-[10px] uppercase tracking-widest text-muted/50 transition-colors hover:text-gold"
                  >
                    {s.platform}
                  </a>
                ))}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
