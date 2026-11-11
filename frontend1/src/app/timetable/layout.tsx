'use client';

import React, { useState } from 'react';
import { TimetableProvider } from '@/context/TimetableContext';
import { TimetableSidebar } from '@/components/timetable/TimetableSidebar';

export default function TimetableLayout({ children }: { children: React.ReactNode }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <TimetableProvider>
      <div className="min-h-screen bg-slate-50 flex text-slate-800 antialiased font-sans">
        {/* SIDEBAR DESKTOP */}
        <div className="hidden lg:flex fixed inset-y-0 z-30">
          <TimetableSidebar />
        </div>

        {/* SIDEBAR MOBILE OVERLAY */}
        {mobileMenuOpen && (
          <div className="lg:hidden fixed inset-0 z-40 flex">
            <div
              className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs transition-opacity"
              onClick={() => setMobileMenuOpen(false)}
            />
            <div className="relative flex-1 flex flex-col max-w-xs w-full bg-white z-50">
              <TimetableSidebar onCloseMobile={() => setMobileMenuOpen(false)} />
            </div>
          </div>
        )}

        {/* CONTENU PRINCIPAL */}
        <div className="flex-1 lg:pl-72 flex flex-col min-h-screen w-full">
          {children}
        </div>
      </div>
    </TimetableProvider>
  );
}

