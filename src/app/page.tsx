
"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Scale, 
  ArrowRight, 
  Globe, 
  Smartphone, 
  Palette, 
  Database,
  Search,
  Zap,
  ChevronRight
} from "lucide-react";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function ReplitStyleHome() {
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
    <div className="flex flex-col items-center min-h-screen pt-20 pb-20 px-4 bg-background">
      {/* Banner */}
      <div className="w-full max-w-4xl mb-12">
        <Link href="/auth/signup" className="block">
          <div className="bg-primary/5 hover:bg-primary/10 transition-colors border border-primary/20 rounded-xl p-3 text-center text-sm font-medium text-primary">
            لفترة محدودة: احصل على استشارة أولى مجانية عند دعوة صديق. <span className="underline font-bold">اشترك الآن</span>
          </div>
        </Link>
      </div>

      {/* Main Hero */}
      <div className="text-center space-y-8 max-w-3xl w-full mb-16 animate-in fade-in slide-in-from-bottom-4 duration-1000">
        <h1 className="text-5xl md:text-7xl font-black tracking-tight text-foreground">
          ماذا تريد أن تبني قانونياً؟
        </h1>
        <p className="text-xl text-muted-foreground font-medium">
          حول أفكارك ونزاعاتك إلى حلول قانونية في دقائق — لا حاجة لخبرة سابقة.
        </p>

        {/* Replit Style Input */}
        <div className="relative group max-w-2xl mx-auto mt-12">
          <div className="absolute inset-0 bg-orange-500/20 blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
          <div className="relative flex items-center bg-card border-2 border-muted-foreground/20 rounded-2xl p-2 shadow-2xl focus-within:border-orange-500 transition-all">
            <div className="px-4 text-muted-foreground">
              <span className="text-2xl">+</span>
            </div>
            <Input 
              placeholder="صف قضيتك، وسيقوم المستشار بإحضار الحل..." 
              className="border-none bg-transparent text-xl h-14 focus-visible:ring-0 placeholder:text-muted-foreground/50 text-right"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleStart()}
            />
            <Button 
              onClick={handleStart}
              className="h-12 w-12 rounded-xl bg-orange-500 hover:bg-orange-600 shadow-lg"
            >
              <ArrowRight className="h-6 w-6 rotate-180" />
            </Button>
          </div>
        </div>

        {/* Categories Icons */}
        <div className="grid grid-cols-4 gap-4 mt-12 max-w-xl mx-auto">
          <CategoryIcon icon={<Scale className="h-6 w-6" />} label="قانوني" />
          <CategoryIcon icon={<Smartphone className="h-6 w-6" />} label="جنائي" />
          <CategoryIcon icon={<Palette className="h-6 w-6" />} label="تجاري" />
          <CategoryIcon icon={<Database className="h-6 w-6" />} label="عقاري" />
        </div>

        {/* Examples */}
        <div className="pt-8 space-y-4">
          <p className="text-sm text-muted-foreground flex items-center justify-center gap-2">
            جرب مثالاً للاستشارة <Zap className="h-3 w-3 text-orange-500" />
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            <ExampleChip label="عقد تأسيس شركة تقنية" onClick={() => setPrompt("أريد صياغة عقد تأسيس لشركة تقنية ناشئة")} />
            <ExampleChip label="نزاع عقاري على إيجار" onClick={() => setPrompt("لدي مشكلة في عقد إيجار سكني")} />
            <ExampleChip label="حماية علامة تجارية" onClick={() => setPrompt("كيف أحمي علامتي التجارية في السعودية؟")} />
          </div>
        </div>
      </div>

      {/* Feature Section */}
      <section className="w-full max-w-5xl grid md:grid-cols-2 gap-8 pt-20">
        <div className="bg-orange-100 dark:bg-orange-950/30 rounded-[2.5rem] p-12 space-y-6 flex flex-col justify-center">
          <span className="text-orange-600 font-bold uppercase tracking-widest text-sm">مساحة لا نهائية</span>
          <h2 className="text-4xl font-black text-orange-900 dark:text-orange-400">صمم بحرية</h2>
          <p className="text-lg text-orange-800/70 dark:text-orange-400/70 leading-relaxed">
            نقدم لك مساحة جديدة تسمح لك باستكشاف وتعديل القضايا قانونياً بشكل مرئي، ثم تطبيقها مباشرة في عقودك الرسمية.
          </p>
        </div>
        <div className="bg-muted/50 rounded-[2.5rem] p-12 border-2 border-dashed border-muted flex items-center justify-center">
          <div className="space-y-4 w-full">
            <div className="h-12 w-full bg-background rounded-xl border-2 flex items-center px-4 justify-between">
              <div className="flex gap-2">
                <div className="w-3 h-3 rounded-full bg-red-400" />
                <div className="w-3 h-3 rounded-full bg-yellow-400" />
                <div className="w-3 h-3 rounded-full bg-green-400" />
              </div>
              <span className="text-xs font-bold opacity-40">Contract_v1.pdf</span>
            </div>
            <div className="h-40 w-full bg-background rounded-xl border-2 p-4 space-y-2">
              <div className="h-2 w-3/4 bg-muted rounded" />
              <div className="h-2 w-1/2 bg-muted rounded" />
              <div className="h-2 w-5/6 bg-muted rounded" />
              <div className="h-2 w-2/3 bg-muted rounded" />
            </div>
          </div>
        </div>
      </section>

      {/* "Meet the Agent" Style Section */}
      <section className="w-full max-w-5xl mt-20 text-center space-y-4">
        <h2 className="text-6xl font-black">قابل <span className="text-orange-500">المستشار ٤</span></h2>
        <p className="text-2xl text-muted-foreground">الإبداع القانوني ينطلق من هنا.</p>
        <div className="mt-12 bg-orange-500 rounded-[3rem] h-[500px] overflow-hidden relative group">
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
          <div className="absolute bottom-12 left-12 right-12 text-right text-white space-y-4">
            <h3 className="text-4xl font-black">تصميم حر</h3>
            <p className="text-xl opacity-80 max-w-xl mr-auto">
              نظام ذكاء اصطناعي يفهم أبعاد القانون ويحولها إلى نماذج قابلة للتنفيذ.
            </p>
            <Button size="lg" className="rounded-full bg-white text-orange-500 font-black px-10 hover:bg-orange-50">
              جربه الآن
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}

function CategoryIcon({ icon, label }: { icon: React.ReactNode; label: string }) {
  return (
    <div className="flex flex-col items-center gap-2 group cursor-pointer">
      <div className="h-16 w-16 rounded-2xl bg-card border-2 border-muted flex items-center justify-center text-muted-foreground group-hover:border-orange-500 group-hover:text-orange-500 transition-all shadow-sm">
        {icon}
      </div>
      <span className="text-xs font-bold text-muted-foreground group-hover:text-foreground transition-colors">{label}</span>
    </div>
  );
}

function ExampleChip({ label, onClick }: { label: string; onClick: () => void }) {
  return (
    <button 
      onClick={onClick}
      className="px-4 py-2 rounded-xl bg-card border-2 border-muted text-sm font-bold hover:border-orange-500 hover:text-orange-500 transition-all shadow-sm"
    >
      {label}
    </button>
  );
}
