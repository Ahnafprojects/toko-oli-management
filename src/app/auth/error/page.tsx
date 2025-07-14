// src/app/auth/error/page.tsx

import { Suspense } from 'react';
import ErrorCard from '@/components/auth/ErrorCard';
import { Skeleton } from '@/components/ui/skeleton';

function ErrorCardSkeleton() {
    return <Skeleton className="h-[250px] w-full max-w-md" />;
}

export default function AuthErrorPage() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <Suspense fallback={<ErrorCardSkeleton />}>
        <ErrorCard />
      </Suspense>
    </div>
  );
}