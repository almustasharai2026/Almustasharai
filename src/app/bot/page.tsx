
"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Send, BrainCircuit, Sparkles, User, ShieldCheck, Cpu } from "lucide-react";
import ProtectedRoute from "@/components/ProtectedRoute";
import Image from "next/image";

interface Message {
  role: "user" | "ai";
  text: string;
  id: string;
}

/**
 * محرك المحادثة السيادي المطور.
 * واجهة تفاعلية ذكية مع شخصيات قانونية متحركة.
 */
export default function BotPage() {
  const [messages, setMessages] = useState<Message[]>([
    { 
      role: "ai", 
      text: "أهلاً بك في كوكب المستشار. أنا محركك الذكي، كيف يمكنني مساعدتك في شؤونك القانونية اليوم؟",
      id: "init"
    }
  ]);
  const [text, setText] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
    }
  }, [messages, isTyping]);

  const handleSend = () => {
    if (!text.trim() || isTyping) return;

    const userMsg: Message = { role: "user", text: text.trim(), id: Date.now().toString() };
    setMessages(prev => [...prev, userMsg]);
    setText("");
    setIsTyping(true);

    // محاكاة محرك التفكير السيادي
    setTimeout(() => {
      const aiMsg: Message = { 
        role: "ai", 
        text: "تم استلام استفسارك بنجاح. بناءً على التحليل المبدئي، نوصيك بمراجعة 'المكتبة السيادية' للحصول على مسودة عقد عمل متوافقة مع الأنظمة الجديدة. هل تود أن أقوم بتجهيز المسودة لك؟", 
        id: (Date.now() + 1).toString() 
      };
      setMessages(prev => [...prev, aiMsg]);
      setIsTyping(false);
    }, 1200);
  };

  return (
    <ProtectedRoute>
      <div className="flex flex-col h-[calc(100vh-4rem)] bg-slate-50 dark:bg-slate-950 relative overflow-hidden">
        
        {/* Sovereign Characters (Animated Background) */}
        <div className="absolute inset-0 pointer-events-none opacity-[0.03] dark:opacity-[0.05] overflow-hidden">
           <motion.div 
             animate={{ y: [0, -20, 0], rotate: [0, 5, 0] }}
             transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
             className="absolute -right-20 top-20"
           >
             <Image src="https://picsum.photos/seed/char1/400/400" width={400} height={400} alt="Character 1" data-ai-hint="legal character" />
           </motion.div>
           <motion.div 
             animate={{ y: [0, 20, 0], rotate: [0, -5, 0] }}
             transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
             className="absolute -left-20 bottom-20"
           >
             <Image src="https://picsum.photos/seed/char2/400/400" width={400} height={400} alt="Character 2" data-ai-hint="judge character" />
           </motion.div>
        </div>

        {/* Messages Area */}
        <div ref={scrollRef} className="flex-1 overflow-y-auto p-5 space-y-6 relative z-10 scrollbar-hide">
          <AnimatePresence initial={false}>
            {messages.map((m) => (
              <motion.div
                key={m.id}
                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                className={`flex flex-col ${m.role === "user" ? "items-end" : "items-start"}`}
              >
                <div className="flex items-center gap-2 mb-1 px-2">
                  <span className="text-[10px] font-black text-muted-foreground/40 uppercase tracking-widest">
                    {m.role === "user" ? "المواطن الرقمي" : "المستشار AI"}
                  </span>
                  {m.role === "ai" ? <Cpu className="h-3 w-3 text-accent" /> : <User className="h-3 w-3 text-primary" />}
                </div>
                
                <div
                  className={`p-4 rounded-2xl text-sm leading-relaxed shadow-sm max-w-[85%] ${
                    m.role === "user"
                      ? "bg-accent text-white rounded-tr-none font-bold"
                      : "bg-white dark:bg-slate-800 text-primary border border-border/50 rounded-tl-none"
                  }`}
                >
                  {m.text}
                </div>
              </motion.div>
            ))}
          </AnimatePresence>

          {isTyping && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex justify-start">
              <div className="bg-secondary/30 rounded-2xl px-4 py-3 flex gap-1.5 items-center">
                <div className="w-1.5 h-1.5 bg-accent rounded-full animate-bounce" />
                <div className="w-1.5 h-1.5 bg-accent rounded-full animate-bounce delay-100" />
                <div className="w-1.5 h-1.5 bg-accent rounded-full animate-bounce delay-200" />
              </div>
            </motion.div>
          )}
          <div className="h-4" />
        </div>

        {/* Input Terminal */}
        <div className="p-4 bg-white dark:bg-slate-900 border-t border-border shadow-2xl relative z-20">
          <div className="max-w-2xl mx-auto relative flex gap-2">
            <input
              value={text}
              onChange={(e) => setText(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              placeholder="اكتب استفسارك القانوني..."
              className="flex-1 bg-secondary/30 border border-border/50 rounded-2xl px-5 py-4 text-sm focus:ring-2 focus:ring-accent focus:bg-white dark:focus:bg-slate-800 transition-all outline-none"
            />
            <button
              onClick={handleSend}
              disabled={!text.trim() || isTyping}
              className="bg-accent hover:bg-emerald-600 text-white p-4 rounded-2xl shadow-lg shadow-accent/20 transition-all active:scale-90 disabled:opacity-50 disabled:grayscale shrink-0"
            >
              <Send className="h-5 w-5 rotate-180" />
            </button>
          </div>
          <p className="text-[9px] text-center text-muted-foreground/40 mt-3 font-bold uppercase tracking-[0.2em] flex items-center justify-center gap-2">
            <ShieldCheck className="h-3 w-3" /> جلسة مشفرة بنظام السيادة الرقمية
          </p>
        </div>

      </div>
    </ProtectedRoute>
  );
}
