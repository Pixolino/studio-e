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
| `--se-ink` | `#252420` | Background / text on light |
| `--se-gold` | `#C4A84A` | Primary accent |
| `--se-gold-light` | `#E2D098` | Hover / highlight |
| `--se-gold-deep` | `#7D6B1A` | Subtle gold |
| `--se-cream` | `#F8F4E8` | Headline text |
| `--se-cream-mid` | `#EDE8D6` | Secondary light |
| `--se-muted` | `#8A856E` | Body / supporting text |

## Sections

| Section | File | Notes |
|---|---|---|
| Navbar | `src/components/layout/Navbar.tsx` | Fixed, scrolled state, mobile overlay |
| Hero | `src/components/sections/Hero.tsx` | Sticky, ASCII glitch bg, line reveals, parallax |
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

## Key Files

- `src/lib/site.ts` — All copy, nav, founders, stats, social links
- `src/lib/lenis-store.ts` — Lenis singleton store
- `BRAND.md` — Brand voice, tone, messaging guidelines
- `CLAUDE.md` — AI assistant instructions and learned patterns
