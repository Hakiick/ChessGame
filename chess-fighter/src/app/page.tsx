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
        <p className="text-muted">Coming Soon</p>
      </Card>
    </main>
  );
}
