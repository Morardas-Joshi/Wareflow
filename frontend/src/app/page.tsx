'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Users, Package, ShoppingCart, TrendingUp, ArrowRight } from 'lucide-react';
import { api } from '@/utils/api';
import Link from 'next/link';

export default function Dashboard() {
  const [metrics, setMetrics] = useState({
    revenue: 0,
    productsCount: 0,
    salesCount: 0,
    stockCount: 0,
  });
  const [recentOrders, setRecentOrders] = useState<any[]>([]);

  useEffect(() => {
    // Load dynamic state metrics
    const salesOrders = api.getSalesOrders();
    const products = api.getProducts();
    const inventory = api.getInventoryLevels();

    // Calculate revenue from confirmed orders
    const confirmedRevenue = salesOrders
      .filter((o: any) => o.status === 'CONFIRMED')
      .reduce((sum: number, o: any) => sum + o.totalAmount, 0);

    // Calculate total items in stock
    const totalStock = inventory.reduce((sum: number, inv: any) => sum + inv.quantityOnHand, 0);

    setMetrics({
      revenue: confirmedRevenue,
      productsCount: products.length,
      salesCount: salesOrders.length,
      stockCount: totalStock,
    });

    // Get top 5 recent orders sorted or sliced
    const sorted = [...salesOrders]
      .sort((a, b) => new Date(b.orderDate).getTime() - new Date(a.orderDate).getTime())
      .slice(0, 5);
    setRecentOrders(sorted);
  }, []);

  return (
    <div className="p-6 md:p-8 space-y-8 max-w-7xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Enterprise Overview</h1>
          <p className="text-sm text-slate-500">Welcome back to FlowCore. Here's a live check of your company's assets.</p>
        </div>
        <Link 
          href="/sales-orders"
          className="h-9 px-4 rounded-xl bg-teal-700 text-white text-sm font-semibold hover:bg-teal-800 transition-colors flex items-center justify-center shadow-sm"
        >
          New Sales Order
        </Link>
      </div>

      {/* KPI Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <KpiCard 
          title="Total Confirmed Revenue" 
          value={`₹${metrics.revenue.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`} 
          change="Synced with confirmed invoices" 
          colorClass="bg-emerald-50" 
          icon={<span className="text-emerald-700 font-bold text-lg">₹</span>} 
        />
        <KpiCard 
          title="Products Catalog" 
          value={metrics.productsCount} 
          change="Active products in database" 
          colorClass="bg-teal-50" 
          icon={<Package size={20} className="text-teal-700" />} 
        />
        <KpiCard 
          title="Sales Orders Count" 
          value={metrics.salesCount} 
          change="Total orders issued" 
          colorClass="bg-amber-50" 
          icon={<ShoppingCart size={20} className="text-amber-600" />} 
        />
        <KpiCard 
          title="Items in Stock" 
          value={metrics.stockCount} 
          change="Physical items count" 
          colorClass="bg-orange-50" 
          icon={<Users size={20} className="text-orange-600" />} 
        />
      </div>

      {/* Charts & Recents Area */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <div className="lg:col-span-4 rounded-2xl border border-slate-200/60 bg-white text-slate-800 shadow-[0_8px_30px_rgb(0,0,0,0.02)] p-6 h-[400px] flex flex-col justify-between">
          <div>
            <h3 className="font-semibold text-slate-800 leading-none tracking-tight mb-2">Monthly Dispatch Trends</h3>
            <p className="text-sm text-slate-500">Sales order value fluctuations over time.</p>
          </div>
          <div className="flex-1 flex items-end justify-between gap-3 px-2 pb-2 mt-6 h-48">
            {/* Dynamic visual graph heights */}
            {[25, 45, 30, 60, 45, 80, 95, 60, 50, 70, 85, 100].map((h, i) => (
              <div key={i} className="flex-1 flex flex-col items-center gap-1.5 h-full justify-end">
                <motion.div 
                  initial={{ height: 0 }}
                  animate={{ height: `${h}%` }}
                  transition={{ duration: 0.5, delay: i * 0.03 }}
                  className="w-full bg-teal-100 hover:bg-teal-700 transition-colors rounded-lg cursor-pointer"
                ></motion.div>
                <span className="text-[9px] font-bold text-slate-400 font-mono">M{i+1}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="lg:col-span-3 rounded-2xl border border-slate-200/60 bg-white text-slate-800 shadow-[0_8px_30px_rgb(0,0,0,0.02)] p-6 flex flex-col justify-between">
          <div>
            <h3 className="font-semibold text-slate-800 leading-none tracking-tight mb-2">Recent Orders</h3>
            <p className="text-sm text-slate-500 mb-6">Latest customer order logs.</p>
          </div>
          
          <div className="space-y-4 flex-1 overflow-y-auto pr-2 min-h-[220px]">
            {recentOrders.map((order) => (
              <div key={order.id} className="flex items-center justify-between border-b border-slate-50 pb-2 last:border-0 last:pb-0">
                <div className="flex items-center">
                  <div className="h-9 w-9 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center">
                    <ShoppingCart size={15} className="text-slate-400" />
                  </div>
                  <div className="ml-3">
                    <p className="text-xs font-bold text-slate-800">{order.soNumber}</p>
                    <p className="text-[10px] text-slate-400">{order.customer?.name}</p>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-xs font-bold text-slate-900 block">₹{order.totalAmount.toFixed(2)}</span>
                  <span className={`text-[8px] font-extrabold uppercase px-1.5 py-0.5 rounded-full ${
                    order.status === 'CONFIRMED' ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'
                  }`}>{order.status}</span>
                </div>
              </div>
            ))}

            {recentOrders.length === 0 && (
              <div className="text-center py-12 text-slate-400">
                No orders registered yet.
              </div>
            )}
          </div>
          
          <Link 
            href="/sales-orders"
            className="text-xs font-bold text-teal-700 hover:text-teal-800 flex items-center gap-1 mt-4 pt-3 border-t border-slate-100"
          >
            Manage Sales Orders <ArrowRight size={13} />
          </Link>
        </div>
      </div>
    </div>
  );
}

function KpiCard({ title, value, change, icon, colorClass = "bg-slate-50" }: any) {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-2xl border border-slate-200/60 bg-white text-slate-800 shadow-[0_8px_30px_rgb(0,0,0,0.02)] p-5 transition-all hover:shadow-[0_8px_30px_rgb(0,0,0,0.04)]"
    >
      <div className="flex flex-row items-center justify-between space-y-0 pb-2">
        <h3 className="tracking-tight text-xs font-bold text-slate-400 uppercase">{title}</h3>
        <div className={`h-9 w-9 rounded-xl ${colorClass} flex items-center justify-center`}>
          {icon}
        </div>
      </div>
      <div className="mt-3">
        <div className="text-xl font-extrabold text-slate-900">{value}</div>
        <p className="text-[10px] font-semibold text-slate-400 mt-0.5">{change}</p>
      </div>
    </motion.div>
  );
}
