
"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Send, Scale, LogOut, LayoutDashboard, Crown, Sparkles, 
  Menu, X, Plus, Copy, Wallet, Sun, Moon,
  ChevronLeft, Loader2, Cpu, Activity, ShieldCheck, Zap
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
import { useMemoFirebase } from "@/firebase/provider";

/**
 * مركز قيادة البوت السيادي (Sovereign AI Command Node).
 * واجهة تفاعلية مع قائمة جانبية دائمة ونظام "التحكم الآلي".
 */
export default function SovereignBotPage() {
  const { user, profile, signOut, role } = useUser();
  const db = useFirestore();
  const { theme, setTheme } = useTheme();
  const { toast } = useToast();
  const router = useRouter();
  
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [inputText, setInputText] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [isAutopilot, setIsAutopilot] = useState(false);

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

  const handleSend = async (customText?: string) => {
    const text = customText || inputText.trim();
    if (!text || isTyping || !db || !user) return;

    if (role === ROLES_LIST.USER && (profile?.balance || 0) < 1) {
      toast({ variant: "destructive", title: "رصيد غير كافٍ", description: "يرجى شحن المحفظة السيادية." });
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

      // محاكاة استدعاء المحرك السيادي
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          prompt: text, 
          persona: isAutopilot ? "المتحكم الآلي السيادي" : "مستشار قانوني" 
        })
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
    <div className="flex flex-col h-full bg-[#050510] border-l border-white/5 relative shadow-2xl">
      <div className="p-8 border-b border-white/5 flex items-center gap-4 bg-black/40">
        <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-primary to-indigo-600 flex items-center justify-center shadow-xl">
          <Cpu className="h-6 w-6 text-white animate-pulse" />
        </div>
        <div>
          <h2 className="text-xl font-black text-white tracking-tight">كوكب <span className="text-primary">العدالة</span></h2>
          <p className="text-[8px] font-black text-white/30 uppercase tracking-widest">Sovereign Intel Node</p>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        <button onClick={() => setInputText("")} className="w-full flex items-center gap-4 px-6 py-4 rounded-2xl bg-primary text-white shadow-lg shadow-primary/20 hover:scale-[1.02] transition-all font-black text-xs uppercase">
          <Plus className="h-4 w-4" /> محادثة سيادية جديدة
        </button>

        <div className="space-y-2 pt-4">
          <p className="text-[10px] font-black text-white/20 uppercase tracking-[0.2em] px-4">أدوات التحكم</p>
          <button 
            onClick={() => setIsAutopilot(!isAutopilot)}
            className={`w-full flex items-center justify-between px-6 py-4 rounded-2xl border transition-all ${isAutopilot ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-500' : 'bg-white/5 border-white/5 text-white/40 hover:bg-white/10'}`}
          >
            <div className="flex items-center gap-3">
              <Zap className={`h-4 w-4 ${isAutopilot ? 'animate-pulse' : ''}`} />
              <span className="text-xs font-black">التحكم الآلي</span>
            </div>
            <div className={`h-2 w-2 rounded-full ${isAutopilot ? 'bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]' : 'bg-white/10'}`} />
          </button>
        </div>

        <div className="pt-6 px-4">
          <p className="text-[10px] font-black text-white/20 uppercase tracking-[0.2em]">أرشيف القيادة</p>
        </div>
        <div className="space-y-1">
          <SideHistoryItem text="استشارة king2026 الأخيرة" active />
          <SideHistoryItem text="تحليل بروتوكول الأمان" />
        </div>
      </div>

      <div className="p-6 bg-black/40 border-t border-white/5 space-y-3">
        <div className="flex items-center gap-4 p-4 rounded-2xl bg-white/5 border border-white/5">
           <div className="h-10 w-10 rounded-xl bg-primary/20 flex items-center justify-center font-black text-primary">K</div>
           <div className="flex-1 min-w-0">
              <p className="text-xs font-black text-white truncate">{profile?.fullName || "king2026"}</p>
              <Badge className="bg-primary/10 text-primary border-none text-[8px] px-2 py-0">SUPREME</Badge>
           </div>
           <button onClick={() => signOut()} className="text-white/20 hover:text-red-500 transition-colors">
              <LogOut className="h-4 w-4" />
           </button>
        </div>
        <button onClick={() => router.push("/dashboard")} className="w-full flex items-center gap-4 px-6 py-3 rounded-xl text-white/40 hover:text-white hover:bg-white/5 transition-all font-black text-[10px] uppercase">
          <LayoutDashboard className="h-4 w-4" /> العودة للمركز
        </button>
      </div>
    </div>
  );

  return (
    <ProtectedRoute>
      <div className="flex h-screen bg-[#02020a] overflow-hidden font-sans" dir="rtl">
        
        {/* Persistent Desktop Sidebar */}
        <AnimatePresence mode="wait">
          {isSidebarOpen && (
            <motion.aside 
              initial={{ width: 0, opacity: 0 }} animate={{ width: 320, opacity: 1 }} exit={{ width: 0, opacity: 0 }}
              className="hidden lg:flex flex-col flex-shrink-0 z-50 overflow-hidden"
            >
              <SidebarContent />
            </motion.aside>
          )}
        </AnimatePresence>

        <div className="flex-1 flex flex-col relative">
          {/* Header Node */}
          <header className="h-20 bg-black/40 backdrop-blur-3xl border-b border-white/5 flex items-center justify-between px-8 z-40">
            <div className="flex items-center gap-6">
              <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="p-3 bg-white/5 rounded-xl text-primary hover:bg-white/10 transition-all shadow-inner border border-white/5">
                {isSidebarOpen ? <ChevronLeft className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
              </button>
              <div>
                <h1 className="text-sm font-black text-white uppercase tracking-widest flex items-center gap-2">
                  Supreme Command <span className={`h-1.5 w-1.5 rounded-full ${isAutopilot ? 'bg-emerald-500 animate-pulse' : 'bg-primary'}`} />
                </h1>
                <p className="text-[9px] text-white/20 font-bold uppercase">{isAutopilot ? "Autopilot Controller: Standby" : "Manual Command Active"}</p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="bg-white/5 border border-white/5 px-5 py-2.5 rounded-xl flex items-center gap-3">
                <Wallet className="h-4 w-4 text-primary" />
                <span className="text-sm font-black text-white tabular-nums">{profile?.balance || 0} <span className="text-[9px] opacity-40">EGP</span></span>
              </div>
              <button onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')} className="p-3 bg-white/5 rounded-xl text-primary border border-white/5">
                {theme === 'dark' ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
              </button>
            </div>
          </header>

          {/* Main Workspace */}
          <main className="flex-1 flex flex-col relative overflow-hidden bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-primary/5 via-transparent to-transparent">
            <div ref={scrollRef} className="flex-1 overflow-y-auto p-8 space-y-10 scrollbar-thin">
              <div className="max-w-4xl mx-auto space-y-10 pb-32">
                
                {cloudMessages?.length === 0 && (
                  <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="py-20 text-center space-y-8">
                    <div className="h-24 w-24 bg-primary/10 rounded-[2.5rem] mx-auto flex items-center justify-center border border-primary/20 shadow-3xl float-sovereign">
                      <Sparkles className="h-12 w-12 text-primary" />
                    </div>
                    <div className="space-y-3">
                      <h2 className="text-4xl font-black text-white tracking-tighter">أوامرك سيادة المالك..</h2>
                      <p className="text-sm text-white/30 font-bold max-w-sm mx-auto uppercase tracking-widest">Sovereign Control System king2026</p>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-xl mx-auto px-4">
                       <CommandCard text="تولى السيطرة والتحليل" onClick={() => { setIsAutopilot(true); handleSend("تولى السيطرة وقم بتقديم تقرير عن الحالة الراهنة للنظام."); }} icon={<Zap />} />
                       <CommandCard text="فحص سجلات المواطنين" onClick={() => handleSend("قم بإجراء فحص شامل لسجلات المواطنين وتحديد أي نشاط مشبوه.")} icon={<Search />} />
                    </div>
                  </motion.div>
                )}

                {cloudMessages?.map((m) => (
                  <motion.div key={m.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className={`flex flex-col ${m.role === 'user' ? 'items-start' : 'items-end'}`}>
                    <div className={`p-7 rounded-[2.5rem] max-w-[85%] text-lg leading-relaxed border shadow-2xl relative group ${
                      m.role === 'user' 
                        ? 'bg-white text-slate-900 border-white/10 rounded-tr-none font-bold' 
                        : 'bg-[#0a0a1f] backdrop-blur-xl text-white border-primary/20 rounded-tl-none font-medium'
                    }`}>
                      {m.text}
                      <div className="flex items-center gap-3 mt-4 pt-4 border-t border-white/5 opacity-30 text-[9px] font-black uppercase tracking-widest">
                         {m.role === 'ai' && <Badge className="bg-primary/20 text-primary border-none">Controller AI</Badge>}
                         <span className="mr-auto">{m.timestamp?.toDate ? m.timestamp.toDate().toLocaleTimeString("ar-EG") : "Now"}</span>
                      </div>
                    </div>
                  </motion.div>
                ))}

                {isTyping && (
                  <div className="flex items-center gap-3 p-4 bg-primary/5 border border-primary/10 rounded-full w-fit animate-pulse">
                    <div className="w-1.5 h-1.5 bg-primary rounded-full" />
                    <div className="w-1.5 h-1.5 bg-primary rounded-full delay-100" />
                    <div className="w-1.5 h-1.5 bg-primary rounded-full delay-200" />
                    <span className="text-[8px] font-black text-primary uppercase tracking-[0.2em] mr-2">Sovereign Intel Processing</span>
                  </div>
                )}
              </div>
            </div>

            {/* Input Node */}
            <div className="absolute bottom-0 inset-x-0 p-8 z-20">
              <div className="max-w-4xl mx-auto">
                <div className="relative glass-cosmic border-2 border-white/10 rounded-[2.5rem] overflow-hidden shadow-3xl focus-within:border-primary/40 transition-all duration-500">
                  <div className="flex items-center px-8 py-5 gap-6">
                    <textarea 
                      value={inputText} 
                      onChange={(e) => setInputText(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && handleSend()}
                      placeholder={isAutopilot ? "أعطِ أمراً للمستشار السيادي..." : "اكتب استفسارك هنا..."}
                      className="flex-1 bg-transparent border-none outline-none text-xl font-bold text-white placeholder:text-white/10 resize-none py-2 max-h-40 scrollbar-none"
                      rows={1}
                    />
                    <button 
                      onClick={() => handleSend()}
                      disabled={!inputText.trim() || isTyping}
                      className="h-16 w-16 rounded-[1.5rem] bg-gradient-to-br from-primary to-indigo-700 text-white flex items-center justify-center shadow-xl hover:scale-110 active:scale-95 transition-all disabled:opacity-20"
                    >
                      {isTyping ? <Loader2 className="animate-spin" /> : <Send className="rotate-180 h-7 w-7" />}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </main>
        </div>
      </div>
    </ProtectedRoute>
  );
}

function SideHistoryItem({ text, active = false }: any) {
  return (
    <button className={`w-full text-right px-6 py-4 rounded-2xl text-[11px] font-black transition-all border ${active ? 'bg-primary/10 border-primary/20 text-primary shadow-lg' : 'border-transparent text-white/20 hover:bg-white/[0.02] hover:text-white/60'}`}>
      {text}
    </button>
  );
}

function CommandCard({ text, onClick, icon }: any) {
  return (
    <button onClick={onClick} className="p-6 glass rounded-[2rem] border-white/5 text-right hover:border-primary/40 hover:bg-primary/5 transition-all group flex items-center justify-between gap-4">
      <span className="text-sm font-black text-white/40 group-hover:text-white transition-colors">{text}</span>
      <div className="h-10 w-10 rounded-xl bg-white/5 flex items-center justify-center text-primary group-hover:scale-110 transition-transform">{icon}</div>
    </button>
  );
}
