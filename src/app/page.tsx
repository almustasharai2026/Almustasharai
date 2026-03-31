
"use client";

import React, { useState, useEffect } from 'react';
import { 
  Scale, FileText, Users, CreditCard, 
  Bot, Zap, ShieldCheck, ArrowLeft, LayoutDashboard,
  Globe, Lock, Sparkles, LogOut, ChevronLeft, ArrowRight,
  Sun, Moon
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { useUser } from '@/firebase';
import { roles as ROLES_LIST } from '@/lib/roles';
import { useTheme } from 'next-themes';
import SovereignButton from '@/components/SovereignButton';
import SovereignGuidanceNode from '@/components/SovereignGuidanceNode';
import Image from 'next/image';

// --- مكون الخلفية الحية السيادية (Supreme Mesh Gradient) ---
const LiveBackground = () => (
  <div className="fixed inset-0 -z-10 overflow-hidden bg-[#020205]">
    <motion.div 
      animate={{ 
        scale: [1, 1.2, 1],
        opacity: [0.1, 0.2, 0.1],
        x: [0, 50, 0],
        y: [0, 30, 0]
      }}
      transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
      className="absolute top-[-10%] left-[-10%] w-[60%] h-[60%] rounded-full bg-emerald-900/30 blur-[120px]" 
    />
    <motion.div 
      animate={{ 
        scale: [1, 1.3, 1],
        opacity: [0.05, 0.15, 0.05],
        x: [0, -40, 0],
        y: [0, -60, 0]
      }}
      transition={{ duration: 20, repeat: Infinity, ease: "easeInOut", delay: 2 }}
      className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-amber-900/20 blur-[120px]" 
    />
    <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.03] mix-blend-overlay" />
  </div>
);

