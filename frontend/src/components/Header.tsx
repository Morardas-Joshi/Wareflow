'use client';
import React from 'react';
import { Bell, Search, Menu } from 'lucide-react';

export default function Header() {
  return (
    <header className="h-16 flex items-center justify-between px-6 border-b border-slate-200 bg-white z-10 shrink-0 shadow-sm">
      <div className="flex items-center gap-4">
        <button className="md:hidden text-slate-500 hover:text-slate-700">
          <Menu size={24} />
        </button>
        <div className="relative hidden md:block">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search anything..."
            className="h-9 w-64 rounded-md border border-input bg-muted/50 pl-9 pr-4 text-sm outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-all"
          />
        </div>
      </div>
      <div className="flex items-center gap-4">
        <button className="relative p-2 text-muted-foreground hover:text-foreground transition-colors rounded-full hover:bg-muted">
          <Bell size={20} />
          <span className="absolute top-1 right-1 h-2 w-2 rounded-full bg-destructive"></span>
        </button>
        <div className="h-8 w-8 rounded-full bg-primary/20 border border-primary/30 flex items-center justify-center text-sm font-medium text-primary cursor-pointer">
          JD
        </div>
      </div>
    </header>
  );
}
