"use client";

import { useRef } from "react";
import { motion, useInView } from "framer-motion";
import Image from "next/image";
import PeriodicGlitch from "@/components/ui/PeriodicGlitch";

const ease = [0.22, 1, 0.36, 1] as const;

interface WorkImage {
  src: string;
  alt: string;
  w?: number; // natural pixel width — required for collage layout
  h?: number; // natural pixel height — required for collage layout
}

interface WorkProject {
  id:         string;
  client:     string;
  badge?:     string;
  paragraphs: string[];
  images:     [WorkImage, WorkImage, WorkImage, WorkImage];
  imageLayout?: "grid" | "collage"; // "grid" = uniform 2×2, "collage" = asymmetric square
}

/* ── Project data ────────────────────────────────────────────── */
const projects: WorkProject[] = [
  {
    id:     "01",
    client: "Age Safe® America",
    paragraphs: [
      "We serve as the creative and strategic backbone of Age Safe® America, a nationally recognized training and certification organization dedicated to protecting older adults through professional education.",
      "From the ground up, we built their entire visual identity, including a new suite of course emblems, and continue to own every touchpoint across the brand: social media, email campaigns, course marketing, pitch decks, downloadable resources, and print collateral. We direct creative and strategy across their full platform ecosystem, lead backend support as their primary technical partner, and coordinate with outside agencies, ensuring every initiative is executed with a unified voice, consistent standards, and clear strategic direction.",
      "Our work has helped position ASA's leadership as recognized authorities in the aging-in-place space, earning placements in national publications and driving measurable growth in certifications and membership.",
    ],
    images: [
      { src: "/work/age-safe-1.webp", alt: "Age Safe America mockup" },
      { src: "/work/age-safe-2.webp", alt: "Age Safe America mockup" },
      { src: "/work/age-safe-3.webp", alt: "Age Safe America mockup" },
      { src: "/work/age-safe-4.webp", alt: "Age Safe America mockup" },
    ],
    imageLayout: "grid",
  },
  {
    id:     "02",
    client: "Elevate",
    paragraphs: [
      "We shaped Elevate's identity around a single defining principle: discretion meets depth.",
      "Built for high-performing executive couples navigating complex relationship dynamics, the brand communicates refinement and quiet authority through minimalist design, elevated typography, and a restrained palette, without losing the warmth that makes the practice approachable.",
      "The website carries that same intention forward, guiding users through a frictionless journey from first impression to booked consultation. With a less-is-more approach, every page removes noise and keeps attention where it matters — building trust, communicating value, and making the next step obvious.",
    ],
    images: [
      { src: "/work/elevate-1.png", alt: "Elevate wellness office",   w: 3072, h: 1024 },
      { src: "/work/elevate-2.jpg", alt: "Elevate brand mockup",      w: 1684, h: 1179 },
      { src: "/work/elevate-3.jpg", alt: "Elevate portfolio mockup",  w: 1920, h: 1080 },
      { src: "/work/elevate-4.png", alt: "Elevate website mockup",    w: 1515, h: 1010 },
    ],
    imageLayout: "collage",
  },
  {
    id:     "03",
    client: "Sparked Momentum",
    paragraphs: [
      "We built Sparked Momentum's identity from the ground up — messaging, visual system, website, social media templates, and print collateral — for a Miami-based ABA therapy practice built on the belief that every child's journey deserves to be met with both expertise and heart.",
      "The visual direction translates that philosophy into a vibrant, organic system: fluid shapes, expressive gradients, and a warm color palette that reflects the individuality of each child and the energy of their progress, while staying polished enough to earn the trust of parents and partners.",
      "The website simplifies a complex, emotionally loaded decision into a clear and compassionate experience — guiding caregivers from overwhelm to confidence, and from first visit to booked consultation. On social, the visual language extends into a flexible content system of consistent shapes, color blocking, and imagery that educates, reassures, and builds community across every touchpoint.",
    ],
    images: [
      { src: "/work/sparked-1.jpg", alt: "Sparked Momentum mockup",  w: 1920, h: 1080 },
      { src: "/work/sparked-2.png", alt: "Sparked Momentum mockup",  w: 1744, h: 2336 },
      { src: "/work/sparked-3.jpg", alt: "Sparked Momentum mockup",  w: 1920, h: 1080 },
      { src: "/work/sparked-4.jpg", alt: "Sparked Momentum mockup",  w: 1684, h: 1179 },
    ],
    imageLayout: "collage",
  },
];

/* ── Uniform 2×2 grid ────────────────────────────────────────── */
function ImageGrid({ images }: { images: WorkProject["images"] }) {
  return (
    <div className="grid flex-1 grid-cols-2 gap-2.5 md:gap-3 lg:max-w-[51%]">
      {images.map((img, i) => (
        <div key={i} className="relative aspect-[4/3] overflow-hidden bg-cream/5">
          {img.src && (
            <Image src={img.src} alt={img.alt} fill sizes="(max-width: 1024px) 50vw, 30vw" className="object-cover" />
          )}
        </div>
      ))}
    </div>
  );
}

