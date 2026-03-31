
"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Send, Cpu, ShieldCheck, Sparkles, Copy, Trash2, Reply, 
  Settings, Users, Gavel, ShieldAlert, Tag, Activity, 
  Bell, Moon, Sun, Search, X, Plus, Menu, Home, LogOut,
  Scale, ChevronLeft
} from "lucide-react";
import ProtectedRoute from "@/components/ProtectedRoute";
import Image from "next/image";
import { useUser } from "@/firebase";
import { useToast } from "@/hooks/use-toast";
import { useTheme } from "next-themes";
import { useRouter } from "next/navigation";

interface Message {
  role: "user" | "ai";
  text: string;
  id: string;
}

export default function SovereignFinalDashboard() {
  const { profile, signOut } = useUser();
  const { theme, setTheme } = useTheme();
  const { toast } = useToast();
  const router = useRouter();
  
  const [currentPage, setCurrentPage] = useState("home");
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [messages, setMessages] = useState<Message[]>([
    { role: "ai", text: "أهلاً بك يا سيادة المالك في النسخة النهائية المتقدمة. أنا محركك السيادي، جاهز لإدارة شؤون الكوكب.", id: "init" }
  ]);
  const [inputText, setInputText] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [notifCount, setNotifCount] = useState(0);
  
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
    }
  }, [messages, isTyping, currentPage]);

  const handleSend = () => {
    if (!inputText.trim() || isTyping) return;

    const userMsg: Message = { role: "user", text: inputText.trim(), id: Date.now().toString() };
    setMessages(prev => [...prev, userMsg]);
    setInputText("");
    setIsTyping(true);

    setTimeout(() => {
      const aiMsg: Message = { 
        role: "ai", 
        text: "تم تحليل استفسارك سيادياً. بروتوكولات العدالة الرقمية تعمل بكفاءة تامة.", 
        id: (Date.now() + 1).toString() 
      };
      setMessages(prev => [...prev, aiMsg]);
      setNotifCount(prev => prev + 1);
      setIsTyping(false);
    }, 800);
  };

  const deleteMessage = (id: string) => {
    setMessages(prev => prev.filter(m => m.id !== id));
    toast({ title: "تم التطهير", description: "حذف الرسالة بنجاح." });
  };

  const copyMessage = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({ title: "تم النسخ السيادي" });
  };

  const handleQuickReply = (text: string) => {
    setInputText(`بخصوص: ${text.substring(0, 30)}...`);
    setCurrentPage("home");
  };

  const handleLogout = async () => {
    await signOut();
    toast({ title: "وداعاً سيادة المالك", description: "تم إنهاء الجلسة السيادية بسلام." });
    router.push("/auth/login");
  };

  return (
    <ProtectedRoute>
      <div className="flex h-screen bg-[#f0f2f5] dark:bg-[#0f172a] overflow-hidden transition-colors duration-300" dir="rtl">
        
        {/* Sidebar السيادي المطور */}
        <AnimatePresence mode="wait">
          {isSidebarOpen && (
            <motion.aside 
              initial={{ x: "100%", opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: "100%", opacity: 0 }}
              className="w-64 h-full bg-gradient-to-b from-[#4e54c8] to-[#8f94fb] text-white flex flex-col z-50 shadow-2xl flex-shrink-0"
            >
              <div className="p-6 border-b border-white/10 flex items-center gap-3">
                <div className="h-10 w-10 rounded-2xl bg-white/20 flex items-center justify-center border border-white/10">
                  <Scale className="h-6 w-6 text-white" />
                </div>
                <h2 className="text-xl font-black tracking-tighter">المستشار AI</h2>
              </div>

              <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
                <SideBtn icon={<Home />} text="الرئيسية" active={currentPage === "home"} onClick={() => setCurrentPage("home")} />
                <p className="text-[10px] text-white/30 font-black uppercase tracking-widest pt-4 pb-2 px-4">الإدارة العليا</p>
                <SideBtn icon={<Users />} text="المستخدمون" active={currentPage === "users"} onClick={() => setCurrentPage("users")} />
                <SideBtn icon={<Gavel />} text="المستشارون" active={currentPage === "advisors"} onClick={() => setCurrentPage("advisors")} />
                <SideBtn icon={<ShieldAlert />} text="الكلمات المحظورة" active={currentPage === "banned"} onClick={() => setCurrentPage("banned")} />
                <SideBtn icon={<Tag />} text="العروض" active={currentPage === "offers"} onClick={() => setCurrentPage("offers")} />
                <SideBtn icon={<Activity />} text="سجل الأحداث" active={currentPage === "logs"} onClick={() => setCurrentPage("logs")} />
              </nav>

              <div className="p-4 border-t border-white/10">
                <button onClick={handleLogout} className="w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-white/60 hover:text-white hover:bg-red-500/20 transition-all font-bold text-sm">
                  <LogOut className="h-5 w-5" /> تسجيل الخروج
                </button>
              </div>
            </motion.aside>
          )}
        </AnimatePresence>

        {/* منطقة المحتوى الرئيسي */}
        <div className="flex-1 flex flex-col relative overflow-hidden">
          
          {/* الشريط العلوي السيادي */}
          <header className="h-16 bg-gradient-to-r from-[#43cea2] to-[#185a9d] text-white flex items-center justify-between px-6 z-40 shadow-xl">
            <div className="flex items-center gap-4">
              <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="p-2 bg-white/10 rounded-xl hover:bg-white/20 transition-all">
                <Menu className="h-5 w-5" />
              </button>
              <h1 className="text-sm md:text-lg font-black tracking-tighter">بوابة المستشار السيادية - king2026</h1>
            </div>

            <div className="flex items-center gap-3">
              <div className="hidden md:flex relative">
                <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/40" />
                <input type="text" placeholder="بحث سيادي..." className="bg-white/10 border-none rounded-xl pr-9 pl-4 h-10 text-xs text-white placeholder:text-white/30 w-48" />
              </div>
              <button className="relative p-2 bg-white/10 rounded-xl hover:bg-white/20 transition-all">
                <Bell className="h-5 w-5" />
                {notifCount > 0 && <span className="absolute -top-1 -right-1 h-5 w-5 bg-red-500 border-2 border-[#43cea2] rounded-full text-[9px] flex items-center justify-center font-black animate-pulse">{notifCount}</span>}
              </button>
              <button onClick={() => setTheme(theme === "dark" ? "light" : "dark")} className="p-2 bg-white/10 rounded-xl hover:bg-white/20 transition-all">
                {theme === "dark" ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
              </button>
            </div>
          </header>

          <main className="flex-1 relative overflow-hidden flex flex-col">
            {currentPage === "home" ? (
              <>
                {/* الأرواح السيادية الثلاث */}
                <div className="absolute inset-x-0 top-10 flex justify-center gap-12 pointer-events-none z-0 opacity-20 dark:opacity-10">
                   {[1, 2, 3].map(i => (
                     <motion.div key={i} animate={{ y: [0, -20, 0] }} transition={{ duration: 4, repeat: Infinity, delay: i * 0.7 }}>
                       <Image src={`https://picsum.photos/seed/spirit${i}/400/400`} width={70} height={70} className="rounded-[2rem] border-2 border-[#185a9d]" alt="Sovereign Spirit" />
                     </motion.div>
                   ))}
                </div>

                <div ref={scrollRef} className="flex-1 overflow-y-auto p-6 space-y-8 relative z-10 scrollbar-none">
                  <div className="max-w-4xl mx-auto space-y-8">
                    {messages.map((m) => (
                      <motion.div key={m.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className={`flex flex-col ${m.role === "user" ? "items-start" : "items-end"}`}>
                        <div className={`p-5 rounded-[2.5rem] text-sm max-w-[85%] shadow-xl border ${m.role === "user" ? "bg-[#d4edda] text-[#155724] border-[#c3e6cb] rounded-tr-none" : "bg-[#d1ecf1] text-[#0c5460] border-[#bee5eb] rounded-tl-none"}`}>
                          <p className="leading-relaxed font-medium">{m.text}</p>
                          <div className="flex items-center gap-2 mt-4 pt-3 border-t border-black/5">
                             <button onClick={() => handleQuickReply(m.text)} className="bg-white/40 hover:bg-white/80 text-[10px] font-black px-3 py-1.5 rounded-lg transition-all">رد سريع</button>
                             <button onClick={() => copyMessage(m.text)} className="bg-white/40 hover:bg-white/80 text-[10px] font-black px-3 py-1.5 rounded-lg transition-all">نسخ</button>
                             <button onClick={() => deleteMessage(m.id)} className="bg-red-500/10 hover:bg-red-500/20 text-red-600 text-[10px] font-black px-3 py-1.5 rounded-lg transition-all">حذف</button>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                    {isTyping && <div className="flex gap-2 p-4 opacity-40"><div className="w-2 h-2 bg-primary rounded-full animate-bounce" /><div className="w-2 h-2 bg-primary rounded-full animate-bounce delay-100" /><div className="w-2 h-2 bg-primary rounded-full animate-bounce delay-200" /></div>}
                  </div>
                </div>

                <div className="p-6 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border-t border-border z-20">
                  <div className="max-w-4xl mx-auto flex gap-4">
                    <input value={inputText} onChange={(e) => setInputText(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleSend()} placeholder="اكتب رسالتك السيادية هنا..." className="flex-1 bg-[#f8f9fa] dark:bg-slate-800 rounded-2xl px-6 py-4 text-sm outline-none border border-transparent focus:border-[#43cea2]/20 shadow-inner font-medium" />
                    <button onClick={() => handleSend()} disabled={!inputText.trim() || isTyping} className="bg-gradient-to-r from-[#43cea2] to-[#185a9d] text-white px-10 rounded-2xl font-black text-sm hover:scale-105 transition-transform shadow-xl active:scale-95 flex items-center gap-2">
                      {isTyping ? <Cpu className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4 rotate-180" />} إرسال
                    </button>
                  </div>
                </div>
              </>
            ) : (
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="flex-1 p-8 space-y-10 overflow-y-auto bg-white dark:bg-slate-900">
                <div className="flex items-center justify-between border-b border-border pb-6">
                  <div>
                    <h2 className="text-4xl font-black tracking-tighter text-[#185a9d]">{getSectionTitle(currentPage)}</h2>
                    <p className="text-sm text-muted-foreground mt-2 font-medium">التحكم الكامل في قطاع {getSectionTitle(currentPage)}.</p>
                  </div>
                  <div className="h-16 w-16 rounded-[2rem] bg-[#43cea2]/10 flex items-center justify-center text-[#43cea2] shadow-inner">
                    {getSectionIcon(currentPage)}
                  </div>
                </div>
                <div className="grid gap-6">
                  <div className="flex flex-wrap gap-4">
                    <AdminActionBtn text={`إضافة في ${getSectionTitle(currentPage)}`} />
                    <AdminActionBtn text={`حذف من ${getSectionTitle(currentPage)}`} color="red" />
                    <AdminActionBtn text="تصدير التقارير" color="gray" />
                  </div>
                  <div className="bg-[#f8f9fa] dark:bg-black/20 rounded-[2rem] p-10 border border-border/50 text-center">
                     <p className="text-lg font-bold text-muted-foreground opacity-40">بروتوكول البيانات اللحظي نشط ومراقب سيادياً.</p>
                  </div>
                </div>
              </motion.div>
            )}
          </main>
        </div>
      </div>
    </ProtectedRoute>
  );
}

function SideBtn({ icon, text, active, onClick }: any) {
  return (
    <button onClick={onClick} className={`w-full flex items-center gap-4 px-5 py-4 rounded-2xl transition-all duration-300 font-bold text-sm ${active ? "bg-white/20 text-white shadow-xl scale-105" : "text-white/60 hover:text-white hover:bg-white/10"}`}>
      <span className="shrink-0">{icon}</span>
      <span className="tracking-tight">{text}</span>
    </button>
  );
}

function AdminActionBtn({ text, color = "green" }: any) {
  const gradient = color === "red" ? "from-red-500 to-red-700" : color === "gray" ? "from-slate-500 to-slate-700" : "from-[#43cea2] to-[#185a9d]";
  return (
    <button className={`px-8 py-4 rounded-[1.8rem] bg-gradient-to-r ${gradient} text-white text-sm font-black shadow-2xl hover:scale-105 transition-all active:scale-95`}>
      {text}
    </button>
  );
}

function getSectionTitle(id: string) {
  const titles: any = { users: "المستخدمين", advisors: "هيئة المستشارين", banned: "جهاز الرقابة", offers: "العروض المالية", logs: "سجل الأحداث" };
  return titles[id] || "لوحة التحكم";
}

function getSectionIcon(id: string) {
  const icons: any = { users: <Users />, advisors: <Gavel />, banned: <ShieldAlert />, offers: <Tag />, logs: <Activity /> };
  return icons[id] || <Settings />;
}
