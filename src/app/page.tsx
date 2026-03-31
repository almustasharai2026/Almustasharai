
'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Sparkles, Gavel, Video, Send, BrainCircuit, ShieldCheck, Zap } from 'lucide-react';
import SovereignButton from '@/components/SovereignButton';
import FloatingCard from '@/components/FloatingCard';
import Link from 'next/link';

/**
 * الصفحة الرئيسية السيادية (Sovereign Home).
 * تجمع بين بساطة ChatGPT وفخامة "كوكب المستشار" مع تأثيرات حركية ذكية.
 */
export default function Home() {
  const [text, setText] = useState('');

  return (
    <div className="flex flex-col items-center px-5 pb-10 animate-in fade-in duration-700">
      
      {/* Header / Logo Section */}
      <div className="mt-10 flex flex-col items-center gap-3">
        <motion.div 
          initial={{ rotate: -10, scale: 0.9 }}
          animate={{ rotate: 0, scale: 1 }}
          transition={{ type: "spring", stiffness: 260, damping: 20 }}
          className="h-16 w-16 rounded-[2rem] bg-primary flex items-center justify-center shadow-2xl shadow-primary/20 border border-white/10"
        >
          <BrainCircuit className="h-9 w-9 text-white" />
        </motion.div>
        <h1 className="text-3xl font-black text-primary tracking-tighter mt-2">المستشار AI</h1>
        <p className="text-muted-foreground text-sm text-center max-w-[280px] font-medium leading-relaxed opacity-80">
          استشارة ذكية في ثواني. اكتب مشكلتك الآن وسنرشدك لأفضل حل فوراً.
        </p>
      </div>

      {/* AI Sovereign Input Box */}
      <div className="w-full mt-10 bg-white dark:bg-slate-800 rounded-[2.2rem] shadow-xl shadow-black/[0.03] p-2.5 flex items-center gap-2 border border-border/50 focus-within:border-accent/40 focus-within:ring-4 focus-within:ring-accent/5 transition-all">
        <input
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="اكتب تفاصيل مشكلتك هنا..."
          className="flex-1 bg-transparent outline-none text-sm pr-5 py-3.5 text-right placeholder:text-muted-foreground/40 font-medium"
        />
        <button 
          className="h-12 w-12 rounded-2xl bg-accent text-white flex items-center justify-center shadow-lg shadow-accent/20 active:scale-90 hover:scale-105 transition-all shrink-0"
          title="إرسال التحليل"
        >
          <Send className="h-5 w-5 rotate-180" />
        </button>
      </div>

      {/* Floating Features Visualizer */}
      <div className="mt-14 w-full relative h-56 bg-secondary/20 rounded-[3.5rem] overflow-hidden border border-border/20 shadow-inner">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-white/20 to-white/60 dark:to-slate-900/60" />
        
        <FloatingCard 
          title="تحليل ذكي" 
          delay={0} 
          icon={<Zap className="h-3 w-3" />}
        />
        <FloatingCard 
          title="مجلس الخبراء" 
          delay={0.8} 
          icon={<Gavel className="h-3 w-3" />}
        />
        <FloatingCard 
          title="جلسات مباشرة" 
          delay={1.5} 
          icon={<Video className="h-3 w-3" />}
        />
        
        <div className="absolute inset-0 flex items-center justify-center opacity-[0.03] pointer-events-none text-primary">
          <ShieldCheck className="h-48 w-48" />
        </div>
      </div>

      {/* Primary Call to Action */}
      <div className="w-full mt-12 mb-6">
        <Link href="/auth/signup" className="block group">
          <SovereignButton 
            text="ابدأ أول استشارة الآن" 
            icon={<Sparkles className="h-5 w-5 animate-pulse" />}
          />
        </Link>
        <p className="text-[10px] text-center text-muted-foreground/40 mt-4 font-bold uppercase tracking-widest">
          رصيد ترحيبي ٥٠ EGP بانتظارك
        </p>
      </div>

      {/* Features Detail Grid */}
      <div className="w-full space-y-4">
        <FeatureDetail 
          title="تحليل ذكي" 
          desc="محرك AI يحلل معطيات حالتك فوراً ويحدد المخاطر."
        />
        <FeatureDetail 
          title="مستشارين متخصصين" 
          desc="نخبة من الخبراء القانونيين في كافة التخصصات."
        />
        <FeatureDetail 
          title="جلسات مباشرة" 
          desc="تواصل مباشر وآمن عبر الفيديو مع مستشارك الخاص."
        />
      </div>

    </div>
  );
}

function FeatureDetail({ title, desc }: { title: string; desc: string }) {
  return (
    <div className="p-5 bg-secondary/30 rounded-[2rem] border border-border/40 text-right">
      <h3 className="font-black text-primary text-sm mb-1">{title}</h3>
      <p className="text-[11px] text-muted-foreground font-bold opacity-70">{desc}</p>
    </div>
  );
}
