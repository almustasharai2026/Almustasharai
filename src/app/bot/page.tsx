'use client';

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Mic, Send, Loader2, Sparkles, Plus, Paperclip, Image as ImageIcon, FileText, Zap } from "lucide-react";
import SovereignLayout from "@/components/SovereignLayout";
import { useUser, useFirestore, useCollection, useMemoFirebase } from "@/firebase";
import { useToast } from "@/hooks/use-toast";
import { collection, query, orderBy, limit, addDoc, serverTimestamp } from "firebase/firestore";

/**
 * واجهة الدردشة الجرمية المحدثة (The Sovereign AI Node).
 * تدمج درج المرفقات وشريط الإدخال المتطور.
 */
export default function SmartConsultantPage() {
  const { user, profile } = useUser();
  const db = useFirestore();
  const { toast } = useToast();
  
  const [inputText, setInputText] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [showAttachments, setShowAttachments] = useState(false);
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
    setShowAttachments(false);

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
      toast({ variant: "destructive", title: "فشل المحرك السيادي" });
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <SovereignLayout activeId="bot">
      <div className="flex flex-col h-full">
        
        {/* منطقة السجل الهادئة */}
        <div ref={scrollRef} className="flex-1 overflow-y-auto space-y-8 pb-10 scrollbar-none">
          <AnimatePresence mode="popLayout">
            {cloudMessages?.length === 0 && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6 pt-10">
                <p className="text-3xl font-light leading-tight text-white">أهلاً يا {profile?.fullName?.split(' ')[0] || "سيادة المالك"}، <br/> <span className="text-zinc-500">كيف يمكنني مساعدتك قانونياً اليوم؟</span></p>
                <div className="flex flex-wrap gap-2">
                   {["عقود عمل", "قضايا جنائية", "تأسيس شركة"].map(q => (
                     <button key={q} onClick={() => setInputText(q)} className="px-4 py-2 bg-[#252525] border border-white/5 rounded-full text-[10px] font-black uppercase text-zinc-400 hover:text-white transition-all">{q}</button>
                   ))}
                </div>
              </motion.div>
            )}
            
            {cloudMessages?.map((m) => (
              <motion.div 
                key={m.id} 
                initial={{ opacity: 0, y: 10 }} 
                animate={{ opacity: 1, y: 0 }} 
                className={`flex flex-col items-start`}
              >
                <div className={`p-6 rounded-[2.5rem] max-w-full text-sm leading-relaxed ${
                  m.role === 'user' ? 'bg-[#252525] text-white italic border border-white/5 shadow-inner' : 'bg-transparent text-zinc-300 font-medium'
                }`}>
                  {m.text}
                </div>
                <span className="text-[8px] font-black uppercase text-zinc-600 mt-2 px-6">{m.role === 'user' ? 'Citizen Request' : 'Sovereign Answer'}</span>
              </motion.div>
            ))}
          </AnimatePresence>
          
          {isTyping && (
            <div className="flex items-center gap-3 px-6">
               <div className="w-2 h-2 bg-[#ff5722] rounded-full animate-ping" />
               <span className="text-[10px] font-black text-[#ff5722] uppercase tracking-[0.4em]">Processing...</span>
            </div>
          )}
        </div>

        {/* محرك الإدخال المتكامل (Integrated Input) */}
        <div className="mt-auto space-y-4">
          
          {/* درج المرفقات (The Attachment Dock) */}
          <AnimatePresence>
            {showAttachments && (
              <motion.div 
                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 10, scale: 0.95 }}
                className="flex gap-3 mb-2"
              >
                <AttachmentButton icon={<ImageIcon size={18}/>} label="صورة" color="#3b82f6" />
                <AttachmentButton icon={<FileText size={18}/>} label="PDF" color="#ef4444" />
                <AttachmentButton icon={<Zap size={18}/>} label="تحليل ذكي" color="#ff5722" />
              </motion.div>
            )}
          </AnimatePresence>

          {/* شريط الإدخال الرئيسي */}
          <div className="bg-[#252525] rounded-[3rem] p-2 flex items-center justify-between border border-white/5 shadow-2xl relative">
            <button 
              onClick={() => setShowAttachments(!showAttachments)}
              className={`w-14 h-14 rounded-full flex items-center justify-center transition-all ${showAttachments ? 'bg-zinc-700 text-white rotate-45' : 'text-zinc-500 hover:text-white'}`}
            >
              <Paperclip size={24} />
            </button>
            
            <input 
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              placeholder="تحدث أو ارفع وثيقتك هنا.." 
              className="flex-1 bg-transparent border-none outline-none px-4 text-base font-bold text-white placeholder:text-zinc-600"
            />

            <button 
              onClick={handleSend}
              disabled={!inputText.trim() || isTyping}
              className="w-16 h-16 bg-[#ff5722] rounded-full flex items-center justify-center text-black shadow-xl shadow-[#ff5722]/20 active:scale-90 transition-all disabled:opacity-20 disabled:grayscale"
            >
              {isTyping ? <Loader2 className="animate-spin" size={24}/> : <Mic size={28} fill="currentColor" />}
            </button>
          </div>
        </div>

      </div>
    </SovereignLayout>
  );
}

function AttachmentButton({ icon, label, color }: any) {
  return (
    <button className="flex-1 bg-[#252525] py-4 rounded-[2rem] border border-white/5 flex flex-col items-center gap-2 hover:border-white/10 transition-all group shadow-xl">
      <span style={{ color }} className="group-hover:scale-110 transition-transform">{icon}</span>
      <span className="text-[8px] font-black uppercase text-zinc-500 tracking-widest">{label}</span>
    </button>
  );
}
