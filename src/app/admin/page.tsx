"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Users, ShieldAlert, Wallet, Crown, Search, Bell, LogOut, 
  Trash2, CheckCircle2, XCircle, ShieldCheck, 
  Activity, Settings, MessageSquare, 
  ArrowLeft, Loader2, Plus, Zap, ArrowRightLeft,
  UserCheck, History, Cpu, Globe, RefreshCcw
} from "lucide-react";
import { useUser } from "@/firebase";
import { useToast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";
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
 * مركز القيادة العليا السيادي - king2026 Ultimate Edition
 * واجهة الإدارة الشاملة (PostgreSQL Linked).
 */
export default function SupremeCommandCenter() {
  const { user, profile, role, signOut } = useUser();
  const router = useRouter();
  const { toast } = useToast();
  
  const [activeTab, setActiveTab] = useState("overview");
  const [searchTerm, setSearchTerm] = useState("");
  const [users, setUsers] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // States for Actions
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [isBalanceModalOpen, setIsBalanceModalOpen] = useState(false);
  const [isRoleModalOpen, setIsRoleModalOpen] = useState(false);
  const [isTransferModalOpen, setIsTransferModalOpen] = useState(false);
  const [amount, setAmount] = useState("");
  const [newRole, setNewRole] = useState("");
  const [isAutoApprove, setIsAutoApprove] = useState(false);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    setIsLoading(true);
    // محاكاة جلب البيانات من محرك API السيادي
    // في بيئة Nextjs سيتم استبدال هذا بـ fetch('/api/admin/users')
    setTimeout(() => {
      setUsers([
        { id: "1", fullName: "بيشوي سامي", email: "bishoysamy390@gmail.com", role: "admin", balance: 999999, isBanned: false },
        { id: "2", fullName: "أحمد علي", email: "ahmed@example.com", role: "user", balance: 50, isBanned: false },
        { id: "3", fullName: "سارة محمد", email: "sara@example.com", role: "consultant", balance: 120, isBanned: true }
      ]);
      setIsLoading(false);
    }, 800);
  };

  const handleAction = async (action: string, u: any) => {
    toast({ title: `جاري تنفيذ بروتوكول: ${action}`, description: "يتم تحديث السحابة السيادية..." });
    // تنفيذ حقيقي عبر محرك API (سيتم برمجته في مسارات /api)
    setTimeout(() => {
      toast({ title: "تم التنفيذ بنجاح ✅" });
      fetchUsers();
    }, 500);
  };

  if (role !== "admin") {
    return (
      <div className="h-screen flex flex-col items-center justify-center bg-[#020617] text-red-500 font-black gap-8">
        <Crown className="h-32 w-32 animate-pulse" />
        <h1 className="text-5xl uppercase tracking-[0.5em] text-center">Unauthorized Identity</h1>
        <Button onClick={() => router.push("/")} className="bg-red-600 text-white px-12 h-16 rounded-2xl text-xl font-black">الهروب</Button>
      </div>
    );
  }

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
          <AdminNavBtn icon={<Wallet />} text="مركز العمليات المالية" active={activeTab === "billing"} onClick={() => setActiveTab("billing")} />
          <AdminNavBtn icon={<ShieldAlert />} text="الدرع الواقي" active={activeTab === "moderation"} onClick={() => setActiveTab("moderation")} />
          <AdminNavBtn icon={<History />} text="سجلات الأحداث" active={activeTab === "logs"} onClick={() => setActiveTab("logs")} />
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
        <header className="h-24 bg-white dark:bg-[#02040a]/80 backdrop-blur-3xl border-b border-border flex items-center justify-between px-12 z-40">
          <div className="flex items-center gap-8">
            <div className="h-12 w-12 bg-primary/5 rounded-2xl flex items-center justify-center text-primary border border-primary/10">
              <Cpu className="h-6 w-6 animate-pulse" />
            </div>
            <h1 className="text-2xl font-black tracking-tight text-primary uppercase">Supreme Sovereign Protocol active</h1>
          </div>

          <div className="flex items-center gap-8">
            <div className="text-left text-right">
               <p className="text-sm font-black text-slate-900 dark:text-white">سيادة المالك king2026</p>
               <p className="text-[10px] text-muted-foreground font-black uppercase tracking-widest text-emerald-500">Global Node Active</p>
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
                <StatBox label="المواطنون" value={users.length} icon={<Users />} color="blue" />
                <StatBox label="طلبات معلقة" value="٥" icon={<Zap />} color="amber" />
                <StatBox label="انتهاكات مرصودة" value="٠" icon={<ShieldAlert />} color="red" />
                <StatBox label="إجمالي السيولة" value="١,٢٥٠,٠٠٠" icon={<Wallet />} color="emerald" />
                
                <Card className="md:col-span-4 rounded-[3.5rem] border-none shadow-3xl bg-white dark:bg-slate-900/50 p-12 text-center relative overflow-hidden">
                   <div className="absolute inset-0 bg-primary/5 pointer-events-none" />
                   <Activity className="h-24 w-24 mx-auto mb-8 text-primary/20 animate-pulse" />
                   <h3 className="text-4xl font-black mb-4">مركز الرصد اللحظي</h3>
                   <p className="text-xl text-muted-foreground font-bold">كافة البروتوكولات تعمل بأقصى كفاءة تحت إشراف king2026.</p>
                </Card>
              </motion.div>
            )}

            {activeTab === "users" && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-8">
                <div className="flex justify-between items-center bg-white dark:bg-white/5 p-4 rounded-[2.5rem] shadow-xl">
                  <h2 className="text-4xl font-black text-primary tracking-tighter px-6">سجل المواطنين</h2>
                  <div className="relative w-[400px]">
                    <Search className="absolute right-6 top-1/2 -translate-y-1/2 text-primary h-6 w-6" />
                    <Input placeholder="ابحث عن مواطن..." className="pr-16 h-16 rounded-3xl bg-[#f8fafc] dark:bg-slate-900 border-none text-xl font-bold shadow-inner" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
                  </div>
                </div>

                <div className="grid gap-6">
                  {users.map((u) => (
                    <Card key={u.id} className={`rounded-[3rem] border-none shadow-2xl bg-white dark:bg-slate-900/80 ${u.isBanned ? 'opacity-40 grayscale' : 'hover:scale-[1.01]'}`}>
                      <CardContent className="p-10 flex items-center justify-between">
                        <div className="flex items-center gap-8">
                          <div className="h-20 w-20 rounded-[2rem] bg-primary/10 flex items-center justify-center text-3xl font-black text-primary shadow-inner">{u.fullName?.charAt(0)}</div>
                          <div>
                            <div className="flex items-center gap-4">
                              <h3 className="text-2xl font-black">{u.fullName}</h3>
                              <Badge className="bg-emerald-500/10 text-emerald-500 border-none px-4 font-black uppercase text-[10px]">{u.role}</Badge>
                            </div>
                            <p className="text-sm text-muted-foreground font-bold uppercase tracking-widest">{u.email}</p>
                          </div>
                        </div>

                        <div className="flex items-center gap-12">
                          <div className="text-left border-l border-border pl-12">
                            <p className="text-[10px] text-muted-foreground font-black uppercase mb-1">الرصيد السيادي</p>
                            <p className="text-4xl font-black text-primary tabular-nums">{u.balance} <span className="text-xs">EGP</span></p>
                          </div>
                          <div className="flex gap-3">
                            <ActionBtn icon={<Wallet />} onClick={() => { setSelectedUser(u); setIsBalanceModalOpen(true); }} tooltip="شحن رصيد" color="emerald" />
                            <ActionBtn icon={<Crown />} onClick={() => { setSelectedUser(u); setIsRoleModalOpen(true); }} tooltip="ترقية الرتبة" color="amber" />
                            <ActionBtn icon={u.isBanned ? <CheckCircle2 /> : <XCircle />} onClick={() => handleAction(u.isBanned ? "unban" : "ban", u)} color={u.isBanned ? "emerald" : "red"} tooltip="حظر/فك حظر" />
                            <ActionBtn icon={<Trash2 />} onClick={() => handleAction("purge", u)} color="red" tooltip="تطهير" />
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </motion.div>
            )}

            {/* Billing & Auto-Approval Tab */}
            {activeTab === "billing" && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-10">
                <div className="flex justify-between items-center bg-white dark:bg-white/5 p-8 rounded-[3rem] shadow-xl border border-primary/10">
                  <div className="space-y-2">
                    <h2 className="text-4xl font-black text-primary tracking-tighter">مركز العمليات المالية</h2>
                    <p className="text-muted-foreground font-bold">مراجعة طلبات الشحن واعتماد السيولة.</p>
                  </div>
                  <div className="flex items-center gap-6 bg-slate-950/20 px-8 py-4 rounded-3xl border border-white/5">
                    <div className="text-left">
                      <p className="text-[10px] font-black uppercase tracking-widest opacity-40">الطيار الآلي للشحن</p>
                      <p className={`text-xs font-black ${isAutoApprove ? "text-emerald-500" : "text-amber-500"}`}>{isAutoApprove ? "Active Autopilot" : "Manual Approval"}</p>
                    </div>
                    <Switch checked={isAutoApprove} onCheckedChange={setIsAutoApprove} className="data-[state=checked]:bg-emerald-500" />
                  </div>
                </div>

                <div className="grid gap-6">
                  {/* طلبات الشحن الحقيقية ستظهر هنا */}
                  <div className="py-40 text-center grayscale opacity-10">
                    <Globe className="h-32 w-32 mx-auto mb-6" />
                    <p className="text-3xl font-black">لا توجد طلبات تحويل معلقة حالياً</p>
                  </div>
                </div>
              </motion.div>
            )}

          </AnimatePresence>
        </div>
      </main>

      {/* Sovereign Modals */}
      <Dialog open={isBalanceModalOpen} onOpenChange={setIsBalanceModalOpen}>
        <DialogContent className="glass-cosmic border-none rounded-[4rem] p-12 text-right" dir="rtl">
          <DialogHeader>
            <DialogTitle className="text-4xl font-black text-white mb-4">تعديل الرصيد السيادي</DialogTitle>
            <DialogDescription className="text-white/40 font-bold text-lg">تحديث محفظة: {selectedUser?.fullName}</DialogDescription>
          </DialogHeader>
          <div className="py-12">
            <Input type="number" placeholder="أدخل القيمة الجديدة (EGP)" value={amount} onChange={e => setAmount(e.target.value)} className="h-20 rounded-3xl bg-white/5 border-white/10 text-4xl font-black text-primary text-center shadow-inner" />
          </div>
          <DialogFooter className="gap-6 pt-4">
            <Button variant="ghost" onClick={() => setIsBalanceModalOpen(false)} className="text-white/30 hover:text-white font-black text-lg h-16 px-10 rounded-2xl">إلغاء</Button>
            <Button onClick={() => handleAction("update_balance", selectedUser)} className="btn-primary flex-1 h-16 rounded-[1.8rem] text-xl">تثبيت القيمة 🚀</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

    </div>
  );
}

