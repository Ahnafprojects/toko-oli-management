'use client';

import React, { useRef, useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { useReactToPrint } from 'react-to-print';

const TestReceipt = React.forwardRef<HTMLDivElement>((_, ref) => {
  const [tanggal, setTanggal] = React.useState<string>('');

  useEffect(() => {
    setTanggal(new Date().toLocaleString('id-ID'));
  }, []);

  return (
    <div ref={ref} id="receipt" className="p-4 bg-white text-black text-sm font-mono w-[300px]">
      <h1 className="text-center font-bold">Test Struk</h1>
      <p>Tanggal: {tanggal}</p>
      <hr className="my-2 border-dashed border-black" />
      <p>Produk A x 2 = Rp20.000</p>
      <p>Produk B x 1 = Rp10.000</p>
      <hr className="my-2 border-dashed border-black" />
      <p className="font-bold">TOTAL: Rp30.000</p>
    </div>
  );
});
TestReceipt.displayName = 'TestReceipt';

export default function TestPrintPage() {
  const receiptRef = useRef<HTMLDivElement>(null);
  const [canPrint, setCanPrint] = useState(false);

  const handlePrint = useReactToPrint({
    content: () => receiptRef.current,
    documentTitle: 'Test Struk',
  });

  useEffect(() => {
    // Delay agar komponen siap
    setTimeout(() => setCanPrint(true), 300);
  }, []);

  return (
    <div className="p-6 space-y-4">
      <TestReceipt ref={receiptRef} />
      <Button onClick={handlePrint} disabled={!canPrint}>
        Cetak Struk Test
      </Button>
    </div>
  );
}
