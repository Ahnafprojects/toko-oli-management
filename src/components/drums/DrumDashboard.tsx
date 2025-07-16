// src/components/drums/DrumDashboard.tsx
'use client';

import { useState, useEffect } from 'react';
import { Product } from '@prisma/client';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Droplets, Edit, Pipette } from 'lucide-react';
import DrumSaleModal from './DrumSaleModal';
import UpdateVolumeModal from './UpdateVolumeModal';
import { useCartStore } from '@/store/cartStore';
import { useRouter } from 'next/navigation';
import { Toaster } from 'react-hot-toast';

type DrumProduct = Omit<Product, 'buyPrice'|'sellPrice'> & {
  buyPrice: number;
  sellPrice: number;
}

export default function DrumDashboard() {
  const [drums, setDrums] = useState<DrumProduct[]>([]);
  const [loading, setLoading] = useState(true);
  
  // STATE UNTUK MENGONTROL MODAL
  const [drumForSale, setDrumForSale] = useState<DrumProduct | null>(null);
  const [drumToUpdate, setDrumToUpdate] = useState<DrumProduct | null>(null);

  const router = useRouter();
  const { addToCart } = useCartStore();

  const fetchDrums = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/drums');
      const data = await response.json();
      const safeData = data.map((d: Product) => ({
        ...d,
        buyPrice: Number(d.buyPrice),
        sellPrice: Number(d.sellPrice)
      }));
      setDrums(safeData);
    } catch (error) {
      console.error("Gagal memuat data drum:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDrums();
  }, []);

  // PERBAIKAN: Logika ini tidak lagi memanggil API
  const handleSaleSuccess = (values: { quantitySoldMl: number; salePrice: number; }) => {
    if (!drumForSale) return;
    
    // 1. Buat produk "virtual" untuk keranjang
    const customCartItem: any = {
      // Gunakan ID asli drum untuk referensi, tapi tambahkan suffix unik
      // agar bisa dibedakan jika ada beberapa penjualan dari drum yang sama
      id: `drum-sale-${drumForSale.id}-${Date.now()}`, 
      originalProductId: drumForSale.id, // Simpan ID asli drum
      isDrumSale: true, // Penanda bahwa ini adalah penjualan drum
      quantitySoldMl: values.quantitySoldMl, // Simpan jumlah ml yang dijual
      name: `${drumForSale.name} (Eceran ${values.quantitySoldMl} ml)`,
      sellPrice: values.salePrice, // Harga jual adalah total harga dari modal
      stock: Infinity, // Stok tidak relevan untuk item virtual ini
      unit: 'paket',
    };

  // src/components/drums/DrumDashboard.tsx, PERBAIKAN

// src/components/drums/DrumDashboard.tsx
// [BENAR] - Memberikan DUA argumen: item, dan objek { quantity }
addToCart(customCartItem, { quantity: 1 });
    // 3. Tutup modal dan arahkan ke kasir
    setDrumForSale(null);
    alert("Penjualan eceran berhasil ditambahkan ke kasir!");
    router.push('/pos');
  };

  const handleUpdateSuccess = () => {
    setDrumToUpdate(null); // Tutup modal update
    fetchDrums(); // Ambil ulang data drum untuk melihat volume terbaru
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
      <Toaster position="top-center" />
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
                  Sisa Volume: <strong>{drum.currentVolumeMl?.toLocaleString() || 0}</strong> / {drum.initialVolumeMl?.toLocaleString() || 0} ml
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Progress value={percentage} className="h-2" />
              </CardContent>
              <CardFooter className="grid grid-cols-2 gap-2">
                <Button className="w-full" onClick={() => setDrumForSale(drum)} disabled={(drum.currentVolumeMl ?? 0) === 0}>
                  <Pipette className="w-4 h-4 mr-2" />
                  {drum.currentVolumeMl === 0 ? 'Volume Habis' : 'Jual Eceran'}
                </Button>
                {/* TOMBOL UPDATE VOLUME */}
                <Button variant="secondary" className="w-full" onClick={() => setDrumToUpdate(drum)}>
                  <Edit className="w-4 h-4 mr-2" />
                  Update Volume
                </Button>
              </CardFooter>
            </Card>
          );
        })}
      </div>
      
      {/* Modal Penjualan Eceran */}
      <DrumSaleModal
        isOpen={!!drumForSale}
        onClose={() => setDrumForSale(null)}
        drum={drumForSale}
        onSuccess={handleSaleSuccess}
      />
      
      {/* MODAL UPDATE VOLUME */}
      <UpdateVolumeModal
        isOpen={!!drumToUpdate}
        onClose={() => setDrumToUpdate(null)}
        drum={drumToUpdate}
        onSuccess={handleUpdateSuccess}
      />
    </>
  );
}