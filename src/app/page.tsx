
"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  ArrowRight, 
  Sparkles, 
  Video,
  FileText,
  MessageSquare,
  ChevronRight,
  Gift,
  Gavel
} from "lucide-react";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function LandingPage() {
  const [prompt, setPrompt] = useState("");
  const router = useRouter();

  const handleStart = () => {
    if (prompt.trim()) {
      router.push(`/bot?query=${encodeURIComponent(prompt)}`);
    } else {
      router.push("/bot");
    }
  };

  return (
    <div className="relative min-h-screen flex flex-col items-center pt-32 pb-20 px-4 overflow-hidden">
      
      {/* Soft Ambient Light - Cosmic Nebula */}
      <div className="absolute top-20 left-1/2 -translate-x-1/2 w-[1000px] h-[600px] bg-primary/5 blur-[160px] rounded-full -z-10 animate-pulse" />

      {/* Hero Section */}
      <div className="text-center space-y-12 max-w-6xl w-full mb-32 animate-in fade-in slide-in-from-bottom-8 duration-1000">
        <div className="inline-flex items-center gap-2 px-6 py-2 rounded-full glass border-white/10 text-white/60 text-[10px] md:text-xs font-black mb-6 animate-bounce">
          <Gift className="h-4 w-4 text-primary" />
          هدية ترحيبية ٥٠ جنيه رصيد مجاني عند الانضمام لكوكبنا
        </div>
        
        <h1 className="text-6xl md:text-9xl font-black tracking-tighter text-white leading-[0.9] text-gradient">
          العدالة برؤية <br />احترافية فائقة
        </h1>
        
        <p className="text-lg md:text-2xl text-white/40 font-medium max-w-3xl mx-auto leading-relaxed">
          كوكب "المستشار AI" يعيد تعريف الممارسة القانونية. دقة مطلقة، بساطة مذهلة، وخصوصية سيادية كاملة تحت سيطرتك.
        </p>

        {/* Central Action Area - Prompt First */}
        <div className="max-w-4xl mx-auto mt-20 p-3 glass rounded-[3rem] focus-within:ring-2 ring-primary/40 transition-all shadow-2xl">
          <div className="flex items-center gap-4 p-2">
            <Input 
              placeholder="اكتب استفسارك القانوني هنا بوضوح..." 
              className="border-none bg-transparent text-xl h-14 focus-visible:ring-0 placeholder:text-white/10 text-right"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleStart()}
            />
            <Button 
              onClick={handleStart}
              className="h-16 w-16 rounded-[1.5rem] btn-primary shrink-0 shadow-primary/40"
            >
              <ArrowRight className="h-7 w-7 rotate-180" />
            </Button>
          </div>
        </div>

        {/* Power Pillars - Three Main Action Buttons */}
        <div className="grid md:grid-cols-3 gap-8 mt-24 max-w-6xl mx-auto">
          <PillarButton 
            href="/consultants"
            icon={<Video className="h-10 w-10 text-primary" />}
            title="الاستشارات الفورية"
            desc="اتصال مرئي مباشر مع نخبة المستشارين"
          />
          <PillarButton 
            href="/templates"
            icon={<FileText className="h-10 w-10 text-emerald-400" />}
            title="النماذج القانونية"
            desc="أكثر من ٢٥٠ نموذجاً ذكياً للتحميل"
          />
          <PillarButton 
            href="/bot"
            icon={<MessageSquare className="h-10 w-10 text-amber-400" />}
            title="مستشارك القانوني"
            desc="دردشة ذكية مدعومة بأقوى محركات الذكاء"
          />
        </div>
      </div>

      {/* Stats Section */}
      <section className="mt-40 w-full max-w-6xl glass-card p-16 md:p-24 rounded-[4rem] text-center border-white/[0.03] relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-primary/40 to-transparent" />
        <h2 className="text-4xl md:text-5xl font-black mb-16 text-white/90">منظومة العدالة الأكثر موثوقية</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-16">
          <StatBox value="٩٩.٩٪" label="دقة قانونية" />
          <StatBox value="٠.٢ث" label="سرعة التحليل" />
          <StatBox value="١٠٠٪" label="أمان سيادي" />
          <StatBox value="٧٥٪" label="توفير ذكي" />
        </div>
      </section>
    </div>
  );
}

function PillarButton({ href, icon, title, desc }: { href: string; icon: React.ReactNode; title: string; desc: string }) {
  return (
    <Link href={href} className="group">
      <div className="glass-card p-10 rounded-[3.5rem] flex flex-col items-center gap-6 border-white/[0.02] hover:border-primary/40 hover:bg-white/[0.03] transition-all duration-500 hover:-translate-y-4">
        <div className="h-20 w-20 rounded-3xl bg-white/[0.03] flex items-center justify-center border border-white/[0.05] shadow-inner group-hover:scale-110 transition-transform duration-700">
          {icon}
        </div>
        <div className="text-center">
          <h3 className="text-2xl font-black text-white mb-2 group-hover:text-primary transition-colors">{title}</h3>
          <p className="text-white/30 text-xs font-bold leading-relaxed">{desc}</p>
        </div>
        <div className="h-10 w-10 rounded-full glass flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-700 translate-y-4 group-hover:translate-y-0">
          <ChevronRight className="h-5 w-5 text-primary" />
        </div>
      </div>
    </Link>
  );
}

function StatBox({ value, label }: { value: string; label: string }) {
  return (
    <div className="space-y-3">
      <p className="text-5xl font-black text-white tracking-tighter">{value}</p>
      <p className="text-[10px] text-white/20 uppercase tracking-[0.3em] font-black">{label}</p>
    </div>
  );
}
