
'use client';

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Send, Loader2, Sparkles, Plus, 
  Camera, FileText, Mic, X, Paperclip
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
  const [isToolsOpen, setIsToolsOpen] = useState(false);
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
    setIsToolsOpen(false);

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
        
        {/* Messages Flow */}
        <div ref={scrollRef} className="flex-1 overflow-y-auto space-y-8 pb-40 pt-4 scrollbar-none">
          <AnimatePresence mode="popLayout">
            {cloudMessages?.length === 0 && (
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center py-20 space-y-6">
                <div className="w-16 h-16 bg-primary/10 rounded-3xl mx-auto flex items-center justify-center border border-primary/20">
                   <Sparkles size={32} className="text-primary" />
                </div>
                <p className="text-xl font-black text-white/40 italic">ابدأ استشارتك السيادية..</p>
              </motion.div>
            )}
            
            {cloudMessages?.map((m) => (
              <motion.div 
                key={m.id} 
                initial={{ opacity: 0, y: 10 }} 
                animate={{ opacity: 1, y: 0 }} 
                className={`p-6 rounded-[2.2rem] max-w-[90%] text-sm leading-relaxed ${
                  m.role === 'user' ? 'bg-[#252525] text-white self-end mr-auto rounded-tr-none' : 'bg-transparent text-zinc-300 self-start border border-white/5'
                }`}
              >
                {m.text}
              </motion.div>
            ))}
          </AnimatePresence>
          
          {isTyping && (
            <div className="flex gap-1.5 px-4 opacity-40">
              <div className="w-1 h-1 bg-primary rounded-full animate-bounce" />
              <div className="w-1 h-1 bg-primary rounded-full animate-bounce delay-100" />
              <div className="w-1 h-1 bg-primary rounded-full animate-bounce delay-200" />
            </div>
          )}
        </div>

        {/* Unified Action Capsule */}
        <div className="absolute bottom-20 inset-x-0 z-40 px-2">
          <div className="relative">
            <AnimatePresence>
              {isToolsOpen && (
                <motion.div 
                  initial={{ opacity: 0, y: 20, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 20, scale: 0.95 }}
                  className="absolute bottom-full mb-4 inset-x-0 bg-[#252525] rounded-[2.5rem] p-2 flex justify-around items-center border border-white/5 shadow-3xl backdrop-blur-3xl"
                >
                  <ToolIcon icon={<Camera size={20}/>} label="Scan" />
                  <ToolIcon icon={<FileText size={20}/>} label="Vault" />
                  <ToolIcon icon={<Mic size={20}/>} label="Voice" />
                  <ToolIcon icon={<Paperclip size={20}/>} label="Attach" />
                </motion.div>
              )}
            </AnimatePresence>

            <div className="bg-[#252525] rounded-[3rem] p-2 flex items-center gap-2 border border-white/5 shadow-2xl">
              <button 
                onClick={() => setIsToolsOpen(!isToolsOpen)}
                className={`w-14 h-14 rounded-full flex items-center justify-center transition-all ${isToolsOpen ? 'bg-zinc-800 text-primary rotate-45' : 'bg-black/20 text-zinc-500'}`}
              >
                {isToolsOpen ? <X size={24} /> : <Plus size={24} />}
              </button>

              <input 
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                placeholder="اطلب حلاً قانونياً.." 
                className="flex-1 bg-transparent border-none outline-none px-4 text-sm font-bold text-white placeholder:text-zinc-700"
              />

              <button 
                onClick={handleSend}
                disabled={!inputText.trim() || isTyping}
                className={`w-14 h-14 rounded-full flex items-center justify-center transition-all ${
                  inputText.trim() ? 'bg-primary text-black shadow-lg' : 'bg-zinc-800 text-zinc-600'
                }`}
              >
                {isTyping ? <Loader2 className="animate-spin" size={20} /> : <Send size={20} className="rotate-180" />}
              </button>
            </div>
          </div>
        </div>

      </div>
    </SovereignLayout>
  );
}

function ToolIcon({ icon, label }: any) {
  return (
    <button className="flex flex-col items-center gap-1.5 p-4 text-zinc-500 hover:text-primary transition-all group">
      <div className="group-hover:scale-110 transition-transform">{icon}</div>
      <span className="text-[8px] font-black uppercase tracking-widest opacity-40">{label}</span>
    </button>
  );
}
