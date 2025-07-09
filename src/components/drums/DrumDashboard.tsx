// src/components/drums/DrumDashboard.tsx
'use client';

import { useState, useEffect } from 'react';
import { Product } from '@prisma/client';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Droplets } from 'lucide-react';
import DrumSaleModal from './DrumSaleModal';
import { useCartStore } from '@/store/cartStore';
import { useRouter } from 'next/navigation';

type DrumProduct = Omit<Product, 'buyPrice'|'sellPrice'> & {
  buyPrice: number;
  sellPrice: number;
}

export default function DrumDashboard() {
  const [drums, setDrums] = useState<DrumProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDrum, setSelectedDrum] = useState<DrumProduct | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const router = useRouter();
  const { addToCart } = useCartStore();

  const fetchDrums = async () => {
    setLoading(true);
    const response = await fetch('/api/drums');
    const data = await response.json();
    const safeData = data.map((d: Product) => ({
        ...d,
        buyPrice: Number(d.buyPrice),
        sellPrice: Number(d.sellPrice)
    }));
    setDrums(safeData);
    setLoading(false);
  };

  useEffect(() => {
    fetchDrums();
  }, []);

  const handleOpenSaleModal = (drum: DrumProduct) => {
    setSelectedDrum(drum);
    setIsModalOpen(true);
  };

  // PERBAIKAN: Logika ini tidak lagi memanggil API
  const handleSaleSuccess = (values: { quantitySoldMl: number; salePrice: number; }) => {
    if (!selectedDrum) return;
    
    // 1. Buat produk "virtual" untuk keranjang
    const customCartItem: any = {
      // Gunakan ID asli drum untuk referensi, tapi tambahkan suffix unik
      // agar bisa dibedakan jika ada beberapa penjualan dari drum yang sama
      id: `drum-sale-${selectedDrum.id}-${Date.now()}`, 
      originalProductId: selectedDrum.id, // Simpan ID asli drum
      isDrumSale: true, // Penanda bahwa ini adalah penjualan drum
      quantitySoldMl: values.quantitySoldMl, // Simpan jumlah ml yang dijual
      name: `${selectedDrum.name} (Eceran ${values.quantitySoldMl} ml)`,
      sellPrice: values.salePrice, // Harga jual adalah total harga dari modal
      stock: Infinity, // Stok tidak relevan untuk item virtual ini
      unit: 'paket',
    };

    // 2. Tambahkan ke keranjang dengan kuantitas 1 (sebagai satu paket)
    addToCart(customCartItem, 1);

    // 3. Tutup modal dan arahkan ke kasir
    setIsModalOpen(false);
    alert("Penjualan eceran berhasil ditambahkan ke kasir!");
    router.push('/pos');
  };

  if (loading) return <div>Memuat data drum...</div>;
  
  if (!loading && drums.length === 0) {
    return (
        <div className="text-center p-8 border rounded-lg bg-gray-50">
            <h3 className="text-xl font-semibold">Belum Ada Produk Drum</h3>
            <p className="text-muted-foreground mt-2">
                Silakan tambahkan produk baru dan tandai sebagai "Drum" untuk mulai mengelola penjualan eceran.
            </p>
        </div>
    )
  }

  return (
    <>
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {drums.map((drum) => {
          const percentage = drum.initialVolumeMl && drum.currentVolumeMl
            ? (drum.currentVolumeMl / drum.initialVolumeMl) * 100
            : 0;
          
          return (
            <Card key={drum.id}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Droplets className="w-6 h-6 text-blue-500" />
                  {drum.name}
                </CardTitle>
                <CardDescription>
                  Satuan Beli: {drum.unit}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <div className="flex justify-between text-sm text-muted-foreground mb-1">
                    <span>Sisa Volume</span>
                    <span className="font-semibold text-foreground">
                      {drum.currentVolumeMl?.toLocaleString() || 0} / {drum.initialVolumeMl?.toLocaleString() || 0} ml
                    </span>
                  </div>
                  <Progress value={percentage} />
                </div>
              </CardContent>
              <CardFooter>
                <Button className="w-full" onClick={() => handleOpenSaleModal(drum)} disabled={drum.currentVolumeMl === 0}>
                  {drum.currentVolumeMl === 0 ? 'Volume Habis' : 'Jual Eceran'}
                </Button>
              </CardFooter>
            </Card>
          );
        })}
      </div>
      
      <DrumSaleModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        drum={selectedDrum}
        onSuccess={handleSaleSuccess}
      />
    </>
  );
}
