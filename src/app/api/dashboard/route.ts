// src/app/api/dashboard/route.ts

import { NextResponse, NextRequest } from 'next/server';
import prisma from '@/lib/prisma';
import { startOfToday, endOfToday, startOfMonth, endOfMonth, startOfYear, endOfYear, format } from 'date-fns';
import { id as localeID } from 'date-fns/locale';

export const dynamic = 'force-dynamic';

// --- FUNGSI HELPER YANG DIPERBARUI ---
async function getStatsForRange(from: Date, to: Date) {
    const transactions = await prisma.transaction.findMany({
        where: { 
            createdAt: { gte: from, lte: to } 
        },
        include: {
            // Kita perlu mengambil item dan produk terkait untuk menghitung profit
            items: {
                include: {
                    product: {
                        select: {
                            buyPrice: true, // Ambil harga beli dari setiap produk
                        }
                    }
                }
            }
        }
    });

    const totalSales = transactions.reduce((sum, t) => sum + t.totalAmount.toNumber(), 0);
    
    // --- PERHITUNGAN PROFIT YANG SEBENARNYA ---
    const totalProfit = transactions.reduce((profitSum, transaction) => {
        const transactionProfit = transaction.items.reduce((itemSum, item) => {
            const profitPerItem = (item.price.toNumber() - item.product.buyPrice.toNumber()) * item.quantity;
            return itemSum + profitPerItem;
        }, 0);
        return profitSum + transactionProfit;
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
        const fromDate = fromParam ? new Date(fromParam) : startOfMonth(new Date());
        const toDate = toParam ? new Date(toParam) : endOfToday();

        // Panggil fungsi helper untuk setiap rentang waktu
        const todayStats = await getStatsForRange(startOfToday(), endOfToday());
        const monthStats = await getStatsForRange(startOfMonth(new Date()), endOfMonth(new Date()));
        const yearStats = await getStatsForRange(startOfYear(new Date()), endOfYear(new Date()));
        const customRangeStats = await getStatsForRange(fromDate, toDate);
        
        // --- Produk Stok Rendah ---
        const lowStockCount = await prisma.product.count({
            where: {
                stock: { lte: prisma.product.fields.minStock },
                isActive: true,
            },
        });
        
        // --- Data Chart Penjualan ---
        const salesDataForChart = await prisma.transaction.groupBy({
            by: ['createdAt'],
            where: { createdAt: { gte: fromDate, lte: toDate } },
            _sum: { totalAmount: true },
            orderBy: { createdAt: 'asc' },
        });
        
        const chartData = salesDataForChart.map(item => ({
            date: format(item.createdAt, 'dd MMM', { locale: localeID }),
            Penjualan: item._sum.totalAmount?.toNumber() || 0,
        }));

        // --- Produk Terlaris ---
        const topSellingProductsRaw = await prisma.transactionItem.groupBy({
            by: ['productId'],
            where: { transaction: { createdAt: { gte: fromDate, lte: toDate } } },
            _sum: { quantity: true },
            orderBy: { _sum: { quantity: 'desc' } },
            take: 5,
        });

        const productDetails = await prisma.product.findMany({
            where: { id: { in: topSellingProductsRaw.map(p => p.productId) } },
            select: { id: true, name: true },
        });

        const topSellingProducts = topSellingProductsRaw.map(p => ({
            name: productDetails.find(pd => pd.id === p.productId)?.name || 'N/A',
            totalSold: p._sum.quantity || 0,
        }));

        return NextResponse.json({
            todayStats,
            monthStats,
            yearStats,
            inventoryStats: { lowStockCount },
            customRangeStats,
            topSellingProducts,
            salesDataForChart: chartData,
        });

    } catch (error) {
        console.error("Error fetching dashboard data:", error);
        return new NextResponse("Internal Server Error", { status: 500 });
    }
}