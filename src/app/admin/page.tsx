
"use client";

import { useUser, useFirestore, useCollection } from "@/firebase";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { 
  Users, Gavel, ShieldAlert, Trash2, Search, Terminal, Wallet, X, CreditCard, Lock, Plus, UserMinus, Star, Activity, TrendingUp, DollarSign, Loader2
} from "lucide-react";
import { collection, doc, deleteDoc, updateDoc, addDoc, query, orderBy, increment } from "firebase/firestore";
import { useMemoFirebase } from "@/firebase/provider";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { motion, AnimatePresence } from "framer-motion";

type AdminTab = "users" | "finance" | "moderation" | "consultants";

export default function MasterCommandPanel() {
  const { user, profile } = useUser();
  const db = useFirestore();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState<AdminTab>("users");
  const [newWord, setNewWord] = useState("");

  // استعلامات البيانات السيادية
  const usersQuery = useMemoFirebase(() => db ? collection(db, "users") : null, [db]);
  const { data: allUsers, isLoading: usersLoading } = useCollection(usersQuery);

  const consultantsQuery = useMemoFirebase(() => db ? collection(db, "consultants") : null, [db]);
  const { data: allConsultants, isLoading: consultantsLoading } = useCollection(consultantsQuery);

  const payReqQuery = useMemoFirebase(() => db ? query(collection(db, "paymentRequests"), orderBy("createdAt", "desc")) : null, [db]);
  const { data: paymentRequests, isLoading: requestsLoading } = useCollection(payReqQuery);

  const bookingsQuery = useMemoFirebase(() => db ? collection(db, "bookings") : null, [db]);
  const { data: bookings, isLoading: bookingsLoading } = useCollection(bookingsQuery);

  const wordsQuery = useMemoFirebase(() => db ? collection(db, "system", "moderation", "forbiddenWords") : null, [db]);
  const { data: forbiddenWords } = useCollection(wordsQuery);

  // حساب الإيرادات السيادية
  const totalRevenue = bookings?.reduce((acc, b) => acc + (Number(b.price) || 0), 0) || 0;

  if (user?.email !== "bishoysamy390@gmail.com") {
    return (
      <div className="h-screen flex flex-col items-center justify-center bg-black text-red-500 font-black gap-8">
        <Lock className="h-32 w-32 animate-pulse" />
        <h1 className="text-4xl uppercase tracking-[0.5em]">Sovereign Lock Active</h1>
      </div>
    );
  }

  const handleApprovePayment = async (req: any) => {
    try {
      await updateDoc(doc(db!, "users", req.userId), { balance: increment(req.amount) });
      await updateDoc(doc(db!, "paymentRequests", req.id), { status: "approved" });
      toast({ title: "تم التفعيل المالي", description: "تمت إضافة الرصيد لحساب المواطن." });
    } catch (e) {
      toast({ variant: "destructive", title: "فشل في البروتوكول" });
    }
  };

  const handleBanUser = async (userId: string, currentStatus: boolean) => {
    try {
      await updateDoc(doc(db!, "users", userId), { isBanned: !currentStatus });
      toast({ title: currentStatus ? "تم فك الحظر" : "تم الحظر السيادي" });
    } catch (e) {
      toast({ variant: "destructive", title: "خطأ في الصلاحيات" });
    }
  };

  return (
    <div className="min-h-screen bg-[#020617] p-8 lg:p-20 font-sans" dir="rtl">
      <header className="max-w-7xl mx-auto flex flex-col lg:flex-row justify-between items-start lg:items-center gap-12 mb-24">
        <div className="flex items-center gap-8">
           <div className="h-24 w-24 rounded-[2.5rem] bg-indigo-600 flex items-center justify-center shadow-3xl border border-white/10 relative">
              <Terminal className="h-12 w-12 text-white" />
              <div className="absolute -top-2 -right-2 h-6 w-6 rounded-full bg-red-500 border-4 border-[#020617] animate-pulse" />
           </div>
           <div>
              <div className="sovereign-badge mb-3">Supreme Leadership Module v4.5</div>
              <h1 className="text-6xl font-black text-white tracking-tighter">غرفة القيادة <span className="text-primary">العليا</span></h1>
           </div>
        </div>
        
        <div className="flex flex-wrap gap-2 glass-cosmic p-2 rounded-[3rem] border-white/5">
          <TabBtn active={activeTab === "users"} onClick={() => setActiveTab("users")} icon={<Users className="h-4 w-4" />} label="المواطنون" />
          <TabBtn active={activeTab === "consultants"} onClick={() => setActiveTab("consultants")} icon={<Gavel className="h-4 w-4" />} label="الخبراء" />
          <TabBtn active={activeTab === "finance"} onClick={() => setActiveTab("finance")} icon={<Wallet className="h-4 w-4" />} label="المالية" />
          <TabBtn active={activeTab === "moderation"} onClick={() => setActiveTab("moderation")} icon={<ShieldAlert className="h-4 w-4" />} label="الرقابة" />
        </div>
      </header>

      <main className="max-w-7xl mx-auto space-y-16">
        
        {/* Quick Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
           <AdminStatCard label="إجمالي الأرباح السيادية" value={`${totalRevenue} EGP`} icon={<DollarSign className="text-emerald-400" />} />
           <AdminStatCard label="المواطنون المسجلون" value={allUsers?.length || 0} icon={<Users className="text-blue-400" />} />
           <AdminStatCard label="الجلسات المنفذة" value={bookings?.length || 0} icon={<Activity className="text-indigo-400" />} />
           <AdminStatCard label="طلبات الشحن المعلقة" value={paymentRequests?.filter(r => r.status === 'pending').length || 0} icon={<CreditCard className="text-amber-400" />} />
        </div>

        <AnimatePresence mode="wait">
          {activeTab === "users" && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}>
               <Card className="glass-cosmic border-none rounded-[4rem] p-12 shadow-3xl">
                  <div className="flex justify-between items-center mb-12">
                     <h3 className="text-3xl font-black text-white">قاعدة بيانات المواطنين</h3>
                     <Badge className="bg-white/5 text-white/40 border-none px-6 py-2 rounded-xl">Real-time Sync Active</Badge>
                  </div>
                  <div className="space-y-4">
                    {allUsers?.map(u => (
                      <div key={u.id} className="flex items-center justify-between p-8 glass rounded-[2.5rem] border-white/5 bg-white/[0.01] hover:bg-white/[0.03] transition-all group">
                         <div className="flex items-center gap-8">
                            <div className="h-16 w-16 rounded-2xl bg-indigo-600/20 flex items-center justify-center font-black text-indigo-400 text-xl border border-indigo-500/20">{u.fullName?.charAt(0)}</div>
                            <div>
                               <p className="text-xl font-black text-white">{u.fullName}</p>
                               <p className="text-xs text-white/20 font-bold uppercase tracking-widest">{u.email}</p>
                            </div>
                         </div>
                         <div className="flex items-center gap-6">
                            <div className="text-left px-6 py-2 border-r border-white/5">
                               <p className="text-[9px] text-white/20 font-black uppercase mb-1">الرصيد</p>
                               <p className="text-xl font-black text-primary tabular-nums">{u.balance} EGP</p>
                            </div>
                            <Button 
                              variant={u.isBanned ? "default" : "ghost"} 
                              onClick={() => handleBanUser(u.id, u.isBanned)}
                              className={`h-12 px-8 rounded-xl font-black text-xs uppercase tracking-widest transition-all ${u.isBanned ? 'bg-red-600 text-white shadow-xl shadow-red-600/20' : 'text-white/20 hover:text-red-500 hover:bg-red-500/10'}`}
                            >
                              {u.isBanned ? "فك الحظر السيادي" : "حظر المستخدم"}
                            </Button>
                         </div>
                      </div>
                    ))}
                  </div>
               </Card>
            </motion.div>
          )}

          {activeTab === "finance" && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}>
               <Card className="glass-cosmic border-none rounded-[4rem] p-12 shadow-3xl">
                  <div className="flex justify-between items-center mb-16">
                     <h3 className="text-3xl font-black text-white">إدارة التدفقات المالية</h3>
                     <div className="flex items-center gap-4 bg-emerald-500/10 border border-emerald-500/20 px-8 py-4 rounded-3xl">
                        <TrendingUp className="h-6 w-6 text-emerald-500" />
                        <span className="text-2xl font-black text-emerald-500 tabular-nums">+{totalRevenue} EGP</span>
                     </div>
                  </div>
                  
                  <div className="space-y-6">
                    {paymentRequests?.map(req => (
                      <div key={req.id} className="flex items-center justify-between p-8 glass rounded-[2.5rem] border-white/5 bg-white/[0.01]">
                         <div className="flex items-center gap-8">
                            <div className="h-14 w-14 rounded-2xl bg-amber-500/10 flex items-center justify-center text-amber-500"><Wallet /></div>
                            <div>
                               <p className="text-xl font-black text-white">{req.userName}</p>
                               <p className="text-xs text-white/20 font-bold uppercase tracking-widest">تحويل بقيمة {req.amount} EGP</p>
                            </div>
                         </div>
                         <div className="flex items-center gap-6">
                            {req.status === 'pending' ? (
                              <Button onClick={() => handleApprovePayment(req)} className="btn-primary rounded-xl h-12 px-8 text-xs">اعتماد التحويل</Button>
                            ) : (
                              <Badge className="bg-emerald-500/10 text-emerald-500 border-none px-6 py-2 rounded-xl font-black text-[10px] uppercase">Approved</Badge>
                            )}
                         </div>
                      </div>
                    ))}
                  </div>
               </Card>
            </motion.div>
          )}

          {activeTab === "consultants" && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}>
               <Card className="glass-cosmic border-none rounded-[4rem] p-12 shadow-3xl">
                  <div className="flex justify-between items-center mb-12">
                     <h3 className="text-3xl font-black text-white">إدارة هيئة الخبراء</h3>
                     <Button className="btn-primary rounded-2xl h-14 px-10 gap-3">
                        <Plus className="h-5 w-5" /> إضافة خبير جديد
                     </Button>
                  </div>
                  <div className="space-y-4">
                    {allConsultants?.map(c => (
                      <div key={c.id} className="flex items-center justify-between p-8 glass rounded-[2.5rem] border-white/5 bg-white/[0.01]">
                         <div className="flex items-center gap-8">
                            <div className="h-16 w-16 rounded-2xl bg-indigo-600/20 flex items-center justify-center text-indigo-400"><Gavel /></div>
                            <div>
                               <p className="text-xl font-black text-white">{c.name}</p>
                               <p className="text-xs text-primary font-bold uppercase mt-1">{c.specialization}</p>
                            </div>
                         </div>
                         <div className="flex items-center gap-6">
                            <div className="flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/5">
                               <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
                               <span className="text-sm font-black text-white">{c.rating || "5.0"}</span>
                            </div>
                            <Button variant="ghost" onClick={() => deleteDoc(doc(db!, "consultants", c.id))} className="h-12 w-12 rounded-xl text-white/10 hover:text-red-500 hover:bg-red-500/10">
                               <Trash2 className="h-5 w-5" />
                            </Button>
                         </div>
                      </div>
                    ))}
                  </div>
               </Card>
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}

function TabBtn({ active, onClick, icon, label }: any) {
  return (
    <button onClick={onClick} className={`flex items-center gap-4 px-10 py-4 rounded-[2rem] text-xs font-black transition-all ${active ? 'bg-primary text-slate-950 shadow-2xl' : 'text-white/20 hover:text-white hover:bg-white/5'}`}>
      {icon} {label}
    </button>
  );
}

function AdminStatCard({ label, value, icon }: any) {
  return (
    <Card className="glass-cosmic border-none rounded-[3rem] p-10 group hover:scale-[1.05] transition-all duration-500 shadow-2xl relative overflow-hidden">
      <div className="absolute top-0 left-0 w-1 h-full bg-primary opacity-0 group-hover:opacity-100 transition-opacity" />
      <div className="flex justify-between items-start mb-8">
        <div className="h-14 w-14 rounded-2xl bg-white/5 flex items-center justify-center border border-white/10 group-hover:bg-primary/10 transition-colors">{icon}</div>
      </div>
      <p className="text-[10px] text-white/20 font-black uppercase mb-2 tracking-widest">{label}</p>
      <h4 className="text-4xl font-black text-white tabular-nums tracking-tighter">{value}</h4>
    </Card>
  );
}
