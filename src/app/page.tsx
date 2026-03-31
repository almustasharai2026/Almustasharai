
"use client";

import { Button } from "@/components/ui/button";
import { Sparkles, Gavel, Video, ArrowRight } from "lucide-react";
import Link from "next/link";

/**
 * الصفحة الرئيسية السيادية.
 * تم تصميمها بأسلوب Mobile-first لضمان السرعة والتركيز على الميزات الأساسية.
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
          <Button className="w-full bg-accent hover:bg-accent/90 text-white h-14 rounded-2xl text-lg font-black shadow-lg shadow-accent/20 gap-3 group">
            ابدأ الآن <ArrowRight className="h-5 w-5 rotate-180 group-hover:-translate-x-1 transition-transform" />
          </Button>
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

/**
 * مكون بطاقة الميزة السيادية.
 */
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
