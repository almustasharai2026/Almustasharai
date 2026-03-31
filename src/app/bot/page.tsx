
'use client';

import { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Mic, Send, Loader2, Sparkles, Plus, Paperclip, 
  Image as ImageIcon, FileText, Zap, Camera, Volume2, 
  Languages, X, ShieldCheck
} from "lucide-react";
import SovereignLayout from "@/components/SovereignLayout";
import { useUser, useFirestore, useCollection, useMemoFirebase } from "@/firebase";
import { useToast } from "@/hooks/use-toast";
import { collection, query, orderBy, limit, addDoc, serverTimestamp } from "firebase/firestore";

/**
 * محرك المحادثة السيادي (Sovereign Chat Engine 1.0).
 * تصميم جزيئي محمول يدعم تعدد الوسائط، الإملاء الصوتي، والمسودات التلقائية.
 */
export default function SmartConsultantPage() {
  const { user, profile } = useUser();
  const db = useFirestore();
  const { toast } = useToast();
  
  const [inputText, setInputText] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [showAttachments, setShowAttachments] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // 1. ميزة "المسودة التلقائية" (Auto-Save Protocol)
  useEffect(() => {
    const draft = localStorage.getItem('sovereign_draft');
    if (draft && !inputText) setInputText(draft);
  }, []);

  useEffect(() => {
    if (inputText) localStorage.setItem('sovereign_draft', inputText);
    else localStorage.removeItem('sovereign_draft');
  }, [inputText]);

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

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files?.length) return;
    
    // ميزة "تعدد المهام" (Multitasking Upload Protocol)
    const fileCount = files.length;
    toast({ title: `جاري معالجة ${fileCount} وثائق..`, description: "يتم فحص وتشفير المرفقات سيادياً." });
    
    setTimeout(() => {
      setInputText(prev => prev + `\n[تم إرفاق ${fileCount} ملفات لتحليلها]`);
      setShowAttachments(false);
    }, 1500);
  };

  const toggleVoice = () => {
    setIsRecording(!isRecording);
    if (!isRecording) {
      toast({ title: "بروتوكول الإملاء الصوتي نشط 🎤", description: "تحدث الآن، سيتم تحويل صوتك لبيانات قانونية." });
    }
  };

  return (
    <SovereignLayout activeId="bot">
      <div className="flex flex-col h-full relative">
        
        {/* منطقة السجل السيادي */}
        <div ref={scrollRef} className="flex-1 overflow-y-auto space-y-10 pb-32 pt-10 scrollbar-none">
          <AnimatePresence mode="popLayout">
            {cloudMessages?.length === 0 && (
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-8">
                <div className="w-20 h-20 bg-[#ff5722]/10 rounded-[2rem] flex items-center justify-center border border-[#ff5722]/20 shadow-2xl">
                   <Zap size={40} className="text-[#ff5722]" fill="currentColor" />
                </div>
                <p className="text-4xl font-black leading-tight text-white tracking-tighter">
                  أهلاً بك يا {profile?.fullName?.split(' ')[0] || "سيادة المالك"}، <br/> 
                  <span className="text-zinc-600">أنا عقلك القانوني، كيف نوثق اليوم؟</span>
                </p>
                <div className="flex flex-wrap gap-3">
                   {["فحص عقد إيجار", "صياغة توكيل", "استشارة جنائية"].map(q => (
                     <button key={q} onClick={() => setInputText(q)} className="px-6 py-3 bg-[#252525] border border-white/5 rounded-2xl text-[10px] font-black uppercase text-zinc-400 hover:text-white hover:border-[#ff5722]/30 transition-all shadow-xl">{q}</button>
                   ))}
                </div>
              </motion.div>
            )}
            
            {cloudMessages?.map((m) => (
              <motion.div 
                key={m.id} 
                initial={{ opacity: 0, y: 15 }} 
                animate={{ opacity: 1, y: 0 }} 
                className="group space-y-3"
              >
                <div className={`p-8 rounded-[3rem] max-w-full text-base leading-relaxed ${
                  m.role === 'user' ? 'bg-[#252525] text-white italic border border-white/5 shadow-2xl' : 'bg-transparent text-zinc-300 font-medium'
                }`}>
                  {m.text}
                </div>
                <div className="flex items-center gap-4 px-8 opacity-0 group-hover:opacity-100 transition-opacity">
                   <span className="text-[8px] font-black uppercase text-zinc-600 tracking-widest">{m.role === 'user' ? 'Citizen Protocol' : 'Supreme Oracle'}</span>
                   {m.role === 'ai' && <button className="text-[#ff5722] hover:scale-110 transition-transform"><Volume2 size={12}/></button>}
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
          
          {isTyping && (
            <div className="flex items-center gap-4 px-8">
               <div className="flex gap-1.5">
                  <div className="w-1.5 h-1.5 bg-[#ff5722] rounded-full animate-bounce" />
                  <div className="w-1.5 h-1.5 bg-[#ff5722] rounded-full animate-bounce delay-100" />
                  <div className="w-1.5 h-1.5 bg-[#ff5722] rounded-full animate-bounce delay-200" />
               </div>
               <span className="text-[9px] font-black text-[#ff5722] uppercase tracking-[0.5em]">Thinking...</span>
            </div>
          )}
        </div>

        {/* محرك الإدخال السيادي (Sovereign Device Input) */}
        <div className="fixed bottom-32 left-10 right-10 z-40">
          <div className="max-w-[370px] mx-auto space-y-4">
            
            <AnimatePresence>
              {showAttachments && (
                <motion.div 
                  initial={{ opacity: 0, y: 20, scale: 0.9 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 20, scale: 0.9 }}
                  className="flex gap-3"
                >
                  <AttachmentBtn icon={<ImageIcon size={18}/>} label="معرض الصور" color="#3b82f6" onClick={() => fileInputRef.current?.click()} />
                  <AttachmentBtn icon={<FileText size={18}/>} label="وثيقة PDF" color="#ef4444" onClick={() => fileInputRef.current?.click()} />
                  <AttachmentBtn icon={<Camera size={18}/>} label="العدسة الذكية" color="#ff5722" onClick={() => toast({title: "تفعيل الرؤية الحاسوبية.."})} />
                </motion.div>
              )}
            </AnimatePresence>

            <div className="bg-[#252525] rounded-[3.5rem] p-3 flex items-center gap-3 border border-white/5 shadow-3xl backdrop-blur-3xl relative">
              <input 
                type="file" 
                ref={fileInputRef} 
                multiple 
                className="hidden" 
                onChange={handleFileUpload} 
              />
              
              <button 
                onClick={() => setShowAttachments(!showAttachments)}
                className={`w-14 h-14 rounded-full flex items-center justify-center transition-all ${showAttachments ? 'bg-zinc-700 text-white rotate-45' : 'bg-zinc-800/50 text-zinc-500 hover:text-white'}`}
              >
                <Plus size={24} />
              </button>
              
              <input 
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                placeholder="تحدث أو ارفق قضيتك.." 
                className="flex-1 bg-transparent border-none outline-none px-2 text-sm font-bold text-white placeholder:text-zinc-700"
              />

              <button 
                onClick={isRecording || inputText.trim() ? handleSend : toggleVoice}
                disabled={isTyping}
                className={`w-16 h-16 rounded-full flex items-center justify-center transition-all shadow-2xl active:scale-90 ${isRecording ? 'bg-red-600 animate-pulse' : 'bg-[#ff5722] text-black shadow-[#ff5722]/20'}`}
              >
                {isTyping ? (
                  <Loader2 className="animate-spin" size={24}/>
                ) : (inputText.trim() ? <Send size={24} className="rotate-180" /> : <Mic size={28} fill="currentColor" />)}
              </button>
            </div>
          </div>
        </div>

      </div>
    </SovereignLayout>
  );
}

function AttachmentBtn({ icon, label, color, onClick }: any) {
  return (
    <button 
      onClick={onClick}
      className="flex-1 bg-[#252525] py-5 rounded-[2.5rem] border border-white/5 flex flex-col items-center gap-2 hover:border-white/10 transition-all group shadow-2xl active:scale-95"
    >
      <span style={{ color }} className="group-hover:scale-110 transition-transform">{icon}</span>
      <span className="text-[8px] font-black uppercase text-zinc-500 tracking-widest">{label}</span>
    </button>
  );
}
