
"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Send, Cpu, ShieldCheck, Sparkles, Copy, Trash2, Reply, 
  Settings, Users, Gavel, ShieldAlert, Tag, Activity, 
  Bell, Moon, Sun, Search, X, Plus, Menu, Home, LogOut,
  Scale, ChevronLeft, Wallet, UserPlus, Ban, CheckCircle
} from "lucide-react";
import ProtectedRoute from "@/components/ProtectedRoute";
import Image from "next/image";
import { useUser, useFirestore, useCollection } from "@/firebase";
import { useToast } from "@/hooks/use-toast";
import { useTheme } from "next-themes";
import { useRouter } from "next/navigation";
import { collection, doc, updateDoc, deleteDoc, addDoc, serverTimestamp, increment } from "firebase/firestore";
import { useMemoFirebase } from "@/firebase/provider";
import { getPermissions } from "@/lib/roles";

interface Message {
  role: "user" | "ai";
  text: string;
  id: string;
}

export default function SovereignFinalDashboard() {
  const { user, profile, signOut, role } = useUser();
  const db = useFirestore();
  const { theme, setTheme } = useTheme();
  const { toast } = useToast();
  const router = useRouter();
  const perms = getPermissions(role);
  
  const [currentPage, setCurrentPage] = useState("home");
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [messages, setMessages] = useState<Message[]>([
    { role: "ai", text: `أهلاً بك يا سيادة ${profile?.fullName || 'المالك'} في مركز القيادة السيادي.`, id: "init" }
  ]);
  const [inputText, setInputText] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  
  // استعلامات البيانات السيادية (للمالك فقط)
  const usersQuery = useMemoFirebase(() => db && role === 'admin' ? collection(db, "users") : null, [db, role]);
  const { data: allUsers } = useCollection(usersQuery);

  const bannedWordsQuery = useMemoFirebase(() => db ? collection(db, "system", "moderation", "forbiddenWords") : null, [db]);
  const { data: forbiddenWords } = useCollection(bannedWordsQuery);

  const logsQuery = useMemoFirebase(() => db && role === 'admin' ? collection(db, "analytics") : null, [db, role]);
  const { data: systemLogs } = useCollection(logsQuery);

  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
    }
  }, [messages, isTyping, currentPage]);

  const handleSend = async () => {
    if (!inputText.trim() || isTyping || !db || !user) return;

    // فحص الرصيد للمواطنين
    if (role === 'user' && (profile?.balance || 0) < 1) {
      toast({ variant: "destructive", title: "رصيد غير كافٍ", description: "يرجى شحن المحفظة السيادية للمتابعة." });
      return;
    }

    const userMsg: Message = { role: "user", text: inputText.trim(), id: Date.now().toString() };
    setMessages(prev => [...prev, userMsg]);
    setInputText("");
    setIsTyping(true);

    try {
      // خصم رصيد فعلي (للمواطن فقط)
      if (role === 'user') {
        await updateDoc(doc(db, "users", user.uid), { balance: increment(-1) });
      }

      // توثيق الحدث في الأرشيف
      await addDoc(collection(db, "analytics"), {
        event: "sovereign_chat",
        userId: user.uid,
        userName: profile?.fullName,
        text: userMsg.text,
        createdAt: serverTimestamp()
      });

      // رد المحرك السيادي
      setTimeout(() => {
        const aiMsg: Message = { 
          role: "ai", 
          text: "تم تحليل استفسارك سيادياً برتبة " + role.toUpperCase() + ". بروتوكولات العدالة الرقمية تعمل بكفاءة.", 
          id: (Date.now() + 1).toString() 
        };
        setMessages(prev => [...prev, aiMsg]);
        setIsTyping(false);
      }, 1000);
    } catch (e) {
      toast({ variant: "destructive", title: "فشل الإرسال السيادي" });
      setIsTyping(false);
    }
  };

  // وظائف المالك الفعلية (Sovereign Owner Actions)
  const adjustUserBalance = async (userId: string, amount: number) => {
    if (!db) return;
    await updateDoc(doc(db, "users", userId), { balance: increment(amount) });
    toast({ title: "تم تحديث الرصيد", description: `تم إضافة ${amount} EGP للحساب.` });
  };

  const banUserAction = async (userId: string, status: boolean) => {
    if (!db) return;
    await updateDoc(doc(db, "users", userId), { isBanned: status });
    toast({ title: status ? "تم الحظر السيادي" : "تم فك الحظر", variant: status ? "destructive" : "default" });
  };

  const addForbiddenWord = async (word: string) => {
    if (!db || !word) return;
    await addDoc(collection(db, "system", "moderation", "forbiddenWords"), {
      word,
      severity: "high",
      addedAt: new Date().toISOString()
    });
    toast({ title: "تم تحديث الدرع الواقي", description: `الكلمة "${word}" أصبحت محظورة الآن.` });
  };

  const handleLogout = async () => {
    await signOut();
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
                
                {perms.canManageUsers && (
                  <>
                    <p className="text-[10px] text-white/30 font-black uppercase tracking-widest pt-4 pb-2 px-4">غرفة القيادة</p>
                    <SideBtn icon={<Users />} text="المواطنون" active={currentPage === "users"} onClick={() => setCurrentPage("users")} />
                    <SideBtn icon={<ShieldAlert />} text="الدرع الواقي" active={currentPage === "banned"} onClick={() => setCurrentPage("banned")} />
                    <SideBtn icon={<Activity />} text="الأرشيف الحي" active={currentPage === "logs"} onClick={() => setCurrentPage("logs")} />
                  </>
                )}

                <p className="text-[10px] text-white/30 font-black uppercase tracking-widest pt-4 pb-2 px-4">الخدمات</p>
                <SideBtn icon={<Gavel />} text="مجلس الخبراء" active={currentPage === "advisors"} onClick={() => router.push("/consultants")} />
                <SideBtn icon={<Tag />} text="باقات الشحن" active={currentPage === "offers"} onClick={() => router.push("/pricing")} />
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
          
          <header className="h-16 bg-gradient-to-r from-[#43cea2] to-[#185a9d] text-white flex items-center justify-between px-6 z-40 shadow-xl">
            <div className="flex items-center gap-4">
              <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="p-2 bg-white/10 rounded-xl hover:bg-white/20 transition-all">
                <Menu className="h-5 w-5" />
              </button>
              <div className="flex flex-col">
                <h1 className="text-sm font-black tracking-tight leading-none">
                  {role === 'admin' ? "بوابة القيادة العليا" : "المستشار الذكي"}
                </h1>
                <p className="text-[8px] font-bold opacity-60 uppercase tracking-widest mt-1">Sovereign Protocol Active</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="hidden sm:flex items-center gap-2 bg-white/10 px-4 py-1.5 rounded-full border border-white/10">
                <Wallet className="h-3.5 w-3.5 text-accent" />
                <span className="text-xs font-black tabular-nums">{role === 'admin' ? '∞' : profile?.balance || 0} EGP</span>
              </div>
              <button onClick={() => setTheme(theme === "dark" ? "light" : "dark")} className="p-2 bg-white/10 rounded-xl hover:bg-white/20 transition-all">
                {theme === "dark" ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
              </button>
            </div>
          </header>

          <main className="flex-1 relative overflow-hidden flex flex-col">
            {currentPage === "home" ? (
              <>
                <div ref={scrollRef} className="flex-1 overflow-y-auto p-6 space-y-8 relative z-10 scrollbar-none bg-[#f8f9fc] dark:bg-slate-900">
                  <div className="max-w-4xl mx-auto space-y-8">
                    {messages.map((m) => (
                      <motion.div key={m.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className={`flex flex-col ${m.role === "user" ? "items-start" : "items-end"}`}>
                        <div className={`p-5 rounded-[2.5rem] text-sm max-w-[85%] shadow-xl border ${m.role === "user" ? "bg-white text-slate-800 border-border rounded-tr-none" : "bg-[#d1ecf1] text-[#0c5460] border-[#bee5eb] rounded-tl-none"}`}>
                          <p className="leading-relaxed font-medium">{m.text}</p>
                          <div className="flex items-center gap-2 mt-4 pt-3 border-t border-black/5">
                             <button onClick={() => setInputText(m.text)} className="bg-black/5 hover:bg-black/10 text-[9px] font-black px-3 py-1.5 rounded-lg transition-all">رد سريع</button>
                             <button onClick={() => { navigator.clipboard.writeText(m.text); toast({ title: "تم النسخ" }); }} className="bg-black/5 hover:bg-black/10 text-[9px] font-black px-3 py-1.5 rounded-lg transition-all">نسخ</button>
                             <button onClick={() => setMessages(prev => prev.filter(msg => msg.id !== m.id))} className="bg-red-500/5 hover:bg-red-500/10 text-red-600 text-[9px] font-black px-3 py-1.5 rounded-lg transition-all">حذف</button>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                    {isTyping && <div className="flex gap-2 p-4 opacity-40"><div className="w-2 h-2 bg-primary rounded-full animate-bounce" /><div className="w-2 h-2 bg-primary rounded-full animate-bounce delay-100" /><div className="w-2 h-2 bg-primary rounded-full animate-bounce delay-200" /></div>}
                  </div>
                </div>

                <div className="p-6 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border-t border-border z-20">
                  <div className="max-w-4xl mx-auto flex gap-4">
                    <input 
                      value={inputText} 
                      onChange={(e) => setInputText(e.target.value)} 
                      onKeyDown={(e) => e.key === 'Enter' && handleSend()} 
                      placeholder="اكتب استفسارك القانوني..." 
                      className="flex-1 bg-[#f8f9fa] dark:bg-slate-800 rounded-2xl px-6 py-4 text-sm outline-none border border-transparent focus:border-[#43cea2]/20 shadow-inner font-medium" 
                    />
                    <button 
                      onClick={handleSend} 
                      disabled={!inputText.trim() || isTyping} 
                      className="bg-gradient-to-r from-[#43cea2] to-[#185a9d] text-white px-8 rounded-2xl font-black text-sm hover:scale-105 transition-transform shadow-xl active:scale-95 flex items-center gap-2 disabled:opacity-50"
                    >
                      {isTyping ? <Cpu className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4 rotate-180" />}
                    </button>
                  </div>
                </div>
              </>
            ) : (
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="flex-1 p-8 space-y-10 overflow-y-auto bg-white dark:bg-slate-900">
                
                {/* إدارة المستخدمين الفعالة */}
                {currentPage === "users" && (
                  <div className="max-w-5xl mx-auto space-y-8">
                    <div className="flex items-center justify-between border-b border-border pb-6">
                      <div>
                        <h2 className="text-4xl font-black tracking-tighter text-[#185a9d]">إدارة المواطنين</h2>
                        <p className="text-sm text-muted-foreground mt-2 font-bold">عرض وتعديل كافة الحسابات والامتيازات المالية.</p>
                      </div>
                      <Users className="h-12 w-12 text-[#185a9d] opacity-20" />
                    </div>
                    
                    <div className="grid gap-4">
                      {allUsers?.map(u => (
                        <div key={u.id} className="p-6 glass rounded-3xl border border-border/50 flex flex-col md:flex-row items-center justify-between gap-6 hover:border-[#185a9d]/30 transition-all">
                          <div className="flex items-center gap-4 text-right">
                            <div className="h-12 w-12 rounded-2xl bg-[#185a9d]/10 flex items-center justify-center font-black text-[#185a9d]">{u.fullName?.charAt(0)}</div>
                            <div>
                              <p className="font-black text-lg">{u.fullName}</p>
                              <p className="text-[10px] text-muted-foreground uppercase font-bold">{u.email} | {u.role}</p>
                            </div>
                          </div>
                          
                          <div className="flex items-center gap-3">
                            <div className="bg-primary/5 px-4 py-2 rounded-xl text-primary font-black text-sm">
                              {u.balance} EGP
                            </div>
                            <button onClick={() => adjustUserBalance(u.id, 50)} className="p-2 bg-green-500/10 text-green-600 rounded-xl hover:bg-green-500/20" title="إضافة 50 EGP"><Plus className="h-5 w-5" /></button>
                            <button onClick={() => banUserAction(u.id, !u.isBanned)} className={`p-2 rounded-xl transition-all ${u.isBanned ? 'bg-red-500 text-white' : 'bg-red-500/10 text-red-600 hover:bg-red-500/20'}`} title="حظر/فك حظر"><Ban className="h-5 w-5" /></button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* إدارة الدرع الواقي (Banned Words) */}
                {currentPage === "banned" && (
                  <div className="max-w-3xl mx-auto space-y-8">
                    <div className="flex items-center justify-between border-b border-border pb-6">
                      <h2 className="text-4xl font-black tracking-tighter text-red-600">الدرع الواقي</h2>
                      <ShieldAlert className="h-12 w-12 text-red-600 opacity-20" />
                    </div>
                    
                    <div className="flex gap-2">
                      <input id="new-word" placeholder="أضف كلمة محظورة جديدة..." className="flex-1 glass border-border h-14 rounded-2xl px-6 outline-none focus:border-red-500/30" />
                      <button 
                        onClick={() => {
                          const el = document.getElementById('new-word') as HTMLInputElement;
                          addForbiddenWord(el.value);
                          el.value = "";
                        }}
                        className="bg-red-600 text-white px-8 rounded-2xl font-black text-sm shadow-xl"
                      >إضافة</button>
                    </div>

                    <div className="flex flex-wrap gap-2">
                      {forbiddenWords?.map(w => (
                        <div key={w.id} className="flex items-center gap-2 bg-red-500/10 text-red-600 px-4 py-2 rounded-xl border border-red-500/20 font-bold">
                          {w.word}
                          <button onClick={() => deleteDoc(doc(db!, "system", "moderation", "forbiddenWords", w.id))} className="hover:text-red-800"><X className="h-3 w-3" /></button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* أرشيف الأحداث الحي (Logs) */}
                {currentPage === "logs" && (
                  <div className="max-w-5xl mx-auto space-y-8">
                    <div className="flex items-center justify-between border-b border-border pb-6">
                      <h2 className="text-4xl font-black tracking-tighter text-slate-600">الأرشيف الحي</h2>
                      <Activity className="h-12 w-12 text-slate-600 opacity-20" />
                    </div>
                    <div className="space-y-3">
                      {systemLogs?.map(log => (
                        <div key={log.id} className="p-4 bg-secondary/30 rounded-2xl border border-border/50 text-xs font-mono flex items-center justify-between group">
                          <div>
                            <span className="text-primary font-black ml-3">[{log.createdAt?.toDate?.().toLocaleTimeString() || "JUST NOW"}]</span>
                            <span className="font-bold">{log.userName}:</span> {log.text || log.event}
                          </div>
                          <Badge variant="outline" className="opacity-0 group-hover:opacity-100 transition-opacity uppercase text-[8px] font-black">{log.event}</Badge>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

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
