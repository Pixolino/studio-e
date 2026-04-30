"use client";

import { useRef, useState, useEffect } from "react";

const GLITCH_CHARS = "01<>{}[]|/\\!#@%*+=~^?;:";

/** Scramble-decodes text on first inView, then repeats every 6 s. */
export default function PeriodicGlitch({ text, inView }: { text: string; inView: boolean }) {
  const [display, setDisplay] = useState(text);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const tickRef = useRef<ReturnType<typeof setInterval> | null>(null);

  function runGlitch() {
    let iteration = 0;
    clearInterval(tickRef.current!);
    tickRef.current = setInterval(() => {
      setDisplay(
        text.split("").map((ch, i) => {
          if (ch === " ") return " ";
          if (i < iteration) return ch;
          return GLITCH_CHARS[Math.floor(Math.random() * GLITCH_CHARS.length)];
        }).join("")
      );
      iteration += 1.5;
      if (iteration > text.length) {
        clearInterval(tickRef.current!);
        setDisplay(text);
      }
    }, 30);
  }

  useEffect(() => {
    if (inView) runGlitch();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [inView]);

  useEffect(() => {
    intervalRef.current = setInterval(runGlitch, 6000);
    return () => {
      clearInterval(intervalRef.current!);
      clearInterval(tickRef.current!);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [text]);

  return <span>{display}</span>;
}
