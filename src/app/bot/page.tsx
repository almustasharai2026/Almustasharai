"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Send, Scale, LogOut, LayoutDashboard, Users, Gavel, ShieldAlert, Tag, Activity,
  Menu, X, Plus, Copy, Trash2, Wallet, Crown, Search, Bell, Sun, Moon,
  ArrowLeft, Mic, Paperclip, Camera, Sparkles, MessageCircle, ChevronLeft, Loader2
} from "lucide-react";
import ProtectedRoute from "@/components/ProtectedRoute";
import { useUser, useFirestore } from "@/firebase";
import { useToast } from "@/hooks/use-toast";
import { useTheme } from "next-themes";
import { useRouter } from "next/navigation";
import { doc, updateDoc, increment } from "firebase/firestore";
import { getPermissions, roles as ROLES_LIST } from "@/lib/roles";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import Image from "next/image";

interface Message {
  role: "user" | "ai";
  text: string;
  id: string;
  timestamp: Date;
}

/**
 * مركز قيادة البوت السيادي (Elite AI Command Hub).
 * واجهة فائقة الاحترافية تعتمد نظام Glassmorphism لتعزيز تجربة الاستشارة القانونية.
 */
export default function SovereignBotPage() {
  const { user, profile, signOut, role } = useUser();
  const db = useFirestore();
  const { theme, setTheme } = useTheme();
  const { toast } = useToast();
  const router = useRouter();
  const perms = getPermissions(role);
  
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [messages, setMessages] = useState<Message[]>([
    { role: "ai", text: `أهلاً بك يا سيادة ${profile?.fullName?.split(' ')[0] || 'المواطن'} في مركز الاستشارة السيادي. كيف نخدم العدالة اليوم؟`, id: "init", timestamp: new Date() }
  ]);
  const [inputText, setInputText] = useState("");
  const [isTyping, setIsTyping] = useState(false);

  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
    }
  }, [messages, isTyping]);

  const handleSend = async () => {
    if (!inputText.trim() || isTyping || !db || !user) return;

    if (role === ROLES_LIST.USER && (profile?.balance || 0) < 1) {
      toast({ variant: "destructive", title: "رصيد غير كافٍ", description: "يرجى شحن المحفظة السيادية للمتابعة." });
      return;
    }

    const userMsg: Message = { role: "user", text: inputText.trim(), id: Date.now().toString(), timestamp: new Date() };
    setMessages(prev => [...prev, userMsg]);
    setInputText("");
    setIsTyping(true);

    try {
      if (role !== ROLES_LIST.ADMIN) {
        await updateDoc(doc(db, "users", user.uid), { balance: increment(-1) });
      }

      // 🔥 محاكاة الرد السيادي (سيتم ربطه بـ Gemini لاحقاً)
      setTimeout(() => {
        const aiMsg: Message = { 
          role: "ai", 
          text: "تم تحليل استفسارك سيادياً. بناءً على نظام الإجراءات القانونية المعتمد، يوصى بمراجعة المستندات الثبوتية قبل اتخاذ أي قرار نهائي. هل تود الحصول على مسودة قانونية لهذه الحالة؟", 
          id: (Date.now() + 1).toString(),
          timestamp: new Date()
        };
        setMessages(prev => [...prev, aiMsg]);
        setIsTyping(false);
      }, 1500);
    } catch (e) {
      toast({ variant: "destructive", title: "فشل الإرسال" });
      setIsTyping(false);
    }
  };

  const handleLogout = async () => {
    await signOut();
    router.push("/auth/login");
  };

  const SidebarContent = () => (
    <div className="flex flex-col h-full bg-[#0a0a1f]/95 dark:bg-[#02020a]/95 backdrop-blur-3xl border-l border-white/5 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-primary/5 to-transparent pointer-events-none" />
      
      <div className="p-10 border-b border-white/5 flex items-center gap-5 bg-black/20 relative z-10">
        <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-primary to-amber-600 flex items-center justify-center shadow-3xl border border-white/20">
          <Scale className="h-8 w-8 text-white" />
        </div>
        <div>
          <h2 className="text-2xl font-black tracking-tighter text-white">المستشار <span className="text-primary">AI</span></h2>
          <p className="text-[9px] font-black text-primary uppercase tracking-[0.3em]">Sovereign Elite</p>
        </div>
      </div>

      <nav className="flex-1 p-6 space-y-3 overflow-y-auto relative z-10 scrollbar-thin">
        <p className="text-[10px] text-white/20 font-black uppercase tracking-widest px-4 mb-2">القائمة السيادية</p>
        <SideBtn icon={<MessageCircle />} text="الدردشة الذكية" active={true} />
        <SideBtn icon={<Gavel />} text="مجلس الخبراء" onClick={() => router.push("/consultants")} />
        <SideBtn icon={<Tag />} text="المكتبة القانونية" onClick={() => router.push("/templates")} />
        <SideBtn icon={<Wallet />} text="باقات الشحن" onClick={() => router.push("/pricing")} />
        
        {perms.canManageUsers && (
          <>
            <p className="text-[10px] text-white/20 font-black uppercase tracking-widest pt-10 px-4 mb-2">غرفة القيادة</p>
            <SideBtn icon={<LayoutDashboard />} text="لوحة التحكم" onClick={() => router.push("/admin")} />
            <SideBtn icon={<ShieldAlert />} text="الدرع الواقي" onClick={() => router.push("/admin")} />
          </>
        )}
      </nav>

      <div className="p-8 border-t border-white/5 bg-black/30 relative z-10">
        <button onClick={handleLogout} className="w-full flex items-center gap-5 px-6 py-4 rounded-2xl text-white/40 hover:text-white hover:bg-red-500/20 transition-all font-black text-sm group">
          <LogOut className="h-5 w-5 group-hover:translate-x-1 transition-transform" /> خروج سيادي
        </button>
      </div>
    </div>
  );

  return (
    <ProtectedRoute>
      <div className="flex h-screen bg-[#f8f9fc] dark:bg-[#020617] overflow-hidden font-sans" dir="rtl">
        
        {/* Elite Sidebar */}
        <AnimatePresence mode="wait">
          {isSidebarOpen && (
            <motion.aside 
              initial={{ x: "100%", opacity: 0 }} animate={{ x: 0, opacity: 1 }} exit={{ x: "100%", opacity: 0 }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="w-80 h-full text-white flex flex-col z-50 shadow-3xl flex-shrink-0 relative overflow-hidden"
            >
              <SidebarContent />
            </motion.aside>
          )}
        </AnimatePresence>

        {/* Supreme Chat Engine */}
        <div className="flex-1 flex flex-col relative overflow-hidden">
          
          {/* Header */}
          <header className="h-24 bg-white/80 dark:bg-[#020617]/80 backdrop-blur-3xl border-b border-border flex items-center justify-between px-10 z-40">
            <div className="flex items-center gap-8">
              <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="p-4 bg-primary/5 rounded-2xl hover:bg-primary/10 transition-all border border-primary/10 shadow-inner">
                {isSidebarOpen ? <ChevronLeft className="h-6 w-6 text-primary" /> : <Menu className="h-6 w-6 text-primary" />}
              </button>
              <div className="flex flex-col">
                <h1 className="text-xl font-black tracking-tight text-slate-900 dark:text-white uppercase">Sovereign Chat Node Active</h1>
                <div className="flex items-center gap-3 mt-1">
                   <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                   <span className="text-[9px] font-black text-emerald-500 uppercase tracking-[0.2em]">Encrypted Connection Active</span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-6">
              <div className="flex items-center gap-4 bg-slate-100 dark:bg-white/5 px-6 py-3 rounded-2xl border border-border dark:border-white/5 shadow-inner group cursor-pointer" onClick={() => router.push("/pricing")}>
                <Wallet className="h-5 w-5 text-primary group-hover:scale-110 transition-transform" />
                <span className="text-lg font-black tabular-nums text-slate-900 dark:text-white">{role === ROLES_LIST.ADMIN ? '∞' : (profile?.balance || 0)} <span className="text-[10px] opacity-40">EGP</span></span>
                <Plus className="h-4 w-4 text-primary opacity-40 group-hover:opacity-100" />
              </div>
              <button onClick={() => setTheme(theme === "dark" ? "light" : "dark")} className="p-4 bg-slate-100 dark:bg-white/5 rounded-2xl border border-border dark:border-white/5 hover:bg-primary/5 transition-all text-primary shadow-sm">
                {theme === "dark" ? <Sun className="h-6 w-6" /> : <Moon className="h-6 w-6" />}
              </button>
            </div>
          </header>

          {/* Messages Area */}
          <main className="flex-1 relative flex flex-col bg-slate-50 dark:bg-[#020617] overflow-hidden">
            {/* Cinematic Background for Chat */}
            <div className="absolute inset-0 opacity-[0.03] dark:opacity-[0.05] pointer-events-none">
               <Image src="https://images.unsplash.com/photo-1589829545856-d10d557cf95f?q=80&w=2070&auto=format&fit=crop" fill className="object-cover" alt="bg" />
            </div>

            <div ref={scrollRef} className="flex-1 overflow-y-auto p-10 space-y-12 relative z-10">
              <div className="max-w-4xl mx-auto space-y-12 pb-20">
                {messages.map((m) => (
                  <motion.div 
                    key={m.id} 
                    initial={{ opacity: 0, y: 20 }} 
                    animate={{ opacity: 1, y: 0 }} 
                    className={`flex flex-col ${m.role === "user" ? "items-start" : "items-end"}`}
                  >
                    <div className="flex items-center gap-3 mb-3 px-6">
                       <span className="text-[9px] font-black text-muted-foreground uppercase tracking-widest">
                         {m.role === "user" ? profile?.fullName || "المواطن" : "المستشار السيادي"}
                       </span>
                    </div>
                    <div className={`p-8 rounded-[3rem] text-sm max-w-[90%] shadow-2xl border leading-relaxed ${
                      m.role === "user" 
                        ? "bg-white dark:bg-slate-900 text-slate-800 dark:text-white border-slate-200 dark:border-slate-800 rounded-tr-none" 
                        : "bg-primary/5 dark:bg-primary/10 text-primary dark:text-white border-primary/20 dark:border-primary/20 rounded-tl-none font-medium backdrop-blur-xl"
                    }`}>
                      <p className="text-xl leading-loose font-bold">{m.text}</p>
                      <div className="flex items-center gap-2 mt-6 pt-5 border-t border-black/5 dark:border-white/5">
                         <button onClick={() => { navigator.clipboard.writeText(m.text); toast({ title: "تم النسخ السيادي" }); }} className="p-2.5 hover:bg-black/5 dark:hover:bg-white/5 rounded-xl text-slate-400 transition-all hover:text-primary"><Copy className="h-4 w-4" /></button>
                         {m.id !== "init" && <button onClick={() => setMessages(prev => prev.filter(msg => msg.id !== m.id))} className="p-2.5 hover:bg-red-500/10 rounded-xl text-red-400 transition-all"><Trash2 className="h-4 w-4" /></button>}
                         <span className="mr-auto text-[9px] font-black opacity-20 tabular-nums uppercase tracking-widest">{m.timestamp.toLocaleTimeString("ar-EG")}</span>
                      </div>
                    </div>
                  </motion.div>
                ))}
                
                {isTyping && (
                  <div className="flex items-center gap-3 p-6 glass rounded-full w-fit animate-pulse border border-primary/20">
                    <div className="w-2 h-2 bg-primary rounded-full" />
                    <div className="w-2 h-2 bg-primary rounded-full delay-100" />
                    <div className="w-2 h-2 bg-primary rounded-full delay-200" />
                    <span className="text-[10px] font-black text-primary uppercase tracking-widest mr-2">Sovereign Intel Processing</span>
                  </div>
                )}
              </div>
            </div>

            {/* Input Engine */}
            <div className="p-10 bg-gradient-to-t from-slate-50 dark:from-[#020617] via-slate-50 dark:via-[#020617] to-transparent z-20">
              <div className="max-w-4xl mx-auto">
                <div className="relative group">
                  <div className="absolute inset-0 bg-primary/20 rounded-[2.5rem] blur-2xl opacity-0 group-focus-within:opacity-100 transition-opacity duration-700" />
                  
                  <div className="relative bg-white dark:bg-slate-900 border-2 border-border dark:border-white/5 rounded-[2.5rem] shadow-3xl flex flex-col overflow-hidden focus-within:border-primary/40 transition-all">
                    <div className="flex items-center gap-2 px-6 py-4 border-b border-black/5 dark:border-white/5 bg-black/[0.02] dark:bg-white/[0.02]">
                       <ToolBtn icon={<Paperclip />} tooltip="إرفاق ملفات" />
                       <ToolBtn icon={<Camera />} tooltip="التقاط وثيقة" />
                       <ToolBtn icon={<Mic />} tooltip="إملاء صوتي" />
                       <div className="h-6 w-px bg-black/5 dark:bg-white/5 mx-2" />
                       <ToolBtn icon={<Sparkles />} tooltip="تحسين الصياغة السيادية" />
                    </div>

                    <div className="flex items-center px-8 py-4 gap-6">
                      <textarea 
                        value={inputText} 
                        onChange={(e) => setInputText(e.target.value)} 
                        onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && handleSend()} 
                        placeholder="اطرح استفسارك القانوني بأسلوب رصين..." 
                        rows={1}
                        className="flex-1 bg-transparent border-none outline-none text-xl font-bold text-slate-900 dark:text-white placeholder:text-slate-300 dark:placeholder:text-white/10 resize-none py-4 max-h-48"
                      />
                      <button 
                        onClick={handleSend} 
                        disabled={!inputText.trim() || isTyping} 
                        className="h-16 w-16 bg-gradient-to-br from-primary to-indigo-700 text-white rounded-3xl flex items-center justify-center shadow-2xl hover:scale-110 active:scale-90 transition-all disabled:opacity-30 disabled:grayscale"
                      >
                        {isTyping ? <Loader2 className="h-8 w-8 animate-spin" /> : <Send className="h-8 w-8 rotate-180" />}
                      </button>
                    </div>
                  </div>
                </div>
                <p className="text-center text-[9px] font-black text-muted-foreground uppercase tracking-[0.4em] mt-6 opacity-30">
                  Encrypted AI Sovereign Node v4.5
                </p>
              </div>
            </div>
          </main>
        </div>
      </div>
    </ProtectedRoute>
  );
}

function SideBtn({ icon, text, active, onClick }: any) {
  return (
    <button 
      onClick={onClick} 
      className={`w-full flex items-center gap-6 px-8 py-5 rounded-[1.8rem] transition-all duration-500 font-black text-sm relative group ${
        active 
          ? "bg-white/20 text-white shadow-3xl scale-[1.05]" 
          : "text-white/20 hover:text-white hover:bg-white/5"
      }`}
    >
      {active && <motion.div layoutId="nav-active" className="absolute inset-0 bg-white/10 rounded-[1.8rem] -z-10 shadow-3xl" />}
      <span className={`shrink-0 transition-transform duration-500 ${active ? "scale-125" : "group-hover:scale-110"}`}>{icon}</span>
      <span className="tracking-tight text-lg">{text}</span>
    </button>
  );
}

function ToolBtn({ icon, tooltip }: any) {
  return (
    <button className="p-3 rounded-xl text-slate-400 hover:text-primary hover:bg-primary/10 transition-all group relative" title={tooltip}>
      <span className="scale-110 inline-block group-hover:rotate-12 transition-transform">{icon}</span>
    </button>
  );
}
