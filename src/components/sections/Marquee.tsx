"use client";

const items = [
  { label: "Web Design",          href: "#service-digital-presence" },
  { label: "Branding",            href: "#service-identity-systems" },
  { label: "Development",         href: "#service-digital-presence" },
  { label: "Strategy",            href: "#service-growth-assets" },
  { label: "Digital Experiences", href: "#service-digital-presence" },
];

// Duplicate 4× for a seamless 50% translateX loop
const track = [...items, ...items, ...items, ...items];

export default function Marquee() {
  return (
    <div className="group overflow-hidden border-y border-violet bg-violet py-5 select-none">
      <div className="flex animate-marquee whitespace-nowrap group-hover:[animation-play-state:paused]">
        {track.map((item, i) => (
          <a
            key={i}
            href={item.href}
            data-cursor="pointer"
            className="mx-8 inline-block text-xs font-medium uppercase tracking-[0.22em] text-cream transition-all duration-300 hover:scale-110 hover:text-gold"
          >
            {item.label}
            <span className="ml-8 text-gold/50">·</span>
          </a>
        ))}
      </div>
    </div>
  );
}
