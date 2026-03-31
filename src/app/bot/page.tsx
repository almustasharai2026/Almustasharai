
"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Send, Cpu, ShieldCheck, Sparkles, Copy, Trash2, Reply, 
  Settings, Users, Gavel, ShieldAlert, Tag, Activity, 
  Bell, Moon, Sun, Search, X, Plus
} from "lucide-react";
import ProtectedRoute from "@/components/ProtectedRoute";
import Image from "next/image";
import { useUser, useFirestore } from "@/firebase";
import { useToast } from "@/hooks/use-toast";
import { useTheme } from "next-themes";

interface Message {
  role: "user" | "ai";
  text: string;
  id: string;
}

export default function AdvancedBotPage() {
  const { profile } = useUser();
  const { theme, setTheme } = useTheme();
  const { toast } = useToast();
  
  const [messages, setMessages] = useState<Message[]>([
    { role: "ai", text: "أهلاً بك في النسخة المتقدمة النهائية. أنا محركك القانوني السيادي، كيف يمكنني مساعدتك اليوم؟", id: "init" }
  ]);
  const [inputText, setInputText] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [notifCount, setNotifCount] = useState(0);
  const [isAdminOpen, setIsAdminOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("users");
  
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
    }
  }, [messages, isTyping]);

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
        text: "تم استلام رسالتك وتحليلها سيادياً. نوصي بمراجعة بروتوكولات الامتثال المحدثة في المكتبة.", 
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
    setInputText(`بخصوص استفساري السابق: ${text.substring(0, 20)}...`);
  };

  return (
    <ProtectedRoute>
      <div className="flex flex-col h-screen relative bg-background overflow-hidden" dir="rtl">
        
        {/* Sovereign Top Bar */}
        <header className="top-bar h-16 flex items-center justify-between px-6 z-50">
          <div className="flex items-center gap-4">
            <h1 className="text-xl font-black tracking-tighter">المستشار AI</h1>
            <div className="hidden md:flex relative group">
              <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/40" />
              <input 
                type="text" 
                placeholder="بحث في القوانين..." 
                className="bg-white/10 border-none rounded-xl pr-9 pl-4 h-9 text-xs text-white placeholder:text-white/30 focus:ring-1 focus:ring-white/20 transition-all w-48"
              />
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button className="relative p-2 bg-white/10 rounded-xl hover:bg-white/20 transition-all text-white">
              <Bell className="h-5 w-5" />
              {notifCount > 0 && (
                <span className="absolute -top-1 -right-1 h-5 w-5 bg-red-500 border-2 border-primary rounded-full text-[9px] flex items-center justify-center font-black animate-in zoom-in">
                  {notifCount}
                </span>
              )}
            </button>
            <button 
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              className="p-2 bg-white/10 rounded-xl hover:bg-white/20 transition-all text-white"
            >
              {theme === "dark" ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
            </button>
            <button 
              onClick={() => setIsAdminOpen(!isAdminOpen)}
              className={`p-2 rounded-xl transition-all ${isAdminOpen ? 'bg-white text-primary' : 'bg-white/10 text-white hover:bg-white/20'}`}
            >
              <Settings className={`h-5 w-5 ${isAdminOpen ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </header>

        <main className="flex-1 flex flex-col relative overflow-hidden">
          
          {/* Sovereign Spirits - 3 Characters */}
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
                   width={100} height={100} 
                   className="rounded-[2.5rem] border-2 border-primary shadow-2xl" 
                   alt={`Spirit ${i}`} 
                   data-ai-hint="legal character" 
                 />
               </motion.div>
             ))}
          </div>

          {/* Chat Messages Area */}
          <div ref={scrollRef} className="flex-1 overflow-y-auto p-6 space-y-8 relative z-10 scrollbar-thin">
            {messages.map((m) => (
              <motion.div
                key={m.id}
                initial={{ opacity: 0, x: m.role === "user" ? -20 : 20 }}
                animate={{ opacity: 1, x: 0 }}
                className={`flex flex-col ${m.role === "user" ? "items-start" : "items-end"}`}
              >
                <div className={`p-5 rounded-[2rem] text-sm max-w-[85%] relative group shadow-xl border ${
                  m.role === "user"
                    ? "bg-[#d4edda] dark:bg-[#28a74540] text-slate-900 dark:text-white border-green-500/10 rounded-tr-none"
                    : "bg-[#d1ecf1] dark:bg-[#17a2b840] text-slate-900 dark:text-white border-blue-500/10 rounded-tl-none"
                }`}>
                  <p className="leading-relaxed font-medium">{m.text}</p>
                  
                  {/* Quick Actions Bar */}
                  <div className="flex items-center gap-2 mt-4 pt-3 border-t border-black/5 dark:border-white/5 opacity-0 group-hover:opacity-100 transition-opacity">
                     <button onClick={() => handleQuickReply(m.text)} className="flex items-center gap-1 bg-white/20 hover:bg-white/40 text-[10px] font-black px-3 py-1.5 rounded-lg transition-all"><Reply className="h-3 w-3" /> رد سريع</button>
                     <button onClick={() => copyMessage(m.text)} className="flex items-center gap-1 bg-white/20 hover:bg-white/40 text-[10px] font-black px-3 py-1.5 rounded-lg transition-all"><Copy className="h-3 w-3" /> نسخ</button>
                     <button onClick={() => deleteMessage(m.id)} className="flex items-center gap-1 bg-red-500/20 hover:bg-red-500/40 text-red-600 dark:text-red-400 text-[10px] font-black px-3 py-1.5 rounded-lg transition-all"><Trash2 className="h-3 w-3" /> حذف</button>
                  </div>
                </div>
              </motion.div>
            ))}
            {isTyping && (
              <div className="flex gap-2 p-2 opacity-40">
                <div className="w-2 h-2 bg-primary rounded-full animate-bounce" />
                <div className="w-2 h-2 bg-primary rounded-full animate-bounce delay-100" />
                <div className="w-2 h-2 bg-primary rounded-full animate-bounce delay-200" />
              </div>
            )}
          </div>

          {/* Admin Panel - Tabbed Hub */}
          <AnimatePresence>
            {isAdminOpen && (
              <motion.div 
                initial={{ y: 300, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: 300, opacity: 0 }}
                className="absolute bottom-24 inset-x-6 z-[100] bg-white dark:bg-slate-900 rounded-[2.5rem] shadow-[0_30px_60px_rgba(0,0,0,0.4)] border border-border overflow-hidden"
              >
                <div className="flex border-b border-border bg-secondary/20 p-2">
                  {[
                    { id: "users", label: "المستخدمون", icon: <Users /> },
                    { id: "advisors", label: "المستشارون", icon: <Gavel /> },
                    { id: "banned", label: "الرقابة", icon: <ShieldAlert /> },
                    { id: "offers", label: "العروض", icon: <Tag /> },
                    { id: "logs", label: "سجل الأحداث", icon: <Activity /> }
                  ].map(tab => (
                    <button 
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`flex-1 flex items-center justify-center gap-2 py-3 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all ${activeTab === tab.id ? 'bg-primary text-white shadow-lg shadow-primary/20 scale-105' : 'text-muted-foreground hover:bg-secondary'}`}
                    >
                      <span className="scale-75">{tab.icon}</span> {tab.label}
                    </button>
                  ))}
                </div>
                
                <div className="p-8 max-h-[350px] overflow-y-auto">
                  {activeTab === "users" && (
                    <div className="flex flex-wrap gap-3">
                      <AdminActionButton icon={<Plus />} text="إضافة مستخدم" />
                      <AdminActionButton icon={<Trash2 />} text="حذف مستخدم" />
                      <AdminActionButton icon={<ShieldCheck />} text="حظر / فك حظر" color="red" />
                    </div>
                  )}
                  {activeTab === "advisors" && (
                    <div className="flex flex-wrap gap-3">
                      <AdminActionButton icon={<Plus />} text="إضافة مستشار" />
                      <AdminActionButton icon={<Settings />} text="تعديل صلاحيات" />
                    </div>
                  )}
                  {activeTab === "banned" && (
                    <div className="flex flex-wrap gap-3">
                      <AdminActionButton icon={<Plus />} text="إضافة كلمة محظورة" />
                      <AdminActionButton icon={<X />} text="تطهير القائمة" />
                    </div>
                  )}
                  {activeTab === "logs" && (
                    <div className="space-y-2 font-mono text-[10px] opacity-60">
                      <div className="p-2 bg-secondary rounded-lg border border-border">[{new Date().toLocaleTimeString()}] تم رصد دخول سيادي من king2026</div>
                      <div className="p-2 bg-secondary rounded-lg border border-border">[{new Date().toLocaleTimeString()}] محرك الرقابة مفعل ويعمل بكفاءة</div>
                    </div>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Sovereign Chat Input */}
          <div className="p-6 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border-t border-border z-20">
            <div className="max-w-4xl mx-auto flex gap-4">
              <div className="relative flex-1">
                <input
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                  placeholder="اكتب استفسارك القانوني هنا..."
                  className="w-full bg-secondary/40 rounded-2xl px-6 py-4 text-sm outline-none border border-transparent focus:border-primary/20 transition-all font-medium pr-6 shadow-inner"
                />
                <div className="absolute left-4 top-1/2 -translate-y-1/2 flex items-center gap-2">
                   <Sparkles className="h-4 w-4 text-primary animate-pulse" />
                </div>
              </div>
              <button
                onClick={() => handleSend()}
                disabled={!inputText.trim() || isTyping}
                className="btn-green-gradient text-white px-10 rounded-2xl font-black text-sm hover:scale-105 transition-transform shadow-xl shadow-green-500/20 active:scale-95 flex items-center gap-2"
              >
                {isTyping ? <Cpu className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4 rotate-180" />}
                إرسال
              </button>
            </div>
            <p className="text-[9px] text-center text-muted-foreground/40 mt-4 font-black uppercase tracking-[0.3em]">
              Sovereign AI Protected Session | Powered by Gemini 2.5 Flash
            </p>
          </div>
        </main>
      </div>
    </ProtectedRoute>
  );
}

function AdminActionButton({ icon, text, color = "cyan" }: { icon: any, text: string, color?: string }) {
  const gradient = color === "red" ? "from-red-500 to-red-700" : "from-cyan-500 to-cyan-700";
  return (
    <button className={`flex items-center gap-2 px-5 py-3 rounded-2xl bg-gradient-to-r ${gradient} text-white text-[11px] font-black shadow-lg hover:scale-105 transition-all active:scale-95`}>
      {icon} {text}
    </button>
  );
}
