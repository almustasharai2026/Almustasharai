
'use client';

import React from 'react';
import { Scale, Zap, ArrowRight, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { useUser } from '@/firebase';
import Link from 'next/link';

export default function WelcomePage() {
  const { user, profile, isUserLoading, signInWithGoogle } = useUser();

  return (
    <div className="min-h-screen bg-[#050505] text-white flex flex-col items-center justify-center p-6 text-center overflow-hidden font-sans" dir="rtl">
      
      {/* Background Hub Glow */}
      <div className="fixed inset-0 -z-10">
        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-primary/5 via-transparent to-transparent opacity-50" />
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }} 
        animate={{ opacity: 1, y: 0 }} 
        className="max-w-md w-full space-y-16"
      >
        <div className="space-y-6">
          <div className="w-20 h-20 bg-primary rounded-3xl flex items-center justify-center mx-auto text-black shadow-3xl shadow-primary/20 float-sovereign">
            <Scale size={40} />
          </div>
          <div>
            <h1 className="text-5xl font-black tracking-tighter">المستشار <span className="text-primary">AI</span></h1>
            <p className="text-zinc-600 font-bold uppercase tracking-[0.4em] text-[10px] mt-2">Sovereign OS v1.0</p>
          </div>
        </div>

        <div className="space-y-4">
          {isUserLoading ? (
            <div className="flex justify-center py-10">
              <Loader2 className="animate-spin text-primary" size={32} />
            </div>
          ) : user ? (
            <div className="space-y-8">
              <div className="p-8 bg-zinc-900/50 rounded-[3rem] border border-white/5 space-y-2">
                <p className="text-xs text-zinc-500 font-bold uppercase tracking-widest">مرحباً سيادة المواطن</p>
                <p className="text-2xl font-black text-white">{profile?.fullName || user.displayName}</p>
              </div>
              <Link href="/bot" className="block">
                <button className="w-full h-20 bg-primary text-black font-black text-xl rounded-[2.5rem] shadow-3xl hover:scale-105 transition-all flex items-center justify-center gap-4">
                  دخول النظام <ArrowRight className="rotate-180" />
                </button>
              </Link>
            </div>
          ) : (
            <div className="space-y-10">
              <p className="text-zinc-500 font-bold text-lg leading-relaxed">
                ابدأ رحلتك في كوكب العدالة الرقمية. <br/>
                احصل على <span className="text-primary font-black">50 EGP</span> رصيد ترحيبي فور التوثيق.
              </p>
              <button 
                onClick={() => signInWithGoogle()}
                className="w-full h-24 bg-white text-black font-black text-2xl rounded-[3rem] shadow-3xl hover:scale-105 transition-all flex items-center justify-center gap-4 group"
              >
                بدء الرحلة السيادية <Zap size={28} fill="currentColor" className="group-hover:animate-pulse" />
              </button>
            </div>
          )}
        </div>

        <footer className="pt-10 opacity-10">
          <p className="text-[8px] font-black uppercase tracking-[0.6em]">king2026 Foundation • All Rights Secured</p>
        </footer>
      </motion.div>
    </div>
  );
}
