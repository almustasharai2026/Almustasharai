"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { Sparkles, ShieldCheck, ArrowRight, Gavel, Video, BookOpen, Star, Zap, Globe, Scale, Activity } from "lucide-react";
import { Badge } from "@/components/ui/badge";

const SovereignLogo = () => (
  <svg viewBox="0 0 100 100" className="h-24 w-24 drop-shadow-[0_0_30px_rgba(37,99,235,0.6)]">
    <path d="M50 5 L90 25 L90 75 L50 95 L10 75 L10 25 Z" fill="none" stroke="currentColor" strokeWidth="2" className="text-white/10" />
    <path d="M50 15 L80 30 L80 70 L50 85 L20 70 L20 30 Z" fill="none" stroke="currentColor" strokeWidth="4" className="text-primary" />
    <path d="M35 45 H65 M50 45 V70 M35 45 L30 55 M65 45 L70 55" stroke="currentColor" strokeWidth="5" strokeLinecap="round" className="text-primary" />
    <circle cx="50" cy="35" r="4" fill="currentColor" className="text-accent" />
  </svg>
);

export default function LandingPage() {
  return (
    <div className="relative min-h-screen flex flex-col items-center pt-32 pb-20 px-4 overflow-hidden" dir="rtl">
      
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full bg-[url('https://picsum.photos/seed/justice/1920/1080')] opacity-[0.02] grayscale pointer-events-none" />
      <div className="absolute top-[20%] right-[-10%] w-[500px] h-[500px] bg-primary/10 blur-[150px] rounded-full -z-10" />
      <div className="absolute bottom-[10%] left-[-5%] w-[400px] h-[400px] bg-accent/5 blur-[120px] rounded-full -z-10" />

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="text-center space-y-10 max-w-5xl relative z-10"
      >
        <div className="flex justify-center mb-8">
           <SovereignLogo />
        </div>

        <div className="inline-flex items-center gap-3 px-6 py-2.5 rounded-full glass-cosmic border-primary/20 text-primary text-xs font-black tracking-wide shadow-2xl">
          <Star className="h-4 w-4 fill-primary animate-pulse" />
          أول نظام قانوني سيادي مدعوم بالذكاء الاصطناعي الفائق
        </div>
        
        <h1 className="text-6xl md:text-9xl font-black tracking-tighter text-white leading-[0.95]">
          السيادة <br />
          <span className="text-gradient">القانونية الرقمية</span>
        </h1>
        
        <p className="text-xl md:text-2xl text-white/40 font-bold max-w-2xl mx-auto leading-relaxed">
          نحن لا نقدم مجرد استشارة، نحن نصيغ مستقبلك بذكاء اصطناعي يفكر كالقاضي، يحلل كالمحامي، وينفذ كالموثق.
        </p>

        <div className="flex flex-wrap justify-center gap-6 mt-16">
          <Link href="/auth/signup">
            <Button className="h-20 px-14 rounded-[2.5rem] btn-primary text-2xl font-black gap-4 group hover:scale-105 transition-all">
              ابدأ الآن <ArrowRight className="h-7 w-7 rotate-180 group-hover:-translate-x-3 transition-transform" />
            </Button>
          </Link>
          <Link href="/bot">
            <Button variant="outline" className="h-20 px-12 rounded-[2.5rem] glass-cosmic border-white/10 text-xl font-black hover:bg-white/5 hover:border-primary/40 transition-all">
              تحدث مع المستشار الذكي
            </Button>
          </Link>
        </div>
      </motion.div>

      <div className="grid md:grid-cols-3 gap-10 mt-40 max-w-7xl w-full relative z-10">
        <SupremePillar 
          icon={<Zap className="h-12 w-12 text-blue-400" />}
          title="الاستشارة الفورية"
          desc="دردشة قانونية فورية تحلل قضيتك، تستخلص الثغرات، وتوجهك للمسار الصحيح في ثوانٍ."
          href="/bot"
          badge="1 EGP / Msg"
        />
        <SupremePillar 
          icon={<Globe className="h-12 w-12 text-emerald-400" />}
          title="المكتبة المعتمدة"
          desc="أرشيف ضخم من العقود والنماذج الحكومية المحدثة، قابلة للتخصيص والتحميل الفوري."
          href="/templates"
          badge="Certified"
        />
        <SupremePillar 
          icon={<Scale className="h-12 w-12 text-amber-400" />}
          title="اتصال الخبراء"
          desc="حجز مكالمات مرئية مشفرة مع نخبة من كبار المحامين والمستشارين المعتمدين."
          href="/consultants"
          badge="Live Call"
        />
      </div>

      <motion.div 
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        className="mt-60 w-full max-w-6xl glass-cosmic rounded-[4rem] p-16 border-white/5 flex flex-col md:flex-row items-center gap-16"
      >
        <div className="flex-1 space-y-8 text-right">
           <Badge className="bg-primary/20 text-primary px-6 py-1 rounded-full font-black text-[10px] tracking-widest uppercase">Encryption Protocol v4.0</Badge>
           <h2 className="text-5xl font-black text-white leading-tight">أمن سيادي <br /><span className="text-primary">وخصوصية مطلقة</span></h2>
           <p className="text-xl text-white/40 font-medium leading-relaxed">بياناتك القانونية هي حصنك المنيع. نستخدم تشفيراً عسكرياً لضمان عدم اطلاع أي طرف ثالث على محادثاتك أو مستنداتك.</p>
           <div className="flex items-center gap-10 pt-4 justify-end">
              <div className="flex flex-col items-center">
                <span className="text-3xl font-black text-white">99.9%</span>
                <span className="text-[10px] text-white/20 font-bold uppercase tracking-widest">Accuracy Rate</span>
              </div>
              <div className="h-12 w-px bg-white/5" />
              <div className="flex flex-col items-center">
                <span className="text-3xl font-black text-white">256-bit</span>
                <span className="text-[10px] text-white/20 font-bold uppercase tracking-widest">Encryption</span>
              </div>
           </div>
        </div>
        <div className="flex-1 relative flex justify-center">
           <div className="h-80 w-80 bg-primary/20 rounded-full blur-[80px] absolute" />
           <ShieldCheck className="h-64 w-64 text-primary relative z-10 drop-shadow-[0_0_50px_rgba(37,99,235,0.4)]" />
        </div>
      </motion.div>

      <div className="mt-40 text-center opacity-30 pb-20">
        <p className="text-[10px] font-black uppercase tracking-[0.5em] mb-12">نظام معتمد من كبار الخبراء</p>
        <div className="flex flex-wrap justify-center gap-16 items-center">
           <ShieldCheck className="h-12 w-12" />
           <Gavel className="h-12 w-12" />
           <Scale className="h-12 w-12" />
           <Sparkles className="h-12 w-12" />
        </div>
      </div>
    </div>
  );
}

