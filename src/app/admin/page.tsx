
"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Users, ShieldAlert, Wallet, Crown, Search, Bell, LogOut, 
  Trash2, CheckCircle2, XCircle, UserPlus, ShieldCheck, 
  Activity, LayoutDashboard, Settings, MessageSquare, 
  ArrowLeft, Loader2, Plus, Zap, Star
} from "lucide-react";
import { useUser, useFirestore, useCollection } from "@/firebase";
import { useToast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";
import { 
  collection, doc, updateDoc, deleteDoc, addDoc, 
  serverTimestamp, increment, query, orderBy 
} from "firebase/firestore";
import { useMemoFirebase } from "@/firebase/provider";
import { roles as ROLES_LIST, getPermissions } from "@/lib/roles";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  Dialog, DialogContent, DialogHeader, DialogTitle, 
  DialogFooter, DialogDescription 
} from "@/components/ui/dialog";
import { 
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue 
} from "@/components/ui/select";

export default function SupremeCommandCenter() {
  const { user, profile, role, signOut } = useUser();
  const db = useFirestore();
  const router = useRouter();
  const { toast } = useToast();
  
  const [activeTab, setActiveTab] = useState("users");
  const [searchTerm, setSearchTerm] = useState("");
  
  // States for Modals
  const [isBalanceModalOpen, setIsBalanceModalOpen] = useState(false);
  const [isRoleModalOpen, setIsRoleModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [newBalance, setNewBalance] = useState("");
  const [newRole, setNewRole] = useState("");
  const [newForbiddenWord, setNewForbiddenWord] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);

  // Sovereign Queries
  const usersQuery = useMemoFirebase(() => db ? collection(db, "users") : null, [db]);
  const { data: allUsers, isLoading: isUsersLoading } = useCollection(usersQuery);

  const bannedWordsQuery = useMemoFirebase(() => db ? collection(db, "system", "moderation", "forbiddenWords") : null, [db]);
  const { data: forbiddenWords } = useCollection(bannedWordsQuery);

  const requestsQuery = useMemoFirebase(() => db ? collection(db, "paymentRequests") : null, [db]);
  const { data: paymentRequests } = useCollection(requestsQuery);

  // Protect Admin Access
  if (role !== "admin") {
    return (
      <div className="h-screen flex flex-col items-center justify-center bg-[#020617] text-red-500 font-black gap-8">
        <Crown className="h-20 w-20 animate-bounce" />
        <h1 className="text-4xl uppercase tracking-[0.5em]">Access Denied</h1>
        <Button onClick={() => router.push("/")} className="bg-red-600 text-white">العودة للرئيسية</Button>
      </div>
    );
  }

  // --- Sovereign Actions ---

  const handleUpdateBalance = async () => {
    if (!db || !selectedUser || !newBalance) return;
    setIsProcessing(true);
    try {
      await updateDoc(doc(db, "users", selectedUser.id), {
        balance: parseFloat(newBalance)
      });
      toast({ title: "تم التحديث المالي", description: `رصيد ${selectedUser.fullName} أصبح ${newBalance} EGP.` });
      setIsBalanceModalOpen(false);
    } catch (e) {
      toast({ variant: "destructive", title: "فشل التحديث" });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleUpdateRole = async () => {
    if (!db || !selectedUser || !newRole) return;
    setIsProcessing(true);
    try {
      await updateDoc(doc(db, "users", selectedUser.id), { role: newRole });
      toast({ title: "تمت الترقية السيادية", description: `تم تغيير رتبة ${selectedUser.fullName} إلى ${newRole}.` });
      setIsRoleModalOpen(false);
    } catch (e) {
      toast({ variant: "destructive", title: "فشل الترقية" });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleToggleBan = async (u: any) => {
    if (!db) return;
    try {
      await updateDoc(doc(db, "users", u.id), { isBanned: !u.isBanned });
      toast({ 
        title: u.isBanned ? "تم فك الحظر" : "تم الحظر السيادي", 
        description: `المواطن ${u.fullName} ${u.isBanned ? 'نشط الآن' : 'تم تجميده'}.` 
      });
    } catch (e) {
      toast({ variant: "destructive", title: "فشل الإجراء" });
    }
  };

  const handleDeleteUser = async (userId: string) => {
    if (!db || !confirm("هل أنت متأكد من الحذف النهائي لهذا المواطن؟ لا يمكن التراجع!")) return;
    try {
      await deleteDoc(doc(db, "users", userId));
      toast({ title: "تم الحذف النهائي", description: "تم تطهير السجل من قاعدة البيانات." });
    } catch (e) {
      toast({ variant: "destructive", title: "فشل الحذف" });
    }
  };

  const handleAddForbiddenWord = async () => {
    if (!db || !newForbiddenWord.trim()) return;
    try {
      await addDoc(collection(db, "system", "moderation", "forbiddenWords"), {
        word: newForbiddenWord.trim(),
        severity: "high",
        addedAt: new Date().toISOString()
      });
      setNewForbiddenWord("");
      toast({ title: "تمت إضافة كلمة للدرع" });
    } catch (e) {
      toast({ variant: "destructive", title: "فشل الإضافة" });
    }
  };

  const handleApprovePayment = async (req: any) => {
    if (!db) return;
    try {
      await updateDoc(doc(db, "users", req.userId), { balance: increment(req.amount) });
      await updateDoc(doc(db, "paymentRequests", req.id), { status: "approved" });
      toast({ title: "تم قبول الشحن ✅", description: `تمت إضافة ${req.amount} EGP لحساب العميل.` });
    } catch (e) {
      toast({ variant: "destructive", title: "فشل الاعتماد" });
    }
  };

  const filteredUsers = allUsers?.filter(u => 
    u.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) || 
    u.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="flex h-screen bg-slate-50 dark:bg-[#020617] text-slate-900 dark:text-white font-sans" dir="rtl">
      
      {/* Supreme Sidebar */}
      <aside className="w-72 bg-[#1e1b4b] text-white flex flex-col z-50 shadow-2xl overflow-hidden flex-shrink-0">
        <div className="p-8 border-b border-white/5 flex items-center gap-4 bg-black/20">
          <div className="h-12 w-12 rounded-2xl bg-primary flex items-center justify-center shadow-xl">
            <Crown className="h-7 w-7 text-primary-foreground" />
          </div>
          <div>
            <h2 className="text-xl font-black tracking-tighter">غرفة القيادة</h2>
            <p className="text-[8px] font-black text-primary uppercase tracking-[0.2em]">Sovereign Control Hub</p>
          </div>
        </div>

        <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
          <AdminSideBtn icon={<Activity className="h-5 w-5" />} text="نظرة عامة" active={activeTab === "overview"} onClick={() => setActiveTab("overview")} />
          <AdminSideBtn icon={<Users className="h-5 w-5" />} text="إدارة المواطنين" active={activeTab === "users"} onClick={() => setActiveTab("users")} />
          <AdminSideBtn icon={<ShieldAlert className="h-5 w-5" />} text="الدرع الواقي" active={activeTab === "moderation"} onClick={() => setActiveTab("moderation")} />
          <AdminSideBtn icon={<Wallet className="h-5 w-5" />} text="طلبات الشحن" active={activeTab === "billing"} onClick={() => setActiveTab("billing")} />
          <AdminSideBtn icon={<Settings className="h-5 w-5" />} text="إعدادات النظام" active={activeTab === "settings"} onClick={() => setActiveTab("settings")} />
        </nav>

        <div className="p-6 border-t border-white/5 bg-black/10">
          <Link href="/bot" className="w-full">
            <AdminSideBtn icon={<ArrowLeft className="h-5 w-5" />} text="العودة للبوت" active={false} />
          </Link>
          <button onClick={() => signOut()} className="w-full mt-4 flex items-center gap-4 px-6 py-4 rounded-2xl text-white/40 hover:text-red-400 hover:bg-red-500/10 transition-all font-black text-sm">
            <LogOut className="h-5 w-5" /> خروج سيادي
          </button>
        </div>
      </aside>

      {/* Main Command Area */}
      <main className="flex-1 flex flex-col relative overflow-hidden">
        
        {/* Superior Header */}
        <header className="h-20 bg-white dark:bg-slate-900 border-b border-border flex items-center justify-between px-10 z-40 shadow-sm">
          <div className="flex items-center gap-6">
            <div className="h-10 w-10 bg-slate-100 dark:bg-white/5 rounded-2xl flex items-center justify-center text-slate-400">
              <Search className="h-5 w-5" />
            </div>
            <h1 className="text-xl font-black tracking-tight text-primary uppercase">king2026 Dashboard</h1>
          </div>

          <div className="flex items-center gap-6">
            <div className="text-left">
               <p className="text-xs font-black text-slate-900 dark:text-white">سيادة المالك</p>
               <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest">Supreme Authority</p>
            </div>
            <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-primary to-amber-600 p-0.5 shadow-xl">
               <div className="h-full w-full rounded-[0.9rem] bg-white dark:bg-slate-800 flex items-center justify-center overflow-hidden">
                  <span className="font-black text-primary">K</span>
               </div>
            </div>
          </div>
        </header>

        {/* Dynamic Content */}
        <div className="flex-1 p-8 overflow-y-auto bg-[#f8f9fc] dark:bg-[#020617]">
          
          <AnimatePresence mode="wait">
            {activeTab === "overview" && (
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                  <StatCard label="إجمالي المواطنين" value={allUsers?.length || 0} icon={<Users />} color="blue" />
                  <StatCard label="طلبات معلقة" value={paymentRequests?.filter(r => r.status === "pending").length || 0} icon={<Wallet />} color="amber" />
                  <StatCard label="الدرع الواقي" value={forbiddenWords?.length || 0} icon={<ShieldAlert />} color="red" />
                  <StatCard label="الحالة العامة" value="Sovereign" icon={<Activity />} color="emerald" isStatus />
                </div>
                
                <Card className="rounded-[3rem] border-none shadow-2xl overflow-hidden bg-white dark:bg-slate-900">
                  <CardHeader className="p-10 border-b border-slate-50 dark:border-white/5">
                    <CardTitle className="text-3xl font-black">أحدث العمليات</CardTitle>
                  </CardHeader>
                  <CardContent className="p-10 text-center opacity-20">
                    <Activity className="h-20 w-20 mx-auto mb-4" />
                    <p className="text-xl font-bold">جاري رصد التفاعلات الحية من السحابة...</p>
                  </CardContent>
                </Card>
              </motion.div>
            )}

            {activeTab === "users" && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-8">
                <div className="flex justify-between items-center">
                  <h2 className="text-4xl font-black text-primary tracking-tighter">قاعدة المواطنين السيادية</h2>
                  <div className="relative w-96">
                    <Search className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 h-5 w-5" />
                    <Input 
                      placeholder="بحث بالاسم أو البريد..." 
                      className="pr-12 h-14 rounded-2xl bg-white dark:bg-slate-900 border-none shadow-xl"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>
                </div>

                <div className="grid gap-6">
                  {filteredUsers?.map((u) => (
                    <Card key={u.id} className={`rounded-[2.5rem] border-none shadow-xl transition-all ${u.isBanned ? 'opacity-50 grayscale' : 'hover:scale-[1.01]'}`}>
                      <CardContent className="p-8 flex items-center justify-between gap-8">
                        <div className="flex items-center gap-6">
                          <div className="h-16 w-16 rounded-2xl bg-primary/10 flex items-center justify-center text-2xl font-black text-primary">
                            {u.fullName?.charAt(0)}
                          </div>
                          <div>
                            <div className="flex items-center gap-3">
                              <h3 className="text-xl font-black">{u.fullName}</h3>
                              <Badge className={`bg-primary/10 text-primary border-none font-black text-[10px] px-3`}>{u.role}</Badge>
                              {u.isBanned && <Badge variant="destructive" className="font-black text-[8px]">BANNED</Badge>}
                            </div>
                            <p className="text-xs text-muted-foreground font-bold mt-1 uppercase tracking-widest">{u.email}</p>
                          </div>
                        </div>

                        <div className="flex items-center gap-8">
                          <div className="text-left">
                            <p className="text-[10px] text-muted-foreground font-black uppercase tracking-widest">رصيد المواطن</p>
                            <p className="text-2xl font-black text-primary tabular-nums">{u.balance} EGP</p>
                          </div>
                          <div className="flex items-center gap-2">
                            <ActionBtn icon={<Wallet />} onClick={() => { setSelectedUser(u); setNewBalance(u.balance.toString()); setIsBalanceModalOpen(true); }} tooltip="تعديل الرصيد" />
                            <ActionBtn icon={<Crown />} onClick={() => { setSelectedUser(u); setNewRole(u.role); setIsRoleModalOpen(true); }} tooltip="تغيير الرتبة" />
                            <ActionBtn icon={u.isBanned ? <CheckCircle2 /> : <XCircle />} onClick={() => handleToggleBan(u)} color={u.isBanned ? "emerald" : "amber"} tooltip={u.isBanned ? "فك الحظر" : "حظر سيادي"} />
                            <ActionBtn icon={<Trash2 />} onClick={() => handleDeleteUser(u.id)} color="red" tooltip="حذف نهائي" />
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </motion.div>
            )}

            {activeTab === "moderation" && (
              <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="max-w-4xl mx-auto space-y-10 text-center">
                <div className="space-y-4">
                  <div className="h-24 w-24 bg-red-500/10 rounded-[2.5rem] flex items-center justify-center mx-auto text-red-600 border-2 border-red-500/20 shadow-2xl">
                    <ShieldAlert className="h-12 w-12" />
                  </div>
                  <h2 className="text-5xl font-black text-red-600 tracking-tighter">الدرع الواقي السيادي</h2>
                  <p className="text-muted-foreground font-bold max-w-xl mx-auto">إدارة الكلمات المحظورة التي تسبب الحظر التلقائي الفوري لأي مواطن يتجاوز حدود الأدب والسيادة.</p>
                </div>

                <div className="flex gap-4">
                  <Input 
                    placeholder="أدخل كلمة محظورة جديدة..." 
                    className="h-16 rounded-[1.5rem] bg-white dark:bg-slate-900 border-2 border-red-500/10 px-8 text-lg font-bold" 
                    value={newForbiddenWord}
                    onChange={(e) => setNewForbiddenWord(e.target.value)}
                  />
                  <Button onClick={handleAddForbiddenWord} className="h-16 px-12 rounded-[1.5rem] bg-red-600 hover:bg-red-700 text-white font-black text-xl shadow-2xl">إضافة للدرع</Button>
                </div>

                <div className="flex flex-wrap gap-4 justify-center pt-8">
                  {forbiddenWords?.map(w => (
                    <Badge key={w.id} className="p-5 rounded-2xl bg-white dark:bg-slate-900 text-red-600 border border-red-500/20 shadow-xl group">
                      <span className="font-black text-lg">{w.word}</span>
                      <button onClick={async () => { await deleteDoc(doc(db!, "system/moderation/forbiddenWords", w.id)); toast({ title: "تم الحذف من الدرع" }); }} className="mr-4 opacity-0 group-hover:opacity-100 transition-opacity"><XCircle className="h-4 w-4" /></button>
                    </Badge>
                  ))}
                </div>
              </motion.div>
            )}

            {activeTab === "billing" && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-8">
                <h2 className="text-4xl font-black text-primary tracking-tighter">مركز العمليات المالية</h2>
                <div className="grid gap-6">
                  {paymentRequests?.filter(r => r.status === "pending").map(req => (
                    <Card key={req.id} className="rounded-[2.5rem] border-none shadow-xl bg-amber-500/5 border-amber-500/10">
                      <CardContent className="p-8 flex items-center justify-between">
                        <div className="flex items-center gap-6">
                          <div className="h-16 w-16 bg-amber-500/10 rounded-2xl flex items-center justify-center text-amber-600">
                            <Wallet className="h-8 w-8" />
                          </div>
                          <div>
                            <h3 className="text-xl font-black">طلب شحن من: {req.userName}</h3>
                            <p className="text-xs text-muted-foreground font-bold uppercase mt-1 tracking-widest">Phone: {req.userPhone || "Not Provided"}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-10">
                          <p className="text-4xl font-black text-amber-600 tabular-nums">{req.amount} <span className="text-xs">EGP</span></p>
                          <div className="flex gap-3">
                            <Button onClick={() => handleApprovePayment(req)} className="bg-emerald-600 hover:bg-emerald-700 h-14 px-8 rounded-2xl font-black shadow-xl">قبول الشحن ✅</Button>
                            <Button variant="outline" onClick={async () => await deleteDoc(doc(db!, "paymentRequests", req.id))} className="h-14 rounded-2xl border-red-500/20 text-red-500 hover:bg-red-500/10">رفض وحذف</Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                  {paymentRequests?.filter(r => r.status === "pending").length === 0 && (
                    <div className="py-40 text-center opacity-20">
                      <CheckCircle2 className="h-24 w-24 mx-auto mb-4" />
                      <p className="text-2xl font-bold">لا توجد طلبات معلقة سيادياً</p>
                    </div>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

        </div>
      </main>

      {/* --- Modals --- */}

      <Dialog open={isBalanceModalOpen} onOpenChange={setIsBalanceModalOpen}>
        <DialogContent className="glass-cosmic border-none rounded-[3rem] p-10 text-right" dir="rtl">
          <DialogHeader>
            <DialogTitle className="text-3xl font-black text-white mb-4">تعديل الميزانية السيادية</DialogTitle>
            <DialogDescription className="text-white/40">أنت الآن تقوم بتغيير رصيد المواطن: {selectedUser?.fullName}</DialogDescription>
          </DialogHeader>
          <div className="py-10 space-y-6">
            <Label className="text-white font-bold">الرصيد الجديد (EGP)</Label>
            <Input 
              type="number" 
              value={newBalance} 
              onChange={e => setNewBalance(e.target.value)}
              className="h-16 rounded-2xl bg-white/5 border-white/10 text-2xl font-black text-primary text-center tabular-nums" 
            />
          </div>
          <DialogFooter className="gap-4">
            <Button variant="ghost" onClick={() => setIsBalanceModalOpen(false)} className="text-white/40 font-bold">إلغاء</Button>
            <Button onClick={handleUpdateBalance} disabled={isProcessing} className="btn-primary flex-1 h-14 rounded-2xl">
              {isProcessing ? <Loader2 className="animate-spin" /> : "تأكيد التعديل المالي"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isRoleModalOpen} onOpenChange={setIsRoleModalOpen}>
        <DialogContent className="glass-cosmic border-none rounded-[3rem] p-10 text-right" dir="rtl">
          <DialogHeader>
            <DialogTitle className="text-3xl font-black text-white mb-4">ترقية الهوية الرقمية</DialogTitle>
            <DialogDescription className="text-white/40">تغيير رتبة المواطن: {selectedUser?.fullName}</DialogDescription>
          </DialogHeader>
          <div className="py-10 space-y-6">
            <Select value={newRole} onValueChange={setNewRole}>
              <SelectTrigger className="h-16 rounded-2xl bg-white/5 border-white/10 text-xl font-bold">
                <SelectValue placeholder="اختر الرتبة الجديدة" />
              </SelectTrigger>
              <SelectContent className="bg-[#1e1b4b] border-white/10 text-white font-bold">
                <SelectItem value="user">مواطن عادي (User)</SelectItem>
                <SelectItem value="vip">عميل مميز (VIP)</SelectItem>
                <SelectItem value="consultant">خبير قانوني (Consultant)</SelectItem>
                <SelectItem value="moderator">مشرف نظام (Moderator)</SelectItem>
                <SelectItem value="admin">مدير سيادي (Admin)</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <DialogFooter className="gap-4">
            <Button variant="ghost" onClick={() => setIsRoleModalOpen(false)} className="text-white/40 font-bold">إلغاء</Button>
            <Button onClick={handleUpdateRole} disabled={isProcessing} className="btn-primary flex-1 h-14 rounded-2xl">
              {isProcessing ? <Loader2 className="animate-spin" /> : "تثبيت الرتبة الجديدة"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

    </div>
  );
}

function AdminSideBtn({ icon, text, active, onClick }: any) {
  return (
    <button 
      onClick={onClick} 
      className={`w-full flex items-center gap-5 px-6 py-4 rounded-2xl transition-all duration-300 font-black text-sm ${active ? "bg-primary text-primary-foreground shadow-2xl scale-[1.03]" : "text-white/40 hover:text-white hover:bg-white/5"}`}
    >
      <span className="shrink-0">{icon}</span>
      <span className="tracking-tight">{text}</span>
    </button>
  );
}

function StatCard({ label, value, icon, color, isStatus }: any) {
  const colors: any = {
    blue: "text-blue-500 bg-blue-500/10",
    amber: "text-amber-500 bg-amber-500/10",
    red: "text-red-500 bg-red-500/10",
    emerald: "text-emerald-500 bg-emerald-500/10",
  };
  return (
    <Card className="rounded-[2.2rem] border-none shadow-lg bg-white dark:bg-slate-900 overflow-hidden">
      <CardContent className="p-8 flex items-center justify-between">
        <div className="space-y-1">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{label}</p>
          <p className={`text-3xl font-black tabular-nums ${colors[color].split(' ')[0]}`}>{value}</p>
        </div>
        <div className={`h-14 w-14 rounded-2xl flex items-center justify-center shadow-inner ${colors[color]}`}>
          {icon}
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
  };
  return (
    <Button 
      variant="outline" 
      size="icon" 
      onClick={onClick} 
      className={`h-12 w-12 rounded-xl border-none transition-all ${colors[color]}`}
      title={tooltip}
    >
      {icon}
    </Button>
  );
}
