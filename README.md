# Studio—E

Multi-disciplinary brand studio website for founders who have outgrown "good enough." Strategy, identity, and digital infrastructure — delivered as one seamless engagement.

## Stack

- **Framework:** Next.js 16 (App Router)
- **Styling:** Tailwind CSS v4 (inline `@theme` tokens, no config file)
- **Animation:** Framer Motion v12
- **Smooth Scroll:** Lenis v1
- **3D:** React Three Fiber + Drei (available, not yet used)
- **Fonts:** Zalando Sans (display + body, variable) · Geist Mono (UI accents)
- **Language:** TypeScript

## Structure

```
src/
├── app/
│   ├── layout.tsx          # Root layout — fonts, Lenis, CustomCursor
│   ├── page.tsx            # Homepage composition
│   └── globals.css         # Tailwind @theme tokens, keyframes, utilities
├── components/
│   ├── layout/
│   │   ├── Navbar.tsx      # Fixed nav, scroll-reactive frosted glass
│   │   ├── SmoothScroll.tsx # Lenis wrapper
│   │   └── Footer.tsx
│   ├── sections/
│   │   ├── Hero.tsx        # Full-viewport editorial type, parallax rings
│   │   ├── Marquee.tsx     # Auto-scrolling ticker strip
│   │   ├── About.tsx       # Problem statement section
│   │   ├── Approach.tsx    # 3 pillars — Artful Precision, Technical Fluidity, Direct Partnership
│   │   ├── Services.tsx    # Identity Systems, Digital Presence, Growth Assets
│   │   ├── Studio.tsx      # Founders (Grace + Ilay) + stats
│   │   ├── Work.tsx        # Portfolio grid (placeholder projects)
│   │   └── Contact.tsx     # Discovery Call CTA
│   └── ui/
│       └── CustomCursor.tsx # Dot + ring cursor with data-cursor="pointer" system
└── lib/
    ├── site.ts             # Single source of truth for all brand copy + config
    └── cn.ts               # clsx + tailwind-merge utility
```

## Brand

All copy and messaging lives in [`BRAND.md`](./BRAND.md) and is reflected in [`src/lib/site.ts`](./src/lib/site.ts).

- Brand name: **Studio—E** (em dash, always)
- Primary CTA: **"Book a Discovery Call"**
- Tone: Compassionate Authority — sharp, warm, confident
- Palette: ink `#252420` · gold `#C4A84A` · cream `#F8F4E8`
- Fonts: **Zalando Sans** (all headlines + body copy, variable weight 100–900) · **Geist Mono** (nav, buttons, CTAs, labels, tags, micro-copy)

## Dev

Requires Node.js ≥ 20.9.0.

```bash
nvm use 20
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Interactive Elements

Add `data-cursor="pointer"` to any element to trigger the ring scale-up on the custom cursor.
