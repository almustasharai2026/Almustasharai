'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  MessageSquare, User, ArrowUp, 
  Menu, Wallet, Crown, Loader2
} from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useUser } from '@/firebase';
import SovereignSidebar from '@/components/SovereignSidebar';
import { checkSovereignStatus, getBalance } from '@/lib/roles';

interface SovereignLayoutProps {
  children: React.ReactNode;
  activeId: string;
}

/**
 * إطار التشغيل السيادي (Sovereign OS Layout).
 * تم تحديثه ليشغل كامل مساحة الشاشة بنسبة 100% دون قيود.
 */
export default function SovereignLayout({ children, activeId }: SovereignLayoutProps) {
  const pathname = usePathname();
  const { profile, user, isUserLoading } = useUser();
  const [isSidebarOpen, setSidebarOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  const sovereign = checkSovereignStatus(user?.email);
  const balance = getBalance(profile);

  return (
    <div className="fixed inset-0 bg-[#020202] text-white font-sans overflow-hidden flex flex-col matte-black" dir="rtl">
      
      {/* Edge-to-Edge Dynamic Header */}
      <div className="p-8 md:p-12 flex justify-between items-center relative z-50 w-full">
        <button 
          onClick={() => setSidebarOpen(true)}
          className="w-20 h-20 bg-[#0a0a0a] rounded-[2.5rem] flex items-center justify-center border border-white/5 hover:bg-white/10 transition-all shadow-3xl"
        >
          <Menu size={36} className="text-zinc-600" />
        </button>

        <Link href="/pricing">
          <div className="bg-[#0a0a0a] border border-white/5 px-12 py-6 rounded-[3.5rem] flex items-center gap-10 shadow-3xl hover:bg-white/5 transition-all group">
             {sovereign.isOwner ? (
               <Crown size={40} className="text-primary animate-pulse" />
             ) : (
               <Wallet size={40} className="text-zinc-700" />
             )}
             <div className="flex flex-col items-end">
                <span className={`text-6xl font-black tabular-nums leading-none ${sovereign.isOwner ? 'text-primary' : 'text-white'}`}>
                  {balance}
                </span>
                <span className="text-[10px] font-black text-zinc-700 uppercase tracking-[0.5em] mt-2">
                  {sovereign.isOwner ? 'SUPREME AUTHORITY' : 'SOVEREIGN UNITS'}
                </span>
             </div>
          </div>
        </Link>
      </div>

      {/* Full Screen Viewport Content */}
      <main className="flex-1 overflow-y-auto scrollbar-none pb-40">
        <div className="w-full h-full">
          {isUserLoading ? (
            <div className="h-full flex items-center justify-center opacity-20">
              <Loader2 className="animate-spin text-primary h-20 w-20" />
            </div>
          ) : (
            children
          )}
        </div>
      </main>

      <SovereignSidebar isOpen={isSidebarOpen} onClose={() => setSidebarOpen(false)} />

      {/* Sovereign Command Dock */}
      <div className="fixed bottom-12 inset-x-0 z-50 px-10">
        <div className="max-w-3xl mx-auto bg-[#0a0a0a]/90 backdrop-blur-3xl rounded-[5rem] p-5 flex items-center justify-between border border-white/10 shadow-3xl">
          <DockItem href="/bot" active={pathname === '/bot'} icon={<MessageSquare size={44} />} />
          <DockItem href="/dashboard" active={pathname === '/dashboard'} icon={<User size={44} />} />
          {sovereign.isOwner && <DockItem href="/admin" active={pathname === '/admin'} icon={<Crown size={44} />} />}
          <DockItem href="/" active={pathname === '/'} icon={<ArrowUp size={44} />} />
        </div>
      </div>

    </div>
  );
}

function DockItem({ href, active, icon }: any) {
  return (
    <Link href={href} className="flex-1">
      <button className={`w-full h-28 rounded-[4rem] flex items-center justify-center transition-all duration-500 ${
        active ? 'bg-primary text-black shadow-primary/30 scale-110 rotate-[360deg]' : 'text-zinc-700 hover:text-white'
      }`}>
        {icon}
      </button>
    </Link>
  );
}