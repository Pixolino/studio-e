"use client";

import { useEffect, useState } from "react";
import { motion, useMotionValue, useSpring } from "framer-motion";

export default function CustomCursor() {
  const [hovered, setHovered] = useState(false);
  const [visible, setVisible] = useState(false);

  const cursorX = useMotionValue(-100);
  const cursorY = useMotionValue(-100);

  const springConfig = { damping: 25, stiffness: 250, mass: 0.5 };
  const x = useSpring(cursorX, springConfig);
  const y = useSpring(cursorY, springConfig);

  useEffect(() => {
    // Hide on touch devices
    const isTouch = window.matchMedia("(pointer: coarse)").matches;
    if (isTouch) return;

    const moveCursor = (e: MouseEvent) => {
      cursorX.set(e.clientX);
      cursorY.set(e.clientY);
      if (!visible) setVisible(true);
    };

    const handleOver = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (
        target.closest("a, button, [data-cursor='pointer'], input, textarea, select, label[for]")
      ) {
        setHovered(true);
      }
    };

    const handleOut = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (
        target.closest("a, button, [data-cursor='pointer'], input, textarea, select, label[for]")
      ) {
        setHovered(false);
      }
    };

    const handleLeave = () => setVisible(false);
    const handleEnter = () => setVisible(true);

    window.addEventListener("mousemove", moveCursor);
    document.addEventListener("mouseover", handleOver);
    document.addEventListener("mouseout", handleOut);
    document.documentElement.addEventListener("mouseleave", handleLeave);
    document.documentElement.addEventListener("mouseenter", handleEnter);

    return () => {
      window.removeEventListener("mousemove", moveCursor);
      document.removeEventListener("mouseover", handleOver);
      document.removeEventListener("mouseout", handleOut);
      document.documentElement.removeEventListener("mouseleave", handleLeave);
      document.documentElement.removeEventListener("mouseenter", handleEnter);
    };
  }, [cursorX, cursorY, visible]);

  // Don't render on server or touch devices
  if (typeof window !== "undefined" && window.matchMedia("(pointer: coarse)").matches) {
    return null;
  }

  return (
    <>
      {/* Dot */}
      <motion.div
        className="pointer-events-none fixed top-0 left-0 z-[9999] rounded-full bg-gold"
        style={{
          width: 8,
          height: 8,
          x,
          y,
          translateX: "-50%",
          translateY: "-50%",
          opacity: visible ? 1 : 0,
        }}
      />

      {/* Ring */}
      <motion.div
        className="pointer-events-none fixed top-0 left-0 z-[9999] rounded-full border-[1.5px] border-gold"
        style={{
          width: 36,
          height: 36,
          x,
          y,
          translateX: "-50%",
          translateY: "-50%",
          opacity: visible ? 1 : 0,
        }}
        animate={{
          scale: hovered ? 1.5 : 1,
          borderColor: hovered ? "var(--se-gold-light)" : "var(--se-gold)",
        }}
        transition={{ duration: 0.2, ease: "easeOut" }}
      />
    </>
  );
}
