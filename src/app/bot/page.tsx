'use client';

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Send, Loader2, Sparkles, Plus, 
  Camera, FileText, Mic, X, Users, Scale
} from "lucide-react";
import SovereignLayout from "@/components/SovereignLayout";
import { useUser, useFirestore, useCollection, useMemoFirebase } from "@/firebase";
import { useToast } from "@/hooks/use-toast";
import { collection, query, orderBy, limit, addDoc, serverTimestamp } from "firebase/firestore";
import Link from "next/link";

/**
 * مركز قيادة البوت السيادي (The AI Node - Expanded).
 * تم التحسين لشغل كامل عرض الشاشة مع الحفاظ على تمركز المحادثة.
 */
export default function BotPage() {
  const { user, profile } = useUser();
  const db = useFirestore();
  const { toast } = useToast();
  
  const [inputText, setInputText] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [isCapsuleOpen, setIsCapsuleOpen] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  const chatQuery = useMemoFirebase(() => {
    if (!db || !user) return null;
    return query(collection(db, "users", user.uid, "chatHistory"), orderBy("timestamp", "asc"), limit(100));
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
    setIsCapsuleOpen(false);

    try {
      await addDoc(collection(db, "users", user.uid, "chatHistory"), {
        role: "user",
        text,
        timestamp: serverTimestamp()
      });

      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: text, persona: "المستشار السيادي" })
      });
      const data = await res.json();

      await addDoc(collection(db, "users", user.uid, "chatHistory"), {
        role: "ai",
        text: data.response,
        timestamp: serverTimestamp()
      });
    } catch (e) {
      toast({ variant: "destructive", title: "فشل الإرسال السيادي" });
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <SovereignLayout activeId="bot">
      <div className="flex flex-col h-full relative max-w-5xl mx-auto w-full">
        
        {/* Deep Chat Flow - Centered but Large */}
        <div ref={scrollRef} className="flex-1 overflow-y-auto space-y-12 pb-64 pt-10 scrollbar-none px-4">
          <AnimatePresence mode="popLayout">
            {cloudMessages?.length === 0 && (
              <motion.div initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} className="text-center py-32 space-y-10">
                <div className="w-32 h-32 bg-primary/10 rounded-[3rem] mx-auto flex items-center justify-center border border-primary/20 shadow-3xl float-sovereign">
                   <Scale size={64} className="text-primary" />
                </div>
                <div className="space-y-4">
                  <h3 className="text-4xl font-black text-white tracking-tighter">أنا بانتظار أوامرك..</h3>
                  <p className="text-xl font-bold text-white/20 italic">اشرح موقفك القانوني وسأقوم بالتحليل الفوري.</p>
                </div>
              </motion.div>
            )}
            
            {cloudMessages?.map((m) => (
              <motion.div 
                key={m.id} 
                initial={{ opacity: 0, y: 20 }} 
                animate={{ opacity: 1, y: 0 }} 
                className={`p-10 rounded-[3rem] max-w-[85%] text-lg md:text-xl leading-relaxed font-bold shadow-2xl transition-all hover:scale-[1.01] ${
                  m.role === 'user' 
                    ? 'bg-[#151515] text-white self-end mr-auto rounded-tr-none border border-white/5' 
                    : 'bg-transparent text-zinc-400 self-start border border-white/5 backdrop-blur-3xl'
                }`}
              >
                {m.text}
                <p className="text-[10px] mt-4 opacity-20 uppercase font-black tracking-widest">{m.role === 'user' ? 'Citizen Request' : 'Sovereign Intelligence Output'}</p>
              </motion.div>
            ))}
          </AnimatePresence>
          
          {isTyping && (
            <div className="flex gap-3 px-8 opacity-20">
              <div className="w-2 h-2 bg-primary rounded-full animate-bounce" />
              <div className="w-2 h-2 bg-primary rounded-full animate-bounce delay-100" />
              <div className="w-2 h-2 bg-primary rounded-full animate-bounce delay-200" />
            </div>
          )}
        </div>

        {/* Unified Action Capsule - Large Pro Max Scale */}
        <div className="absolute bottom-24 inset-x-0 z-40 px-4 md:px-0">
          <div className="relative max-w-4xl mx-auto">
            {/* Expanded Action Grid */}
            <AnimatePresence>
              {isCapsuleOpen && (
                <motion.div 
                  initial={{ opacity: 0, y: 40, scale: 0.9 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 40, scale: 0.9 }}
                  className="absolute bottom-full mb-8 inset-x-0 bg-[#151515]/95 rounded-[4rem] p-10 grid grid-cols-3 gap-8 border border-white/10 shadow-[0_50px_100px_rgba(0,0,0,1)] backdrop-blur-3xl"
                >
                  <CapsuleTool icon={<Camera size={40}/>} label="Scan & Analyze" href="/bot" color="blue" />
                  <CapsuleTool icon={<FileText size={40}/>} label="Document Vault" href="/templates" color="amber" />
                  <CapsuleTool icon={<Users size={40}/>} label="Legal Experts" href="/consultants" color="violet" />
                </motion.div>
              )}
            </AnimatePresence>

            {/* Main Input Capsule (Pro Max Expansion) */}
            <div className="bg-[#151515] rounded-[4rem] p-4 flex items-center gap-4 border border-white/10 shadow-[0_30px_80px_rgba(0,0,0,0.8)]">
              <button 
                onClick={() => setIsCapsuleOpen(!isCapsuleOpen)}
                className={`w-20 h-20 rounded-full flex items-center justify-center transition-all duration-500 shadow-inner ${isCapsuleOpen ? 'bg-zinc-800 text-primary rotate-45' : 'bg-black/40 text-zinc-600 hover:text-white hover:bg-white/5'}`}
              >
                {isCapsuleOpen ? <X size={32} /> : <Plus size={32} />}
              </button>

              <input 
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                placeholder="اكتب استشارتك أو قضيتك السيادية.." 
                className="flex-1 bg-transparent border-none outline-none px-6 text-xl font-bold text-white placeholder:text-zinc-800"
              />

              <button 
                onClick={handleSend}
                disabled={!inputText.trim() || isTyping}
                className={`w-20 h-20 rounded-full flex items-center justify-center transition-all duration-500 ${
                  inputText.trim() 
                    ? 'bg-primary text-black shadow-[0_0_40px_rgba(255,87,34,0.4)] scale-110' 
                    : 'bg-[#0a0a0a] text-zinc-800 opacity-50'
                }`}
              >
                {isTyping ? <Loader2 className="animate-spin" size={32} /> : <Send size={32} className="rotate-180" />}
              </button>
            </div>
          </div>
        </div>

      </div>
    </SovereignLayout>
  );
}

function CapsuleTool({ icon, label, href, color }: any) {
  const colors: any = {
    blue: "text-blue-500 border-blue-500/10 hover:bg-blue-500/5",
    amber: "text-amber-500 border-amber-500/10 hover:bg-amber-500/5",
    violet: "text-violet-500 border-violet-500/10 hover:bg-violet-500/5"
  };
  return (
    <Link href={href}>
      <button className={`w-full flex flex-col items-center gap-6 p-8 bg-black/40 rounded-[3rem] border transition-all group ${colors[color]}`}>
        <div className="group-hover:scale-125 transition-transform duration-700">{icon}</div>
        <span className="text-[10px] font-black uppercase tracking-[0.4em] opacity-40 group-hover:opacity-100">{label}</span>
      </button>
    </Link>
  );
}
