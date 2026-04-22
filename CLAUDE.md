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
- 500vh container + `sticky top-0 h-screen` inner
- Pillar windows: P1=0.26, P2=0.72 in `scrollYProgress` space
- `getBoundingClientRect().top + window.scrollY` for correct absolute scroll targets (not `offsetTop`, which is parent-relative)
- `useState(() => motionValue.get() >= threshold)` to initialize state on mount when MotionValue may already be past the threshold — prevents "animation won't replay" regression after remount

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