'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Sparkles, Gavel, Video, Send, BrainCircuit, ShieldCheck, Zap } from 'lucide-react';
import SovereignButton from '@/components/SovereignButton';
import Link from 'next/link';

/**
 * الصفحة الرئيسية السيادية المحدثة.
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
          اكتب مشكلتك الآن، وسيقوم المحرك السيادي بتوجيهك لأفضل حل قانوني في ثوانٍ.
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
          icon={<Zap className="h-3.5 w-3.5" />}
          delay={0} 
          position={{ top: '15%', right: '10%' }}
        />
        <FloatingCard 
          title="مجلس الخبراء" 
          icon={<Gavel className="h-3.5 w-3.5" />}
          delay={0.8} 
          position={{ bottom: '20%', left: '15%' }}
        />
        <FloatingCard 
          title="اتصال مباشر" 
          icon={<Video className="h-3.5 w-3.5" />}
          delay={1.5} 
          position={{ top: '45%', right: '45%' }}
        />
        
        <div className="absolute inset-0 flex items-center justify-center opacity-[0.03] pointer-events-none">
          <ShieldCheck className="h-48 w-48 text-primary" />
        </div>
      </div>

      {/* Protocols & Features List */}
      <div className="w-full mt-12 space-y-5">
        <div className="flex items-center gap-3 px-1">
          <div className="h-px flex-grow bg-border/50" />
          <h2 className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground/40">
            بروتوكولات العدالة الرقمية
          </h2>
        </div>
        
        <div className="grid gap-4">
          <FeatureItem 
            title="محرك القرار الاستراتيجي" 
            desc="تحليل هيكلي عميق يحدد مستوى المخاطر ويضع خطة عمل فورية لموقفك."
            icon={<Sparkles className="h-4 w-4 text-accent" />}
          />
          <FeatureItem 
            title="الدرع الواقي للبيانات" 
            desc="تشفير سيادي لكافة المراسلات يضمن خصوصيتك المطلقة وفق أعلى المعايير."
            icon={<ShieldCheck className="h-4 w-4 text-accent" />}
          />
        </div>
      </div>

      {/* Primary Call to Action */}
      <div className="w-full mt-12 mb-6">
        <Link href="/auth/signup" className="block group">
          <SovereignButton 
            text="انطلق في أول استشارة مجاناً" 
            icon={<Sparkles className="h-5 w-5 animate-pulse" />}
          />
        </Link>
        <p className="text-[10px] text-center text-muted-foreground/40 mt-4 font-bold uppercase tracking-widest">
          رصيد ترحيبي ٥٠ EGP بانتظارك
        </p>
      </div>

    </div>
  );
}

/**
 * مكون البطاقة العائمة لإضفاء حيوية على الواجهة.
 */
function FloatingCard({ title, delay, position, icon }: { title: string; delay: number; position: any; icon: React.ReactNode }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8, y: 10 }}
      animate={{ 
        opacity: 1, 
        scale: 1,
        y: [0, -12, 0],
        rotate: [0, 2, -2, 0]
      }}
      transition={{ 
        duration: 5, 
        repeat: Infinity, 
        delay: delay,
        ease: "easeInOut"
      }}
      className="absolute bg-white/90 dark:bg-slate-800/90 backdrop-blur-md px-5 py-3 rounded-[1.5rem] shadow-2xl shadow-black/10 border border-white/20 text-[11px] font-black text-primary flex items-center gap-3 z-10"
      style={position}
    >
      <div className="h-6 w-6 rounded-xl bg-accent/10 flex items-center justify-center text-accent shadow-inner">
        {icon}
      </div>
      <span className="tracking-tight">{title}</span>
    </motion.div>
  );
}

/**
 * بطاقة عرض الميزة في القائمة السفلية.
 */
function FeatureItem({ title, desc, icon }: { title: string; desc: string; icon: React.ReactNode }) {
  return (
    <div className="p-6 bg-secondary/30 rounded-[2.5rem] border border-border/40 hover:bg-white dark:hover:bg-slate-800 hover:border-accent/30 hover:shadow-xl hover:shadow-accent/5 transition-all duration-500 group">
      <div className="flex items-center gap-3 mb-2 justify-end">
        <h3 className="font-black text-primary text-sm tracking-tight">{title}</h3>
        <div className="group-hover:rotate-12 transition-transform">{icon}</div>
      </div>
      <p className="text-[11px] text-muted-foreground leading-relaxed text-right font-bold opacity-70 group-hover:opacity-100">{desc}</p>
    </div>
  );
}
