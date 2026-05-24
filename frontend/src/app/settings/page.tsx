'use client';

import React, { useState, useEffect } from 'react';
import { Settings, Shield, RefreshCw, Server, AlertCircle } from 'lucide-react';
import { motion } from 'framer-motion';

export default function SettingsPage() {
  const [companyName, setCompanyName] = useState('FlowCore Corp.');
  const [taxId, setTaxId] = useState('GST-30AAACF9988Z');
  const [currency, setCurrency] = useState('INR (₹)');
  const [apiUrl, setApiUrl] = useState('http://localhost:3001/api/v1');
  const [connectionMode, setConnectionMode] = useState<'local' | 'backend'>('local');
  const [isSaved, setIsSaved] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const storedName = localStorage.getItem('settings_company_name') || 'FlowCore Corp.';
      const storedTax = localStorage.getItem('settings_tax_id') || 'GST-30AAACF9988Z';
      const storedCur = localStorage.getItem('settings_currency') || 'INR (₹)';
      const storedApi = localStorage.getItem('settings_api_url') || 'http://localhost:3001/api/v1';
      const storedMode = (localStorage.getItem('settings_connection_mode') as 'local' | 'backend') || 'local';

      setCompanyName(storedName);
      setTaxId(storedTax);
      setCurrency(storedCur);
      setApiUrl(storedApi);
      setConnectionMode(storedMode);
    }
  }, []);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    localStorage.setItem('settings_company_name', companyName);
    localStorage.setItem('settings_tax_id', taxId);
    localStorage.setItem('settings_currency', currency);
    localStorage.setItem('settings_api_url', apiUrl);
    localStorage.setItem('settings_connection_mode', connectionMode);
    
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 3000);
  };

  const handleClearDatabase = () => {
    if (confirm('Are you sure you want to reset all mock databases? This will clear all products, stock levels, sales, and purchase history from your browser cache.')) {
      localStorage.clear();
      alert('Local storage database reset successfully. Reloading page...');
      window.location.reload();
    }
  };

  return (
    <div className="p-6 md:p-8 space-y-6 max-w-4xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 flex items-center gap-2">
          <Settings className="text-teal-700" size={28} />
          System Settings
        </h1>
        <p className="text-sm text-slate-500 mt-1">Configure company profiles, database nodes, and endpoints.</p>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {isSaved && (
          <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-600 rounded-xl text-xs font-semibold">
            ✓ Settings updated successfully.
          </div>
        )}

        {/* Company Settings */}
        <div className="border border-slate-200 bg-white rounded-2xl p-6 shadow-sm space-y-4">
          <h3 className="font-bold text-slate-800 text-sm uppercase tracking-wide flex items-center gap-2">
            <Shield size={16} className="text-teal-700" />
            Company Profile
          </h3>

          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2 sm:col-span-1 space-y-1.5">
              <label className="text-xs font-bold text-slate-700">Company Name</label>
              <input
                type="text"
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                className="w-full h-10 px-3 rounded-xl border border-slate-200 outline-none text-sm"
              />
            </div>

            <div className="col-span-2 sm:col-span-1 space-y-1.5">
              <label className="text-xs font-bold text-slate-700">Tax ID / GSTIN No.</label>
              <input
                type="text"
                value={taxId}
                onChange={(e) => setTaxId(e.target.value)}
                className="w-full h-10 px-3 rounded-xl border border-slate-200 outline-none text-sm"
              />
            </div>

            <div className="col-span-2 sm:col-span-1 space-y-1.5">
              <label className="text-xs font-bold text-slate-700">System Base Currency</label>
              <select
                value={currency}
                onChange={(e) => setCurrency(e.target.value)}
                className="w-full h-10 px-3 rounded-xl border border-slate-200 outline-none text-sm bg-white"
              >
                <option value="INR (₹)">INR (₹) - Indian Rupee</option>
                <option value="USD ($)">USD ($) - US Dollar</option>
                <option value="EUR (€)">EUR (€) - Euro</option>
                <option value="GBP (£)">GBP (£) - British Pound</option>
              </select>
            </div>
          </div>
        </div>

        {/* Database Connection Settings */}
        <div className="border border-slate-200 bg-white rounded-2xl p-6 shadow-sm space-y-4">
          <h3 className="font-bold text-slate-800 text-sm uppercase tracking-wide flex items-center gap-2">
            <Server size={16} className="text-teal-700" />
            Backend Connection Node
          </h3>

          <div className="space-y-3">
            <div className="flex items-center gap-4">
              <label className="flex items-center gap-2 text-xs font-semibold text-slate-700">
                <input
                  type="radio"
                  name="connMode"
                  value="local"
                  checked={connectionMode === 'local'}
                  onChange={() => setConnectionMode('local')}
                  className="h-4 w-4 text-teal-700"
                />
                Local Mock Cache Mode (Durable browser sandbox)
              </label>
              <label className="flex items-center gap-2 text-xs font-semibold text-slate-700">
                <input
                  type="radio"
                  name="connMode"
                  value="backend"
                  checked={connectionMode === 'backend'}
                  onChange={() => setConnectionMode('backend')}
                  className="h-4 w-4 text-teal-700"
                />
                Live API Service Mode (Connects to NestJS Server)
              </label>
            </div>

            {connectionMode === 'backend' && (
              <div className="space-y-1.5 max-w-md pt-2">
                <label className="text-xs font-bold text-slate-700">NestJS API Server URL</label>
                <input
                  type="url"
                  value={apiUrl}
                  onChange={(e) => setApiUrl(e.target.value)}
                  placeholder="http://localhost:3001/api/v1"
                  className="w-full h-10 px-3 rounded-xl border border-slate-200 outline-none text-sm font-mono"
                />
              </div>
            )}
          </div>
        </div>

        {/* Database resets */}
        <div className="border border-red-100 bg-red-50/20 rounded-2xl p-6 shadow-sm space-y-4">
          <h3 className="font-bold text-red-700 text-sm uppercase tracking-wide flex items-center gap-2">
            <AlertCircle size={16} />
            Danger Zone
          </h3>
          <p className="text-xs text-slate-500">Perform destructive system actions below. These actions cannot be undone.</p>
          <button
            type="button"
            onClick={handleClearDatabase}
            className="flex items-center justify-center gap-2 h-9 px-4 rounded-xl bg-red-600 text-white text-xs font-semibold hover:bg-red-700 active:scale-95 transition-all shadow-sm"
          >
            <RefreshCw size={14} />
            Reset Local Databases
          </button>
        </div>

        <div className="flex items-center justify-end">
          <button
            type="submit"
            className="h-10 px-6 rounded-xl bg-teal-700 text-white text-sm font-semibold hover:bg-teal-800 active:scale-95 transition-colors shadow-md shadow-teal-700/10"
          >
            Save Settings
          </button>
        </div>
      </form>
    </div>
  );
}
