
'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  MessageSquare, User, Scale, ArrowUp, 
  Camera, Zap, ShieldCheck, LayoutGrid, Loader2
} from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useUser } from '@/firebase';
import SovereignSidebar from '@/components/SovereignSidebar';
import { checkSovereignStatus } from '@/lib/roles';

interface SovereignLayoutProps {
  children: React.ReactNode;
  activeId: string;
}

/**
 * واجهة الجسد الرقمي المحمول (The Sovereign Handheld Body).
 * تم تحديث البروتوكول لضمان عدم حدوث تعليق (Hang) أثناء التحميل.
 */
export default function SovereignLayout({ children, activeId }: SovereignLayoutProps) {
  const pathname = usePathname();
  const { profile, user, isUserLoading } = useUser();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const sovereign = checkSovereignStatus(user?.email);

  // منع تعليق الواجهة: إذا استغرق التحميل وقتاً طويلاً، نعرض المحتوى مع شارة انتظار بسيطة
  if (!isMounted) return null;

  return (
    <div className="min-h-screen bg-[#050505] flex items-center justify-center p-4 lg:p-10 font-sans selection:bg-[#ff5722]/20" dir="rtl">
      
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-[450px] h-[880px] bg-[#1a1a1a] rounded-[4.5rem] shadow-[0_80px_150px_-30px_rgba(0,0,0,0.9)] border-[10px] border-[#252525] relative overflow-hidden flex flex-col"
      >
        
        {/* العدسة السيادية المضيئة */}
        <div 
          onClick={() => setIsSidebarOpen(true)}
          className="absolute top-12 right-12 w-16 h-16 bg-[#252525] rounded-[2rem] flex items-center justify-center border border-[#ff5722]/10 hover:border-[#ff5722] z-50 group cursor-pointer transition-all duration-700 shadow-2xl active:scale-95"
        >
           <div className="relative">
              <Camera size={28} className="text-zinc-600 group-hover:text-[#ff5722] transition-colors" />
              <div className="absolute -top-1 -right-1 w-3 h-3 bg-[#ff5722] rounded-full animate-pulse shadow-[0_0_15px_#ff5722]" />
           </div>
        </div>

        {/* القائمة الجانبية المنزلقة */}
        <SovereignSidebar 
          isOpen={isSidebarOpen} 
          onClose={() => setIsSidebarOpen(false)} 
        />

        {/* الهوية العلوية */}
        <div className="p-12 pt-24 flex justify-between items-end">
          <div className="space-y-2">
            <h1 className="text-4xl font-black tracking-tighter italic text-white leading-none">المستشار</h1>
            <div className="flex items-center gap-3">
               <div className="w-2.5 h-2.5 bg-emerald-500 rounded-full shadow-[0_0_15px_rgba(16,185,129,0.6)]" />
               <p className="text-[10px] text-zinc-600 uppercase tracking-[0.4em] font-black">Sovereign OS 1.0</p>
            </div>
          </div>
          
          <div className="flex flex-col items-end gap-1.5">
             <span className="text-[9px] font-black text-[#ff5722] uppercase tracking-[0.3em] opacity-60">Vault Status</span>
             <div className="flex items-center gap-2">
                <span className="text-2xl font-black tabular-nums text-white">
                  {sovereign.isOwner ? '∞' : (profile?.balance || 0)}
                </span>
                <span className="text-[10px] font-black text-zinc-500 uppercase">EGP</span>
             </div>
          </div>
        </div>

        {/* مساحة العمل */}
        <main className="flex-1 px-10 overflow-y-auto custom-scrollbar relative scroll-smooth">
          {isUserLoading ? (
            <div className="h-full flex flex-col items-center justify-center gap-4 opacity-20">
              <Loader2 className="animate-spin text-primary h-8 w-8" />
              <p className="text-[8px] font-black uppercase tracking-[0.5em]">Synchronizing Sovereignty...</p>
            </div>
          ) : (
            <AnimatePresence mode="wait">
              <motion.div
                key={pathname}
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                className="h-full"
              >
                {children}
              </motion.div>
            </AnimatePresence>
          )}
        </main>

        {/* قاعدة التنقل الجرمية */}
        <div className="p-10 pb-16 relative z-50">
          <div className="bg-[#252525]/80 backdrop-blur-3xl rounded-[3.5rem] p-3 flex items-center justify-between border border-white/5 shadow-3xl">
            <DockItem href="/bot" active={pathname === '/bot'} icon={<MessageSquare size={26} />} />
            <DockItem href="/dashboard" active={pathname === '/dashboard'} icon={<User size={26} />} />
            <DockItem href="/admin" active={pathname === '/admin'} icon={<LayoutGrid size={26} />} />
            <DockItem href="/" active={pathname === '/'} icon={<ArrowUp size={26} />} />
          </div>
        </div>

      </motion.div>
    </div>
  );
}

function DockItem({ href, active, icon }: any) {
  return (
    <Link href={href}>
      <motion.button 
        whileTap={{ scale: 0.9 }}
        className={`w-16 h-16 rounded-full flex items-center justify-center transition-all duration-500 ${
          active 
            ? 'bg-[#ff5722] text-black shadow-[0_15px_40px_rgba(255,87,34,0.4)]' 
            : 'text-zinc-600 hover:text-white hover:bg-white/5'
        }`}
      >
        {icon}
      </motion.button>
    </Link>
  );
}
