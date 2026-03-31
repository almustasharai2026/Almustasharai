
"use client";

import React, { useState, useEffect } from 'react';
import { Bot, Users, FileText, Scale, LogOut, LayoutDashboard, Zap, Activity } from 'lucide-react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { useUser } from '@/firebase';
import { roles as ROLES_LIST, checkSovereignStatus } from '@/lib/roles';

export default function Home() {
  const { user, profile, role, signOut } = useUser();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  if (!mounted) return null;

  return (
    <div className="min-h-screen bg-[#050505] text-white font-sans flex flex-col items-center justify-center p-6 lg:p-12 text-right overflow-hidden" dir="rtl">
      
      {/* Background Hub Glow */}
      <div className="fixed inset-0 -z-10">
        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-primary/5 via-transparent to-transparent opacity-50" />
        <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-indigo-600/5 blur-[100px] rounded-full" />
      </div>

      {/* Top Protocol Bar */}
      <nav className="fixed top-0 w-full z-50 px-8 py-6 flex justify-between items-center bg-black/20 backdrop-blur-xl border-b border-white/5">
        <div className="flex items-center gap-3 group cursor-pointer">
          <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center text-black shadow-lg shadow-primary/20 group-hover:rotate-12 transition-transform">
            <Scale size={20} />
          </div>
          <div>
            <span className="font-black text-xl tracking-tighter block leading-none">المستشار AI</span>
            <span className="text-[8px] font-black text-zinc-600 uppercase tracking-widest mt-1">Sovereign Authority</span>
          </div>
        </div>
        
        <div className="flex items-center gap-4">
          {user ? (
            <>
              <Link href={role === ROLES_LIST.ADMIN ? "/admin" : "/dashboard"}>
                <button className="flex items-center gap-3 px-6 py-2.5 bg-white/5 rounded-2xl border border-white/5 text-primary hover:bg-white/10 transition-all font-bold text-xs uppercase tracking-widest">
                  <LayoutDashboard size={16} /> 
                  <span className="hidden sm:inline">القيادة</span>
                </button>
              </Link>
              <button onClick={() => signOut()} className="p-3 bg-red-500/10 text-red-500 rounded-2xl border border-red-500/10 hover:bg-red-500/20 transition-all">
                <LogOut size={18} />
              </button>
            </>
          ) : (
            <Link href="/auth/login">
              <button className="bg-primary text-black px-10 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:scale-105 transition-all shadow-xl shadow-primary/20">
                دخول سيادي
              </button>
            </Link>
          )}
        </div>
      </nav>

      {/* Main Hub Title */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-20 space-y-6">
        <div className="sovereign-badge mx-auto">
           <Zap className="h-3 w-3" /> Galactic Legal Hub Active
        </div>
        <h1 className="text-6xl md:text-8xl font-black text-white tracking-tighter leading-none">
          كوكب العدالة <br /><span className="text-gradient">الرقمية</span>
        </h1>
        <p className="text-zinc-500 font-bold text-xl uppercase tracking-widest">اختر بوابة السيطرة للبدء</p>
      </motion.div>

      {/* The 3 Sovereign Portals */}
      <div className="w-full max-w-6xl grid grid-cols-1 md:grid-cols-3 gap-10">
        <HubPortal 
          href="/bot" 
          title="المستشار الذكي" 
          icon={<Bot size={40} />} 
          color="primary" 
          desc="تحليل واستشارات AI فورية"
          badge="AI Core"
        />
        <HubPortal 
          href="/consultants" 
          title="مجلس الخبراء" 
          icon={<Users size={40} />} 
          color="blue" 
          desc="اتصال مباشر 1-على-1 مع خبير"
          badge="Live Chat"
        />
        <HubPortal 
          href="/templates" 
          title="خزنة الوثائق" 
          icon={<FileText size={40} />} 
          color="emerald" 
          desc="عقود ونماذج قانونية موثقة"
          badge="Vault"
        />
      </div>

      <footer className="fixed bottom-10 text-[9px] font-black text-zinc-800 uppercase tracking-[0.6em] animate-pulse">
        Sovereign Protocol v5.0 • king2026 Foundation
      </footer>
    </div>
  );
}

function HubPortal({ href, title, icon, color, desc, badge }: any) {
  const colors: any = {
    primary: "text-primary border-primary/10 hover:border-primary/30 bg-primary/5 shadow-primary/5",
    blue: "text-blue-500 border-blue-500/10 hover:border-blue-500/30 bg-blue-500/5 shadow-blue-500/5",
    emerald: "text-emerald-500 border-emerald-500/10 hover:border-emerald-500/30 bg-emerald-500/5 shadow-emerald-500/5",
  };

  const iconBgs: any = {
    primary: "bg-primary/10",
    blue: "bg-blue-500/10",
    emerald: "bg-emerald-500/10",
  };

  return (
    <Link href={href} className="group">
      <motion.div 
        whileHover={{ y: -15, scale: 1.02 }}
        className={`h-full border rounded-[4rem] p-12 flex flex-col items-center text-center space-y-8 transition-all duration-700 hover:shadow-3xl ${colors[color]}`}
      >
        <div className="flex justify-between items-center w-full">
           <span className="text-[8px] font-black uppercase tracking-widest opacity-40">{badge}</span>
           <Activity size={12} className="opacity-20 group-hover:opacity-100 transition-opacity" />
        </div>
        <div className={`w-24 h-24 ${iconBgs[color]} rounded-[2.5rem] flex items-center justify-center shadow-inner border border-white/5 transition-all duration-700 group-hover:rotate-12 group-hover:bg-white/5`}>
          {icon}
        </div>
        <div className="space-y-3">
          <h2 className="text-3xl font-black text-white tracking-tight">{title}</h2>
          <p className="text-zinc-500 font-bold text-sm leading-relaxed">{desc}</p>
        </div>
        <div className="pt-4 opacity-0 group-hover:opacity-100 transition-all duration-500 translate-y-4 group-hover:translate-y-0">
           <div className={`px-6 py-2 rounded-full border border-current text-[10px] font-black uppercase tracking-widest`}>
              Open Portal
           </div>
        </div>
      </motion.div>
    </Link>
  );
}
