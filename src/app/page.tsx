
"use client";

import React, { useState, useEffect } from 'react';
import { 
  Scale, FileText, Users, CreditCard, 
  Bot, Zap, ShieldCheck, ArrowRight, LayoutDashboard,
  Sparkles, Sun, Moon, UserPlus, LogIn, Crown
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { useUser } from '@/firebase';
import { roles as ROLES_LIST } from '@/lib/roles';
import { useTheme } from 'next-themes';
import SovereignButton from '@/components/SovereignButton';

// --- المكونات الفرعية الذكية ---

const FeatureCard = ({ icon: Icon, title, desc, color, href }: any) => (
  <Link href={href} className="group">
    <motion.div 
      whileHover={{ y: -10, scale: 1.02 }}
      className="h-full relative p-10 bg-[#09090b]/60 backdrop-blur-3xl border border-white/5 rounded-[3.5rem] hover:border-primary/40 transition-all duration-500 cursor-pointer overflow-hidden shadow-3xl"
    >
      <div className={`absolute top-0 right-0 w-32 h-32 bg-${color}-500/5 blur-[60px] group-hover:bg-${color}-500/10 transition-all`} />
      <div className={`w-16 h-16 rounded-[1.5rem] flex items-center justify-center mb-8 bg-white/5 text-primary border border-white/5 shadow-inner group-hover:rotate-12 transition-transform duration-500`}>
        <Icon size={32} />
      </div>
      <h3 className="text-2xl font-black text-white mb-4 tracking-tighter">{title}</h3>
      <p className="text-white/30 text-sm font-bold leading-relaxed">{desc}</p>
      
      <div className="mt-8 flex items-center gap-2 text-primary font-black text-[10px] uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-opacity">
        Open Portal <ChevronLeft className="h-3 w-3" />
      </div>
    </motion.div>
  </Link>
);

function ChevronLeft(props: any) {
  return (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>
  )
}

export default function AlmustasharaiMain() {
  const { user, profile, role, signOut } = useUser();
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [guidanceInput, setGuidanceInput] = useState("");

  useEffect(() => setMounted(true), []);

  if (!mounted) return null;

  return (
    <div className="min-h-screen bg-[#02020a] text-white font-sans selection:bg-primary/30 relative overflow-hidden" dir="rtl">
      
      {/* Cinematic Background Ambiance */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-[-10%] right-[-5%] w-[800px] h-[800px] bg-primary/5 blur-[180px] rounded-full" />
        <div className="absolute bottom-[0%] left-[-10%] w-[600px] h-[600px] bg-indigo-600/5 blur-[150px] rounded-full" />
      </div>

      {/* Navigation - Sovereign Apple Style */}
      <nav className="fixed top-0 w-full z-[100] backdrop-blur-3xl bg-black/20 border-b border-white/5 px-10 py-5 flex justify-between items-center">
        <div className="flex items-center gap-4 group cursor-pointer">
          <div className="w-10 h-10 bg-primary rounded-2xl flex items-center justify-center shadow-3xl border border-white/10 group-hover:scale-110 transition-all duration-500">
            <Scale size={22} className="text-[#020617]" />
          </div>
          <div className="flex flex-col">
            <span className="font-black text-2xl tracking-tighter leading-none">المستشار AI</span>
            <span className="text-[8px] font-black text-primary uppercase tracking-[0.3em] mt-1">Sovereign Node v4.5</span>
          </div>
        </div>

        <div className="flex items-center gap-6">
          <button 
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            className="p-3 bg-white/5 rounded-2xl border border-white/5 text-primary hover:bg-white/10 transition-all"
          >
            {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
          </button>

          {user ? (
            <div className="flex items-center gap-4">
              <Link href={role === ROLES_LIST.ADMIN ? "/admin" : "/dashboard"}>
                <button className="bg-primary/10 border border-primary/20 text-primary px-6 py-2.5 rounded-2xl text-xs font-black flex items-center gap-3 hover:bg-primary/20 transition-all">
                  {role === ROLES_LIST.ADMIN ? <Crown size={16} /> : <LayoutDashboard size={16} />}
                  {profile?.fullName?.split(' ')[0] || "القيادة"}
                </button>
              </Link>
              <button onClick={() => signOut()} className="text-white/20 hover:text-red-500 transition-colors">
                <LogOut size={20} />
              </button>
            </div>
          ) : (
            <div className="flex gap-4">
              <Link href="/auth/login">
                <button className="text-white/40 hover:text-white text-xs font-black uppercase tracking-widest px-6 py-3 transition-all">دخول سيادي</button>
              </Link>
              <Link href="/auth/signup">
                <button className="bg-primary text-[#020617] px-8 py-3 rounded-2xl text-xs font-black shadow-3xl hover:scale-105 transition-all">إصدار هوية</button>
              </Link>
            </div>
          )}
        </div>
      </nav>

      <main className="pt-40 pb-32 px-10 max-w-7xl mx-auto relative z-10">
        
        {/* Sovereign Header Section */}
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1 }}
          className="text-center mb-32 space-y-10"
        >
          <div className="sovereign-badge mx-auto animate-pulse">
             <Sparkles className="h-3 w-3" /> مستقبلك القانوني يبدأ هنا
          </div>
          <h1 className="text-7xl md:text-9xl font-black tracking-tighter text-white leading-[0.9]">
            العدالة <span className="text-white/10 italic">بذكاء</span> <br /> 
            <span className="text-gradient">اصطناعي مطلق</span>
          </h1>
          <p className="text-xl md:text-2xl text-white/30 font-bold max-w-3xl mx-auto leading-relaxed">
            المنصة القانونية الأكثر تطوراً في المنطقة العربية. ندمج هيبة المحاماة بذكاء المستقبل لنمنحك سيادة كاملة على معاملاتك.
          </p>
        </motion.div>

        {/* 4 Core Pillars Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-32">
          <FeatureCard 
            icon={Bot} 
            title="المستشار الذكي" 
            desc="دردشة قانونية فورية مدعومة بـ Gemini 2.5 Flash لتحليل أدق الحالات." 
            color="amber" 
            href="/bot"
          />
          <FeatureCard 
            icon={FileText} 
            title="المكتبة الرقمية" 
            desc="إصدار فوري لأكثر من ٢٥٠ عقد ونموذج قانوني معتمد وموثق برمجياً." 
            color="blue" 
            href="/templates"
          />
          <FeatureCard 
            icon={Users} 
            title="مجلس الخبراء" 
            desc="تواصل مرئي مباشر ومشفر مع نخبة المستشارين المعتمدين." 
            color="emerald" 
            href="/consultants"
          />
          <FeatureCard 
            icon={CreditCard} 
            title="خزنة الرصيد" 
            desc="إدارة محفظتك المالية وعمليات الشحن بكل أمان وخصوصية سيادية." 
            color="purple" 
            href="/pricing"
          />
        </div>

        {/* Central Guidance Bot - الملحمة الوسطى */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          className="relative p-1 bg-gradient-to-br from-primary/30 via-indigo-500/10 to-transparent rounded-[4.5rem] shadow-3xl"
        >
          <div className="bg-[#05050a]/90 backdrop-blur-3xl rounded-[4.4rem] p-16 md:p-24 flex flex-col items-center text-center space-y-12 border border-white/5 shadow-inner">
            <div className="relative group">
              <div className="absolute inset-0 bg-primary/20 blur-[40px] rounded-full group-hover:bg-primary/40 transition-all duration-700" />
              <div className="w-32 h-32 bg-primary rounded-full flex items-center justify-center relative z-10 shadow-3xl border-4 border-white/10 float-sovereign">
                <Zap size={56} fill="#020617" className="text-[#020617]" />
              </div>
            </div>
            
            <div className="max-w-3xl space-y-6">
              <h2 className="text-4xl md:text-6xl font-black text-white tracking-tighter">أنا بوصلتك القانونية.. كيف أوجهك الآن؟</h2>
              <p className="text-xl text-white/30 font-bold leading-relaxed px-4">
                أخبرني فقط بموقفك وسأقوم تلقائياً بتحديد ما إذا كنت تحتاج لاستشارة AI فورية، أم نموذج عقد جاهز، أم حجز موعد سيادي مع خبير متخصص.
              </p>
            </div>

            <div className="w-full max-w-2xl relative group">
              <div className="absolute inset-0 bg-primary/5 blur-2xl rounded-[2.5rem] opacity-0 group-focus-within:opacity-100 transition-opacity" />
              <input 
                value={guidanceInput}
                onChange={(e) => setGuidanceInput(e.target.value)}
                placeholder="اكتب استفسارك هنا برصانة.. (مثال: أريد توثيق عقد بيع عقار)"
                className="w-full bg-white/[0.03] border-2 border-white/5 rounded-[2.5rem] py-8 px-12 text-2xl font-bold text-white placeholder:text-white/10 focus:border-primary/40 outline-none transition-all pr-20 shadow-3xl relative z-10"
              />
              <button 
                onClick={() => window.location.href = `/bot?q=${encodeURIComponent(guidanceInput)}`}
                className="absolute left-4 top-1/2 -translate-y-1/2 bg-primary text-[#020617] p-5 rounded-[1.8rem] hover:scale-110 active:scale-95 transition-all shadow-2xl z-20 group/btn"
              >
                <ArrowRight size={28} className="rotate-180 group-hover:-translate-x-1 transition-transform" />
              </button>
            </div>

            <div className="flex flex-wrap justify-center gap-3 opacity-40">
               {["نزاع إيجاري", "تأسيس شركة", "استشارة أسرية", "مراجعة عقد"].map((tag) => (
                 <button 
                  key={tag} 
                  onClick={() => setGuidanceInput(tag)}
                  className="px-6 py-2 rounded-xl bg-white/5 border border-white/5 text-[10px] font-black uppercase tracking-widest hover:text-primary hover:bg-white/10 transition-all"
                 >
                   {tag}
                 </button>
               ))}
            </div>
          </div>
        </motion.div>
      </main>

      {/* Footer - Sovereign & Final */}
      <footer className="border-t border-white/5 py-20 px-10 flex flex-col items-center gap-8 relative bg-black/40">
        <div className="flex items-center gap-3 opacity-20 grayscale">
          <div className="w-6 h-6 bg-white rounded-lg flex items-center justify-center"><Scale size={14} className="text-black" /></div>
          <span className="font-black text-sm tracking-tighter">المستشار AI</span>
        </div>
        <p className="text-white/10 text-[10px] font-black uppercase tracking-[1em] text-center">
          Almustasharai AI &copy; 2026 • GLOBAL SOVEREIGN PROTOCOL • king2026 AUTHORITY
        </p>
      </footer>
    </div>
  );
}

function LogOut(props: any) {
  return (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" x2="9" y1="12" y2="12"/></svg>
  )
}
