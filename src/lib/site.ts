export const siteConfig = {
  name: "Studio\u2014E",
  tagline: "We build brands that outlast the market.",
  coreMessage: "Intelligence, Meet Instinct.",
  description:
    "Studio\u2014E is a multi-disciplinary brand studio for founders who have outgrown \u201cgood enough.\u201d Strategy, identity, and digital infrastructure\u2014delivered as one seamless engagement.",
  url: "https://studioe.agency",
  nav: [
    { label: "Approach", href: "#approach" },
    { label: "Services", href: "#services" },
    { label: "Studio", href: "#studio" },
    { label: "Work", href: "#work" },
    { label: "Contact", href: "#contact" },
  ],
  cta: { label: "Book a Discovery Call", href: "#contact" },
  social: [
    { platform: "Instagram", href: "https://www.instagram.com/studioe.digital" },
    { platform: "LinkedIn", href: "https://www.linkedin.com/company/studioe-digital" },
  ],
  founders: [
    {
      name: "Grace",
      role: "Brand Strategy & Creative Direction",
      bio: "13 years across marketing, brand architecture, design systems, and business development. Grace ensures your brand is built to win markets\u2014not just look good in one.",
    },
    {
      name: "Ilay",
      role: "Technical Architecture & Narrative Systems",
      bio: "A decade of professional TV narrative writing and full-stack engineering. Ilay ensures your brand tells a story that sticks\u2014and lives on infrastructure that scales.",
    },
  ],
  stats: [
    { value: 23, suffix: "+", label: "Years of combined expertise" },
    { value: 100, suffix: "%", label: "Referral-based growth" },
    { value: 0, suffix: "", label: "Layers between you and us" },
  ],
  services: [
    {
      name: "Identity Systems",
      description:
        "Comprehensive branding that establishes immediate legitimacy. We build the strategic and visual foundation your market will recognize and trust.",
      includes: ["Visual Identity", "Verbal Strategy", "Brand Guidelines"],
      cta: "Inquire About Identity",
    },
    {
      name: "Digital Presence",
      description:
        "High-end digital experiences engineered for conversion and storytelling. We build the digital home for your life\u2019s work\u2014as intentional as the work itself.",
      includes: ["UI/UX Design", "Web Development", "Technical Systems"],
      cta: "Inquire About Digital",
    },
    {
      name: "Growth Assets",
      description:
        "The tactical tools required to scale your reach. Whether you\u2019re raising capital or entering a new market, we build the collateral that moves the room.",
      includes: ["Pitch Decks", "Marketing Collateral", "Narrative Strategy"],
      cta: "Inquire About Growth",
    },
  ],
} as const;
