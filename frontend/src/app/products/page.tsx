'use client';

import React, { useState, useEffect } from 'react';
import { api } from '@/utils/api';
import { Plus, Search, Edit2, Trash2, Package, Tag, Layers, RefreshCw } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function ProductsPage() {
  const [products, setProducts] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  
  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<any | null>(null);
  
  // Form states
  const [name, setName] = useState('');
  const [sku, setSku] = useState('');
  const [barcode, setBarcode] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [unitPrice, setUnitPrice] = useState('');
  const [costPrice, setCostPrice] = useState('');
  const [reorderLevel, setReorderLevel] = useState('0');
  const [description, setDescription] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = () => {
    setProducts(api.getProducts());
    const cats = api.getCategories();
    setCategories(cats);
    if (cats.length > 0) {
      setCategoryId(cats[0].id);
    }
  };

  const handleOpenCreate = () => {
    setEditingProduct(null);
    setName('');
    setSku(`SKU-${Math.floor(1000 + Math.random() * 9000)}`);
    setBarcode('');
    if (categories.length > 0) setCategoryId(categories[0].id);
    setUnitPrice('');
    setCostPrice('');
    setReorderLevel('0');
    setDescription('');
    setError('');
    setIsModalOpen(true);
  };

  const handleOpenEdit = (product: any) => {
    setEditingProduct(product);
    setName(product.name);
    setSku(product.sku);
    setBarcode(product.barcode || '');
    setCategoryId(product.categoryId);
    setUnitPrice(product.unitPrice.toString());
    setCostPrice(product.costPrice.toString());
    setReorderLevel(product.reorderLevel?.toString() || '0');
    setDescription(product.description || '');
    setError('');
    setIsModalOpen(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !sku || !unitPrice || !costPrice) {
      setError('Please fill in all required fields.');
      return;
    }

    const payload = {
      name,
      sku,
      barcode,
      categoryId,
      unitPrice: parseFloat(unitPrice),
      costPrice: parseFloat(costPrice),
      reorderLevel: parseInt(reorderLevel, 10),
      description,
    };

    if (editingProduct) {
      api.updateProduct(editingProduct.id, payload);
    } else {
      const conflict = products.find((p) => p.sku.toLowerCase() === sku.toLowerCase());
      if (conflict) {
        setError(`Product with SKU ${sku} already exists.`);
        return;
      }
      api.createProduct(payload);
    }

    setIsModalOpen(false);
    loadData();
  };

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this product?')) {
      api.deleteProduct(id);
      loadData();
    }
  };

  const filteredProducts = products.filter((p) => {
    const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          p.sku.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || p.categoryId === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="p-6 md:p-8 space-y-6 max-w-7xl mx-auto">
      {/* Top Banner */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 flex items-center gap-2">
            <Package className="text-teal-700" size={28} />
            Products Catalog
          </h1>
          <p className="text-sm text-slate-500 mt-1">Manage, edit, and track your global catalog items.</p>
        </div>
        <button
          onClick={handleOpenCreate}
          className="flex items-center justify-center gap-2 h-10 px-4 rounded-xl bg-teal-700 text-white text-sm font-semibold hover:bg-teal-800 active:scale-95 transition-all shadow-md shadow-teal-700/10"
        >
          <Plus size={18} />
          New Product
        </button>
      </div>

      {/* Filters & Search */}
      <div className="flex flex-col sm:flex-row gap-4 items-center justify-between bg-white border border-slate-100 p-4 rounded-2xl shadow-sm">
        <div className="relative w-full sm:max-w-xs">
          <Search className="absolute left-3.5 top-2.5 h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search SKU or name..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="h-9 w-full rounded-xl border border-slate-200 bg-slate-50/50 pl-10 pr-4 text-sm outline-none focus:ring-2 focus:ring-teal-700/20 focus:border-teal-700 transition-all"
          />
        </div>
        
        <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0">
          <button
            onClick={() => setSelectedCategory('All')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${
              selectedCategory === 'All'
                ? 'bg-teal-50 text-teal-700 border border-teal-100'
                : 'text-slate-500 hover:bg-slate-50 border border-transparent'
            }`}
          >
            All Categories
          </button>
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${
                selectedCategory === cat.id
                  ? 'bg-teal-50 text-teal-700 border border-teal-100'
                  : 'text-slate-500 hover:bg-slate-50 border border-transparent'
              }`}
            >
              {cat.name}
            </button>
          ))}
        </div>
      </div>

      {/* Grid List */}
      <motion.div layout className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <AnimatePresence mode="popLayout">
          {filteredProducts.map((product) => (
            <motion.div
              layout
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              key={product.id}
              className="group border border-slate-200/70 rounded-2xl bg-white p-5 flex flex-col justify-between shadow-sm hover:shadow-md transition-all relative overflow-hidden"
            >
              <div className="space-y-4">
                <div className="flex justify-between items-start">
                  <div className="space-y-1">
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider bg-slate-100 text-slate-600">
                      <Tag size={10} />
                      {product.category?.name || 'Uncategorized'}
                    </span>
                    <h3 className="font-semibold text-slate-800 text-base leading-tight group-hover:text-teal-700 transition-colors">
                      {product.name}
                    </h3>
                    <p className="text-xs text-slate-400 font-mono tracking-tight">{product.sku}</p>
                  </div>
                  
                  {/* Actions */}
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => handleOpenEdit(product)}
                      className="p-1.5 hover:bg-slate-100 text-slate-500 hover:text-slate-800 rounded-lg transition-colors"
                      title="Edit"
                    >
                      <Edit2 size={14} />
                    </button>
                    <button
                      onClick={() => handleDelete(product.id)}
                      className="p-1.5 hover:bg-red-50 text-slate-400 hover:text-red-600 rounded-lg transition-colors"
                      title="Delete"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>

                <p className="text-xs text-slate-500 line-clamp-2 min-h-[32px]">
                  {product.description || 'No description provided.'}
                </p>
              </div>

              <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between">
                <div>
                  <span className="text-xs text-slate-400 block font-medium">Selling Price</span>
                  <span className="text-base font-bold text-slate-900">₹{product.unitPrice.toFixed(2)}</span>
                </div>
                <div className="text-right">
                  <span className="text-xs text-slate-400 block font-medium">Cost Price</span>
                  <span className="text-xs font-semibold text-slate-500">₹{product.costPrice.toFixed(2)}</span>
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {filteredProducts.length === 0 && (
          <div className="col-span-full py-12 flex flex-col items-center justify-center border border-dashed border-slate-200 rounded-2xl bg-white">
            <Package size={48} className="text-slate-300 mb-3" />
            <h3 className="font-semibold text-slate-700">No products found</h3>
            <p className="text-sm text-slate-400 mt-1">Try refining your search keyword or selecting a different category.</p>
          </div>
        )}
      </motion.div>

      {/* Create / Edit Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white border border-slate-200 rounded-2xl shadow-xl w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh]"
            >
              <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
                <h3 className="font-bold text-slate-800 text-lg">
                  {editingProduct ? 'Edit Product' : 'Create New Product'}
                </h3>
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="text-slate-400 hover:text-slate-600 font-semibold"
                >
                  ✕
                </button>
              </div>

              <form onSubmit={handleSave} className="p-6 space-y-4 overflow-y-auto flex-1">
                {error && (
                  <div className="p-3 bg-red-50 border border-red-200 text-red-600 rounded-xl text-xs font-semibold">
                    {error}
                  </div>
                )}

                <div className="grid grid-cols-2 gap-4">
                  <div className="col-span-2 space-y-1.5">
                    <label className="text-xs font-bold text-slate-700">Product Name *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Ergonomic Office Chair"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full h-10 px-3 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-teal-700/20 focus:border-teal-700 text-sm transition-all"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700">SKU Code *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. FURN-CH-01"
                      value={sku}
                      onChange={(e) => setSku(e.target.value)}
                      className="w-full h-10 px-3 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-teal-700/20 focus:border-teal-700 text-sm transition-all"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700">Barcode</label>
                    <input
                      type="text"
                      placeholder="e.g. 9876543210"
                      value={barcode}
                      onChange={(e) => setBarcode(e.target.value)}
                      className="w-full h-10 px-3 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-teal-700/20 focus:border-teal-700 text-sm transition-all"
                    />
                  </div>

                  <div className="col-span-2 space-y-1.5">
                    <label className="text-xs font-bold text-slate-700">Category *</label>
                    <select
                      value={categoryId}
                      onChange={(e) => setCategoryId(e.target.value)}
                      className="w-full h-10 px-3 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-teal-700/20 focus:border-teal-700 text-sm transition-all bg-white"
                    >
                      {categories.map((cat) => (
                        <option key={cat.id} value={cat.id}>
                          {cat.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700">Selling Price (₹) *</label>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      required
                      placeholder="0.00"
                      value={unitPrice}
                      onChange={(e) => setUnitPrice(e.target.value)}
                      className="w-full h-10 px-3 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-teal-700/20 focus:border-teal-700 text-sm transition-all"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700">Cost Price (₹) *</label>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      required
                      placeholder="0.00"
                      value={costPrice}
                      onChange={(e) => setCostPrice(e.target.value)}
                      className="w-full h-10 px-3 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-teal-700/20 focus:border-teal-700 text-sm transition-all"
                    />
                  </div>

                  <div className="col-span-2 space-y-1.5">
                    <label className="text-xs font-bold text-slate-700">Reorder Level (Units)</label>
                    <input
                      type="number"
                      min="0"
                      placeholder="0"
                      value={reorderLevel}
                      onChange={(e) => setReorderLevel(e.target.value)}
                      className="w-full h-10 px-3 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-teal-700/20 focus:border-teal-700 text-sm transition-all"
                    />
                  </div>

                  <div className="col-span-2 space-y-1.5">
                    <label className="text-xs font-bold text-slate-700">Description</label>
                    <textarea
                      placeholder="Details about product materials, sizes, limits..."
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      rows={3}
                      className="w-full p-3 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-teal-700/20 focus:border-teal-700 text-sm transition-all resize-none font-sans"
                    />
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3 bg-white">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="h-10 px-4 rounded-xl border border-slate-200 text-slate-600 text-sm font-semibold hover:bg-slate-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="h-10 px-5 rounded-xl bg-teal-700 text-white text-sm font-semibold hover:bg-teal-800 transition-colors shadow-md shadow-teal-700/10"
                  >
                    {editingProduct ? 'Save Changes' : 'Create Product'}
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
