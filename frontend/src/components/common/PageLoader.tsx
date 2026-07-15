import { Loader2 } from 'lucide-react';

export function PageLoader() {
  return (
    <div className="flex h-64 items-center justify-center">
      <Loader2 className="h-5 w-5 animate-spin text-secondary" aria-hidden="true" />
    </div>
  );
}
