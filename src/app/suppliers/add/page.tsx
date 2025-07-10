// src/app/suppliers/add/page.tsx
import SupplierForm from "@/components/suppliers/SupplierForm";

export default function AddSupplierPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Tambah Supplier Baru</h1>
        <p className="text-muted-foreground">
          Isi detail di bawah ini untuk menambahkan data pemasok baru.
        </p>
      </div>
      <SupplierForm />
    </div>
  );
}
