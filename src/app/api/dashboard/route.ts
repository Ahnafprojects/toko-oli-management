// src/app/api/dashboard/route.ts
import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { startOfDay, endOfDay, subDays, parseISO } from 'date-fns';
import { Prisma } from '@prisma/client';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const from = searchParams.get('from');
    const to = searchParams.get('to');

    const startDate = from ? startOfDay(parseISO(from)) : startOfDay(subDays(new Date(), 29));
    const endDate = to ? endOfDay(parseISO(to)) : endOfDay(new Date());
    
    const todayStart = startOfDay(new Date());
    const todayEnd = endOfDay(new Date());

    const allTransactionsInPeriod = await prisma.transaction.findMany({
      where: { createdAt: { gte: startDate, lte: endDate } },
      include: { items: { include: { product: { select: { buyPrice: true } } } } },
    });

    const allDrumSalesInPeriod = await prisma.drumSale.findMany({
      where: { createdAt: { gte: startDate, lte: endDate } },
      include: { product: { select: { buyPrice: true, initialVolumeMl: true } } },
    });

    const calculateStatsForPeriod = (start: Date, end: Date) => {
      let totalSales = 0;
      let totalCost = 0;
      let transactionCount = 0;

      const periodTransactions = allTransactionsInPeriod.filter(t => t.createdAt >= start && t.createdAt <= end);
      transactionCount += periodTransactions.length;
      
      periodTransactions.forEach(t => {
        totalSales += t.totalAmount.toNumber();
        t.items.forEach(item => {
          totalCost += item.product.buyPrice.toNumber() * item.quantity;
        });
      });

      allDrumSalesInPeriod
        .filter(ds => ds.createdAt >= start && ds.createdAt <= end)
        .forEach(ds => {
          transactionCount++;
          totalSales += ds.salePrice.toNumber();
          if (ds.product.initialVolumeMl && ds.product.initialVolumeMl > 0) {
            const costPerMl = ds.product.buyPrice.toNumber() / ds.product.initialVolumeMl;
            totalCost += costPerMl * ds.quantitySoldMl;
          }
        });

      return { totalSales, totalProfit: totalSales - totalCost, transactionCount };
    };

    const todayStats = calculateStatsForPeriod(todayStart, todayEnd);
    const customRangeStats = calculateStatsForPeriod(startDate, endDate);

    const allProductsForStockCheck = await prisma.product.findMany({
        where: { isDrum: false },
        select: { stock: true, minStock: true }
    });
    const lowStockProducts = allProductsForStockCheck.filter(p => p.stock <= p.minStock).length;

    const topProducts = await prisma.transactionItem.groupBy({
        by: ['productId'],
        where: { transaction: { createdAt: { gte: startDate, lte: endDate } } },
        _sum: { quantity: true },
        orderBy: { _sum: { quantity: 'desc' } },
        take: 5,
    });
    const productDetails = await prisma.product.findMany({
        where: { id: { in: topProducts.map(p => p.productId) } }
    });
    const topSellingProducts = topProducts.map(p => ({
        name: productDetails.find(pd => pd.id === p.productId)?.name || 'Produk Dihapus',
        totalSold: p._sum.quantity || 0
    }));

    // PERBAIKAN: Struktur data disesuaikan dengan yang diharapkan oleh frontend
    const dashboardData = {
      todayStats: todayStats,
      customRangeStats,
      inventoryStats: {
        lowStockCount: lowStockProducts,
      },
      topSellingProducts,
    };

    return NextResponse.json(dashboardData);
  } catch (error) {
    console.error("Error fetching dashboard data:", error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
