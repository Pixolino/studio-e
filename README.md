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

Three scroll-driven animated pillars in a 500vh sticky container:

- **01 Artful Precision** — SVG diamond + orbit ring, draws on scroll then loops (pulsating diamond, dual-direction ring rotation)
- **02 Technical Fluidity** — Canvas wave animation, active during scroll window
- **03 Direct Partnership** — SVG constellation + orbit, draws then loops (brightness pulse, traveling dots, center burst)

Pillar indicators on the left are clickable anchors that scroll to the correct section position. Descriptions fold in after drawing begins.

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

## Key Files

- `src/lib/site.ts` — All copy, nav, founders, stats, social links
- `src/lib/lenis-store.ts` — Lenis singleton store
- `BRAND.md` — Brand voice, tone, messaging guidelines
- `CLAUDE.md` — AI assistant instructions and learned patterns
