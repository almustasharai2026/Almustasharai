
'use client';

import React from 'react';
import { 
  LayoutDashboard, MessageSquare, ShieldCheck, 
  Wallet, Calendar, Settings, LogOut, Zap, Users, 
  Plus, AlertTriangle, Scale, User, FileText
} from 'lucide-react';
import { useUser } from '@/firebase';
import { roles as ROLES_LIST } from '@/lib/roles';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

interface SidebarProps {
  activeId?: string;
}

/**
 * القائمة الجانبية السيادية (Sovereign Sidebar - king2026).
 * تتكيف تلقائياً مع رتبة المستخدم وتوفر وصولاً سريعاً للأوامر الاستراتيجية.
 */
export default function SovereignSidebar({ activeId }: SidebarProps) {
  const { profile, role, signOut } = useUser();
  const pathname = usePathname();

  // ميزان القوائم السيادي بناءً على الرتبة
  const getMenuItems = () => {
    if (role === ROLES_LIST.ADMIN) {
      return [
        { id: 'dash', icon: <LayoutDashboard />, label: 'التحكم المطلق', path: '/admin' },
        { id: 'verify', icon: <ShieldCheck />, label: 'توثيق الخبراء', path: '/admin/consultants' },
        { id: 'wallet', icon: <Wallet />, label: 'الخزنة والأرباح', path: '/pricing' },
        { id: 'bot', icon: <Scale />, label: 'المستشار الذكي', path: '/bot' },
      ];
    }
    if (role === ROLES_LIST.CONSULTANT) {
      return [
        { id: 'chat', icon: <MessageSquare />, label: 'استشاراتي المباشرة', path: '/consultants' },
        { id: 'schedule', icon: <Calendar />, label: 'جدول المواعيد', path: '/bookings' },
        { id: 'wallet', icon: <Wallet />, label: 'محفظة الأتعاب', path: '/dashboard' },
      ];
    }
    // الرتب العادية (Citizen/VIP)
    return [
      { id: 'bot', icon: <Zap />, label: 'المستشار الذكي', path: '/bot' },
      { id: 'lawyers', icon: <Users />, label: 'مجلس الخبراء', path: '/consultants' },
      { id: 'docs', icon: <FileText />, label: 'المكتبة الرقمية', path: '/templates' },
      { id: 'bookings', icon: <Calendar />, label: 'حجوزاتي', path: '/bookings' },
    ];
  };

  const menuItems = getMenuItems();

  return (
    <aside className="w-72 h-screen bg-[#05050a] border-l border-white/5 flex flex-col fixed right-0 top-0 z-[100] shadow-3xl">
      {/* Logo Section */}
      <div className="p-8 border-b border-white/5 flex items-center gap-4">
        <div className="w-12 h-12 bg-primary rounded-2xl flex items-center justify-center shadow-[0_0_30px_rgba(212,175,55,0.3)] border border-white/10">
          <ShieldCheck className="text-[#020617] h-7 w-7" />
        </div>
        <div className="flex flex-col">
          <span className="text-xl font-black tracking-tighter text-white">المستشار AI</span>
          <span className="text-[8px] font-black text-white/20 uppercase tracking-[0.3em]">Sovereign Node</span>
        </div>
      </div>

      {/* Navigation Protocol */}
      <nav className="flex-1 p-6 space-y-3 overflow-y-auto scrollbar-none">
        {menuItems.map((item) => {
          const isActive = activeId === item.id || pathname === item.path;
          return (
            <Link key={item.id} href={item.path}>
              <motion.button 
                whileHover={{ x: -5 }}
                className={`w-full flex items-center gap-4 px-5 py-4 rounded-[1.5rem] transition-all duration-500 group ${
                  isActive 
                  ? 'bg-primary/10 text-primary border border-primary/20 shadow-xl' 
                  : 'text-white/30 hover:bg-white/5 hover:text-white border border-transparent'
                }`}
              >
                <span className={`transition-transform duration-500 ${isActive ? 'scale-110' : 'group-hover:scale-110 opacity-50 group-hover:opacity-100'}`}>
                  {item.icon}
                </span>
                <span className="font-black text-sm tracking-tight">{item.label}</span>
              </motion.button>
            </Link>
          );
        })}
      </nav>

      {/* Dynamic Strategic Actions */}
      <div className="p-6 border-t border-white/5 bg-black/40">
        <p className="text-[9px] font-black uppercase tracking-[0.4em] text-white/10 mb-5 px-2">أوامر سريعة</p>
        <div className="space-y-3">
           {(activeId === 'bot' || pathname === '/bot') && (
             <button onClick={() => window.location.reload()} className="w-full bg-white text-[#020617] py-4 rounded-2xl text-xs font-black hover:scale-[1.02] transition-all shadow-2xl flex items-center justify-center gap-3">
               <Plus className="h-4 w-4" /> استشارة جديدة
             </button>
           )}
           {role === ROLES_LIST.ADMIN && (
             <button className="w-full bg-red-500/10 text-red-500 py-4 rounded-2xl text-[10px] font-black border border-red-500/20 uppercase tracking-widest hover:bg-red-500/20 transition-all">
               إيقاف بروتوكول النظام ⚠️
             </button>
           )}
           {role !== ROLES_LIST.ADMIN && (
             <Link href="/pricing">
               <button className="w-full bg-primary/10 text-primary py-4 rounded-2xl text-xs font-black border border-primary/20 hover:bg-primary/20 transition-all">
                 شحن الوحدات المالية 💰
               </button>
             </Link>
           )}
        </div>
      </div>

      {/* Identity Module */}
      <div className="p-8 border-t border-white/5 flex items-center gap-4 bg-black/20">
        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-white/10 to-white/5 border border-white/10 flex items-center justify-center text-primary font-black shadow-inner overflow-hidden">
           {profile?.fullName ? profile.fullName.charAt(0) : <User className="h-6 w-6" />}
        </div>
        <div className="flex-1 overflow-hidden text-right">
          <p className="text-sm font-black truncate text-white">{profile?.fullName || "مواطن"}</p>
          <p className="text-[8px] text-primary font-black uppercase tracking-[0.3em] mt-1">{role}</p>
        </div>
        <button onClick={() => signOut()} className="text-white/20 hover:text-red-500 transition-colors">
          <LogOut size={20} />
        </button>
      </div>
    </aside>
  );
}
