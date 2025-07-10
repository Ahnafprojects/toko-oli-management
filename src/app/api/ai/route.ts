// src/app/api/ai/route.ts
import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { subDays, startOfDay, endOfDay, startOfWeek, endOfWeek, startOfMonth, endOfMonth } from 'date-fns';
import { id as localeID } from 'date-fns/locale';

// PERBAIKAN TOTAL: Fungsi ini sekarang melakukan pra-analisis data yang komprehensif
async function getBusinessContext() {
  const now = new Date();
  
  // Tentukan semua rentang waktu yang relevan
  const periods = {
    today: { from: startOfDay(now), to: endOfDay(now) },
    thisWeek: { from: startOfWeek(now, { locale: localeID }), to: endOfWeek(now, { locale: localeID }) },
    thisMonth: { from: startOfMonth(now), to: endOfMonth(now) },
  };

  // Fungsi helper untuk menghitung statistik penjualan & keuntungan
  const calculateStats = async (startDate: Date, endDate: Date) => {
    const transactions = await prisma.transaction.findMany({
      where: { createdAt: { gte: startDate, lte: endDate } },
      include: { items: { include: { product: { select: { buyPrice: true } } } } },
    });
    const drumSales = await prisma.drumSale.findMany({
      where: { createdAt: { gte: startDate, lte: endDate } },
      include: { product: { select: { buyPrice: true, initialVolumeMl: true } } },
    });

    let totalSales = 0;
    let totalCost = 0;
    const transactionCount = transactions.length + drumSales.length;

    transactions.forEach(t => {
      totalSales += t.totalAmount.toNumber();
      t.items.forEach(item => {
        totalCost += (item.product.buyPrice?.toNumber() || 0) * item.quantity;
      });
    });

    drumSales.forEach(ds => {
      totalSales += ds.salePrice.toNumber();
      if (ds.product.initialVolumeMl && ds.product.initialVolumeMl > 0) {
        const costPerMl = (ds.product.buyPrice?.toNumber() || 0) / ds.product.initialVolumeMl;
        totalCost += costPerMl * ds.quantitySoldMl;
      }
    });

    return {
      totalSales: `Rp ${totalSales.toLocaleString('id-ID')}`,
      totalProfit: `Rp ${(totalSales - totalCost).toLocaleString('id-ID')}`,
      transactionCount,
    };
  };

  // 1. Dapatkan statistik untuk semua periode
  const todayStats = await calculateStats(periods.today.from, periods.today.to);
  const thisWeekStats = await calculateStats(periods.thisWeek.from, periods.thisWeek.to);
  const thisMonthStats = await calculateStats(periods.thisMonth.from, periods.thisMonth.to);

  // 2. Dapatkan status stok produk non-drum
  const allProducts = await prisma.product.findMany({ where: { isDrum: false } });
  const lowStockProducts = allProducts.filter(p => p.stock > 0 && p.stock <= p.minStock).map(p => `${p.name} (sisa ${p.stock})`);
  const outOfStockProducts = allProducts.filter(p => p.stock === 0).map(p => p.name);

  // 3. Dapatkan produk terlaris (30 hari terakhir)
  const last30DaysStart = startOfDay(subDays(now, 29));
  const topProductsRaw = await prisma.transactionItem.groupBy({
    by: ['productId'],
    where: { transaction: { createdAt: { gte: last30DaysStart }}},
    _sum: { quantity: true },
    orderBy: { _sum: { quantity: 'desc' } },
    take: 5,
  });
  const topProductDetails = await prisma.product.findMany({
    where: { id: { in: topProductsRaw.map(p => p.productId) } },
  });
  const topSellingProducts = topProductsRaw.map(p => {
    const details = topProductDetails.find(pd => pd.id === p.productId);
    return `${details?.name || 'N/A'} (${p._sum.quantity} terjual)`;
  });

  // 4. Siapkan konteks yang sudah matang dan terstruktur untuk AI
  const context = `
    - **Statistik Hari Ini**: ${JSON.stringify(todayStats)}
    - **Statistik Minggu Ini**: ${JSON.stringify(thisWeekStats)}
    - **Statistik Bulan Ini**: ${JSON.stringify(thisMonthStats)}
    - **Produk Stok Habis**: [${outOfStockProducts.join(', ') || 'Tidak ada'}]
    - **Produk Stok Menipis**: [${lowStockProducts.join(', ') || 'Tidak ada'}]
    - **Produk Terlaris (30 hari terakhir)**: [${topSellingProducts.join(', ') || 'Tidak ada'}]
  `.trim();

  return context;
}

export async function POST(request: Request) {
  try {
    const { prompt: userPrompt } = await request.json();

    if (!userPrompt) {
      return new NextResponse(JSON.stringify({ message: 'Prompt tidak boleh kosong.' }), { status: 400 });
    }

    const businessContext = await getBusinessContext();

    // PERBAIKAN: Prompt sistem yang paling tegas
    const systemPrompt = `
      Anda adalah AI konsultan bisnis untuk toko oli.
      
      ATURAN MUTLAK:
      1.  **BAHASA:** Gunakan HANYA Bahasa Indonesia yang formal dan sopan. JANGAN PERNAH menggunakan bahasa lain.
      2.  **SUMBER DATA:** Jawaban Anda HARUS 100% berdasarkan "Konteks Data Bisnis" yang saya berikan. DILARANG KERAS mengarang, berasumsi, atau menyimpulkan di luar data yang ada.
      3.  **LOGIKA:** Jika ditanya tentang "keuntungan hari ini", lihat nilai "totalProfit" di dalam "Statistik Hari Ini". Jika ditanya "produk terlaris", lihat daftar "Produk Terlaris". Jika pengguna menanyakan rentang waktu kustom (misal: "dari tanggal 9 sampai 10 Juli"), jawab dengan sopan: "Maaf, saya hanya bisa memberikan data untuk periode hari ini, minggu ini, atau bulan ini."
      4.  **GAYA JAWABAN:** Jawab dengan singkat, akurat, dan langsung ke intinya.

      ---
      **Konteks Data Bisnis (Satu-satunya Sumber Kebenaran):**
      ${businessContext}
      ---
    `;

    const groqApiKey = "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";
    const groqApiUrl = "https://api.groq.com/openai/v1/chat/completions";
    
    const payload = {
      model: "llama3-8b-8192",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt }
      ],
      temperature: 0, // Dibuat 0 agar tidak kreatif dan hanya menjawab berdasarkan fakta
    };

    const apiResponse = await fetch(groqApiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${groqApiKey}`,
      },
      body: JSON.stringify(payload),
    });

    if (!apiResponse.ok) {
        const errorBody = await apiResponse.text();
        console.error("Groq API Error:", errorBody);
        throw new Error(`AI API request failed with status ${apiResponse.status}`);
    }

    const result = await apiResponse.json();
    const aiResponseText = result.choices?.[0]?.message?.content || "Maaf, saya tidak dapat memproses permintaan Anda saat ini.";

    return NextResponse.json({ response: aiResponseText });

  } catch (error: any) {
    console.error("AI Assistant API error:", error);
    return new NextResponse(JSON.stringify({ message: error.message || 'Internal Server Error' }), { status: 500 });
  }
}
