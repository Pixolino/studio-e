"use client";

import { useRef, useEffect } from "react";

interface AsciiGlitchProps {
  mouseRef: React.MutableRefObject<{ x: number; y: number }>;
}

const CHARS = Array.from(new Set("01001101<>{}[]|/\\!#@%*+=~^?;:アイウエカキ0xDEAD".split("")));

const CELL        = 22;
const FONT_SIZE   = 12;
const RADIUS      = 120;   // cursor hover base radius
const SPEED_MIN   = 180;   // ms – fastest char cycle
const SPEED_MAX   = 650;   // ms – slowest char cycle
const TRAIL_DECAY = 0.972;

const BURST_SPEED = 680;   // px/s wave expansion
const BURST_BAND  = 28;    // wave ring thickness px
const BURST_ALPHA = 0.88;  // peak alpha at wave front

const AMBIENT_RADIUS = 72; // touch idle source radius
const AMBIENT_MAX    = 6;  // max concurrent ambient sources

interface Cell {
  char:       string;
  next:       number;
  interval:   number;
  trailAlpha: number;
  bias:       number;
}

interface Burst {
  x: number;
  y: number;
  startTs: number;
  maxRadius: number;
}

interface AmbientSource {
  x: number;
  y: number;
  startTs: number;
  holdDuration: number;
}

/** Angular blob shape — abs(sin) cusps + Chebyshev-blended dist */
function blobRadius(angle: number, t: number): number {
  return (
    RADIUS
    + Math.abs(Math.sin(angle * 2.1 + t * 0.75)) * 28
    - Math.abs(Math.cos(angle * 3.4 - t * 0.55)) * 20
    + Math.sin(angle * 5.5 + t * 0.35) * 11
    - Math.abs(Math.sin(angle * 8.1 - t * 0.2)) * 7
  );
}

