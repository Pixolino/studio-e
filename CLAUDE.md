@AGENTS.md

## Skills

The primary frontend design reference for this project is:
`.claude/skills/frontend-design/SKILL.md`

This skill overrides the generic `frontend-design` skill for all work on this codebase. It covers the full design system: color, typography, motion hierarchy, canvas patterns, naming conventions, and Studio—E-specific do/don't rules. Read it before building any new component, section, or UI element.

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
- Error/validation = `#B91C1C` (Crimson) — functional only, token `--se-error` / `text-error`. Used exclusively for form validation messages.

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

### Contact Section Custom Cursor
The Contact section (`id="contact"`) uses `data-cursor="hand"` on its root `<section>`. `CustomCursor` detects this via `element.closest("[data-cursor='hand']")` and swaps the dot+ring for a PNG image follower (`/public/cursor-hand.png`, rendered at 54px wide). The dot+ring fade out on entry, the hand fades in. `translateX: "-30%" translateY: "-10%"` offsets the image so the fingertip sits near the hotspot rather than the image corner.

### Contact Section Grid Layout
Gold (`bg-gold`) background. Two vertical lines at tablet `left-1/4`/`left-3/4`, desktop `lg:left-1/3`/`lg:left-2/3` (absolute, `w-0.5 bg-violet/30`), two horizontal lines (`h-0.5 bg-violet/30`) above and below the form. All four lines are `motion.div`s that scale in from different edges (`transformOrigin: top/bottom/left/right`) on scroll-into-view. Form is `mx-auto md:w-1/2 md:px-10 lg:w-1/3` — half-width on tablet, third-width on desktop, centered.

Tablet/desktop headline uses a single `<h2>` with `md:grid md:grid-cols-4 md:text-[6vw] lg:grid-cols-3 lg:text-[clamp(2rem,4.6vw,5.5rem)]`. Cells are placed with `col-start-N` plus `md:col-end-N lg:col-end-N` (NOT `col-span`). Words placed with explicit `col-start`/`row-start`. Mobile headline is a separate `md:hidden` h2 with stacked layout (`pt-12` to clear the absolute-positioned `/Get in Touch/` overline; `whitespace-nowrap pl-[12%]` on the YOUR VISION line so it stays on one line at small viewports). Overline lives inside the BRING cell using `flex items-center` + `flex-1 text-center`.

**Tailwind v4 `col-span` gotcha** — `col-span-N` generates the `grid-column: span N / span N` shorthand which OVERRIDES `grid-column-start` set by `col-start-2`. So `col-start-2 md:col-span-2` at the md breakpoint loses its start position and auto-places. Use `col-end-N` instead — it sets only `grid-column-end` and leaves `col-start` intact. This bug only manifests when there's no other cell forcing offsets (e.g. row 1's BRING auto-placed correctly because LET'S occupied col 1; rows 2/3's YOUR VISION and TO ended up in cols 1-2 instead of 2-3).

Form fades in (`opacity 0→1`) after all lines finish drawing — delay set to last_line_delay + last_line_duration.

### Contact Form Submission
API route at `src/app/api/contact/route.ts`. Runs two tasks in parallel via `Promise.allSettled`: (1) Resend email to both founders, (2) POST to Google Apps Script webhook. Sheets failure is non-fatal — email already delivered.

**Apps Script `Content-Type` gotcha**: must use `"text/plain"`, not `"application/json"`. Apps Script blocks CORS preflight requests triggered by `application/json`, causing silent failure. `text/plain` is a simple request (no preflight). The body is still `JSON.stringify({...})` — Apps Script reads it with `JSON.parse(e.postData.contents)`.

**Apps Script redirect**: Apps Script returns a 302 on POST. Use `redirect: "follow"` on the fetch — Node.js follows it automatically and the script executes correctly.

**Autofill + selection on gold background** (`globals.css`): browsers inject white autofill background overriding `bg-transparent`. Fix: `#contact input:-webkit-autofill { -webkit-box-shadow: 0 0 0 1000px var(--se-gold) inset; border-color: rgba(21,21,20,0.35) !important; transition: background-color 5000s }`. Global `::selection` (gold bg + ink text) is invisible on the gold Contact section — override with `#contact ::selection { background-color: var(--se-ink); color: var(--se-gold); }`.

**Copy in `site.ts`**: all form options and the success headline (`successHeadline`) live under `siteConfig.contactForm`. Never hardcode them in the component.

### Footer Design
`bg-ink` section. No `min-h` — height is driven by content (meta row + spacer `h-40 md:h-72` + wordmark) so the canvas height scales with viewport width and the ASCII art stays responsive. Giant `STUDIO—E` wordmark at `[font-size:19.5vw]` fills exactly 100vw.

**ASCII art canvas** (`/public/footer-ascii.txt`) rendered via `FooterAscii` component on a `<canvas>`. Positioned in `w-[70%] absolute top-0 right-0 h-full` container, scroll-animated upward via `useTransform(scrollYProgress, [0, 0.5], ["30%", "0%"])` on entry.

