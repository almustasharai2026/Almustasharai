'use client';

import React from 'react';
import { Scale, Zap, ArrowRight, Loader2, ShieldCheck } from 'lucide-react';
import { motion } from 'framer-motion';
import { useUser } from '@/firebase';
import Link from 'next/link';

/**
 * واجهة التأسيس (Sovereign OS Welcome).
 * تصميم Matte Black فائق البساطة يركز على بدء الرحلة السيادية.
 */
export default function WelcomePage() {
  const { user, profile, isUserLoading, signInWithGoogle } = useUser();

  return (
    <div className="min-h-screen bg-[#050505] text-white flex flex-col items-center justify-center p-6 text-center overflow-hidden font-sans" dir="rtl">
      
      {/* Subtle Sovereign Aura */}
      <div className="fixed inset-0 -z-10">
        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-primary/5 via-transparent to-transparent opacity-30" />
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 30 }} 
        animate={{ opacity: 1, y: 0 }} 
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="max-w-md w-full space-y-24"
      >
        <div className="space-y-10">
          <div className="w-28 h-28 bg-[#151515] rounded-[3rem] flex items-center justify-center mx-auto text-primary shadow-2xl shadow-primary/5 float-sovereign border border-white/5">
            <Scale size={56} strokeWidth={1.5} />
          </div>
          <div className="space-y-4">
            <h1 className="text-7xl font-black tracking-tighter leading-none text-white">المستشار <span className="text-primary">AI</span></h1>
            <p className="text-zinc-800 font-black uppercase tracking-[0.6em] text-[9px]">Sovereign OS v4.5 • king2026</p>
          </div>
        </div>

        <div className="space-y-8">
          {isUserLoading ? (
            <div className="flex justify-center py-10">
              <Loader2 className="animate-spin text-primary opacity-20" size={40} />
            </div>
          ) : user ? (
            <div className="space-y-12">
              <div className="p-12 bg-[#0a0a0a] rounded-[4rem] border border-white/5 space-y-4 shadow-inner">
                <p className="text-[10px] text-zinc-700 font-black uppercase tracking-[0.4em]">Identity Verified</p>
                <p className="text-4xl font-black text-white tracking-tight">{profile?.fullName || user.displayName}</p>
              </div>
              <Link href="/bot" className="block">
                <button className="w-full h-24 bg-primary text-black font-black text-2xl rounded-[3rem] shadow-[0_20px_50px_rgba(255,87,34,0.3)] hover:scale-105 transition-all flex items-center justify-center gap-6 group">
                  دخول النظام <ArrowRight className="rotate-180 group-hover:translate-x-2 transition-transform" size={32} />
                </button>
              </Link>
            </div>
          ) : (
            <div className="space-y-16">
              <div className="space-y-6">
                <p className="text-zinc-600 font-bold text-2xl leading-relaxed">
                  أهلاً بك في كوكب العدالة الرقمية.
                </p>
                <div className="inline-flex items-center gap-4 bg-emerald-500/5 px-8 py-3 rounded-full border border-emerald-500/10">
                   <ShieldCheck className="h-5 w-5 text-emerald-500" />
                   <span className="text-sm font-black text-emerald-500 uppercase tracking-widest">50 EGP Sovereign Gift</span>
                </div>
              </div>
              <button 
                onClick={() => signInWithGoogle()}
                className="w-full h-24 bg-white text-black font-black text-2xl rounded-[3rem] shadow-2xl hover:scale-105 transition-all flex items-center justify-center gap-6 group"
              >
                بدء الرحلة السيادية <Zap size={32} fill="currentColor" className="group-hover:animate-pulse" />
              </button>
            </div>
          )}
        </div>

        <footer className="pt-12 opacity-5">
          <p className="text-[8px] font-black uppercase tracking-[0.8em]">Sovereign Hub • All Authority Secured</p>
        </footer>
      </motion.div>
    </div>
  );
}
