// src/app/login/page.tsx

import { Suspense } from 'react';
import LoginForm from '@/components/auth/LoginForm';
import { Skeleton } from '@/components/ui/skeleton';

// Komponen loading sederhana untuk fallback Suspense
function LoginFormSkeleton() {
    return (
        <div className="w-full max-w-md">
            <Skeleton className="h-[480px] w-full rounded-xl" />
        </div>
    );
}

export default function LoginPage() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100 px-4">
      <Suspense fallback={<LoginFormSkeleton />}>
        <LoginForm />
      </Suspense>
    </div>
  );
}