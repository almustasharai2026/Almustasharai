"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Send, Cpu, Scale, LogOut, Home, Settings, Users, Gavel, ShieldAlert, Tag, Activity,
  Menu, X, Plus, ChevronDown, Copy, Trash2, Wallet, Crown, Search, Bell, Sun, Moon,
  ArrowLeft
} from "lucide-react";
import ProtectedRoute from "@/components/ProtectedRoute";
import { useUser, useFirestore, useCollection } from "@/firebase";
import { useToast } from "@/hooks/use-toast";
import { useTheme } from "next-themes";
import { useRouter } from "next/navigation";
import { collection, doc, updateDoc, addDoc, serverTimestamp, increment, deleteDoc } from "firebase/firestore";
import { useMemoFirebase } from "@/firebase/provider";
import { getPermissions, roles as ROLES_LIST } from "@/lib/roles";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import Link from "next/link";

interface Message {
  role: "user" | "ai";
  text: string;
  id: string;
}

export default function SovereignBotPage() {
  const { user, profile, signOut, role } = useUser();
  const db = useFirestore();
  const { theme, setTheme } = useTheme();
  const { toast } = useToast();
  const router = useRouter();
  const perms = getPermissions(role);
  
  const [currentPage, setCurrentPage] = useState("home");
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [messages, setMessages] = useState<Message[]>([
    { role: "ai", text: `أهلاً بك يا سيادة ${profile?.fullName || 'المواطن'} في مركز الاستشارة السيادي. كيف نخدم العدالة اليوم؟`, id: "init" }
  ]);
  const [inputText, setInputText] = useState("");
  const [isTyping, setIsTyping] = useState(false);

  // Queries
  const usersQuery = useMemoFirebase(() => db && perms.canManageUsers ? collection(db, "users") : null, [db, perms.canManageUsers]);
  const { data: allUsers } = useCollection(usersQuery);

  const bannedWordsQuery = useMemoFirebase(() => db ? collection(db, "system", "moderation", "forbiddenWords") : null, [db]);
  const { data: forbiddenWords } = useCollection(bannedWordsQuery);

  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
    }
  }, [messages, isTyping, currentPage]);

  const handleSend = async () => {
    if (!inputText.trim() || isTyping || !db || !user) return;

    if (role === ROLES_LIST.USER && (profile?.balance || 0) < 1) {
      toast({ variant: "destructive", title: "رصيد غير كافٍ", description: "يرجى شحن المحفظة السيادية للمتابعة." });
      return;
    }

    const userMsg: Message = { role: "user", text: inputText.trim(), id: Date.now().toString() };
    setMessages(prev => [...prev, userMsg]);
    setInputText("");
    setIsTyping(true);

    try {
      if (role !== ROLES_LIST.ADMIN) {
        await updateDoc(doc(db, "users", user.uid), { balance: increment(-1) });
      }

      setTimeout(() => {
        const aiMsg: Message = { 
          role: "ai", 
          text: "تم استلام استفسارك. جاري تحليل المعطيات القانونية وفقاً لأحدث التشريعات المعمول بها. يرجى الانتظار للحظات...", 
          id: (Date.now() + 1).toString() 
        };
        setMessages(prev => [...prev, aiMsg]);
        setIsTyping(false);
      }, 1000);
    } catch (e) {
      toast({ variant: "destructive", title: "فشل الإرسال" });
      setIsTyping(false);
    }
  };

  const handleLogout = async () => {
    await signOut();
    router.push("/auth/login");
  };

  return (
    <ProtectedRoute>
      <div className="flex h-screen bg-[#f8f9fc] dark:bg-[#020617] overflow-hidden" dir="rtl">
        
        {/* Persistent Sidebar */}
        <AnimatePresence>
          {isSidebarOpen && (
            <motion.aside 
              initial={{ x: "100%", opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: "100%", opacity: 0 }}
              className="w-72 h-full bg-[#4e54c8] dark:bg-[#1e1b4b] text-white flex flex-col z-50 shadow-2xl flex-shrink-0"
            >
              <div className="p-8 border-b border-white/10 flex items-center gap-4">
                <div className="h-12 w-12 rounded-[1.2rem] bg-white/20 flex items-center justify-center border border-white/10 shadow-inner">
                  <Scale className="h-7 v-7 text-white" />
                </div>
                <div>
                  <h2 className="text-xl font-black tracking-tighter">المستشار AI</h2>
                  <p className="text-[8px] font-black opacity-40 uppercase tracking-[0.2em]">Sovereign Control</p>
                </div>
              </div>

              <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
                <SideBtn icon={<Home className="h-5 w-5" />} text="الرئيسية" active={currentPage === "home"} onClick={() => setCurrentPage("home")} />
                
                {perms.canManageUsers && (
                  <>
                    <p className="text-[10px] text-white/30 font-black uppercase tracking-widest pt-6 pb-2 px-5">إدارة المواطنين</p>
                    <SideBtn icon={<Users className="h-5 w-5" />} text="قاعدة المواطنين" active={currentPage === "users"} onClick={() => setCurrentPage("users")} />
                    <SideBtn icon={<ShieldAlert className="h-5 w-5" />} text="الدرع الواقي" active={currentPage === "banned"} onClick={() => setCurrentPage("banned")} />
                  </>
                )}

                <p className="text-[10px] text-white/30 font-black uppercase tracking-widest pt-6 pb-2 px-5">خدماتي</p>
                <SideBtn icon={<Gavel className="h-5 w-5" />} text="مجلس الخبراء" onClick={() => router.push("/consultants")} />
                <SideBtn icon={<Tag className="h-5 w-5" />} text="باقات الشحن" onClick={() => router.push("/pricing")} />
              </nav>

              <div className="p-6 border-t border-white/10">
                <Link href="/">
                  <SideBtn icon={<ArrowLeft className="h-5 w-5" />} text="الصفحة الرئيسية" active={false} />
                </Link>
                <button onClick={handleLogout} className="w-full mt-2 flex items-center gap-4 px-5 py-4 rounded-2xl text-white/60 hover:text-white hover:bg-red-500/20 transition-all font-black text-sm">
                  <LogOut className="h-5 w-5" /> خروج
                </button>
              </div>
            </motion.aside>
          )}
        </AnimatePresence>

        {/* Workspace */}
        <div className="flex-1 flex flex-col relative overflow-hidden">
          
          <header className="h-20 bg-gradient-to-r from-[#4e54c8] to-[#8f94fb] dark:from-[#1e1b4b] dark:to-[#312e81] text-white flex items-center justify-between px-8 z-40 shadow-xl border-b border-white/10">
            <div className="flex items-center gap-6">
              <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="p-3 bg-white/10 rounded-2xl hover:bg-white/20 transition-all shadow-inner">
                <Menu className="h-6 w-6" />
              </button>
              <div className="flex flex-col">
                <h1 className="text-lg font-black tracking-tight leading-none uppercase">
                  {currentPage === "home" ? "مركز الاستشارة الذكي" : "غرفة القيادة العليا"}
                </h1>
                <Badge variant="outline" className="mt-2 text-[8px] border-white/20 text-white/60 bg-white/5 font-black uppercase tracking-widest">
                  Identity: {profile?.role || "Citizen"}
                </Badge>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="hidden md:flex items-center gap-3 bg-black/20 px-5 py-2 rounded-2xl border border-white/10">
                <Wallet className="h-4 w-4 text-primary" />
                <span className="text-sm font-black tabular-nums">{role === ROLES_LIST.ADMIN ? 'Unlimited' : (profile?.balance || 0) + ' EGP'}</span>
              </div>
              <button onClick={() => setTheme(theme === "dark" ? "light" : "dark")} className="p-3 bg-white/10 rounded-2xl hover:bg-white/20 transition-all shadow-inner">
                {theme === "dark" ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
              </button>
            </div>
          </header>

          <main className="flex-1 relative overflow-hidden flex flex-col bg-white dark:bg-slate-950">
            {currentPage === "home" ? (
              <>
                <div ref={scrollRef} className="flex-1 overflow-y-auto p-8 space-y-8">
                  <div className="max-w-4xl mx-auto space-y-10">
                    {messages.map((m) => (
                      <motion.div key={m.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className={`flex flex-col ${m.role === "user" ? "items-start" : "items-end"}`}>
                        <div className={`p-6 rounded-[2.5rem] text-sm max-w-[85%] shadow-2xl border leading-relaxed ${m.role === "user" ? "bg-white dark:bg-slate-900 text-slate-800 dark:text-white border-slate-200 dark:border-slate-800 rounded-tr-none" : "bg-indigo-50 dark:bg-indigo-900/30 text-indigo-900 dark:text-indigo-100 border-indigo-100 dark:border-indigo-900/50 rounded-tl-none font-medium"}`}>
                          <p>{m.text}</p>
                          <div className="flex items-center gap-2 mt-5 pt-4 border-t border-black/5 dark:border-white/5">
                             <button onClick={() => { navigator.clipboard.writeText(m.text); toast({ title: "تم النسخ" }); }} className="p-2 hover:bg-black/5 dark:hover:bg-white/5 rounded-lg text-slate-400 transition-all"><Copy className="h-3 w-3" /></button>
                             <button onClick={() => setMessages(prev => prev.filter(msg => msg.id !== m.id))} className="p-2 hover:bg-red-500/5 rounded-lg text-red-400 transition-all"><Trash2 className="h-3 w-3" /></button>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                    {isTyping && <div className="flex gap-2 p-4 opacity-40"><div className="w-2 h-2 bg-primary rounded-full animate-bounce" /><div className="w-2 h-2 bg-primary rounded-full animate-bounce delay-100" /><div className="w-2 h-2 bg-primary rounded-full animate-bounce delay-200" /></div>}
                  </div>
                </div>

                <div className="p-8 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border-t border-border z-20">
                  <div className="max-w-4xl mx-auto flex gap-4">
                    <Input 
                      value={inputText} 
                      onChange={(e) => setInputText(e.target.value)} 
                      onKeyDown={(e) => e.key === 'Enter' && handleSend()} 
                      placeholder="اطرح سؤالك القانوني برصانة..." 
                      className="flex-1 h-16 rounded-3xl px-8 border-none bg-[#f0f4f8] dark:bg-slate-800 focus:ring-2 focus:ring-primary/20 text-lg font-medium" 
                    />
                    <button 
                      onClick={handleSend} 
                      disabled={!inputText.trim() || isTyping} 
                      className="bg-gradient-to-r from-[#43cea2] to-[#185a9d] text-white px-10 rounded-3xl font-black hover:scale-105 transition-all shadow-2xl active:scale-95 disabled:opacity-50"
                    >
                      {isTyping ? <Cpu className="h-6 w-6 animate-spin" /> : <Send className="h-6 w-6 rotate-180" />}
                    </button>
                  </div>
                </div>
              </>
            ) : (
              <div className="flex-1 p-8 lg:p-12 overflow-y-auto">
                {currentPage === "users" && (
                  <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4">
                    <h2 className="text-4xl font-black text-primary tracking-tighter">قاعدة المواطنين الرقمية</h2>
                    <div className="grid gap-6">
                      {allUsers?.map(u => (
                        <Card key={u.id} className="glass border-none rounded-[2.5rem] shadow-xl overflow-hidden">
                          <CardContent className="p-8 flex items-center justify-between gap-8">
                            <div className="flex items-center gap-6">
                              <div className="h-16 w-16 rounded-2xl bg-primary/10 flex items-center justify-center text-2xl font-black text-primary">
                                {u.fullName?.charAt(0)}
                              </div>
                              <div className="space-y-1">
                                <h3 className="text-xl font-black text-slate-900 dark:text-white">{u.fullName}</h3>
                                <p className="text-xs text-muted-foreground font-bold uppercase tracking-widest">{u.email}</p>
                              </div>
                            </div>
                            <div className="flex items-center gap-4">
                              <Badge className="px-4 py-1.5 rounded-full font-black text-[10px] uppercase bg-primary/10 text-primary border-none">
                                Role: {u.role}
                              </Badge>
                              <div className="h-10 w-px bg-border" />
                              <p className="text-lg font-black tabular-nums">{u.balance} EGP</p>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </div>
                )}
                
                {currentPage === "banned" && (
                  <div className="max-w-3xl mx-auto space-y-10 animate-in fade-in zoom-in-95">
                    <div className="text-center space-y-4">
                      <div className="h-20 w-20 mx-auto rounded-[2rem] bg-red-500/10 flex items-center justify-center text-red-600 border border-red-500/20">
                        <ShieldAlert className="h-10 w-10" />
                      </div>
                      <h2 className="text-4xl font-black text-red-600 tracking-tighter">الدرع الواقي السيادي</h2>
                      <p className="text-muted-foreground font-bold">إدارة الكلمات المحظورة التي يراقبها محرك الرقابة اللحظي.</p>
                    </div>
                    <div className="flex gap-4">
                      <Input id="new-word" placeholder="أدخل كلمة محظورة جديدة..." className="h-16 rounded-2xl border-2 border-red-500/10 bg-white dark:bg-slate-900 px-8 text-lg font-medium" />
                      <button className="bg-red-600 text-white px-10 rounded-2xl font-black hover:scale-105 transition-all shadow-xl">إضافة</button>
                    </div>
                    <div className="flex flex-wrap gap-3">
                      {forbiddenWords?.map(w => (
                        <Badge key={w.id} className="p-4 rounded-2xl bg-red-500/5 text-red-600 border border-red-500/10">
                          <span className="font-black">{w.word}</span>
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </main>
        </div>
      </div>
    </ProtectedRoute>
  );
}

function SideBtn({ icon, text, active, onClick }: any) {
  return (
    <button onClick={onClick} className={`w-full flex items-center gap-5 px-6 py-4 rounded-2xl transition-all duration-300 font-black text-sm ${active ? "bg-white/20 text-white shadow-2xl scale-[1.03]" : "text-white/50 hover:text-white hover:bg-white/10"}`}>
      <span className="shrink-0">{icon}</span>
      <span className="tracking-tight">{text}</span>
    </button>
  );
}
