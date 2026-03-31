'use client';

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Send, Scale, Sparkles, Sun, Moon,
  ChevronLeft, Loader2, Mic, Camera, Paperclip, 
  ShieldCheck, BrainCircuit, History, Volume2, MicOff
} from "lucide-react";
import ProtectedRoute from "@/components/ProtectedRoute";
import SovereignLayout from "@/components/SovereignLayout";
import { useUser, useFirestore, useCollection } from "@/firebase";
import { useToast } from "@/hooks/use-toast";
import { useTheme } from "next-themes";
import { doc, collection, query, orderBy, limit, addDoc, serverTimestamp } from "firebase/firestore";
import { roles as ROLES_LIST } from "@/lib/roles";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription 
} from "@/components/ui/dialog";
import { useMemoFirebase } from "@/firebase/provider";
import IdCaptureWizard from "@/components/IdCaptureWizard";
import Image from "next/image";
import { executeSovereignBilling } from "@/lib/sovereign-billing";

export default function SmartConsultantPage() {
  const { user, profile, role } = useUser();
  const db = useFirestore();
  const { theme, setTheme } = useTheme();
  const { toast } = useToast();
  
  const [inputText, setInputText] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const [isReading, setIsReading] = useState(false);

  const scrollRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const recognitionRef = useRef<any>(null);

  // --- بروتوكول التوثيق الصوتي (Speech to Text) ---
  useEffect(() => {
    if (typeof window !== "undefined") {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (SpeechRecognition) {
        recognitionRef.current = new SpeechRecognition();
        recognitionRef.current.lang = 'ar-SA';
        recognitionRef.current.continuous = false;
        recognitionRef.current.interimResults = false;

        recognitionRef.current.onresult = (event: any) => {
          const transcript = event.results[0][0].transcript;
          setInputText(prev => prev + (prev ? " " : "") + transcript);
          setIsRecording(false);
        };

        recognitionRef.current.onerror = () => setIsRecording(false);
        recognitionRef.current.onend = () => setIsRecording(false);
      }
    }
  }, []);

  const toggleVoiceRecording = () => {
    if (!recognitionRef.current) {
      toast({ variant: "destructive", title: "المتصفح لا يدعم الإملاء الصوتي" });
      return;
    }
    if (isRecording) {
      recognitionRef.current.stop();
    } else {
      recognitionRef.current.start();
      setIsRecording(true);
      toast({ title: "بروتوكول الإملاء الصوتي نشط 🎤" });
    }
  };

  // --- بروتوكول القراءة الآلية (Text to Speech) ---
  const readLastResponse = () => {
    if (!cloudMessages || cloudMessages.length === 0) return;
    const lastAiMsg = [...cloudMessages].reverse().find(m => m.role === 'ai');
    if (!lastAiMsg) return;

    if (isReading) {
      window.speechSynthesis.cancel();
      setIsReading(false);
      return;
    }

    const utterance = new SpeechSynthesisUtterance(lastAiMsg.text);
    utterance.lang = 'ar-SA';
    utterance.onstart = () => setIsReading(true);
    utterance.onend = () => setIsReading(false);
    window.speechSynthesis.speak(utterance);
  };

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

    const billing = await executeSovereignBilling(db, user.uid, 'ai_chat', role);
    if (!billing.canProceed) {
      toast({ 
        variant: "destructive", 
        title: "الرصيد السيادي نفذ 💰", 
        description: "يرجى شحن محفظتك لتتمكن من متابعة استشارتك الذكية." 
      });
      return;
    }

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
        body: JSON.stringify({ prompt: text, persona: "المستشار الذكي" })
      });
      const data = await res.json();

      await addDoc(collection(db, "users", user.uid, "chatHistory"), {
        role: "ai",
        text: data.response,
        timestamp: serverTimestamp()
      });
    } catch (e) {
      toast({ variant: "destructive", title: "انقطاع الاتصال السيادي" });
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <ProtectedRoute>
      <SovereignLayout activeId="bot">
        <div className="flex flex-col h-screen relative overflow-hidden bg-[#020205]">
          {/* Deep Cinematic Background Overlay */}
          <div className="absolute inset-0 -z-10 opacity-10">
            <Image 
              src="https://picsum.photos/seed/library88/1920/1080"
              alt="Legal Background"
              fill
              className="object-cover"
              data-ai-hint="law books"
            />
          </div>

          <header className="h-20 bg-black/40 backdrop-blur-3xl border-b border-white/5 flex items-center justify-between px-10 z-40 relative">
            <div className="flex items-center gap-6">
              <div className="bg-primary/10 px-6 py-2 rounded-xl border border-primary/20 text-primary text-[10px] font-black uppercase tracking-widest flex items-center gap-3">
                 <ShieldCheck className="h-3 w-3" /> Citizen Support Active
              </div>
            </div>
            <div className="flex items-center gap-4">
              <button onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')} className="p-3 bg-white/5 rounded-2xl text-primary border border-white/5 hover:bg-white/10 transition-all">
                {theme === 'dark' ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
              </button>
            </div>
          </header>

          <div ref={scrollRef} className="flex-1 overflow-y-auto p-10 space-y-12 pb-48 scrollbar-none">
            <div className="max-w-4xl mx-auto space-y-10">
              <AnimatePresence mode="popLayout">
                {cloudMessages?.length === 0 && (
                  <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center py-20 space-y-10">
                     <div className="h-32 w-32 rounded-[3rem] bg-primary/10 mx-auto flex items-center justify-center border border-primary/20 shadow-3xl float-sovereign">
                        <BrainCircuit className="h-16 w-16 text-primary" />
                     </div>
                     <div className="space-y-4">
                        <h3 className="text-4xl font-black text-white tracking-tighter">أهلاً بك في فضاء المستشار الذكي</h3>
                        <p className="text-white/30 font-bold text-lg max-w-lg mx-auto leading-relaxed">أنا المحرك السيادي المخصص لخدمتك. اطرح سؤالك القانوني أو ارفع وثائقك للتحليل الفوري.</p>
                     </div>
                  </motion.div>
                )}
                {cloudMessages?.map((m) => (
                  <motion.div key={m.id} initial={{ opacity: 0, x: m.role === 'user' ? 20 : -20 }} animate={{ opacity: 1, x: 0 }} className={`flex flex-col ${m.role === 'user' ? 'items-start' : 'items-end'}`}>
                    <div className={`p-8 rounded-[3rem] max-w-[90%] text-lg leading-relaxed shadow-3xl border ${
                      m.role === 'user' ? 'bg-white text-slate-900 font-bold rounded-tr-none border-white/10' : 'bg-[#0a0a1f]/90 backdrop-blur-2xl text-white border-primary/20 rounded-tl-none font-medium shadow-primary/5'
                    }`}>
                      {m.text}
                    </div>
                    <span className="text-[8px] font-black text-white/10 uppercase tracking-[0.4em] mt-3 px-6">Documented · Sovereign Protocol</span>
                  </motion.div>
                ))}
              </AnimatePresence>
              {isTyping && <div className="p-5 bg-primary/5 rounded-[2rem] border border-primary/10 w-fit animate-pulse text-[9px] font-black uppercase text-primary tracking-[0.4em]">يتم معالجة الرد برصانة...</div>}
            </div>
          </div>

          {/* --- Smart Chat Input: الجيل الجديد من الإدخال السيادي --- */}
          <div className="absolute bottom-0 inset-x-0 p-10 z-20 bg-gradient-to-t from-[#02020a] via-[#02020a]/90 to-transparent">
            <div className="max-w-4xl mx-auto relative">
              
              {/* Floating Volume Action */}
              <AnimatePresence>
                {cloudMessages && cloudMessages.length > 0 && (
                  <motion.button 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    onClick={readLastResponse}
                    className={`absolute -top-14 left-8 px-6 py-2 rounded-full flex items-center gap-3 text-[10px] font-black uppercase tracking-widest border transition-all z-30 ${
                      isReading ? 'bg-primary text-black border-primary animate-pulse' : 'bg-white/5 text-white/40 border-white/10 hover:text-white'
                    }`}
                  >
                    <Volume2 size={14} /> {isReading ? "جاري قراءة الرد القانوني" : "استماع للرد الأخير"}
                  </motion.button>
                )}
              </AnimatePresence>

              <div className="relative glass-cosmic border border-white/10 rounded-[3rem] overflow-hidden shadow-3xl bg-zinc-900/50 backdrop-blur-3xl focus-within:border-primary/30 transition-all p-3">
                <div className="flex items-center gap-2 bg-black/40 border border-white/5 p-2 rounded-[2.2rem]">
                  
                  {/* tools */}
                  <div className="flex items-center gap-1">
                    <input type="file" ref={fileInputRef} className="hidden" accept=".pdf,.doc,.jpg,.png" />
                    <button 
                      onClick={() => fileInputRef.current?.click()}
                      className="p-4 text-zinc-500 hover:text-primary transition-all rounded-2xl hover:bg-white/5" 
                      title="إرفاق ملف"
                    >
                      <Paperclip size={22} />
                    </button>
                    
                    <button 
                      onClick={() => setIsCameraOpen(true)}
                      className="p-4 text-zinc-500 hover:text-emerald-500 transition-all rounded-2xl hover:bg-white/5" 
                      title="المعالج البصري"
                    >
                      <Camera size={22} />
                    </button>
                  </div>

                  {/* text input */}
                  <textarea 
                    value={inputText} 
                    onChange={(e) => {
                      setInputText(e.target.value);
                      e.target.style.height = "auto";
                      e.target.style.height = Math.min(e.target.scrollHeight, 200) + "px";
                    }}
                    onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && handleSend()}
                    placeholder="تحدث أو اكتب مشكلتك هنا..."
                    className="flex-1 bg-transparent border-none outline-none text-lg font-bold text-white placeholder:text-white/10 resize-none py-3 px-4 scrollbar-none"
                    rows={1}
                  />

                  {/* voice input */}
                  <button 
                    onClick={toggleVoiceRecording}
                    className={`p-4 rounded-2xl transition-all ${
                      isRecording ? 'text-red-500 bg-red-500/10 animate-pulse' : 'text-zinc-500 hover:text-red-400'
                    }`}
                    title="إملاء صوتي"
                  >
                    {isRecording ? <MicOff size={22} /> : <Mic size={22} />}
                  </button>

                  {/* send button */}
                  <button 
                    onClick={() => handleSend()} 
                    disabled={!inputText.trim() || isTyping} 
                    className="h-14 w-14 rounded-2xl bg-primary text-black flex items-center justify-center shadow-2xl transition-all disabled:opacity-20 hover:scale-105 active:scale-95 shrink-0"
                  >
                    {isTyping ? <Loader2 className="animate-spin" size={24} /> : <Send className="rotate-180" size={24} fill="currentColor" />}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Camera/Vision Dialog */}
        <Dialog open={isCameraOpen} onOpenChange={setIsCameraOpen}>
          <DialogContent className="glass-cosmic border-none rounded-[4rem] p-12 max-w-2xl bg-black/95 shadow-3xl">
             <DialogHeader className="mb-10 text-center">
                <DialogTitle className="text-3xl font-black text-white">المعالج البصري الذكي</DialogTitle>
                <DialogDescription className="text-white/30 font-bold uppercase tracking-widest text-[10px] mt-2">Vision Recognition Protocol</DialogDescription>
             </DialogHeader>
             <IdCaptureWizard onComplete={() => { setIsCameraOpen(false); toast({ title: "تم التوثيق البصري بنجاح ✅" }); }} />
          </DialogContent>
        </Dialog>
      </SovereignLayout>
    </ProtectedRoute>
  );
}
