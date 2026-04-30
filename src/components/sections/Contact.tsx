"use client";

import { useRef, useState } from "react";
import { motion, useInView, AnimatePresence } from "framer-motion";
import PeriodicGlitch from "@/components/ui/PeriodicGlitch";
import { siteConfig } from "@/lib/site";

const ease = [0.22, 1, 0.36, 1] as const;

/* ── Reusable pill group ─────────────────────────────────────── */
function PillGroup({
  options,
  selected,
  onToggle,
  error,
}: {
  options: readonly string[];
  selected: string | string[];
  onToggle: (val: string) => void;
  error?: boolean;
}) {
  const isActive = (v: string) =>
    Array.isArray(selected) ? selected.includes(v) : selected === v;

  return (
    <div className="flex flex-wrap gap-2">
      {options.map((opt) => {
        const active = isActive(opt);
        return (
          <motion.button
            key={opt}
            type="button"
            onClick={() => onToggle(opt)}
            data-cursor="pointer"
            animate={{
              backgroundColor: active ? "var(--se-ink)" : "transparent",
              borderColor: error && !active
                ? "rgba(21,21,20,0.7)"
                : active
                  ? "var(--se-ink)"
                  : "rgba(21,21,20,0.45)",
              color: active ? "var(--se-gold)" : "rgba(21,21,20,0.85)",
            }}
            transition={{ duration: 0.18 }}
            className="inline-flex min-h-[44px] items-center gap-2 border px-4 py-2 font-mono text-[10px] uppercase tracking-[0.15em] md:text-xs"
          >
            <AnimatePresence initial={false}>
              {active && (
                <motion.span
                  key="check"
                  initial={{ opacity: 0, scale: 0.5, width: 0 }}
                  animate={{ opacity: 1, scale: 1, width: "auto" }}
                  exit={{ opacity: 0, scale: 0.5, width: 0 }}
                  transition={{ duration: 0.15 }}
                  className="inline-block overflow-hidden leading-none"
                >
                  ✦
                </motion.span>
              )}
            </AnimatePresence>
            {opt}
          </motion.button>
        );
      })}
    </div>
  );
}

/* ── Inline field error ──────────────────────────────────────── */
function FieldError({ show, message }: { show: boolean; message: string }) {
  return (
    <AnimatePresence initial={false}>
      {show && (
        <motion.p
          initial={{ opacity: 0, y: -4 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -4 }}
          transition={{ duration: 0.2 }}
          className="font-mono text-[9px] uppercase tracking-widest text-error"
        >
          — {message}
        </motion.p>
      )}
    </AnimatePresence>
  );
}

