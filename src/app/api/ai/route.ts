// src/app/api/ai/route.ts
import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { subDays, startOfDay } from 'date-fns';

// Fungsi untuk mengambil data relevan dari database (tetap sama)
async function getBusinessContext() {
  const last30DaysStart = startOfDay(subDays(new Date(), 29));

  const transactions = await prisma.transaction.findMany({
    where: { createdAt: { gte: last30DaysStart } },
    include: {
      items: { include: { product: true } },
      drumSales: { include: { product: true } },
    },
  });

  const products = await prisma.product.findMany({
    select: { name: true, stock: true, minStock: true, unit: true, isDrum: true, currentVolumeMl: true },
  });

  const simplifiedTransactions = transactions.map(t => ({
    tanggal: t.createdAt.toISOString().split('T')[0],
    total: t.totalAmount.toNumber(),
    items: t.items.length + t.drumSales.length,
  }));

  return {
    transactions: simplifiedTransactions,
    products,
  };
}

export async function POST(request: Request) {
  try {
    const { prompt: userPrompt } = await request.json();

    if (!userPrompt) {
      return new NextResponse(JSON.stringify({ message: 'Prompt tidak boleh kosong.' }), { status: 400 });
    }

    const businessData = await getBusinessContext();

    // Susun prompt sistem dan prompt pengguna untuk Groq
    const systemPrompt = `
      Anda adalah seorang konsultan bisnis ahli untuk sebuah toko oli.
      Tugas Anda adalah memberikan analisis dan rekomendasi yang tajam, singkat, dan mudah dipahami berdasarkan data yang saya berikan.
      Selalu berikan jawaban dalam format Markdown.

      Berikut adalah data bisnis dalam 30 hari terakhir:
      - Data Transaksi: ${JSON.stringify(businessData.transactions)}
      - Data Stok Produk Saat Ini: ${JSON.stringify(businessData.products)}
    `;

    // PERBAIKAN: Menggunakan Groq API
    const groqApiKey = "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"; // API Key dari Anda
    const groqApiUrl = "https://api.groq.com/openai/v1/chat/completions";
    
    const payload = {
      model: "llama3-8b-8192", // Model yang cepat dari Groq
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt }
      ],
    };

    const apiResponse = await fetch(groqApiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${groqApiKey}`, // Menggunakan Bearer token
      },
      body: JSON.stringify(payload),
    });

    if (!apiResponse.ok) {
        const errorBody = await apiResponse.text();
        console.error("Groq API Error:", errorBody);
        throw new Error(`AI API request failed with status ${apiResponse.status}`);
    }

    const result = await apiResponse.json();
    // PERBAIKAN: Cara mengambil respons dari Groq
    const aiResponseText = result.choices?.[0]?.message?.content || "Maaf, saya tidak dapat memproses permintaan Anda saat ini.";

    return NextResponse.json({ response: aiResponseText });

  } catch (error: any) {
    console.error("AI Assistant API error:", error);
    return new NextResponse(JSON.stringify({ message: error.message || 'Internal Server Error' }), { status: 500 });
  }
}
