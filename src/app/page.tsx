'use client';

import React from 'react';
import { Scale, Zap, ArrowRight, Loader2, ShieldCheck } from 'lucide-react';
import { motion } from 'framer-motion';
import { useUser } from '@/firebase';
import Link from 'next/link';

export default function WelcomePage() {
  const { user, profile, isUserLoading, signInWithGoogle } = useUser();

  return (
    <div className="min-h-screen bg-[#020202] text-white flex flex-col items-center justify-center p-6 text-center overflow-hidden font-sans" dir="rtl">
      
      {/* Sovereign Aura */}
      <div className="fixed inset-0 -z-10">
        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-primary/5 via-transparent to-transparent opacity-40" />
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }} 
        animate={{ opacity: 1, y: 0 }} 
        className="max-w-md w-full space-y-20"
      >
        <div className="space-y-8">
          <div className="w-24 h-24 bg-primary rounded-[2.5rem] flex items-center justify-center mx-auto text-black shadow-3xl shadow-primary/20 float-sovereign border border-white/10">
            <Scale size={48} strokeWidth={2.5} />
          </div>
          <div className="space-y-3">
            <h1 className="text-6xl font-black tracking-tighter leading-none">المستشار <span className="text-primary">AI</span></h1>
            <p className="text-zinc-700 font-black uppercase tracking-[0.5em] text-[10px]">Sovereign OS v4.5</p>
          </div>
        </div>

        <div className="space-y-6">
          {isUserLoading ? (
            <div className="flex justify-center py-10">
              <Loader2 className="animate-spin text-primary" size={32} />
            </div>
          ) : user ? (
            <div className="space-y-10">
              <div className="p-10 bg-[#0a0a0a] rounded-[3.5rem] border border-white/5 space-y-3 shadow-inner">
                <p className="text-[10px] text-zinc-600 font-black uppercase tracking-[0.3em]">Identity Protocol Verified</p>
                <p className="text-3xl font-black text-white">{profile?.fullName || user.displayName}</p>
              </div>
              <Link href="/bot" className="block">
                <button className="w-full h-24 bg-primary text-black font-black text-2xl rounded-[3rem] shadow-3xl hover:scale-105 transition-all flex items-center justify-center gap-5">
                  دخول النظام <ArrowRight className="rotate-180" size={28} />
                </button>
              </Link>
            </div>
          ) : (
            <div className="space-y-12">
              <div className="space-y-4">
                <p className="text-zinc-500 font-bold text-xl leading-relaxed">
                  ابدأ رحلتك في كوكب العدالة الرقمية.
                </p>
                <div className="inline-flex items-center gap-3 bg-emerald-500/5 px-6 py-2 rounded-full border border-emerald-500/10">
                   <ShieldCheck className="h-4 w-4 text-emerald-500" />
                   <span className="text-xs font-black text-emerald-500 uppercase tracking-widest">50 EGP Gift Activated</span>
                </div>
              </div>
              <button 
                onClick={() => signInWithGoogle()}
                className="w-full h-24 bg-white text-black font-black text-2xl rounded-[3rem] shadow-3xl hover:scale-105 transition-all flex items-center justify-center gap-5 group"
              >
                بدء الرحلة السيادية <Zap size={28} fill="currentColor" className="group-hover:animate-pulse" />
              </button>
            </div>
          )}
        </div>

        <footer className="pt-10 opacity-10">
          <p className="text-[9px] font-black uppercase tracking-[0.6em]">king2026 Sovereign Hub • All Rights Secured</p>
        </footer>
      </motion.div>
    </div>
  );
}