**Em-dash anchor** — a `<span ref={dashRef}>—</span>` wraps the dash in the wordmark. `build()` calls `cv.getBoundingClientRect()` and `dashRef.current.getBoundingClientRect()` fresh on every resize to compute `dashX` (dash center relative to canvas left edge). Art is centered horizontally on that point: `ox = dashX - ((minC + maxC) / 2 + 0.5) * CW`. This keeps the art pinned behind the dash at all viewport sizes. Do NOT use `min-h` on the footer — it decouples canvas height from viewport width and breaks the responsive scaling.

**Vertical sizing**: `fs = (h / rows) * 1.1` makes art ~110% of canvas height (10% bottom clip). `oy = h * 0.02 - minR * CH` pins art top to 2% from canvas top. Do NOT shift `oy` by a row count — `N * CH` can easily exceed the top padding and cause the top rows to render at negative y (clipped by `overflow-hidden`).

**Meta row responsive layout** — three elements: copyright (always left, in meta row flex), "South Florida" (in-flow below copyright below 1000px, `min-[1000px]:absolute min-[1000px]:left-1/2 min-[1000px]:-translate-x-1/2` centered above), socials (in-flow below South Florida below 700px, `min-[700px]:absolute` centered on dash above). `text-center` on South Florida is gated to `min-[1000px]:text-center` — without it, the stacked texts left-align correctly.

**Inline `left` on `relative` gotcha** — `left` DOES affect `position: relative` elements (it offsets from normal position). When socials switch from `absolute` to `relative` below 700px, the `left: dashCenterX` inline style would push them right. Gate it with a JS state: `const [socialsWide, setSocialsWide] = useState(false)` updated in a `ResizeObserver`, then `style={socialsWide ? { left: dashCenterX } : undefined}`.

**Measurement**: `useLayoutEffect` (not `useEffect`) fires before paint — no flash. A single `ResizeObserver` on the footer covers both `dashCenterX` and `socialsWide` updates.

### About Us Section
Dark `bg-ink` section with Approach-style nebula `GradientBg`. Inset border lines: mobile/tablet `top-8 left-8`, tablet-md `md:top-14 md:left-14`, desktop `lg:top-20 lg:left-20`.

**Responsive layout** — three breakpoint tiers, all switching at `lg:` (1024px):
- **Mobile/tablet (< 1024px)**: CSS float layout. Portrait is `float-right w-[40%] h-[46vw] -mt-4 ml-3` beside the overline+headline; body + tagline use `clear-right` to span full width below. Content wrapper: `ml-10 md:ml-16 pt-20 md:pt-28`.
- **Desktop (≥ 1024px)**: `lg:flex lg:flex-row`. Portrait is left column `lg:w-[40%] lg:mt-20`; text column is `lg:flex-1 lg:justify-center lg:px-40 lg:py-28`.

Portrait column uses `FoundersCanvas` — a single canvas rendering ASCII art + founders photo with a line-by-line L→R typewriter-erase wipe, scroll-driven (`start=0.32`, `end=0.50`).

### FoundersCanvas — Combined ASCII + Photo Canvas Wipe
`FoundersCanvas` in `AboutUs.tsx` renders both layers on one canvas and implements a per-row L→R erase:
- Loads ASCII from a `.txt` file; builds `pts[]` with `{x, y, ch, a, r, c}` (row + col stored for erasure logic)
- Loads photo as `new window.Image()` and computes `object-contain` geometry: `scale = Math.min(cw/iw, ch/ih)`, `pW = iw*scale`, `pH = ih*scale`
- Desktop (`isDesktop = window.innerWidth >= 1024`): `pX = cw - pW + cw*0.06` (right-aligned + rightward nudge), `pY = ch * 0.08` (offset down to align with text content). Mobile: `pX = cw - pW - cw*0.20` (leftward nudge), `pY = 0` (top-aligned beside header).
- `ox = pX`, `oy = pY` — ASCII maps 1:1 to photo pixel space so they always overlay exactly.
- Font size: `Math.min(pW / (totalCols * 0.55), pH / totalRows)` — scales with photo rect, consistent across all viewports.
- Each frame: `rowProgress = p * totalRows`; `fullRows = Math.floor(rowProgress)`; `partFrac = rowProgress - fullRows`
- Photo clip: `ctx.rect(0, oy + (minR+i)*CH, cw, CH)` for full rows; partial row up to cursor x; `ctx.clip()` + `ctx.drawImage()`
- ASCII skip: `ri < fullRows` (row done) or `ri === fullRows && (pt.c - minC) < partFrac * spanC`
- All mutable layout state lives in a single `useRef({...})` object (`canvasState`) — `buildLayout()` and `draw()` share it without stale closures

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
Use `h-dvh` on the sticky section (fills full viewport on all screen sizes — avoids white gap below hero and content cut-off on mobile). Add `bg-ink` to the wrapper div so the scroll-range area behind the sticky section is never bare. Use `mt-[6vh] xl:mt-auto` on the headline block. Avoid `min-h-dvh` (allows overflow) and `justify-between` (spreads elements too far on short viewports).

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
- Right label strip: `w-[17vw] min-w-[120px]` (NOT fixed `w-60`) so it scales with viewport. `pt-[18vh]` clears the fixed navbar and aligns the number with the `/The Approach/` overline; name uses `w-fit mx-auto` with words split into `<span className="block text-right">` for reliable two-line right-aligned centering
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