"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Send, User, Cpu, ShieldCheck, Sparkles, FileText, Gavel, Camera } from "lucide-react";
import ProtectedRoute from "@/components/ProtectedRoute";
import Image from "next/image";
import { useUser } from "@/firebase";

interface Message {
  role: "user" | "ai";
  text: string;
  id: string;
}

/**
 * واجهة الدردشة في النسخة المتقدمة.
 * تضم شخصيات عائمة، فقاعات رسائل ملونة، وأوامر سريعة.
 */
export default function BotPage() {
  const { profile } = useUser();
  const [messages, setMessages] = useState<Message[]>([
    { 
      role: "ai", 
      text: "مرحباً بك في النسخة المتقدمة من كوكب المستشار. أنا محركك السيادي المحدث، كيف يمكنني خدمتك اليوم؟",
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

    // محاكاة محرك التفكير السيادي المطور
    setTimeout(() => {
      const aiMsg: Message = { 
        role: "ai", 
        text: "تم رصد استفسارك وتحليله برمجياً. بصفتي المستشار AI، أقترح عليك مراجعة 'المكتبة السيادية' أو بدء 'اتصال مرئي مباشر' مع الخبراء المعتمدين لمناقشة التفاصيل الدقيقة.", 
        id: (Date.now() + 1).toString() 
      };
      setMessages(prev => [...prev, aiMsg]);
      setIsTyping(false);
    }, 1500);
  };

  return (
    <ProtectedRoute>
      <div className="flex flex-col h-[calc(100vh-4rem)] bg-[#f0f2f5] dark:bg-slate-950 relative overflow-hidden">
        
        {/* Sovereign Characters (Animated Edition) */}
        <div className="characters absolute top-20 inset-x-0 flex justify-between px-10 pointer-events-none z-0">
           <motion.div className="float-sovereign opacity-40">
             <Image src="https://picsum.photos/seed/advchar1/400/400" width={80} height={80} className="rounded-full border-4 border-white shadow-2xl" alt="Sovereign Ghost 1" data-ai-hint="legal character" />
           </motion.div>
           <motion.div className="float-sovereign opacity-40" style={{ animationDelay: '1.5s' }}>
             <Image src="https://picsum.photos/seed/advchar2/400/400" width={80} height={80} className="rounded-full border-4 border-white shadow-2xl" alt="Sovereign Ghost 2" data-ai-hint="judge character" />
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
                <div className={`p-4 rounded-[1.5rem] text-sm leading-relaxed shadow-md max-w-[80%] ${
                  m.role === "user"
                    ? "bg-[#dcf8c6] text-slate-900 rounded-tr-none font-bold"
                    : "bg-[#e2e3ff] text-slate-900 rounded-tl-none border border-primary/10"
                }`}>
                  {m.text}
                  
                  {/* Quick Actions for AI Responses */}
                  {m.role === "ai" && m.id !== "init" && (
                    <div className="quick-action mt-4 flex flex-wrap gap-2">
                       <button className="flex items-center gap-1 bg-[#17a2b8] text-white px-3 py-1 rounded-full text-[10px] font-black hover:scale-105 transition-transform shadow-md">
                         <FileText className="h-3 w-3" /> المكتبة
                       </button>
                       <button className="flex items-center gap-1 bg-[#17a2b8] text-white px-3 py-1 rounded-full text-[10px] font-black hover:scale-105 transition-transform shadow-md">
                         <Gavel className="h-3 w-3" /> الخبراء
                       </button>
                    </div>
                  )}
                </div>
              </motion.div>
            ))}
          </AnimatePresence>

          {isTyping && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex justify-start">
              <div className="bg-[#e2e3ff] rounded-full px-4 py-3 flex gap-1.5 items-center shadow-sm">
                <div className="w-1.5 h-1.5 bg-primary rounded-full animate-bounce" />
                <div className="w-1.5 h-1.5 bg-primary rounded-full animate-bounce delay-100" />
                <div className="w-1.5 h-1.5 bg-primary rounded-full animate-bounce delay-200" />
              </div>
            </motion.div>
          )}
          <div className="h-4" />
        </div>

        {/* Input Terminal: Success Edition */}
        <div className="p-4 bg-white dark:bg-slate-900 border-t border-border shadow-2xl relative z-20">
          <div className="max-w-2xl mx-auto flex gap-3 items-center">
            <div className="flex gap-1 shrink-0">
               <button className="p-3 bg-secondary/50 rounded-full text-muted-foreground hover:text-primary transition-colors">
                 <Camera className="h-5 w-5" />
               </button>
            </div>
            <input
              value={text}
              onChange={(e) => setText(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              placeholder="اكتب رسالتك السيادية هنا..."
              className="flex-1 bg-secondary/30 border border-border/50 rounded-xl px-5 py-3.5 text-sm focus:ring-2 focus:ring-primary/20 outline-none font-bold"
            />
            <button
              onClick={handleSend}
              disabled={!text.trim() || isTyping}
              className="bg-[#28a745] hover:bg-emerald-600 text-white p-4 rounded-xl shadow-lg shadow-emerald-500/20 transition-all active:scale-90 disabled:opacity-50 shrink-0"
            >
              <Send className="h-5 w-5 rotate-180" />
            </button>
          </div>
          <p className="text-[9px] text-center text-muted-foreground/40 mt-3 font-bold uppercase tracking-[0.2em] flex items-center justify-center gap-2">
            <ShieldCheck className="h-3 w-3 text-emerald-500" /> بروتوكول اتصال مشفر وآمن
          </p>
        </div>

      </div>
    </ProtectedRoute>
  );
}