'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import type { Variants, TargetAndTransition } from 'framer-motion';
import { allThemes } from '@/themes';
import type { ThemeConfig } from '@/themes';

/* ------------------------------------------------------------------ */
/*  Animation variants                                                 */
/* ------------------------------------------------------------------ */

const fadeSlideUp: Variants = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0 },
};

const staggerContainer: Variants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const cardVariant: Variants = {
  hidden: { opacity: 0, y: 24, scale: 0.95 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { duration: 0.4, ease: 'easeOut' as const },
  },
};

const pulseGlow: TargetAndTransition = {
  boxShadow: [
    '0 0 0 0 var(--color-primary)',
    '0 0 20px 4px var(--color-primary)',
    '0 0 0 0 var(--color-primary)',
  ],
  transition: {
    duration: 2,
    repeat: Infinity,
    ease: 'easeInOut' as const,
  },
};

/* ------------------------------------------------------------------ */
/*  Theme preview mini-board (4x4)                                     */
/* ------------------------------------------------------------------ */

function ThemePreviewBoard({ theme }: { theme: ThemeConfig }) {
  return (
    <div
      className="grid aspect-square w-full grid-cols-4 grid-rows-[repeat(4,1fr)] overflow-hidden rounded-md"
      aria-hidden="true"
    >
      {Array.from({ length: 16 }, (_, i) => {
        const row = Math.floor(i / 4);
        const col = i % 4;
        const isLight = (row + col) % 2 === 0;
        return (
          <div
            key={i}
            className="aspect-square"
            style={{
              backgroundColor: isLight ? theme.boardLight : theme.boardDark,
            }}
          />
        );
      })}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Theme card                                                         */
/* ------------------------------------------------------------------ */

function ThemeCard({ theme }: { theme: ThemeConfig }) {
  return (
    <motion.div variants={cardVariant} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.97 }}>
      <Link
        href="/settings"
        className="group flex flex-col gap-2 rounded-xl p-3 transition-shadow hover:shadow-lg hover:shadow-black/30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background sm:p-4"
        style={{ backgroundColor: theme.surfaceColor }}
        aria-label={`Preview ${theme.name} theme`}
      >
        <ThemePreviewBoard theme={theme} />
        <span
          className="text-center text-sm font-semibold sm:text-base"
          style={{ color: theme.textColor }}
        >
          {theme.name}
        </span>
        <div className="flex justify-center gap-1.5">
          {[theme.primaryColor, theme.accentColor, theme.boardLight, theme.boardDark].map(
            (color) => (
              <span
                key={color}
                className="h-3 w-3 rounded-full sm:h-4 sm:w-4"
                style={{ backgroundColor: color }}
                aria-hidden="true"
              />
            ),
          )}
        </div>
      </Link>
    </motion.div>
  );
}

/* ------------------------------------------------------------------ */
/*  Checkerboard background pattern                                    */
/* ------------------------------------------------------------------ */

function CheckerboardBg() {
  return (
    <div
      className="pointer-events-none absolute inset-0 overflow-hidden opacity-[0.03]"
      aria-hidden="true"
    >
      <div
        className="absolute inset-0"
        style={{
          backgroundImage: 'repeating-conic-gradient(var(--color-text) 0% 25%, transparent 0% 50%)',
          backgroundSize: '48px 48px',
        }}
      />
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Landing page                                                       */
/* ------------------------------------------------------------------ */

export default function Home() {
  return (
    <main className="relative flex min-h-dvh flex-col items-center px-4 py-12 sm:py-16 lg:py-20">
      <CheckerboardBg />

      {/* Hero Section */}
      <motion.section
        className="relative z-10 flex flex-col items-center text-center"
        initial="hidden"
        animate="visible"
        variants={staggerContainer}
      >
        {/* Knight icon */}
        <motion.span
          className="mb-4 text-5xl sm:mb-6 sm:text-6xl lg:text-7xl"
          variants={fadeSlideUp}
          transition={{ duration: 0.5 }}
          aria-hidden="true"
        >
          &#9816;
        </motion.span>

        {/* Title */}
        <motion.h1
          className="mb-3 text-4xl font-extrabold tracking-tight text-foreground sm:mb-4 sm:text-5xl lg:text-6xl"
          variants={fadeSlideUp}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          Chess{' '}
          <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
            Fighter
          </span>
        </motion.h1>

        {/* Subtitle */}
        <motion.p
          className="mb-8 max-w-md text-base text-muted sm:mb-10 sm:max-w-lg sm:text-lg lg:text-xl"
          variants={fadeSlideUp}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          The ultimate chess experience. Choose your theme, challenge your opponent, and fight for
          victory.
        </motion.p>

        {/* CTA Buttons */}
        <motion.div
          className="flex flex-col gap-3 sm:flex-row sm:gap-4"
          variants={fadeSlideUp}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <motion.div animate={pulseGlow} className="rounded-xl">
            <Link
              href="/play"
              className="inline-flex min-h-[48px] items-center justify-center rounded-xl bg-primary px-8 py-3 text-base font-bold text-white transition-transform duration-150 hover:scale-[1.03] active:scale-[0.97] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background sm:text-lg"
            >
              Play Now
            </Link>
          </motion.div>
          <Link
            href="/settings"
            className="inline-flex min-h-[48px] items-center justify-center rounded-xl border border-muted/30 bg-surface px-8 py-3 text-base font-medium text-foreground transition-transform duration-150 hover:scale-[1.03] active:scale-[0.97] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background sm:text-lg"
          >
            Settings
          </Link>
        </motion.div>
      </motion.section>

      {/* Theme Preview Section */}
      <motion.section
        className="relative z-10 mt-16 w-full max-w-3xl sm:mt-20"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.2 }}
        variants={staggerContainer}
        aria-labelledby="themes-heading"
      >
        <motion.h2
          id="themes-heading"
          className="mb-6 text-center text-xl font-bold text-foreground sm:mb-8 sm:text-2xl"
          variants={fadeSlideUp}
          transition={{ duration: 0.5 }}
        >
          Choose Your Style
        </motion.h2>

        <motion.div
          className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4"
          variants={staggerContainer}
        >
          {allThemes.map((theme) => (
            <ThemeCard key={theme.id} theme={theme} />
          ))}
        </motion.div>
      </motion.section>
    </main>
  );
}
