
"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Send, Scale, LogOut, LayoutDashboard, Sparkles, 
  Menu, X, Plus, Wallet, Sun, Moon,
  ChevronLeft, Loader2, Mic, Camera, Paperclip, 
  FileText, Zap, MessageSquare, ShieldCheck, History, BrainCircuit
} from "lucide-react";
import ProtectedRoute from "@/components/ProtectedRoute";
import SovereignSidebar from "@/components/SovereignSidebar";
import { useUser, useFirestore, useCollection } from "@/firebase";
import { useToast } from "@/hooks/use-toast";
import { useTheme } from "next-themes";
import { useRouter } from "next/navigation";
import { doc, collection, query, orderBy, limit, addDoc, serverTimestamp, updateDoc, increment } from "firebase/firestore";
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
import Link from "next/link";
import SovereignButton from "@/components/SovereignButton";

/**
 * مركز قيادة "المستشار الذكي" (The Sovereign AI Node).
 * مخصص لخدمة المواطنين بكافة وسائل الراحة والتحليل اللحظي.
 */
export default function SmartConsultantPage() {
  const { user, profile, role } = useUser();
  const db = useFirestore();
  const { theme, setTheme } = useTheme();
  const { toast } = useToast();
  const router = useRouter();
  
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
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

    if (role === ROLES_LIST.USER && (profile?.balance || 0) < 1) {
      toast({ variant: "destructive", title: "الرصيد السيادي نفذ", description: "يرجى التوجه للخزنة لشحن الوحدات." });
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

      if (role !== ROLES_LIST.ADMIN) {
        await updateDoc(doc(db, "users", user.uid), { balance: increment(-1) });
      }

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
      <div className="flex h-screen bg-[#02020a] overflow-hidden font-sans" dir="rtl">
        {/* Sovereign Sidebar Integration */}
        <AnimatePresence mode="wait">
          {isSidebarOpen && (
            <motion.div initial={{ width: 0, opacity: 0 }} animate={{ width: 288, opacity: 1 }} exit={{ width: 0, opacity: 0 }} className="hidden lg:block relative z-50">
              <SovereignSidebar activeId="bot" />
            </motion.div>
          )}
        </AnimatePresence>

        <div className="flex-1 flex flex-col relative bg-[url('https://images.unsplash.com/photo-1589829545856-d10d557cf95f?q=80&w=2070&auto=format&fit=crop')] bg-cover bg-fixed">
          <div className="absolute inset-0 bg-gradient-to-b from-[#02020a]/95 via-[#02020a]/80 to-[#02020a]/95 backdrop-blur-sm" />
          
          <header className="h-20 bg-black/40 backdrop-blur-3xl border-b border-white/5 flex items-center justify-between px-10 z-40 shadow-2xl relative">
            <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="p-3 bg-white/5 rounded-2xl text-primary border border-white/5 hover:bg-white/10 transition-all shadow-xl">
              {isSidebarOpen ? <ChevronLeft className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
            <div className="flex items-center gap-6">
              <div className="bg-primary/10 px-6 py-2 rounded-xl border border-primary/20 text-primary text-[10px] font-black uppercase tracking-widest flex items-center gap-3">
                 <ShieldCheck className="h-3 w-3" /> Citizen Support Hub
              </div>
              <button onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')} className="p-3 bg-white/5 rounded-2xl text-primary border border-white/5 shadow-xl">
                {theme === 'dark' ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
              </button>
            </div>
          </header>

          <main className="flex-1 flex flex-col relative z-10">
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
                          <p className="text-white/30 font-bold text-lg max-w-lg mx-auto leading-relaxed">أنا المحرك السيادي المخصص لخدمتك وتوفير كافة سبل الراحة. اطرح سؤالك القانوني أو ارفع وثائقك للتحليل الفوري.</p>
                       </div>
                    </motion.div>
                  )}
                  {cloudMessages?.map((m) => (
                    <motion.div key={m.id} initial={{ opacity: 0, x: m.role === 'user' ? 20 : -20 }} animate={{ opacity: 1, x: 0 }} className={`flex flex-col ${m.role === 'user' ? 'items-start' : 'items-end'}`}>
                      <div className={`p-8 rounded-[3rem] max-w-[90%] text-lg leading-relaxed shadow-3xl border ${
                        m.role === 'user' ? 'bg-white text-slate-900 font-bold rounded-tr-none border-white/10' : 'bg-[#0a0a1f]/80 backdrop-blur-2xl text-white border-primary/20 rounded-tl-none font-medium'
                      }`}>
                        {m.text}
                      </div>
                      <span className="text-[8px] font-black text-white/10 uppercase tracking-[0.4em] mt-3 px-6">Documented · Sovereign Protocol</span>
                    </motion.div>
                  ))}
                </AnimatePresence>
                {isTyping && <div className="p-5 bg-primary/5 rounded-[2rem] border border-primary/10 w-fit animate-pulse text-[9px] font-black uppercase text-primary tracking-[0.4em]">المستشار الذكي يحلل الأبعاد القانونية...</div>}
              </div>
            </div>

            <div className="absolute bottom-0 inset-x-0 p-10 z-20 bg-gradient-to-t from-[#02020a] via-[#02020a]/80 to-transparent">
              <div className="max-w-4xl mx-auto space-y-6">
                <div className="flex items-center gap-4 px-4">
                   <ToolBtn icon={<Paperclip />} onClick={() => fileInputRef.current?.click()} tooltip="رفع ملف قانوني" />
                   <ToolBtn icon={<Camera />} onClick={() => setIsCameraOpen(true)} tooltip="المعالج البصري" />
                   <ToolBtn icon={<Mic />} active={isRecording} color="red" tooltip="الإملاء الصوتي" />
                   <input type="file" ref={fileInputRef} className="hidden" multiple />
                </div>
                <div className="relative glass-cosmic border-2 border-white/10 rounded-[3rem] overflow-hidden shadow-3xl group focus-within:border-primary/30 transition-all duration-500">
                  <div className="flex items-center px-10 py-6 gap-8">
                    <textarea 
                      value={inputText} 
                      onChange={(e) => {
                        setInputText(e.target.value);
                        e.target.style.height = "auto";
                        e.target.style.height = Math.min(e.target.scrollHeight, 200) + "px";
                      }}
                      onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && handleSend()}
                      placeholder="اطرح استشارتك برصانة ملكية..."
                      className="flex-1 bg-transparent border-none outline-none text-xl font-bold text-white placeholder:text-white/10 resize-none py-2"
                      rows={1}
                    />
                    <button onClick={() => handleSend()} disabled={!inputText.trim() || isTyping} className="h-16 w-16 rounded-3xl bg-primary text-white flex items-center justify-center shadow-2xl transition-all disabled:opacity-20 hover:scale-110 active:scale-95 group-focus-within:rotate-12">
                      <Send className="rotate-180 h-8 w-8" />
                    </button>
                  </div>
                </div>
                <p className="text-[8px] text-center text-white/10 font-black uppercase tracking-[0.6em]">Smart Citizen Assistant Node v4.5 · Protected Session</p>
              </div>
            </div>
          </main>
        </div>
      </div>

      <Dialog open={isCameraOpen} onOpenChange={setIsCameraOpen}>
        <DialogContent className="glass-cosmic border-none rounded-[4rem] p-12 max-w-2xl bg-black/90 shadow-[0_0_100px_rgba(99,102,241,0.1)]">
           <DialogHeader className="mb-10 text-center">
              <DialogTitle className="text-3xl font-black text-white">المعالج البصري الذكي</DialogTitle>
              <DialogDescription className="text-white/30 font-bold uppercase tracking-widest text-[10px] mt-2">Vision Identity Recognition Protocol</DialogDescription>
           </DialogHeader>
           <IdCaptureWizard onComplete={() => { setIsCameraOpen(false); toast({ title: "تم التوثيق البصري بنجاح ✅" }); }} />
        </DialogContent>
      </Dialog>
    </ProtectedRoute>
  );
}

function ToolBtn({ icon, onClick, active, color, tooltip }: any) {
  return (
    <button onClick={onClick} className={`h-14 w-14 rounded-2xl flex items-center justify-center transition-all border shadow-2xl relative group ${active ? 'bg-red-500 border-red-500 text-white animate-pulse' : 'bg-white/[0.02] border-white/5 text-white/20 hover:text-primary hover:border-primary/30 hover:bg-primary/5'}`}>
      <div className="scale-110">{icon}</div>
      <div className="absolute -top-12 opacity-0 group-hover:opacity-100 transition-opacity bg-black px-4 py-2 rounded-xl text-[8px] font-black text-primary uppercase whitespace-nowrap border border-primary/20 pointer-events-none">
        {tooltip}
      </div>
    </button>
  );
}
