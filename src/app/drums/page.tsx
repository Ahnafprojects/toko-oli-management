// src/app/drums/page.tsx
import DrumDashboard from "@/components/drums/DrumDashboard";
export const dynamic = 'force-dynamic';
//shds
export default function DrumsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Dashboard Manajemen Drum</h1>
        <p className="text-muted-foreground">
          Kelola dan catat penjualan eceran dari setiap drum oli Anda.
        </p>
      </div>
      <DrumDashboard />
    </div>
  );
}
