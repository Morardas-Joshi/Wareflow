'use client';

import React, { useState, useEffect } from 'react';
import { api } from '@/utils/api';
import { Plus, Search, Edit2, Trash2, ShieldAlert, Mail, Phone, Building, Calendar } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function VendorsPage() {
  const [vendors, setVendors] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingVendor, setEditingVendor] = useState<any | null>(null);
  
  // Form states
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [company, setCompany] = useState('');
  const [paymentTerms, setPaymentTerms] = useState('Net 30');
  const [addressLine1, setAddressLine1] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [country, setCountry] = useState('');
  const [postalCode, setPostalCode] = useState('');
  const [notes, setNotes] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    loadVendors();
  }, []);

  const loadVendors = () => {
    setVendors(api.getVendors());
  };

  const handleOpenCreate = () => {
    setEditingVendor(null);
    setName('');
    setEmail('');
    setPhone('');
    setCompany('');
    setPaymentTerms('Net 30');
    setAddressLine1('');
    setCity('');
    setState('');
    setCountry('');
    setPostalCode('');
    setNotes('');
    setError('');
    setIsModalOpen(true);
  };

  const handleOpenEdit = (vendor: any) => {
    setEditingVendor(vendor);
    setName(vendor.name);
    setEmail(vendor.email || '');
    setPhone(vendor.phone || '');
    setCompany(vendor.company || '');
    setPaymentTerms(vendor.paymentTerms || 'Net 30');
    setAddressLine1(vendor.addressLine1 || '');
    setCity(vendor.city || '');
    setState(vendor.state || '');
    setCountry(vendor.country || '');
    setPostalCode(vendor.postalCode || '');
    setNotes(vendor.notes || '');
    setError('');
    setIsModalOpen(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name) {
      setError('Vendor name is required.');
      return;
    }

    const payload = {
      name,
      email,
      phone,
      company,
      paymentTerms,
      addressLine1,
      city,
      state,
      country,
      postalCode,
      notes,
    };

    if (editingVendor) {
      api.updateVendor(editingVendor.id, payload);
    } else {
      api.createVendor(payload);
    }

    setIsModalOpen(false);
    loadVendors();
  };

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this vendor?')) {
      api.deleteVendor(id);
      loadVendors();
    }
  };

  const filteredVendors = vendors.filter((v) => {
    return v.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
           (v.company && v.company.toLowerCase().includes(searchTerm.toLowerCase())) ||
           (v.email && v.email.toLowerCase().includes(searchTerm.toLowerCase()));
  });

  return (
    <div className="p-6 md:p-8 space-y-6 max-w-7xl mx-auto">
      {/* Top Banner */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 flex items-center gap-2">
            <ShieldAlert className="text-teal-700" size={28} />
            Vendors / Suppliers
          </h1>
          <p className="text-sm text-slate-500 mt-1">Manage global vendors, procurement hubs, and supply lines.</p>
        </div>
        <button
          onClick={handleOpenCreate}
          className="flex items-center justify-center gap-2 h-10 px-4 rounded-xl bg-teal-700 text-white text-sm font-semibold hover:bg-teal-800 active:scale-95 transition-all shadow-md shadow-teal-700/10"
        >
          <Plus size={18} />
          New Vendor
        </button>
      </div>

      {/* Search Bar */}
      <div className="bg-white border border-slate-100 p-4 rounded-2xl shadow-sm flex items-center">
        <div className="relative w-full sm:max-w-xs">
          <Search className="absolute left-3.5 top-2.5 h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search vendor name, email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="h-9 w-full rounded-xl border border-slate-200 bg-slate-50/50 pl-10 pr-4 text-sm outline-none focus:ring-2 focus:ring-teal-700/20 focus:border-teal-700 transition-all"
          />
        </div>
      </div>

      {/* Vendors Grid */}
      <motion.div layout className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <AnimatePresence mode="popLayout">
          {filteredVendors.map((vendor) => (
            <motion.div
              layout
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              key={vendor.id}
              className="group border border-slate-200/70 rounded-2xl bg-white p-5 flex flex-col justify-between shadow-sm hover:shadow-md transition-all relative overflow-hidden"
            >
              <div className="space-y-4">
                <div className="flex justify-between items-start">
                  <div className="space-y-1">
                    <h3 className="font-semibold text-slate-800 text-base leading-tight group-hover:text-teal-700 transition-colors">
                      {vendor.name}
                    </h3>
                    {vendor.company && (
                      <p className="text-xs text-slate-500 flex items-center gap-1">
                        <Building size={12} className="text-slate-400" />
                        {vendor.company}
                      </p>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => handleOpenEdit(vendor)}
                      className="p-1.5 hover:bg-slate-100 text-slate-500 hover:text-slate-800 rounded-lg transition-colors"
                      title="Edit"
                    >
                      <Edit2 size={14} />
                    </button>
                    <button
                      onClick={() => handleDelete(vendor.id)}
                      className="p-1.5 hover:bg-red-50 text-slate-400 hover:text-red-600 rounded-lg transition-colors"
                      title="Delete"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>

                {/* Details */}
                <div className="space-y-2 text-xs text-slate-500 border-t border-slate-50 pt-3">
                  {vendor.email && (
                    <p className="flex items-center gap-2">
                      <Mail size={13} className="text-slate-400" />
                      {vendor.email}
                    </p>
                  )}
                  {vendor.phone && (
                    <p className="flex items-center gap-2">
                      <Phone size={13} className="text-slate-400" />
                      {vendor.phone}
                    </p>
                  )}
                  <p className="flex items-center gap-2 text-[11px] text-teal-700 font-semibold bg-teal-50/50 px-2 py-0.5 rounded w-fit">
                    <Calendar size={12} />
                    Terms: {vendor.paymentTerms}
                  </p>
                  {vendor.city && (
                    <p className="text-[11px] text-slate-400 mt-1">
                      📍 {vendor.city}, {vendor.state || vendor.country}
                    </p>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {filteredVendors.length === 0 && (
          <div className="col-span-full py-12 flex flex-col items-center justify-center border border-dashed border-slate-200 rounded-2xl bg-white">
            <ShieldAlert size={48} className="text-slate-300 mb-3" />
            <h3 className="font-semibold text-slate-700">No vendors found</h3>
            <p className="text-sm text-slate-400 mt-1">Check spelling or create a new supplier card.</p>
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
                  {editingVendor ? 'Edit Vendor Info' : 'Create New Vendor'}
                </h3>
                <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600 font-semibold">✕</button>
              </div>

              <form onSubmit={handleSave} className="p-6 space-y-4 overflow-y-auto flex-1">
                {error && (
                  <div className="p-3 bg-red-50 border border-red-200 text-red-600 rounded-xl text-xs font-semibold">
                    {error}
                  </div>
                )}

                <div className="grid grid-cols-2 gap-4">
                  <div className="col-span-2 space-y-1.5">
                    <label className="text-xs font-bold text-slate-700">Vendor Name *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Steelcase Inc."
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full h-10 px-3 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-teal-700/20 focus:border-teal-700 text-sm transition-all"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700">Supplier Email</label>
                    <input
                      type="email"
                      placeholder="e.g. supplier@domain.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full h-10 px-3 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-teal-700/20 focus:border-teal-700 text-sm transition-all"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700">Contact Phone</label>
                    <input
                      type="text"
                      placeholder="e.g. +1-800-333-9999"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="w-full h-10 px-3 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-teal-700/20 focus:border-teal-700 text-sm transition-all"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700">Company Name</label>
                    <input
                      type="text"
                      placeholder="e.g. Steelcase"
                      value={company}
                      onChange={(e) => setCompany(e.target.value)}
                      className="w-full h-10 px-3 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-teal-700/20 focus:border-teal-700 text-sm transition-all"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700">Default Payment Terms</label>
                    <select
                      value={paymentTerms}
                      onChange={(e) => setPaymentTerms(e.target.value)}
                      className="w-full h-10 px-3 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-teal-700/20 focus:border-teal-700 text-sm bg-white"
                    >
                      <option value="Due on Receipt">Due on Receipt</option>
                      <option value="Net 15">Net 15</option>
                      <option value="Net 30">Net 30</option>
                      <option value="Net 60">Net 60</option>
                    </select>
                  </div>

                  <div className="col-span-2 space-y-1.5">
                    <label className="text-xs font-bold text-slate-700">Address Line 1</label>
                    <input
                      type="text"
                      placeholder="901 44th St SE"
                      value={addressLine1}
                      onChange={(e) => setAddressLine1(e.target.value)}
                      className="w-full h-10 px-3 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-teal-700/20 focus:border-teal-700 text-sm transition-all"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700">City</label>
                    <input
                      type="text"
                      placeholder="Grand Rapids"
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      className="w-full h-10 px-3 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-teal-700/20 focus:border-teal-700 text-sm transition-all"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700">State / Province</label>
                    <input
                      type="text"
                      placeholder="MI"
                      value={state}
                      onChange={(e) => setState(e.target.value)}
                      className="w-full h-10 px-3 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-teal-700/20 focus:border-teal-700 text-sm transition-all"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700">Country</label>
                    <input
                      type="text"
                      placeholder="USA"
                      value={country}
                      onChange={(e) => setCountry(e.target.value)}
                      className="w-full h-10 px-3 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-teal-700/20 focus:border-teal-700 text-sm transition-all"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700">Postal Code</label>
                    <input
                      type="text"
                      placeholder="49508"
                      value={postalCode}
                      onChange={(e) => setPostalCode(e.target.value)}
                      className="w-full h-10 px-3 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-teal-700/20 focus:border-teal-700 text-sm transition-all"
                    />
                  </div>

                  <div className="col-span-2 space-y-1.5">
                    <label className="text-xs font-bold text-slate-700">Procurement Notes</label>
                    <textarea
                      placeholder="Add any specific comments or logistics details for this vendor..."
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      rows={2}
                      className="w-full p-3 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-teal-700/20 focus:border-teal-700 text-sm transition-all resize-none"
                    />
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3 bg-white">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="h-10 px-4 rounded-xl border border-slate-200 text-slate-600 text-sm font-semibold hover:bg-slate-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="h-10 px-5 rounded-xl bg-teal-700 text-white text-sm font-semibold hover:bg-teal-800"
                  >
                    {editingVendor ? 'Save Changes' : 'Create Vendor'}
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
