
"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Send, Cpu, ShieldCheck, Sparkles, Copy, Trash2, Reply, 
  Settings, Users, Gavel, ShieldAlert, Tag, Activity, 
  Bell, Moon, Sun, Search, X, Plus, Menu, Home, LogOut,
  Scale
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
    { role: "ai", text: "أهلاً بك في النسخة المتقدمة النهائية لـ المستشار AI. أنا محركك القانوني السيادي، كيف يمكنني مساعدتك اليوم؟", id: "init" }
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

    // محاكاة الرد السيادي
    setTimeout(() => {
      const aiMsg: Message = { 
        role: "ai", 
        text: "تم استلام رسالتك وتحليلها سيادياً. نوصي بمراجعة بروتوكولات الامتثال المحدثة في المكتبة القانونية.", 
        id: (Date.now() + 1).toString() 
      };
      setMessages(prev => [...prev, aiMsg]);
      setNotifCount(prev => prev + 1);
      setIsTyping(false);
    }, 800);
  };

  const deleteMessage = (id: string) => {
    setMessages(prev => prev.filter(m => m.id !== id));
    toast({ title: "تم التطهير", description: "حذف الرسالة من الواجهة بنجاح." });
  };

  const copyMessage = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({ title: "تم النسخ السيادي", description: "النص جاهز في الحافظة." });
  };

  const handleQuickReply = (text: string) => {
    setInputText(`بخصوص استفساري السابق: ${text.substring(0, 30)}...`);
    setCurrentPage("home");
  };

  const isAdmin = profile?.role === "admin" || profile?.email === "bishoysamy390@gmail.com";

  return (
    <ProtectedRoute>
      <div className="flex h-screen bg-[#f0f2f5] dark:bg-[#0f172a] overflow-hidden font-sans transition-colors duration-300" dir="rtl">
        
        {/* The Sovereign Sidebar (Fixed & Graded) */}
        <AnimatePresence mode="wait">
          {isSidebarOpen && (
            <motion.aside 
              initial={{ x: "100%", opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: "100%", opacity: 0 }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="w-64 h-full bg-gradient-to-b from-[#4e54c8] to-[#8f94fb] text-white flex flex-col z-50 shadow-2xl relative flex-shrink-0"
            >
              <div className="p-6 border-b border-white/10 flex items-center gap-3">
                <div className="h-10 w-10 rounded-2xl bg-white/20 flex items-center justify-center shadow-lg border border-white/10">
                  <Scale className="h-6 w-6 text-white" />
                </div>
                <h2 className="text-xl font-black tracking-tighter">المستشار AI</h2>
              </div>

              <nav className="flex-1 p-4 space-y-2 overflow-y-auto scrollbar-none">
                <SideBtn icon={<Home />} text="الرئيسية" active={currentPage === "home"} onClick={() => setCurrentPage("home")} />
                
                <p className="text-[10px] text-white/30 font-black uppercase tracking-widest pt-4 pb-2 px-4">لوحة القيادة</p>
                <SideBtn icon={<Users />} text="المستخدمون" active={currentPage === "users"} onClick={() => setCurrentPage("users")} />
                <SideBtn icon={<Gavel />} text="المستشارون" active={currentPage === "advisors"} onClick={() => setCurrentPage("advisors")} />
                <SideBtn icon={<ShieldAlert />} text="الكلمات المحظورة" active={currentPage === "banned"} onClick={() => setCurrentPage("banned")} />
                <SideBtn icon={<Tag />} text="العروض" active={currentPage === "offers"} onClick={() => setCurrentPage("offers")} />
                <SideBtn icon={<Activity />} text="سجل الأحداث" active={currentPage === "logs"} onClick={() => setCurrentPage("logs")} />
              </nav>

              <div className="p-4 border-t border-white/10">
                <button 
                  onClick={() => signOut()}
                  className="w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-white/60 hover:text-white hover:bg-red-500/20 transition-all font-bold text-sm"
                >
                  <LogOut className="h-5 w-5" /> تسجيل الخروج
                </button>
              </div>
            </motion.aside>
          )}
        </AnimatePresence>

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col relative overflow-hidden">
          
          {/* Sovereign Top Bar (Modern Graded) */}
          <header className="h-16 bg-gradient-to-r from-[#43cea2] to-[#185a9d] text-white flex items-center justify-between px-6 z-40 shadow-xl">
            <div className="flex items-center gap-4">
              <button 
                onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                className="p-2 bg-white/10 rounded-xl hover:bg-white/20 transition-all"
              >
                <Menu className="h-5 w-5" />
              </button>
              <h1 className="text-lg font-black tracking-tighter">بوابة المستشار السيادية</h1>
            </div>

            <div className="flex items-center gap-3">
              <div className="hidden md:flex relative group">
                <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/40 group-focus-within:text-white transition-colors" />
                <input 
                  type="text" 
                  placeholder="بحث سيادي..." 
                  className="bg-white/10 border-none rounded-xl pr-9 pl-4 h-10 text-xs text-white placeholder:text-white/30 focus:ring-1 focus:ring-white/20 transition-all w-48"
                />
              </div>
              <button className="relative p-2 bg-white/10 rounded-xl hover:bg-white/20 transition-all">
                <Bell className="h-5 w-5" />
                {notifCount > 0 && (
                  <span className="absolute -top-1 -right-1 h-5 w-5 bg-red-500 border-2 border-[#43cea2] rounded-full text-[9px] flex items-center justify-center font-black animate-in zoom-in">
                    {notifCount}
                  </span>
                )}
              </button>
              <button 
                onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                className="p-2 bg-white/10 rounded-xl hover:bg-white/20 transition-all"
              >
                {theme === "dark" ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
              </button>
            </div>
          </header>

          {/* Dynamic Content Switching */}
          <main className="flex-1 relative overflow-hidden flex flex-col">
            
            {currentPage === "home" && (
              <>
                {/* Sovereign Spirits (The Three Floating Pillars) */}
                <div className="absolute inset-x-0 top-10 flex justify-center gap-12 pointer-events-none z-0 opacity-20 dark:opacity-10">
                   {[1, 2, 3].map(i => (
                     <motion.div 
                       key={i}
                       animate={{ y: [0, -20, 0], rotate: [0, 5, -5, 0] }} 
                       transition={{ duration: 4, repeat: Infinity, delay: i * 0.7 }}
                       className="grayscale hover:grayscale-0 transition-all"
                     >
                       <Image 
                         src={`https://picsum.photos/seed/spirit${i}/400/400`} 
                         width={80} height={80} 
                         className="rounded-[2rem] border-2 border-[#185a9d] shadow-2xl" 
                         alt={`Spirit ${i}`} 
                         data-ai-hint="legal expert" 
                       />
                     </motion.div>
                   ))}
                </div>

                {/* Chat Messages Area */}
                <div ref={scrollRef} className="flex-1 overflow-y-auto p-6 space-y-8 relative z-10 scrollbar-thin">
                  <div className="max-w-4xl mx-auto space-y-8">
                    {messages.map((m) => (
                      <motion.div
                        key={m.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className={`flex flex-col ${m.role === "user" ? "items-start" : "items-end"}`}
                      >
                        <div className={`p-5 rounded-[2.5rem] text-sm max-w-[85%] relative group shadow-xl border ${
                          m.role === "user"
                            ? "bg-[#d4edda] text-[#155724] border-[#c3e6cb] rounded-tr-none"
                            : "bg-[#d1ecf1] text-[#0c5460] border-[#bee5eb] rounded-tl-none"
                        }`}>
                          <p className="leading-relaxed font-medium">{m.text}</p>
                          
                          {/* Quick Actions (Sovereign Order) */}
                          <div className="flex items-center gap-2 mt-4 pt-3 border-t border-black/5 opacity-0 group-hover:opacity-100 transition-opacity">
                             <button onClick={() => handleQuickReply(m.text)} className="flex items-center gap-1 bg-white/40 hover:bg-white/80 text-[10px] font-black px-3 py-1.5 rounded-lg transition-all"><Reply className="h-3 w-3" /> رد سريع</button>
                             <button onClick={() => copyMessage(m.text)} className="flex items-center gap-1 bg-white/40 hover:bg-white/80 text-[10px] font-black px-3 py-1.5 rounded-lg transition-all"><Copy className="h-3 w-3" /> نسخ</button>
                             <button onClick={() => deleteMessage(m.id)} className="flex items-center gap-1 bg-red-500/10 hover:bg-red-500/20 text-red-600 text-[10px] font-black px-3 py-1.5 rounded-lg transition-all"><Trash2 className="h-3 w-3" /> حذف</button>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                    {isTyping && (
                      <div className="flex gap-2 p-4 opacity-40">
                        <div className="w-2 h-2 bg-primary rounded-full animate-bounce" />
                        <div className="w-2 h-2 bg-primary rounded-full animate-bounce delay-100" />
                        <div className="w-2 h-2 bg-primary rounded-full animate-bounce delay-200" />
                      </div>
                    )}
                  </div>
                </div>

                {/* Sovereign Input Hub */}
                <div className="p-6 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border-t border-border z-20">
                  <div className="max-w-4xl mx-auto flex gap-4">
                    <div className="relative flex-1">
                      <input
                        value={inputText}
                        onChange={(e) => setInputText(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                        placeholder="اكتب رسالتك السيادية هنا..."
                        className="w-full bg-[#f8f9fa] dark:bg-slate-800 rounded-2xl px-6 py-4 text-sm outline-none border border-transparent focus:border-[#43cea2]/20 transition-all font-medium shadow-inner"
                      />
                      <div className="absolute left-4 top-1/2 -translate-y-1/2">
                         <Sparkles className="h-4 w-4 text-[#43cea2] animate-pulse" />
                      </div>
                    </div>
                    <button
                      onClick={() => handleSend()}
                      disabled={!inputText.trim() || isTyping}
                      className="bg-gradient-to-r from-[#43cea2] to-[#185a9d] text-white px-10 rounded-2xl font-black text-sm hover:scale-105 transition-transform shadow-xl active:scale-95 flex items-center gap-2"
                    >
                      {isTyping ? <Cpu className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4 rotate-180" />}
                      إرسال
                    </button>
                  </div>
                </div>
              </>
            )}

            {/* Admin Dedicated Sections */}
            <AnimatePresence>
              {currentPage !== "home" && (
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 20 }}
                  className="flex-1 p-8 space-y-10 overflow-y-auto bg-white dark:bg-slate-900"
                >
                  <div className="flex items-center justify-between border-b border-border pb-6">
                    <div>
                      <h2 className="text-4xl font-black tracking-tighter text-[#185a9d]">{getSectionTitle(currentPage)}</h2>
                      <p className="text-sm text-muted-foreground mt-2 font-medium">إدارة قطاع {getSectionTitle(currentPage)} في المنظومة السيادية.</p>
                    </div>
                    <div className="h-16 w-16 rounded-[2rem] bg-[#43cea2]/10 flex items-center justify-center text-[#43cea2] shadow-inner">
                      {getSectionIcon(currentPage)}
                    </div>
                  </div>

                  <div className="grid gap-6">
                    {currentPage === "users" && (
                      <div className="flex flex-wrap gap-4">
                        <AdminActionBtn text="إضافة مستخدم جديد" />
                        <AdminActionBtn text="حذف مواطن" />
                        <AdminActionBtn text="حظر / فك حظر سيادي" color="red" />
                      </div>
                    )}
                    {currentPage === "advisors" && (
                      <div className="flex flex-wrap gap-4">
                        <AdminActionBtn text="اعتماد مستشار جديد" />
                        <AdminActionBtn text="تعديل صلاحيات الهيئة" />
                      </div>
                    )}
                    {currentPage === "banned" && (
                      <div className="flex flex-wrap gap-4">
                        <AdminActionBtn text="إضافة كلمة محظورة" />
                        <AdminActionBtn text="تطهير القائمة السوداء" />
                      </div>
                    )}
                    {currentPage === "offers" && (
                      <div className="flex flex-wrap gap-4">
                        <AdminActionBtn text="إضافة عرض مالي" />
                        <AdminActionBtn text="تعديل باقات الشحن" />
                      </div>
                    )}
                    {currentPage === "logs" && (
                      <div className="bg-[#f8f9fa] dark:bg-black/20 rounded-[2rem] p-6 border border-border/50 max-h-[500px] overflow-y-auto font-mono text-xs">
                        <div className="space-y-3 opacity-60">
                          <div className="p-3 bg-white dark:bg-slate-800 rounded-xl border border-border">[{new Date().toLocaleTimeString()}] تم رصد دخول سيادي ناجح من king2026.</div>
                          <div className="p-3 bg-white dark:bg-slate-800 rounded-xl border border-border">[{new Date().toLocaleTimeString()}] محرك الرقابة اللحظي في حالة ترقب نشطة.</div>
                          <div className="p-3 bg-white dark:bg-slate-800 rounded-xl border border-border">[{new Date().toLocaleTimeString()}] تم تحديث باقات العروض السيادية بنجاح.</div>
                        </div>
                      </div>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

          </main>
        </div>
      </div>
    </ProtectedRoute>
  );
}

function SideBtn({ icon, text, active, onClick }: { icon: any, text: string, active: boolean, onClick: () => void }) {
  return (
    <button 
      onClick={onClick}
      className={`w-full flex items-center gap-4 px-5 py-4 rounded-2xl transition-all duration-300 font-bold text-sm ${
        active 
          ? "bg-white/20 text-white shadow-xl scale-105" 
          : "text-white/60 hover:text-white hover:bg-white/10"
      }`}
    >
      <span className="shrink-0">{icon}</span>
      <span className="tracking-tight">{text}</span>
    </button>
  );
}

function AdminActionBtn({ text, color = "green" }: { text: string, color?: string }) {
  const gradient = color === "red" ? "from-red-500 to-red-700" : "from-[#43cea2] to-[#185a9d]";
  return (
    <button className={`px-8 py-4 rounded-[1.8rem] bg-gradient-to-r ${gradient} text-white text-sm font-black shadow-2xl hover:scale-105 transition-all active:scale-95`}>
      {text}
    </button>
  );
}

function getSectionTitle(id: string) {
  const titles: Record<string, string> = {
    users: "إدارة المستخدمين",
    advisors: "هيئة المستشارين",
    banned: "جهاز الرقابة",
    offers: "العروض المالية",
    logs: "سجل الأحداث"
  };
  return titles[id] || "لوحة التحكم";
}

function getSectionIcon(id: string) {
  const icons: Record<string, any> = {
    users: <Users />,
    advisors: <Gavel />,
    banned: <ShieldAlert />,
    offers: <Tag />,
    logs: <Activity />
  };
  return icons[id] || <Settings />;
}
