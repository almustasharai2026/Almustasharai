
'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  MessageSquare, User, ArrowUp, 
  LayoutGrid, Loader2, Menu, X
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
    <div className="min-h-screen bg-[#050505] flex items-center justify-center p-4 lg:p-10 font-sans selection:bg-primary/20" dir="rtl">
      
      <motion.div 
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-[450px] h-[880px] bg-[#1a1a1a] rounded-[4.5rem] shadow-3xl border-[10px] border-[#252525] relative overflow-hidden flex flex-col"
      >
        
        {/* Sovereign Device Header */}
        <div className="p-10 pt-16 flex justify-between items-center relative z-50">
          <button 
            onClick={() => setSidebarOpen(true)}
            className="w-14 h-14 bg-[#252525] rounded-2xl flex items-center justify-center border border-white/5 hover:bg-white/5 transition-colors"
          >
            {isSidebarOpen ? <X size={24} className="text-primary" /> : <Menu size={24} className="text-zinc-500" />}
          </button>

          <div className="flex flex-col items-end">
             <div className="flex items-center gap-2">
                <span className="text-2xl font-black tabular-nums text-white">
                  {balance === Infinity ? '∞' : balance}
                </span>
                <span className="text-[10px] font-black text-zinc-500 uppercase">EGP</span>
             </div>
             <div className="flex items-center gap-1.5">
                <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
                <span className="text-[8px] font-black text-zinc-600 uppercase tracking-widest">Secure Link Active</span>
             </div>
          </div>
        </div>

        {/* Content Area */}
        <main className="flex-1 px-8 overflow-y-auto custom-scrollbar relative scroll-smooth">
          {isUserLoading ? (
            <div className="h-full flex flex-col items-center justify-center opacity-20">
              <Loader2 className="animate-spin text-primary h-8 w-8" />
            </div>
          ) : (
            <div className="h-full">
              {children}
            </div>
          )}
        </main>

        {/* Floating Sidebar */}
        <SovereignSidebar 
          isOpen={isSidebarOpen} 
          onClose={() => setSidebarOpen(false)} 
        />

        {/* Device Dock */}
        <div className="p-8 pb-14 relative z-50">
          <div className="bg-[#252525]/90 backdrop-blur-3xl rounded-[3rem] p-3 flex items-center justify-between border border-white/5 shadow-3xl">
            <DockItem href="/bot" active={pathname === '/bot'} icon={<MessageSquare size={24} />} />
            <DockItem href="/dashboard" active={pathname === '/dashboard'} icon={<User size={24} />} />
            <DockItem href="/admin" active={pathname === '/admin'} icon={<LayoutGrid size={24} />} />
            <DockItem href="/" active={pathname === '/'} icon={<ArrowUp size={24} />} />
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
        className={`w-14 h-14 rounded-full flex items-center justify-center transition-all ${
          active 
            ? 'bg-primary text-black shadow-lg shadow-primary/20' 
            : 'text-zinc-600 hover:text-white'
        }`}
      >
        {icon}
      </motion.button>
    </Link>
  );
}
