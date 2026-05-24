'use client';

import React, { useState, useEffect } from 'react';
import { api } from '@/utils/api';
import { TrendingUp, AlertTriangle, Building } from 'lucide-react';
import { motion } from 'framer-motion';

export default function ReportsPage() {
  const [customerSales, setCustomerSales] = useState<any[]>([]);
  const [lowStock, setLowStock] = useState<any[]>([]);
  const [warehouseValues, setWarehouseValues] = useState<any[]>([]);

  useEffect(() => {
    // 1. Calculate Sales by Customer
    const salesOrders = api.getSalesOrders();
    const customers = api.getCustomers();
    
    const customerMap: Record<string, number> = {};
    salesOrders.forEach((o: any) => {
      if (o.status === 'CONFIRMED') {
        customerMap[o.customerId] = (customerMap[o.customerId] || 0) + o.totalAmount;
      }
    });

    const salesList = customers.map((c: any) => ({
      name: c.name,
      company: c.company || 'N/A',
      totalSales: customerMap[c.id] || 0
    })).sort((a: any, b: any) => b.totalSales - a.totalSales);

    setCustomerSales(salesList);

    // 2. Calculate Warehouse Inventory Values
    const inventory = api.getInventoryLevels();
    const warehouses = api.getWarehouses();

    const warehouseMap: Record<string, { name: string; code: string; totalValue: number; totalQty: number }> = {};
    warehouses.forEach((w) => {
      warehouseMap[w.id] = { name: w.name, code: w.code, totalValue: 0, totalQty: 0 };
    });

    inventory.forEach((inv) => {
      if (warehouseMap[inv.warehouseId]) {
        const cost = inv.product?.costPrice || 0;
        warehouseMap[inv.warehouseId].totalValue += inv.quantityOnHand * cost;
        warehouseMap[inv.warehouseId].totalQty += inv.quantityOnHand;
      }
    });

    setWarehouseValues(Object.values(warehouseMap));

    // 3. Find Low Stock Items (quantityOnHand < reorderLevel)
    const products = api.getProducts();
    const lowStockList: any[] = [];

    products.forEach((prod) => {
      const prodInv = inventory.filter((inv) => inv.productId === prod.id);
      const totalQty = prodInv.reduce((sum, item) => sum + item.quantityOnHand, 0);
      const reorder = prod.reorderLevel || 10;
      if (totalQty < reorder) {
        lowStockList.push({
          sku: prod.sku,
          name: prod.name,
          currentQty: totalQty,
          reorderLevel: reorder,
        });
      }
    });

    setLowStock(lowStockList);
  }, []);

  return (
    <div className="p-6 md:p-8 space-y-8 max-w-7xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">Business Intelligence Reports</h1>
        <p className="text-sm text-slate-500">Live operational analytical reports, audits, and metrics.</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Low Stock Alerts */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          className="border border-red-100 rounded-2xl bg-white p-5 shadow-sm space-y-4"
        >
          <div className="flex items-center gap-2 text-red-600">
            <AlertTriangle size={20} />
            <h3 className="font-bold text-slate-800 text-sm uppercase tracking-wider">Low Stock Warnings</h3>
          </div>
          
          <div className="space-y-3 max-h-[220px] overflow-y-auto pr-1">
            {lowStock.map((item, idx) => (
              <div key={idx} className="flex justify-between items-center bg-red-50/50 p-3 rounded-xl border border-red-100 text-xs">
                <div>
                  <span className="font-bold text-slate-800">{item.name}</span>
                  <span className="block font-mono text-[10px] text-slate-400 mt-0.5">{item.sku}</span>
                </div>
                <div className="text-right">
                  <span className="font-extrabold text-red-600 block">{item.currentQty} in stock</span>
                  <span className="text-[10px] text-slate-400">Reorder limit: {item.reorderLevel}</span>
                </div>
              </div>
            ))}

            {lowStock.length === 0 && (
              <div className="text-slate-400 text-center py-8 text-xs font-semibold">
                ✅ All products satisfy reorder level thresholds.
              </div>
            )}
          </div>
        </motion.div>

        {/* Warehouse Stock Valuation */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="border border-slate-100 rounded-2xl bg-white p-5 shadow-sm space-y-4"
        >
          <div className="flex items-center gap-2 text-teal-700">
            <Building size={20} />
            <h3 className="font-bold text-slate-800 text-sm uppercase tracking-wider">Warehouse Asset Valuations</h3>
          </div>

          <div className="space-y-3">
            {warehouseValues.map((wh, idx) => (
              <div key={idx} className="flex justify-between items-center border-b border-slate-50 pb-2 last:border-0 last:pb-0 text-xs">
                <div>
                  <span className="font-bold text-slate-800">{wh.name}</span>
                  <span className="block text-[10px] font-bold text-teal-700 mt-0.5">{wh.code}</span>
                </div>
                <div className="text-right">
                  <span className="font-extrabold text-slate-900 block">₹{wh.totalValue.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                  <span className="text-[10px] text-slate-400 font-medium">{wh.totalQty} total units</span>
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Top Customers Sales */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="col-span-full border border-slate-100 rounded-2xl bg-white p-5 shadow-sm space-y-4"
        >
          <div className="flex items-center gap-2 text-emerald-700">
            <TrendingUp size={20} />
            <h3 className="font-bold text-slate-800 text-sm uppercase tracking-wider">Sales Breakdown by Client</h3>
          </div>

          <div className="border border-slate-100 rounded-xl overflow-hidden">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-100 font-bold text-slate-400 uppercase tracking-wider">
                  <th className="px-4 py-3">Client Name</th>
                  <th className="px-4 py-3">Company</th>
                  <th className="px-4 py-3 text-right">Invoice Sum (₹)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {customerSales.map((cust, idx) => (
                  <tr key={idx} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-4 py-3 font-semibold text-slate-800">{cust.name}</td>
                    <td className="px-4 py-3">{cust.company}</td>
                    <td className="px-4 py-3 text-right font-extrabold text-slate-900">₹{cust.totalSales.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
                  </tr>
                ))}

                {customerSales.length === 0 && (
                  <tr>
                    <td colSpan={3} className="text-center py-6 text-slate-400">
                      No invoices registered.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
