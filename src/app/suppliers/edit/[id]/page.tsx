// src/app/suppliers/edit/[id]/page.tsx

import SupplierForm from "@/components/suppliers/SupplierForm";
import prisma from "@/lib/prisma";
import { notFound } from "next/navigation";

interface EditSupplierPageProps {
  params: {
    id: string;
  };
}

export default async function EditSupplierPage({ params }: EditSupplierPageProps) {
  const supplier = await prisma.supplier.findUnique({
    where: { id: params.id },
  });

  if (!supplier) {
    notFound();
  }

  return <SupplierForm initialData={supplier} />;
}