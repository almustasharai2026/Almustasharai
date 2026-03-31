
'use client';

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Send, Loader2, Sparkles, Plus, 
  Camera, FileText, Zap, Mic
} from "lucide-react";
import SovereignLayout from "@/components/SovereignLayout";
import { useUser, useFirestore, useCollection, useMemoFirebase } from "@/firebase";
import { useToast } from "@/hooks/use-toast";
import { collection, query, orderBy, limit, addDoc, serverTimestamp } from "firebase/firestore";

export default function BotPage() {
  const { user, profile } = useUser();
  const db = useFirestore();
  const { toast } = useToast();
  
  const [inputText, setInputText] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

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
        body: JSON.stringify({ prompt: text, persona: "المستشار السيادي" })
      });
      const data = await res.json();

      await addDoc(collection(db, "users", user.uid, "chatHistory"), {
        role: "ai",
        text: data.response,
        timestamp: serverTimestamp()
      });
    } catch (e) {
      toast({ variant: "destructive", title: "فشل الإرسال" });
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <SovereignLayout activeId="bot">
      <div className="flex flex-col h-full relative">
        
        {/* Messages */}
        <div ref={scrollRef} className="flex-1 overflow-y-auto space-y-8 pb-48 pt-4 scrollbar-none">
          <AnimatePresence mode="popLayout">
            {cloudMessages?.length === 0 && (
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center py-20 space-y-6">
                <div className="w-20 h-20 bg-primary/10 rounded-[2.5rem] mx-auto flex items-center justify-center border border-primary/20">
                   <Sparkles size={40} className="text-primary" />
                </div>
                <p className="text-2xl font-black text-white italic">جاهز لخدمتك سيادياً..</p>
              </motion.div>
            )}
            
            {cloudMessages?.map((m) => (
              <motion.div 
                key={m.id} 
                initial={{ opacity: 0, y: 10 }} 
                animate={{ opacity: 1, y: 0 }} 
                className={`p-6 rounded-[2.2rem] max-w-[95%] text-sm ${
                  m.role === 'user' ? 'bg-[#252525] text-white self-end mr-auto rounded-tr-none' : 'bg-transparent text-zinc-300 self-start border border-white/5'
                }`}
              >
                {m.text}
              </motion.div>
            ))}
          </AnimatePresence>
          
          {isTyping && (
            <div className="flex gap-1.5 px-4">
              <div className="w-1.5 h-1.5 bg-primary rounded-full animate-bounce" />
              <div className="w-1.5 h-1.5 bg-primary rounded-full animate-bounce delay-100" />
              <div className="w-1.5 h-1.5 bg-primary rounded-full animate-bounce delay-200" />
            </div>
          )}
        </div>

        {/* Enlarged Sovereign Command Bar */}
        <div className="absolute bottom-20 inset-x-0 z-40 px-2">
          <div className="bg-[#252525] rounded-[3.5rem] p-4 flex flex-col gap-4 border border-white/5 shadow-3xl">
            
            {/* Quick Multi-Action Tools */}
            <div className="flex gap-2">
               <button className="flex-1 h-14 bg-black/40 rounded-2xl flex items-center justify-center gap-3 text-zinc-500 hover:text-primary transition-all border border-white/5 group">
                  <Camera size={20} />
                  <span className="text-[9px] font-black uppercase tracking-widest hidden sm:inline">Scan Doc</span>
               </button>
               <button className="flex-1 h-14 bg-black/40 rounded-2xl flex items-center justify-center gap-3 text-zinc-500 hover:text-emerald-500 transition-all border border-white/5">
                  <FileText size={20} />
                  <span className="text-[9px] font-black uppercase tracking-widest hidden sm:inline">Vault</span>
               </button>
               <button className="w-14 h-14 bg-black/40 rounded-2xl flex items-center justify-center text-zinc-500 hover:text-red-500 transition-all border border-white/5">
                  <Mic size={20} />
               </button>
            </div>

            {/* Main Spacious Input */}
            <div className="relative flex items-center gap-2">
              <input 
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                placeholder="اطلب استشارة سيادية.." 
                className="flex-1 h-16 bg-black/20 rounded-[2rem] px-6 text-base font-bold text-white placeholder:text-zinc-700 outline-none border border-transparent focus:border-primary/20"
              />
              <button 
                onClick={handleSend}
                disabled={!inputText.trim() || isTyping}
                className={`w-16 h-16 rounded-full flex items-center justify-center transition-all ${
                  inputText.trim() ? 'bg-primary text-black shadow-lg shadow-primary/20' : 'bg-zinc-800 text-zinc-600'
                }`}
              >
                {isTyping ? <Loader2 className="animate-spin" size={24} /> : <Send size={24} className="rotate-180" />}
              </button>
            </div>
          </div>
        </div>

      </div>
    </SovereignLayout>
  );
}
