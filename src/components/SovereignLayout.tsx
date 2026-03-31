'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  MessageSquare, User, ArrowUp, 
  LayoutGrid, Loader2, Menu, X, Wallet, ShieldCheck, Crown
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
 * إطار النظام السيادي الممتد (Sovereign OS Max Viewport).
 * تم التوسعة لتشغل كامل الشاشة بنمط Matte Black الغامر دون قيود.
 */
export default function SovereignLayout({ children, activeId }: SovereignLayoutProps) {
  const pathname = usePathname();
  const { profile, user, isUserLoading } = useUser();
  const [isSidebarOpen, setSidebarOpen] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const sovereign = checkSovereignStatus(user?.email);
  const balance = getBalance(profile);

  if (!isMounted) return null;

  return (
    <div className="min-h-screen bg-black flex items-center justify-center font-sans overflow-hidden" dir="rtl">
      
      {/* Sovereign Full-Screen Canvas */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="w-full h-screen bg-[#050505] relative overflow-hidden flex flex-col matte-black border-none"
      >
        
        {/* Tucked Vault Header (Grand Scale) */}
        <div className="p-8 md:p-12 pt-12 md:pt-16 flex justify-between items-center relative z-50 max-w-7xl mx-auto w-full">
          <button 
            onClick={() => setSidebarOpen(true)}
            className="w-16 h-16 bg-[#151515] rounded-3xl flex items-center justify-center border border-white/5 hover:bg-white/10 transition-all shadow-2xl"
          >
            <Menu size={32} className="text-zinc-500" />
          </button>

          <Link href="/pricing">
            <div className="bg-[#151515] border border-white/5 px-8 py-4 rounded-[2rem] flex items-center gap-6 shadow-2xl hover:bg-white/5 transition-all group">
               {sovereign.isOwner ? (
                 <Crown size={24} className="text-primary animate-pulse" />
               ) : (
                 <Wallet size={24} className="text-zinc-700 group-hover:text-primary transition-colors" />
               )}
               <div className="flex flex-col items-end">
                  <span className={`text-3xl font-black tabular-nums leading-none ${sovereign.isOwner ? 'text-primary' : 'text-white'}`}>
                    {balance}
                  </span>
                  <span className="text-[10px] font-black text-zinc-700 uppercase tracking-widest mt-2">
                    {sovereign.isOwner ? 'Supreme Sovereign Account' : 'Available Sovereign Units'}
                  </span>
               </div>
            </div>
          </Link>
        </div>

        {/* Immersive Content Area */}
        <main className="flex-1 overflow-y-auto custom-scrollbar relative scroll-smooth scrollbar-none bg-gradient-to-b from-transparent to-black/60">
          <div className="max-w-7xl mx-auto h-full px-8 md:px-12">
            {isUserLoading ? (
              <div className="h-full flex flex-col items-center justify-center opacity-20">
                <Loader2 className="animate-spin text-primary h-12 w-12" />
              </div>
            ) : (
              <div className="h-full">
                {children}
              </div>
            )}
          </div>
        </main>

        {/* Sovereign Sidebar Drawer */}
        <SovereignSidebar 
          isOpen={isSidebarOpen} 
          onClose={() => setSidebarOpen(false)} 
        />

        {/* Sovereign Command Dock (Floating Wide) */}
        <div className="p-10 pb-16 relative z-50 max-w-4xl mx-auto w-full">
          <div className="bg-[#151515]/90 backdrop-blur-3xl rounded-[4rem] p-4 flex items-center justify-between border border-white/5 shadow-[0_30px_100px_rgba(0,0,0,0.8)]">
            <DockItem href="/bot" active={pathname === '/bot'} icon={<MessageSquare size={32} />} label="Bot" />
            <DockItem href="/dashboard" active={pathname === '/dashboard'} icon={<User size={32} />} label="Vault" />
            {sovereign.isOwner && (
              <DockItem href="/admin" active={pathname === '/admin'} icon={<Crown size={32} />} label="Crown" />
            )}
            <DockItem href="/" active={pathname === '/'} icon={<ArrowUp size={32} />} label="Home" />
          </div>
        </div>

      </motion.div>
    </div>
  );
}

function DockItem({ href, active, icon, label }: any) {
  return (
    <Link href={href} className="flex-1">
      <motion.button 
        whileTap={{ scale: 0.9 }}
        className={`w-full h-20 rounded-[2.5rem] flex flex-col items-center justify-center gap-1 transition-all ${
          active 
            ? 'bg-primary text-black shadow-2xl shadow-primary/20 scale-105' 
            : 'text-zinc-700 hover:text-white hover:bg-white/5'
        }`}
      >
        {icon}
        <span className="text-[8px] font-black uppercase tracking-widest opacity-40">{label}</span>
      </motion.button>
    </Link>
  );
}