export default function AsciiGlitch({ mouseRef }: AsciiGlitchProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let cells: Cell[] = [];
    let cols = 0;
    let rows = 0;
    let raf  = 0;
    let dpr  = 1;
    let cw   = 0;
    let ch   = 0;

    const bursts: Burst[]          = [];
    const ambients: AmbientSource[] = [];
    let nextAmbient  = performance.now() + 300 + Math.random() * 400;
    // Re-evaluated on every resize: ambient mode = touch device OR narrow viewport
    let isAmbientMode = false;

    function resize() {
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      cw = canvas.offsetWidth;
      ch = canvas.offsetHeight;
      canvas.width  = cw * dpr;
      canvas.height = ch * dpr;
      ctx.scale(dpr, dpr);
      const wasAmbient = isAmbientMode;
      isAmbientMode = window.matchMedia("(pointer: coarse)").matches || cw < 1024;
      // Clear orphaned ambient sources when switching back to desktop mode
      if (wasAmbient && !isAmbientMode) ambients.length = 0;
      buildCells(cw, ch);
    }

    function buildCells(w: number, h: number) {
      cols = Math.ceil(w / CELL) + 1;
      rows = Math.ceil(h / CELL) + 1;
      const now = performance.now();
      cells = Array.from({ length: cols * rows }, () => {
        const interval = SPEED_MIN + Math.random() * (SPEED_MAX - SPEED_MIN);
        return {
          char:       CHARS[Math.floor(Math.random() * CHARS.length)],
          next:       now + Math.random() * interval,
          interval,
          trailAlpha: 0,
          bias:       (Math.random() - 0.5) * 24,
        };
      });
    }

    /**
     * Light up cells in a blob-shaped area around (ox, oy).
     * scale lets ambient/cursor use the same shape at different sizes.
     */
    function activateArea(
      ox: number, oy: number,
      scale: number,          // 1 = full RADIUS, <1 = smaller
      maxAlpha: number,
      t: number, ts: number,
      fastCycle = false,
    ) {
      const scan = RADIUS * scale + 55;
      const minC = Math.max(0,        Math.floor((ox - scan) / CELL));
      const maxC = Math.min(cols - 1, Math.ceil ((ox + scan) / CELL));
      const minR = Math.max(0,        Math.floor((oy - scan) / CELL));
      const maxR = Math.min(rows - 1, Math.ceil ((oy + scan) / CELL));

      for (let r = minR; r <= maxR; r++) {
        for (let c = minC; c <= maxC; c++) {
          const x  = c * CELL + CELL * 0.5;
          const y  = r * CELL + CELL * 0.5;
          const dx = x - ox;
          const dy = y - oy;

          const eucDist  = Math.sqrt(dx * dx + dy * dy);
          const chebDist = Math.max(Math.abs(dx), Math.abs(dy));
          const dist     = eucDist * 0.4 + chebDist * 0.6;
          const angle    = Math.atan2(dy, dx);

          const cell = cells[r * cols + c];
          const effR = blobRadius(angle, t) * scale + cell.bias;
          if (dist >= effR) continue;

          const prox  = Math.max(0, 1 - dist / effR);
          cell.trailAlpha = Math.max(cell.trailAlpha, prox * prox * maxAlpha);

          if (ts >= cell.next) {
            cell.char = CHARS[Math.floor(Math.random() * CHARS.length)];
            const speedFactor = fastCycle ? 0.25 : Math.max(0.38, 1 - prox * 0.62);
            cell.next = ts + cell.interval * speedFactor;
          }
        }
      }
    }

    function draw(ts: number) {
      raf = requestAnimationFrame(draw);
      ctx.clearRect(0, 0, cw, ch);

      const mx = mouseRef.current.x;
      const my = mouseRef.current.y;
      const t  = ts * 0.0007;

      // ── Phase 1: decay all trails ──────────────────────────────────
      for (const cell of cells) {
        if (cell.trailAlpha > 0) {
          cell.trailAlpha *= TRAIL_DECAY;
          if (cell.trailAlpha < 0.004) cell.trailAlpha = 0;
        }
      }

      // ── Phase 2: cursor hover (non-touch / desktop) ─────────────────
      if (!isAmbientMode && mx >= 0) {
        activateArea(mx, my, 1, 0.68, t, ts);
      }

      // ── Phase 3: burst waves (all devices) ─────────────────────────
      for (let b = bursts.length - 1; b >= 0; b--) {
        const burst = bursts[b];
        const waveR = (ts - burst.startTs) * BURST_SPEED / 1000;

        if (waveR > burst.maxRadius) { bursts.splice(b, 1); continue; }

        const innerR = Math.max(0, waveR - BURST_BAND);
        const outerR = waveR;
        const scanR  = outerR + 2;

        const minC = Math.max(0,        Math.floor((burst.x - scanR) / CELL));
        const maxC = Math.min(cols - 1, Math.ceil ((burst.x + scanR) / CELL));
        const minR = Math.max(0,        Math.floor((burst.y - scanR) / CELL));
        const maxR = Math.min(rows - 1, Math.ceil ((burst.y + scanR) / CELL));

        for (let r = minR; r <= maxR; r++) {
          for (let c = minC; c <= maxC; c++) {
            const x    = c * CELL + CELL * 0.5;
            const y    = r * CELL + CELL * 0.5;
            const dist = Math.sqrt((x - burst.x) ** 2 + (y - burst.y) ** 2);

            if (dist < innerR || dist > outerR) continue;

            // Alpha ramps from 0 at inner edge → BURST_ALPHA at wave front
            const prox     = (dist - innerR) / BURST_BAND;
            const wavAlpha = prox * prox * BURST_ALPHA;
            const cell     = cells[r * cols + c];

            if (wavAlpha > cell.trailAlpha) {
              cell.trailAlpha = wavAlpha;
              cell.char = CHARS[Math.floor(Math.random() * CHARS.length)];
              cell.next = ts + cell.interval * 0.22; // frantic cycling at wave front
            }
          }
        }
      }

      // ── Phase 4: ambient idle sources (touch devices only) ──────────
      if (isAmbientMode) {
        if (ts >= nextAmbient && ambients.length < AMBIENT_MAX) {
          ambients.push({
            x: CELL * 2 + Math.random() * (cw - CELL * 4),
            y: CELL * 2 + Math.random() * (ch - CELL * 4),
            startTs: ts,
            holdDuration: 900 + Math.random() * 1400,
          });
          nextAmbient = ts + 350 + Math.random() * 500;
        }

        for (let s = ambients.length - 1; s >= 0; s--) {
          const src = ambients[s];
          const age = ts - src.startTs;
          if (age > src.holdDuration) { ambients.splice(s, 1); continue; }

          const fadeIn  = Math.min(1, age / 480);
          const fadeOut = Math.min(1, (src.holdDuration - age) / 380);
          const env     = fadeIn * fadeOut;

          activateArea(src.x, src.y, AMBIENT_RADIUS / RADIUS, 0.78 * env, t, ts);
        }
      }

      // ── Phase 5: draw all visible cells ────────────────────────────
      ctx.font         = `${FONT_SIZE}px "Geist Mono", ui-monospace, monospace`;
      ctx.textBaseline = "middle";
      ctx.textAlign    = "center";

      for (let i = 0; i < cells.length; i++) {
        const cell = cells[i];
        if (cell.trailAlpha < 0.004) continue;

        const c = i % cols;
        const r = (i / cols) | 0;
        const x = c * CELL + CELL * 0.5;
        const y = r * CELL + CELL * 0.5;

        // Slow trail cycling, decelerates as it fades
        if (ts >= cell.next) {
          cell.char = CHARS[Math.floor(Math.random() * CHARS.length)];
          cell.next = ts + cell.interval * (1 + (1 - cell.trailAlpha) * 2.5);
        }

        ctx.shadowColor = `rgba(178, 180, 31, ${cell.trailAlpha * 0.55})`;
        ctx.shadowBlur  = 5;
        ctx.fillStyle   = `rgba(178, 180, 31, ${cell.trailAlpha})`;
        ctx.fillText(cell.char, x, y);
      }

      ctx.shadowBlur = 0;
    }

    resize();
    raf = requestAnimationFrame(draw);

    const ro = new ResizeObserver(resize);
    ro.observe(canvas);

    // Burst on click/tap — on parent section since canvas is pointer-events-none
    const section = canvas.parentElement;

    function onInteract(e: Event) {
      const rect = canvas.getBoundingClientRect();
      let clientX: number, clientY: number;

      if (e instanceof TouchEvent) {
        clientX = e.changedTouches[0].clientX;
        clientY = e.changedTouches[0].clientY;
      } else {
        clientX = (e as MouseEvent).clientX;
        clientY = (e as MouseEvent).clientY;
      }

      bursts.push({
        x:         clientX - rect.left,
        y:         clientY - rect.top,
        startTs:   performance.now(),
        maxRadius: Math.sqrt(cw * cw + ch * ch) + 50,
      });
    }

    section?.addEventListener("click",    onInteract);
    section?.addEventListener("touchend", onInteract);

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      section?.removeEventListener("click",    onInteract);
      section?.removeEventListener("touchend", onInteract);
    };
  }, [mouseRef]);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden
      className="pointer-events-none absolute inset-0 h-full w-full"
    />
  );
}
