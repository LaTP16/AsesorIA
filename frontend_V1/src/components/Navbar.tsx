'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Menu, X, ListOrdered, History, LayoutDashboard } from 'lucide-react';

export const Navbar: React.FC = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const pathname = usePathname();

  const navLinks = [
    { href: '/', label: 'Cola', icon: ListOrdered },
    { href: '/panorama', label: 'Panorama', icon: LayoutDashboard },
    { href: '/historial', label: 'Historial', icon: History },
  ];

  const isActive = (href: string) => {
    if (href === '/' && pathname === '/') return true;
    if (href !== '/' && pathname.startsWith(href)) return true;
    return false;
  };

  return (
    <header className="sticky top-0 z-50 bg-[#002E66] border-b border-[#0050B5]/40 text-white shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* Logo & Branding */}
          <div className="flex items-center space-x-3">
            <Link href="/" className="flex items-center space-x-2.5 group">
              <div className="w-9 h-9 rounded-lg bg-[#019BDE] flex items-center justify-center text-white font-black text-xl tracking-tighter shadow-inner group-hover:bg-[#0082BD] transition-colors">
                M
              </div>
              <div className="flex flex-col">
                <div className="flex items-center space-x-1.5">
                  <span className="font-extrabold text-lg tracking-tight text-white">Movistar</span>
                  <span className="bg-[#019BDE] text-white text-[10px] font-bold px-1.5 py-0.2 rounded uppercase tracking-wider">
                    IQ
                  </span>
                </div>
                <span className="text-[10px] text-blue-200 uppercase tracking-widest font-semibold">
                  Asesor Comercial
                </span>
              </div>
            </Link>

            <div className="hidden md:flex items-center space-x-1.5 ml-4 px-2.5 py-1 rounded-full bg-blue-900/60 border border-blue-400/30 text-xs text-blue-100">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              <span>En Tienda • Turno Mañana</span>
            </div>
          </div>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center space-x-1">
            {navLinks.map((link) => {
              const Icon = link.icon;
              const active = isActive(link.href);
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
                    active
                      ? 'bg-[#019BDE] text-white shadow-sm'
                      : 'text-blue-100 hover:bg-blue-800/60 hover:text-white'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{link.label}</span>
                </Link>
              );
            })}
          </nav>

          {/* Mobile Hamburger Button */}
          <div className="flex md:hidden items-center space-x-2">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              type="button"
              aria-label="Abrir menú"
              className="p-2 rounded-lg text-blue-100 hover:text-white hover:bg-blue-800 focus:outline-none focus:ring-2 focus:ring-blue-400"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-[#001D42] border-b border-blue-900 px-4 pt-3 pb-4 space-y-2 shadow-xl animate-in slide-in-from-top duration-200">
          <div className="flex items-center space-x-2 px-3 py-1.5 mb-2 rounded bg-blue-950 text-xs text-blue-200">
            <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
            <span>Atención Comercial Activa</span>
          </div>

          {navLinks.map((link) => {
            const Icon = link.icon;
            const active = isActive(link.href);
            return (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className={`flex items-center space-x-3 px-3 py-2.5 rounded-lg text-base font-semibold transition-colors ${
                  active
                    ? 'bg-[#019BDE] text-white'
                    : 'text-blue-100 hover:bg-blue-800/60 hover:text-white'
                }`}
              >
                <Icon className="w-5 h-5" />
                <span>{link.label}</span>
              </Link>
            );
          })}
        </div>
      )}
    </header>
  );
};
