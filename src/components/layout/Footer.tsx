import { siteConfig } from "@/lib/site";

export default function Footer() {
  return (
    <footer className="border-t border-gold/10 bg-ink px-8 py-8 md:px-16">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <p className="font-display text-sm text-muted/40">
          © {new Date().getFullYear()} Studio E. All rights reserved.
        </p>
        <p className="font-display text-sm italic text-gold/30">South Florida</p>
        <div className="flex gap-6">
          {siteConfig.social.map((s) => (
            <a
              key={s.platform}
              href={s.href}
              data-cursor="pointer"
              className="text-xs text-muted/40 transition-colors hover:text-gold"
            >
              {s.platform}
            </a>
          ))}
        </div>
      </div>
    </footer>
  );
}
