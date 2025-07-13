// src/app/api/dashboard/route.ts

import { NextResponse, NextRequest } from 'next/server';
import prisma from '@/lib/prisma';
import { startOfToday, endOfToday, startOfMonth, endOfMonth, startOfYear, endOfYear } from 'date-fns';

export const dynamic = 'force-dynamic';

async function getStatsForRange(from: Date, to: Date) {
    const transactions = await prisma.transaction.findMany({
        where: {
            createdAt: {
                gte: from,
                lte: to,
            },
        },
    });

    const totalSales = transactions.reduce((sum, t) => sum + t.totalAmount.toNumber(), 0);
    const totalProfit = transactions.reduce((sum, t) => {
        // Asumsi keuntungan dihitung dari selisih totalAmount dan paidAmount jika ada,
        // atau Anda bisa menambahkan logika profit yang lebih kompleks di sini.
        // Untuk sekarang kita asumsikan profit sama dengan sales untuk kesederhanaan.
        return sum + t.totalAmount.toNumber(); // Ganti dengan logika profit Anda
    }, 0);

    return {
        totalSales,
        totalProfit,
        transactionCount: transactions.length,
    };
}

export async function GET(request: NextRequest) {
    const { searchParams } = new URL(request.url);
    const fromParam = searchParams.get('from');
    const toParam = searchParams.get('to');

    try {
        // --- Statistik Hari Ini ---
        const todayStats = await getStatsForRange(startOfToday(), endOfToday());

        // --- Statistik Bulan Ini --- (TAMBAHAN BARU)
        const monthStats = await getStatsForRange(startOfMonth(new Date()), endOfMonth(new Date()));

        // --- Statistik Tahun Ini --- (TAMBAHAN BARU)
        const yearStats = await getStatsForRange(startOfYear(new Date()), endOfYear(new Date()));

        // --- Statistik Rentang Waktu Kustom ---
        const customRangeStats = fromParam && toParam
            ? await getStatsForRange(new Date(fromParam), new Date(toParam))
            : { totalSales: 0, totalProfit: 0, transactionCount: 0 };
        
        // --- Produk Stok Rendah ---
        const lowStockCount = await prisma.product.count({
            where: {
                stock: {
                    lte: prisma.product.fields.minStock,
                },
            },
        });
        
        // --- Produk Terlaris ---
        const topSellingProducts = await prisma.transactionItem.groupBy({
            by: ['productId'],
            _sum: {
                quantity: true,
            },
            orderBy: {
                _sum: {
                    quantity: 'desc',
                },
            },
            take: 5,
        });

        const productDetails = await prisma.product.findMany({
            where: {
                id: { in: topSellingProducts.map(p => p.productId) },
            },
            select: { id: true, name: true },
        });

        const topProducts = topSellingProducts.map(p => {
            const detail = productDetails.find(pd => pd.id === p.productId);
            return {
                name: detail?.name || 'Produk tidak ditemukan',
                totalSold: p._sum.quantity || 0,
            };
        });

        return NextResponse.json({
            todayStats,
            monthStats, // <-- Mengirim data bulan ini
            yearStats,  // <-- Mengirim data tahun ini
            inventoryStats: { lowStockCount },
            customRangeStats,
            topSellingProducts: topProducts,
        });

    } catch (error) {
        console.error("Error fetching dashboard data:", error);
        return new NextResponse("Internal Server Error", { status: 500 });
    }
}