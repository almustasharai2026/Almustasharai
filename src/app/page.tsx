"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Sparkles, Send, Zap, Gavel, MessageSquare, ArrowRight } from "lucide-react";
import { motion } from "framer-motion";

export default function SovereignLandingPage() {
  const [prompt, setPrompt] = useState("");

  return (
    <div className="min-h-screen bg-background text-foreground font-sans overflow-hidden" dir="rtl">
      {/* Background Glows */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-[-10%] left-1/2 -translate-x-1/2 w-full max-w-4xl h-[500px] bg-accent/5 blur-[150px] rounded-full" />
      </div>

      <div className="relative z-10 max-w-6xl mx-auto px-6 pt-40 pb-32">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center space-y-10 mb-32"
        >
          <div className="sovereign-badge mb-4">
            <Sparkles className="h-3.5 w-3.5 animate-pulse" /> AI Sovereign Power v4.5
          </div>
          
          <div className="space-y-4">
            <h1 className="text-6xl md:text-8xl font-black tracking-tight leading-none">
              المستشار <span className="text-gradient">AI</span>
            </h1>
            <p className="text-2xl md:text-3xl text-muted-foreground font-bold tracking-tight">
              استشارة ذكية في ثواني
            </p>
          </div>

          {/* Sovereign Input Engine */}
          <div className="w-full max-w-3xl mx-auto mt-12 px-4">
            <div className="glass-cosmic p-2.5 rounded-[2.5rem] border-white/10 shadow-3xl flex flex-col md:flex-row items-center gap-3 focus-within:border-accent/40 transition-all">
              <input 
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="اطرح سؤالك القانوني أو المالي هنا..."
                className="w-full md:flex-1 bg-transparent border-none focus:ring-0 text-xl font-medium p-5 placeholder:text-white/20 text-white text-right outline-none"
              />
              <Link href={`/bot?q=${encodeURIComponent(prompt)}`} className="w-full md:w-auto">
                <Button 
                  disabled={!prompt.trim()}
                  className="w-full md:w-auto h-16 md:h-14 px-10 rounded-[1.8rem] bg-accent text-primary font-black text-lg border-none shadow-2xl transition-all hover:scale-105 active:scale-95 gap-3"
                >
                  إرسال <Send className="h-5 w-5 rotate-180" />
                </Button>
              </Link>
            </div>
          </div>

          {/* Features */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto mt-24">
            <FeatureCard icon={<Zap className="h-6 w-6 text-accent" />} title="تحليل ذكي" desc="معالجة فورية لكافة المعطيات السيادية." />
            <FeatureCard icon={<Gavel className="h-6 w-6 text-accent" />} title="مستشارين متخصصين" desc="نخبة من الخبراء القانونيين المعتمدين." />
            <FeatureCard icon={<MessageSquare className="h-6 w-6 text-accent" />} title="جلسات مباشرة" desc="اتصال فيديو مشفر وآمن بين المواطن والخبير." />
          </div>

          <div className="mt-20">
            <Link href="/auth/signup">
              <Button 
                className="px-16 h-20 rounded-[1.5rem] bg-accent text-primary font-black text-2xl shadow-2xl transition-all hover:scale-105 active:scale-95 flex gap-4"
              >
                ابدأ أول استشارة الآن <ArrowRight className="h-6 w-6 rotate-180" />
              </Button>
            </Link>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

function FeatureCard({ icon, title, desc }: any) {
  return (
    <div className="p-8 glass-card rounded-[2.5rem] border-white/5 text-right space-y-4 hover:bg-white/5 transition-all">
      <div className="h-12 w-12 rounded-xl bg-accent/10 flex items-center justify-center border border-accent/20">
        {icon}
      </div>
      <h3 className="text-xl font-black text-white">{title}</h3>
      <p className="text-xs text-muted-foreground font-bold leading-relaxed">{desc}</p>
    </div>
  );
}