'use client';

interface NavigationControlsProps {
  canUndo: boolean;
  canRedo: boolean;
  onGoToStart: () => void;
  onUndo: () => void;
  onRedo: () => void;
  onGoToEnd: () => void;
}

export function NavigationControls({
  canUndo,
  canRedo,
  onGoToStart,
  onUndo,
  onRedo,
  onGoToEnd,
}: NavigationControlsProps) {
  return (
    <div
      className="flex items-center justify-center gap-1 sm:gap-2"
      role="toolbar"
      aria-label="Move navigation"
    >
      <NavButton onClick={onGoToStart} disabled={!canUndo} label="Go to first move">
        <FirstIcon />
      </NavButton>
      <NavButton onClick={onUndo} disabled={!canUndo} label="Previous move">
        <PrevIcon />
      </NavButton>
      <NavButton onClick={onRedo} disabled={!canRedo} label="Next move">
        <NextIcon />
      </NavButton>
      <NavButton onClick={onGoToEnd} disabled={!canRedo} label="Go to last move">
        <LastIcon />
      </NavButton>
    </div>
  );
}

function NavButton({
  onClick,
  disabled,
  label,
  children,
}: {
  onClick: () => void;
  disabled: boolean;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className="flex min-h-[44px] min-w-[44px] items-center justify-center rounded-lg bg-surface text-foreground transition-all duration-150 hover:bg-muted/20 active:scale-95 disabled:opacity-30 disabled:cursor-not-allowed focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
      aria-label={label}
    >
      {children}
    </button>
  );
}

function FirstIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M6 6h2v12H6zm3.5 6l8.5 6V6z" />
    </svg>
  );
}

function PrevIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M15.41 7.41L14 6l-6 6 6 6 1.41-1.41L10.83 12z" />
    </svg>
  );
}

function NextIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M10 6L8.59 7.41 13.17 12l-4.58 4.59L10 18l6-6z" />
    </svg>
  );
}

function LastIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M6 18l8.5-6L6 6v12zM16 6v12h2V6h-2z" />
    </svg>
  );
}
