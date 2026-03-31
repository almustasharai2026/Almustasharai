
"use client";

import React, { useState, useEffect } from 'react';
import { Bot, Users, FileText, Scale, Settings, LogOut, LayoutDashboard } from 'lucide-react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { useUser } from '@/firebase';
import { roles as ROLES_LIST } from '@/lib/roles';

export default function Home() {
  const { user, profile, role, signOut } = useUser();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  if (!mounted) return null;

  return (
    <div className="min-h-screen bg-[#050505] text-white font-sans flex flex-col items-center justify-center p-6 lg:p-12 text-right" dir="rtl">
      {/* Background Ambience */}
      <div className="fixed inset-0 -z-10 overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-primary/10 via-transparent to-transparent opacity-50" />
      </div>

      {/* Top Bar */}
      <nav className="fixed top-0 w-full z-50 px-10 py-6 flex justify-between items-center bg-black/20 backdrop-blur-xl border-b border-white/5">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center text-black">
            <Scale size={20} />
          </div>
          <span className="font-black text-xl tracking-tighter">المستشار AI</span>
        </div>
        
        <div className="flex items-center gap-4">
          {user ? (
            <>
              <Link href={role === ROLES_LIST.ADMIN ? "/admin" : "/dashboard"}>
                <button className="p-3 bg-white/5 rounded-2xl border border-white/5 text-primary hover:bg-white/10">
                  <LayoutDashboard size={18} />
                </button>
              </Link>
              <button onClick={() => signOut()} className="p-3 bg-red-500/10 text-red-500 rounded-2xl border border-red-500/10 hover:bg-red-500/20">
                <LogOut size={18} />
              </button>
            </>
          ) : (
            <Link href="/auth/login">
              <button className="bg-primary text-black px-8 py-3 rounded-2xl text-xs font-black hover:scale-105">
                دخول
              </button>
            </Link>
          )}
        </div>
      </nav>

      {/* Hero Header */}
      <div className="text-center mb-16 space-y-4">
        <h1 className="text-5xl md:text-7xl font-black text-white tracking-tighter">كوكب العدالة <span className="text-primary">الرقمية</span></h1>
        <p className="text-zinc-500 font-bold text-lg">اختر مسارك القانوني للبدء</p>
      </div>

      {/* 3 Main Action Hubs */}
      <div className="w-full max-w-5xl grid grid-cols-1 md:grid-cols-3 gap-8">
        <HubButton 
          href="/bot" 
          title="المستشار الذكي" 
          icon={<Bot size={48} />} 
          color="bg-primary" 
          desc="تحليل واستشارة فورية"
        />
        <HubButton 
          href="/consultants" 
          title="مجلس الخبراء" 
          icon={<Users size={48} />} 
          color="bg-blue-600" 
          desc="تواصل مباشر 1-على-1"
        />
        <HubButton 
          href="/templates" 
          title="خزنة الوثائق" 
          icon={<FileText size={48} />} 
          color="bg-emerald-600" 
          desc="عقود ونماذج موثقة"
        />
      </div>

      <footer className="fixed bottom-8 text-[10px] font-black text-zinc-700 uppercase tracking-[0.5em]">
        Sovereign Protocol v5.0 • king2026
      </footer>
    </div>
  );
}

function HubButton({ href, title, icon, color, desc }: any) {
  return (
    <Link href={href} className="group">
      <motion.div 
        whileHover={{ y: -10, scale: 1.02 }}
        className="h-full bg-[#1a1a1a] border border-white/5 rounded-[3.5rem] p-10 flex flex-col items-center text-center space-y-6 shadow-2xl transition-all hover:border-primary/20"
      >
        <div className={`w-24 h-24 ${color} rounded-[2.2rem] flex items-center justify-center text-black shadow-3xl`}>
          {icon}
        </div>
        <div className="space-y-2">
          <h2 className="text-3xl font-black text-white tracking-tight">{title}</h2>
          <p className="text-zinc-500 font-bold text-sm">{desc}</p>
        </div>
      </motion.div>
    </Link>
  );
}
