
"use client";

import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  ShieldCheck, 
  Calendar, 
  BrainCircuit, 
  Sparkles,
  Gavel,
  Scale,
  ArrowRight,
  Zap,
  Lock,
  Globe
} from "lucide-react";
import { PlaceHolderImages } from "@/lib/placeholder-images";

export default function CosmicHome() {
  const heroImg = PlaceHolderImages.find(img => img.id === "hero-bg");

  return (
    <div className="flex flex-col overflow-hidden">
      {/* Epic Hero Section */}
      <section className="relative min-h-screen flex items-center pt-24 overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[120%] bg-[radial-gradient(circle_at_center,rgba(90,50,255,0.1),transparent_70%)] -z-10" />
        
        <div className="container mx-auto px-4 grid lg:grid-cols-2 gap-20 items-center">
          <div className="space-y-10 text-right animate-in slide-in-from-right-20 duration-1000">
            <Badge className="px-6 py-2 rounded-full bg-accent/20 text-accent border-accent/40 font-bold tracking-widest uppercase">
              <Zap className="h-4 w-4 ml-2 animate-pulse" />
              أفق جديد للعدالة الرقمية
            </Badge>
            <h1 className="text-6xl lg:text-8xl font-black leading-[1.1] text-primary tracking-tighter">
              المستقبل <br />
              <span className="text-transparent bg-clip-text cosmic-gradient">
                قانوني وذكي
              </span>
            </h1>
            <p className="text-2xl text-muted-foreground max-w-xl leading-relaxed font-medium">
              تخطى حدود المحاماة التقليدية. اكتشف المنصة التي تدمج الذكاء الكوني مع الخبرة البشرية لتمنحك حماية غير مسبوقة.
            </p>
            <div className="flex flex-wrap gap-6 justify-end pt-4">
              <Link href="/auth/signup">
                <Button size="lg" className="rounded-[2rem] h-20 px-12 text-2xl font-black cosmic-gradient shadow-2xl shadow-primary/30 hover:scale-110 transition-transform">
                  ابدأ رحلتك الآن
                </Button>
              </Link>
              <Link href="/bot">
                <Button size="lg" variant="outline" className="rounded-[2rem] h-20 px-12 text-2xl font-bold border-4 hover:bg-accent/10">
                  تحدث مع البوت
                </Button>
              </Link>
            </div>
            
            <div className="flex items-center gap-10 justify-end pt-12">
              <div className="text-center group cursor-pointer">
                <Globe className="h-8 w-8 mx-auto text-accent mb-2 group-hover:rotate-180 transition-transform duration-1000" />
                <p className="text-3xl font-black">24/7</p>
                <p className="text-xs font-bold opacity-60">تغطية عالمية</p>
              </div>
              <div className="w-px h-16 bg-border" />
              <div className="text-center group cursor-pointer">
                <Lock className="h-8 w-8 mx-auto text-accent mb-2 group-hover:scale-125 transition-transform" />
                <p className="text-3xl font-black">100%</p>
                <p className="text-xs font-bold opacity-60">خصوصية مطلقة</p>
              </div>
            </div>
          </div>

          <div className="relative group perspective-1000">
            <div className="absolute -inset-20 bg-primary/20 rounded-full blur-[150px] group-hover:bg-accent/20 transition-colors duration-1000" />
            <div className="relative glass-cosmic p-6 rounded-[3rem] shadow-[0_0_100px_rgba(0,0,0,0.2)] rotate-3 group-hover:rotate-0 transition-all duration-1000">
              <div className="absolute -top-10 -left-10 glass-cosmic p-8 rounded-[2rem] animate-bounce [animation-duration:5s]">
                <Scale className="h-12 w-12 text-accent" />
              </div>
              <div className="absolute -bottom-10 -right-10 glass-cosmic p-8 rounded-[2rem] animate-bounce [animation-duration:4s] [animation-delay:1s]">
                <Gavel className="h-12 w-12 text-primary" />
              </div>
              <Image 
                src={heroImg?.imageUrl || ""} 
                alt="Legal Nebula" 
                width={800} 
                height={600}
                className="rounded-[2.5rem] object-cover shadow-2xl"
                priority
              />
            </div>
          </div>
        </div>
      </section>

      {/* Galaxy Features */}
      <section className="py-40 bg-muted/20 relative">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-4xl mx-auto mb-24 space-y-6">
            <h2 className="text-5xl font-black text-primary">قدرات كوكبية بين يديك</h2>
            <p className="text-xl text-muted-foreground font-bold italic">نظام متكامل يغير مفهوم الاستشارة القانونية للأبد.</p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-12">
            <CosmicFeature 
              icon={<ShieldCheck className="h-12 w-12 text-white" />}
              title="دفاع فائق"
              desc="أنظمة حماية متقدمة تضمن أن تظل أسرارك القانونية مدفونة في أعماق التشفير الرقمي."
            />
            <CosmicFeature 
              icon={<BrainCircuit className="h-12 w-12 text-white" />}
              title="نواة Gemini"
              desc="نستخدم أقوى نماذج الذكاء الاصطناعي لتحليل كل ثغرة وكل مادة قانونية بدقة مذهلة."
            />
            <CosmicFeature 
              icon={<Sparkles className="h-12 w-12 text-white" />}
              title="توقعات دقيقة"
              desc="بناءً على آلاف القضايا، يتوقع نظامنا نتائج نزاعاتك القانونية بنسبة نجاح تفوق الخبراء."
            />
          </div>
        </div>
      </section>
    </div>
  );
}

function CosmicFeature({ icon, title, desc }: any) {
  return (
    <div className="glass-cosmic p-12 rounded-[3rem] hover:-translate-y-6 transition-all duration-700 border-none group cursor-pointer">
      <div className="w-24 h-24 cosmic-gradient rounded-[2rem] flex items-center justify-center mb-8 shadow-2xl group-hover:rotate-12 transition-transform">
        {icon}
      </div>
      <h3 className="text-3xl font-black text-primary mb-6">{title}</h3>
      <p className="text-lg text-muted-foreground leading-relaxed font-medium">
        {desc}
      </p>
    </div>
  );
}
