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
    <header className="sticky top-0 z-50 bg-white border-b border-[#E3E2E0] text-[#37352F] shadow-[0_1px_2px_rgba(15,15,15,0.04)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-14">
          
          {/* Logo & Branding */}
          <div className="flex items-center space-x-3">
            <Link href="/" className="flex items-center space-x-2.5 group">
              <div className="w-7 h-7 rounded bg-[#37352F] flex items-center justify-center text-white font-black text-sm tracking-tighter shadow-sm group-hover:bg-[#017BAE] transition-colors">
                A
              </div>
              <div className="flex items-center space-x-2">
                <span className="font-extrabold text-base tracking-tight text-[#37352F]">AsesorIA</span>
                <span className="bg-[#E8F3F7] text-[#017BAE] border border-[#C8E3ED] text-[10px] font-bold px-1.5 py-0.5 rounded">
                  Copiloto
                </span>
              </div>
            </Link>

            {/* Advisor Store Status Tag */}
            <div className="hidden md:flex items-center space-x-1.5 ml-4 px-2.5 py-0.5 rounded-full bg-[#F1F1EF] border border-[#E3E2E0] text-xs text-[#787774]">
              <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
              <span className="font-medium text-[#37352F]">En Tienda • Turno Mañana</span>
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
                  className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-md text-xs font-semibold transition-all ${
                    active
                      ? 'bg-[#E8F3F7] text-[#017BAE] border border-[#C8E3ED]'
                      : 'text-[#787774] hover:bg-[#F1F0EC] hover:text-[#37352F]'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
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
              className="p-1.5 rounded-md text-[#787774] hover:text-[#37352F] hover:bg-[#F1F0EC] focus:outline-none"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation Menu Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-white border-b border-[#E3E2E0] px-4 pt-2 pb-3 space-y-1 shadow-lg">
          <div className="flex items-center space-x-2 px-3 py-1 mb-2 rounded bg-[#F1F1EF] text-xs text-[#787774]">
            <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
            <span className="font-medium">Atención Comercial Activa</span>
          </div>

          {navLinks.map((link) => {
            const Icon = link.icon;
            const active = isActive(link.href);
            return (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className={`flex items-center space-x-2.5 px-3 py-2 rounded-md text-sm font-semibold transition-colors ${
                  active
                    ? 'bg-[#E8F3F7] text-[#017BAE] border border-[#C8E3ED]'
                    : 'text-[#787774] hover:bg-[#F1F0EC] hover:text-[#37352F]'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{link.label}</span>
              </Link>
            );
          })}
        </div>
      )}
    </header>
  );
};
