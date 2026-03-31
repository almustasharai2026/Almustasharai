"use client";

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Scale, Sparkles, ShieldCheck, Gavel, Video, FileText, ArrowLeft, Crown } from 'lucide-react';
import Link from 'next/link';
import { useUser } from '@/firebase';
import SovereignButton from '@/components/SovereignButton';

export default function SovereignLanding() {
  const { user, profile } = useUser();

  return (
    <div className="min-h-screen flex flex-col items-center px-6 py-12 relative overflow-hidden">
      {/* Dynamic Background Elements */}
      <div className="absolute top-[-10%] right-[-10%] w-96 h-96 bg-primary/10 blur-[120px] rounded-full" />
      <div className="absolute bottom-[-10%] left-[-10%] w-96 h-96 bg-indigo-500/10 blur-[120px] rounded-full" />

      {/* Hero Section */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="text-center space-y-6 mt-10 z-10"
      >
        <div className="flex justify-center">
          <div className="h-24 w-24 rounded-[2.5rem] bg-gradient-to-br from-primary to-amber-700 flex items-center justify-center shadow-3xl border border-white/20 float-sovereign">
            <Scale className="h-12 w-12 text-white" />
          </div>
        </div>
        <h1 className="text-5xl font-black tracking-tighter text-white">
          كوكب <span className="text-gradient">المستشار AI</span>
        </h1>
        <p className="text-xl text-white/40 font-bold max-w-sm mx-auto leading-relaxed">
          العدالة الرقمية بمعايير سيادية. استشارات قانونية فورية، حماية مطلقة، وخبراء معتمدون.
        </p>
      </motion.div>

      {/* Visual Feature Grid */}
      <div className="grid grid-cols-2 gap-4 w-full mt-16 max-w-md">
        <FeatureIcon icon={<Sparkles className="text-primary" />} text="ذكاء اصطناعي" />
        <FeatureIcon icon={<Gavel className="text-primary" />} text="خبراء بشريون" />
        <FeatureIcon icon={<Video className="text-primary" />} text="جلسات فيديو" />
        <FeatureIcon icon={<FileText className="text-primary" />} text="وثائق معتمدة" />
      </div>

      {/* Primary Actions */}
      <div className="w-full max-w-md mt-16 space-y-4 z-10">
        {!user ? (
          <Link href="/auth/signup">
            <SovereignButton text="انضم الآن واحصل على ٥٠ EGP" icon={<ShieldCheck className="h-6 w-6" />} />
          </Link>
        ) : (
          <Link href="/bot">
            <SovereignButton text="دخول مركز القيادة" icon={<Crown className="h-6 w-6" />} />
          </Link>
        )}
        
        <div className="flex items-center gap-4 mt-8">
          <Link href="/about" className="flex-1 py-4 glass-cosmic rounded-2xl text-center text-xs font-black uppercase tracking-widest text-white/60 hover:text-white transition-all">
            عن المنصة
          </Link>
          <Link href="/pricing" className="flex-1 py-4 glass-cosmic rounded-2xl text-center text-xs font-black uppercase tracking-widest text-white/60 hover:text-white transition-all">
            باقات الشحن
          </Link>
        </div>
      </div>

      {/* Footer Disclaimer */}
      <div className="mt-auto pt-20 text-center opacity-20 pointer-events-none">
        <p className="text-[10px] font-black uppercase tracking-[0.5em]">Almustasharai AI Sovereign Protocol v4.5</p>
      </div>
    </div>
  );
}

function FeatureIcon({ icon, text }: { icon: React.ReactNode, text: string }) {
  return (
    <motion.div 
      whileHover={{ scale: 1.05 }}
      className="p-6 glass-cosmic rounded-[2.5rem] flex flex-col items-center gap-3 border-white/5"
    >
      <div className="h-12 w-12 rounded-2xl bg-white/5 flex items-center justify-center shadow-inner">
        {icon}
      </div>
      <span className="text-[10px] font-black text-white/60 uppercase tracking-widest">{text}</span>
    </motion.div>
  );
}