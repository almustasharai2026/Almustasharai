'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, User, History, CreditCard, 
  LifeBuoy, Settings, LogOut, ShieldCheck,
  LayoutDashboard, Sparkles
} from 'lucide-react';
import { useUser } from '@/firebase';
import { roles as ROLES_LIST, SOVEREIGN_ADMIN_EMAIL } from '@/lib/roles';
import Link from 'next/link';

interface SovereignSidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

/**
 * القائمة الجانبية السيادية (Sovereign Sidebar - king2026).
 * توفر وصولاً سريعاً للأوامر والملفات داخل الجسد الرقمي.
 */
export default function SovereignSidebar({ isOpen, onClose }: SovereignSidebarProps) {
  const { user, profile, role, signOut } = useUser();
  const isOwner = user?.email === SOVEREIGN_ADMIN_EMAIL;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* 1. طبقة التعتيم الزجاجية (Overlay) */}
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm z-[60]"
          />

          {/* 2. جسم القائمة (The Drawer) */}
          <motion.aside 
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: "spring", damping: 30, stiffness: 300 }}
            className="absolute right-0 top-0 h-full w-[320px] bg-[#1a1a1a] z-[70] border-r border-white/5 shadow-3xl flex flex-col"
          >
            {/* Header */}
            <div className="p-10 flex justify-between items-center border-b border-white/5">
              <div className="flex items-center gap-4">
                 <div className="w-10 h-10 bg-[#ff5722] rounded-xl flex items-center justify-center shadow-lg shadow-[#ff5722]/20">
                    <User size={20} className="text-black" />
                 </div>
                 <span className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-500">Menu Protocol</span>
              </div>
              <button onClick={onClose} className="p-2 hover:bg-white/5 rounded-full transition-all text-zinc-600">
                <X size={24} />
              </button>
            </div>

            {/* Navigation Links */}
            <div className="flex-1 p-8 space-y-2 overflow-y-auto scrollbar-none">
              <SidebarLink href="/dashboard" icon={<User size={18}/>} label="الملف الشخصي" onClick={onClose} />
              <SidebarLink href="/bot" icon={<History size={18}/>} label="سجل الاستشارات" onClick={onClose} />
              <SidebarLink href="/pricing" icon={<CreditCard size={18}/>} label="شحن الرصيد" onClick={onClose} />
              <SidebarLink href="/templates" icon={<Sparkles size={18}/>} label="المكتبة الرقمية" onClick={onClose} />
              
              <div className="h-px bg-white/5 my-6" />
              
              <SidebarLink href="/settings" icon={<Settings size={18}/>} label="الإعدادات السيادية" onClick={onClose} />

              {/* صلاحية المالك الحصرية */}
              {isOwner && (
                <SidebarLink 
                   href="/admin"
                   icon={<ShieldCheck size={18} className="text-[#ff5722]" />} 
                   label="لوحة السيطرة (الملك)" 
                   special 
                   onClick={onClose}
                />
              )}
            </div>

            {/* Footer / Identity */}
            <div className="p-8 border-t border-white/5 space-y-4">
               <div className="flex items-center gap-4 px-2 mb-4">
                  <div className="w-8 h-8 rounded-full bg-zinc-800 flex items-center justify-center text-[10px] font-bold text-zinc-500">
                    {profile?.fullName?.charAt(0) || "U"}
                  </div>
                  <div className="flex flex-col">
                    <span className="text-xs font-bold text-white truncate max-w-[150px]">{profile?.fullName || "مواطن سيادي"}</span>
                    <span className="text-[8px] text-zinc-600 uppercase font-black tracking-widest">{role}</span>
                  </div>
               </div>
               <button 
                onClick={() => { signOut(); onClose(); }}
                className="w-full flex items-center justify-center gap-3 py-4 rounded-2xl bg-zinc-900/50 text-zinc-500 hover:bg-red-500/10 hover:text-red-500 transition-all text-[10px] font-black uppercase tracking-widest border border-white/5"
               >
                  <LogOut size={16} /> إنهاء الجلسة
               </button>
            </div>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}

function SidebarLink({ href, icon, label, special = false, onClick }: any) {
  return (
    <Link href={href} onClick={onClick}>
      <button className={`
        w-full flex items-center gap-5 p-4 rounded-[1.5rem] transition-all group
        ${special 
          ? 'bg-[#ff5722]/5 text-[#ff5722] border border-[#ff5722]/10 hover:bg-[#ff5722]/10 shadow-lg shadow-[#ff5722]/5' 
          : 'hover:bg-white/[0.03] text-zinc-500 hover:text-white border border-transparent hover:border-white/5'}
      `}>
        <span className="group-hover:scale-110 transition-transform duration-500">{icon}</span>
        <span className="text-sm font-bold tracking-tight">{label}</span>
      </button>
    </Link>
  );
}
