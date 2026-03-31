
'use client';

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Send, Scale, Sparkles, Mic, Camera, Paperclip, 
  History, Volume2, Loader2, BrainCircuit, Book, FileText, UserCheck
} from "lucide-react";
import SovereignLayout from "@/components/SovereignLayout";
import { useUser, useFirestore, useCollection, useMemoFirebase } from "@/firebase";
import { useToast } from "@/hooks/use-toast";
import { collection, query, orderBy, limit, addDoc, serverTimestamp } from "firebase/firestore";
import Image from "next/image";

export default function SmartConsultantPage() {
  const { user, profile, role } = useUser();
  const db = useFirestore();
  const { toast } = useToast();
  
  const [inputText, setInputText] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  const chatQuery = useMemoFirebase(() => {
    if (!db || !user) return null;
    return query(collection(db, "users", user.uid, "chatHistory"), orderBy("timestamp", "asc"), limit(50));
  }, [db, user]);
  const { data: cloudMessages } = useCollection(chatQuery);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
    }
  }, [cloudMessages, isTyping]);

  const handleSend = async () => {
    const text = inputText.trim();
    if (!text || isTyping || !db || !user) return;
    
    setInputText("");
    setIsTyping(true);

    try {
      await addDoc(collection(db, "users", user.uid, "chatHistory"), {
        role: "user",
        text,
        timestamp: serverTimestamp()
      });

      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: text, persona: "المستشار الذكي" })
      });
      const data = await res.json();

      await addDoc(collection(db, "users", user.uid, "chatHistory"), {
        role: "ai",
        text: data.response,
        timestamp: serverTimestamp()
      });
    } catch (e) {
      toast({ variant: "destructive", title: "فشل المحرك السيادي" });
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <SovereignLayout activeId="bot">
      <div className="grid grid-cols-12 gap-8 h-full">
        
        {/* 1. Main Chat Glass Workspace */}
        <div className="col-span-12 lg:col-span-8 glass-cosmic rounded-[3rem] p-10 flex flex-col min-h-[700px] relative overflow-hidden shadow-3xl">
          <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/5 blur-[100px] -z-10" />
          
          {/* Message Area */}
          <div ref={scrollRef} className="flex-1 overflow-y-auto space-y-10 pb-10 scrollbar-none">
            <AnimatePresence mode="popLayout">
              {cloudMessages?.length === 0 && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="h-full flex flex-col justify-center items-center opacity-30 text-center space-y-6">
                  <Sparkles size={80} className="text-emerald-500 animate-pulse" />
                  <p className="text-2xl font-light italic tracking-widest">مرحباً بك في مستقبل المحاماة الرقمية..</p>
                </motion.div>
              )}
              {cloudMessages?.map((m) => (
                <motion.div key={m.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className={`flex ${m.role === 'user' ? 'justify-start' : 'justify-end'}`}>
                  <div className={`p-6 rounded-[2rem] max-w-[85%] text-lg leading-relaxed shadow-xl border ${
                    m.role === 'user' ? 'bg-white text-black font-bold rounded-tr-none' : 'bg-black/40 text-emerald-400 border-emerald-500/20 rounded-tl-none font-medium'
                  }`}>
                    {m.text}
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
            {isTyping && <div className="text-[10px] font-black uppercase text-emerald-500 animate-pulse tracking-[0.4em]">Processing Sovereignty...</div>}
          </div>

          {/* Cinematic Input bar */}
          <div className="mt-auto relative group">
            <div className="absolute inset-0 bg-emerald-500/10 blur-3xl group-focus-within:opacity-100 opacity-0 transition-opacity duration-1000" />
            <div className="relative bg-black/60 border border-white/10 p-3 rounded-[2.5rem] flex items-center gap-3 shadow-2xl">
               <button className="p-4 hover:bg-white/5 rounded-full text-zinc-500 transition-colors"><Mic size={24}/></button>
               <input 
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                placeholder="تحدث مع المستشار.." 
                className="flex-1 bg-transparent py-4 px-2 outline-none text-xl font-bold text-white placeholder:text-white/10" 
               />
               <button 
                onClick={handleSend}
                disabled={!inputText.trim() || isTyping}
                className="bg-emerald-500 text-black px-10 py-4 rounded-[1.8rem] font-black hover:scale-105 active:scale-95 transition-all shadow-xl shadow-emerald-500/20 disabled:opacity-20"
               >
                {isTyping ? <Loader2 className="animate-spin" /> : "إرسال"}
               </button>
            </div>
          </div>
        </div>

        {/* 2. Side Services Cards */}
        <div className="col-span-12 lg:col-span-4 space-y-6">
           <ServiceCard title="صياغة العقود" icon={<FileText />} desc="توليد مستندات قانونية فورية بذكاء اصطناعي" color="blue" />
           <ServiceCard title="المكتبة الرقمية" icon={<Book />} desc="تصفح القوانين المصرية المحدثة 2026" color="emerald" />
           <ServiceCard title="تحدث مع خبير" icon={<UserCheck />} desc="اتصال فيديو مباشر مع أفضل المحامين" color="purple" />
           
           {/* History Preview Card */}
           <div className="glass-cosmic rounded-[2.5rem] p-8 space-y-6">
              <h4 className="font-black text-sm uppercase tracking-widest text-zinc-500 flex items-center gap-3">
                <History size={16} /> السجل السيادي
              </h4>
              <div className="space-y-4">
                {cloudMessages?.slice(-3).map(m => (
                  <div key={m.id} className="p-4 bg-white/5 rounded-2xl border border-white/5 text-[10px] font-bold text-zinc-400 truncate">
                    {m.text}
                  </div>
                ))}
              </div>
           </div>
        </div>

      </div>
    </SovereignLayout>
  );
}

function ServiceCard({ title, icon, desc, color }: any) {
  const colors: any = {
    blue: "text-blue-400 bg-blue-500/5 hover:border-blue-500/30",
    emerald: "text-emerald-400 bg-emerald-500/5 hover:border-emerald-500/30",
    purple: "text-purple-400 bg-purple-500/5 hover:border-purple-500/30"
  }
  return (
    <div className={`p-8 glass-cosmic rounded-[2.5rem] space-y-4 transition-all duration-500 hover:scale-[1.02] cursor-pointer group ${colors[color]}`}>
      <div className="w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center group-hover:scale-110 transition-transform">
        {icon}
      </div>
      <h3 className="text-xl font-black text-white">{title}</h3>
      <p className="text-xs text-zinc-500 font-bold leading-relaxed">{desc}</p>
    </div>
  );
}
