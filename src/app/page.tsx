"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { 
  Plus, ArrowUp, Sparkles, Scale, ChevronRight, Loader2, Rocket, Zap, Gavel, MessageSquare
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useUser, useFirestore, useCollection } from "@/firebase";
import { collection, query, orderBy, limit } from "firebase/firestore";
import { useMemoFirebase } from "@/firebase/provider";
import Image from "next/image";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";

/**
 * الواجهة الرئيسية المحدثة لكوكب المستشار.
 * تعكس الهوية السيادية والمميزات التقنية المتقدمة.
 */
export default function SovereignLandingPage() {
  const { user, isUserLoading } = useUser();
  const db = useFirestore();
  const [activeTab, setActiveTab] = useState("my-projects");
  const [prompt, setInput] = useState("");

  const sessionsQuery = useMemoFirebase(() => {
    if (!user || !db) return null;
    return query(
      collection(db, "users", user.uid, "chatSessions"), 
      orderBy("lastMessageAt", "desc"),
      limit(6)
    );
  }, [db, user]);
  
  const { data: recentSessions, isLoading: sessionsLoading } = useCollection(sessionsQuery);

  return (
    <div className="min-h-screen bg-[#02040a] text-white selection:bg-indigo-500/30 font-sans" dir="rtl">
      {/* Sovereign Synchronization Bar */}
      {isUserLoading && (
        <div className="fixed top-0 left-0 w-full h-1 bg-primary/20 z-[200]">
          <div className="h-full bg-primary animate-pulse" style={{ width: '30%' }} />
        </div>
      )}

      {/* Cosmic Background Ambiance */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[-10%] left-1/2 -translate-x-1/2 w-full max-w-4xl h-[500px] bg-indigo-600/10 blur-[150px] rounded-full" />
        <div className="absolute bottom-[-10%] right-0 w-[400px] h-[400px] bg-amber-500/5 blur-[120px] rounded-full" />
      </div>

      <div className="relative z-10 max-w-6xl mx-auto px-6 pt-40 pb-32">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center space-y-10 mb-32"
        >
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full glass border-white/5 text-[9px] font-black uppercase tracking-[0.3em] text-indigo-400 mb-4">
            <Sparkles className="h-3.5 w-3.5 animate-pulse" /> AI Sovereign Power v4.5
          </div>
          
          <div className="space-y-4">
            <h1 className="text-6xl md:text-8xl font-black tracking-tight leading-none text-white">
              المستشار <span className="text-gradient">AI</span>
            </h1>
            <p className="text-2xl md:text-3xl text-white/40 font-bold tracking-tight">
              استشارة ذكية في ثواني
            </p>
          </div>

          {/* Sovereign Features Section */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto mt-16">
            <FeatureCard 
              icon={<Zap className="h-6 w-6 text-amber-400" />} 
              title="تحليل ذكي" 
              desc="معالجة فورية لكافة المعطيات القانونية والمالية."
            />
            <FeatureCard 
              icon={<Gavel className="h-6 w-6 text-indigo-400" />} 
              title="مستشارين متخصصين" 
              desc="نخبة من الخبراء السياديين في كافة المجالات."
            />
            <FeatureCard 
              icon={<MessageSquare className="h-6 w-6 text-emerald-400" />} 
              title="جلسات مباشرة" 
              desc="اتصال فيديو مشفر وآمن لاتخاذ القرار النهائي."
            />
          </div>

          <div className="flex flex-col items-center gap-8 mt-20">
            {/* Supreme CTA Button */}
            <Link href="/auth/signup" className="w-full max-w-md group">
              <Button 
                style={{
                  background: "linear-gradient(135deg, #00C896, #0A192F)",
                }}
                className="w-full h-20 rounded-[1.5rem] text-white font-black text-2xl shadow-[0_20px_50px_rgba(0,200,150,0.2)] border-none transition-all hover:scale-[1.05] active:scale-95 flex items-center justify-center gap-4"
              >
                <Rocket className="h-7 w-7 group-hover:translate-x-1 transition-transform" /> 
                ابدأ أول استشارة الآن
              </Button>
            </Link>

            <div className="w-full max-w-3xl relative mt-8">
              <div className="relative glass-cosmic rounded-[2.5rem] border-white/10 p-2.5 flex items-center gap-3 shadow-[0_30px_100px_rgba(0,0,0,0.5)] transition-all focus-within:border-primary/30">
                <Button variant="ghost" size="icon" className="h-12 w-12 rounded-2xl text-white/20 hover:text-white">
                  <Plus className="h-6 w-6" />
                </Button>
                
                <input 
                  value={prompt}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="اطرح سؤالك القانوني أو المالي هنا..."
                  className="flex-1 bg-transparent border-none focus:ring-0 text-lg md:text-xl font-medium p-4 placeholder:text-white/10 text-white text-right"
                />

                <div className="flex items-center gap-1.5 ml-2">
                  <Link href={`/bot?q=${encodeURIComponent(prompt)}`}>
                    <Button className="h-14 w-14 rounded-[1.8rem] bg-white text-black hover:bg-indigo-50 shadow-2xl transition-transform hover:scale-105 active:scale-95">
                      <ArrowUp className="h-7 w-7" />
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* User Activity Section */}
        <section className="space-y-12">
          <div className="flex items-center justify-between border-b border-white/5 pb-6">
            <div className="flex items-center gap-3">
              <TabButton active={activeTab === "my-projects"} onClick={() => setActiveTab("my-projects")} label="سجل الاستشارات" />
              <TabButton active={activeTab === "templates"} onClick={() => setActiveTab("templates")} label="المكتبة السيادية" />
            </div>
            <Link href="/bot" className="text-[10px] font-black text-primary uppercase tracking-widest hover:underline">
              عرض كافة السجلات
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
            <AnimatePresence mode="popLayout">
              {activeTab === "my-projects" && (
                <motion.div 
                  key="projects-container" 
                  initial={{ opacity: 0 }} 
                  animate={{ opacity: 1 }} 
                  exit={{ opacity: 0 }}
                  className="col-span-full grid grid-cols-1 md:grid-cols-2 gap-10 w-full"
                >
                  {recentSessions && recentSessions.length > 0 ? (
                    recentSessions.map((session, i) => (
                      <motion.div 
                        key={session.id} 
                        initial={{ opacity: 0, y: 20 }} 
                        animate={{ opacity: 1, y: 0 }} 
                        transition={{ delay: i * 0.1 }}
                      >
                        <CardProject session={session} />
                      </motion.div>
                    ))
                  ) : (
                    <div className="col-span-full py-32 text-center space-y-8 glass-card rounded-[4rem] border-dashed border-white/10">
                       <Scale className="h-20 w-20 text-white/5 mx-auto" />
                       <div className="space-y-2">
                          <p className="text-3xl font-black text-white/20">
                            {user ? (sessionsLoading ? "جاري مزامنة السجلات..." : "لا توجد استشارات نشطة") : "انتظار تسجيل الهوية"}
                          </p>
                          <p className="text-white/10 font-bold">ابدأ رحلتك القانونية الأولى الآن عبر محرك القرار.</p>
                       </div>
                       {user && sessionsLoading && <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary opacity-20" />}
                       <Link href="/bot">
                         <Button variant="outline" className="rounded-2xl border-white/10 font-black h-14 px-12 hover:bg-white/5 transition-all">ابدأ استشارة جديدة</Button>
                       </Link>
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </section>
      </div>
    </div>
  );
}

function FeatureCard({ icon, title, desc }: any) {
  return (
    <div className="p-8 glass-card rounded-[2.5rem] border-white/5 text-right space-y-4 hover:bg-white/5 transition-all group">
      <div className="h-12 w-12 rounded-xl bg-white/5 flex items-center justify-center group-hover:scale-110 transition-transform">
        {icon}
      </div>
      <h3 className="text-xl font-black text-white">{title}</h3>
      <p className="text-xs text-white/30 font-bold leading-relaxed">{desc}</p>
    </div>
  );
}

function TabButton({ active, onClick, label }: any) {
  return (
    <button 
      onClick={onClick} 
      className={`px-8 py-3 rounded-2xl text-xs font-black transition-all border ${
        active 
          ? 'bg-indigo-600 text-white border-indigo-500 shadow-2xl shadow-indigo-600/20' 
          : 'bg-white/5 text-white/30 border-white/5 hover:text-white hover:bg-white/10'
      }`}
    >
      {label}
    </button>
  );
}

function CardProject({ session }: any) {
  return (
    <div className="group relative flex flex-col gap-5 p-2 rounded-[3rem] glass-card transition-all cursor-pointer overflow-hidden bg-slate-950/40">
      <div className="relative aspect-video rounded-[2.8rem] overflow-hidden bg-slate-900 border border-white/5 shadow-inner">
        <Image 
          src={`https://picsum.photos/seed/${session.id}/1200/675`} 
          alt="Preview" 
          fill 
          className="object-cover opacity-30 group-hover:opacity-50 transition-all duration-1000 grayscale group-hover:grayscale-0 group-hover:scale-110" 
          data-ai-hint="legal consultation preview"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#02040a] via-transparent to-transparent opacity-80" />
        <div className="absolute bottom-8 right-8 left-8 flex justify-between items-end">
           <div className="space-y-1">
              <Badge className="bg-primary/10 text-primary border-none text-[8px] font-black uppercase mb-2">Sovereign Case</Badge>
              <h3 className="text-2xl font-black text-white truncate max-w-[300px] tracking-tighter">{session.title || "استشارة سيادية"}</h3>
           </div>
           <div className="bg-black/40 backdrop-blur-md border border-white/10 text-[9px] font-black py-2 px-5 rounded-full text-white/60 tabular-nums">
             {session.lastMessageAt ? new Date(session.lastMessageAt).toLocaleDateString('ar-EG') : "Active"}
           </div>
        </div>
      </div>
    </div>
  );
}
