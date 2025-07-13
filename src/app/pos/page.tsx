// src/app/pos/page.tsx
import POSInterface from '@/components/pos/POSInterface';
import { Suspense } from 'react';

export default function POSPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <POSInterface />
    </Suspense>
  );
}