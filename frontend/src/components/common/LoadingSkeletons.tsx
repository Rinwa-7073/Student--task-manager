import { Skeleton } from '@/components/ui/Skeleton';
import { Card, CardContent, CardHeader } from '@/components/ui/Card';

export function StatCardSkeleton() {
  return (
    <Card>
      <CardHeader>
        <Skeleton className="h-3 w-20" />
      </CardHeader>
      <CardContent>
        <Skeleton className="h-8 w-16" />
      </CardContent>
    </Card>
  );
}

export function TaskRowSkeleton() {
  return (
    <div className="flex items-center gap-4 border-b border-default px-4 py-3.5">
      <Skeleton className="h-4 w-4 shrink-0 rounded" />
      <Skeleton className="h-4 w-1/3" />
      <Skeleton className="h-5 w-16 rounded-full" />
      <Skeleton className="h-5 w-16 rounded-full" />
      <Skeleton className="ml-auto h-4 w-20" />
    </div>
  );
}

export function TaskTableSkeleton({ rows = 5 }: { rows?: number }) {
  return (
    <div className="overflow-hidden rounded-xl border border-default bg-surface">
      {Array.from({ length: rows }).map((_, i) => (
        <TaskRowSkeleton key={i} />
      ))}
    </div>
  );
}
