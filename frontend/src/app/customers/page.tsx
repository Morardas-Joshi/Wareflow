'use client';

import React, { useState, useEffect } from 'react';
import { api } from '@/utils/api';
import { Plus, Search, Edit2, Trash2, Users, Mail, Phone, Building } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function CustomersPage() {
  const [customers, setCustomers] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<any | null>(null);
  
  // Form states
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [company, setCompany] = useState('');
  const [taxId, setTaxId] = useState('');
  const [creditLimit, setCreditLimit] = useState('50000');
  const [addressLine1, setAddressLine1] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [country, setCountry] = useState('');
  const [postalCode, setPostalCode] = useState('');
  const [notes, setNotes] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    loadCustomers();
  }, []);

  const loadCustomers = () => {
    setCustomers(api.getCustomers());
  };

  const handleOpenCreate = () => {
    setEditingCustomer(null);
    setName('');
    setEmail('');
    setPhone('');
    setCompany('');
    setTaxId('');
    setCreditLimit('50000');
    setAddressLine1('');
    setCity('');
    setState('');
    setCountry('');
    setPostalCode('');
    setNotes('');
    setError('');
    setIsModalOpen(true);
  };

  const handleOpenEdit = (customer: any) => {
    setEditingCustomer(customer);
    setName(customer.name);
    setEmail(customer.email || '');
    setPhone(customer.phone || '');
    setCompany(customer.company || '');
    setTaxId(customer.taxId || '');
    setCreditLimit(customer.creditLimit?.toString() || '0');
    setAddressLine1(customer.addressLine1 || '');
    setCity(customer.city || '');
    setState(customer.state || '');
    setCountry(customer.country || '');
    setPostalCode(customer.postalCode || '');
    setNotes(customer.notes || '');
    setError('');
    setIsModalOpen(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name) {
      setError('Customer name is required.');
      return;
    }

    const payload = {
      name,
      email,
      phone,
      company,
      taxId,
      creditLimit: parseFloat(creditLimit) || 0,
      addressLine1,
      city,
      state,
      country,
      postalCode,
      notes,
    };

    if (editingCustomer) {
      api.updateCustomer(editingCustomer.id, payload);
    } else {
      api.createCustomer(payload);
    }

    setIsModalOpen(false);
    loadCustomers();
  };

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this customer?')) {
      api.deleteCustomer(id);
      loadCustomers();
    }
  };

  const filteredCustomers = customers.filter((c) => {
    return c.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
           (c.company && c.company.toLowerCase().includes(searchTerm.toLowerCase())) ||
           (c.email && c.email.toLowerCase().includes(searchTerm.toLowerCase()));
  });

  return (
    <div className="p-6 md:p-8 space-y-6 max-w-7xl mx-auto">
      {/* Top Banner */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 flex items-center gap-2">
            <Users className="text-teal-700" size={28} />
            Customers
          </h1>
          <p className="text-sm text-slate-500 mt-1">Manage corporate accounts, credit terms, and billing contacts.</p>
        </div>
        <button
          onClick={handleOpenCreate}
          className="flex items-center justify-center gap-2 h-10 px-4 rounded-xl bg-teal-700 text-white text-sm font-semibold hover:bg-teal-800 active:scale-95 transition-all shadow-md shadow-teal-700/10"
        >
          <Plus size={18} />
          New Customer
        </button>
      </div>

      {/* Search Bar */}
      <div className="bg-white border border-slate-100 p-4 rounded-2xl shadow-sm flex items-center">
        <div className="relative w-full sm:max-w-xs">
          <Search className="absolute left-3.5 top-2.5 h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search name, company, email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="h-9 w-full rounded-xl border border-slate-200 bg-slate-50/50 pl-10 pr-4 text-sm outline-none focus:ring-2 focus:ring-teal-700/20 focus:border-teal-700 transition-all"
          />
        </div>
      </div>

      {/* Customers List */}
      <motion.div layout className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <AnimatePresence mode="popLayout">
          {filteredCustomers.map((customer) => (
            <motion.div
              layout
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              key={customer.id}
              className="group border border-slate-200/70 rounded-2xl bg-white p-5 flex flex-col justify-between shadow-sm hover:shadow-md transition-all relative overflow-hidden"
            >
              <div className="space-y-4">
                <div className="flex justify-between items-start">
                  <div className="space-y-1">
                    <h3 className="font-semibold text-slate-800 text-base leading-tight group-hover:text-teal-700 transition-colors">
                      {customer.name}
                    </h3>
                    {customer.company && (
                      <p className="text-xs text-slate-500 flex items-center gap-1">
                        <Building size={12} className="text-slate-400" />
                        {customer.company}
                      </p>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => handleOpenEdit(customer)}
                      className="p-1.5 hover:bg-slate-100 text-slate-500 hover:text-slate-800 rounded-lg transition-colors"
                      title="Edit"
                    >
                      <Edit2 size={14} />
                    </button>
                    <button
                      onClick={() => handleDelete(customer.id)}
                      className="p-1.5 hover:bg-red-50 text-slate-400 hover:text-red-600 rounded-lg transition-colors"
                      title="Delete"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>

                {/* Contact details */}
                <div className="space-y-2 text-xs text-slate-500 border-t border-slate-50 pt-3">
                  {customer.email && (
                    <p className="flex items-center gap-2">
                      <Mail size={13} className="text-slate-400" />
                      {customer.email}
                    </p>
                  )}
                  {customer.phone && (
                    <p className="flex items-center gap-2">
                      <Phone size={13} className="text-slate-400" />
                      {customer.phone}
                    </p>
                  )}
                  {customer.city && (
                    <p className="text-[11px] text-slate-400 mt-1">
                      📍 {customer.city}, {customer.state || customer.country}
                    </p>
                  )}
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between">
                <div>
                  <span className="text-[10px] text-slate-400 block font-bold uppercase tracking-wider">Credit Limit</span>
                  <span className="text-sm font-bold text-slate-800">₹{customer.creditLimit?.toFixed(2)}</span>
                </div>
                <div className="text-right">
                  <span className="text-[10px] text-slate-400 block font-bold uppercase tracking-wider">Outstanding</span>
                  <span className="text-sm font-bold text-slate-900">₹{customer.outstandingBal?.toFixed(2) || '0.00'}</span>
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {filteredCustomers.length === 0 && (
          <div className="col-span-full py-12 flex flex-col items-center justify-center border border-dashed border-slate-200 rounded-2xl bg-white">
            <Users size={48} className="text-slate-300 mb-3" />
            <h3 className="font-semibold text-slate-700">No customers found</h3>
            <p className="text-sm text-slate-400 mt-1">Try checking the spelling or create a new customer record.</p>
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
                  {editingCustomer ? 'Edit Customer' : 'Create New Customer'}
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
                    <label className="text-xs font-bold text-slate-700">Customer Name *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Wayne Enterprises"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full h-10 px-3 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-teal-700/20 focus:border-teal-700 text-sm transition-all"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700">Email Address</label>
                    <input
                      type="email"
                      placeholder="e.g. user@company.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full h-10 px-3 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-teal-700/20 focus:border-teal-700 text-sm transition-all"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700">Phone Number</label>
                    <input
                      type="text"
                      placeholder="e.g. +1-555-1939"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="w-full h-10 px-3 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-teal-700/20 focus:border-teal-700 text-sm transition-all"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700">Company Name</label>
                    <input
                      type="text"
                      placeholder="e.g. Wayne Ent."
                      value={company}
                      onChange={(e) => setCompany(e.target.value)}
                      className="w-full h-10 px-3 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-teal-700/20 focus:border-teal-700 text-sm transition-all"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700">Tax ID / VAT No.</label>
                    <input
                      type="text"
                      placeholder="e.g. US-12345678"
                      value={taxId}
                      onChange={(e) => setTaxId(e.target.value)}
                      className="w-full h-10 px-3 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-teal-700/20 focus:border-teal-700 text-sm transition-all"
                    />
                  </div>

                  <div className="col-span-2 space-y-1.5">
                    <label className="text-xs font-bold text-slate-700">Credit Limit (₹)</label>
                    <input
                      type="number"
                      placeholder="50000"
                      value={creditLimit}
                      onChange={(e) => setCreditLimit(e.target.value)}
                      className="w-full h-10 px-3 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-teal-700/20 focus:border-teal-700 text-sm transition-all"
                    />
                  </div>

                  <div className="col-span-2 space-y-1.5">
                    <label className="text-xs font-bold text-slate-700">Billing Street Address</label>
                    <input
                      type="text"
                      placeholder="1007 Mountain Drive"
                      value={addressLine1}
                      onChange={(e) => setAddressLine1(e.target.value)}
                      className="w-full h-10 px-3 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-teal-700/20 focus:border-teal-700 text-sm transition-all"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700">City</label>
                    <input
                      type="text"
                      placeholder="Gotham"
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      className="w-full h-10 px-3 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-teal-700/20 focus:border-teal-700 text-sm transition-all"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700">State / Region</label>
                    <input
                      type="text"
                      placeholder="NJ"
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
                      placeholder="07001"
                      value={postalCode}
                      onChange={(e) => setPostalCode(e.target.value)}
                      className="w-full h-10 px-3 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-teal-700/20 focus:border-teal-700 text-sm transition-all"
                    />
                  </div>

                  <div className="col-span-2 space-y-1.5">
                    <label className="text-xs font-bold text-slate-700">Internal Notes</label>
                    <textarea
                      placeholder="Add any specific details or preferences for this client..."
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
                    {editingCustomer ? 'Save Changes' : 'Create Customer'}
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
