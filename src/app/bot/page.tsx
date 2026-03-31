
"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Send, Scale, LogOut, LayoutDashboard, Sparkles, 
  Menu, X, Plus, Wallet, Sun, Moon,
  ChevronLeft, Loader2, Mic, Camera, Paperclip, 
  FileText, Copy, Trash2, Zap, MessageSquare, ShieldCheck
} from "lucide-react";
import ProtectedRoute from "@/components/ProtectedRoute";
import { useUser, useFirestore, useCollection } from "@/firebase";
import { useToast } from "@/hooks/use-toast";
import { useTheme } from "next-themes";
import { useRouter } from "next/navigation";
import { doc, updateDoc, increment, collection, query, orderBy, limit, addDoc, serverTimestamp } from "firebase/firestore";
import { roles as ROLES_LIST } from "@/lib/roles";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogFooter, 
  DialogDescription 
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { useMemoFirebase } from "@/firebase/provider";
import IdCaptureWizard from "@/components/IdCaptureWizard";
import Link from "next/link";

/**
 * المستشار الذكي (The Smart Consultant) - واجهة المواطنين السيادية.
 * تم تصميمها لتكون الأكثر سلاسة وفخامة في العالم العربي.
 */
export default function SmartConsultantPage() {
  const { user, profile, signOut, role } = useUser();
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

  const toggleRecording = () => {
    if (typeof window !== "undefined") {
      const SpeechRecognition = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition;
      if (!SpeechRecognition) {
        toast({ variant: "destructive", title: "تنبيه", description: "متصفحك لا يدعم التعرف على الصوت." });
        return;
      }
      const recognition = new SpeechRecognition();
      recognition.lang = 'ar-SA';
      
      if (!isRecording) {
        recognition.start();
        setIsRecording(true);
        recognition.onresult = (event: any) => {
          const text = event.results[0][0].transcript;
          setInputText(prev => prev + " " + text);
          setIsRecording(false);
        };
        recognition.onerror = () => setIsRecording(false);
        recognition.onend = () => setIsRecording(false);
      } else {
        recognition.stop();
        setIsRecording(false);
      }
    }
  };

  const handleSend = async (customText?: string) => {
    const text = customText || inputText.trim();
    if (!text || isTyping || !db || !user) return;

    if (role === ROLES_LIST.USER && (profile?.balance || 0) < 1) {
      toast({ variant: "destructive", title: "رصيد غير كافٍ", description: "يرجى شحن محفظتك للمتابعة." });
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
      toast({ variant: "destructive", title: "فشل الإرسال" });
    } finally {
      setIsTyping(false);
    }
  };

  const SidebarContent = () => (
    <div className="flex flex-col h-full bg-[#050510] border-l border-white/5 relative">
      <div className="p-8 border-b border-white/5 flex items-center gap-4 bg-black/40">
        <div className="h-12 w-12 rounded-2xl bg-primary/20 flex items-center justify-center shadow-xl border border-primary/20">
          <Scale className="h-6 w-6 text-primary" />
        </div>
        <div>
          <h2 className="text-xl font-black text-white tracking-tight">المستشار <span className="text-primary">الذكي</span></h2>
          <p className="text-[8px] font-black text-white/30 uppercase tracking-widest">Smart Citizen Assistant</p>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        <button onClick={() => setInputText("")} className="w-full flex items-center gap-4 px-6 py-4 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all font-black text-xs">
          <Plus className="h-4 w-4 text-primary" /> استشارة جديدة
        </button>

        <div className="space-y-2">
          <p className="text-[9px] font-black text-white/20 uppercase tracking-[0.2em] px-4">أوامر مباشرة</p>
          <CommandBtn icon={<FileText />} text="تحليل عقد عمل" onClick={() => handleSend("قم بتحليل عقد عملي وتوضيح الثغرات القانونية.")} color="blue" />
          <CommandBtn icon={<Zap />} text="استشارة فورية" onClick={() => handleSend("أحتاج استشارة سريعة في موضوع مستعجل.")} color="amber" />
          <CommandBtn icon={<MessageSquare />} text="صياغة خطاب رسمي" onClick={() => handleSend("ساعدني في صياغة خطاب رسمي موجه لجهة حكومية.")} color="emerald" />
        </div>
      </div>

      <div className="p-6 border-t border-white/5 bg-black/40 space-y-4">
        <div className="flex items-center justify-between bg-white/5 p-4 rounded-2xl border border-white/5">
           <div className="flex items-center gap-3">
              <Wallet className="h-4 w-4 text-primary" />
              <span className="text-sm font-black tabular-nums">{profile?.balance || 0} EGP</span>
           </div>
           <Link href="/pricing" className="text-[9px] font-black text-primary hover:underline">شحن</Link>
        </div>
        <button onClick={() => signOut()} className="w-full flex items-center gap-4 px-6 py-3 rounded-xl text-white/40 hover:text-red-500 transition-all font-black text-[10px] uppercase">
          <LogOut className="h-4 w-4" /> إنهاء الجلسة
        </button>
      </div>
    </div>
  );

  return (
    <ProtectedRoute>
      <div className="flex h-screen bg-[#02020a] overflow-hidden font-sans" dir="rtl">
        <AnimatePresence mode="wait">
          {isSidebarOpen && (
            <motion.aside initial={{ width: 0, opacity: 0 }} animate={{ width: 320, opacity: 1 }} exit={{ width: 0, opacity: 0 }} className="hidden lg:flex flex-col flex-shrink-0 z-50 overflow-hidden">
              <SidebarContent />
            </motion.aside>
          )}
        </AnimatePresence>

        <div className="flex-1 flex flex-col relative">
          <header className="h-20 bg-black/40 backdrop-blur-3xl border-b border-white/5 flex items-center justify-between px-8 z-40">
            <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="p-3 bg-white/5 rounded-xl text-primary hover:bg-white/10 border border-white/5 shadow-inner">
              {isSidebarOpen ? <ChevronLeft className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
            <div className="flex items-center gap-4">
              {role === ROLES_LIST.ADMIN && (
                <Link href="/admin">
                  <Button variant="outline" className="rounded-xl border-primary/20 text-primary hover:bg-primary/10 gap-2 font-black text-xs h-10 px-5 shadow-lg shadow-primary/5">
                    <LayoutDashboard className="h-4 w-4" /> غرفة القيادة
                  </Button>
                </Link>
              )}
              <button onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')} className="p-2.5 bg-white/5 rounded-xl text-primary border border-white/5">
                {theme === 'dark' ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
              </button>
            </div>
          </header>

          <main className="flex-1 flex flex-col relative overflow-hidden bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-primary/5 via-transparent to-transparent">
            <div ref={scrollRef} className="flex-1 overflow-y-auto p-8 space-y-10 pb-40 scrollbar-thin">
              <div className="max-w-4xl mx-auto space-y-8">
                {cloudMessages?.length === 0 && (
                  <div className="py-20 text-center space-y-8">
                    <div className="h-24 w-24 bg-primary/10 rounded-[2.5rem] mx-auto flex items-center justify-center border border-primary/20 shadow-3xl float-sovereign">
                      <Sparkles className="h-12 w-12 text-primary" />
                    </div>
                    <h2 className="text-4xl font-black text-white tracking-tighter">أهلاً بك في فضاء العدالة</h2>
                    <p className="text-sm text-white/30 font-bold max-w-sm mx-auto uppercase tracking-widest leading-relaxed">أنا المستشار الذكي، جاهز لتحليل استفساراتك القانونية وتوليد الوثائق بدقة تامة.</p>
                  </div>
                )}

                {cloudMessages?.map((m) => (
                  <motion.div key={m.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className={`flex flex-col ${m.role === 'user' ? 'items-start' : 'items-end'}`}>
                    <div className={`p-6 rounded-[2.5rem] max-w-[85%] text-lg leading-relaxed shadow-2xl relative ${
                      m.role === 'user' ? 'bg-white text-slate-900 font-bold rounded-tr-none' : 'bg-[#0a0a1f] text-white border border-primary/20 rounded-tl-none font-medium'
                    }`}>
                      {m.text}
                    </div>
                  </motion.div>
                ))}
                {isTyping && <div className="p-4 bg-primary/5 rounded-full w-fit animate-pulse text-[8px] font-black uppercase text-primary">جاري التحليل الذكي...</div>}
              </div>
            </div>

            <div className="absolute bottom-0 inset-x-0 p-8 z-20">
              <div className="max-w-4xl mx-auto space-y-4">
                <div className="flex items-center gap-3">
                   <ToolBtn icon={<Paperclip />} onClick={() => fileInputRef.current?.click()} tooltip="إرفاق ملف" />
                   <ToolBtn icon={<Camera />} onClick={() => setIsCameraOpen(true)} tooltip="التقاط صورة" />
                   <ToolBtn icon={<Mic />} onClick={toggleRecording} active={isRecording} color="red" tooltip="إملاء صوتي" />
                   <input type="file" ref={fileInputRef} className="hidden" multiple onChange={() => toast({ title: "تم إرفاق الملفات ✅" })} />
                </div>
                <div className="relative glass-cosmic border-2 border-white/10 rounded-[2.5rem] overflow-hidden shadow-3xl focus-within:border-primary/40 transition-all duration-500">
                  <div className="flex items-center px-8 py-5 gap-6">
                    <textarea 
                      value={inputText} 
                      onChange={(e) => setInputText(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && handleSend()}
                      placeholder="اسأل المستشار الذكي..."
                      className="flex-1 bg-transparent border-none outline-none text-xl font-bold text-white placeholder:text-white/10 resize-none py-2 max-h-40 scrollbar-none"
                      rows={1}
                    />
                    <button onClick={() => handleSend()} disabled={!inputText.trim() || isTyping} className="h-16 w-16 rounded-[1.5rem] bg-primary text-white flex items-center justify-center shadow-xl hover:scale-110 active:scale-95 transition-all disabled:opacity-20">
                      {isTyping ? <Loader2 className="animate-spin" /> : <Send className="rotate-180 h-7 w-7" />}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </main>
        </div>
      </div>

      <Dialog open={isCameraOpen} onOpenChange={setIsCameraOpen}>
        <DialogContent className="glass-cosmic border-none rounded-[3rem] p-10 max-w-2xl bg-black shadow-3xl">
           <DialogHeader className="mb-6">
              <DialogTitle className="text-2xl font-black text-white text-right">محرك الالتقاط السيادي</DialogTitle>
              <DialogDescription className="text-right text-white/40 font-bold">يرجى توثيق الوثيقة المطلوبة لتعزيز التحليل القانوني.</DialogDescription>
           </DialogHeader>
           <IdCaptureWizard onComplete={() => { setIsCameraOpen(false); toast({ title: "تم التقاط الوثيقة السيادية ✅" }); }} />
        </DialogContent>
      </Dialog>
    </ProtectedRoute>
  );
}

function CommandBtn({ icon, text, onClick, color }: any) {
  const colors: any = {
    blue: "text-blue-400 bg-blue-500/5 hover:bg-blue-500/10 border-blue-500/10",
    amber: "text-amber-400 bg-amber-500/5 hover:bg-amber-500/10 border-amber-500/10",
    emerald: "text-emerald-400 bg-emerald-500/5 hover:bg-emerald-500/10 border-emerald-500/10",
  };
  return (
    <button onClick={onClick} className={`w-full flex items-center justify-between px-6 py-4 rounded-2xl border transition-all group ${colors[color]}`}>
      <span className="text-xs font-black">{text}</span>
      <span className="group-hover:scale-110 transition-transform">{icon}</span>
    </button>
  );
}

function ToolBtn({ icon, onClick, active, color, tooltip }: any) {
  return (
    <button onClick={onClick} title={tooltip} className={`h-12 w-12 rounded-xl flex items-center justify-center transition-all border shadow-lg ${active ? 'bg-red-500 border-red-500 text-white animate-pulse' : 'bg-white/5 border-white/5 text-white/40 hover:text-primary hover:border-primary/20'}`}>
      {icon}
    </button>
  );
}
