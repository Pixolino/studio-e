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
Wrap Hero in `<div className="sticky top-0 z-0">` and everything after in `<div className="relative z-10">`. Subsequent sections need opaque `bg-ink` backgrounds — they paint over the pinned hero as they scroll up.

### Scroll-Driven Approach Section
- 500vh container + `sticky top-0 h-screen` inner
- Pillar windows: P1=0.26, P2=0.72 in `scrollYProgress` space
- `getBoundingClientRect().top + window.scrollY` for correct absolute scroll targets (not `offsetTop`, which is parent-relative)
- `useState(() => motionValue.get() >= threshold)` to initialize state on mount when MotionValue may already be past the threshold — prevents "animation won't replay" regression after remount

### Hero Responsive Height
Use `h-[72dvh] md:h-[80dvh] lg:h-[85dvh] xl:h-dvh` with `mt-[6vh] xl:mt-auto` on the headline block. Avoid `min-h-dvh` (allows overflow) and `justify-between` (spreads elements too far on short viewports).