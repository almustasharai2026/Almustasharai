
"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Users, ShieldAlert, Wallet, Crown, Search, Bell, LogOut, 
  Trash2, CheckCircle2, XCircle, UserPlus, ShieldCheck, 
  Activity, LayoutDashboard, Settings, MessageSquare, 
  ArrowLeft, Loader2, Plus, Zap, Star, ArrowRightLeft,
  UserCheck, ShieldEllipsis, History, Cpu, Globe
} from "lucide-react";
import { useUser, useFirestore, useCollection } from "@/firebase";
import { useToast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";
import { 
  collection, doc, updateDoc, deleteDoc, addDoc, 
  serverTimestamp, increment, query, orderBy, setDoc 
} from "firebase/firestore";
import { useMemoFirebase } from "@/firebase/provider";
import { roles as ROLES_LIST, getPermissions } from "@/lib/roles";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { 
  Dialog, DialogContent, DialogHeader, DialogTitle, 
  DialogFooter, DialogDescription 
} from "@/components/ui/dialog";
import { 
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue 
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { ScrollArea } from "@/components/ui/scroll-area";
import Link from "next/link";

/**
 * مركز القيادة العليا السيادي - king2026 Edition
 * تم تفعيل كافة المحركات المالية والرقابية لتعمل بدقة متناهية.
 */
export default function SupremeCommandCenter() {
  const { user, profile, role, signOut } = useUser();
  const db = useFirestore();
  const router = useRouter();
  const { toast } = useToast();
  
  const [activeTab, setActiveTab] = useState("overview");
  const [searchTerm, setSearchTerm] = useState("");
  
  // States for Sovereign Actions
  const [isBalanceModalOpen, setIsBalanceModalOpen] = useState(false);
  const [isRoleModalOpen, setIsRoleModalOpen] = useState(false);
  const [isTransferModalOpen, setIsTransferModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [newBalance, setNewBalance] = useState("");
  const [newRole, setNewRole] = useState("");
  const [transferAmount, setTransferAmount] = useState("");
  const [isAutoApprove, setIsAutoApprove] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [newForbiddenWord, setNewForbiddenWord] = useState("");

  // Sovereign Collections
  const usersQuery = useMemoFirebase(() => db ? collection(db, "users") : null, [db]);
  const { data: allUsers, isLoading: isUsersLoading } = useCollection(usersQuery);

  const requestsQuery = useMemoFirebase(() => db ? collection(db, "paymentRequests") : null, [db]);
  const { data: paymentRequests } = useCollection(requestsQuery);

  const wordsQuery = useMemoFirebase(() => db ? collection(db, "system", "moderation", "forbiddenWords") : null, [db]);
  const { data: forbiddenWords } = useCollection(wordsQuery);

  const logsQuery = useMemoFirebase(() => db ? query(collection(db, "system", "logs", "events"), orderBy("timestamp", "desc")) : null, [db]);
  const { data: systemLogs } = useCollection(logsQuery);

  // --- Sovereign Protocol Management ---

  // 1. بروتوكول التعديل المالي
  const handleUpdateBalance = async () => {
    if (!db || !selectedUser || !newBalance) return;
    setIsProcessing(true);
    try {
      await updateDoc(doc(db, "users", selectedUser.id), { balance: parseFloat(newBalance) });
      await logEvent("BALANCE_UPDATE", `تم تعديل رصيد ${selectedUser.fullName} إلى ${newBalance} EGP`);
      toast({ title: "تم التحديث المالي ✅", description: "تمت مزامنة الرصيد الجديد في السحابة." });
      setIsBalanceModalOpen(false);
    } catch (e) {
      toast({ variant: "destructive", title: "فشل البروتوكول المالي" });
    } finally {
      setIsProcessing(false);
    }
  };

  // 2. بروتوكول تحويل السيادة (Transfer)
  const handleTransfer = async () => {
    if (!db || !selectedUser || !transferAmount) return;
    setIsProcessing(true);
    try {
      const amount = parseFloat(transferAmount);
      await updateDoc(doc(db, "users", selectedUser.id), { balance: increment(amount) });
      await logEvent("MANUAL_TRANSFER", `تم تحويل ${amount} EGP إلى ${selectedUser.fullName}`);
      toast({ title: "تم التحويل السيادي 🚀", description: `المواطن ${selectedUser.fullName} استلم الرصيد فوراً.` });
      setIsTransferModalOpen(false);
      setTransferAmount("");
    } catch (e) {
      toast({ variant: "destructive", title: "فشل التحويل" });
    } finally {
      setIsProcessing(false);
    }
  };

  // 3. بروتوكول الترقية الرتبية
  const handleUpdateRole = async () => {
    if (!db || !selectedUser || !newRole) return;
    setIsProcessing(true);
    try {
      await updateDoc(doc(db, "users", selectedUser.id), { role: newRole });
      await logEvent("ROLE_UPGRADE", `تمت ترقية ${selectedUser.fullName} إلى رتبة ${newRole}`);
      toast({ title: "تمت الترقية السيادية 👑", description: `المواطن يحمل الآن رتبة ${newRole}.` });
      setIsRoleModalOpen(false);
    } catch (e) {
      toast({ variant: "destructive", title: "فشل الترقية" });
    } finally {
      setIsProcessing(false);
    }
  };

  // 4. بروتوكول الحظر السيادي
  const handleToggleBan = async (u: any) => {
    if (!db) return;
    try {
      await updateDoc(doc(db, "users", u.id), { isBanned: !u.isBanned });
      await logEvent("BAN_PROTOCOL", `${u.isBanned ? 'فك حظر' : 'حظر'} المواطن ${u.fullName}`);
      toast({ title: u.isBanned ? "تم فك الحظر" : "تم الحظر السيادي 🚫" });
    } catch (e) {
      toast({ variant: "destructive", title: "فشل الإجراء" });
    }
  };

  // 5. بروتوكول التطهير (Delete)
  const handleDeleteUser = async (u: any) => {
    if (!db || !confirm(`هل أنت متأكد من تطهير سجل ${u.fullName} نهائياً؟`)) return;
    try {
      await deleteDoc(doc(db, "users", u.id));
      await logEvent("USER_PURGE", `تم حذف المواطن ${u.fullName} نهائياً من النظام`);
      toast({ title: "تم التطهير بنجاح" });
    } catch (e) {
      toast({ variant: "destructive", title: "فشل التطهير" });
    }
  };

  // 6. إدارة الدرع الواقي
  const handleAddForbiddenWord = async () => {
    if (!db || !newForbiddenWord.trim()) return;
    try {
      await addDoc(collection(db, "system", "moderation", "forbiddenWords"), {
        word: newForbiddenWord.trim(),
        severity: "critical",
        addedAt: serverTimestamp()
      });
      setNewForbiddenWord("");
      toast({ title: "تم تحديث الدرع الواقي 🛡️" });
    } catch (e) {
      toast({ variant: "destructive", title: "فشل التحديث" });
    }
  };

  // 7. تسجيل الأحداث السيادية
  const logEvent = async (type: string, detail: string) => {
    if (!db) return;
    await addDoc(collection(db, "system", "logs", "events"), {
      type,
      detail,
      admin: "king2026",
      timestamp: serverTimestamp()
    });
  };

  // 8. اعتماد طلبات الشحن
  const handleApproveRequest = async (req: any) => {
    if (!db) return;
    try {
      await updateDoc(doc(db, "users", req.userId), { balance: increment(req.amount) });
      await updateDoc(doc(db, "paymentRequests", req.id), { status: "approved", processedBy: "king2026" });
      await logEvent("PAYMENT_APPROVAL", `قبول شحن ${req.amount} EGP للمواطن ${req.userName}`);
      toast({ title: "تم الاعتماد والشحن ✅" });
    } catch (e) {
      toast({ variant: "destructive", title: "فشل الاعتماد" });
    }
  };

  // حماية الوصول السيادي المطلق
  if (role !== "admin") {
    return (
      <div className="h-screen flex flex-col items-center justify-center bg-[#020617] text-red-500 font-black gap-8">
        <Crown className="h-32 w-32 animate-pulse" />
        <h1 className="text-5xl uppercase tracking-[0.5em] text-center px-10 leading-relaxed">
          Sovereign Identity Unauthorized
        </h1>
        <Button onClick={() => router.push("/")} className="bg-red-600 text-white px-12 h-16 rounded-2xl text-xl font-black shadow-3xl">
          الهروب من منطقة الحظر
        </Button>
      </div>
    );
  }

  const filteredUsers = allUsers?.filter(u => 
    u.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) || 
    u.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="flex h-screen bg-[#f8faff] dark:bg-[#02040a] text-slate-900 dark:text-white font-sans overflow-hidden" dir="rtl">
      
      {/* Supreme Admin Sidebar */}
      <aside className="w-80 bg-[#1e1b4b] text-white flex flex-col z-50 shadow-3xl border-l border-white/5 relative overflow-hidden flex-shrink-0">
        <div className="absolute inset-0 bg-gradient-to-b from-primary/10 to-transparent pointer-events-none" />
        <div className="p-10 border-b border-white/5 flex items-center gap-5 bg-black/20 relative z-10">
          <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-primary to-amber-600 flex items-center justify-center shadow-2xl border border-white/20">
            <Crown className="h-8 w-8 text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-black tracking-tighter">غرفة القيادة</h2>
            <p className="text-[9px] font-black text-primary uppercase tracking-[0.3em]">king2026 Absolute Power</p>
          </div>
        </div>

        <nav className="flex-1 p-6 space-y-3 overflow-y-auto relative z-10">
          <AdminNavBtn icon={<Activity />} text="نظرة شاملة" active={activeTab === "overview"} onClick={() => setActiveTab("overview")} />
          <AdminNavBtn icon={<Users />} text="إدارة المواطنين" active={activeTab === "users"} onClick={() => setActiveTab("users")} />
          <AdminNavBtn icon={<Wallet />} text="مركز العمليات المالية" active={activeTab === "billing"} onClick={() => setActiveTab("billing")} />
          <AdminNavBtn icon={<ShieldAlert />} text="الدرع الواقي" active={activeTab === "moderation"} onClick={() => setActiveTab("moderation")} />
          <AdminNavBtn icon={<History />} text="سجلات الأحداث" active={activeTab === "logs"} onClick={() => setActiveTab("logs")} />
          <AdminNavBtn icon={<Settings />} text="إعدادات السيادة" active={activeTab === "settings"} onClick={() => setActiveTab("settings")} />
        </nav>

        <div className="p-8 border-t border-white/5 bg-black/30 relative z-10">
          <Link href="/bot">
            <AdminNavBtn icon={<ArrowLeft />} text="العودة للبوت" active={false} />
          </Link>
          <button onClick={() => signOut()} className="w-full mt-6 flex items-center gap-5 px-6 py-4 rounded-2xl text-red-400/60 hover:text-red-400 hover:bg-red-500/10 transition-all font-black text-sm group">
            <LogOut className="h-5 w-5 group-hover:translate-x-1 transition-transform" /> خروج سيادي
          </button>
        </div>
      </aside>

      {/* Supreme Workspace */}
      <main className="flex-1 flex flex-col relative overflow-hidden">
        <header className="h-24 bg-white dark:bg-[#02040a]/80 backdrop-blur-3xl border-b border-border flex items-center justify-between px-12 z-40 shadow-sm">
          <div className="flex items-center gap-8">
            <div className="h-12 w-12 bg-primary/5 rounded-2xl flex items-center justify-center text-primary border border-primary/10">
              <Cpu className="h-6 w-6 animate-pulse" />
            </div>
            <h1 className="text-2xl font-black tracking-tight text-primary uppercase">Supreme Sovereign Protocol active</h1>
          </div>

          <div className="flex items-center gap-8">
            <div className="text-left">
               <p className="text-sm font-black text-slate-900 dark:text-white">سيادة المالك king2026</p>
               <p className="text-[10px] text-muted-foreground font-black uppercase tracking-widest text-emerald-500">Online & Secured</p>
            </div>
            <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-primary to-amber-600 p-0.5 shadow-2xl">
               <div className="h-full w-full rounded-[0.9rem] bg-white dark:bg-slate-900 flex items-center justify-center font-black text-2xl text-primary">K</div>
            </div>
          </div>
        </header>

        <div className="flex-1 p-10 overflow-y-auto bg-[#f0f4f8] dark:bg-[#02040a]">
          <AnimatePresence mode="wait">
            
            {/* Overview Tab */}
            {activeTab === "overview" && (
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="grid grid-cols-1 md:grid-cols-4 gap-8">
                <StatBox label="المواطنون المسجلون" value={allUsers?.length || 0} icon={<Users />} color="blue" />
                <StatBox label="طلبات الشحن النشطة" value={paymentRequests?.filter(r => r.status === "pending").length || 0} icon={<Zap />} color="amber" />
                <StatBox label="كلمات الدرع الواقي" value={forbiddenWords?.length || 0} icon={<ShieldAlert />} color="red" />
                <StatBox label="السيولة المالية الإجمالية" value={allUsers?.reduce((acc, curr) => acc + (curr.balance || 0), 0).toLocaleString() + " EGP"} icon={<Wallet />} color="emerald" />
                
                <Card className="md:col-span-4 rounded-[3.5rem] border-none shadow-3xl bg-white dark:bg-slate-900/50 p-12 text-center overflow-hidden relative">
                   <div className="absolute inset-0 bg-primary/5 pointer-events-none" />
                   <Activity className="h-24 w-24 mx-auto mb-8 text-primary/20 animate-pulse" />
                   <h3 className="text-4xl font-black mb-4">مركز الرصد اللحظي</h3>
                   <p className="text-xl text-muted-foreground font-bold">النظام يراقب السحابة السيادية لضمان استقرار "كوكب المستشار" في كافة الأقطار.</p>
                </Card>
              </motion.div>
            )}

            {/* Users Management Tab */}
            {activeTab === "users" && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-10">
                <div className="flex justify-between items-center bg-white dark:bg-white/5 p-4 rounded-[2.5rem] shadow-xl">
                  <h2 className="text-4xl font-black text-primary tracking-tighter px-6">سجل المواطنين</h2>
                  <div className="relative w-[500px]">
                    <Search className="absolute right-6 top-1/2 -translate-y-1/2 text-primary h-6 w-6" />
                    <Input 
                      placeholder="ابحث عن مواطن بالاسم أو البريد السيادي..." 
                      className="pr-16 h-16 rounded-3xl bg-[#f8fafc] dark:bg-slate-900 border-none text-xl font-bold placeholder:opacity-30 shadow-inner"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>
                </div>

                <div className="grid gap-6">
                  {filteredUsers?.map((u) => (
                    <Card key={u.id} className={`rounded-[3rem] border-none shadow-2xl transition-all duration-500 overflow-hidden bg-white dark:bg-slate-900/80 ${u.isBanned ? 'grayscale opacity-40' : 'hover:scale-[1.01] hover:shadow-primary/10'}`}>
                      <CardContent className="p-10 flex items-center justify-between gap-10">
                        <div className="flex items-center gap-8">
                          <div className="h-20 w-20 rounded-[2rem] bg-primary/10 flex items-center justify-center text-3xl font-black text-primary shadow-inner">
                            {u.fullName?.charAt(0)}
                          </div>
                          <div>
                            <div className="flex items-center gap-4 mb-1">
                              <h3 className="text-2xl font-black">{u.fullName}</h3>
                              <Badge className="bg-emerald-500/10 text-emerald-500 border-none px-4 py-1 font-black text-[10px] uppercase">{u.role}</Badge>
                              {u.isBanned && <Badge variant="destructive" className="font-black text-[8px] animate-pulse">BANNED BY SOVEREIGN</Badge>}
                            </div>
                            <p className="text-sm text-muted-foreground font-bold uppercase tracking-widest">{u.email}</p>
                          </div>
                        </div>

                        <div className="flex items-center gap-12">
                          <div className="text-left border-l border-border pl-12">
                            <p className="text-[10px] text-muted-foreground font-black uppercase tracking-widest mb-1">رصيد المواطن</p>
                            <p className="text-4xl font-black text-primary tabular-nums">{u.balance} <span className="text-xs">EGP</span></p>
                          </div>
                          <div className="flex gap-3">
                            <ActionBtn icon={<Wallet />} onClick={() => { setSelectedUser(u); setNewBalance(u.balance.toString()); setIsBalanceModalOpen(true); }} tooltip="تعديل الرصيد" color="emerald" />
                            <ActionBtn icon={<ArrowRightLeft />} onClick={() => { setSelectedUser(u); setIsTransferModalOpen(true); }} tooltip="تحويل مالي سيادي" color="blue" />
                            <ActionBtn icon={<Crown />} onClick={() => { setSelectedUser(u); setNewRole(u.role); setIsRoleModalOpen(true); }} tooltip="تعديل الرتبة" color="amber" />
                            <ActionBtn icon={u.isBanned ? <CheckCircle2 /> : <XCircle />} onClick={() => handleToggleBan(u)} color={u.isBanned ? "emerald" : "red"} tooltip={u.isBanned ? "فك الحظر" : "حظر سيادي"} />
                            <ActionBtn icon={<Trash2 />} onClick={() => handleDeleteUser(u)} color="red" tooltip="تطهير نهائي" />
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </motion.div>
            )}

            {/* Billing & Requests Tab */}
            {activeTab === "billing" && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-10">
                <div className="flex justify-between items-center bg-white dark:bg-white/5 p-8 rounded-[3rem] shadow-xl border border-primary/10">
                  <div className="space-y-2">
                    <h2 className="text-4xl font-black text-primary tracking-tighter">مركز العمليات المالية</h2>
                    <p className="text-muted-foreground font-bold">مراجعة طلبات الشحن واعتماد السيولة المالية.</p>
                  </div>
                  <div className="flex items-center gap-6 bg-slate-950/20 px-8 py-4 rounded-3xl border border-white/5">
                    <div className="text-left">
                      <p className="text-[10px] font-black uppercase tracking-widest opacity-40">الطيار الآلي للشحن</p>
                      <p className="text-xs font-black text-emerald-500">{isAutoApprove ? "Active Autopilot" : "Manual Mode"}</p>
                    </div>
                    <Switch checked={isAutoApprove} onCheckedChange={setIsAutoApprove} className="data-[state=checked]:bg-emerald-500" />
                  </div>
                </div>

                <div className="grid gap-6">
                  {paymentRequests?.filter(r => r.status === "pending").map(req => (
                    <Card key={req.id} className="rounded-[3rem] border-none shadow-2xl bg-white dark:bg-slate-900 border-amber-500/10 hover:border-amber-500/30 transition-all">
                      <CardContent className="p-10 flex items-center justify-between">
                        <div className="flex items-center gap-8">
                          <div className="h-20 w-20 bg-amber-500/10 rounded-[2rem] flex items-center justify-center text-amber-600 shadow-inner">
                            <Zap className="h-10 w-10 animate-pulse" />
                          </div>
                          <div>
                            <h3 className="text-2xl font-black">طلب شحن من: {req.userName}</h3>
                            <p className="text-xs text-muted-foreground font-bold uppercase mt-1 tracking-widest">Phone Protocol: {req.userPhone || "Not Logged"}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-12">
                          <p className="text-5xl font-black text-amber-600 tabular-nums">{req.amount} <span className="text-sm opacity-40">EGP</span></p>
                          <div className="flex gap-4">
                            <Button onClick={() => handleApproveRequest(req)} className="bg-emerald-600 hover:bg-emerald-700 h-16 px-10 rounded-[1.5rem] font-black text-lg shadow-2xl transition-all hover:scale-105 active:scale-95">اعتماد سيادي ✅</Button>
                            <Button variant="ghost" onClick={async () => await deleteDoc(doc(db!, "paymentRequests", req.id))} className="h-16 rounded-[1.5rem] text-red-500 hover:bg-red-500/10 font-bold">رفض</Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                  {paymentRequests?.filter(r => r.status === "pending").length === 0 && (
                    <div className="py-40 text-center grayscale opacity-10">
                      <Globe className="h-32 w-32 mx-auto mb-6" />
                      <p className="text-3xl font-black">لا توجد طلبات معلقة سيادياً</p>
                    </div>
                  )}
                </div>
              </motion.div>
            )}

            {/* Moderation Tab */}
            {activeTab === "moderation" && (
              <motion.div initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} className="max-w-4xl mx-auto space-y-12 text-center">
                <div className="space-y-4">
                  <div className="h-28 w-28 bg-red-500/10 rounded-[3rem] flex items-center justify-center mx-auto text-red-600 border-2 border-red-500/20 shadow-3xl">
                    <ShieldEllipsis className="h-14 w-14 animate-pulse" />
                  </div>
                  <h2 className="text-5xl font-black text-red-600 tracking-tighter">إدارة الدرع الواقي</h2>
                  <p className="text-xl text-muted-foreground font-bold max-w-xl mx-auto">تطهير محادثات الكوكب من الكلمات التي تمس السيادة أو الأخلاق العامة.</p>
                </div>

                <div className="flex gap-4 bg-white dark:bg-white/5 p-4 rounded-[2.5rem] shadow-2xl">
                  <Input 
                    placeholder="أدخل كلمة محظورة جديدة للدرع..." 
                    className="h-16 rounded-2xl bg-transparent border-none px-8 text-xl font-bold focus:ring-0" 
                    value={newForbiddenWord}
                    onChange={(e) => setNewForbiddenWord(e.target.value)}
                  />
                  <Button onClick={handleAddForbiddenWord} className="h-16 px-12 rounded-2xl bg-red-600 hover:bg-red-700 text-white font-black text-xl shadow-2xl active:scale-95 transition-all">تفعيل الحظر</Button>
                </div>

                <div className="flex flex-wrap gap-4 justify-center pt-8">
                  {forbiddenWords?.map(w => (
                    <Badge key={w.id} className="p-6 rounded-[1.8rem] bg-white dark:bg-slate-900 text-red-600 border-2 border-red-500/10 shadow-xl group hover:border-red-500/40 transition-all">
                      <span className="font-black text-xl">{w.word}</span>
                      <button onClick={async () => { await deleteDoc(doc(db!, "system/moderation/forbiddenWords", w.id)); toast({ title: "تم التطهير من الدرع" }); }} className="mr-6 text-red-300 hover:text-red-600 transition-colors"><Trash2 className="h-5 w-5" /></button>
                    </Badge>
                  ))}
                </div>
              </motion.div>
            )}

            {/* Logs Tab */}
            {activeTab === "logs" && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-10">
                <h2 className="text-4xl font-black text-primary tracking-tighter">أرشيف العمليات السيادية</h2>
                <Card className="rounded-[3rem] border-none shadow-3xl bg-white dark:bg-slate-900/50 overflow-hidden">
                  <ScrollArea className="h-[600px] p-10">
                    <div className="space-y-6">
                      {systemLogs?.map((log, i) => (
                        <div key={i} className="flex items-start gap-6 p-6 glass rounded-3xl border-white/5 bg-white/[0.02] hover:bg-white/[0.05] transition-all group">
                          <div className="h-12 w-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary shrink-0 group-hover:scale-110 transition-transform">
                            <History className="h-6 w-6" />
                          </div>
                          <div className="flex-1 space-y-1">
                            <div className="flex justify-between items-center">
                              <Badge className="bg-primary/10 text-primary border-none font-black text-[9px] px-3">{log.type}</Badge>
                              <span className="text-[10px] text-muted-foreground font-bold">{log.timestamp?.toDate().toLocaleString('ar-EG')}</span>
                            </div>
                            <p className="text-lg font-bold text-slate-700 dark:text-white/80">{log.detail}</p>
                            <p className="text-[10px] text-muted-foreground uppercase font-black tracking-widest">Executed by: {log.admin}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                </Card>
              </motion.div>
            )}

          </AnimatePresence>
        </div>
      </main>

      {/* --- Supreme Sovereign Modals --- */}

      {/* 1. تعديل الرصيد */}
      <Dialog open={isBalanceModalOpen} onOpenChange={setIsBalanceModalOpen}>
        <DialogContent className="glass-cosmic border-none rounded-[4rem] p-12 text-right" dir="rtl">
          <DialogHeader>
            <DialogTitle className="text-4xl font-black text-white mb-4">التعديل المالي المباشر</DialogTitle>
            <DialogDescription className="text-white/40 font-bold text-lg">تحديث رصيد المواطن السيادي: {selectedUser?.fullName}</DialogDescription>
          </DialogHeader>
          <div className="py-12 space-y-8">
            <div className="space-y-3">
              <Label className="text-white/60 font-black uppercase text-[10px] tracking-widest mr-2">القيمة الجديدة للمحفظة (EGP)</Label>
              <Input 
                type="number" 
                value={newBalance} 
                onChange={e => setNewBalance(e.target.value)}
                className="h-20 rounded-3xl bg-white/5 border-white/10 text-4xl font-black text-primary text-center tabular-nums shadow-inner focus:ring-primary/20" 
              />
            </div>
          </div>
          <DialogFooter className="gap-6 pt-4">
            <Button variant="ghost" onClick={() => setIsBalanceModalOpen(false)} className="text-white/30 hover:text-white font-black text-lg h-16 px-10 rounded-2xl">إلغاء الأمر</Button>
            <Button onClick={handleUpdateBalance} disabled={isProcessing} className="btn-primary flex-1 h-16 rounded-[1.8rem] text-xl">
              {isProcessing ? <Loader2 className="animate-spin" /> : "تثبيت الرصيد الجديد"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 2. تحويل رصيد */}
      <Dialog open={isTransferModalOpen} onOpenChange={setIsTransferModalOpen}>
        <DialogContent className="glass-cosmic border-none rounded-[4rem] p-12 text-right" dir="rtl">
          <DialogHeader>
            <DialogTitle className="text-4xl font-black text-white mb-4">محرك التحويل السيادي</DialogTitle>
            <DialogDescription className="text-white/40 font-bold text-lg">إرسال وحدات مالية إلى: {selectedUser?.fullName}</DialogDescription>
          </DialogHeader>
          <div className="py-12 space-y-10">
            <div className="p-8 bg-primary/10 rounded-[2.5rem] border border-primary/20 flex items-center justify-between">
               <div className="space-y-1">
                  <p className="text-[10px] text-primary font-black uppercase tracking-widest">Identity Confirmed</p>
                  <p className="text-2xl font-black text-white">{selectedUser?.fullName}</p>
               </div>
               <div className="h-16 w-16 rounded-2xl bg-white/5 flex items-center justify-center border border-white/10">
                  <UserCheck className="h-8 w-8 text-primary" />
               </div>
            </div>
            <div className="space-y-3">
              <Label className="text-white/60 font-black uppercase text-[10px] tracking-widest mr-2">مبلغ التحويل</Label>
              <Input 
                type="number" 
                placeholder="0.00"
                value={transferAmount} 
                onChange={e => setTransferAmount(e.target.value)}
                className="h-20 rounded-3xl bg-white/5 border-white/10 text-4xl font-black text-emerald-500 text-center tabular-nums shadow-inner focus:ring-emerald-500/20" 
              />
            </div>
          </div>
          <DialogFooter className="gap-6">
            <Button variant="ghost" onClick={() => setIsTransferModalOpen(false)} className="text-white/30 hover:text-white font-black text-lg h-16 px-10 rounded-2xl">إلغاء</Button>
            <Button onClick={handleTransfer} disabled={isProcessing} className="bg-emerald-600 hover:bg-emerald-700 text-white flex-1 h-16 rounded-[1.8rem] text-xl font-black shadow-2xl">
              {isProcessing ? <Loader2 className="animate-spin" /> : "إتمام عملية التحويل 🚀"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 3. تعديل الرتبة */}
      <Dialog open={isRoleModalOpen} onOpenChange={setIsRoleModalOpen}>
        <DialogContent className="glass-cosmic border-none rounded-[4rem] p-12 text-right" dir="rtl">
          <DialogHeader>
            <DialogTitle className="text-4xl font-black text-white mb-4">ترقية الهوية الرقمية</DialogTitle>
            <DialogDescription className="text-white/40 font-bold text-lg">تغيير رتبة المواطن: {selectedUser?.fullName}</DialogDescription>
          </DialogHeader>
          <div className="py-12">
            <Select value={newRole} onValueChange={setNewRole}>
              <SelectTrigger className="h-20 rounded-3xl bg-white/5 border-white/10 text-2xl font-black text-white focus:ring-primary/20 px-8 shadow-inner">
                <SelectValue placeholder="اختر الرتبة السيادية" />
              </SelectTrigger>
              <SelectContent className="bg-[#1e1b4b] border-white/10 text-white font-bold p-2 rounded-2xl shadow-3xl">
                <SelectItem value="user" className="h-14 rounded-xl focus:bg-primary/20">مواطن عادي (User)</SelectItem>
                <SelectItem value="vip" className="h-14 rounded-xl focus:bg-primary/20">عميل مميز (VIP) - خصم ٥٠٪</SelectItem>
                <SelectItem value="consultant" className="h-14 rounded-xl focus:bg-primary/20">خبير قانوني (Consultant)</SelectItem>
                <SelectItem value="moderator" className="h-14 rounded-xl focus:bg-primary/20">مشرف نظام (Moderator)</SelectItem>
                <SelectItem value="admin" className="h-14 rounded-xl focus:bg-primary/20 text-primary">مدير سيادي (Admin)</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <DialogFooter className="gap-6 pt-4">
            <Button variant="ghost" onClick={() => setIsRoleModalOpen(false)} className="text-white/30 hover:text-white font-black text-lg h-16 px-10 rounded-2xl">إلغاء</Button>
            <Button onClick={handleUpdateRole} disabled={isProcessing} className="btn-primary flex-1 h-16 rounded-[1.8rem] text-xl">
              {isProcessing ? <Loader2 className="animate-spin" /> : "تثبيت الرتبة الجديدة"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

    </div>
  );
}

function AdminNavBtn({ icon, text, active, onClick }: any) {
  return (
    <button 
      onClick={onClick} 
      className={`w-full flex items-center gap-6 px-8 py-5 rounded-[1.8rem] transition-all duration-500 font-black text-sm relative group ${active ? "bg-primary text-primary-foreground shadow-3xl scale-[1.05]" : "text-white/30 hover:text-white hover:bg-white/5"}`}
    >
      {active && <motion.div layoutId="nav-active" className="absolute inset-0 bg-primary rounded-[1.8rem] -z-10 shadow-3xl shadow-primary/40" />}
      <span className={`shrink-0 transition-transform duration-500 ${active ? "scale-125" : "group-hover:scale-110"}`}>{icon}</span>
      <span className="tracking-tight text-lg">{text}</span>
    </button>
  );
}

function StatBox({ label, value, icon, color, isStatus }: any) {
  const colors: any = {
    blue: "text-blue-500 bg-blue-500/10 border-blue-500/20",
    amber: "text-amber-500 bg-amber-500/10 border-amber-500/20",
    red: "text-red-500 bg-red-500/10 border-red-500/20",
    emerald: "text-emerald-500 bg-emerald-500/10 border-emerald-500/20",
  };
  return (
    <Card className="rounded-[2.8rem] border-none shadow-2xl bg-white dark:bg-slate-900/80 overflow-hidden relative group hover:scale-[1.05] transition-all duration-500">
      <div className="absolute top-0 right-0 p-10 opacity-5 group-hover:rotate-12 transition-transform duration-700">
         {icon}
      </div>
      <CardContent className="p-10 flex flex-col items-start gap-4 relative z-10">
        <div className={`h-14 w-14 rounded-2xl flex items-center justify-center shadow-inner border ${colors[color]}`}>
          {icon}
        </div>
        <div className="space-y-1 text-right">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{label}</p>
          <p className={`text-3xl font-black tabular-nums ${colors[color].split(' ')[0]}`}>{value}</p>
        </div>
      </CardContent>
    </Card>
  );
}

function ActionBtn({ icon, onClick, color = "primary", tooltip }: any) {
  const colors: any = {
    primary: "text-primary bg-primary/5 hover:bg-primary/10",
    red: "text-red-500 bg-red-500/5 hover:bg-red-500/10",
    amber: "text-amber-500 bg-amber-500/5 hover:bg-amber-500/10",
    emerald: "text-emerald-500 bg-emerald-500/5 hover:bg-emerald-500/10",
    blue: "text-blue-500 bg-blue-500/5 hover:bg-blue-500/10",
  };
  return (
    <Button 
      variant="outline" 
      size="icon" 
      onClick={onClick} 
      className={`h-14 w-14 rounded-2xl border-none transition-all shadow-lg active:scale-90 ${colors[color]}`}
      title={tooltip}
    >
      <div className="scale-125">{icon}</div>
    </Button>
  );
}