// --- كارت الخدمات النخبة (Elite Glass Card) ---
const GlassCard = ({ icon: Icon, title, desc, accent, delay, href }: any) => (
  <Link href={href}>
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: delay / 1000, duration: 0.8 }}
      whileHover={{ y: -10, scale: 1.02 }}
      className="group relative p-10 bg-white/[0.02] border border-white/5 rounded-[3.5rem] backdrop-blur-3xl hover:bg-white/[0.05] hover:border-primary/30 transition-all duration-700 cursor-pointer shadow-3xl overflow-hidden"
    >
      <div className={`absolute -top-px -left-px w-24 h-px bg-gradient-to-r from-transparent via-primary to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700`} />
      <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mb-8 bg-white/5 text-primary border border-white/5 shadow-inner transition-all duration-700 group-hover:rotate-12 group-hover:bg-primary group-hover:text-black`}>
        <Icon size={32} strokeWidth={1.5} />
      </div>
      <h3 className="text-2xl font-black text-white mb-4 tracking-tighter">{title}</h3>
      <p className="text-white/30 text-sm font-bold leading-relaxed group-hover:text-white/60 transition-colors">{desc}</p>
      <div className="mt-10 flex items-center gap-2 text-[10px] font-black text-white/20 group-hover:text-primary transition-all uppercase tracking-widest">
        اكتشف البروتوكول <ArrowRight size={14} className="rotate-180 group-hover:-translate-x-2 transition-transform" />
      </div>
    </motion.div>
  </Link>
);

export default function AlmustasharaiElite() {
  const { user, profile, role, signOut } = useUser();
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  if (!mounted) return null;

  return (
    <div className="min-h-screen text-white font-sans selection:bg-primary/30 overflow-x-hidden relative" dir="rtl">
      <LiveBackground />
      
      {/* Navigation - Elite Minimalist */}
      <nav className="fixed top-0 w-full z-[100] px-10 py-6 flex justify-between items-center backdrop-blur-xl bg-black/10 border-b border-white/5">
        <div className="flex items-center gap-4 group cursor-pointer" onClick={() => window.location.href = '/'}>
          <div className="w-12 h-12 bg-white text-black rounded-2xl flex items-center justify-center group-hover:rotate-[360deg] transition-transform duration-1000 shadow-2xl">
            <Scale size={24} />
          </div>
          <div className="flex flex-col">
            <span className="font-black text-2xl tracking-tighter leading-none">المستشار AI</span>
            <span className="text-[8px] text-primary font-black tracking-[0.4em] uppercase opacity-80">Sovereign Excellence</span>
          </div>
        </div>

        <div className="hidden lg:flex items-center gap-10 text-[10px] font-black uppercase tracking-widest text-white/40">
          <Link href="/bot" className="hover:text-primary transition-colors">البوت الذكي</Link>
          <Link href="/consultants" className="hover:text-primary transition-colors">مجلس الخبراء</Link>
          <Link href="/templates" className="hover:text-primary transition-colors">المكتبة</Link>
          {user && (
            <Link href={role === ROLES_LIST.ADMIN ? "/admin" : "/dashboard"} className="text-primary flex items-center gap-2">
              <LayoutDashboard size={14} />
              لوحة التحكم
            </Link>
          )}
        </div>

        <div className="flex items-center gap-6">
          <button 
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            className="p-3 bg-white/5 rounded-2xl border border-white/5 text-primary hover:bg-white/10 transition-all"
          >
            {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
          </button>

          {user ? (
            <button onClick={() => signOut()} className="p-3 bg-red-500/10 text-red-500 rounded-2xl border border-red-500/10 hover:bg-red-500/20 transition-all">
              <LogOut size={18} />
            </button>
          ) : (
            <Link href="/auth/login">
              <button className="bg-white text-black px-8 py-3 rounded-2xl text-xs font-black hover:scale-105 transition-all active:scale-95 shadow-3xl">
                ابدأ الرحلة السيادية
              </button>
            </Link>
          )}
        </div>
      </nav>

      <main className="relative pt-48 pb-32 px-10 max-w-[1400px] mx-auto z-10">
        
        {/* Hero Section */}
        <div className="grid lg:grid-cols-2 gap-24 items-center mb-40">
          <motion.div 
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 1 }}
            className="space-y-10"
          >
            <div className="flex items-center gap-3 bg-white/5 border border-white/10 w-fit px-6 py-2 rounded-full backdrop-blur-md">
              <Sparkles size={16} className="text-primary animate-pulse" />
              <span className="text-[10px] font-black uppercase tracking-[0.3em] text-primary">Sovereign Protocol v4.5</span>
            </div>
            
            <h1 className="text-7xl md:text-[10rem] font-black tracking-tighter text-white leading-[0.85] select-none">
              العدالة <br />
              <span className="text-gradient italic">بمنظور</span> <br />
              مطلق
            </h1>
            
            <p className="text-2xl text-white/30 font-bold leading-relaxed max-w-xl">
              نحن لا نقدم مجرد استشارات؛ نحن نصيغ مستقبل الحماية القانونية بذكاء سيادي يتجاوز الحدود.
            </p>

            <div className="flex gap-6 pt-4">
              <Link href="/bot" className="flex-1">
                <SovereignButton text="تفعيل البوت" className="h-20" icon={<Zap />} />
              </Link>
              <Link href="/consultants" className="flex-1">
                <button className="w-full h-20 glass-cosmic border-white/5 rounded-[2.5rem] text-white/40 font-black text-sm uppercase tracking-widest hover:text-white hover:border-white/20 transition-all">
                  مجلس الخبراء
                </button>
              </Link>
            </div>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, scale: 0.8, rotate: -5 }}
            animate={{ opacity: 1, scale: 1, rotate: 0 }}
            transition={{ duration: 1.5, type: "spring" }}
            className="hidden lg:block relative aspect-square"
          >
            <div className="absolute inset-0 bg-primary/10 blur-[150px] rounded-full animate-pulse" />
            <div className="relative h-full w-full glass-cosmic rounded-[5rem] border-white/5 overflow-hidden shadow-3xl p-1">
               <Image 
                src="https://images.unsplash.com/photo-1589829545856-d10d557cf95f?q=80&w=2070&auto=format&fit=crop"
                alt="Justice Planet"
                fill
                className="object-cover opacity-60 grayscale group-hover:grayscale-0 transition-all duration-1000"
               />
               <div className="absolute inset-0 bg-gradient-to-t from-[#020205] via-transparent to-transparent" />
               <div className="absolute bottom-16 inset-x-16 space-y-4">
                  <div className="h-1 w-20 bg-primary rounded-full" />
                  <p className="text-4xl font-black text-white tracking-tighter">بروتوكول الحماية ٤.٥</p>
                  <p className="text-white/40 font-bold">تم توثيق أكثر من ١.٢ مليون معاملة سيادية</p>
               </div>
            </div>
          </motion.div>
        </div>

        {/* Pillars Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 mb-40">
          <GlassCard 
            icon={Bot} 
            title="المستشار الذكي" 
            desc="محرك تحليل قانوني فوري مدعوم ببروتوكولات Gemini 2.5 الصارمة." 
            accent="amber" 
            delay={100}
            href="/bot"
          />
          <GlassCard 
            icon={FileText} 
            title="المكتبة الرقمية" 
            desc="إصدار فوري للعقود والوثائق الموثقة برمجياً بختم السيادة." 
            accent="blue" 
            delay={200}
            href="/templates"
          />
          <GlassCard 
            icon={Users} 
            title="مجلس الخبراء" 
            desc="غرف اتصال مشفرة مع نخبة المستشارين المعتمدين من king2026." 
            accent="emerald" 
            delay={300}
            href="/consultants"
          />
          <GlassCard 
            icon={CreditCard} 
            title="خزنة الرصيد" 
            desc="إدارة الأصول المالية والوحدات السيادية بأمان بنكي مطلق." 
            accent="purple" 
            delay={400}
            href="/pricing"
          />
        </div>

        {/* The Central Guidance Node - تم دمج المكون الذكي الجديد هنا */}
        <motion.div 
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="relative group"
        >
          <div className="absolute inset-0 bg-primary/5 blur-[100px] rounded-full group-hover:bg-primary/10 transition-all duration-1000" />
          <div className="relative glass-cosmic border-white/5 rounded-[5rem] p-16 md:p-32 flex flex-col items-center text-center space-y-16 overflow-hidden">
            <div className="absolute top-0 right-0 w-96 h-96 bg-primary/5 blur-[80px] -z-10" />
            
            <div className="w-32 h-32 bg-primary rounded-full flex items-center justify-center shadow-3xl border-4 border-white/10 float-sovereign relative z-10">
              <Zap size={56} fill="#020617" className="text-[#020617]" />
            </div>

            <div className="max-w-4xl space-y-8 relative z-10">
              <h2 className="text-5xl md:text-7xl font-black text-white tracking-tighter">أنا بوصلتك القانونية السيادية.. كيف أوجهك؟</h2>
              <p className="text-2xl text-white/30 font-bold leading-relaxed max-w-2xl mx-auto">
                أخبرني بموقفك القانوني، وسيقوم المحرك السيادي بتوجيهك فوراً للخدمة الأنسب لكوكب العدالة.
              </p>
            </div>

            {/* تم استبدال حقل الإدخال العادي بالمكون الذكي الجديد */}
            <div className="w-full z-10">
              <SovereignGuidanceNode />
            </div>
          </div>
        </motion.div>

      </main>

      <footer className="border-t border-white/5 py-24 px-10 relative bg-black/40 backdrop-blur-3xl overflow-hidden">
        <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-primary to-transparent opacity-20" />
        <div className="max-w-7xl mx-auto flex flex-col items-center gap-12 text-center">
          <div className="flex items-center gap-4 opacity-30 grayscale cursor-pointer" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
            <div className="w-8 h-8 bg-white rounded-xl flex items-center justify-center shadow-2xl"><Scale size={18} className="text-black" /></div>
            <span className="font-black text-xl tracking-tighter text-white">المستشار AI</span>
          </div>
          <p className="text-white/10 text-[10px] font-black uppercase tracking-[1.2em] leading-relaxed max-w-4xl">
            GLOBAL LEGAL SOVEREIGN PROTOCOL • king2026 SUPREME AUTHORITY • SECURED BY COSMIC LOGIC
          </p>
          <div className="flex gap-10 text-[10px] font-black uppercase tracking-widest text-white/20">
             <a href="#" className="hover:text-primary transition-colors">Privacy Codex</a>
             <a href="#" className="hover:text-primary transition-colors">Terms of Sovereignty</a>
             <a href="#" className="hover:text-primary transition-colors">System Compliance</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
