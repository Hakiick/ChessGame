'use client';

import { forwardRef, type ButtonHTMLAttributes } from 'react';
import { cn } from '@/lib/cn';

type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger';
type ButtonSize = 'sm' | 'md' | 'lg';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
}

const variantStyles: Record<ButtonVariant, string> = {
  primary:
    'bg-primary text-white hover:bg-primary-dark active:bg-primary-dark focus-visible:ring-primary',
  secondary:
    'bg-secondary text-white hover:opacity-90 active:opacity-80 focus-visible:ring-secondary',
  ghost:
    'bg-transparent text-foreground hover:bg-surface active:bg-surface/80 focus-visible:ring-primary',
  danger: 'bg-error text-white hover:opacity-90 active:opacity-80 focus-visible:ring-error',
};

const sizeStyles: Record<ButtonSize, string> = {
  sm: 'min-h-[44px] min-w-[44px] px-3 py-1.5 text-sm',
  md: 'min-h-[44px] min-w-[44px] px-4 py-2 text-base',
  lg: 'min-h-[48px] min-w-[48px] px-6 py-3 text-lg',
};

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    { variant = 'primary', size = 'md', loading = false, disabled, className, children, ...props },
    ref,
  ) => {
    const isDisabled = disabled || loading;

    return (
      <button
        ref={ref}
        disabled={isDisabled}
        className={cn(
          'inline-flex items-center justify-center rounded-lg font-medium',
          'transition-transform duration-fast',
          'hover:scale-[1.02] active:scale-[0.98]',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-background',
          variantStyles[variant],
          sizeStyles[size],
          isDisabled && 'pointer-events-none opacity-50',
          className,
        )}
        {...props}
      >
        {loading ? (
          <span
            className="mr-2 inline-block h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent"
            role="status"
          >
            <span className="sr-only">Loading</span>
          </span>
        ) : null}
        {children}
      </button>
    );
  },
);

Button.displayName = 'Button';

export { Button, type ButtonProps, type ButtonVariant, type ButtonSize };
