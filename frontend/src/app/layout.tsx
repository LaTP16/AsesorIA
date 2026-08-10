import type { Metadata } from 'next';
import './globals.css';
import { Navbar } from '@/components/Navbar';
import { ShieldCheck, Clock, PhoneCall } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Movistar IQ - Cola de Prioridad Comercial',
  description: 'Herramienta interna de gestión priorizada de clientes para asesores comerciales Movistar.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es">
      <body className="min-h-screen flex flex-col bg-[#F4F7FA]">
        {/* Top Navbar */}
        <Navbar />

        {/* Main Content Area */}
        <main className="flex-1">
          {children}
        </main>
      </body>
    </html>
  );
}
