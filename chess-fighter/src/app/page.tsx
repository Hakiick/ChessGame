import Link from 'next/link';
import { Badge } from '@/components/ui/Badge';
import { Card } from '@/components/ui/Card';

export default function Home() {
  return (
    <main className="flex min-h-dvh flex-col items-center justify-center p-4">
      <Card variant="elevated" padding="lg" className="max-w-md text-center">
        <Badge variant="info" size="sm" className="mb-4">
          In Development
        </Badge>
        <h1 className="mb-2 text-3xl font-bold text-foreground md:text-4xl">Chess Fighter</h1>
        <p className="mb-6 text-muted">Coming Soon</p>

        <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
          <Link
            href="/play"
            className="inline-flex min-h-[44px] items-center justify-center rounded-lg bg-primary px-6 py-2 text-sm font-medium text-white transition-transform duration-150 hover:scale-[1.02] active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background sm:text-base"
          >
            Play
          </Link>
          <Link
            href="/settings"
            className="inline-flex min-h-[44px] items-center justify-center rounded-lg bg-surface px-6 py-2 text-sm font-medium text-foreground transition-transform duration-150 hover:scale-[1.02] active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background sm:text-base"
          >
            Settings
          </Link>
        </div>
      </Card>
    </main>
  );
}