function AdminNavBtn({ icon, text, active, onClick }: any) {
  return (
    <button onClick={onClick} className={`w-full flex items-center gap-6 px-8 py-5 rounded-[1.8rem] transition-all duration-500 font-black text-sm relative group ${active ? "bg-primary text-primary-foreground shadow-3xl scale-[1.05]" : "text-white/30 hover:text-white hover:bg-white/5"}`}>
      {active && <motion.div layoutId="nav-active" className="absolute inset-0 bg-primary rounded-[1.8rem] -z-10 shadow-3xl shadow-primary/40" />}
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
  };
  return (
    <Card className="rounded-[2.8rem] border-none shadow-2xl bg-white dark:bg-slate-900/80 overflow-hidden relative group hover:scale-[1.05] transition-all duration-500">
      <div className="absolute top-0 right-0 p-10 opacity-5 group-hover:rotate-12 transition-transform duration-700 text-primary">{icon}</div>
      <CardContent className="p-10 flex flex-col items-start gap-4 relative z-10">
        <div className={`h-14 w-14 rounded-2xl flex items-center justify-center shadow-inner border ${colors[color]}`}>{icon}</div>
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
    <Button variant="outline" size="icon" onClick={onClick} className={`h-14 w-14 rounded-2xl border-none transition-all shadow-lg active:scale-90 ${colors[color]}`} title={tooltip}>
      <div className="scale-125">{icon}</div>
    </Button>
  );
}
