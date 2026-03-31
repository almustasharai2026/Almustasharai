
"use client";

import { useUser, useFirestore, useCollection } from "@/firebase";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { 
  Users, Gavel, ShieldAlert, Trash2, Terminal, Wallet, X, CreditCard, Lock, Plus, Activity, TrendingUp, DollarSign, Loader2, ShieldCheck, UserMinus, UserPlus, Settings
} from "lucide-react";
import { collection, doc, deleteDoc, updateDoc, addDoc, query, orderBy, increment } from "firebase/firestore";
import { useMemoFirebase } from "@/firebase/provider";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { motion, AnimatePresence } from "framer-motion";
import SovereignButton from "@/components/SovereignButton";

type AdminTab = "users" | "finance" | "moderation" | "consultants";

/**
 * غرفة القيادة العليا (The Supreme Command Center).
 * مركز الإدارة والرقابة المطلقة لمالك النظام.
 */
export default function MasterCommandPanel() {
  const { user, role } = useUser();
  const db = useFirestore();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState<AdminTab>("users");
  const [newWord, setNewWord] = useState("");
  const [chargeAmount, setChargeAmount] = useState<number>(0);
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);

  // استعلامات البيانات السيادية (Real-time Sync)
  const usersQuery = useMemoFirebase(() => db ? collection(db, "users") : null, [db]);
  const { data: allUsers, isLoading: usersLoading } = useCollection(usersQuery);

  const consultantsQuery = useMemoFirebase(() => db ? collection(db, "consultants") : null, [db]);
  const { data: allConsultants, isLoading: consultantsLoading } = useCollection(consultantsQuery);

  const payReqQuery = useMemoFirebase(() => db ? query(collection(db, "paymentRequests"), orderBy("createdAt", "desc")) : null, [db]);
  const { data: paymentRequests, isLoading: requestsLoading } = useCollection(payReqQuery);

  const wordsQuery = useMemoFirebase(() => db ? collection(db, "system", "moderation", "forbiddenWords") : null, [db]);
  const { data: forbiddenWords } = useCollection(wordsQuery);

  // حماية الحدود السيادية: لا يفتح إلا للمالك
  if (user?.email !== "bishoysamy390@gmail.com") {
    return (
      <div className="h-screen flex flex-col items-center justify-center bg-slate-950 text-red-500 font-black gap-8">
        <Lock className="h-24 w-24 animate-pulse" />
        <h1 className="text-3xl uppercase tracking-[0.3em] text-center px-10">Sovereign Access Denied</h1>
      </div>
    );
  }

  const handleAddBalance = async (userId: string) => {
    if (chargeAmount <= 0) return;
    try {
      await updateDoc(doc(db!, "users", userId), { 
        balance: increment(chargeAmount) 
      });
      toast({ title: "تم تحديث الرصيد", description: `تمت إضافة ${chargeAmount} EGP للمواطن.` });
      setChargeAmount(0);
      setSelectedUserId(null);
    } catch (e) {
      toast({ variant: "destructive", title: "فشل الإجراء المالي" });
    }
  };

  const handleBanUser = async (userId: string, currentStatus: boolean) => {
    try {
      await updateDoc(doc(db!, "users", userId), { isBanned: !currentStatus });
      toast({ title: currentStatus ? "تم فك الحظر" : "تم الحظر السيادي بنجاح" });
    } catch (e) {
      toast({ variant: "destructive", title: "خطأ في الصلاحيات" });
    }
  };

  const handleAddForbiddenWord = async () => {
    if (!newWord.trim()) return;
    try {
      await addDoc(collection(db!, "system", "moderation", "forbiddenWords"), {
        word: newWord.trim(),
        addedAt: new Date().toISOString()
      });
      setNewWord("");
      toast({ title: "تم تحديث الرقابة", description: "أضيفت الكلمة لدرع الحماية." });
    } catch (e) {
      toast({ variant: "destructive", title: "فشل التحديث" });
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#020617] p-4 lg:p-10 font-sans" dir="rtl">
      
      {/* Sovereign Header */}
      <header className="max-w-5xl mx-auto mb-12">
        <div className="flex items-center gap-6 mb-8">
           <div className="h-16 w-16 rounded-2xl bg-primary flex items-center justify-center shadow-xl border border-white/10">
              <Terminal className="h-8 w-8 text-white" />
           </div>
           <div>
              <h1 className="text-3xl font-black text-primary tracking-tighter">غرفة القيادة <span className="text-accent">العليا</span></h1>
              <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest">Supreme Leadership Console v4.5</p>
           </div>
        </div>
        
        <div className="flex flex-wrap gap-2 bg-white dark:bg-slate-900 p-2 rounded-2xl border border-border/50 shadow-sm">
          <TabBtn active={activeTab === "users"} onClick={() => setActiveTab("users")} icon={<Users className="h-4 w-4" />} label="المواطنون" />
          <TabBtn active={activeTab === "finance"} onClick={() => setActiveTab("finance")} icon={<Wallet className="h-4 w-4" />} label="إضافة رصيد" />
          <TabBtn active={activeTab === "moderation"} onClick={() => setActiveTab("moderation")} icon={<ShieldAlert className="h-4 w-4" />} label="تعديل المحتوى" />
          <TabBtn active={activeTab === "consultants"} onClick={() => setActiveTab("consultants")} icon={<Gavel className="h-4 w-4" />} label="الخبراء" />
        </div>
      </header>

      <main className="max-w-5xl mx-auto space-y-10">
        
        <AnimatePresence mode="wait">
          {/* User Management Tab */}
          {activeTab === "users" && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
               <Card className="border-none rounded-[2rem] shadow-xl overflow-hidden">
                  <CardHeader className="bg-primary text-white p-8">
                     <CardTitle className="text-xl font-black flex items-center gap-3">
                       <Users className="h-6 w-6" /> إدارة المواطنين الرقميين
                     </CardTitle>
                     <CardDescription className="text-white/60">التحكم في هويات المواطنين وحالات الامتثال السيادي.</CardDescription>
                  </CardHeader>
                  <CardContent className="p-0">
                    <div className="divide-y divide-border">
                      {usersLoading ? (
                        <div className="p-20 flex justify-center"><Loader2 className="animate-spin text-primary" /></div>
                      ) : allUsers?.map(u => (
                        <div key={u.id} className="flex items-center justify-between p-6 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                           <div className="flex items-center gap-4">
                              <div className={`h-12 w-12 rounded-xl flex items-center justify-center font-black ${u.isBanned ? 'bg-red-100 text-red-600' : 'bg-accent/10 text-accent'} border border-current/10`}>
                                {u.fullName?.charAt(0)}
                              </div>
                              <div>
                                 <p className="text-sm font-black text-primary">{u.fullName}</p>
                                 <p className="text-[10px] text-muted-foreground font-bold">{u.email}</p>
                              </div>
                           </div>
                           <div className="flex items-center gap-3">
                              <div className="text-left px-4 border-l border-border">
                                 <p className="text-[8px] text-muted-foreground font-black uppercase">الرصيد</p>
                                 <p className="text-sm font-black text-accent tabular-nums">{u.balance} EGP</p>
                              </div>
                              <Button 
                                variant={u.isBanned ? "destructive" : "outline"} 
                                size="sm"
                                onClick={() => handleBanUser(u.id, u.isBanned)}
                                className="rounded-xl h-10 px-4 text-[10px] font-black uppercase"
                              >
                                {u.isBanned ? "فك الحظر" : "حظر سيادي"}
                              </Button>
                           </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
               </Card>
            </motion.div>
          )}

          {/* Finance / Add Credit Tab */}
          {activeTab === "finance" && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
               <Card className="border-none rounded-[2rem] shadow-xl overflow-hidden">
                  <CardHeader className="bg-emerald-600 text-white p-8">
                     <CardTitle className="text-xl font-black flex items-center gap-3">
                       <Wallet className="h-6 w-6" /> بروتوكول شحن الرصيد
                     </CardTitle>
                  </CardHeader>
                  <CardContent className="p-8 space-y-6">
                    <div className="grid gap-4">
                      <label className="text-xs font-black text-muted-foreground uppercase">اختر المواطن</label>
                      <select 
                        className="w-full h-12 bg-secondary/30 rounded-xl px-4 text-sm font-bold outline-none border border-border/50"
                        onChange={(e) => setSelectedUserId(e.target.value)}
                        value={selectedUserId || ""}
                      >
                        <option value="">-- اختر مستخدماً من الهيئة --</option>
                        {allUsers?.map(u => (
                          <option key={u.id} value={u.id}>{u.fullName} ({u.balance} EGP)</option>
                        ))}
                      </select>
                    </div>
                    
                    <div className="grid gap-4">
                      <label className="text-xs font-black text-muted-foreground uppercase">المبلغ المراد شحنه (EGP)</label>
                      <Input 
                        type="number" 
                        value={chargeAmount} 
                        onChange={(e) => setChargeAmount(Number(e.target.value))}
                        className="h-12 rounded-xl text-lg font-black text-center"
                      />
                    </div>

                    <SovereignButton 
                      text="تفعيل الشحن المالي" 
                      onClick={() => selectedUserId && handleAddBalance(selectedUserId)}
                      disabled={!selectedUserId || chargeAmount <= 0}
                      icon={<Plus className="h-5 w-5" />}
                    />
                  </CardContent>
               </Card>
            </motion.div>
          )}

          {/* Moderation / Content Edit Tab */}
          {activeTab === "moderation" && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
               <Card className="border-none rounded-[2rem] shadow-xl overflow-hidden">
                  <CardHeader className="bg-slate-900 text-white p-8">
                     <CardTitle className="text-xl font-black flex items-center gap-3">
                       <ShieldAlert className="h-6 w-6 text-accent" /> تعديل محتوى الرقابة
                     </CardTitle>
                     <CardDescription className="text-white/40">تحديث الكلمات المحظورة التي يراقبها الدرع الواقي اللحظي.</CardDescription>
                  </CardHeader>
                  <CardContent className="p-8 space-y-8">
                    <div className="flex gap-2">
                      <Input 
                        placeholder="أضف كلمة محظورة جديدة..." 
                        value={newWord}
                        onChange={(e) => setNewWord(e.target.value)}
                        className="h-12 rounded-xl flex-1"
                      />
                      <Button onClick={handleAddForbiddenWord} className="h-12 px-6 rounded-xl bg-accent text-white font-black">إضافة</Button>
                    </div>

                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest px-2">الكلمات المراقبة حالياً</label>
                      <div className="flex flex-wrap gap-2 p-4 bg-secondary/30 rounded-2xl border border-border/50">
                        {forbiddenWords?.map(fw => (
                          <Badge key={fw.id} className="bg-white dark:bg-slate-800 text-primary border border-border px-3 py-1.5 rounded-lg flex items-center gap-2 group transition-all">
                            {fw.word}
                            <button onClick={() => deleteDoc(doc(db!, "system/moderation/forbiddenWords", fw.id))} className="text-muted-foreground hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity">
                              <X className="h-3 w-3" />
                            </button>
                          </Badge>
                        ))}
                        {forbiddenWords?.length === 0 && <span className="text-xs text-muted-foreground italic">لا توجد كلمات محظورة مسجلة.</span>}
                      </div>
                    </div>
                  </CardContent>
               </Card>
            </motion.div>
          )}

          {/* Consultants Tab */}
          {activeTab === "consultants" && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
               <Card className="border-none rounded-[2rem] shadow-xl overflow-hidden">
                  <CardHeader className="bg-indigo-700 text-white p-8">
                     <CardTitle className="text-xl font-black flex items-center gap-3">
                       <Gavel className="h-6 w-6" /> إدارة هيئة الخبراء
                     </CardTitle>
                  </CardHeader>
                  <CardContent className="p-0">
                    <div className="divide-y divide-border">
                      {consultantsLoading ? (
                        <div className="p-20 flex justify-center"><Loader2 className="animate-spin text-primary" /></div>
                      ) : allConsultants?.map(c => (
                        <div key={c.id} className="flex items-center justify-between p-6 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                           <div className="flex items-center gap-4">
                              <div className="h-12 w-12 rounded-xl bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 flex items-center justify-center"><Gavel className="h-5 w-5" /></div>
                              <div>
                                 <p className="text-sm font-black text-primary">{c.name}</p>
                                 <p className="text-[10px] text-accent font-bold uppercase">{c.specialization}</p>
                              </div>
                           </div>
                           <Button variant="ghost" size="icon" onClick={() => deleteDoc(doc(db!, "consultants", c.id))} className="text-muted-foreground hover:text-red-500 rounded-xl">
                              <Trash2 className="h-4 w-4" />
                           </Button>
                        </div>
                      ))}
                    </div>
                  </CardContent>
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
    <button 
      onClick={onClick} 
      className={`
        flex items-center gap-3 px-6 py-3 rounded-xl text-xs font-black transition-all
        ${active 
          ? 'bg-primary text-white shadow-lg' 
          : 'text-muted-foreground hover:text-primary hover:bg-secondary/50'
        }
      `}
    >
      {icon} {label}
    </button>
  );
}
