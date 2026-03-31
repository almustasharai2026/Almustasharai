
'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Home, Search, Settings, User, Wallet, Scale } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useUser } from '@/firebase';

interface SovereignLayoutProps {
  children: React.ReactNode;
  activeId: string;
}

export default function SovereignLayout({ children, activeId }: SovereignLayoutProps) {
  const pathname = usePathname();
  const { profile } = useUser();

  return (
    <div className="flex bg-[#010103] min-h-screen font-sans relative overflow-hidden text-white" dir="rtl">
      {/* 1. Aurora Background Effects */}
      <div className="fixed top-[-10%] left-[-10%] w-[40%] h-[40%] aurora-1 blur-[150px] animate-pulse rounded-full pointer-events-none z-0" />
      <div className="fixed bottom-[-10%] right-[-10%] w-[50%] h-[50%] aurora-2 blur-[180px] animate-bounce rounded-full pointer-events-none z-0" />

      {/* 2. Top Minimalist Nav */}
      <nav className="fixed top-0 w-full z-50 p-6 flex justify-between items-center backdrop-blur-md border-b border-white/5">
        <Link href="/" className="flex items-center gap-3 group">
          <div className="w-10 h-10 bg-gradient-to-br from-emerald-400 to-blue-600 rounded-xl rotate-45 flex items-center justify-center shadow-lg group-hover:rotate-[225deg] transition-transform duration-1000">
            <Scale className="-rotate-45 text-black" size={20} />
          </div>
          <span className="text-2xl font-black tracking-tighter uppercase">LegaLex <span className="text-emerald-500 text-xs">AI</span></span>
        </Link>
        
        <div className="bg-white/5 border border-white/10 px-6 py-2 rounded-full backdrop-blur-2xl flex items-center gap-3 group cursor-pointer hover:bg-emerald-500 transition-all shadow-xl">
          <Wallet size={16} className="group-hover:text-black text-emerald-500" />
          <span className="text-sm font-bold group-hover:text-black tracking-widest tabular-nums">
            {profile?.balance || 0}.00 EGP
          </span>
        </div>
      </nav>
      
      {/* 3. Main Operational Area */}
      <main className="flex-1 pt-32 pb-40 px-6 relative z-10">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="w-full h-full max-w-7xl mx-auto"
        >
          {children}
        </motion.div>
      </main>

      {/* 4. Royal Dock (Mac Style) */}
      <div className="fixed bottom-8 left-1/2 -translate-x-1/2 bg-white/5 backdrop-blur-3xl border border-white/10 p-3 rounded-[2.5rem] flex items-center gap-2 sm:gap-6 shadow-3xl z-[100]">
         <DockItem href="/" icon={<Home />} label="الرئيسية" active={pathname === '/'} />
         <DockItem href="/bot" icon={<Search />} label="الاستشارة" active={pathname === '/bot'} />
         <DockItem href="/admin" icon={<Settings />} label="الإدارة" active={pathname === '/admin'} />
         <div className="h-8 w-[1px] bg-white/10 mx-2" />
         <DockItem href="/dashboard" icon={<User />} label="حسابي" active={pathname === '/dashboard'} />
      </div>
    </div>
  );
}

function DockItem({ href, icon, label, active }: any) {
  return (
    <Link href={href}>
      <motion.div 
        whileHover={{ y: -10, scale: 1.1 }}
        className={`flex flex-col items-center gap-1 p-3 rounded-2xl transition-all ${
          active ? 'bg-emerald-500 text-black shadow-xl' : 'text-zinc-500 hover:text-white hover:bg-white/5'
        }`}
      >
        <div className="scale-110">{icon}</div>
        <span className="text-[8px] font-black uppercase tracking-widest">{label}</span>
      </motion.div>
    </Link>
  );
}
