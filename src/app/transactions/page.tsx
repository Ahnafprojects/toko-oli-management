// src/app/transactions/page.tsx
import TransactionList from "@/components/transactions/TransactionList";

export default function TransactionsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Histori Transaksi</h1>
        <p className="text-muted-foreground">
          Lihat, filter, dan ekspor semua riwayat penjualan Anda.
        </p>
      </div>
      <TransactionList />
    </div>
  );
}
