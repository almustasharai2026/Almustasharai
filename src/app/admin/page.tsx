
"use client";

import { useUser, useFirestore, useCollection } from "@/firebase";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { 
  Users, Gavel, ShieldAlert, Settings, 
  Trash2, Ban, CheckCircle, Search, Activity, UserPlus, X, Plus,
  BarChart3, Wallet, TrendingUp, AlertTriangle, Terminal, Eye
} from "lucide-react";
import { collection, doc, deleteDoc, updateDoc, addDoc, query, orderBy, limit } from "firebase/firestore";
import { useMemoFirebase } from "@/firebase/provider";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { motion, AnimatePresence } from "framer-motion";

export default function MasterCommandPanel() {
  const { user } = useUser();
  const db = useFirestore();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState<"users" | "consultants" | "moderation" | "finance">("users");
  const [newWord, setNewWord] = useState("");

  const usersQuery = useMemoFirebase(() => collection(db!, "users"), [db]);
  const { data: allUsers } = useCollection(usersQuery);

  const consultantsQuery = useMemoFirebase(() => collection(db!, "consultantProfiles"), [db]);
  const { data: consultants } = useCollection(consultantsQuery);

  const wordsQuery = useMemoFirebase(() => collection(db!, "settings", "moderation", "forbiddenWords"), [db]);
  const { data: forbiddenWords } = useCollection(wordsQuery);

  const payReqQuery = useMemoFirebase(() => query(collection(db!, "paymentRequests"), orderBy("createdAt", "desc")), [db]);
  const { data: paymentRequests } = useCollection(payReqQuery);

  if (user?.email !== "bishoysamy390@gmail.com") {
    return <div className="h-screen flex items-center justify-center text-red-500 font-black tracking-widest uppercase bg-black">Access Denied - Sovereign Lock Active</div>;
  }

  const approvePayment = async (req: any) => {
    try {
      await updateDoc(doc(db!, "users", req.userId), { balance: increment(req.amount) });
      await updateDoc(doc(db!, "paymentRequests", req.id), { status: "approved" });
      await addDoc(collection(db!, "users", req.userId, "transactions"), {
        amount: req.amount,
        service: "شحن رصيد",
        type: "recharge",
        timestamp: new Date().toISOString()
      });
      toast({ title: "تم الشحن", description: "تمت إضافة الرصيد للمواطن بنجاح." });
    } catch (e) {
      toast({ variant: "destructive", title: "فشل" });
    }
  };

  return (
    <div className="min-h-screen bg-[#020617] p-8 lg:p-16 font-sans" dir="rtl">
      
      {/* Master Header */}
      <header className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-start md:items-center gap-12 mb-24 relative">
        <div className="absolute -top-32 -right-32 w-96 h-96 bg-primary/10 blur-[150px] rounded-full -z-10" />
        <div className="space-y-4">
          <div className="flex items-center gap-4">
             <div className="h-14 w-14 rounded-2xl bg-indigo-600 flex items-center justify-center shadow-2xl border border-white/10">
                <Terminal className="h-7 w-7 text-white" />
             </div>
             <div>
                <h1 className="text-5xl font-black text-white tracking-tighter">غرفة القيادة <span className="text-primary">العليا</span></h1>
                <p className="text-white/20 text-lg font-bold tracking-widest uppercase">Master Sovereign System Access v4.0</p>
             </div>
          </div>
        </div>
        
        <div className="flex gap-2 glass-cosmic p-2 rounded-[2.5rem] border-white/10 shadow-2xl">
          <TabBtn active={activeTab === "users"} onClick={() => setActiveTab("users")} icon={<Users />} label="المواطنون" />
          <TabBtn active={activeTab === "finance"} onClick={() => setActiveTab("finance")} icon={<Wallet />} label="المالية" badge={paymentRequests?.filter(r => r.status === 'pending').length} />
          <TabBtn active={activeTab === "consultants"} onClick={() => setActiveTab("consultants")} icon={<Gavel />} label="الخبراء" />
          <TabBtn active={activeTab === "moderation"} onClick={() => setActiveTab("moderation")} icon={<ShieldAlert />} label="الرقابة" />
        </div>
      </header>

      <main className="max-w-7xl mx-auto">
        <AnimatePresence mode="wait">
          
          {/* Finance Tab */}
          {activeTab === "finance" && (
            <motion.div key="finance" initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -30 }} className="space-y-8">
               <div className="grid md:grid-cols-3 gap-8">
                  <StatMini label="إجمالي الإيرادات" val="42,500 EGP" color="blue" />
                  <StatMini label="طلبات معلقة" val={paymentRequests?.filter(r => r.status === 'pending').length || 0} color="amber" />
                  <StatMini label="عمليات اليوم" val="12" color="emerald" />
               </div>
               <Card className="glass-cosmic border-none rounded-[4rem] p-12 shadow-2xl overflow-hidden">
                  <h3 className="text-3xl font-black text-white mb-12 flex items-center gap-5"><CreditCard className="text-primary h-8 w-8" /> طلبات الشحن والتحويل</h3>
                  <div className="space-y-4">
                    {paymentRequests?.map(r => (
                      <div key={r.id} className="flex items-center justify-between p-8 glass rounded-[2.5rem] border-white/5 bg-white/[0.02] group">
                         <div className="flex items-center gap-8">
                            <div className="h-16 w-16 rounded-[1.5rem] bg-indigo-600/10 flex items-center justify-center font-black text-primary text-xl shadow-inner">{r.userName.charAt(0)}</div>
                            <div>
                               <p className="text-2xl font-black text-white">{r.userName}</p>
                               <p className="text-xs text-white/20 font-bold uppercase mt-1 tracking-widest">{new Date(r.createdAt).toLocaleString('ar-EG')}</p>
                            </div>
                         </div>
                         <div className="flex items-center gap-12">
                            <div className="text-center">
                               <p className="text-[10px] text-white/20 font-black uppercase mb-1">المبلغ المطلوب</p>
                               <p className="text-3xl font-black text-emerald-400 tabular-nums">{r.amount} EGP</p>
                            </div>
                            <div className="flex gap-3">
                               {r.status === 'pending' ? (
                                 <>
                                   <Button onClick={() => approvePayment(r)} className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl h-14 px-10 font-black shadow-xl">موافقة وشحن</Button>
                                   <Button variant="ghost" onClick={() => deleteDoc(doc(db!, "paymentRequests", r.id))} className="text-red-500/40 hover:text-red-500 h-14 w-14 rounded-2xl"><X /></Button>
                                 </>
                               ) : (
                                 <Badge className="bg-emerald-500/10 text-emerald-500 border-none px-8 py-3 rounded-2xl font-black uppercase">Completed</Badge>
                               )}
                            </div>
                         </div>
                      </div>
                    ))}
                  </div>
               </Card>
            </motion.div>
          )}

          {/* Other tabs follow similar premium patterns... */}
          {activeTab === "users" && (
            <motion.div key="users" initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -30 }} className="space-y-10">
               <Card className="glass-cosmic border-none rounded-[4rem] p-14 shadow-2xl">
                  <div className="flex justify-between items-center mb-12">
                     <h3 className="text-3xl font-black text-white flex items-center gap-5"><Users className="text-primary h-8 w-8" /> إدارة المواطنين</h3>
                     <div className="relative w-96">
                        <Search className="absolute right-5 top-1/2 -translate-y-1/2 h-5 w-5 text-white/20" />
                        <Input className="glass border-white/5 h-16 rounded-2xl pr-14 text-xl font-bold" placeholder="بحث سيادي..." />
                     </div>
                  </div>
                  <div className="space-y-4">
                    {allUsers?.map(u => (
                      <div key={u.id} className="flex items-center justify-between p-8 glass rounded-[2.5rem] border-white/5 hover:bg-white/[0.03] transition-all">
                        <div className="flex items-center gap-8">
                          <div className={`h-16 w-16 rounded-2xl flex items-center justify-center text-xl font-black shadow-inner ${u.isBanned ? 'bg-red-500/20 text-red-500' : 'bg-primary/10 text-primary'}`}>{u.fullName.charAt(0)}</div>
                          <div className="space-y-1 text-right">
                            <p className="font-black text-2xl text-white">{u.fullName}</p>
                            <p className="text-xs text-white/20 font-bold uppercase tracking-widest">{u.email} · Trust: {u.trustScore}%</p>
                          </div>
                        </div>
                        <div className="flex gap-4">
                          <Button variant="ghost" className={`h-12 px-8 rounded-2xl font-black text-xs ${u.isBanned ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20' : 'bg-red-500/10 text-red-500 border border-red-500/20'}`} onClick={() => updateDoc(doc(db!, "users", u.id), { isBanned: !u.isBanned })}>
                            {u.isBanned ? "إلغاء الحظر" : "حظر سيادي"}
                          </Button>
                          <Button variant="ghost" size="icon" onClick={() => deleteDoc(doc(db!, "users", u.id))} className="h-12 w-12 rounded-2xl text-white/10 hover:text-red-500"><Trash2 className="h-5 w-5" /></Button>
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

function TabBtn({ active, onClick, icon, label, badge }: any) {
  return (
    <button onClick={onClick} className={`flex items-center gap-4 px-10 py-4 rounded-[2rem] text-sm font-black transition-all relative ${active ? 'bg-primary text-white shadow-2xl shadow-primary/30' : 'text-white/20 hover:text-white hover:bg-white/5'}`}>
      {icon}
      {label}
      {badge > 0 && <span className="absolute -top-2 -left-2 h-6 w-6 bg-red-600 text-white rounded-full flex items-center justify-center text-[10px] animate-pulse shadow-2xl">{badge}</span>}
    </button>
  );
}

function StatMini({ label, val, color }: any) {
  const colors: any = {
    blue: "text-blue-400 bg-blue-500/10 border-blue-500/20",
    amber: "text-amber-400 bg-amber-500/10 border-amber-500/20",
    emerald: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20"
  };
  return (
    <div className={`p-12 glass-cosmic rounded-[3rem] border ${colors[color]} shadow-2xl`}>
       <p className="text-[10px] font-black uppercase tracking-[0.3em] opacity-40 mb-4">{label}</p>
       <p className="text-5xl font-black tabular-nums tracking-tighter">{val}</p>
    </div>
  );
}
