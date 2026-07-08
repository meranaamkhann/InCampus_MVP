"use client";

import { motion } from "framer-motion";
import { ShieldCheck } from "lucide-react";

export function IdCardHero() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 24, rotateX: 8 }}
      animate={{ opacity: 1, y: 0, rotateX: 0 }}
      transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
      whileHover={{ rotateY: 6, rotateX: -4, scale: 1.02 }}
      style={{ perspective: 1200, transformStyle: "preserve-3d" }}
      className="relative mx-auto w-full max-w-md"
    >
      <div className="glass relative overflow-hidden rounded-3xl p-6 shadow-glass">
        {/* Ambient glow */}
        <div className="pointer-events-none absolute -top-16 -right-16 h-48 w-48 rounded-full bg-primary/25 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-20 -left-10 h-40 w-40 rounded-full bg-accent/20 blur-3xl" />

        <div className="relative flex items-center justify-between">
          <span className="font-display text-sm font-semibold tracking-wide text-ink-muted">
            INCAMPUS ID
          </span>
          <motion.div
            animate={{ opacity: [0.6, 1, 0.6] }}
            transition={{ duration: 2.4, repeat: Infinity }}
            className="flex items-center gap-1 rounded-full bg-success/15 px-2.5 py-1 text-xs font-medium text-success"
          >
            <ShieldCheck size={13} /> VERIFIED
          </motion.div>
        </div>

        <div className="relative mt-6 flex items-center gap-4">
          <div className="h-16 w-16 shrink-0 rounded-2xl bg-gradient-to-br from-primary to-accent" />
          <div>
            <p className="font-display text-xl font-semibold">Ananya Rao</p>
            <p className="text-sm text-ink-muted">B.Tech CSE · 3rd Year</p>
          </div>
        </div>

        <div className="relative mt-6 flex items-center justify-between border-t border-border/60 pt-4">
          <div>
            <p className="font-mono text-[11px] uppercase tracking-wider text-ink-faint">College</p>
            <p className="text-sm font-medium">Galgotias College of Engg.</p>
          </div>
          <div className="font-mono text-[11px] tracking-widest text-ink-faint">
            NO. 2026-IC-0417
          </div>
        </div>

        {/* Barcode-style decorative strip */}
        <div className="relative mt-5 flex h-6 items-end gap-[3px] overflow-hidden">
          {Array.from({ length: 48 }).map((_, i) => (
            <div
              key={i}
              className="bg-ink-faint/40"
              style={{ width: 2, height: `${((i * 37) % 100) / 4 + 6}px` }}
            />
          ))}
        </div>
      </div>
    </motion.div>
  );
}
