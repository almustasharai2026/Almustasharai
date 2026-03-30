"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { 
  Plus, ArrowUp, Sparkles, Scale, ChevronRight
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useUser, useFirestore, useCollection } from "@/firebase";
import { collection, query, orderBy, limit } from "firebase/firestore";
import { useMemoFirebase } from "@/firebase/provider";
import Image from "next/image";
import { Badge } from "@/components/ui/badge";

export default function LovableInspiredPage() {
  const { user } = useUser();
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
    <div className="min-h-screen bg-[#02040a] text-white selection:bg-indigo-500/30" dir="rtl">
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="cosmic-glow top-[-10%] left-1/2 -translate-x-1/2 w-full max-w-4xl h-[500px] bg-indigo-600/20" />
      </div>

      <div className="relative z-10 max-w-6xl mx-auto px-6 pt-40 pb-32">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center space-y-12 mb-24"
        >
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full glass border-white/5 text-[10px] font-black uppercase tracking-[0.2em] text-indigo-400">
            <Sparkles className="h-3.5 w-3.5 animate-pulse" /> AI Sovereign Power
          </div>
          
          <h1 className="text-5xl md:text-7xl font-black tracking-tight leading-[1.1]">
            بوابة <span className="text-gradient">المستشار</span> الذكية
          </h1>

          <div className="max-w-3xl mx-auto relative mt-12">
            <div className="relative glass-cosmic rounded-[2.5rem] border-white/10 p-2.5 flex items-center gap-3 shadow-[0_0_50px_rgba(0,0,0,0.5)]">
              <Button variant="ghost" size="icon" className="h-12 w-12 rounded-2xl text-white/20 hover:text-white">
                <Plus className="h-6 w-6" />
              </Button>
              
              <input 
                value={prompt}
                onChange={(e) => setInput(e.target.value)}
                placeholder="ابدأ استشارة قانونية أو صياغة عقد سيادي..."
                className="flex-1 bg-transparent border-none focus:ring-0 text-lg md:text-xl font-medium p-4 placeholder:text-white/10 text-white"
              />

              <div className="flex items-center gap-1.5 ml-2">
                <Link href={`/bot?q=${encodeURIComponent(prompt)}`}>
                  <Button className="h-14 w-14 rounded-[1.8rem] bg-white text-black hover:bg-indigo-50 shadow-2xl">
                    <ArrowUp className="h-7 w-7" />
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </motion.div>

        <section className="space-y-12">
          <div className="flex items-center justify-between border-b border-white/5 pb-4">
            <div className="flex items-center gap-2">
              <TabButton active={activeTab === "my-projects"} onClick={() => setActiveTab("my-projects")} label="استشاراتي" />
              <TabButton active={activeTab === "templates"} onClick={() => setActiveTab("templates")} label="المكتبة السيادية" />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <AnimatePresence mode="wait">
              {activeTab === "my-projects" && recentSessions && recentSessions.length > 0 ? (
                recentSessions.map((session, i) => (
                  <motion.div key={session.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}>
                    <CardProject session={session} />
                  </motion.div>
                ))
              ) : activeTab === "my-projects" && !sessionsLoading && (
                <motion.div key="empty" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="col-span-full py-32 text-center space-y-6 glass-card rounded-[3rem] border-dashed border-white/10">
                   <Scale className="h-16 w-16 text-white/5 mx-auto" />
                   <p className="text-white/20 font-bold">لا يوجد سجل استشارات حتى الآن</p>
                   <Link href="/bot">
                     <Button variant="outline" className="rounded-xl border-white/10 font-bold px-8">ابدأ الآن</Button>
                   </Link>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </section>
      </div>
    </div>
  );
}

function TabButton({ active, onClick, label }: any) {
  return (
    <button onClick={onClick} className={`px-6 py-2.5 rounded-xl text-sm font-bold transition-all border ${active ? 'bg-indigo-600 text-white border-indigo-500 shadow-xl' : 'bg-white/5 text-white/40 border-white/5 hover:text-white'}`}>
      {label}
    </button>
  );
}

function CardProject({ session }: any) {
  return (
    <div className="group relative flex flex-col gap-5 p-2 rounded-[2.5rem] glass-card transition-all cursor-pointer">
      <div className="relative aspect-video rounded-[2.2rem] overflow-hidden bg-slate-900 border border-white/5">
        <Image src={`https://picsum.photos/seed/${session.id}/1200/675`} alt="Preview" fill className="object-cover opacity-40 group-hover:opacity-60 transition-all duration-700" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
        <div className="absolute bottom-6 right-6 left-6 flex justify-between items-end">
           <h3 className="text-xl font-black text-white truncate max-w-[250px]">{session.title || "استشارة بدون عنوان"}</h3>
           <Badge variant="outline" className="bg-black/40 border-white/10 text-[9px] font-bold py-1.5 px-4 rounded-full">
             {new Date(session.lastMessageAt).toLocaleDateString('ar-EG')}
           </Badge>
        </div>
      </div>
    </div>
  );
}
