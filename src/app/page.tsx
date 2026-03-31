'use client';

import { Sparkles, Gavel, Video, ArrowRight } from "lucide-react";
import Link from "next/link";
import SovereignButton from "@/components/SovereignButton";

/**
 * الصفحة الرئيسية السيادية المحدثة.
 * تستخدم مكون SovereignButton لضمان توحيد تجربة الانطلاق.
 */
export default function Home() {
  return (
    <div className="p-5 space-y-8 animate-in fade-in duration-700">

      {/* Hero Section */}
      <div className="space-y-4">
        <div className="space-y-2 text-right">
          <h1 className="text-3xl font-black text-primary leading-tight tracking-tighter">
            استشارة ذكية <br />
            <span className="text-accent">في ثواني</span>
          </h1>
          <p className="text-muted-foreground text-sm font-medium leading-relaxed max-w-[280px]">
            احصل على تحليل فوري وتواصل مع أفضل المستشارين القانونيين المعتمدين في ثواني معدودة.
          </p>
        </div>

        <Link href="/auth/signup" className="block w-full">
          <SovereignButton 
            text="ابدأ الآن" 
            icon={<ArrowRight className="h-5 w-5 rotate-180" />} 
          />
        </Link>
      </div>

      {/* Features Grid */}
      <div className="space-y-4">
        <h2 className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/50 px-1 text-right">
          مميزات النظام السيادي
        </h2>
        <div className="grid gap-3">
          <Feature 
            icon={<Sparkles className="h-5 w-5 text-accent" />} 
            title="تحليل ذكي" 
            desc="محرك AI يحلل تفاصيل مشكلتك فوراً وبدقة عالية." 
          />
          <Feature 
            icon={<Gavel className="h-5 w-5 text-accent" />} 
            title="مستشارين متخصصين" 
            desc="نخبة من الخبراء في كافة المجالات القانونية تحت طلبك." 
          />
          <Feature 
            icon={<Video className="h-5 w-5 text-accent" />} 
            title="جلسات مباشرة" 
            desc="تواصل فيديو مشفر ولحظي مع المستشار الخاص بك." 
          />
        </div>
      </div>

      {/* Secondary Action */}
      <div className="pt-4 text-center">
        <Link href="/about" className="text-xs font-bold text-muted-foreground hover:text-primary transition-colors">
          تعرف أكثر على بروتوكول المستشار AI
        </Link>
      </div>
    </div>
  );
}

function Feature({ icon, title, desc }: { icon: React.ReactNode; title: string; desc: string }) {
  return (
    <div className="p-5 bg-secondary/50 rounded-[2rem] border border-border/50 flex gap-4 items-start group hover:bg-white dark:hover:bg-slate-800 transition-all duration-300 shadow-sm hover:shadow-md">
      <div className="h-10 w-10 rounded-xl bg-accent/10 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
        {icon}
      </div>
      <div className="space-y-1 text-right">
        <h3 className="font-bold text-primary text-sm">{title}</h3>
        <p className="text-xs text-muted-foreground leading-relaxed font-medium">{desc}</p>
      </div>
    </div>
  );
}
