
"use client";

import { useUser, useFirestore, useCollection, useDoc } from "@/firebase";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { 
  Users, Gavel, ShieldAlert, Trash2, Terminal, Wallet, X, CreditCard, Lock, Plus, Activity, Loader2, ShieldCheck, Settings, Home, Tag
} from "lucide-react";
import { collection, doc, deleteDoc, updateDoc, addDoc, query, orderBy, increment, setDoc } from "firebase/firestore";
import { useMemoFirebase } from "@/firebase/provider";
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { motion, AnimatePresence } from "framer-motion";
import SovereignButton from "@/components/SovereignButton";
import { banSovereignUser } from "@/lib/sovereign-moderation";

type AdminTab = "users" | "finance" | "moderation" | "system";

export default function MasterCommandPanel() {
  const { user } = useUser();
  const db = useFirestore();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState<AdminTab>("users");
  
  // States for dynamic config
  const [homeTitle, setHomeTitle] = useState("");
  const [homeSubtitle, setHomeSubtitle] = useState("");
  const [newWord, setNewWord] = useState("");
  const [chargeAmount, setChargeAmount] = useState<number>(0);
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);

  // Firestore Queries
  const usersQuery = useMemoFirebase(() => db ? collection(db, "users") : null, [db]);
  const { data: allUsers, isLoading: usersLoading } = useCollection(usersQuery);

  const wordsQuery = useMemoFirebase(() => db ? collection(db, "system", "moderation", "forbiddenWords") : null, [db]);
  const { data: forbiddenWords } = useCollection(wordsQuery);

  const settingsRef = useMemoFirebase(() => db ? doc(db, "system", "settings") : null, [db]);
  const { data: currentSettings } = useDoc(settingsRef);

  const offersQuery = useMemoFirebase(() => db ? collection(db, "system", "offers") : null, [db]);
  const { data: allOffers } = useCollection(offersQuery);

  useEffect(() => {
    if (currentSettings) {
      setHomeTitle(currentSettings.homeTitle || "");
      setHomeSubtitle(currentSettings.homeSubtitle || "");
    }
  }, [currentSettings]);

  if (user?.email !== "bishoysamy390@gmail.com") {
    return (
      <div className="h-screen flex flex-col items-center justify-center bg-slate-950 text-red-500 font-black gap-8">
        <Lock className="h-24 w-24 animate-pulse" />
        <h1 className="text-3xl uppercase tracking-[0.3em] text-center px-10">Sovereign Access Denied</h1>
      </div>
    );
  }

  const handleUpdateSettings = async () => {
    if (!db) return;
    try {
      await setDoc(doc(db, "system", "settings"), {
        homeTitle,
        homeSubtitle,
        updatedAt: new Date().toISOString()
      }, { merge: true });
      toast({ title: "تم تحديث النظام", description: "تم تعديل نصوص الواجهة بنجاح." });
    } catch (e) {
      toast({ variant: "destructive", title: "فشل التحديث السيادي" });
    }
  };

  const handleAddBalance = async (userId: string) => {
    if (chargeAmount <= 0 || !db) return;
    try {
      await updateDoc(doc(db, "users", userId), { balance: increment(chargeAmount) });
      toast({ title: "تم تحديث الرصيد", description: `تمت إضافة ${chargeAmount} EGP للمواطن.` });
      setChargeAmount(0);
      setSelectedUserId(null);
    } catch (e) {
      toast({ variant: "destructive", title: "فشل الإجراء المالي" });
    }
  };

  const handleBanToggle = (userId: string, currentStatus: boolean) => {
    if (!db) return;
    banSovereignUser(db, userId, !currentStatus);
    toast({ title: currentStatus ? "تم فك الحظر" : "تم الحظر السيادي بنجاح" });
  };

  const handleAddForbiddenWord = async () => {
    if (!newWord.trim() || !db) return;
    try {
      await addDoc(collection(db, "system", "moderation", "forbiddenWords"), {
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
      <header className="max-w-5xl mx-auto mb-12">
        <div className="flex items-center gap-6 mb-8">
           <div className="h-16 w-16 rounded-2xl bg-primary flex items-center justify-center shadow-xl border border-white/10">
              <Terminal className="h-8 w-8 text-white" />
           </div>
           <div>
              <h1 className="text-3xl font-black text-primary tracking-tighter">غرفة القيادة <span className="text-accent">العليا</span></h1>
              <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest">Master Console v5.0 | king2026</p>
           </div>
        </div>
        
        <div className="flex flex-wrap gap-2 bg-white dark:bg-slate-900 p-2 rounded-2xl border border-border/50 shadow-sm">
          <TabBtn active={activeTab === "users"} onClick={() => setActiveTab("users")} icon={<Users className="h-4 w-4" />} label="المواطنون" />
          <TabBtn active={activeTab === "finance"} onClick={() => setActiveTab("finance")} icon={<Wallet className="h-4 w-4" />} label="المالية" />
          <TabBtn active={activeTab === "system"} onClick={() => setActiveTab("system")} icon={<Settings className="h-4 w-4" />} label="إعدادات النظام" />
          <TabBtn active={activeTab === "moderation"} onClick={() => setActiveTab("moderation")} icon={<ShieldAlert className="h-4 w-4" />} label="الرقابة" />
        </div>
      </header>

      <main className="max-w-5xl mx-auto space-y-10">
        <AnimatePresence mode="wait">
          {activeTab === "users" && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
               <Card className="border-none rounded-[2rem] shadow-xl overflow-hidden">
                  <CardHeader className="bg-primary text-white p-8">
                     <CardTitle className="text-xl font-black flex items-center gap-3">
                       <Users className="h-6 w-6" /> إدارة المواطنين
                     </CardTitle>
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
                           <Button 
                             variant={u.isBanned ? "destructive" : "outline"} 
                             onClick={() => handleBanToggle(u.id, u.isBanned)}
                             className="rounded-xl h-10 px-4 text-[10px] font-black uppercase"
                           >
                             {u.isBanned ? "فك الحظر" : "حظر سيادي"}
                           </Button>
                        </div>
                      ))}
                    </div>
                  </CardContent>
               </Card>
            </motion.div>
          )}

          {activeTab === "system" && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
               <Card className="border-none rounded-[2rem] shadow-xl overflow-hidden">
                  <CardHeader className="bg-slate-900 text-white p-8">
                     <CardTitle className="text-xl font-black flex items-center gap-3">
                       <Home className="h-6 w-6 text-accent" /> تخصيص الواجهة والعروض
                     </CardTitle>
                  </CardHeader>
                  <CardContent className="p-8 space-y-8">
                    <div className="space-y-4">
                      <div className="grid gap-2">
                        <label className="text-xs font-black text-muted-foreground uppercase px-2">عنوان الصفحة الرئيسية</label>
                        <Input value={homeTitle} onChange={e => setHomeTitle(e.target.value)} className="h-12 rounded-xl" />
                      </div>
                      <div className="grid gap-2">
                        <label className="text-xs font-black text-muted-foreground uppercase px-2">الوصف الفرعي</label>
                        <Textarea value={homeSubtitle} onChange={e => setHomeSubtitle(e.target.value)} className="rounded-xl min-h-[100px]" />
                      </div>
                      <SovereignButton text="حفظ إعدادات الواجهة" onClick={handleUpdateSettings} />
                    </div>

                    <div className="pt-8 border-t border-border">
                       <h3 className="text-lg font-black mb-4 flex items-center gap-2"><Tag className="h-5 w-5 text-accent" /> باقات الأسعار النشطة</h3>
                       <div className="grid gap-4">
                          {allOffers?.map(offer => (
                            <div key={offer.id} className="p-4 bg-secondary/30 rounded-2xl border border-border/50 flex justify-between items-center">
                               <div>
                                  <p className="font-black text-primary text-sm">{offer.name}</p>
                                  <p className="text-[10px] text-muted-foreground">{offer.price} EGP / {offer.minutes} min</p>
                               </div>
                               <Button variant="ghost" size="icon" onClick={() => deleteDoc(doc(db!, "system", "offers", offer.id))} className="text-red-500">
                                  <Trash2 className="h-4 w-4" />
                               </Button>
                            </div>
                          ))}
                          <Button variant="outline" className="rounded-xl border-dashed h-12 text-xs font-bold gap-2">
                             <Plus className="h-4 w-4" /> إضافة باقة جديدة (تجريبي)
                          </Button>
                       </div>
                    </div>
                  </CardContent>
               </Card>
            </motion.div>
          )}

          {activeTab === "moderation" && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
               <Card className="border-none rounded-[2rem] shadow-xl overflow-hidden">
                  <CardHeader className="bg-slate-900 text-white p-8">
                     <CardTitle className="text-xl font-black flex items-center gap-3">
                       <ShieldAlert className="h-6 w-6 text-accent" /> إدارة القائمة السوداء
                     </CardTitle>
                  </CardHeader>
                  <CardContent className="p-8 space-y-6">
                    <div className="flex gap-2">
                      <Input 
                        placeholder="أضف كلمة محظورة..." 
                        value={newWord}
                        onChange={(e) => setNewWord(e.target.value)}
                        className="h-12 rounded-xl flex-1"
                      />
                      <Button onClick={handleAddForbiddenWord} className="h-12 px-6 rounded-xl bg-accent text-white font-black">إضافة</Button>
                    </div>
                    <div className="flex flex-wrap gap-2 p-4 bg-secondary/30 rounded-2xl">
                      {forbiddenWords?.map(fw => (
                        <Badge key={fw.id} className="bg-white dark:bg-slate-800 text-primary border border-border px-3 py-1.5 rounded-lg flex items-center gap-2 group transition-all">
                          {fw.word}
                          <button onClick={() => deleteDoc(doc(db!, "system", "moderation", "forbiddenWords", fw.id))} className="text-red-500 opacity-0 group-hover:opacity-100 transition-opacity">
                            <X className="h-3 w-3" />
                          </button>
                        </Badge>
                      ))}
                    </div>
                  </CardContent>
               </Card>
            </motion.div>
          )}

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
                      <select 
                        className="w-full h-12 bg-secondary/30 rounded-xl px-4 text-sm font-bold outline-none border border-border/50"
                        onChange={(e) => setSelectedUserId(e.target.value)}
                        value={selectedUserId || ""}
                      >
                        <option value="">-- اختر المواطن --</option>
                        {allUsers?.map(u => (
                          <option key={u.id} value={u.id}>{u.fullName} ({u.balance} EGP)</option>
                        ))}
                      </select>
                      <Input 
                        type="number" 
                        placeholder="المبلغ المراد شحنه..."
                        value={chargeAmount} 
                        onChange={(e) => setChargeAmount(Number(e.target.value))}
                        className="h-12 rounded-xl text-lg font-black text-center"
                      />
                    </div>
                    <SovereignButton 
                      text="تفعيل الشحن المالي" 
                      onClick={() => selectedUserId && handleAddBalance(selectedUserId)}
                      disabled={!selectedUserId || chargeAmount <= 0}
                    />
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
    <button onClick={onClick} className={`flex items-center gap-3 px-6 py-3 rounded-xl text-xs font-black transition-all ${active ? 'bg-primary text-white shadow-lg' : 'text-muted-foreground hover:text-primary hover:bg-secondary/50'}`}>
      {icon} {label}
    </button>
  );
}
