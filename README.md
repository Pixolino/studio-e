# Studio—E

Award-worthy homepage for Studio—E, a multi-disciplinary brand studio based in South Florida.

## Stack

- **Framework**: Next.js 16 (App Router)
- **Styling**: Tailwind CSS v4
- **Animation**: Framer Motion v12
- **Smooth Scroll**: Lenis
- **3D**: React Three Fiber (available, not yet used)

## Brand Palette

| Token | Hex | Use |
|---|---|---|
| `--se-ink` | `#151514` | Dark background |
| `--se-charcoal` | `#3A3A37` | Secondary UI / dark surfaces |
| `--se-cream` | `#F7F5F2` | Primary text on dark bg |
| `--se-cream-mid` | `#E6E6DB` | Light background (Parchment) |
| `--se-periwinkle` | `#D0D1FF` | Soft accent, hover states, tags |
| `--se-gold` | `#B2B41F` | CTA & accent (Olive) |
| `--se-violet` | `#422DA2` | Eyebrow / label text (light bg only) |
| `--se-muted` | `#888888` | Body / supporting text |

## Sections

| Section | File | Notes |
|---|---|---|
| Navbar | `src/components/layout/Navbar.tsx` | Fixed, scrolled state, mobile overlay |
| Hero | `src/components/sections/Hero.tsx` | Scroll-locked (150dvh wrapper), line reveals, MagnoliaScroll ASCII art transition |
| Marquee | `src/components/sections/Marquee.tsx` | CSS auto-scroll strip |
| About | `src/components/sections/About.tsx` | |
| Approach | `src/components/sections/Approach.tsx` | 500vh scroll-driven, 3 animated pillars |
| Services | `src/components/sections/Services.tsx` | |
| Studio | `src/components/sections/Studio.tsx` | Founder cards, count-up stats |
| Work | `src/components/sections/Work.tsx` | Hover-overlay cards |
| Contact | `src/components/sections/Contact.tsx` | |
| Footer | `src/components/layout/Footer.tsx` | |

## The Approach Section

Three scroll-driven ASCII art pillars in a 320vh sticky container. Desktop layout: left text panel + `ButterflyMorph` canvas + narrow right label strip.

The three txt files are frames of a butterfly landing on a hand. `ButterflyMorph` morphs between them as you scroll via a top-down sweep that stops at row ~73 (just below the butterfly, above the hand — hand is identical across all frames so it never gets swept). Clicking a pillar on the left calls `jumpTo(frame)` which animates directly to the target frame without passing through intermediate frames.

- **01 Artful Precision** — `approach-precision.txt` (butterfly far)
- **02 Technical Fluidity** — `approach-fluidity.txt` (butterfly approaching)
- **03 Direct Partnership** — `approach-partnership.txt` (butterfly landed)

Left panel: single active-only `border-violet/40` divider tracks above the current pillar. Pillar titles in olive, numbers + dash in periwinkle. Right strip (`w-60`): active pillar number (periwinkle) aligned with the overline via `pt-[18vh]`; active pillar name (periwinkle) pinned to bottom, words split per-line and centered via `mx-auto w-fit`.

## The About Us Section

Dark `bg-ink` section with the same animated nebula blob background as Approach. Inset border lines (top + left). Split layout: left 40% portrait image column + right text column. Portrait uses `filter: invert(1) + mix-blend-mode: screen` so a white-background PNG disappears against the dark background. Replace `src=""` in `AboutUs.tsx` with your portrait image path in `/public/`.

Content: `/About Us/` overline (olive), `THE STUDIO` headline, three body paragraphs (cream), `INTENTIONAL. STRATEGIC. HUMAN.` tagline (olive).

## The Contact Section

Gold (`bg-gold`) background with an editorial 3-column grid. Two vertical violet lines at `left-1/3` and `left-2/3`, two horizontal violet lines above and below the form — all four animate in from different edges on scroll. Form fades in after all lines complete.

Desktop headline: CSS `grid-cols-3` spanning full section width, viewport-relative font size. Words placed with explicit `col-start`/`row-start`. Overline shares the BRING row via flexbox. Mobile uses a separate stacked layout.

## The Services Section

Accordion layout with inset border lines (top + left, positioned with margin inside the section). Left column (55%) holds the accordion; right column (45%, desktop only) shows static ASCII art of the partnership butterfly.

Header uses scroll-driven animation: first headline line slides in from left, lines 2–3 from right, driven by `useScroll` + `useTransform` on a `style={{ x }}` prop. `overflow-hidden` on each line clips the off-screen position.

CTA buttons: violet text/border at rest → olive background + ink text on hover, with arrow `→` translating right on hover.

Fluid nebula background: 5 animated radial-gradient blobs at `z-0` with `blur(90px)`, staggered via negative `delay` values so motion is always out of phase. Content at `z-10`.

## Development

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Hero Section

The hero is a scroll-locked experience: a `150dvh` wrapper with `sticky top-0` section inside. A single `scrollProgress` MotionValue (0→1, reaching 1 when the next section is halfway up the viewport) drives all effects in sync:

- **Left**: headline line-reveals on load; headline + bottom bar fade/lift in the final third of scroll
- **Right**: `MagnoliaScroll` canvas — ASCII art magnolia bud glitch-sweeps into a bloom as you scroll. Clicking anywhere on the right side of the hero toggles bud↔bloom with the same sweep effect. Art files at `public/ascii-bud.txt` and `public/ascii-bloom.txt`.

`MagnoliaScroll` (`src/components/ui/MagnoliaScroll.tsx`) — canvas component that parses two ASCII art files, aligns them via union bounding-box so identical `(row, col)` coordinates map to the same canvas pixel. Scroll drives a top-to-bottom glitch-sweep via a Framer Motion `MotionValue`. Click interaction is exposed via `forwardRef` + `useImperativeHandle` (`triggerClick()`), animated with Framer Motion `animate()` on a MotionValue so the bloom state persists after the animation ends. Bloom→bud sweeps bottom-to-top naturally from the same math.

Hero text and animations complete when the Marquee is ~90% up the viewport (`maxScroll = el.offsetHeight`, fade ranges end at 0.93).

## Key Files

- `src/lib/site.ts` — All copy, nav, founders, stats, social links
- `src/lib/lenis-store.ts` — Lenis singleton store
- `BRAND.md` — Brand voice, tone, messaging guidelines
- `CLAUDE.md` — AI assistant instructions and learned patterns
