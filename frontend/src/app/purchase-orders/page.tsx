'use client';

import React, { useState, useEffect } from 'react';
import { api } from '@/utils/api';
import { Plus, Search, Eye, Trash2, CheckCircle2, Building2, RefreshCw, ArrowDownToLine } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function PurchaseOrdersPage() {
  const [orders, setOrders] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [vendors, setVendors] = useState<any[]>([]);
  const [warehouses, setWarehouses] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [error, setError] = useState('');

  // Modal States
  const [isNewOpen, setIsNewOpen] = useState(false);
  const [isViewOpen, setIsViewOpen] = useState(false);
  const [isReceiveOpen, setIsReceiveOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<any | null>(null);

  // New Purchase Order Form States
  const [vendorId, setVendorId] = useState('');
  const [expectedDate, setExpectedDate] = useState('');
  const [terms, setTerms] = useState('Net 30');
  const [notes, setNotes] = useState('');
  const [taxAmount, setTaxAmount] = useState('0');
  const [orderLines, setOrderLines] = useState<Array<{ productId: string; quantity: number; unitPrice: number }>>([
    { productId: '', quantity: 1, unitPrice: 0 }
  ]);

  // Intake / Receive Items Form States
  const [receiveWarehouseId, setReceiveWarehouseId] = useState('');
  const [receiveQuantities, setReceiveQuantities] = useState<Record<string, number>>({});

  useEffect(() => {
    loadData();
  }, []);

  const loadData = () => {
    setOrders(api.getPurchaseOrders());
    const prods = api.getProducts();
    setProducts(prods);
    const vends = api.getVendors();
    setVendors(vends);
    const whs = api.getWarehouses();
    setWarehouses(whs);

    if (vends.length > 0) setVendorId(vends[0].id);
    if (whs.length > 0) setReceiveWarehouseId(whs[0].id);
  };

  const handleOpenNew = () => {
    loadData();
    setVendorId(vendors[0]?.id || '');
    setExpectedDate('');
    setTerms('Net 30');
    setNotes('');
    setTaxAmount('0');
    setOrderLines([{ productId: products[0]?.id || '', quantity: 1, unitPrice: products[0]?.costPrice || 0 }]);
    setError('');
    setIsNewOpen(true);
  };

  const handleAddLine = () => {
    setOrderLines([...orderLines, { productId: products[0]?.id || '', quantity: 1, unitPrice: products[0]?.costPrice || 0 }]);
  };

  const handleRemoveLine = (idx: number) => {
    if (orderLines.length === 1) return;
    setOrderLines(orderLines.filter((_, i) => i !== idx));
  };

  const handleLineProductChange = (index: number, prodId: string) => {
    const updated = [...orderLines];
    const prod = products.find((p) => p.id === prodId);
    updated[index].productId = prodId;
    updated[index].unitPrice = prod ? prod.costPrice : 0;
    setOrderLines(updated);
  };

  const handleLineValueChange = (index: number, field: 'quantity' | 'unitPrice', val: number) => {
    const updated = [...orderLines];
    updated[index][field] = val;
    setOrderLines(updated);
  };

  const handleCreateOrder = (e: React.FormEvent) => {
    e.preventDefault();
    if (!vendorId) {
      setError('Please select a supplier vendor.');
      return;
    }

    const validLines = orderLines.filter((l) => l.productId && l.quantity > 0);
    if (validLines.length === 0) {
      setError('Please add at least one valid product line.');
      return;
    }

    const payload = {
      vendorId,
      expectedDate: expectedDate || null,
      terms,
      notes,
      taxAmount: parseFloat(taxAmount) || 0,
      lines: validLines.map((l) => ({
        productId: l.productId,
        quantityOrdered: l.quantity,
        unitPrice: l.unitPrice,
      })),
    };

    api.createPurchaseOrder(payload);
    setIsNewOpen(false);
    loadData();
  };

  const handleApproveOrder = (orderId: string) => {
    api.updatePurchaseOrder(orderId, { status: 'APPROVED' });
    loadData();
    if (selectedOrder) {
      setSelectedOrder({ ...selectedOrder, status: 'APPROVED' });
    }
  };

  const handleOpenReceive = (order: any) => {
    setSelectedOrder(order);
    const initialRecs: Record<string, number> = {};
    order.lines.forEach((l: any) => {
      initialRecs[l.productId] = l.quantityOrdered - l.quantityReceived;
    });
    setReceiveQuantities(initialRecs);
    setIsReceiveOpen(true);
  };

  const handleReceiveItemsChange = (productId: string, val: number) => {
    setReceiveQuantities({ ...receiveQuantities, [productId]: val });
  };

  const handleConfirmReceipt = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedOrder || !receiveWarehouseId) return;

    const receiptLines = Object.entries(receiveQuantities)
      .map(([productId, quantityReceived]) => ({
        productId,
        quantityReceived: Number(quantityReceived) || 0,
      }))
      .filter((l) => l.quantityReceived > 0);

    if (receiptLines.length === 0) {
      alert('Please select quantities to receive.');
      return;
    }

    api.receivePurchaseOrderItems(selectedOrder.id, {
      warehouseId: receiveWarehouseId,
      items: receiptLines,
    });

    setIsReceiveOpen(false);
    setIsViewOpen(false);
    loadData();
  };

  const handleDelete = (id: string) => {
    if (confirm('Delete this purchase order draft?')) {
      api.deletePurchaseOrder(id);
      loadData();
    }
  };

  // Form running totals
  const formSubtotal = orderLines.reduce((sum, l) => sum + l.unitPrice * l.quantity, 0);
  const formTotal = formSubtotal + (parseFloat(taxAmount) || 0);

  const filteredOrders = orders.filter((o) => {
    return o.poNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
           o.vendor?.name.toLowerCase().includes(searchTerm.toLowerCase());
  });

  return (
    <div className="p-6 md:p-8 space-y-6 max-w-7xl mx-auto">
      {/* Top Banner */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 flex items-center gap-2">
            <Building2 className="text-teal-700" size={28} />
            Purchase Orders (Procurement)
          </h1>
          <p className="text-sm text-slate-500 mt-1">Manage vendor replenishment orders, receive stock, and verify invoice billing.</p>
        </div>
        <button
          onClick={handleOpenNew}
          className="flex items-center justify-center gap-2 h-10 px-4 rounded-xl bg-teal-700 text-white text-sm font-semibold hover:bg-teal-800 active:scale-95 transition-all shadow-md shadow-teal-700/10"
        >
          <Plus size={18} />
          New Purchase Order
        </button>
      </div>

      {/* Search Bar */}
      <div className="bg-white border border-slate-100 p-4 rounded-2xl shadow-sm flex items-center">
        <div className="relative w-full sm:max-w-xs">
          <Search className="absolute left-3.5 top-2.5 h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search order no. or vendor..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="h-9 w-full rounded-xl border border-slate-200 bg-slate-50/50 pl-10 pr-4 text-sm outline-none focus:ring-2 focus:ring-teal-700/20 focus:border-teal-700 transition-all"
          />
        </div>
      </div>

      {/* Grid Table list */}
      <div className="bg-white border border-slate-100 rounded-2xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-sm">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100 text-xs font-bold text-slate-400 uppercase tracking-wider">
                <th className="px-6 py-4">PO Reference</th>
                <th className="px-6 py-4">Supplier / Vendor</th>
                <th className="px-6 py-4">Order Date</th>
                <th className="px-6 py-4">Expected Delivery</th>
                <th className="px-6 py-4 text-right">Invoice Sum</th>
                <th className="px-6 py-4 text-center">Status</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {filteredOrders.map((order) => (
                <tr key={order.id} className="hover:bg-slate-50/30 transition-colors">
                  <td className="px-6 py-4 font-mono font-bold text-slate-900">{order.poNumber}</td>
                  <td className="px-6 py-4 font-semibold text-slate-800">{order.vendor?.name}</td>
                  <td className="px-6 py-4 text-slate-500">{new Date(order.orderDate).toLocaleDateString()}</td>
                  <td className="px-6 py-4 text-slate-500">
                    {order.expectedDate ? new Date(order.expectedDate).toLocaleDateString() : 'N/A'}
                  </td>
                  <td className="px-6 py-4 text-right font-bold text-slate-950">₹{order.totalAmount.toFixed(2)}</td>
                  <td className="px-6 py-4 text-center">
                    <span className={`inline-flex px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wide ${
                      order.status === 'RECEIVED'
                        ? 'bg-emerald-50 text-emerald-600'
                        : order.status === 'APPROVED'
                        ? 'bg-blue-50 text-blue-600'
                        : order.status === 'PARTIAL_RECEIPT'
                        ? 'bg-sky-50 text-sky-600'
                        : 'bg-amber-50 text-amber-600'
                    }`}>
                      {order.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex justify-end gap-1.5">
                      <button
                        onClick={() => { setSelectedOrder(order); setIsViewOpen(true); }}
                        className="p-1 rounded-lg hover:bg-slate-100 text-slate-500 hover:text-slate-900 transition-colors"
                        title="View Details"
                      >
                        <Eye size={15} />
                      </button>
                      {(order.status === 'APPROVED' || order.status === 'PARTIAL_RECEIPT') && (
                        <button
                          onClick={() => handleOpenReceive(order)}
                          className="p-1 rounded-lg hover:bg-teal-50 text-teal-700 transition-colors"
                          title="Intake stock (Receive)"
                        >
                          <ArrowDownToLine size={15} />
                        </button>
                      )}
                      {order.status === 'DRAFT' && (
                        <>
                          <button
                            onClick={() => handleApproveOrder(order.id)}
                            className="p-1 rounded-lg hover:bg-emerald-50 text-emerald-600 transition-colors"
                            title="Approve Order"
                          >
                            <CheckCircle2 size={15} />
                          </button>
                          <button
                            onClick={() => handleDelete(order.id)}
                            className="p-1 rounded-lg hover:bg-red-50 text-red-500 transition-colors"
                            title="Delete PO"
                          >
                            <Trash2 size={15} />
                          </button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
              {filteredOrders.length === 0 && (
                <tr>
                  <td colSpan={7} className="text-center py-12 text-slate-400 font-medium">
                    No procurement records registered.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* New PO Modal */}
      <AnimatePresence>
        {isNewOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white border border-slate-200 rounded-2xl shadow-xl w-full max-w-3xl overflow-hidden flex flex-col max-h-[90vh]"
            >
              <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
                <h3 className="font-bold text-slate-800 text-lg">Create Purchase Order</h3>
                <button onClick={() => setIsNewOpen(false)} className="text-slate-400 hover:text-slate-600 font-semibold">✕</button>
              </div>

              <form onSubmit={handleCreateOrder} className="p-6 space-y-4 overflow-y-auto flex-1">
                {error && (
                  <div className="p-3 bg-red-50 border border-red-200 text-red-600 rounded-xl text-xs font-semibold">
                    {error}
                  </div>
                )}

                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-1.5 col-span-3 sm:col-span-1">
                    <label className="text-xs font-bold text-slate-700">Vendor Supplier *</label>
                    <select
                      value={vendorId}
                      onChange={(e) => setVendorId(e.target.value)}
                      className="w-full h-10 px-3 rounded-xl border border-slate-200 outline-none text-sm bg-white"
                    >
                      {vendors.map((v) => (
                        <option key={v.id} value={v.id}>{v.name}</option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-1.5 col-span-3 sm:col-span-1">
                    <label className="text-xs font-bold text-slate-700">Expected Delivery</label>
                    <input
                      type="date"
                      value={expectedDate}
                      onChange={(e) => setExpectedDate(e.target.value)}
                      className="w-full h-10 px-3 rounded-xl border border-slate-200 outline-none text-sm"
                    />
                  </div>

                  <div className="space-y-1.5 col-span-3 sm:col-span-1">
                    <label className="text-xs font-bold text-slate-700">Payment Terms</label>
                    <select
                      value={terms}
                      onChange={(e) => setTerms(e.target.value)}
                      className="w-full h-10 px-3 rounded-xl border border-slate-200 outline-none text-sm bg-white"
                    >
                      <option value="Due on Receipt">Due on Receipt</option>
                      <option value="Net 15">Net 15</option>
                      <option value="Net 30">Net 30</option>
                      <option value="Net 60">Net 60</option>
                    </select>
                  </div>
                </div>

                {/* Items Line Editor */}
                <div className="space-y-3 pt-4">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-1.5">
                    <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider">Item Lines</h4>
                    <button
                      type="button"
                      onClick={handleAddLine}
                      className="text-xs font-bold text-teal-700 hover:text-teal-800"
                    >
                      + Add Item
                    </button>
                  </div>

                  <div className="space-y-3">
                    {orderLines.map((line, idx) => (
                      <div key={idx} className="flex gap-3 items-end bg-slate-50/50 p-3 rounded-xl border border-slate-200/60">
                        <div className="flex-1 space-y-1">
                          <label className="text-[10px] font-bold text-slate-500">Product</label>
                          <select
                            value={line.productId}
                            onChange={(e) => handleLineProductChange(idx, e.target.value)}
                            className="w-full h-8 px-2 rounded-lg border border-slate-200 bg-white text-xs outline-none"
                          >
                            {products.map((p) => (
                              <option key={p.id} value={p.id}>{p.name} (Cost: ₹{p.costPrice})</option>
                            ))}
                          </select>
                        </div>

                        <div className="w-24 space-y-1">
                          <label className="text-[10px] font-bold text-slate-500">Quantity</label>
                          <input
                            type="number"
                            min="1"
                            value={line.quantity}
                            onChange={(e) => handleLineValueChange(idx, 'quantity', parseInt(e.target.value) || 0)}
                            className="w-full h-8 px-2 rounded-lg border border-slate-200 bg-white text-xs outline-none"
                          />
                        </div>

                        <div className="w-28 space-y-1">
                          <label className="text-[10px] font-bold text-slate-500">Cost Price (₹)</label>
                          <input
                            type="number"
                            step="0.01"
                            value={line.unitPrice}
                            onChange={(e) => handleLineValueChange(idx, 'unitPrice', parseFloat(e.target.value) || 0)}
                            className="w-full h-8 px-2 rounded-lg border border-slate-200 bg-white text-xs outline-none"
                          />
                        </div>

                        <button
                          type="button"
                          onClick={() => handleRemoveLine(idx)}
                          className="h-8 px-2 text-slate-400 hover:text-red-500 transition-colors"
                        >
                          ✕
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 pt-4 border-t border-slate-100">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700">Tax Amount (₹)</label>
                    <input
                      type="number"
                      step="0.01"
                      value={taxAmount}
                      onChange={(e) => setTaxAmount(e.target.value)}
                      className="w-full h-10 px-3 rounded-xl border border-slate-200 outline-none text-sm"
                    />
                  </div>

                  <div className="flex flex-col justify-end items-end pr-2">
                    <span className="text-[10px] text-slate-400 font-bold uppercase">Estimated Total</span>
                    <span className="text-xl font-black text-slate-900">₹{formTotal.toFixed(2)}</span>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700">Internal procurement remarks</label>
                  <textarea
                    placeholder="Provide logistics or shipping notes..."
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    rows={2}
                    className="w-full p-2.5 rounded-xl border border-slate-200 text-xs resize-none"
                  />
                </div>

                <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3 bg-white">
                  <button
                    type="button"
                    onClick={() => setIsNewOpen(false)}
                    className="h-10 px-4 rounded-xl border border-slate-200 text-slate-600 text-sm font-semibold hover:bg-slate-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="h-10 px-5 rounded-xl bg-teal-700 text-white text-sm font-semibold hover:bg-teal-800"
                  >
                    Save Purchase Draft
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* View Details Drawer/Modal */}
      <AnimatePresence>
        {isViewOpen && selectedOrder && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white border border-slate-200 rounded-2xl shadow-xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]"
            >
              <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
                <div>
                  <h3 className="font-bold text-slate-800 text-base">Purchase Order Info</h3>
                  <span className="text-xs font-mono font-bold text-slate-400">{selectedOrder.poNumber}</span>
                </div>
                <button onClick={() => setIsViewOpen(false)} className="text-slate-400 hover:text-slate-600 font-semibold">✕</button>
              </div>

              <div className="p-6 space-y-6 overflow-y-auto flex-1">
                {/* Header Metadata */}
                <div className="grid grid-cols-2 gap-4 text-xs">
                  <div className="space-y-1">
                    <span className="text-slate-400 block font-semibold uppercase">Vendor Supplier</span>
                    <span className="font-bold text-slate-800">{selectedOrder.vendor?.name}</span>
                  </div>
                  <div className="space-y-1 text-right">
                    <span className="text-slate-400 block font-semibold uppercase">Order Date</span>
                    <span className="font-bold text-slate-800">{new Date(selectedOrder.orderDate).toLocaleDateString()}</span>
                  </div>
                  <div className="space-y-1">
                    <span className="text-slate-400 block font-semibold uppercase">Logistics Notes</span>
                    <p className="text-slate-500">{selectedOrder.notes || 'None listed.'}</p>
                  </div>
                  <div className="space-y-1 text-right">
                    <span className="text-slate-400 block font-semibold uppercase">Terms</span>
                    <span className="font-bold text-slate-800">{selectedOrder.terms}</span>
                  </div>
                </div>

                {/* Lines Table */}
                <div className="border border-slate-200/80 rounded-xl overflow-hidden">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold">
                        <th className="px-4 py-2.5">Product SKU</th>
                        <th className="px-4 py-2.5">Product Name</th>
                        <th className="px-4 py-2.5 text-right">Ordered</th>
                        <th className="px-4 py-2.5 text-right">Received</th>
                        <th className="px-4 py-2.5 text-right">Cost Rate</th>
                        <th className="px-4 py-2.5 text-right">Line Total</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-slate-700">
                      {selectedOrder.lines?.map((line: any) => (
                        <tr key={line.id}>
                          <td className="px-4 py-2.5 font-mono font-medium">{line.product?.sku}</td>
                          <td className="px-4 py-2.5 font-semibold">{line.product?.name}</td>
                          <td className="px-4 py-2.5 text-right font-medium">{line.quantityOrdered}</td>
                          <td className="px-4 py-2.5 text-right font-bold text-teal-700">{line.quantityReceived}</td>
                          <td className="px-4 py-2.5 text-right">₹{line.unitPrice.toFixed(2)}</td>
                          <td className="px-4 py-2.5 text-right font-bold text-slate-800">₹{line.totalPrice.toFixed(2)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Summary Box */}
                <div className="flex justify-end pt-4 border-t border-slate-100">
                  <div className="w-60 space-y-1.5 text-xs text-slate-600">
                    <div className="flex justify-between">
                      <span>Subtotal</span>
                      <span className="font-semibold text-slate-800">₹{selectedOrder.subtotal.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Tax Amount</span>
                      <span className="font-semibold text-slate-800">₹{selectedOrder.taxAmount.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-sm font-bold text-slate-900 border-t border-slate-200 pt-1.5">
                      <span>Total Amount</span>
                      <span>₹{selectedOrder.totalAmount.toFixed(2)}</span>
                    </div>
                  </div>
                </div>

                {/* Approve/Intake Actions */}
                {selectedOrder.status === 'DRAFT' && (
                  <div className="bg-amber-50 border border-amber-100 rounded-xl p-4 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
                    <span className="font-semibold text-amber-700">This procurement request is waiting for approval.</span>
                    <button
                      onClick={() => handleApproveOrder(selectedOrder.id)}
                      className="h-8 px-4 rounded-lg bg-emerald-600 text-white font-semibold hover:bg-emerald-700 transition-colors"
                    >
                      Approve Replenishment
                    </button>
                  </div>
                )}

                {(selectedOrder.status === 'APPROVED' || selectedOrder.status === 'PARTIAL_RECEIPT') && (
                  <div className="bg-teal-50 border border-teal-100 rounded-xl p-4 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
                    <div>
                      <span className="font-bold text-teal-800 block">Stock Receipt Available</span>
                      <span className="text-slate-500">Record incoming stock packages into warehouse locations.</span>
                    </div>
                    <button
                      onClick={() => handleOpenReceive(selectedOrder)}
                      className="h-8 px-4 rounded-lg bg-teal-700 text-white font-semibold hover:bg-teal-800 transition-colors flex items-center gap-1"
                    >
                      <ArrowDownToLine size={13} />
                      Receive Incoming Items
                    </button>
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Intake / Receive Items Dialog */}
      <AnimatePresence>
        {isReceiveOpen && selectedOrder && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white border border-slate-200 rounded-2xl shadow-xl w-full max-w-md overflow-hidden flex flex-col"
            >
              <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
                <h3 className="font-bold text-slate-800 text-base">Receive Procurement Stock</h3>
                <button onClick={() => setIsReceiveOpen(false)} className="text-slate-400 hover:text-slate-600 font-semibold">✕</button>
              </div>

              <form onSubmit={handleConfirmReceipt} className="p-6 space-y-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700">Intake Destination Depot *</label>
                  <select
                    value={receiveWarehouseId}
                    onChange={(e) => setReceiveWarehouseId(e.target.value)}
                    className="w-full h-10 px-3 rounded-xl border border-slate-200 outline-none text-sm bg-white"
                  >
                    {warehouses.map((wh) => (
                      <option key={wh.id} value={wh.id}>{wh.name}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-3 pt-2">
                  <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block border-b border-slate-100 pb-1.5">Incoming Quantities</span>
                  {selectedOrder.lines.map((line: any) => {
                    const remaining = line.quantityOrdered - line.quantityReceived;
                    if (remaining <= 0) return null;
                    return (
                      <div key={line.productId} className="flex items-center justify-between gap-4 text-xs bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                        <div className="flex-1">
                          <span className="font-bold text-slate-800">{line.product?.name}</span>
                          <span className="block font-mono text-[10px] text-slate-400 mt-0.5">Remaining to intake: {remaining} units</span>
                        </div>
                        <input
                          type="number"
                          min="0"
                          max={remaining}
                          value={receiveQuantities[line.productId] ?? 0}
                          onChange={(e) => handleReceiveItemsChange(line.productId, parseInt(e.target.value) || 0)}
                          className="w-20 h-8 px-2 rounded-lg border border-slate-200 bg-white text-xs outline-none text-right font-bold text-slate-800"
                        />
                      </div>
                    );
                  })}
                </div>

                <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3 bg-white">
                  <button
                    type="button"
                    onClick={() => setIsReceiveOpen(false)}
                    className="h-10 px-4 rounded-xl border border-slate-200 text-slate-600 text-sm font-semibold hover:bg-slate-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="h-10 px-5 rounded-xl bg-teal-700 text-white text-sm font-semibold hover:bg-teal-800"
                  >
                    Confirm Stock Intake
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
