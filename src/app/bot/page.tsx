
'use client';

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Send, Scale, Sparkles, Sun, Moon,
  ChevronLeft, Loader2, Mic, Camera, Paperclip, 
  ShieldCheck, BrainCircuit, History
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

  const handleSend = async (customText?: string) => {
    const text = customText || inputText.trim();
    if (!text || isTyping || !db || !user) return;

    // --- بروتوكول الفوترة السيادي قبل المعالجة ---
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
        <div className="flex flex-col h-screen relative overflow-hidden">
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
              <button onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')} className="p-3 bg-white/5 rounded-2xl text-primary border border-white/5">
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

          <div className="absolute bottom-0 inset-x-0 p-10 z-20 bg-gradient-to-t from-[#02020a] via-[#02020a]/90 to-transparent pointer-events-none">
            <div className="max-w-4xl mx-auto space-y-6 pointer-events-auto">
              <div className="flex items-center gap-4 px-4">
                 <ToolBtn icon={<Paperclip />} onClick={() => fileInputRef.current?.click()} tooltip="رفع ملف" />
                 <ToolBtn icon={<Camera />} onClick={() => setIsCameraOpen(true)} tooltip="المعالج البصري" />
                 <ToolBtn icon={<Mic />} active={isRecording} color="red" tooltip="إملاء صوتي" />
                 <input type="file" ref={fileInputRef} className="hidden" />
              </div>
              <div className="relative glass-cosmic border-2 border-white/10 rounded-[3rem] overflow-hidden shadow-3xl group focus-within:border-primary/30 transition-all bg-black/40">
                <div className="flex items-center px-10 py-6 gap-8">
                  <textarea 
                    value={inputText} 
                    onChange={(e) => {
                      setInputText(e.target.value);
                      e.target.style.height = "auto";
                      e.target.style.height = Math.min(e.target.scrollHeight, 200) + "px";
                    }}
                    onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && handleSend()}
                    placeholder="اطرح استشارتك برصانة..."
                    className="flex-1 bg-transparent border-none outline-none text-xl font-bold text-white placeholder:text-white/10 resize-none py-2"
                    rows={1}
                  />
                  <button onClick={() => handleSend()} disabled={!inputText.trim() || isTyping} className="h-16 w-16 rounded-3xl bg-primary text-white flex items-center justify-center shadow-2xl transition-all disabled:opacity-20 hover:scale-110 active:scale-95">
                    <Send className="rotate-180 h-8 w-8 text-black" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

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

function ToolBtn({ icon, onClick, active, tooltip }: any) {
  return (
    <button onClick={onClick} className={`h-14 w-14 rounded-2xl flex items-center justify-center transition-all border shadow-2xl relative group ${active ? 'bg-red-500 border-red-500 text-white animate-pulse' : 'bg-white/[0.05] border-white/10 text-white/20 hover:text-primary hover:border-primary/30 hover:bg-primary/5'}`}>
      <div className="scale-110">{icon}</div>
      <div className="absolute -top-12 opacity-0 group-hover:opacity-100 transition-opacity bg-black px-4 py-2 rounded-xl text-[8px] font-black text-primary uppercase border border-primary/20 pointer-events-none">
        {tooltip}
      </div>
    </button>
  );
}
