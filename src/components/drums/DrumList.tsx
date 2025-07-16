'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Product } from '@prisma/client';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Droplets, Pipette, Edit } from 'lucide-react';
import DrumSaleModal from './DrumSaleModal';
import UpdateVolumeModal from './UpdateVolumeModal';
import { useCartStore } from '@/store/cartStore';
import { Toaster } from 'react-hot-toast';
import Decimal from 'decimal.js';

// Tipe data yang aman yang diterima dari server
type SafeDrumProduct = Omit<Product, 'buyPrice' | 'sellPrice'> & {
  buyPrice: number;
  sellPrice: number;
};

interface DrumListProps {
  initialDrums: SafeDrumProduct[];
}

export default function DrumList({ initialDrums }: DrumListProps) {
  const router = useRouter();
  const { addToCart } = useCartStore();

  // State untuk mengontrol modal mana yang terbuka
  const [drumToSell, setDrumToSell] = useState<SafeDrumProduct | null>(null);
  const [drumToUpdate, setDrumToUpdate] = useState<SafeDrumProduct | null>(null);

  // Fungsi ini dipanggil dari dalam DrumSaleModal setelah sukses
  const handleSaleSuccess = (drum: SafeDrumProduct, saleDetails: { quantitySoldMl: number; salePrice: number; }) => {
    const customCartItem: any = {
      ...drum,
      id: `drum-sale-${drum.id}-${Date.now()}`,
      originalProductId: drum.id,
      isDrumSale: true,
      quantitySoldMl: saleDetails.quantitySoldMl,
      name: `${drum.name} (Eceran ${saleDetails.quantitySoldMl} ml)`,
      sellPrice: new Decimal(saleDetails.salePrice),
      stock: Infinity,
      unit: 'paket',
    };

    const wasAdded = addToCart(customCartItem, 1);

    if (wasAdded) {
      setDrumToSell(null);
      router.push('/pos');
    }
  };

  return (
    <>
      <Toaster position="top-center" />
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {initialDrums.map((drum) => {
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
                <CardDescription>Sisa Volume</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold mb-2">
                  {drum.currentVolumeMl?.toLocaleString('id-ID') || 0} <span className="text-sm font-normal text-muted-foreground">ml</span>
                </div>
                <Progress value={percentage} className="h-2" />
                <p className="text-xs text-muted-foreground mt-2 text-center">{percentage.toFixed(1)}% terisi</p>
              </CardContent>
              <CardFooter className="grid grid-cols-2 gap-2">
                <Button className="w-full" onClick={() => setDrumToSell(drum)} disabled={(drum.currentVolumeMl ?? 0) === 0}>
                  <Pipette className="w-4 h-4 mr-2" />
                  {drum.currentVolumeMl === 0 ? 'Volume Habis' : 'Jual Eceran'}
                </Button>
                <Button variant="secondary" className="w-full" onClick={() => setDrumToUpdate(drum)}>
                  <Edit className="w-4 h-4 mr-2" />
                   Update
                </Button>
              </CardFooter>
            </Card>
          );
        })}
      </div>

      <DrumSaleModal
        isOpen={!!drumToSell}
        onClose={() => setDrumToSell(null)}
        drum={drumToSell}
        onSuccess={(values) => handleSaleSuccess(drumToSell!, values)}
      />

      <UpdateVolumeModal
        isOpen={!!drumToUpdate}
        onClose={() => setDrumToUpdate(null)}
        drum={drumToUpdate}
        onSuccess={() => {
            setDrumToUpdate(null);
            router.refresh();
        }}
      />
    </>
  );
}