function SupremePillar({ icon, title, desc, href, badge }: any) {
  return (
    <Link href={href} className="group">
      <div className="glass-cosmic p-12 rounded-[3.5rem] border-white/5 hover:border-primary/40 transition-all h-full flex flex-col relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 blur-3xl -z-10 group-hover:bg-primary/10 transition-all" />
        <div className="flex justify-between items-start mb-10">
          <div className="h-20 w-20 rounded-[2rem] bg-white/5 flex items-center justify-center group-hover:scale-110 group-hover:rotate-6 transition-all duration-500 shadow-inner">
            {icon}
          </div>
          <Badge className="bg-white/5 text-white/40 border-none px-4 py-1 rounded-full text-[9px] font-black">{badge}</Badge>
        </div>
        <h3 className="text-3xl font-black text-white mb-6 tracking-tight text-right">{title}</h3>
        <p className="text-white/30 leading-relaxed font-medium text-lg flex-grow text-right">{desc}</p>
        <div className="mt-10 flex items-center gap-3 text-primary font-black opacity-0 group-hover:opacity-100 transition-all transform translate-x-4 group-hover:translate-x-0 justify-end">
           فتح البوابة <ArrowRight className="h-5 w-5 rotate-180" />
        </div>
      </div>
    </Link>
  );
}