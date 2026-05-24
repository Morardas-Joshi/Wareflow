'use client';

import React, { useState, useEffect } from 'react';
import { api } from '@/utils/api';
import { Plus, Search, Eye, Trash2, FileText, CheckCircle2, RefreshCw } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function SalesOrdersPage() {
  const [orders, setOrders] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [customers, setCustomers] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [error, setError] = useState('');

  // Modal States
  const [isNewOpen, setIsNewOpen] = useState(false);
  const [isViewOpen, setIsViewOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<any | null>(null);

  // New Order Form States
  const [customerId, setCustomerId] = useState('');
  const [deliveryDate, setDeliveryDate] = useState('');
  const [shippingAddress, setShippingAddress] = useState('');
  const [billingAddress, setBillingAddress] = useState('');
  const [notes, setNotes] = useState('');
  const [taxAmount, setTaxAmount] = useState('0');
  const [discountAmount, setDiscountAmount] = useState('0');
  const [orderLines, setOrderLines] = useState<Array<{ productId: string; quantity: number; unitPrice: number; discount: number }>>([
    { productId: '', quantity: 1, unitPrice: 0, discount: 0 }
  ]);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = () => {
    setOrders(api.getSalesOrders());
    const prods = api.getProducts();
    setProducts(prods);
    const custs = api.getCustomers();
    setCustomers(custs);

    if (custs.length > 0) setCustomerId(custs[0].id);
  };

  const handleOpenNew = () => {
    loadData();
    setCustomerId(customers[0]?.id || '');
    setDeliveryDate('');
    setShippingAddress('');
    setBillingAddress('');
    setNotes('');
    setTaxAmount('0');
    setDiscountAmount('0');
    setOrderLines([{ productId: products[0]?.id || '', quantity: 1, unitPrice: products[0]?.unitPrice || 0, discount: 0 }]);
    setError('');
    setIsNewOpen(true);
  };

  const handleAddLine = () => {
    setOrderLines([...orderLines, { productId: products[0]?.id || '', quantity: 1, unitPrice: products[0]?.unitPrice || 0, discount: 0 }]);
  };

  const handleRemoveLine = (index: number) => {
    if (orderLines.length === 1) return;
    setOrderLines(orderLines.filter((_, i) => i !== index));
  };

  const handleLineProductChange = (index: number, prodId: string) => {
    const updated = [...orderLines];
    const prod = products.find((p) => p.id === prodId);
    updated[index].productId = prodId;
    updated[index].unitPrice = prod ? prod.unitPrice : 0;
    setOrderLines(updated);
  };

  const handleLineValueChange = (index: number, field: 'quantity' | 'unitPrice' | 'discount', val: number) => {
    const updated = [...orderLines];
    updated[index][field] = val;
    setOrderLines(updated);
  };

  const handleCreateOrder = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerId) {
      setError('Please select a customer.');
      return;
    }

    const validLines = orderLines.filter((l) => l.productId && l.quantity > 0);
    if (validLines.length === 0) {
      setError('Please add at least one valid product line.');
      return;
    }

    const payload = {
      customerId,
      deliveryDate: deliveryDate || null,
      shippingAddress,
      billingAddress,
      notes,
      taxAmount: parseFloat(taxAmount) || 0,
      discountAmount: parseFloat(discountAmount) || 0,
      lines: validLines.map((l) => ({
        productId: l.productId,
        quantityOrdered: l.quantity,
        unitPrice: l.unitPrice,
        discount: l.discount,
      })),
    };

    api.createSalesOrder(payload);
    setIsNewOpen(false);
    loadData();
  };

  const handleConfirmOrder = (orderId: string) => {
    if (confirm('Confirming this sales order will finalize the transaction and deduct items from warehouse stocks. Proceed?')) {
      // Check inventory availability first
      const order = orders.find((o) => o.id === orderId);
      const inventory = api.getInventoryLevels();
      const warehouses = api.getWarehouses();
      const defaultWhId = warehouses[0]?.id;

      if (order && defaultWhId) {
        for (const line of order.lines) {
          const invMatch = inventory.filter((inv) => inv.productId === line.productId && inv.warehouseId === defaultWhId);
          const totalAvailable = invMatch.reduce((sum, item) => sum + item.quantityAvailable, 0);
          if (totalAvailable < line.quantityOrdered) {
            alert(`Insufficient inventory in default warehouse depot for ${line.product?.name || 'product'}. Available: ${totalAvailable}, Ordered: ${line.quantityOrdered}`);
            return;
          }
        }
      }

      api.updateSalesOrder(orderId, { status: 'CONFIRMED' });
      loadData();
      if (selectedOrder) {
        setSelectedOrder({ ...selectedOrder, status: 'CONFIRMED' });
      }
    }
  };

  const handleCancelOrder = (orderId: string) => {
    if (confirm('Are you sure you want to cancel this order?')) {
      api.updateSalesOrder(orderId, { status: 'CANCELLED' });
      loadData();
      if (selectedOrder) {
        setSelectedOrder({ ...selectedOrder, status: 'CANCELLED' });
      }
    }
  };

  const handleDelete = (id: string) => {
    if (confirm('Delete this sales order draft?')) {
      api.deleteSalesOrder(id);
      loadData();
    }
  };

  const handleOpenView = (order: any) => {
    setSelectedOrder(order);
    setIsViewOpen(true);
  };

  // Calculate Running Totals for Form
  const formSubtotal = orderLines.reduce((sum, l) => sum + (l.unitPrice - l.discount) * l.quantity, 0);
  const formTotal = formSubtotal + (parseFloat(taxAmount) || 0) - (parseFloat(discountAmount) || 0);

  const filteredOrders = orders.filter((o) => {
    return o.soNumber.toLowerCase().includes(searchTerm.toLowerCase()) || 
           o.customer?.name.toLowerCase().includes(searchTerm.toLowerCase());
  });

  return (
    <div className="p-6 md:p-8 space-y-6 max-w-7xl mx-auto">
      {/* Top Banner */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 flex items-center gap-2">
            <FileText className="text-teal-700" size={28} />
            Sales Orders (Quotes)
          </h1>
          <p className="text-sm text-slate-500 mt-1">Issue client quotes, process sales orders, and balance balances.</p>
        </div>
        <button
          onClick={handleOpenNew}
          className="flex items-center justify-center gap-2 h-10 px-4 rounded-xl bg-teal-700 text-white text-sm font-semibold hover:bg-teal-800 active:scale-95 transition-all shadow-md shadow-teal-700/10"
        >
          <Plus size={18} />
          New Sales Order
        </button>
      </div>

      {/* Search Bar */}
      <div className="bg-white border border-slate-100 p-4 rounded-2xl shadow-sm flex items-center">
        <div className="relative w-full sm:max-w-xs">
          <Search className="absolute left-3.5 top-2.5 h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search order no. or customer..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="h-9 w-full rounded-xl border border-slate-200 bg-slate-50/50 pl-10 pr-4 text-sm outline-none focus:ring-2 focus:ring-teal-700/20 focus:border-teal-700 transition-all"
          />
        </div>
      </div>

      {/* Table view */}
      <div className="bg-white border border-slate-100 rounded-2xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-sm">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100 text-xs font-bold text-slate-400 uppercase tracking-wider">
                <th className="px-6 py-4">Order No.</th>
                <th className="px-6 py-4">Client Name</th>
                <th className="px-6 py-4">Date Issued</th>
                <th className="px-6 py-4">Delivery Date</th>
                <th className="px-6 py-4 text-right">Order Sum</th>
                <th className="px-6 py-4 text-center">Status</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {filteredOrders.map((order) => (
                <tr key={order.id} className="hover:bg-slate-50/30 transition-colors">
                  <td className="px-6 py-4 font-mono font-bold text-slate-900">{order.soNumber}</td>
                  <td className="px-6 py-4 font-semibold text-slate-800">{order.customer?.name}</td>
                  <td className="px-6 py-4 text-slate-500">{new Date(order.orderDate).toLocaleDateString()}</td>
                  <td className="px-6 py-4 text-slate-500">
                    {order.deliveryDate ? new Date(order.deliveryDate).toLocaleDateString() : 'Immediate'}
                  </td>
                  <td className="px-6 py-4 text-right font-bold text-slate-950">₹{order.totalAmount.toFixed(2)}</td>
                  <td className="px-6 py-4 text-center">
                    <span className={`inline-flex px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wide ${
                      order.status === 'CONFIRMED'
                        ? 'bg-emerald-50 text-emerald-600'
                        : order.status === 'CANCELLED'
                        ? 'bg-red-50 text-red-600'
                        : 'bg-amber-50 text-amber-600'
                    }`}>
                      {order.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex justify-end gap-1.5">
                      <button
                        onClick={() => handleOpenView(order)}
                        className="p-1 rounded-lg hover:bg-slate-100 text-slate-500 hover:text-slate-900 transition-colors"
                        title="View Details"
                      >
                        <Eye size={15} />
                      </button>
                      {order.status === 'DRAFT' && (
                        <>
                          <button
                            onClick={() => handleConfirmOrder(order.id)}
                            className="p-1 rounded-lg hover:bg-emerald-50 text-emerald-600 transition-colors"
                            title="Confirm & Dispatch"
                          >
                            <CheckCircle2 size={15} />
                          </button>
                          <button
                            onClick={() => handleDelete(order.id)}
                            className="p-1 rounded-lg hover:bg-red-50 text-red-500 transition-colors"
                            title="Delete Quote"
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
                    No sales orders matched this criteria.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* New Order Modal */}
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
                <h3 className="font-bold text-slate-800 text-lg">Create Sales Quote</h3>
                <button onClick={() => setIsNewOpen(false)} className="text-slate-400 hover:text-slate-600 font-semibold">✕</button>
              </div>

              <form onSubmit={handleCreateOrder} className="p-6 space-y-4 overflow-y-auto flex-1">
                {error && (
                  <div className="p-3 bg-red-50 border border-red-200 text-red-600 rounded-xl text-xs font-semibold">
                    {error}
                  </div>
                )}

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700">Client / Customer *</label>
                    <select
                      value={customerId}
                      onChange={(e) => setCustomerId(e.target.value)}
                      className="w-full h-10 px-3 rounded-xl border border-slate-200 outline-none text-sm bg-white"
                    >
                      {customers.map((c) => (
                        <option key={c.id} value={c.id}>{c.name}</option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700">Expected Delivery Date</label>
                    <input
                      type="date"
                      value={deliveryDate}
                      onChange={(e) => setDeliveryDate(e.target.value)}
                      className="w-full h-10 px-3 rounded-xl border border-slate-200 outline-none text-sm"
                    />
                  </div>

                  <div className="space-y-1.5 col-span-2 sm:col-span-1">
                    <label className="text-xs font-bold text-slate-700">Shipping Address</label>
                    <input
                      type="text"
                      placeholder="Street name, City, State"
                      value={shippingAddress}
                      onChange={(e) => setShippingAddress(e.target.value)}
                      className="w-full h-10 px-3 rounded-xl border border-slate-200 outline-none text-sm"
                    />
                  </div>

                  <div className="space-y-1.5 col-span-2 sm:col-span-1">
                    <label className="text-xs font-bold text-slate-700">Billing Address</label>
                    <input
                      type="text"
                      placeholder="Same as shipping"
                      value={billingAddress}
                      onChange={(e) => setBillingAddress(e.target.value)}
                      className="w-full h-10 px-3 rounded-xl border border-slate-200 outline-none text-sm"
                    />
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
                              <option key={p.id} value={p.id}>{p.name} (Price: ₹{p.unitPrice})</option>
                            ))}
                          </select>
                        </div>

                        <div className="w-20 space-y-1">
                          <label className="text-[10px] font-bold text-slate-500">Quantity</label>
                          <input
                            type="number"
                            min="1"
                            value={line.quantity}
                            onChange={(e) => handleLineValueChange(idx, 'quantity', parseInt(e.target.value) || 0)}
                            className="w-full h-8 px-2 rounded-lg border border-slate-200 bg-white text-xs outline-none"
                          />
                        </div>

                        <div className="w-24 space-y-1">
                          <label className="text-[10px] font-bold text-slate-500">Unit Price (₹)</label>
                          <input
                            type="number"
                            step="0.01"
                            value={line.unitPrice}
                            onChange={(e) => handleLineValueChange(idx, 'unitPrice', parseFloat(e.target.value) || 0)}
                            className="w-full h-8 px-2 rounded-lg border border-slate-200 bg-white text-xs outline-none"
                          />
                        </div>

                        <div className="w-24 space-y-1">
                          <label className="text-[10px] font-bold text-slate-500">Disc per unit (₹)</label>
                          <input
                            type="number"
                            step="0.01"
                            value={line.discount}
                            onChange={(e) => handleLineValueChange(idx, 'discount', parseFloat(e.target.value) || 0)}
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

                <div className="grid grid-cols-3 gap-4 pt-4 border-t border-slate-100">
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

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700">Order Discount (₹)</label>
                    <input
                      type="number"
                      step="0.01"
                      value={discountAmount}
                      onChange={(e) => setDiscountAmount(e.target.value)}
                      className="w-full h-10 px-3 rounded-xl border border-slate-200 outline-none text-sm"
                    />
                  </div>

                  <div className="flex flex-col justify-end items-end pr-2">
                    <span className="text-[10px] text-slate-400 font-bold uppercase">Estimated Total</span>
                    <span className="text-xl font-black text-slate-900">₹{formTotal.toFixed(2)}</span>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700">Notes / Comments</label>
                  <textarea
                    placeholder="Provide special dispatch instructions..."
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
                    Save Quote Draft
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
                  <h3 className="font-bold text-slate-800 text-base">Sales Order Details</h3>
                  <span className="text-xs font-mono font-bold text-slate-400">{selectedOrder.soNumber}</span>
                </div>
                <button onClick={() => setIsViewOpen(false)} className="text-slate-400 hover:text-slate-600 font-semibold">✕</button>
              </div>

              <div className="p-6 space-y-6 overflow-y-auto flex-1">
                {/* Header Metadata */}
                <div className="grid grid-cols-2 gap-4 text-xs">
                  <div className="space-y-1">
                    <span className="text-slate-400 block font-semibold uppercase">Client</span>
                    <span className="font-bold text-slate-800">{selectedOrder.customer?.name}</span>
                  </div>
                  <div className="space-y-1 text-right">
                    <span className="text-slate-400 block font-semibold uppercase">Date Issued</span>
                    <span className="font-bold text-slate-800">{new Date(selectedOrder.orderDate).toLocaleDateString()}</span>
                  </div>
                  <div className="space-y-1">
                    <span className="text-slate-400 block font-semibold uppercase">Shipping To</span>
                    <span className="text-slate-600 block">{selectedOrder.shippingAddress || 'Not specified'}</span>
                  </div>
                  <div className="space-y-1 text-right">
                    <span className="text-slate-400 block font-semibold uppercase">Expected Delivery</span>
                    <span className="font-bold text-slate-800">
                      {selectedOrder.deliveryDate ? new Date(selectedOrder.deliveryDate).toLocaleDateString() : 'Immediate'}
                    </span>
                  </div>
                </div>

                {/* Lines Table */}
                <div className="border border-slate-200/80 rounded-xl overflow-hidden">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold">
                        <th className="px-4 py-2.5">Product SKU</th>
                        <th className="px-4 py-2.5">Product Name</th>
                        <th className="px-4 py-2.5 text-right">Qty</th>
                        <th className="px-4 py-2.5 text-right">Rate</th>
                        <th className="px-4 py-2.5 text-right">Discount</th>
                        <th className="px-4 py-2.5 text-right">Line Total</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-slate-700">
                      {selectedOrder.lines?.map((line: any) => (
                        <tr key={line.id}>
                          <td className="px-4 py-2.5 font-mono font-medium">{line.product?.sku}</td>
                          <td className="px-4 py-2.5 font-semibold">{line.product?.name}</td>
                          <td className="px-4 py-2.5 text-right font-medium">{line.quantityOrdered}</td>
                          <td className="px-4 py-2.5 text-right">₹{line.unitPrice.toFixed(2)}</td>
                          <td className="px-4 py-2.5 text-right text-red-500">-₹{line.discount.toFixed(2)}</td>
                          <td className="px-4 py-2.5 text-right font-bold text-slate-800">₹{line.totalPrice.toFixed(2)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Summary Box */}
                <div className="flex justify-between items-start pt-4 border-t border-slate-100">
                  <div className="max-w-xs space-y-1">
                    <span className="text-[10px] text-slate-400 font-bold uppercase block">Notes</span>
                    <p className="text-xs text-slate-500">{selectedOrder.notes || 'No internal comments.'}</p>
                  </div>

                  <div className="w-60 space-y-1.5 text-xs text-slate-600">
                    <div className="flex justify-between">
                      <span>Subtotal</span>
                      <span className="font-semibold text-slate-800">₹{selectedOrder.subtotal.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Tax Amount</span>
                      <span className="font-semibold text-slate-800">₹{selectedOrder.taxAmount.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-red-500">
                      <span>Discount</span>
                      <span>-₹{selectedOrder.discountAmount.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-sm font-bold text-slate-900 border-t border-slate-200 pt-1.5">
                      <span>Total Amount</span>
                      <span>₹{selectedOrder.totalAmount.toFixed(2)}</span>
                    </div>
                  </div>
                </div>

                {/* Order confirmation/Cancel actions */}
                {selectedOrder.status === 'DRAFT' && (
                  <div className="bg-amber-50 border border-amber-100 rounded-xl p-4 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
                    <div className="flex items-center gap-2">
                      <RefreshCw className="text-amber-600 animate-spin" size={16} />
                      <span className="font-semibold text-amber-700">This order is a pending draft quote.</span>
                    </div>
                    
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleCancelOrder(selectedOrder.id)}
                        className="h-8 px-3 rounded-lg border border-red-200 text-red-600 font-semibold hover:bg-red-50"
                      >
                        Cancel Order
                      </button>
                      <button
                        onClick={() => handleConfirmOrder(selectedOrder.id)}
                        className="h-8 px-3 rounded-lg bg-emerald-600 text-white font-semibold hover:bg-emerald-700"
                      >
                        Confirm & Lock Order
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
