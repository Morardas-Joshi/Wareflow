'use client';

import React, { useState, useEffect } from 'react';
import { api } from '@/utils/api';
import { Plus, Search, Edit2, Package, Warehouse, ArrowLeftRight, Settings } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function InventoryPage() {
  const [activeTab, setActiveTab] = useState<'levels' | 'warehouses' | 'transfers'>('levels');
  const [inventoryLevels, setInventoryLevels] = useState<any[]>([]);
  const [warehouses, setWarehouses] = useState<any[]>([]);
  const [transfers, setTransfers] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [error, setError] = useState('');

  // Modal States
  const [isAdjustOpen, setIsAdjustOpen] = useState(false);
  const [isNewWhOpen, setIsNewWhOpen] = useState(false);
  const [isNewTransferOpen, setIsNewTransferOpen] = useState(false);

  // Stock Adjustment Form States
  const [adjustProductId, setAdjustProductId] = useState('');
  const [adjustWarehouseId, setAdjustWarehouseId] = useState('');
  const [adjustQty, setAdjustQty] = useState('0');
  const [adjustBatch, setAdjustBatch] = useState('DEFAULT');

  // New Warehouse Form States
  const [whCode, setWhCode] = useState('');
  const [whName, setWhName] = useState('');
  const [whLocation, setWhLocation] = useState('');

  // New Stock Transfer Form States
  const [transferSourceId, setTransferSourceId] = useState('');
  const [transferDestId, setTransferDestId] = useState('');
  const [transferNotes, setTransferNotes] = useState('');
  const [transferLines, setTransferLines] = useState<Array<{ productId: string; quantity: number }>>([
    { productId: '', quantity: 1 }
  ]);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = () => {
    setInventoryLevels(api.getInventoryLevels());
    const whs = api.getWarehouses();
    setWarehouses(whs);
    setTransfers(api.getStockTransfers());
    
    const prods = api.getProducts();
    setProducts(prods);

    if (whs.length > 0) {
      setAdjustWarehouseId(whs[0].id);
      setTransferSourceId(whs[0].id);
      if (whs.length > 1) {
        setTransferDestId(whs[1].id);
      } else {
        setTransferDestId(whs[0].id);
      }
    }
    if (prods.length > 0) {
      setAdjustProductId(prods[0].id);
    }
  };

  // ==========================================
  // HANDLERS
  // ==========================================

  const handleOpenAdjust = (level?: any) => {
    loadData();
    if (level) {
      setAdjustProductId(level.productId);
      setAdjustWarehouseId(level.warehouseId);
      setAdjustQty(level.quantityOnHand.toString());
      setAdjustBatch(level.batchNumber || 'DEFAULT');
    } else {
      if (products.length > 0) setAdjustProductId(products[0].id);
      if (warehouses.length > 0) setAdjustWarehouseId(warehouses[0].id);
      setAdjustQty('0');
      setAdjustBatch('DEFAULT');
    }
    setError('');
    setIsAdjustOpen(true);
  };

  const handleSaveAdjustment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!adjustProductId || !adjustWarehouseId || adjustQty === '') {
      setError('Please fill in all fields.');
      return;
    }

    api.adjustInventory({
      productId: adjustProductId,
      warehouseId: adjustWarehouseId,
      quantityOnHand: parseInt(adjustQty, 10) || 0,
      batchNumber: adjustBatch,
    });

    setIsAdjustOpen(false);
    loadData();
  };

  const handleOpenNewWh = () => {
    setWhCode(`WH-${Math.floor(100 + Math.random() * 900)}`);
    setWhName('');
    setWhLocation('');
    setError('');
    setIsNewWhOpen(true);
  };

  const handleSaveWarehouse = (e: React.FormEvent) => {
    e.preventDefault();
    if (!whCode || !whName) {
      setError('Code and Name are required.');
      return;
    }

    // Check duplicate code
    const duplicate = warehouses.find((w) => w.code.toLowerCase() === whCode.toLowerCase());
    if (duplicate) {
      setError(`Warehouse with code ${whCode} already exists.`);
      return;
    }

    api.createWarehouse({
      code: whCode,
      name: whName,
      location: whLocation,
    });

    setIsNewWhOpen(false);
    loadData();
  };

  const handleOpenNewTransfer = () => {
    loadData();
    setTransferLines([{ productId: products[0]?.id || '', quantity: 1 }]);
    setTransferNotes('');
    setError('');
    setIsNewTransferOpen(true);
  };

  const handleAddTransferLine = () => {
    setTransferLines([...transferLines, { productId: '', quantity: 1 }]);
  };

  const handleRemoveTransferLine = (idx: number) => {
    if (transferLines.length === 1) return;
    setTransferLines(transferLines.filter((_, i) => i !== idx));
  };

  const handleTransferLineChange = (idx: number, field: string, value: any) => {
    const updated = [...transferLines];
    (updated[idx] as any)[field] = value;
    setTransferLines(updated);
  };

  const handleSaveTransfer = (e: React.FormEvent) => {
    e.preventDefault();
    if (!transferSourceId || !transferDestId) {
      setError('Source and Destination warehouses are required.');
      return;
    }

    if (transferSourceId === transferDestId) {
      setError('Source and Destination warehouses must be different.');
      return;
    }

    const validLines = transferLines.filter((l) => l.productId && l.quantity > 0);
    if (validLines.length === 0) {
      setError('Please add at least one transfer item.');
      return;
    }

    // Verify stock availability in source warehouse
    for (const line of validLines) {
      const sourceStock = inventoryLevels.filter(
        (inv) => inv.productId === line.productId && inv.warehouseId === transferSourceId
      );
      const totalAvailable = sourceStock.reduce((sum, item) => sum + item.quantityAvailable, 0);
      if (totalAvailable < line.quantity) {
        const prod = products.find((p) => p.id === line.productId);
        setError(`Insufficient stock for ${prod?.name || 'product'}. Available: ${totalAvailable}, Transfer: ${line.quantity}`);
        return;
      }
    }

    api.createStockTransfer({
      sourceId: transferSourceId,
      destinationId: transferDestId,
      notes: transferNotes,
      lines: validLines,
    });

    setIsNewTransferOpen(false);
    loadData();
  };

  // Filter lists
  const filteredLevels = inventoryLevels.filter((inv) => {
    return inv.product?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
           inv.product?.sku.toLowerCase().includes(searchTerm.toLowerCase()) ||
           inv.warehouse?.name.toLowerCase().includes(searchTerm.toLowerCase());
  });

  const filteredTransfers = transfers.filter((t) => {
    return t.referenceNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
           t.source?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
           t.destination?.name.toLowerCase().includes(searchTerm.toLowerCase());
  });

  return (
    <div className="p-6 md:p-8 space-y-6 max-w-7xl mx-auto">
      {/* Top Banner */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 flex items-center gap-2">
            <Package className="text-teal-700" size={28} />
            Inventory Control
          </h1>
          <p className="text-sm text-slate-500 mt-1">Track physical stock counts, balance locations, and execute warehouse transfers.</p>
        </div>
        
        <div className="flex gap-2">
          {activeTab === 'warehouses' && (
            <button
              onClick={handleOpenNewWh}
              className="flex items-center justify-center gap-2 h-10 px-4 rounded-xl bg-teal-700 text-white text-sm font-semibold hover:bg-teal-800 active:scale-95 transition-all shadow-md shadow-teal-700/10"
            >
              <Plus size={18} />
              New Warehouse
            </button>
          )}
          {activeTab === 'transfers' && (
            <button
              onClick={handleOpenNewTransfer}
              className="flex items-center justify-center gap-2 h-10 px-4 rounded-xl bg-teal-700 text-white text-sm font-semibold hover:bg-teal-800 active:scale-95 transition-all shadow-md shadow-teal-700/10"
            >
              <ArrowLeftRight size={16} />
              New Transfer
            </button>
          )}
          {activeTab === 'levels' && (
            <button
              onClick={() => handleOpenAdjust()}
              className="flex items-center justify-center gap-2 h-10 px-4 rounded-xl bg-teal-700 text-white text-sm font-semibold hover:bg-teal-800 active:scale-95 transition-all shadow-md shadow-teal-700/10"
            >
              <Settings size={16} />
              Adjust Stock
            </button>
          )}
        </div>
      </div>

      {/* Tabs Selector */}
      <div className="flex border-b border-slate-200">
        <button
          onClick={() => { setActiveTab('levels'); setSearchTerm(''); }}
          className={`px-4 py-2.5 font-semibold text-sm border-b-2 transition-all flex items-center gap-2 ${
            activeTab === 'levels'
              ? 'border-teal-700 text-teal-700'
              : 'border-transparent text-slate-400 hover:text-slate-600'
          }`}
        >
          <Package size={16} />
          Stock Levels
        </button>
        <button
          onClick={() => { setActiveTab('warehouses'); setSearchTerm(''); }}
          className={`px-4 py-2.5 font-semibold text-sm border-b-2 transition-all flex items-center gap-2 ${
            activeTab === 'warehouses'
              ? 'border-teal-700 text-teal-700'
              : 'border-transparent text-slate-400 hover:text-slate-600'
          }`}
        >
          <Warehouse size={16} />
          Warehouses
        </button>
        <button
          onClick={() => { setActiveTab('transfers'); setSearchTerm(''); }}
          className={`px-4 py-2.5 font-semibold text-sm border-b-2 transition-all flex items-center gap-2 ${
            activeTab === 'transfers'
              ? 'border-teal-700 text-teal-700'
              : 'border-transparent text-slate-400 hover:text-slate-600'
          }`}
        >
          <ArrowLeftRight size={16} />
          Stock Transfers
        </button>
      </div>

      {/* Search Filter bar */}
      {activeTab !== 'warehouses' && (
        <div className="bg-white border border-slate-100 p-4 rounded-2xl shadow-sm flex items-center">
          <div className="relative w-full sm:max-w-xs">
            <Search className="absolute left-3.5 top-2.5 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder={activeTab === 'levels' ? 'Search product or warehouse...' : 'Search transfer no. or depot...'}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="h-9 w-full rounded-xl border border-slate-200 bg-slate-50/50 pl-10 pr-4 text-sm outline-none focus:ring-2 focus:ring-teal-700/20 focus:border-teal-700 transition-all"
            />
          </div>
        </div>
      )}

      {/* TAB CONTENTS */}
      <div className="bg-white border border-slate-100 rounded-2xl shadow-sm overflow-hidden">
        {/* Tab 1: Stock Levels */}
        {activeTab === 'levels' && (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-100 text-xs font-bold text-slate-400 uppercase tracking-wider">
                  <th className="px-6 py-4">SKU Code</th>
                  <th className="px-6 py-4">Product Name</th>
                  <th className="px-6 py-4">Warehouse Location</th>
                  <th className="px-6 py-4">Batch Number</th>
                  <th className="px-6 py-4 text-right">Qty On Hand</th>
                  <th className="px-6 py-4 text-right">Qty Available</th>
                  <th className="px-6 py-4 text-right">Adjust</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {filteredLevels.map((level) => (
                  <tr key={level.id} className="hover:bg-slate-50/30 transition-colors">
                    <td className="px-6 py-4 font-mono font-medium text-slate-900">{level.product?.sku}</td>
                    <td className="px-6 py-4 font-semibold text-slate-800">{level.product?.name}</td>
                    <td className="px-6 py-4">{level.warehouse?.name} ({level.warehouse?.code})</td>
                    <td className="px-6 py-4">
                      <span className="bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded text-[10px] font-bold font-mono">
                        {level.batchNumber}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right font-bold text-slate-800">{level.quantityOnHand}</td>
                    <td className="px-6 py-4 text-right font-bold text-emerald-600">{level.quantityAvailable}</td>
                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={() => handleOpenAdjust(level)}
                        className="p-1 rounded-lg hover:bg-slate-100 text-teal-700 transition-colors"
                        title="Quick Adjust"
                      >
                        <Edit2 size={14} />
                      </button>
                    </td>
                  </tr>
                ))}
                {filteredLevels.length === 0 && (
                  <tr>
                    <td colSpan={7} className="text-center py-12 text-slate-400">
                      No inventory records found. Add stock via Purchase Receipts or manual adjustment.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* Tab 2: Warehouses */}
        {activeTab === 'warehouses' && (
          <div className="grid gap-6 p-6 sm:grid-cols-2 lg:grid-cols-3">
            {warehouses.map((wh) => (
              <div key={wh.id} className="border border-slate-200/80 rounded-2xl p-5 bg-slate-50/50 flex flex-col justify-between hover:shadow-sm transition-all">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="bg-teal-50 text-teal-700 px-2 py-0.5 rounded text-[10px] font-extrabold font-mono uppercase border border-teal-100">
                      {wh.code}
                    </span>
                    <Warehouse className="text-slate-400" size={18} />
                  </div>
                  <h3 className="font-bold text-slate-800 text-base">{wh.name}</h3>
                  <p className="text-xs text-slate-500">📍 {wh.location || 'No location address listed.'}</p>
                </div>
                
                <div className="border-t border-slate-200/60 pt-4 mt-5 flex justify-between text-xs text-slate-500 font-semibold">
                  <span>Stock Items Managed</span>
                  <span className="text-slate-900 font-bold">{wh._count?.inventory ?? 0} sku types</span>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Tab 3: Stock Transfers */}
        {activeTab === 'transfers' && (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-100 text-xs font-bold text-slate-400 uppercase tracking-wider">
                  <th className="px-6 py-4">Reference No.</th>
                  <th className="px-6 py-4">Source Depot</th>
                  <th className="px-6 py-4">Destination Depot</th>
                  <th className="px-6 py-4">Created Date</th>
                  <th className="px-6 py-4">Transfer Lines</th>
                  <th className="px-6 py-4 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {filteredTransfers.map((tr) => (
                  <tr key={tr.id} className="hover:bg-slate-50/30 transition-colors">
                    <td className="px-6 py-4 font-mono font-bold text-slate-900">{tr.referenceNumber}</td>
                    <td className="px-6 py-4">{tr.source?.name} ({tr.source?.code})</td>
                    <td className="px-6 py-4">{tr.destination?.name} ({tr.destination?.code})</td>
                    <td className="px-6 py-4 text-slate-500">{new Date(tr.createdAt).toLocaleDateString()}</td>
                    <td className="px-6 py-4">
                      <div className="space-y-1 text-xs">
                        {tr.lines?.map((line: any) => (
                          <div key={line.id} className="text-slate-600 font-medium">
                            • {line.product?.name}: <span className="font-bold text-slate-800">{line.quantity} units</span>
                          </div>
                        ))}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <span className="inline-flex px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wide bg-emerald-50 text-emerald-600">
                        {tr.status}
                      </span>
                    </td>
                  </tr>
                ))}
                {filteredTransfers.length === 0 && (
                  <tr>
                    <td colSpan={6} className="text-center py-12 text-slate-400">
                      No stock transfers found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Stock Adjustment Modal */}
      <AnimatePresence>
        {isAdjustOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white border border-slate-200 rounded-2xl shadow-xl w-full max-w-md overflow-hidden flex flex-col"
            >
              <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
                <h3 className="font-bold text-slate-800 text-base">Adjust Stock Level</h3>
                <button onClick={() => setIsAdjustOpen(false)} className="text-slate-400 hover:text-slate-600 font-semibold">✕</button>
              </div>

              <form onSubmit={handleSaveAdjustment} className="p-6 space-y-4">
                {error && (
                  <div className="p-3 bg-red-50 border border-red-200 text-red-600 rounded-xl text-xs font-semibold">
                    {error}
                  </div>
                )}

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700">Product *</label>
                  <select
                    value={adjustProductId}
                    onChange={(e) => setAdjustProductId(e.target.value)}
                    className="w-full h-10 px-3 rounded-xl border border-slate-200 outline-none text-sm bg-white"
                  >
                    {products.map((p) => (
                      <option key={p.id} value={p.id}>{p.name} ({p.sku})</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700">Warehouse Location *</label>
                  <select
                    value={adjustWarehouseId}
                    onChange={(e) => setAdjustWarehouseId(e.target.value)}
                    className="w-full h-10 px-3 rounded-xl border border-slate-200 outline-none text-sm bg-white"
                  >
                    {warehouses.map((w) => (
                      <option key={w.id} value={w.id}>{w.name}</option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700">Qty On Hand *</label>
                    <input
                      type="number"
                      min="0"
                      value={adjustQty}
                      onChange={(e) => setAdjustQty(e.target.value)}
                      className="w-full h-10 px-3 rounded-xl border border-slate-200 outline-none text-sm"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700">Batch Code</label>
                    <input
                      type="text"
                      value={adjustBatch}
                      onChange={(e) => setAdjustBatch(e.target.value)}
                      className="w-full h-10 px-3 rounded-xl border border-slate-200 outline-none text-sm"
                    />
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3 bg-white">
                  <button
                    type="button"
                    onClick={() => setIsAdjustOpen(false)}
                    className="h-10 px-4 rounded-xl border border-slate-200 text-slate-600 text-sm font-semibold hover:bg-slate-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="h-10 px-5 rounded-xl bg-teal-700 text-white text-sm font-semibold hover:bg-teal-800"
                  >
                    Apply Adjustment
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* New Warehouse Modal */}
      <AnimatePresence>
        {isNewWhOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white border border-slate-200 rounded-2xl shadow-xl w-full max-w-md overflow-hidden flex flex-col"
            >
              <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
                <h3 className="font-bold text-slate-800 text-base">Add New Warehouse</h3>
                <button onClick={() => setIsNewWhOpen(false)} className="text-slate-400 hover:text-slate-600 font-semibold">✕</button>
              </div>

              <form onSubmit={handleSaveWarehouse} className="p-6 space-y-4">
                {error && (
                  <div className="p-3 bg-red-50 border border-red-200 text-red-600 rounded-xl text-xs font-semibold">
                    {error}
                  </div>
                )}

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700">Code (Unique identifier) *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. WH-PNJ"
                    value={whCode}
                    onChange={(e) => setWhCode(e.target.value)}
                    className="w-full h-10 px-3 rounded-xl border border-slate-200 outline-none text-sm"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700">Warehouse Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Panjim Depot"
                    value={whName}
                    onChange={(e) => setWhName(e.target.value)}
                    className="w-full h-10 px-3 rounded-xl border border-slate-200 outline-none text-sm"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700">Physical Address / Location</label>
                  <input
                    type="text"
                    placeholder="e.g. Panjim, Goa, India"
                    value={whLocation}
                    onChange={(e) => setWhLocation(e.target.value)}
                    className="w-full h-10 px-3 rounded-xl border border-slate-200 outline-none text-sm"
                  />
                </div>

                <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3 bg-white">
                  <button
                    type="button"
                    onClick={() => setIsNewWhOpen(false)}
                    className="h-10 px-4 rounded-xl border border-slate-200 text-slate-600 text-sm font-semibold hover:bg-slate-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="h-10 px-5 rounded-xl bg-teal-700 text-white text-sm font-semibold hover:bg-teal-800"
                  >
                    Create Depot
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* New Stock Transfer Modal */}
      <AnimatePresence>
        {isNewTransferOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white border border-slate-200 rounded-2xl shadow-xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]"
            >
              <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
                <h3 className="font-bold text-slate-800 text-base">Create Stock Transfer</h3>
                <button onClick={() => setIsNewTransferOpen(false)} className="text-slate-400 hover:text-slate-600 font-semibold">✕</button>
              </div>

              <form onSubmit={handleSaveTransfer} className="p-6 space-y-4 overflow-y-auto flex-1">
                {error && (
                  <div className="p-3 bg-red-50 border border-red-200 text-red-600 rounded-xl text-xs font-semibold">
                    {error}
                  </div>
                )}

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700">Source Warehouse Depot *</label>
                    <select
                      value={transferSourceId}
                      onChange={(e) => setTransferSourceId(e.target.value)}
                      className="w-full h-10 px-3 rounded-xl border border-slate-200 outline-none text-sm bg-white"
                    >
                      {warehouses.map((w) => (
                        <option key={w.id} value={w.id}>{w.name}</option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700">Destination Warehouse Depot *</label>
                    <select
                      value={transferDestId}
                      onChange={(e) => setTransferDestId(e.target.value)}
                      className="w-full h-10 px-3 rounded-xl border border-slate-200 outline-none text-sm bg-white"
                    >
                      {warehouses.map((w) => (
                        <option key={w.id} value={w.id}>{w.name}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Transfer items lists */}
                <div className="space-y-3 pt-2">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-1.5">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">Transfer Lines</h4>
                    <button
                      type="button"
                      onClick={handleAddTransferLine}
                      className="text-xs font-bold text-teal-700 hover:text-teal-800"
                    >
                      + Add Line
                    </button>
                  </div>

                  <div className="space-y-3">
                    {transferLines.map((line, idx) => (
                      <div key={idx} className="flex gap-3 items-end bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                        <div className="flex-1 space-y-1">
                          <label className="text-[10px] font-bold text-slate-500">Product</label>
                          <select
                            value={line.productId}
                            onChange={(e) => handleTransferLineChange(idx, 'productId', e.target.value)}
                            className="w-full h-8 px-2 rounded-lg border border-slate-200 bg-white text-xs outline-none"
                          >
                            <option value="">Select product...</option>
                            {products.map((p) => (
                              <option key={p.id} value={p.id}>{p.name} ({p.sku})</option>
                            ))}
                          </select>
                        </div>

                        <div className="w-28 space-y-1">
                          <label className="text-[10px] font-bold text-slate-500">Quantity</label>
                          <input
                            type="number"
                            min="1"
                            value={line.quantity}
                            onChange={(e) => handleTransferLineChange(idx, 'quantity', parseInt(e.target.value) || 0)}
                            className="w-full h-8 px-2 rounded-lg border border-slate-200 bg-white text-xs outline-none"
                          />
                        </div>

                        <button
                          type="button"
                          onClick={() => handleRemoveTransferLine(idx)}
                          className="h-8 px-2 text-slate-400 hover:text-red-500 rounded-lg hover:bg-slate-100 transition-colors"
                        >
                          ✕
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="space-y-1.5 pt-2">
                  <label className="text-xs font-bold text-slate-700">Internal Transfer Notes</label>
                  <textarea
                    placeholder="Provide justification or courier tracking numbers for this stock move..."
                    value={transferNotes}
                    onChange={(e) => setTransferNotes(e.target.value)}
                    rows={2}
                    className="w-full p-2.5 rounded-xl border border-slate-200 text-xs resize-none"
                  />
                </div>

                <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3 bg-white">
                  <button
                    type="button"
                    onClick={() => setIsNewTransferOpen(false)}
                    className="h-10 px-4 rounded-xl border border-slate-200 text-slate-600 text-sm font-semibold hover:bg-slate-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="h-10 px-5 rounded-xl bg-teal-700 text-white text-sm font-semibold hover:bg-teal-800 flex items-center gap-1.5"
                  >
                    <ArrowLeftRight size={14} />
                    Confirm Transfer
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
