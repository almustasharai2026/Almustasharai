"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Send, User, Cpu, ShieldCheck, Sparkles, Copy, Trash2, Reply, 
  Settings, Users, Gavel, ShieldAlert, Tag, Activity, Plus, Ban, X
} from "lucide-react";
import ProtectedRoute from "@/components/ProtectedRoute";
import Image from "next/image";
import { useUser, useFirestore, useCollection } from "@/firebase";
import { useToast } from "@/hooks/use-toast";
import { collection, doc, deleteDoc, addDoc, serverTimestamp } from "firebase/firestore";
import { useMemoFirebase } from "@/firebase/provider";

interface Message {
  role: "user" | "ai";
  text: string;
  id: string;
}

export default function AdvancedBotPage() {
  const { profile } = useUser();
  const db = useFirestore();
  const { toast } = useToast();
  
  const [messages, setMessages] = useState<Message[]>([
    { role: "ai", text: "أهلاً بك في النسخة السيادية المتقدمة. أنا محركك القانوني المحدث، كيف يمكنني مساعدتك؟", id: "init" }
  ]);
  const [inputText, setInputText] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
    }
  }, [messages, isTyping]);

  const handleSend = () => {
    if (!inputText.trim() || isTyping) return;

    const userMsg: Message = { role: "user", text: inputText.trim(), id: Date.now().toString() };
    setMessages(prev => [...prev, userMsg]);
    setInputText("");
    setIsTyping(true);

    setTimeout(() => {
      const aiMsg: Message = { 
        role: "ai", 
        text: "بصفتي المحرك السيادي، قمت بتحليل طلبك. نوصي بمراجعة بروتوكولات الامتثال المحدثة.", 
        id: (Date.now() + 1).toString() 
      };
      setMessages(prev => [...prev, aiMsg]);
      setIsTyping(false);
    }, 1000);
  };

  const deleteMessage = (id: string) => {
    setMessages(prev => prev.filter(m => m.id !== id));
    toast({ title: "تم الحذف" });
  };

  const copyMessage = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({ title: "تم النسخ" });
  };

  return (
    <ProtectedRoute>
      <div className="flex flex-col h-[calc(100vh-4rem)] relative overflow-hidden">
        
        {/* Sovereign Spirits - 3 Characters */}
        <div className="flex justify-center gap-6 p-4 pointer-events-none z-0">
           {[1, 2, 3].map(i => (
             <motion.div 
               key={i}
               animate={{ y: [0, -12, 0] }} 
               transition={{ duration: 3, repeat: Infinity, delay: i * 0.5 }}
               className="grayscale hover:grayscale-0 transition-all opacity-40"
             >
               <Image src={`https://picsum.photos/seed/char${i}/200/200`} width={70} height={70} className="rounded-full border-2 border-primary" alt={`Spirit ${i}`} data-ai-hint="legal character" />
             </motion.div>
           ))}
        </div>

        {/* Chat Messages */}
        <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-6 relative z-10">
          {messages.map((m) => (
            <motion.div
              key={m.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`flex flex-col ${m.role === "user" ? "items-end" : "items-start"}`}
            >
              <div className={`p-4 rounded-[20px] text-sm max-w-[80%] relative group shadow-md ${
                m.role === "user"
                  ? "bg-[#d4edda] dark:bg-[#28a74580] text-slate-900 dark:text-white"
                  : "bg-[#d1ecf1] dark:bg-[#17a2b880] text-slate-900 dark:text-white"
              }`}>
                {m.text}
                <div className="flex items-center gap-2 mt-3 pt-2 border-t border-black/5 opacity-0 group-hover:opacity-100 transition-opacity">
                   <button onClick={() => setInputText(m.text)} className="bg-[#17a2b8] text-white px-2 py-1 rounded-md text-[10px]">رد سريع</button>
                   <button onClick={() => copyMessage(m.text)} className="bg-[#17a2b8] text-white px-2 py-1 rounded-md text-[10px]">نسخ</button>
                   <button onClick={() => deleteMessage(m.id)} className="bg-[#17a2b8] text-white px-2 py-1 rounded-md text-[10px]">حذف</button>
                </div>
              </div>
            </motion.div>
          ))}
          {isTyping && (
            <div className="flex gap-1 p-2">
              <div className="w-1.5 h-1.5 bg-primary rounded-full animate-bounce" />
              <div className="w-1.5 h-1.5 bg-primary rounded-full animate-bounce delay-100" />
              <div className="w-1.5 h-1.5 bg-primary rounded-full animate-bounce delay-200" />
            </div>
          )}
        </div>

        {/* Chat Input */}
        <div className="p-4 bg-white dark:bg-slate-900 border-t border-border relative z-20">
          <div className="max-w-3xl mx-auto flex gap-3">
            <input
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              placeholder="اكتب رسالتك هنا..."
              className="flex-1 bg-secondary/30 rounded-xl px-4 py-3 text-sm outline-none border border-transparent focus:border-primary/30"
            />
            <button
              onClick={() => handleSend()}
              className="btn-green-gradient text-white px-8 rounded-xl font-bold hover:scale-105 transition-transform shadow-lg active:scale-95"
            >
              إرسال
            </button>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}