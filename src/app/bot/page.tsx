
"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Send, Cpu, ShieldCheck, Sparkles, Copy, Trash2, Reply, 
  Settings, Users, Gavel, ShieldAlert, Tag, Activity, 
  Bell, Moon, Sun, Search, X, Plus, Menu, Home, LogOut,
  Scale, ChevronLeft, Wallet, UserPlus, Ban, CheckCircle,
  Crown, Shield, User as UserIcon
} from "lucide-react";
import ProtectedRoute from "@/components/ProtectedRoute";
import { useUser, useFirestore, useCollection } from "@/firebase";
import { useToast } from "@/hooks/use-toast";
import { useTheme } from "next-themes";
import { useRouter } from "next/navigation";
import { collection, doc, updateDoc, deleteDoc, addDoc, serverTimestamp, increment } from "firebase/firestore";
import { useMemoFirebase } from "@/firebase/provider";
import { getPermissions, roles as ROLES_LIST } from "@/lib/roles";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";

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
    { role: "ai", text: `أهلاً بك يا سيادة ${profile?.fullName || 'المالك'} في مركز القيادة السيادي. كيف نخدم العدالة اليوم؟`, id: "init" }
  ]);
  const [inputText, setInputText] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  
  // Sovereign Data Queries
  const usersQuery = useMemoFirebase(() => db && perms.canManageUsers ? collection(db, "users") : null, [db, perms.canManageUsers]);
  const { data: allUsers, isLoading: usersLoading } = useCollection(usersQuery);

  const bannedWordsQuery = useMemoFirebase(() => db ? collection(db, "system", "moderation", "forbiddenWords") : null, [db]);
  const { data: forbiddenWords } = useCollection(bannedWordsQuery);

  const logsQuery = useMemoFirebase(() => db && perms.canManageUsers ? collection(db, "analytics") : null, [db, perms.canManageUsers]);
  const { data: systemLogs } = useCollection(logsQuery);

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

      await addDoc(collection(db, "analytics"), {
        event: "chat_query",
        userId: user.uid,
        userName: profile?.fullName,
        text: userMsg.text,
        createdAt: serverTimestamp()
      });

      setTimeout(() => {
        const aiMsg: Message = { 
          role: "ai", 
          text: "تم استلام استفسارك. بصفتي المحرك السيادي، أؤكد لك أن كافة البيانات تخضع لمعايير الأمان القصوى. جاري معالجة طلبك...", 
          id: (Date.now() + 1).toString() 
        };
        setMessages(prev => [...prev, aiMsg]);
        setIsTyping(false);
      }, 800);
    } catch (e) {
      toast({ variant: "destructive", title: "فشل الإرسال السيادي" });
      setIsTyping(false);
    }
  };

  // --- Master Actions (Real functionality) ---

  const promoteUser = async (userId: string, newRole: string) => {
    if (!db || !perms.canPromoteRoles) return;
    try {
      await updateDoc(doc(db, "users", userId), { role: newRole });
      toast({ title: "تم تغيير الرتبة", description: `المستخدم الآن يحمل رتبة: ${newRole.toUpperCase()}` });
    } catch (e) {
      toast({ variant: "destructive", title: "فشل الترقية" });
    }
  };

  const adjustBalance = async (userId: string, amount: number) => {
    if (!db || !perms.canManageMoney) return;
    try {
      await updateDoc(doc(db, "users", userId), { balance: increment(amount) });
      toast({ title: "تعديل رصيد", description: `تم إضافة ${amount} EGP للمواطن.` });
    } catch (e) {
      toast({ variant: "destructive", title: "فشل التعديل المالي" });
    }
  };

  const toggleBan = async (userId: string, currentStatus: boolean) => {
    if (!db || !perms.canManageUsers) return;
    try {
      await updateDoc(doc(db, "users", userId), { isBanned: !currentStatus });
      toast({ 
        title: !currentStatus ? "تم الحظر السيادي" : "تم فك الحظر", 
        variant: !currentStatus ? "destructive" : "default" 
      });
    } catch (e) {
      toast({ variant: "destructive", title: "فشلت العملية" });
    }
  };

  const deleteUser = async (userId: string) => {
    if (!db || !perms.canPromoteRoles || !confirm("هل أنت متأكد من حذف المواطن نهائياً؟")) return;
    try {
      await deleteDoc(doc(db, "users", userId));
      toast({ title: "تم الحذف", description: "تم تطهير النظام من سجلات المواطن." });
    } catch (e) {
      toast({ variant: "destructive", title: "فشل الحذف" });
    }
  };

  const addWord = async (word: string) => {
    if (!db || !word.trim()) return;
    try {
      await addDoc(collection(db, "system", "moderation", "forbiddenWords"), {
        word: word.trim(),
        severity: "high",
        addedBy: user?.uid,
        createdAt: serverTimestamp()
      });
      toast({ title: "تحديث الدرع", description: `الكلمة "${word}" محظورة الآن.` });
    } catch (e) {
      toast({ variant: "destructive", title: "فشل التحديث" });
    }
  };

  const removeWord = async (wordId: string) => {
    if (!db) return;
    try {
      await deleteDoc(doc(db, "system", "moderation", "forbiddenWords", wordId));
      toast({ title: "تم فك الرقابة" });
    } catch (e) {
      toast({ variant: "destructive", title: "فشل الحذف" });
    }
  };

  const handleLogout = async () => {
    await signOut();
    router.push("/auth/login");
  };

  return (
    <ProtectedRoute>
      <div className="flex h-screen bg-[#f8f9fc] dark:bg-[#020617] overflow-hidden" dir="rtl">
        
        {/* Sovereign Sidebar */}
        <AnimatePresence>
          {isSidebarOpen && (
            <motion.aside 
              initial={{ x: "100%", opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: "100%", opacity: 0 }}
              className="w-72 h-full sidebar-gradient text-white flex flex-col z-50 shadow-2xl flex-shrink-0"
            >
              <div className="p-8 border-b border-white/10 flex items-center gap-4">
                <div className="h-12 w-12 rounded-[1.2rem] bg-white/20 flex items-center justify-center border border-white/10 shadow-inner">
                  <Scale className="h-7 w-7 text-white" />
                </div>
                <div>
                  <h2 className="text-xl font-black tracking-tighter">المستشار AI</h2>
                  <p className="text-[8px] font-black opacity-40 uppercase tracking-[0.2em]">Sovereign Control</p>
                </div>
              </div>

              <nav className="flex-1 p-4 space-y-2 overflow-y-auto scrollbar-none">
                <SideBtn icon={<Home className="h-5 w-5" />} text="الرئيسية" active={currentPage === "home"} onClick={() => setCurrentPage("home")} />
                
                {perms.canManageUsers && (
                  <>
                    <p className="text-[10px] text-white/30 font-black uppercase tracking-widest pt-6 pb-2 px-5">إدارة المواطنين</p>
                    <SideBtn icon={<Users className="h-5 w-5" />} text="قاعدة المواطنين" active={currentPage === "users"} onClick={() => setCurrentPage("users")} />
                    <SideBtn icon={<ShieldAlert className="h-5 w-5" />} text="الدرع الواقي" active={currentPage === "banned"} onClick={() => setCurrentPage("banned")} />
                    <SideBtn icon={<Activity className="h-5 w-5" />} text="أرشيف العمليات" active={currentPage === "logs"} onClick={() => setCurrentPage("logs")} />
                  </>
                )}

                <p className="text-[10px] text-white/30 font-black uppercase tracking-widest pt-6 pb-2 px-5">الخدمات السيادية</p>
                <SideBtn icon={<Gavel className="h-5 w-5" />} text="مجلس الخبراء" onClick={() => router.push("/consultants")} />
                <SideBtn icon={<Tag className="h-5 w-5" />} text="باقات الشحن" onClick={() => router.push("/pricing")} />
                <SideBtn icon={<Settings className="h-5 w-5" />} text="الإعدادات" active={currentPage === "settings"} onClick={() => setCurrentPage("settings")} />
              </nav>

              <div className="p-6 border-t border-white/10">
                <button onClick={handleLogout} className="w-full flex items-center gap-4 px-5 py-4 rounded-2xl text-white/60 hover:text-white hover:bg-red-500/20 transition-all font-black text-sm">
                  <LogOut className="h-5 w-5" /> تسجيل الخروج
                </button>
              </div>
            </motion.aside>
          )}
        </AnimatePresence>

        {/* Main Workspace */}
        <div className="flex-1 flex flex-col relative overflow-hidden">
          
          <header className="h-20 top-bar-gradient text-white flex items-center justify-between px-8 z-40 shadow-xl border-b border-white/10">
            <div className="flex items-center gap-6">
              <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="p-3 bg-white/10 rounded-2xl hover:bg-white/20 transition-all shadow-inner">
                <Menu className="h-6 w-6" />
              </button>
              <div className="flex flex-col">
                <h1 className="text-lg font-black tracking-tight leading-none uppercase">
                  {currentPage === "home" ? "مركز الاستشارة الذكي" : "بوابة القيادة العليا"}
                </h1>
                <Badge variant="outline" className="mt-2 text-[8px] border-white/20 text-white/60 bg-white/5 font-black uppercase tracking-widest">
                  Identity: {profile?.role || "Citizen"}
                </Badge>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="hidden md:flex items-center gap-3 bg-black/20 px-5 py-2 rounded-2xl border border-white/10">
                <Wallet className="h-4 w-4 text-accent" />
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
                <div ref={scrollRef} className="flex-1 overflow-y-auto p-8 space-y-8 scrollbar-none">
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
              <div className="flex-1 p-8 lg:p-12 overflow-y-auto scrollbar-thin">
                <div className="max-w-6xl mx-auto space-y-12">
                  
                  {currentPage === "users" && (
                    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <h2 className="text-4xl font-black text-primary tracking-tighter">سجل المواطنين</h2>
                          <p className="text-muted-foreground mt-2 font-bold uppercase text-[10px] tracking-widest">Citizen Identification Protocol</p>
                        </div>
                        <div className="h-16 w-16 rounded-3xl bg-primary/10 flex items-center justify-center text-primary shadow-inner">
                          <Users className="h-8 w-8" />
                        </div>
                      </div>

                      <div className="grid gap-6">
                        {usersLoading ? (
                          <div className="py-20 flex justify-center"><Cpu className="h-10 w-10 animate-spin text-primary opacity-20" /></div>
                        ) : allUsers?.map(u => (
                          <Card key={u.id} className="glass border-none rounded-[2.5rem] shadow-xl hover:border-primary/20 transition-all overflow-hidden group">
                            <CardContent className="p-8 flex flex-col lg:flex-row items-center justify-between gap-8">
                              <div className="flex items-center gap-6">
                                <div className="h-20 w-20 rounded-[2rem] bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-800 dark:to-slate-900 flex items-center justify-center text-3xl font-black text-primary shadow-inner">
                                  {u.fullName?.charAt(0)}
                                </div>
                                <div className="space-y-1">
                                  <div className="flex items-center gap-3">
                                    <h3 className="text-xl font-black text-slate-900 dark:text-white">{u.fullName}</h3>
                                    {u.role === ROLES_LIST.ADMIN && <Badge className="bg-amber-500/10 text-amber-600 border-none font-black text-[8px] uppercase">Master</Badge>}
                                    {u.role === ROLES_LIST.VIP && <Badge className="bg-emerald-500/10 text-emerald-600 border-none font-black text-[8px] uppercase">VIP Citizen</Badge>}
                                    {u.isBanned && <Badge variant="destructive" className="font-black text-[8px] uppercase animate-pulse">Banned</Badge>}
                                  </div>
                                  <p className="text-xs text-muted-foreground font-bold">{u.email}</p>
                                </div>
                              </div>

                              <div className="flex flex-wrap items-center justify-center gap-4">
                                <div className="bg-primary/5 px-6 py-3 rounded-2xl border border-primary/10">
                                  <p className="text-[8px] font-black text-primary/40 uppercase tracking-widest mb-1">المحفظة</p>
                                  <p className="text-xl font-black text-primary tabular-nums">{u.balance} EGP</p>
                                </div>

                                <div className="flex gap-2">
                                  {/* Role Promotion (ADMIN ONLY) */}
                                  <Select defaultValue={u.role} onValueChange={(val) => promoteUser(u.id, val)}>
                                    <SelectTrigger className="w-32 h-12 rounded-xl glass border-white/10 text-[10px] font-black">
                                      <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                      <SelectItem value="user">مواطن</SelectItem>
                                      <SelectItem value="vip">عميل مميز</SelectItem>
                                      <SelectItem value="moderator">مشرف</SelectItem>
                                      <SelectItem value="consultant">مستشار</SelectItem>
                                    </SelectContent>
                                  </Select>

                                  <button onClick={() => adjustBalance(u.id, 100)} className="h-12 w-12 rounded-xl bg-green-500/10 text-green-600 border border-green-500/20 flex items-center justify-center hover:bg-green-500/20 transition-all shadow-sm"><Wallet className="h-5 w-5" /></button>
                                  <button onClick={() => toggleBan(u.id, u.isBanned)} className={`h-12 w-12 rounded-xl border flex items-center justify-center transition-all shadow-sm ${u.isBanned ? 'bg-red-600 text-white border-red-600' : 'bg-red-500/10 text-red-600 border-red-500/20 hover:bg-red-500/20'}`}><Ban className="h-5 w-5" /></button>
                                  <button onClick={() => deleteUser(u.id)} className="h-12 w-12 rounded-xl bg-slate-500/5 text-slate-400 border border-slate-200 dark:border-slate-800 flex items-center justify-center hover:bg-red-500/10 hover:text-red-500 transition-all"><Trash2 className="h-5 w-5" /></button>
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    </div>
                  )}

                  {currentPage === "banned" && (
                    <div className="max-w-3xl mx-auto space-y-10 animate-in fade-in zoom-in-95 duration-500">
                      <div className="text-center space-y-4">
                        <div className="h-20 w-20 mx-auto rounded-[2rem] bg-red-500/10 flex items-center justify-center text-red-600 border border-red-500/20 shadow-2xl">
                          <ShieldAlert className="h-10 w-10" />
                        </div>
                        <h2 className="text-4xl font-black text-red-600 tracking-tighter">الدرع الواقي السيادي</h2>
                        <p className="text-muted-foreground font-bold">إدارة الكلمات المحظورة التي يراقبها محرك الرقابة اللحظي.</p>
                      </div>

                      <div className="flex gap-4">
                        <Input id="new-word" placeholder="أدخل كلمة محظورة جديدة..." className="h-16 rounded-2xl border-2 border-red-500/10 bg-white dark:bg-slate-900 px-8 text-lg font-medium" />
                        <button 
                          onClick={() => {
                            const el = document.getElementById('new-word') as HTMLInputElement;
                            if (el.value) { addWord(el.value); el.value = ""; }
                          }}
                          className="bg-red-600 text-white px-10 rounded-2xl font-black hover:scale-105 transition-all shadow-xl shadow-red-600/20"
                        >إضافة</button>
                      </div>

                      <div className="flex flex-wrap gap-3">
                        {forbiddenWords?.map(w => (
                          <Badge key={w.id} className="p-4 rounded-2xl bg-red-500/5 text-red-600 border border-red-500/10 flex items-center gap-3 group">
                            <span className="font-black">{w.word}</span>
                            <button onClick={() => removeWord(w.id)} className="opacity-0 group-hover:opacity-100 transition-opacity hover:text-red-800"><X className="h-4 w-4" /></button>
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  {currentPage === "logs" && (
                    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4">
                      <div className="flex items-center justify-between border-b border-border pb-8">
                        <div>
                          <h2 className="text-4xl font-black text-slate-600 tracking-tighter">أرشيف العمليات</h2>
                          <p className="text-xs text-muted-foreground font-bold uppercase tracking-widest mt-2">Sovereign Live Event Stream</p>
                        </div>
                        <Activity className="h-12 w-12 text-slate-400 opacity-20" />
                      </div>
                      <div className="space-y-3 font-mono">
                        {systemLogs?.map(log => (
                          <div key={log.id} className="p-5 bg-[#f0f4f8] dark:bg-slate-900 rounded-2xl border border-border/50 text-[10px] flex items-center justify-between group hover:border-primary/30 transition-all">
                            <div className="flex items-center gap-4">
                              <span className="text-primary font-black">[{log.createdAt?.toDate?.().toLocaleTimeString() || "ACTIVE"}]</span>
                              <span className="text-slate-400 uppercase font-black">{log.event}:</span>
                              <span className="text-slate-700 dark:text-slate-300 font-medium">المواطن {log.userName} قام بـ {log.text || "عملية سيادية"}</span>
                            </div>
                            <div className="h-2 w-2 rounded-full bg-primary/40 animate-pulse" />
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                </div>
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
    <button onClick={onClick} className={`w-full flex items-center gap-5 px-6 py-4 rounded-2xl transition-all duration-500 font-black text-sm group ${active ? "bg-white/20 text-white shadow-2xl scale-[1.03] border border-white/10" : "text-white/50 hover:text-white hover:bg-white/10"}`}>
      <span className={`shrink-0 transition-transform duration-500 ${active ? 'scale-110' : 'group-hover:scale-110'}`}>{icon}</span>
      <span className="tracking-tight">{text}</span>
      {active && <div className="mr-auto h-1.5 w-1.5 rounded-full bg-accent shadow-[0_0_10px_#4ade80]" />}
    </button>
  );
}
