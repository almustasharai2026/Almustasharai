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
 * إطار الجهاز السيادي (The Sovereign Device Body).
 * تصميم مطفي (Matte Black) مستوحى من Rabbit R1 مع حواف دائرية ضخمة.
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
    <div className="min-h-screen bg-[#020202] flex items-center justify-center p-4 lg:p-10 font-sans" dir="rtl">
      
      {/* Sovereign Device Body (Matte Black Finish) */}
      <motion.div 
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-[440px] h-[880px] bg-[#0a0a0a] rounded-[4.5rem] shadow-[0_50px_100px_-20px_rgba(0,0,0,1)] border-[10px] border-[#151515] relative overflow-hidden flex flex-col matte-black"
      >
        
        {/* Tucked Vault Header */}
        <div className="p-10 pt-16 flex justify-between items-center relative z-50">
          <button 
            onClick={() => setSidebarOpen(true)}
            className="w-14 h-14 bg-[#1a1a1a] rounded-2xl flex items-center justify-center border border-white/5 hover:bg-white/5 transition-colors shadow-inner"
          >
            <Menu size={24} className="text-zinc-600" />
          </button>

          <Link href="/pricing">
            <div className="bg-[#1a1a1a] border border-white/5 px-6 py-3 rounded-3xl flex items-center gap-4 shadow-inner hover:bg-white/5 transition-all group">
               {sovereign.isOwner ? (
                 <Crown size={16} className="text-primary animate-pulse" />
               ) : (
                 <Wallet size={16} className="text-zinc-700 group-hover:text-primary transition-colors" />
               )}
               <div className="flex flex-col items-end">
                  <span className={`text-xl font-black tabular-nums leading-none ${sovereign.isOwner ? 'text-primary' : 'text-white'}`}>
                    {balance}
                  </span>
                  <span className="text-[8px] font-black text-zinc-700 uppercase tracking-widest mt-1">
                    {sovereign.isOwner ? 'Supreme Status' : 'Sovereign Units'}
                  </span>
               </div>
            </div>
          </Link>
        </div>

        {/* Content Area */}
        <main className="flex-1 px-8 overflow-y-auto custom-scrollbar relative scroll-smooth scrollbar-none bg-gradient-to-b from-transparent to-black/40">
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

        {/* Device Sidebar Drawer */}
        <SovereignSidebar 
          isOpen={isSidebarOpen} 
          onClose={() => setSidebarOpen(false)} 
        />

        {/* Minimalist Device Dock */}
        <div className="p-8 pb-14 relative z-50">
          <div className="bg-[#1a1a1a]/80 backdrop-blur-3xl rounded-[3.5rem] p-3 flex items-center justify-between border border-white/5 shadow-2xl">
            <DockItem href="/bot" active={pathname === '/bot'} icon={<MessageSquare size={26} />} />
            <DockItem href="/dashboard" active={pathname === '/dashboard'} icon={<User size={26} />} />
            {sovereign.isOwner && (
              <DockItem href="/admin" active={pathname === '/admin'} icon={<Crown size={26} />} />
            )}
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
        className={`w-16 h-16 rounded-full flex items-center justify-center transition-all ${
          active 
            ? 'bg-primary text-black shadow-2xl shadow-primary/20 scale-110' 
            : 'text-zinc-700 hover:text-white'
        }`}
      >
        {icon}
      </motion.button>
    </Link>
  );
}
