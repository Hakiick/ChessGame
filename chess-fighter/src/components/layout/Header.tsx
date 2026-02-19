'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion } from 'framer-motion';
import { cn } from '@/lib/cn';

const navLinks = [
  { href: '/play', label: 'Play' },
  { href: '/settings', label: 'Settings' },
] as const;

function Header() {
  const pathname = usePathname();

  return (
    <motion.header
      className="sticky top-0 z-50 w-full border-b border-muted/10 bg-background/80 backdrop-blur-md"
      initial={{ y: -64, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.4, ease: 'easeOut' }}
    >
      <div className="mx-auto flex h-14 max-w-5xl items-center justify-between px-4 sm:h-16">
        {/* Logo / Title */}
        <Link
          href="/"
          className="flex items-center gap-2 text-lg font-bold text-foreground transition-opacity hover:opacity-80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background sm:text-xl"
          aria-label="Chess Fighter home"
        >
          <span className="text-xl sm:text-2xl" aria-hidden="true">
            &#9816;
          </span>
          <span>Chess Fighter</span>
        </Link>

        {/* Navigation */}
        <nav aria-label="Main navigation">
          <ul className="flex items-center gap-1 sm:gap-2">
            {navLinks.map((link) => {
              const isActive = pathname === link.href;
              return (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className={cn(
                      'relative inline-flex min-h-[44px] min-w-[44px] items-center justify-center rounded-lg px-3 py-2 text-sm font-medium transition-colors sm:px-4 sm:text-base',
                      'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background',
                      isActive ? 'text-primary' : 'text-muted hover:text-foreground',
                    )}
                    aria-current={isActive ? 'page' : undefined}
                  >
                    {link.label}
                    {isActive && (
                      <motion.span
                        className="absolute bottom-1 left-3 right-3 h-0.5 rounded-full bg-primary sm:left-4 sm:right-4"
                        layoutId="nav-underline"
                        transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                      />
                    )}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>
      </div>
    </motion.header>
  );
}

export { Header };
