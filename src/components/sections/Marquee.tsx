const items = [
  "Web Design",
  "Branding",
  "Development",
  "Strategy",
  "Digital Experiences",
  "Motion Design",
];

// Duplicate 4× for a seamless 50% translateX loop
const track = [...items, ...items, ...items, ...items];

export default function Marquee() {
  return (
    <div className="overflow-hidden border-y border-gold/20 bg-gold-deep py-5 select-none">
      <div className="flex animate-marquee whitespace-nowrap">
        {track.map((item, i) => (
          <span
            key={i}
            className="mx-8 text-xs font-medium uppercase tracking-[0.22em] text-cream/60"
          >
            {item}
            <span className="ml-8 text-gold/50">·</span>
          </span>
        ))}
      </div>
    </div>
  );
}