/* ── Asymmetric collage — flex rows, equal gap, natural proportions */
function ImageCollage({ images }: { images: WorkProject["images"] }) {
  // flex value = aspect ratio so both images in a row share the same height
  const ratio = (i: number) => (images[i].w && images[i].h ? images[i].w! / images[i].h! : 1.5);

  const Img = ({ i, sizes }: { i: number; sizes: string }) =>
    images[i]?.src ? (
      <Image
        src={images[i].src}
        alt={images[i].alt}
        width={images[i].w ?? 1600}
        height={images[i].h ?? 900}
        sizes={sizes}
        style={{ width: "100%", height: "auto", display: "block" }}
      />
    ) : null;

  return (
    <div className="flex flex-1 flex-col gap-2.5 lg:max-w-[51%]">
      <div className="flex gap-2.5">
        <div style={{ flex: ratio(0) }} className="min-w-0"><Img i={0} sizes="35vw" /></div>
        <div style={{ flex: ratio(1) }} className="min-w-0"><Img i={1} sizes="20vw" /></div>
      </div>
      <div className="flex gap-2.5">
        <div style={{ flex: ratio(2) }} className="min-w-0"><Img i={2} sizes="30vw" /></div>
        <div style={{ flex: ratio(3) }} className="min-w-0"><Img i={3} sizes="25vw" /></div>
      </div>
    </div>
  );
}

/* ── Single project row ──────────────────────────────────────── */
function ProjectRow({ project }: { project: WorkProject }) {
  const ref    = useRef<HTMLElement>(null);
  const inView = useInView(ref, { once: true, margin: "-60px" });

  return (
    <motion.article
      ref={ref}
      initial={{ opacity: 0, y: 28 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.85, ease }}
      className="py-14 md:py-20"
    >
      <div className="flex flex-col gap-10 pl-16 md:pl-16 lg:pl-24 lg:flex-row lg:gap-16 xl:gap-20">

        {/* Left — text */}
        <div className="lg:w-[38%] lg:shrink-0">
          <div className="flex items-start justify-between gap-4">
            <h3 className="font-display text-2xl font-medium uppercase tracking-tight text-cream md:text-3xl">
              {project.client}
            </h3>
            {project.badge && (
              <span className="mt-1 shrink-0 rounded-sm bg-cream/10 px-2 py-1 font-mono text-[9px] uppercase tracking-widest text-cream/60">
                {project.badge}
              </span>
            )}
          </div>
          <div className="mt-6 flex max-w-md flex-col gap-4">
            {project.paragraphs.map((para, i) => (
              <p key={i} className="text-sm leading-relaxed text-cream">
                {para}
              </p>
            ))}
          </div>
        </div>

        {/* Right — images */}
        {project.imageLayout === "collage"
          ? <ImageCollage images={project.images} />
          : <ImageGrid    images={project.images} />
        }

      </div>
    </motion.article>
  );
}

/* ── Section ─────────────────────────────────────────────────── */
export default function Work() {
  const headerRef    = useRef<HTMLDivElement>(null);
  const headerInView = useInView(headerRef, { once: true, margin: "-60px" });

  return (
    <section id="work" className="relative overflow-hidden bg-ink px-8 py-20 md:px-16 md:py-28">

      {/* Vertical line — x-position matches About Us section's left inset border */}
      <motion.div
        initial={{ scaleY: 0 }}
        animate={headerInView ? { scaleY: 1 } : {}}
        transition={{ duration: 5, delay: 0.75, ease }}
        style={{ transformOrigin: "top" }}
        className="absolute inset-y-0 left-8 w-px bg-cream-mid/20 md:left-14 lg:left-20"
      />

      {/* Header */}
      <div ref={headerRef} className="mb-8 md:mb-12 pl-8 md:pl-14 lg:pl-16">
        <motion.p
          initial={{ opacity: 0 }}
          animate={headerInView ? { opacity: 1 } : {}}
          transition={{ duration: 0.5 }}
          className="mb-5 font-mono text-sm uppercase tracking-[0.25em] text-gold/80"
        >
          <PeriodicGlitch text="/Selected Works/" inView={headerInView} />
        </motion.p>
        <div className="overflow-hidden">
          <motion.h2
            initial={{ y: "105%" }}
            animate={headerInView ? { y: 0 } : {}}
            transition={{ duration: 0.9, ease }}
            className="font-display text-5xl font-medium uppercase tracking-tight text-gold md:text-6xl lg:text-7xl"
          >
            The Work.
          </motion.h2>
        </div>
      </div>


      {/* Horizontal divider — below header */}
      <motion.div
        initial={{ scaleX: 0 }}
        animate={headerInView ? { scaleX: 1 } : {}}
        transition={{ duration: 5, delay: 0.75, ease }}
        style={{ transformOrigin: "left" }}
        className="-mx-8 mb-0 h-0.5 bg-cream-mid/20 md:-mx-16"
      />

      {/* Project rows */}
      <div>
        {projects.map((project) => (
          <ProjectRow key={project.id} project={project} />
        ))}
      </div>

    </section>
  );
}
