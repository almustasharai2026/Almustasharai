
"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Send, User, Cpu, ShieldCheck, Sparkles, FileText, Gavel, Camera, Copy, Trash2, Reply } from "lucide-react";
import ProtectedRoute from "@/components/ProtectedRoute";
import Image from "next/image";
import { useUser } from "@/firebase";
import { useToast } from "@/hooks/use-toast";

interface Message {
  role: "user" | "ai";
  text: string;
  id: string;
}

/**
 * واجهة الدردشة في النسخة المتقدمة.
 * تضم منطق Quick Actions (نسخ، حذف، رد سريع) وتحاكي ردود البوت اللحظية.
 */
export default function BotPage() {
  const { profile } = useUser();
  const { toast } = useToast();
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

  const handleSend = (overrideText?: string) => {
    const input = overrideText || text;
    if (!input.trim() || isTyping) return;

    const userMsg: Message = { role: "user", text: input.trim(), id: Date.now().toString() };
    setMessages(prev => [...prev, userMsg]);
    setText("");
    setIsTyping(true);

    // محاكاة محرك التفكير السيادي المطور
    setTimeout(() => {
      const aiMsg: Message = { 
        role: "ai", 
        text: "تم استلام رسالتك! جاري تحليل المعطيات وربطها بالمواد القانونية ذات الصلة. بصفتي المستشار AI، أقترح عليك مراجعة 'المكتبة السيادية' أو بدء 'اتصال مرئي مباشر' مع الخبراء.", 
        id: (Date.now() + 1).toString() 
      };
      setMessages(prev => [...prev, aiMsg]);
      setIsTyping(false);
    }, 1200);
  };

  const deleteMessage = (id: string) => {
    setMessages(prev => prev.filter(m => m.id !== id));
    toast({ title: "تم تطهير الرسالة", description: "تم حذف الرسالة من السجل المحلي." });
  };

  const copyMessage = (content: string) => {
    navigator.clipboard.writeText(content);
    toast({ title: "تم النسخ بنجاح", description: "النص جاهز للاستخدام في وثائقك." });
  };

  const quickReply = (content: string) => {
    setText(`بناءً على الرد: "${content.substring(0, 20)}..."، أود الاستفسار عن: `);
    toast({ title: "تم تفعيل الرد السريع" });
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
                <div className={`p-4 rounded-[1.5rem] text-sm leading-relaxed shadow-md max-w-[85%] relative group ${
                  m.role === "user"
                    ? "bg-[#dcf8c6] text-slate-900 rounded-tr-none font-bold"
                    : "bg-[#e2e3ff] text-slate-900 rounded-tl-none border border-primary/10"
                }`}>
                  {m.text}
                  
                  {/* Sovereign Quick Actions Toolbar */}
                  <div className={`quick-actions-toolbar flex items-center gap-1 mt-3 pt-2 border-t border-black/5 opacity-0 group-hover:opacity-100 transition-opacity`}>
                     <button onClick={() => quickReply(m.text)} className="p-1.5 hover:bg-black/5 rounded-lg text-primary/60 hover:text-primary transition-colors" title="رد سريع">
                       <Reply className="h-3 w-3" />
                     </button>
                     <button onClick={() => copyMessage(m.text)} className="p-1.5 hover:bg-black/5 rounded-lg text-primary/60 hover:text-primary transition-colors" title="نسخ">
                       <Copy className="h-3 w-3" />
                     </button>
                     <button onClick={() => deleteMessage(m.id)} className="p-1.5 hover:bg-black/5 rounded-lg text-red-500/60 hover:text-red-500 transition-colors" title="حذف">
                       <Trash2 className="h-3 w-3" />
                     </button>
                  </div>
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

        {/* Input Terminal: Sovereign Advanced Logic */}
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
              onClick={() => handleSend()}
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
