@AGENTS.md

## Brand & Messaging
Always follow the tone, voice, and messaging guidelines in BRAND.md before writing any copy.
Always follow the color system in COLORS.md for all UI and frontend work.

## Frontend Design
When building any frontend, UI component, or webpage:
- Prioritize distinctive, production-grade design — avoid generic AI aesthetics
- Choose bold, intentional aesthetic directions (typography, color, motion, layout)
- Use unexpected, characterful font choices — never Inter, Roboto, Arial, or system fonts
- Commit to a cohesive color palette with dominant colors and sharp accents
- Add meaningful animations and micro-interactions
- Create atmosphere with backgrounds, textures, gradients, and depth
- Use asymmetry, overlap, and grid-breaking layouts
- Every design should feel unique and context-specific

## Custom Commands
When I say "ship it" — update CLAUDE.md with new project learnings, 
update README.md to reflect current state, then stage, commit with a 
descriptive conventional commit message, and push to main.

## Color System
The canonical color reference is COLORS.md. When updating colors:
- Tailwind v4 tokens live in `@theme inline` in `globals.css` as `--color-*`
- CSS custom properties mirror them in `:root` as `--se-*`
- Canvas-drawn elements (AsciiGlitch, HeroGrid, Approach SVGs) use hardcoded `rgba()` — update manually when palette changes
- Current gold/olive = `rgba(178, 180, 31, ...)` (#B2B41F)

## Logo
SVG wordmark at `public/logo.svg`. Inline React component at `src/components/ui/Logo.tsx` using `currentColor`. Default render: 108px wide in Navbar.

## Learned Patterns

### SVG Rotation in Framer Motion
To rotate an SVG group around its visual center, always use both:
- `transformBox: "fill-box"` — makes transform-origin relative to element's bounding box, not the CSS viewport
- `transformOrigin: "center"` — then "center" resolves correctly within that box

If the group's content is asymmetric (e.g. only an arc in one quadrant), add an invisible `<circle fill="none" stroke="none"/>` centered on the desired pivot to symmetrize the bbox so "center" lands on the right point.

### Sticky Hero / Sections Overlay Effect
Hero owns its own scroll-lock wrapper internally (`<div ref={wrapperRef} className="relative h-[150dvh]">`). The section inside is `sticky top-0`. In `page.tsx`, wrap Hero in `<div className="relative z-0">` and subsequent sections in `<div className="relative z-10">` — they paint over the pinned hero as they scroll up. Do NOT add a sticky wrapper in `page.tsx`; Hero handles it.

### Hero Scroll-Progress Tracking
Use `useMotionValue` + `useMotionValueEvent(scrollY, "change")` to build a single `scrollProgress` MotionValue (0→1) that all hero effects share. Compute `maxScroll` as `el.offsetHeight` (full wrapper height) so progress reaches 1 when the next section's top hits the top of the viewport. With fade ranges ending at ~0.93, text/animation completes when the marquee is ~90% up the viewport. Drive all effects from this single value so they complete in sync.

### ASCII Art Canvas Centering (MagnoliaScroll)
To align two ASCII art files so they morph in-place on the same canvas, use **union bounding box** (not centroid):
- `unionMinC/MaxC/MinR/MaxR` across both arts → shared `ox/oy` so identical `(r,c)` maps to the same canvas pixel.
- `sweepFrac = (p.r - unionMinR) / rowSpan` — shared sweep timeline for both arts.
- Top→bottom sweep (bud→bloom): `prog` increases 0→1. Bottom→top (bloom→bud): `prog` decreases 1→0, same math naturally reverses direction.
- Click animation uses Framer Motion `animate()` on a `useMotionValue(0)` — MotionValue holds its last animated-to value so bloom state persists at rest without snapping back to scroll progress.
- `clickStateRef.current` set immediately in `triggerClick()` (not at animation end) so toggle logic is always correct.
- `transitioning = prog > 0.01 && prog < 0.99` gates glitch chars — prevents glitch showing at rest states.

### Scroll-Driven Approach Section
- 320vh container + `sticky top-0 h-screen` inner
- Pillar boundaries P1/P2 align with T1E/T2S respectively — see ButterflyMorph timing constants
- `getBoundingClientRect().top + window.scrollY` for correct absolute scroll targets (not `offsetTop`, which is parent-relative)
- `useState(() => motionValue.get() >= threshold)` to initialize state on mount when MotionValue may already be past the threshold — prevents "animation won't replay" regression after remount

### Scroll-Driven Section Header Animation
For sections with a two-part headline that slides in from opposite sides on scroll:
```tsx
const { scrollYProgress } = useScroll({ target: sectionRef, offset: ["start end", "start 0.25"] });
const xLeft  = useTransform(scrollYProgress, [0, 1], ["-110%", "0%"]);
const xRight = useTransform(scrollYProgress, [0, 1], ["110%",  "0%"]);
// In JSX — use style prop, NOT initial/animate:
<motion.span style={{ x: line.x }}>
```
Wrap each line in `overflow-hidden` to clip the off-screen slide. Use `-110%/110%` (not `-100%/100%`) so the translate starts fully outside the clip zone even for long lines. `style={{ x }}` is required — `initial={{ x }}` only fires once and won't track the MotionValue.

### Services Section CTA Button Style
Violet text + semi-transparent violet border at rest. Olive (`bg-gold`) background + ink text on hover. Arrow `→` in its own `<span>` with `transition-transform group-hover/btn:translate-x-1.5` for widening gap effect. Use `group/btn` (scoped group name) to avoid conflicts with parent `group` on the accordion button row.

### Contact Section Grid Layout
Gold (`bg-gold`) background. Two vertical lines at `left-1/3` and `left-2/3` (absolute, `w-0.5 bg-violet/30`), two horizontal lines (`h-0.5 bg-violet/30`) above and below the form. All four lines are `motion.div`s that scale in from different edges (`transformOrigin: top/bottom/left/right`) on scroll-into-view. Form is `mx-auto md:w-1/3 md:px-10`, centered in the middle column.

Desktop headline uses `md:grid md:grid-cols-3` aligned to the section's full width (no horizontal padding on header container) with `fontSize: clamp(2rem, 4.6vw, 5.5rem)` so "YOUR VISION" fits in 1/3 column. Words placed with explicit `col-start`/`row-start`. Mobile headline is a separate `md:hidden` h2 with stacked layout. Overline lives inside the center column alongside BRING using `flex items-center` + `flex-1 text-center`.

Form fades in (`opacity 0→1`) after all lines finish drawing — delay set to last_line_delay + last_line_duration.

### Footer Design
Full-height `bg-ink` section with `min-h-[55vh]`. Giant `STUDIO—E` wordmark in `text-gold` at the bottom (`leading-none`, `font-size: clamp(3.5rem, 16.5vw, 22rem)`). Hand ASCII art (`/hand-ascii.png`) positioned `absolute bottom-0 right-0 h-full w-auto` — `h-full w-auto` on the `<img>` (not object-fit) ensures the hand fills the full section height with natural proportions and wrist touches the bottom edge. `filter: invert(1)` + `mix-blend-mode: screen` makes the white PNG background disappear on the dark section.

### About Us Section
Dark `bg-ink` section with Approach-style nebula `GradientBg` (copy the blob array + component). Same inset border lines as Services (`top-8 left-8` → `top-14 left-14`). Split layout: left 40% portrait column + right `flex-1` text column, both inside the `ml-10 md:ml-16` content wrapper (so both are right of the left inset line). Body text: `text-cream`. Tagline: `text-gold`.

Portrait column uses `FoundersCanvas` — a single canvas that renders both the ASCII art (from `/founders-ascii.txt`) and the founders photo (from `/founders.png`) and animates a line-by-line left-to-right typewriter-delete transition between them, scroll-driven. `start`/`end` props on `FoundersCanvas` are the `scrollYProgress` thresholds (from `useScroll` with `offset: ["start end", "end start"]`) at which the wipe begins and completes.

### FoundersCanvas — Combined ASCII + Photo Canvas Wipe
`FoundersCanvas` in `AboutUs.tsx` renders both layers on one canvas and implements a per-row L→R erase:
- Loads ASCII from a `.txt` file; builds `pts[]` with `{x, y, ch, a, r, c}` (row + col stored for erasure logic)
- Loads photo as `new window.Image()` and computes `object-contain` + `object-right-bottom` geometry manually: `scale = Math.min(cw/iw, ch/ih)`, `drawX = cw - drawW`, `drawY = ch - drawH`
- Each frame: `rowProgress = p * totalRows`; `fullRows = Math.floor(rowProgress)`; `partFrac = rowProgress - fullRows`
- Photo clip: `ctx.rect(0, rowTop, cw, CH)` for fully erased rows; `ctx.rect(0, rowTop, cursorX, CH)` for the partial row, then `ctx.clip()` + `ctx.drawImage()`
- ASCII skip: `ri < fullRows` (row done) or `ri === fullRows && (pt.c - minC) < partFrac * spanC` (char passed by cursor)
- All mutable layout state lives in a single `useRef({...})` object (`S`) so `buildLayout()` and `draw()` share it without stale closures
- ASCII horizontal nudge: `ox = cw/2 - center*CW + cw*0.09 - 1.5*CW`; vertical: `oy = ch - (maxR+1)*CH + ch*0.01 - CH`

### Canvas RAF Performance — IntersectionObserver Pause Pattern
All canvas draw loops (`MagnoliaScroll`, `ApproachAscii`, `ButterflyMorph`, `ServicesAscii`) use this pattern to pause when off-screen:
```ts
let visible = true;
const io = new IntersectionObserver(([e]) => {
  visible = e.isIntersecting;
  if (visible && rafRef.current === 0) rafRef.current = requestAnimationFrame(draw);
}, { rootMargin: "200px" });
io.observe(cv);

function draw() {
  if (!visible) { rafRef.current = 0; return; }
  rafRef.current = requestAnimationFrame(draw);
  // ... draw code
}
// cleanup: io.disconnect()
```
`rootMargin: "200px"` starts the loop 200px before the canvas enters view so it's ready on arrival. `rafRef.current = 0` in the early-return signals the IO callback to restart the loop.

### ButterflyMorph (Approach ASCII animation)
Three-frame scroll-driven morph (`approach-precision.txt` → `approach-fluidity.txt` → `approach-partnership.txt`) rendered on a canvas using union bounding box so all frames share the same coordinate space.

**Current timing constants (320vh container):**
- `T1S=0.15, T1E=0.37, T2S=0.51, T2E=0.74`
- `P1=0.37` (=T1E): label flips to Technical Fluidity when butterfly ARRIVES at frame 1
- `P2=0.51` (=T2S): label flips to Direct Partnership when butterfly STARTS leaving frame 1
- `PILLAR_TARGETS=[0.05, 0.38, 0.75]`: scroll jump targets land just past T1E/T2E so butterfly is complete on arrival
- Override animation `duration: 0.85`, Lenis `duration: 0.9`

**Key patterns:**
- `getBlend(s)` maps `scrollYProgress` 0→1 to a blend value 0→2 with two transition windows (T1S/T1E, T2S/T2E). Pillar targets land just past T1E/T2E so the image is complete on arrival.
- `sweepPos = frac * SWEEP_TOP` — sweep wave travels from row 0 to `SWEEP_TOP` (currently `0.638`) as `frac` goes 0→1, so the animation completes at exactly `frac=1` (not earlier). This makes scroll-driven and click-driven timings stay in sync.
- `SWEEP_TOP` is a spatial cutoff: rows below it (the hand) skip the source frame entirely and show the destination immediately at full opacity — hand never gets swept since it's identical across all frames.
- Exposed via `forwardRef` + `useImperativeHandle` (`jumpTo(frame)`). Clicking a pillar calls `jumpTo(index)` which animates `overrideBlend` directly to the target frame, bypassing scroll so non-adjacent jumps (e.g. pillar 0 → pillar 2) don't flash through the intermediate frame.
- `overrideActive` ref gates whether draw loop uses override or scroll-driven blend. Cleared in `onComplete` — by then Lenis has arrived and `getBlend(target)` matches the override value, so handoff is seamless.
- `isJumping` / `isJumpingRef` — state + matching ref for stale-closure safety. Cleared via Lenis `onComplete` callback (not a fixed timeout) so descriptions unlock exactly when scroll settles.
- `finished0` initialized `true` (pillar 0 is the default; butterfly frame 0 is always ready). `finished1/2` set immediately in `scrollToPillar` for the target index — do NOT rely solely on scroll events crossing `PILLAR_TARGETS` thresholds, which can fail due to floating-point imprecision.
- `activeRef` keeps a ref-mirrored copy of `active` state. `useMotionValueEvent` reads `activeRef.current` (always fresh) to avoid stale-closure double-flip bugs where React render timing causes `active` 0→1→0→1 on threshold crossing.
- During a click-jump (`isJumpingRef.current === true`): event handler skips all active updates — `active` is already set to the target index and must not be overridden by Lenis scrolling through intermediate thresholds.
- Small hysteresis (`HYSTERESIS = 0.01`): on natural scroll, `active` only flips backward if `v` retreats more than 0.01 below the threshold — absorbs trackpad momentum micro-bounces without perceptible label delay. Hysteresis is bypassed during jumps (`isJumpingRef`).
- Stable state (not transitioning): full constant alpha, no breathing animation.
- `SWEEP_TOP` formula: `(cutoff_row - unionMinR) / rowSpan`. Current value covers up to row 73.5 (butterfly bottom in frame 3), leaving the hand rows (86+) untouched.

### Hero Responsive Height
Use `h-[72dvh] md:h-[80dvh] lg:h-[85dvh] xl:h-dvh` with `mt-[6vh] xl:mt-auto` on the headline block. Avoid `min-h-dvh` (allows overflow) and `justify-between` (spreads elements too far on short viewports).

### Type Scale
- **Section overlines** (`/Label/`, `font-mono uppercase tracking-[0.25em]`): `text-sm` (14px). Always all-caps via CSS, always wrapped in `/forward slashes/`.
- **Nav, buttons, UI labels** (`font-mono uppercase`): `text-[10px] md:text-xs` — 10–11px mobile, 12px desktop minimum.
- **Body paragraphs**: `text-sm md:text-base` — 14px mobile, 16px desktop.
- **H2 section headings**: `text-5xl md:text-6xl lg:text-7xl` or viewport-relative for hero/contact.
- **H1 hero**: `text-[10vw] md:text-[7.5vw] xl:text-[clamp(4rem,7.5vw,8.5rem)]`.

### Decode / Glitch Text Effects
- **On-hover decode** (`DecodeText`): `setInterval` at 25ms, `iteration += 1.2` per tick, resolves left-to-right in ~250ms. Used on "See our work" in Hero.
- **Periodic glitch** (`PeriodicGlitch`): fires on first `inView`, then every 6s. Used on section overlines (currently About). Fires immediately on scroll-into-view via `useEffect([inView])`.

### Arrow Rotation on CTA Hover
For `↗` arrows that should rotate to point right on hover: wrap the character in `<span className="inline-block transition-transform duration-300 group-hover:rotate-45">↗</span>`. The parent needs `group` class. `rotate-45` (clockwise) takes `↗` (45°) to `→` (90°). Do NOT use `-rotate-45` (that goes to `↑`).

### Marquee Interactivity
Marquee items are `<a>` tags linking to `#service-{slug}` anchors on service cards. The outer container has `group` and the inner track has `group-hover:[animation-play-state:paused]` to freeze scrolling on hover. Items have `hover:scale-110 hover:text-gold`. Service card IDs are set via `id={\`service-\${service.name.toLowerCase().replace(/\\s+/g, "-")}\`}`.

### PeriodicGlitch Shared Component
Shared `src/components/ui/PeriodicGlitch.tsx` — fires on first `inView`, then every 6s. Used on all section overlines (`/The Approach/`, `/Services/`, `/Selected Work/`, `/The Studio/`, `/Start a conversation/`). Always pass both `text` and `inView` props.

### Approach Section Layout
- Left panel: padding removed from container, applied per-row (`px-16 lg:px-24` on buttons) so `border-t` lines run edge-to-edge and touch the vertical separator
- Single active-only divider: `border-t` conditionally applied only to the active pillar button — one line tracks above the current pillar
- Right label strip: `w-60`, `pt-[18vh]` clears the fixed navbar and aligns the number with the `/The Approach/` overline; name uses `w-fit mx-auto` with words split into `<span className="block text-right">` for reliable two-line right-aligned centering
- Fluid nebula background: 5 radial-gradient blobs at `z-0`, content panels at `z-10`. Blobs use negative `delay` values to stagger phase so they never pulse in sync. `filter: blur(90px)` on the container.

### Approach Section Color Conventions
- Overline `/The Approach/`: `text-gold/80` (olive)
- Pillar titles (Artful Precision, etc.): `text-gold` (olive)
- Pillar numbers (01/02/03) left panel: `text-periwinkle/60`
- Pillar dash `—`: `bg-periwinkle`
- Divider lines: `border-violet/40`
- Right strip number: `text-periwinkle`
- Right strip name: `text-periwinkle`
- Body/description text: `text-cream`