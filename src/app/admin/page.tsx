"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Users, ShieldAlert, Wallet, Crown, Search, Bell, LogOut, 
  Trash2, CheckCircle2, XCircle, ShieldCheck, 
  Activity, ArrowLeft, Loader2, ArrowRightLeft,
  Zap, History, Cpu, Globe, ChevronLeft, UserMinus, Star, Eye, FileCheck, Gavel
} from "lucide-react";
import { useUser, useFirestore, useCollection } from "@/firebase";
import { useToast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { collection, doc, updateDoc, deleteDoc, increment, serverTimestamp, addDoc, query, orderBy } from "firebase/firestore";
import { useMemoFirebase } from "@/firebase/provider";
import Link from "next/link";
import { roles as ROLES_LIST } from "@/lib/roles";

export default function SupremeCommandCenter() {
  const { user, profile, role, signOut } = useUser();
  const db = useFirestore();
  const router = useRouter();
  const { toast } = useToast();
  
  const [activeTab, setActiveTab] = useState("overview");
  const [searchTerm, setSearchTerm] = useState("");

  const usersQuery = useMemoFirebase(() => db ? collection(db, "users") : null, [db]);
  const { data: allUsers, isLoading: isUsersLoading } = useCollection(usersQuery);

  const requestsQuery = useMemoFirebase(() => db ? query(collection(db, "paymentRequests"), orderBy("createdAt", "desc")) : null, [db]);
  const { data: paymentRequests } = useCollection(requestsQuery);

  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [isTransferModalOpen, setIsTransferModalOpen] = useState(false);
  const [transferAmount, setTransferAmount] = useState("");
  const [viewingDocs, setViewingDocs] = useState<any>(null);

  const handlePurgeUser = async (id: string) => {
    if (!confirm("هل أنت متأكد من تطهير هذا السجل نهائياً؟")) return;
    try {
      await deleteDoc(doc(db!, "users", id));
      toast({ title: "تم التطهير السيادي ✅" });
    } catch (e) {
      toast({ variant: "destructive", title: "فشل التطهير" });
    }
  };

  const handleBanToggle = async (u: any) => {
    try {
      await updateDoc(doc(db!, "users", u.id), { isBanned: !u.isBanned });
      toast({ title: u.isBanned ? "تم فك الحظر" : "تم الحظر السيادي 🚫" });
    } catch (e) {
      toast({ variant: "destructive", title: "فشل العملية" });
    }
  };

  const handleApproveExpert = async (u: any) => {
    try {
      await updateDoc(doc(db!, "users", u.id), { role: ROLES_LIST.CONSULTANT });
      await addDoc(collection(db!, "consultants"), {
        id: u.id,
        name: u.fullName,
        specialization: u.verificationRequest?.aiPreCheck?.profession || "خبير قانوني",
        rating: 5.0,
        reviews: 0,
        isApproved: true
      });
      toast({ title: "تم الاعتماد كخبير ✅" });
      setViewingDocs(null);
    } catch (e) {
      toast({ variant: "destructive", title: "فشل الاعتماد" });
    }
  };

  const handleTransfer = async () => {
    if (!selectedUser || !transferAmount) return;
    try {
      await updateDoc(doc(db!, "users", selectedUser.id), { balance: increment(Number(transferAmount)) });
      toast({ title: "تم إتمام المعاملة بنجاح ✅" });
      setIsTransferModalOpen(false);
      setTransferAmount("");
      setSelectedUser(null);
    } catch (e) {
      toast({ variant: "destructive", title: "فشل بروتوكول التحويل" });
    }
  };

  if (role !== ROLES_LIST.ADMIN) {
    return (
      <div className="h-screen flex flex-col items-center justify-center bg-[#02040a] text-red-500 font-black gap-8">
        <Crown className="h-32 w-32 animate-pulse" />
        <h1 className="text-5xl uppercase tracking-[0.5em] text-center">Unauthorized Identity</h1>
        <Button onClick={() => router.push("/")} className="bg-red-600 text-white px-12 h-16 rounded-2xl text-xl font-black">الهروب</Button>
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
            <p className="text-[9px] font-black text-primary uppercase tracking-[0.3em]">king2026 Sovereign</p>
          </div>
        </div>

        <nav className="flex-1 p-6 space-y-3 overflow-y-auto relative z-10">
          <AdminNavBtn icon={<Activity />} text="نظرة شاملة" active={activeTab === "overview"} onClick={() => setActiveTab("overview")} />
          <AdminNavBtn icon={<Users />} text="إدارة المواطنين" active={activeTab === "users"} onClick={() => setActiveTab("users")} />
          <AdminNavBtn icon={<FileCheck />} text="طلبات الانضمام" active={activeTab === "verifications"} onClick={() => setActiveTab("verifications")} />
          <AdminNavBtn icon={<Wallet />} text="العمليات المالية" active={activeTab === "billing"} onClick={() => setActiveTab("billing")} />
          <AdminNavBtn icon={<ShieldAlert />} text="الدرع الواقي" active={activeTab === "moderation"} onClick={() => setActiveTab("moderation")} />
        </nav>

        <div className="p-8 border-t border-white/5 bg-black/30 relative z-10">
          <Link href="/bot">
            <AdminNavBtn icon={<ArrowLeft />} text="العودة للبوت" active={false} />
          </Link>
        </div>
      </aside>

      {/* Supreme Workspace */}
      <main className="flex-1 flex flex-col relative overflow-hidden">
        <header className="h-24 bg-white dark:bg-[#02040a]/80 backdrop-blur-3xl border-b border-border flex items-center justify-between px-12 z-40">
          <div className="flex items-center gap-8">
            <div className="h-12 w-12 bg-primary/5 rounded-2xl flex items-center justify-center text-primary border border-primary/10">
              <Cpu className="h-6 w-6 animate-pulse" />
            </div>
            <h1 className="text-2xl font-black tracking-tight text-primary uppercase">Supreme Sovereign Protocol active</h1>
          </div>

          <div className="flex items-center gap-8">
            <div className="text-right">
               <p className="text-sm font-black text-slate-900 dark:text-white">سيادة المالك king2026</p>
               <p className="text-[10px] text-emerald-500 font-black uppercase tracking-widest">Global Node Active</p>
            </div>
            <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-primary to-amber-600 p-0.5 shadow-2xl">
               <div className="h-full w-full rounded-[0.9rem] bg-white dark:bg-slate-900 flex items-center justify-center font-black text-2xl text-primary">K</div>
            </div>
          </div>
        </header>

        <div className="flex-1 p-10 overflow-y-auto">
          <AnimatePresence mode="wait">
            
            {activeTab === "overview" && (
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="grid grid-cols-1 md:grid-cols-4 gap-8">
                <StatBox label="المواطنون" value={allUsers?.length || 0} icon={<Users />} color="blue" />
                <StatBox label="طلبات انضمام" value={allUsers?.filter(u => u.role === ROLES_LIST.PENDING_EXPERT).length || 0} icon={<Gavel />} color="violet" />
                <StatBox label="طلبات مالية" value={paymentRequests?.filter(r => r.status === 'pending').length || 0} icon={<Zap />} color="amber" />
                <StatBox label="إجمالي الأرصدة" value={allUsers?.reduce((acc, u) => acc + (u.balance || 0), 0).toLocaleString()} icon={<Wallet />} color="emerald" />
              </motion.div>
            )}

            {activeTab === "users" && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-8">
                <div className="flex justify-between items-center glass-cosmic p-4 rounded-[2.5rem] border-white/10 dark:border-white/5 bg-white dark:bg-white/5">
                  <h2 className="text-4xl font-black text-primary tracking-tighter px-6">سجل المواطنين</h2>
                  <div className="relative w-[400px]">
                    <Search className="absolute right-6 top-1/2 -translate-y-1/2 text-primary h-6 w-6" />
                    <Input placeholder="ابحث بالاسم أو الرقم..." className="pr-16 h-16 rounded-3xl bg-slate-100 dark:bg-slate-900 border-none text-xl font-bold shadow-inner" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
                  </div>
                </div>

                <div className="grid gap-6">
                  {isUsersLoading ? (
                    <div className="py-20 flex justify-center"><Loader2 className="h-12 w-12 animate-spin text-primary opacity-20" /></div>
                  ) : (
                    filteredUsers?.map((u) => (
                      <Card key={u.id} className={`rounded-[3rem] border-none shadow-2xl bg-white dark:bg-slate-900/80 ${u.isBanned ? 'opacity-40 grayscale' : 'hover:scale-[1.01] transition-all'}`}>
                        <CardContent className="p-10 flex items-center justify-between">
                          <div className="flex items-center gap-8">
                            <div className="h-20 w-20 rounded-[2rem] bg-primary/10 flex items-center justify-center text-3xl font-black text-primary shadow-inner">{u.fullName?.charAt(0)}</div>
                            <div>
                              <div className="flex items-center gap-4">
                                <h3 className="text-2xl font-black">{u.fullName}</h3>
                                <Badge className="bg-primary/10 text-primary border-none px-4 font-black uppercase text-[10px]">{u.role}</Badge>
                              </div>
                              <p className="text-sm text-muted-foreground font-bold uppercase tracking-widest">{u.email}</p>
                            </div>
                          </div>

                          <div className="flex items-center gap-12">
                            <div className="text-left border-l border-border pl-12">
                              <p className="text-[10px] text-white/20 font-black uppercase mb-1 tracking-widest">الميزانية</p>
                              <p className="text-4xl font-black text-primary tabular-nums">{u.balance} <span className="text-xs">EGP</span></p>
                            </div>
                            <div className="flex gap-3">
                              <ActionBtn icon={<ArrowRightLeft />} onClick={() => { setSelectedUser(u); setIsTransferModalOpen(true); }} tooltip="محرك التحويل السيادي" color="emerald" />
                              <ActionBtn icon={u.isBanned ? <CheckCircle2 /> : <XCircle />} onClick={() => handleBanToggle(u)} color={u.isBanned ? "emerald" : "red"} tooltip="حظر/فك حظر" />
                              <ActionBtn icon={<Trash2 />} onClick={() => handlePurgeUser(u.id)} color="red" tooltip="تطهير نهائي" />
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))
                  )}
                </div>
              </motion.div>
            )}

          </AnimatePresence>
        </div>
      </main>

      {/* Sovereign Transfer Modal */}
      <Dialog open={isTransferModalOpen} onOpenChange={setIsTransferModalOpen}>
        <DialogContent className="glass-cosmic border-none rounded-[4rem] p-12 text-right max-w-2xl bg-white dark:bg-slate-900 shadow-3xl" dir="rtl">
          <DialogHeader>
            <DialogTitle className="text-4xl font-black text-slate-900 dark:text-white mb-4">إتمام المعاملة السيادية</DialogTitle>
            <DialogDescription className="text-slate-500 dark:text-white/40 font-bold text-lg">توجيه الوحدات المالية للمواطن المختار بناءً على الهوية الموثقة.</DialogDescription>
          </DialogHeader>
          
          <div className="py-10 space-y-8">
            <div className="p-8 rounded-[2.5rem] bg-slate-100 dark:bg-white/5 border border-border dark:border-white/10 flex items-center justify-between gap-6 shadow-inner">
               <div className="flex items-center gap-6">
                  <div className="h-16 w-16 rounded-2xl bg-primary/10 flex items-center justify-center text-2xl font-black text-primary">
                    {selectedUser?.fullName?.charAt(0)}
                  </div>
                  <div>
                    <p className="text-2xl font-black text-slate-900 dark:text-white">{selectedUser?.fullName}</p>
                    <p className="text-xs text-primary font-bold uppercase mt-1 tracking-widest">{selectedUser?.phone || selectedUser?.email}</p>
                  </div>
               </div>
               <div className="text-left">
                  <p className="text-[9px] text-muted-foreground font-black uppercase tracking-widest">الرصيد الراهن</p>
                  <p className="text-2xl font-black text-slate-900 dark:text-white tabular-nums">{selectedUser?.balance} EGP</p>
               </div>
            </div>

            <div className="space-y-4">
              <Label className="text-muted-foreground text-xs px-2 font-bold uppercase tracking-widest">القيمة المراد تحويلها</Label>
              <div className="relative">
                <Input 
                  type="number" 
                  placeholder="0.00" 
                  value={transferAmount} 
                  onChange={e => setTransferAmount(e.target.value)} 
                  className="h-24 rounded-[2rem] bg-slate-100 dark:bg-white/5 border-border dark:border-white/10 text-5xl font-black text-primary text-center shadow-inner focus:ring-primary/20 pr-4" 
                />
                <span className="absolute left-10 top-1/2 -translate-y-1/2 font-black text-muted-foreground text-xl uppercase tracking-widest">EGP</span>
              </div>
            </div>
          </div>

          <DialogFooter className="gap-6 pt-4">
            <Button variant="ghost" onClick={() => setIsTransferModalOpen(false)} className="text-muted-foreground hover:text-slate-900 dark:hover:text-white font-black text-lg h-16 px-10 rounded-2xl">إلغاء العملية</Button>
            <SovereignButton text="تأكيد وإتمام التحويل" onClick={handleTransfer} icon={<ArrowRightLeft className="h-6 w-6" />} className="flex-1 h-16 rounded-[1.8rem]" />
          </DialogFooter>
        </DialogContent>
      </Dialog>

    </div>
  );
}

function AdminNavBtn({ icon, text, active, onClick }: any) {
  return (
    <button onClick={onClick} className={`w-full flex items-center gap-6 px-8 py-5 rounded-[1.8rem] transition-all duration-500 font-black text-sm relative group ${active ? "bg-white/20 text-white shadow-3xl scale-[1.05]" : "text-white/30 hover:text-white hover:bg-white/5"}`}>
      {active && <motion.div layoutId="nav-active" className="absolute inset-0 bg-white/10 rounded-[1.8rem] -z-10 shadow-3xl" />}
      <span className={`shrink-0 transition-transform duration-500 ${active ? "scale-125" : "group-hover:scale-110"}`}>{icon}</span>
      <span className="tracking-tight text-lg">{text}</span>
    </button>
  );
}

function StatBox({ label, value, icon, color }: any) {
  const colors: any = {
    blue: "text-blue-500 bg-blue-500/10 border-blue-500/20",
    amber: "text-amber-500 bg-amber-500/10 border-amber-500/20",
    red: "text-red-500 bg-red-500/10 border-red-500/20",
    emerald: "text-emerald-500 bg-emerald-500/10 border-emerald-500/20",
    violet: "text-violet-500 bg-violet-500/10 border-violet-500/20",
  };
  return (
    <Card className="rounded-[2.8rem] border-none shadow-2xl bg-white dark:bg-slate-900/80 overflow-hidden relative group hover:scale-[1.05] transition-all duration-500">
      <div className="absolute top-0 right-0 p-10 opacity-5 group-hover:rotate-12 transition-transform duration-700 text-primary">{icon}</div>
      <CardContent className="p-10 flex flex-col items-start gap-4 relative z-10 text-right">
        <div className={`h-14 w-14 rounded-2xl flex items-center justify-center shadow-inner border ${colors[color]}`}>{icon}</div>
        <div className="space-y-1">
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
    emerald: "text-emerald-500 bg-emerald-500/5 hover:bg-emerald-500/10",
    blue: "text-blue-500 bg-blue-500/5 hover:bg-blue-500/10",
  };
  return (
    <Button variant="outline" size="icon" onClick={onClick} className={`h-14 w-14 rounded-2xl border-none transition-all shadow-lg active:scale-90 ${colors[color]}`} title={tooltip}>
      <div className="scale-125">{icon}</div>
    </Button>
  );
}

import SovereignButton from "@/components/SovereignButton";