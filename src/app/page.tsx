"use client";

import { motion } from 'framer-motion';
import { Scale, Sparkles, ShieldCheck, Gavel, Video, FileText, Crown, Wallet, ArrowRight, UserPlus } from 'lucide-react';
import Link from 'next/link';
import { useUser } from '@/firebase';
import SovereignButton from '@/components/SovereignButton';
import Image from 'next/image';

/**
 * الواجهة المركزية لكوكب المستشار AI - إصدار king2026 الملكي.
 * تتميز بخلفية سينمائية فاخرة ومحتوى غني يستعرض كافة مفاصل النظام.
 */
export default function SovereignLanding() {
  const { user, profile } = useUser();

  return (
    <div className="min-h-screen flex flex-col items-center relative overflow-hidden bg-sovereign-cinematic">
      
      {/* Absolute Ambient Ambiance */}
      <div className="absolute top-0 left-0 w-full h-full pointer-events-none">
        <div className="absolute top-[10%] right-[15%] w-[500px] h-[500px] bg-primary/10 blur-[150px] rounded-full" />
        <div className="absolute bottom-[5%] left-[10%] w-[400px] h-[400px] bg-accent/5 blur-[120px] rounded-full" />
      </div>

      {/* Main Content Container */}
      <div className="container mx-auto px-6 pt-32 pb-40 z-10 flex flex-col items-center">
        
        {/* Hero Section */}
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, ease: "easeOut" }}
          className="text-center space-y-10 max-w-4xl"
        >
          <div className="flex justify-center">
            <div className="h-32 w-32 rounded-[3rem] bg-gradient-to-br from-primary via-indigo-600 to-amber-600 flex items-center justify-center shadow-3xl border border-white/20 float-sovereign p-0.5">
              <div className="h-full w-full bg-[#020617] rounded-[2.9rem] flex items-center justify-center">
                <Scale className="h-16 w-12 text-primary" />
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div className="sovereign-badge mx-auto animate-pulse">
               <ShieldCheck className="h-3 w-3" /> Global Sovereign Authority
            </div>
            <h1 className="text-6xl md:text-8xl font-black tracking-tighter text-white leading-tight">
              كوكب <span className="text-gradient">المستشار AI</span>
            </h1>
            <p className="text-xl md:text-2xl text-white/40 font-bold max-w-2xl mx-auto leading-relaxed">
              إمبراطورية العدالة الرقمية الأولى. ندمج هيبة المحاماة بذكاء المستقبل لنمنحك استشارات قانونية سيادية فورية.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-6 pt-8">
            {!user ? (
              <>
                <Link href="/auth/signup" className="w-full sm:w-72">
                  <SovereignButton text="إصدار هوية (٥٠ EGP مجاناً)" icon={<UserPlus className="h-6 w-6" />} className="h-20 rounded-3xl" />
                </Link>
                <Link href="/auth/login" className="w-full sm:w-72">
                  <button className="w-full h-20 glass-cosmic rounded-3xl text-xl font-black text-white hover:bg-white/5 transition-all flex items-center justify-center gap-4">
                    دخول سيادي <ArrowRight className="h-6 w-6 rtl:rotate-180" />
                  </button>
                </Link>
              </>
            ) : (
              <Link href="/bot" className="w-full sm:w-80">
                <SovereignButton text="دخول مركز القيادة العليا" icon={<Crown className="h-7 w-7 text-white" />} className="h-24 rounded-[2.5rem]" />
              </Link>
            )}
          </div>
        </motion.div>

        {/* Sovereign Pillars - Feature Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 w-full mt-32 max-w-7xl">
          <Link href="/bot" className="group">
            <div className="p-10 glass-cosmic rounded-[3.5rem] h-full flex flex-col items-center gap-6 border-white/5 hover:border-primary/40 transition-all duration-500 hover:scale-[1.05] shadow-3xl">
              <div className="h-20 w-20 rounded-[2rem] bg-primary/10 flex items-center justify-center shadow-inner group-hover:rotate-12 transition-transform duration-500">
                <Sparkles className="h-10 w-10 text-primary" />
              </div>
              <div className="text-center">
                <h3 className="text-2xl font-black text-white mb-2">البوت الذكي</h3>
                <p className="text-sm text-white/30 font-bold leading-relaxed">استشارات AI فورية مدعومة بمحركات التفكير القانوني المعمق.</p>
              </div>
            </div>
          </Link>

          <Link href="/consultants" className="group">
            <div className="p-10 glass-cosmic rounded-[3.5rem] h-full flex flex-col items-center gap-6 border-white/5 hover:border-accent/40 transition-all duration-500 hover:scale-[1.05] shadow-3xl">
              <div className="h-20 w-20 rounded-[2rem] bg-accent/10 flex items-center justify-center shadow-inner group-hover:rotate-12 transition-transform duration-500">
                <Gavel className="h-10 w-10 text-accent" />
              </div>
              <div className="text-center">
                <h3 className="text-2xl font-black text-white mb-2">مجلس الخبراء</h3>
                <p className="text-sm text-white/30 font-bold leading-relaxed">تواصل مباشر ومشفر مع نخبة المستشارين والمحامين المعتمدين.</p>
              </div>
            </div>
          </Link>

          <Link href="/consultants" className="group">
            <div className="p-10 glass-cosmic rounded-[3.5rem] h-full flex flex-col items-center gap-6 border-white/5 hover:border-indigo-500/40 transition-all duration-500 hover:scale-[1.05] shadow-3xl">
              <div className="h-20 w-20 rounded-[2rem] bg-indigo-500/10 flex items-center justify-center shadow-inner group-hover:rotate-12 transition-transform duration-500">
                <Video className="h-10 w-10 text-indigo-400" />
              </div>
              <div className="text-center">
                <h3 className="text-2xl font-black text-white mb-2">جلسات الفيديو</h3>
                <p className="text-sm text-white/30 font-bold leading-relaxed">غرف استشارية حية ومؤمنة بأعلى بروتوكولات الحماية والرقابة.</p>
              </div>
            </div>
          </Link>

          <Link href="/templates" className="group">
            <div className="p-10 glass-cosmic rounded-[3.5rem] h-full flex flex-col items-center gap-6 border-white/5 hover:border-emerald-500/40 transition-all duration-500 hover:scale-[1.05] shadow-3xl">
              <div className="h-20 w-20 rounded-[2rem] bg-emerald-500/10 flex items-center justify-center shadow-inner group-hover:rotate-12 transition-transform duration-500">
                <FileText className="h-10 w-10 text-emerald-400" />
              </div>
              <div className="text-center">
                <h3 className="text-2xl font-black text-white mb-2">المكتبة الرقمية</h3>
                <p className="text-sm text-white/30 font-bold leading-relaxed">إصدار فوري ومؤتمت لأكثر من ٢٥٠ عقد ونموذج قانوني معتمد.</p>
              </div>
            </div>
          </Link>
        </div>

        {/* Sovereign Financial Banner */}
        <motion.div 
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          className="mt-40 w-full max-w-5xl glass-cosmic rounded-[4rem] p-12 border-primary/20 bg-primary/5 flex flex-col md:flex-row items-center justify-between gap-10 shadow-3xl overflow-hidden relative"
        >
          <div className="absolute top-0 right-0 p-12 opacity-5 pointer-events-none">
            <Wallet className="h-64 w-64 text-white" />
          </div>
          <div className="space-y-4 text-right">
            <h4 className="text-4xl font-black text-white tracking-tighter">المحفظة السيادية الذكية</h4>
            <p className="text-lg text-white/40 font-bold leading-relaxed max-w-xl">
              نظام مالي متكامل يدعم الشحن الفوري عبر Vodafone Cash. ابدأ الآن برصيد ترحيبي مجاني واستمتع بخدمات العدالة الرقمية.
            </p>
          </div>
          <Link href="/pricing">
            <button className="h-20 px-12 bg-white text-slate-950 font-black rounded-3xl shadow-2xl hover:scale-105 active:scale-95 transition-all text-xl">استكشف الباقات</button>
          </Link>
        </motion.div>

      </div>

      {/* Sovereign Footer Branding */}
      <footer className="w-full py-16 border-t border-white/5 bg-black/40 backdrop-blur-3xl text-center relative z-10">
        <div className="container mx-auto px-6 flex flex-col items-center gap-6">
          <div className="flex items-center gap-4">
            <div className="h-10 w-10 rounded-xl bg-primary/20 flex items-center justify-center border border-primary/20">
              <Scale className="h-5 w-5 text-primary" />
            </div>
            <span className="text-2xl font-black text-white tracking-tighter uppercase">ALMUSTASHARAI <span className="text-primary">AI</span></span>
          </div>
          <p className="text-[10px] font-black text-white/10 uppercase tracking-[0.6em]">Sovereign Governance Protocol king2026 | Global Node v4.5</p>
        </div>
      </footer>
    </div>
  );
}