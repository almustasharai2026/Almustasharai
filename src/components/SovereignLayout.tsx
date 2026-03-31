
'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  MessageSquare, User, Scale, ArrowUp, 
  LayoutGrid, Loader2, Menu
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

export default function SovereignLayout({ children, activeId }: SovereignLayoutProps) {
  const pathname = usePathname();
  const { profile, user, isUserLoading } = useUser();
  
  const [isSidebarOpen, setSidebarOpen] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const sovereign = checkSovereignStatus(user?.email);

  if (!isMounted) return null;

  return (
    <div className="min-h-screen bg-[#050505] flex items-center justify-center p-4 lg:p-10 font-sans selection:bg-primary/20" dir="rtl">
      
      <motion.div 
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-[450px] h-[880px] bg-[#1a1a1a] rounded-[4.5rem] shadow-3xl border-[10px] border-[#252525] relative overflow-hidden flex flex-col"
      >
        
        {/* Simplified Header */}
        <div className="p-12 pt-20 flex justify-between items-center relative z-50">
          <button 
            onClick={() => setSidebarOpen(true)}
            className="w-14 h-14 bg-[#252525] rounded-2xl flex items-center justify-center border border-white/5 hover:bg-white/5"
          >
            <Menu size={24} className="text-zinc-500" />
          </button>

          <div className="flex flex-col items-end">
             <div className="flex items-center gap-2">
                <span className="text-2xl font-black tabular-nums text-white">
                  {sovereign.isOwner ? '∞' : (profile?.balance || 0)}
                </span>
                <span className="text-[10px] font-black text-zinc-500 uppercase">EGP</span>
             </div>
          </div>
        </div>

        {/* Global Loading or Content */}
        <main className="flex-1 px-10 overflow-y-auto custom-scrollbar relative scroll-smooth">
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

        {/* Sidebar Component */}
        <SovereignSidebar 
          isOpen={isSidebarOpen} 
          onClose={() => setSidebarOpen(false)} 
        />

        {/* Minimal Dock */}
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
        className={`w-16 h-16 rounded-full flex items-center justify-center transition-all ${
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
