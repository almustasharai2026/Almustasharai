"use client";

import { useUser, useFirestore, useCollection } from "@/firebase";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { 
  Users, Gavel, ShieldAlert, Trash2, Search, Terminal, Wallet, X, CreditCard, Activity, Lock, Plus
} from "lucide-react";
import { collection, doc, deleteDoc, updateDoc, addDoc, query, orderBy, increment } from "firebase/firestore";
import { useMemoFirebase } from "@/firebase/provider";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { motion, AnimatePresence } from "framer-motion";

export default function MasterCommandPanel() {
  const { user } = useUser();
  const db = useFirestore();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState<"users" | "finance" | "moderation">("users");
  const [newWord, setNewWord] = useState("");

  const usersQuery = useMemoFirebase(() => db ? collection(db, "users") : null, [db]);
  const { data: allUsers } = useCollection(usersQuery);

  const wordsQuery = useMemoFirebase(() => db ? collection(db, "system", "moderation", "forbiddenWords") : null, [db]);
  const { data: forbiddenWords } = useCollection(wordsQuery);

  const payReqQuery = useMemoFirebase(() => db ? query(collection(db, "paymentRequests"), orderBy("createdAt", "desc")) : null, [db]);
  const { data: paymentRequests } = useCollection(payReqQuery);

  if (user?.email !== "bishoysamy390@gmail.com") {
    return (
      <div className="h-screen flex flex-col items-center justify-center bg-black text-red-500 font-black p-10 text-center gap-8">
        <Lock className="h-32 w-32 animate-pulse" />
        <h1 className="text-4xl uppercase tracking-[0.5em]">Sovereign Lock Active</h1>
        <p className="text-red-500/40 text-sm">ACCESS DENIED - UNAUTHORIZED BIO-METRIC SIGNATURE</p>
      </div>
    );
  }

  const approvePayment = async (req: any) => {
    try {
      await updateDoc(doc(db!, "users", req.userId), { balance: increment(req.amount) });
      await updateDoc(doc(db!, "paymentRequests", req.id), { status: "approved" });
      await addDoc(collection(db!, "users", req.userId, "transactions"), {
        amount: req.amount,
        service: "شحن رصيد سيادي",
        type: "recharge",
        timestamp: new Date().toISOString()
      });
      toast({ title: "تم التفعيل", description: "تمت إضافة الرصيد للمواطن بنجاح." });
    } catch (e) {
      toast({ variant: "destructive", title: "فشل الإجراء" });
    }
  };

  const handleAddWord = async () => {
    if (!newWord.trim()) return;
    try {
      await addDoc(collection(db!, "system", "moderation", "forbiddenWords"), { word: newWord.trim() });
      setNewWord("");
      toast({ title: "تمت الإضافة", description: "تم تحديث قاعدة بيانات الدرع الواقي." });
    } catch (e) {
      toast({ variant: "destructive", title: "خطأ" });
    }
  };

  return (
    <div className="min-h-screen bg-[#020617] p-8 lg:p-20 font-sans" dir="rtl">
      
      <header className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-start md:items-center gap-12 mb-32 relative">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-primary/10 blur-[180px] rounded-full -z-10" />
        <div className="flex items-center gap-6">
           <div className="h-20 w-20 rounded-3xl bg-indigo-600 flex items-center justify-center shadow-[0_0_60px_rgba(99,102,241,0.4)] border border-white/10">
              <Terminal className="h-10 w-10 text-white" />
           </div>
           <div>
              <h1 className="text-6xl font-black text-white tracking-tighter leading-none">غرفة القيادة <span className="text-primary">العليا</span></h1>
              <p className="text-white/20 text-lg font-bold tracking-[0.3em] uppercase mt-2">Master Sovereign Access v4.5</p>
           </div>
        </div>
        
        <div className="flex gap-2 glass-cosmic p-2.5 rounded-[3rem] border-white/10 shadow-3xl">
          <TabBtn active={activeTab === "users"} onClick={() => setActiveTab("users")} icon={<Users className="h-5 w-5" />} label="المواطنون" />
          <TabBtn active={activeTab === "finance"} onClick={() => setActiveTab("finance")} icon={<Wallet className="h-5 w-5" />} label="المالية" badge={paymentRequests?.filter(r => r.status === 'pending').length} />
          <TabBtn active={activeTab === "moderation"} onClick={() => setActiveTab("moderation")} icon={<ShieldAlert className="h-5 w-5" />} label="الرقابة" />
        </div>
      </header>

      <main className="max-w-7xl mx-auto">
        <AnimatePresence mode="wait">
          
          {activeTab === "finance" && (
            <motion.div key="finance" initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -30 }} className="space-y-10">
               <Card className="glass-cosmic border-none rounded-[4rem] p-16 shadow-3xl">
                  <h3 className="text-4xl font-black text-white mb-16 flex items-center gap-6"><CreditCard className="text-primary h-10 w-10" /> طلبات الشحن السيادية</h3>
                  <div className="space-y-6">
                    {paymentRequests?.map(r => (
                      <div key={r.id} className="flex flex-col md:flex-row items-center justify-between p-10 glass rounded-[3.5rem] border-white/5 bg-white/[0.02] hover:bg-white/[0.04] transition-all group">
                         <div className="flex items-center gap-10">
                            <div className="h-20 w-20 rounded-3xl bg-indigo-600/10 flex items-center justify-center font-black text-primary text-3xl shadow-inner border border-white/5">{r.userName?.charAt(0) || "U"}</div>
                            <div>
                               <p className="text-3xl font-black text-white">{r.userName || "مواطن مجهول"}</p>
                               <p className="text-xs text-white/20 font-bold uppercase mt-2 tracking-widest">{new Date(r.createdAt).toLocaleString('ar-EG')}</p>
                            </div>
                         </div>
                         <div className="flex items-center gap-16 mt-8 md:mt-0">
                            <div className="text-center">
                               <p className="text-[10px] text-white/20 font-black uppercase mb-2 tracking-widest">القيمة المطلوبة</p>
                               <p className="text-4xl font-black text-emerald-400 tabular-nums">{r.amount} EGP</p>
                            </div>
                            <div className="flex gap-4">
                               {r.status === 'pending' ? (
                                 <>
                                   <Button onClick={() => approvePayment(r)} className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-[1.8rem] h-16 px-12 font-black shadow-2xl text-lg">موافقة وشحن</Button>
                                   <Button variant="ghost" onClick={() => deleteDoc(doc(db!, "paymentRequests", r.id))} className="text-red-500/20 hover:text-red-500 h-16 w-16 rounded-2xl transition-colors"><X /></Button>
                                 </>
                               ) : (
                                 <Badge className="bg-emerald-500/10 text-emerald-500 border-none px-10 py-4 rounded-2xl font-black uppercase tracking-widest">Completed</Badge>
                               )}
                            </div>
                         </div>
                      </div>
                    ))}
                    {paymentRequests?.length === 0 && <div className="text-center py-20 opacity-20"><Activity className="h-16 w-16 mx-auto mb-4" /><p className="font-black text-xl">لا توجد طلبات معلقة</p></div>}
                  </div>
               </Card>
            </motion.div>
          )}

          {activeTab === "users" && (
            <motion.div key="users" initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -30 }} className="space-y-10">
               <Card className="glass-cosmic border-none rounded-[4rem] p-16 shadow-3xl">
                  <div className="flex flex-col md:flex-row justify-between items-center mb-16 gap-10">
                     <h3 className="text-4xl font-black text-white flex items-center gap-6"><Users className="text-primary h-10 w-10" /> قاعدة بيانات المواطنين</h3>
                     <div className="relative w-full md:w-[450px]">
                        <Search className="absolute right-6 top-1/2 -translate-y-1/2 h-6 w-6 text-white/20" />
                        <Input className="glass border-white/5 h-16 rounded-[1.8rem] pr-16 text-xl font-bold placeholder:text-white/10" placeholder="بحث سيادي..." />
                     </div>
                  </div>
                  <div className="space-y-4">
                    {allUsers?.map(u => (
                      <div key={u.id} className="flex items-center justify-between p-8 glass rounded-[3rem] border-white/5 hover:bg-white/[0.03] transition-all">
                        <div className="flex items-center gap-10">
                          <div className={`h-20 w-20 rounded-3xl flex items-center justify-center text-3xl font-black shadow-inner border border-white/5 ${u.isBanned ? 'bg-red-500/20 text-red-500' : 'bg-primary/10 text-primary'}`}>{u.fullName?.charAt(0) || "U"}</div>
                          <div className="space-y-2">
                            <p className="font-black text-3xl text-white">{u.fullName || "مواطن"}</p>
                            <p className="text-xs text-white/20 font-bold uppercase tracking-[0.2em]">{u.email} · Trust Score: {u.trustScore}%</p>
                          </div>
                        </div>
                        <div className="flex gap-6 items-center">
                          <div className="text-left ml-10">
                             <p className="text-[9px] text-white/20 font-black uppercase mb-1">الرصيد</p>
                             <p className="text-2xl font-black text-primary">{u.balance} EGP</p>
                          </div>
                          <Button variant="ghost" className={`h-14 px-10 rounded-2xl font-black text-xs transition-all ${u.isBanned ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20' : 'bg-red-500/10 text-red-500 border border-red-500/20'}`} onClick={() => updateDoc(doc(db!, "users", u.id), { isBanned: !u.isBanned })}>
                            {u.isBanned ? "إلغاء الحظر" : "حظر سيادي"}
                          </Button>
                          <Button variant="ghost" size="icon" onClick={() => deleteDoc(doc(db!, "users", u.id))} className="h-14 w-14 rounded-2xl text-white/10 hover:text-red-500 transition-colors"><Trash2 className="h-6 w-6" /></Button>
                        </div>
                      </div>
                    ))}
                  </div>
               </Card>
            </motion.div>
          )}

          {activeTab === "moderation" && (
            <motion.div key="moderation" initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -30 }} className="space-y-10">
               <Card className="glass-cosmic border-none rounded-[4rem] p-16 shadow-3xl">
                  <h3 className="text-4xl font-black text-white mb-16 flex items-center gap-6"><ShieldAlert className="text-primary h-10 w-10" /> الدرع الواقي (Moderation)</h3>
                  
                  <div className="flex gap-4 mb-16 max-w-2xl">
                     <Input 
                       className="glass border-white/5 h-16 rounded-2xl text-xl font-bold" 
                       placeholder="إضافة كلمة محظورة جديدة..." 
                       value={newWord}
                       onChange={e => setNewWord(e.target.value)}
                     />
                     <Button onClick={handleAddWord} className="h-16 w-16 rounded-2xl bg-primary text-slate-950 hover:bg-primary/80 transition-all">
                        <Plus className="h-8 w-8" />
                     </Button>
                  </div>

                  <div className="flex flex-wrap gap-4">
                    {forbiddenWords?.map(fw => (
                      <div key={fw.id} className="flex items-center gap-4 bg-white/5 border border-white/10 px-8 py-4 rounded-2xl group hover:border-red-500/50 transition-all">
                         <span className="font-bold text-xl">{fw.word}</span>
                         <button onClick={() => deleteDoc(doc(db!, "system", "moderation", "forbiddenWords", fw.id))} className="text-white/10 hover:text-red-500 transition-colors">
                            <X className="h-5 w-5" />
                         </button>
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
    <button onClick={onClick} className={`flex items-center gap-5 px-12 py-5 rounded-[2.5rem] text-sm font-black transition-all relative ${active ? 'bg-primary text-slate-950 shadow-[0_0_40px_rgba(99,102,241,0.4)]' : 'text-white/20 hover:text-white hover:bg-white/5'}`}>
      {icon}
      {label}
      {badge > 0 && <span className="absolute -top-3 -left-3 h-8 w-8 bg-red-600 text-white rounded-full flex items-center justify-center text-[11px] font-black animate-pulse shadow-3xl border-2 border-[#020617]">{badge}</span>}
    </button>
  );
}