/* ── Section ─────────────────────────────────────────────────── */
export default function Contact() {
  const ref    = useRef<HTMLElement>(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });

  const [name,        setName]        = useState("");
  const [email,       setEmail]       = useState("");
  const [services,    setServices]    = useState<string[]>([]);
  const [budget,      setBudget]      = useState("");
  const [referral,    setReferral]    = useState("");
  const [message,     setMessage]     = useState("");
  const [attempted,   setAttempted]   = useState(false);
  const [submitting,  setSubmitting]  = useState(false);
  const [submitted,   setSubmitted]   = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const toggleService = (v: string) =>
    setServices((prev) => prev.includes(v) ? prev.filter((s) => s !== v) : [...prev, v]);

  const toggleSingle = (setter: (v: string) => void, current: string) =>
    (v: string) => setter(current === v ? "" : v);

  const errors = {
    name:     attempted && !name.trim(),
    email:    attempted && !/\S+@\S+\.\S+/.test(email),
    services: attempted && services.length === 0,
    budget:   attempted && !budget,
  };

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setAttempted(true);
    setSubmitError(null);
    if (!name.trim() || !/\S+@\S+\.\S+/.test(email) || !services.length || !budget) return;

    setSubmitting(true);
    try {
      const res  = await fetch("/api/contact", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ name, email, services, budget, referral, message }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Something went wrong.");
      setSubmitted(true);
    } catch (err) {
      setSubmitError(
        err instanceof Error ? err.message : "Something went wrong. Please try again."
      );
    } finally {
      setSubmitting(false);
    }
  }

  const reveal = (delay: number) => ({
    initial:    { y: "105%" },
    animate:    inView ? { y: 0 } : {},
    transition: { duration: 0.9, delay, ease },
  });

  const labelClass =
    "font-mono text-[10px] uppercase tracking-[0.2em] text-violet md:text-xs";
  const inputBase =
    "bg-transparent pb-2 font-mono text-sm text-ink outline-none transition-colors";

  return (
    <section
      ref={ref}
      id="contact"
      data-cursor="hand"
      className="relative overflow-hidden bg-gold"
    >
      {/* ── Vertical grid lines ──────────────────────────────────── */}
      <motion.div
        initial={{ scaleY: 0 }}
        animate={inView ? { scaleY: 1 } : {}}
        transition={{ duration: 5, delay: 0.75, ease }}
        style={{ transformOrigin: "top" }}
        className="absolute inset-y-0 left-1/3 hidden w-0.5 bg-violet/30 md:block"
      />
      <motion.div
        initial={{ scaleY: 0 }}
        animate={inView ? { scaleY: 1 } : {}}
        transition={{ duration: 5, delay: 0.75, ease }}
        style={{ transformOrigin: "bottom" }}
        className="absolute inset-y-0 left-2/3 hidden w-0.5 bg-violet/30 md:block"
      />

      {/* ── Header ───────────────────────────────────────────────── */}
      <div className="relative pt-14 pb-14 md:pt-20 md:pb-20">
        {/* Overline — mobile only */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={inView ? { opacity: 1 } : {}}
          transition={{ duration: 0.5, delay: 0.6 }}
          className="absolute right-8 top-14 font-mono text-sm uppercase tracking-[0.25em] text-violet md:hidden"
        >
          <PeriodicGlitch text="/Get in Touch/" inView={inView} />
        </motion.p>

        {/* Mobile headline */}
        <h2 className="px-8 font-display text-5xl font-medium uppercase leading-[0.88] tracking-tight text-ink md:hidden">
          <div className="overflow-hidden">
            <motion.span className="block" {...reveal(0.05)}>LET&rsquo;S BRING</motion.span>
          </div>
          <div className="overflow-hidden pl-[22%]">
            <motion.span className="block" {...reveal(0.15)}>YOUR VISION</motion.span>
          </div>
          <div className="overflow-hidden text-right">
            <motion.span className="block" {...reveal(0.25)}>TO LIFE.</motion.span>
          </div>
        </h2>

        {/* Desktop headline — 3-column grid aligned to vertical lines */}
        <h2
          className="hidden font-display font-medium uppercase leading-[0.9] tracking-tight text-ink md:grid md:grid-cols-3 md:gap-y-[0.30em]"
          style={{ fontSize: "clamp(2rem, 4.6vw, 5.5rem)" }}
        >
          <div className="col-start-1 row-start-1 overflow-hidden pr-[0.28em] text-right">
            <motion.span className="block" {...reveal(0.05)}>LET&rsquo;S</motion.span>
          </div>
          <div className="col-start-2 row-start-1 flex items-center pl-[0.28em]">
            <div className="overflow-hidden shrink-0">
              <motion.span className="block" {...reveal(0.15)}>BRING</motion.span>
            </div>
            <motion.p
              initial={{ opacity: 0 }}
              animate={inView ? { opacity: 1 } : {}}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="flex-1 text-center font-mono text-sm uppercase tracking-[0.25em] text-violet"
            >
              <PeriodicGlitch text="/Get in Touch/" inView={inView} />
            </motion.p>
          </div>
          <div className="col-start-2 row-start-2 overflow-hidden text-center">
            <motion.span className="block" {...reveal(0.25)}>YOUR VISION</motion.span>
          </div>
          <div className="col-start-2 row-start-3 overflow-hidden pr-[0.28em] text-right">
            <motion.span className="block" {...reveal(0.35)}>TO</motion.span>
          </div>
          <div className="col-start-3 row-start-3 overflow-hidden pl-[0.28em]">
            <motion.span className="block" {...reveal(0.4)}>LIFE.</motion.span>
          </div>
        </h2>
      </div>

      {/* ── Horizontal divider — below header ────────────────────── */}
      <motion.div
        initial={{ scaleX: 0 }}
        animate={inView ? { scaleX: 1 } : {}}
        transition={{ duration: 5, delay: 0.75, ease }}
        style={{ transformOrigin: "left" }}
        className="h-0.5 bg-violet/30"
      />

      {/* ── Form / Success — fade in after lines finish drawing ──── */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={inView ? { opacity: 1 } : {}}
        transition={{ duration: 0.6, delay: 2.5 }}
        className="py-10 md:py-14"
      >
        <AnimatePresence mode="wait">

          {/* Success state */}
          {submitted ? (
            <motion.div
              key="success"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.5, ease }}
              className="mx-auto flex w-full flex-col gap-6 px-8 py-8 md:w-1/3 md:px-10"
            >
              <p className={labelClass}>/Received/</p>
              <h3 className="font-display text-4xl font-medium uppercase leading-[0.92] tracking-tight text-ink md:text-5xl">
                We&rsquo;ll be in touch within 24 hours.
              </h3>
              <p className="font-mono text-[11px] uppercase tracking-[0.15em] text-ink/60 md:text-xs">
                In the meantime, take a look at our work.
              </p>
              <a
                href="#work"
                data-cursor="pointer"
                className="group inline-flex items-center gap-3 self-start font-mono text-[10px] uppercase tracking-[0.15em] text-violet transition-colors duration-300 hover:text-ink md:text-xs"
              >
                See our work
                <span className="inline-block transition-transform duration-300 group-hover:translate-x-1">→</span>
              </a>
            </motion.div>

          ) : (

            /* Form */
            <motion.form
              key="form"
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.3 }}
              onSubmit={handleSubmit}
              noValidate
            >
              <div className="mx-auto flex w-full flex-col gap-9 px-8 md:w-1/3 md:px-10">

                {/* NAME */}
                <div className="flex flex-col gap-2">
                  <label className={labelClass}>
                    Name <span className="text-ink/40">*</span>
                  </label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className={`${inputBase} border-b ${errors.name ? "border-ink/60" : "border-ink/35 focus:border-ink"}`}
                  />
                  <FieldError show={errors.name} message="Name is required" />
                </div>

                {/* EMAIL */}
                <div className="flex flex-col gap-2">
                  <label className={labelClass}>
                    Email <span className="text-ink/40">*</span>
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className={`${inputBase} border-b ${errors.email ? "border-ink/60" : "border-ink/35 focus:border-ink"}`}
                  />
                  <FieldError show={errors.email} message="Valid email is required" />
                </div>

                {/* SERVICES */}
                <div className="flex flex-col gap-3">
                  <label className={labelClass}>
                    I&rsquo;d like to work on... <span className="text-ink/40">*</span>
                  </label>
                  <PillGroup
                    options={siteConfig.contactForm.serviceOptions}
                    selected={services}
                    onToggle={toggleService}
                    error={errors.services}
                  />
                  <FieldError show={errors.services} message="Select at least one service" />
                </div>

                {/* BUDGET */}
                <div className="flex flex-col gap-3">
                  <label className={labelClass}>
                    Budget Range <span className="text-ink/40">*</span>
                  </label>
                  <PillGroup
                    options={siteConfig.contactForm.budgetOptions}
                    selected={budget}
                    onToggle={toggleSingle(setBudget, budget)}
                    error={errors.budget}
                  />
                  <FieldError show={errors.budget} message="Please select a budget range" />
                </div>

                {/* REFERRAL */}
                <div className="flex flex-col gap-3">
                  <label className={labelClass}>How&rsquo;d you find us?</label>
                  <PillGroup
                    options={siteConfig.contactForm.referralOptions}
                    selected={referral}
                    onToggle={toggleSingle(setReferral, referral)}
                  />
                </div>

                {/* MESSAGE */}
                <div className="flex flex-col gap-2">
                  <label className={labelClass}>Tell us more...</label>
                  <textarea
                    rows={5}
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    className="resize-none border border-ink/20 bg-transparent p-3 font-mono text-sm text-ink outline-none transition-colors focus:border-ink/50"
                  />
                </div>

                {/* SUBMIT */}
                <div className="flex flex-col items-end gap-3">
                  {submitError && (
                    <p className="w-full font-mono text-[9px] uppercase tracking-widest text-error">
                      — {submitError}
                    </p>
                  )}
                  <button
                    type="submit"
                    disabled={submitting}
                    data-cursor="pointer"
                    className="group/btn inline-flex items-center gap-3 rounded-full border border-violet px-7 py-3 font-mono text-[10px] uppercase tracking-[0.15em] text-violet transition-all duration-300 hover:border-ink hover:bg-ink hover:text-gold disabled:opacity-50 md:text-xs"
                  >
                    {submitting ? "Sending..." : "Send It"}
                    <span className="inline-block transition-transform duration-300 group-hover/btn:rotate-45">↗</span>
                  </button>
                </div>

              </div>
            </motion.form>
          )}

        </AnimatePresence>
      </motion.div>

      {/* ── Horizontal divider — below form ──────────────────────── */}
      <motion.div
        initial={{ scaleX: 0 }}
        animate={inView ? { scaleX: 1 } : {}}
        transition={{ duration: 5, delay: 0.75, ease }}
        style={{ transformOrigin: "right" }}
        className="h-0.5 bg-violet/30"
      />

      {/* Bottom breathing room */}
      <div className="h-12 md:h-16" />

    </section>
  );
}
