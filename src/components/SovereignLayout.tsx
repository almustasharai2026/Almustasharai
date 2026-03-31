'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { LayoutGrid, MessageSquare, User, Scale, ArrowUp, Camera } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useUser } from '@/firebase';
import SovereignSidebar from './SovereignSidebar';

interface SovereignLayoutProps {
  children: React.ReactNode;
  activeId: string;
}

/**
 * واجهة الجسد الرقمي (The Sovereign Device Body).
 * تم تحديث "العدسة" لتكون مفتاحاً للمسح والقائمة الجانبية معاً.
 */
export default function SovereignLayout({ children, activeId }: SovereignLayoutProps) {
  const pathname = usePathname();
  const { profile } = useUser();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[#0f0f0f] flex items-center justify-center p-4 lg:p-10 font-sans" dir="rtl">
      
      {/* جسد الجهاز السيادي (The Device Body) */}
      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-[450px] h-[850px] bg-[#1a1a1a] rounded-[4rem] shadow-[0_50px_100px_-20px_rgba(0,0,0,0.8)] border-[8px] border-[#252525] relative overflow-hidden flex flex-col"
      >
        
        {/* الكاميرا السيادية المحدثة (The Sovereign Lens) */}
        <button 
          onClick={() => setIsSidebarOpen(true)}
          className="absolute top-10 right-12 w-14 h-14 bg-[#252525] rounded-[1.5rem] flex items-center justify-center border border-[#ff5722]/20 hover:border-[#ff5722] z-50 group cursor-pointer transition-all duration-500 shadow-xl"
        >
           <Camera size={24} className="text-zinc-500 group-hover:text-[#ff5722] transition-colors" />
           <div className="absolute top-2 right-2 w-2 h-2 bg-[#ff5722] rounded-full animate-pulse shadow-[0_0_10px_#ff5722]" />
           <span className="absolute -bottom-10 text-[8px] font-black opacity-0 group-hover:opacity-100 transition-opacity uppercase text-[#ff5722] tracking-widest">Sovereign Lens</span>
        </button>

        {/* القائمة الجانبية المنزلقة */}
        <SovereignSidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />

        {/* الجزء العلوي: الهوية السيادية */}
        <div className="p-12 pt-20 flex justify-between items-start">
          <div className="space-y-1">
            <h1 className="text-3xl font-black tracking-tighter italic text-white">المستشار</h1>
            <div className="flex items-center gap-2">
               <div className="w-2 h-2 bg-emerald-500 rounded-full shadow-[0_0_10px_rgba(16,185,129,0.5)]" />
               <p className="text-[10px] text-zinc-500 uppercase tracking-[0.3em] font-black">Sovereign OS v1.0</p>
            </div>
          </div>
          
          <div className="flex flex-col items-end gap-1">
             <span className="text-[10px] font-black text-[#ff5722] uppercase tracking-widest">Vault Balance</span>
             <span className="text-xl font-bold tabular-nums text-white">{profile?.balance || 0} EGP</span>
          </div>
        </div>

        {/* مساحة المحتوى الرئيسية */}
        <main className="flex-1 px-10 overflow-y-auto custom-scrollbar relative">
          {children}
        </main>

        {/* الجزء السفلي: الـ Quick Dock (نظام التنقل الجرمي) */}
        <div className="p-10 pb-14">
          <div className="bg-[#252525] rounded-[3rem] p-3 flex items-center justify-between border border-white/5 shadow-inner">
            <Link href="/bot">
              <button className={`w-16 h-16 rounded-full flex items-center justify-center transition-all ${pathname === '/bot' ? 'bg-[#ff5722] text-black shadow-2xl' : 'text-zinc-500 hover:text-white'}`}>
                <MessageSquare size={24} />
              </button>
            </Link>
            
            <Link href="/dashboard">
              <button className={`w-16 h-16 rounded-full flex items-center justify-center transition-all ${pathname === '/dashboard' ? 'bg-[#ff5722] text-black shadow-2xl' : 'text-zinc-500 hover:text-white'}`}>
                <User size={24} />
              </button>
            </Link>

            <Link href="/admin">
              <button className={`w-16 h-16 rounded-full flex items-center justify-center transition-all ${pathname === '/admin' ? 'bg-[#ff5722] text-black shadow-2xl' : 'text-zinc-500 hover:text-white'}`}>
                <LayoutGrid size={24} />
              </button>
            </Link>

            <Link href="/">
              <button className="w-16 h-16 bg-zinc-800 rounded-full flex items-center justify-center text-zinc-400 hover:text-white transition-all">
                <ArrowUp size={24} />
              </button>
            </Link>
          </div>
        </div>

      </motion.div>
    </div>
  );
}
