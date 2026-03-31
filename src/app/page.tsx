
"use client";

import { motion } from 'framer-motion';
import { Scale, Sparkles, ShieldCheck, Gavel, Video, FileText, Crown, ArrowRight, UserPlus } from 'lucide-react';
import Link from 'next/link';
import { useUser } from '@/firebase';
import SovereignButton from '@/components/SovereignButton';

export default function SovereignLanding() {
  const { user } = useUser();

  return (
    <div className="min-h-screen flex flex-col items-center relative overflow-hidden bg-sovereign-cinematic">
      <div className="absolute top-0 left-0 w-full h-full pointer-events-none">
        <div className="absolute top-[10%] right-[15%] w-[500px] h-[500px] bg-primary/10 blur-[150px] rounded-full" />
        <div className="absolute bottom-[5%] left-[10%] w-[400px] h-[400px] bg-accent/5 blur-[120px] rounded-full" />
      </div>

      <div className="container mx-auto px-6 pt-32 pb-40 z-10 flex flex-col items-center">
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1 }}
          className="text-center space-y-10 max-w-4xl"
        >
          <div className="flex justify-center">
            <div className="h-32 w-32 rounded-[3rem] bg-gradient-to-br from-primary to-indigo-600 flex items-center justify-center shadow-3xl border border-white/20 float-sovereign">
              <Scale className="h-16 w-12 text-primary" />
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
                <SovereignButton text="دخول مركز القيادة" icon={<Crown className="h-7 w-7 text-white" />} className="h-24 rounded-[2.5rem]" />
              </Link>
            )}
          </div>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 w-full mt-32 max-w-7xl">
          <FeatureBox href="/bot" title="البوت الذكي" icon={<Sparkles />} color="blue" />
          <FeatureBox href="/consultants" title="مجلس الخبراء" icon={<Gavel />} color="amber" />
          <FeatureBox href="/consultants" title="جلسات الفيديو" icon={<Video />} color="indigo" />
          <FeatureBox href="/templates" title="المكتبة الرقمية" icon={<FileText />} color="emerald" />
        </div>
      </div>
    </div>
  );
}

function FeatureBox({ href, title, icon, color }: any) {
  const colors: any = {
    blue: "hover:border-primary/40 text-primary",
    amber: "hover:border-amber-500/40 text-amber-500",
    indigo: "hover:border-indigo-500/40 text-indigo-400",
    emerald: "hover:border-emerald-500/40 text-emerald-400",
  };
  return (
    <Link href={href} className="group">
      <div className={`p-10 glass-cosmic rounded-[3.5rem] h-full flex flex-col items-center gap-6 border-white/5 transition-all duration-500 hover:scale-[1.05] shadow-3xl ${colors[color]}`}>
        <div className="h-20 w-20 rounded-[2rem] bg-white/5 flex items-center justify-center shadow-inner group-hover:rotate-12 transition-transform duration-500">
          <div className="scale-[2]">{icon}</div>
        </div>
        <h3 className="text-2xl font-black text-white">{title}</h3>
      </div>
    </Link>
  );
}
