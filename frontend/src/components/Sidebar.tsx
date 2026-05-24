'use client';
import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Activity } from 'lucide-react';

const navItems = [
  { name: 'Dashboard', path: '/' },
  { name: 'Products', path: '/products' },
  { name: 'Sales Orders', path: '/sales-orders' },
  { name: 'Purchase Orders', path: '/purchase-orders' },
  { name: 'Inventory', path: '/inventory' },
  { name: 'Customers', path: '/customers' },
  { name: 'Vendors', path: '/vendors' },
  { name: 'Reports', path: '/reports' },
  { name: 'Settings', path: '/settings' },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden w-64 overflow-y-auto bg-[#0f172a] text-slate-300 md:block shrink-0 z-20">
      <div className="flex h-16 items-center px-6 border-b border-slate-800">
        <Link href="/" className="flex items-center gap-2 font-bold text-xl tracking-tight text-white">
          <div className="h-8 w-8 rounded-lg bg-teal-700 flex items-center justify-center text-white shadow-lg shadow-teal-900/20">
            <Activity size={20} />
          </div>
          FlowCore
        </Link>
      </div>
      <nav className="p-4 space-y-2">
        {navItems.map((item) => {
          const isActive = pathname === item.path || (item.path !== '/' && pathname.startsWith(item.path));
          return (
            <Link 
              key={item.name} 
              href={item.path}
              className={`block px-4 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${
                isActive 
                  ? 'bg-teal-700 text-white shadow-md shadow-teal-900/20' 
                  : 'text-slate-400 hover:bg-slate-800 hover:text-white'
              }`}
            >
              {item.name}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
