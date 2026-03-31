
'use client';

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Mic, Send, Loader2, Sparkles, Plus, Paperclip, 
  Camera, Zap, Volume2
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
  const [isRecording, setIsRecording] = useState(false);
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
        
        {/* Chat History */}
        <div ref={scrollRef} className="flex-1 overflow-y-auto space-y-8 pb-32 pt-4 scrollbar-none">
          <AnimatePresence mode="popLayout">
            {cloudMessages?.length === 0 && (
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center py-20 space-y-6">
                <div className="w-20 h-20 bg-primary/10 rounded-[2rem] mx-auto flex items-center justify-center border border-primary/20">
                   <Sparkles size={40} className="text-primary" />
                </div>
                <p className="text-2xl font-black text-white">كيف أساعدك اليوم؟</p>
              </motion.div>
            )}
            
            {cloudMessages?.map((m) => (
              <motion.div 
                key={m.id} 
                initial={{ opacity: 0, y: 10 }} 
                animate={{ opacity: 1, y: 0 }} 
                className={`p-6 rounded-[2.5rem] max-w-[90%] text-sm ${
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

        {/* Simplified Input Area */}
        <div className="absolute bottom-32 inset-x-0 z-40">
          <div className="bg-[#252525] rounded-[3.5rem] p-3 flex items-center gap-2 border border-white/5 shadow-3xl">
            <input type="file" ref={fileInputRef} className="hidden" />
            
            {/* Floating Scan Lens Trigger */}
            <button 
              onClick={() => toast({title: "جاري تفعيل العدسة.."})}
              className="w-12 h-12 rounded-2xl bg-black/40 flex items-center justify-center text-primary hover:bg-black/60 transition-all shadow-inner"
            >
              <Camera size={20} />
            </button>

            <input 
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              placeholder="اكتب استفسارك.." 
              className="flex-1 bg-transparent border-none outline-none px-4 text-sm font-bold text-white placeholder:text-zinc-700"
            />

            <button 
              onClick={handleSend}
              disabled={!inputText.trim() || isTyping}
              className={`w-14 h-14 rounded-full flex items-center justify-center transition-all ${
                inputText.trim() ? 'bg-primary text-black' : 'bg-zinc-800 text-zinc-600'
              }`}
            >
              <Send size={20} className="rotate-180" />
            </button>
          </div>
        </div>

      </div>
    </SovereignLayout>
  );
}
