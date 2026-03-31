
"use client";

import { useUser, useFirestore, useCollection } from "@/firebase";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { 
  Users, Gavel, ShieldAlert, Tag, Activity, Trash2, 
  UserPlus, Plus, Ban, History, ShieldCheck, Lock, Settings,
  Database, AlertTriangle, Briefcase
} from "lucide-react";
import { collection, doc, deleteDoc, addDoc, serverTimestamp } from "firebase/firestore";
import { useMemoFirebase } from "@/firebase/provider";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { banSovereignUser } from "@/lib/sovereign-moderation";
import { Loading } from "@/components/Loading";

/**
 * غرفة القيادة العليا - النسخة المتقدمة.
 * تضم منطق التبويبات المتخصص والإجراءات الإدارية المباشرة.
 */
export default function MasterAdminPanel() {
  const { user, role } = useUser();
  const db = useFirestore();
  const { toast } = useToast();
  
  const [newBannedWord, setNewBannedWord] = useState("");
  const [activeTab, setActiveTab] = useState("users");

  const usersQuery = useMemoFirebase(() => db ? collection(db, "users") : null, [db]);
  const { data: citizens, isLoading: usersLoading } = useCollection(usersQuery);

  const consultantsQuery = useMemoFirebase(() => db ? collection(db, "consultants") : null, [db]);
  const { data: experts } = useCollection(consultantsQuery);

  const wordsQuery = useMemoFirebase(() => db ? collection(db, "system", "moderation", "forbiddenWords") : null, [db]);
  const { data: bannedWords } = useCollection(wordsQuery);

  const offersQuery = useMemoFirebase(() => db ? collection(db, "system", "offers") : null, [db]);
  const { data: currentOffers } = useCollection(offersQuery);

  const logsQuery = useMemoFirebase(() => db ? collection(db, "analytics") : null, [db]);
  const { data: sovereignLogs } = useCollection(logsQuery);

  if (user?.email !== "bishoysamy390@gmail.com") {
    return (
      <div className="h-screen flex flex-col items-center justify-center bg-slate-950 text-red-500 font-black gap-8">
        <Lock className="h-24 w-24 animate-pulse" />
        <h1 className="text-3xl uppercase tracking-[0.3em] text-center px-10">Access Denied: Sovereign Lock</h1>
      </div>
    );
  }

  const handleAddWord = async () => {
    if (!newBannedWord.trim() || !db) return;
    try {
      await addDoc(collection(db, "system", "moderation", "forbiddenWords"), {
        word: newBannedWord.trim(),
        addedAt: serverTimestamp()
      });
      setNewBannedWord("");
      toast({ title: "تم تحديث القائمة السوداء" });
    } catch (e) {
      toast({ variant: "destructive", title: "فشل التحديث" });
    }
  };

  const deleteSovereignUser = async (id: string) => {
    if (!confirm("هل أنت متأكد من حذف هذا المواطن نهائياً؟")) return;
    try {
      await deleteDoc(doc(db!, "users", id));
      toast({ title: "تم الحذف النهائي" });
    } catch (e) {
      toast({ variant: "destructive", title: "فشل الحذف" });
    }
  };

  return (
    <div className="min-h-screen bg-[#f0f2f5] dark:bg-[#020617] p-5 lg:p-10 text-right" dir="rtl">
      <header className="mb-10 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="h-12 w-12 rounded-2xl bg-[#007bff] flex items-center justify-center shadow-lg shadow-blue-500/20">
            <ShieldCheck className="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">غرفة القيادة العليا</h1>
            <p className="text-[10px] text-[#007bff] font-black uppercase tracking-widest">Master Control Hub v2.0</p>
          </div>
        </div>
        <div className="flex gap-2">
           <Button variant="outline" className="rounded-xl gap-2 font-black text-xs border-blue-500/20 text-blue-600 bg-white dark:bg-slate-900">
             <Database className="h-4 w-4" /> النسخ الاحتياطي
           </Button>
           <Button variant="outline" className="rounded-xl gap-2 font-black text-xs border-amber-500/20 text-amber-600 bg-white dark:bg-slate-900">
             <Settings className="h-4 w-4" /> الإعدادات
           </Button>
        </div>
      </header>

      <Tabs defaultValue="users" className="space-y-8" onValueChange={setActiveTab}>
        <TabsList className="bg-white dark:bg-slate-900 border border-border p-1.5 rounded-[1.5rem] h-auto flex flex-wrap gap-1 shadow-sm overflow-hidden">
          <TabTrigger value="users" icon={<Users className="h-4 w-4" />} label="المواطنون" />
          <TabTrigger value="advisors" icon={<Gavel className="h-4 w-4" />} label="الهيئة" />
          <TabTrigger value="banned" icon={<ShieldAlert className="h-4 w-4" />} label="الرقابة" />
          <TabTrigger value="offers" icon={<Tag className="h-4 w-4" />} label="العروض" />
          <TabTrigger value="logs" icon={<Activity className="h-4 w-4" />} label="سجل الأحداث" />
        </TabsList>

        <div className="mt-8">
          <TabsContent value="users">
            <Card className="border-none rounded-3xl shadow-xl overflow-hidden bg-white dark:bg-slate-900">
              <CardHeader className="bg-slate-50 dark:bg-white/[0.02] border-b border-border p-8 flex flex-row items-center justify-between">
                <div>
                  <CardTitle className="text-xl font-black">إدارة المواطنين</CardTitle>
                  <p className="text-xs text-muted-foreground mt-1">التحكم في الهويات والرتب الرقمية</p>
                </div>
                <Button className="rounded-xl bg-[#17a2b8] hover:bg-[#138496] gap-2 font-black text-xs text-white shadow-lg">
                  <UserPlus className="h-4 w-4" /> إضافة مستخدم
                </Button>
              </CardHeader>
              <CardContent className="p-0">
                <div className="divide-y divide-border">
                  {citizens?.map(citizen => (
                    <div key={citizen.id} className="p-6 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-white/[0.02] transition-colors group">
                      <div className="flex items-center gap-4">
                        <div className={`h-14 w-14 rounded-2xl flex items-center justify-center font-black text-xl transition-transform group-hover:scale-110 ${citizen.isBanned ? 'bg-red-500/20 text-red-500' : 'bg-blue-500/10 text-blue-500'}`}>
                          {citizen.fullName?.charAt(0)}
                        </div>
                        <div>
                          <p className="font-black text-sm">{citizen.fullName}</p>
                          <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest">{citizen.email}</p>
                          <p className="text-[9px] text-primary font-black mt-1 uppercase">Balance: {citizen.balance} EGP</p>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button 
                          variant="ghost"
                          className="h-10 w-10 p-0 text-red-500 hover:bg-red-500/10 rounded-xl"
                          onClick={() => deleteSovereignUser(citizen.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                        <Button 
                          className={`rounded-xl px-6 font-black text-[10px] uppercase tracking-widest shadow-md transition-all ${citizen.isBanned ? 'bg-emerald-500 hover:bg-emerald-600' : 'bg-red-500 hover:bg-red-600'}`}
                          onClick={() => banSovereignUser(db!, citizen.id, !citizen.isBanned)}
                        >
                          {citizen.isBanned ? "فك الحظر" : "حظر سيادي"}
                        </Button>
                      </div>
                    </div>
                  ))}
                  {citizens?.length === 0 && <div className="py-20 text-center text-muted-foreground/40 font-black">لا يوجد مواطنون مسجلون حالياً</div>}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="advisors">
            <Card className="border-none rounded-3xl shadow-xl bg-white dark:bg-slate-900">
              <CardHeader className="p-8 border-b border-border flex flex-row items-center justify-between">
                <CardTitle className="text-xl font-black">هيئة المستشارين</CardTitle>
                <Button className="rounded-xl bg-primary text-white font-black text-xs gap-2">
                  <Plus className="h-4 w-4" /> إضافة مستشار
                </Button>
              </CardHeader>
              <CardContent className="p-8 pt-6">
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {experts?.map(exp => (
                    <div key={exp.id} className="p-6 bg-[#f8f9fa] dark:bg-white/5 rounded-[2rem] border border-border flex flex-col gap-6 group hover:border-primary/20 transition-all">
                      <div className="flex items-center gap-4">
                        <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary font-black">
                          <Briefcase className="h-5 w-5" />
                        </div>
                        <div>
                          <p className="font-black text-lg">{exp.name}</p>
                          <p className="text-[10px] text-[#007bff] font-black uppercase tracking-tighter">{exp.specialization}</p>
                        </div>
                      </div>
                      <div className="flex gap-2">
                         <Button variant="secondary" className="flex-1 rounded-xl text-[10px] font-black uppercase">تعديل</Button>
                         <Button variant="ghost" className="flex-1 rounded-xl text-[10px] font-black text-red-500 hover:bg-red-500/10 uppercase">استبعاد</Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="banned">
            <Card className="border-none rounded-3xl shadow-xl p-8 bg-white dark:bg-slate-900">
              <div className="space-y-8">
                <div className="flex flex-col gap-2">
                  <h3 className="font-black text-lg">محرك الرقابة اللحظي</h3>
                  <p className="text-xs text-muted-foreground font-medium">الكلمات التي سيقوم النظام بحظر مستخدمها آلياً عند رصدها.</p>
                </div>
                <div className="flex gap-3">
                  <Input 
                    value={newBannedWord} 
                    onChange={e => setNewBannedWord(e.target.value)}
                    placeholder="أدخل كلمة محظورة جديدة..." 
                    className="h-14 rounded-2xl text-right font-bold bg-[#f8f9fa] dark:bg-white/5 border-none shadow-inner" 
                  />
                  <Button onClick={handleAddWord} className="h-14 px-10 bg-[#007bff] rounded-2xl font-black text-white shadow-lg shadow-blue-500/20">إضافة للدرع</Button>
                </div>
                <div className="flex flex-wrap gap-3 p-8 bg-[#f8f9fa] dark:bg-white/5 rounded-[2.5rem] min-h-[200px] border border-dashed border-border">
                  {bannedWords?.map(bw => (
                    <div key={bw.id} className="bg-white dark:bg-slate-800 border border-border px-5 py-2.5 rounded-2xl flex items-center gap-4 group shadow-sm hover:scale-105 transition-transform">
                      <span className="font-black text-sm text-slate-700 dark:text-slate-200">{bw.word}</span>
                      <button onClick={() => deleteDoc(doc(db!, "system", "moderation", "forbiddenWords", bw.id))} className="text-red-500/40 hover:text-red-500 transition-colors">
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                  {bannedWords?.length === 0 && <div className="w-full flex items-center justify-center opacity-10"><AlertTriangle className="h-12 w-12" /></div>}
                </div>
              </div>
            </Card>
          </TabsContent>

          <TabsContent value="offers">
            <div className="grid md:grid-cols-2 gap-8">
              {currentOffers?.map(offer => (
                <Card key={offer.id} className="border-none rounded-[3rem] p-8 bg-white dark:bg-slate-900 shadow-xl flex items-center justify-between group hover:shadow-2xl transition-all">
                  <div className="flex items-center gap-6">
                    <div className="h-16 w-16 bg-blue-500/10 rounded-[1.5rem] flex items-center justify-center text-[#007bff] shadow-inner group-hover:scale-110 transition-transform">
                      <Tag className="h-8 w-8" />
                    </div>
                    <div>
                      <p className="font-black text-2xl">{offer.name}</p>
                      <p className="text-3xl font-black text-emerald-500 tabular-nums mt-1">{offer.price} <span className="text-xs text-muted-foreground uppercase">EGP</span></p>
                    </div>
                  </div>
                  <Button variant="ghost" className="h-12 w-12 rounded-2xl text-red-500/20 hover:text-red-500 hover:bg-red-500/10 transition-all" onClick={() => deleteDoc(doc(db!, "system", "offers", offer.id))}>
                    <Trash2 className="h-5 w-5" />
                  </Button>
                </Card>
              ))}
              <button className="border-2 border-dashed border-primary/20 h-40 rounded-[3rem] text-primary/40 font-black gap-3 hover:bg-primary/5 hover:border-primary/40 transition-all flex items-center justify-center text-xl group">
                <Plus className="h-8 w-8 group-hover:rotate-90 transition-transform" /> إنشاء باقة سيادية
              </button>
            </div>
          </TabsContent>

          <TabsContent value="logs">
            <Card className="border-none rounded-[3rem] overflow-hidden bg-slate-950 shadow-2xl">
              <div className="p-10 bg-white/[0.02] border-b border-white/5 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <Activity className="h-6 w-6 text-blue-400" />
                  <div>
                    <h3 className="font-black text-xl text-white tracking-tight">سجل العمليات السيادي</h3>
                    <p className="text-[10px] text-white/30 font-bold uppercase tracking-widest mt-1">Real-time System Audit</p>
                  </div>
                </div>
                <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
              </div>
              <div className="p-8 font-mono text-[11px] text-emerald-400/80 space-y-3 max-h-[500px] overflow-y-auto scrollbar-hide bg-black/40">
                {sovereignLogs?.map((log, i) => (
                  <div key={i} className="flex gap-6 opacity-70 hover:opacity-100 transition-opacity border-b border-white/5 pb-3 group">
                    <span className="text-white/10 shrink-0 font-bold">[{new Date(log.createdAt?.seconds * 1000).toLocaleTimeString()}]</span>
                    <span className="text-blue-500 shrink-0 uppercase font-black tracking-tighter">Event:</span>
                    <span className="break-all leading-relaxed"><strong className="text-white">{log.event}</strong> — {JSON.stringify(log.data)}</span>
                  </div>
                ))}
                {sovereignLogs?.length === 0 && <div className="text-center py-20 text-white/5 font-black uppercase tracking-[0.5em]">No activity detected</div>}
              </div>
            </Card>
          </TabsContent>
        </div>
      </Tabs>
    </div>
  );
}

function TabTrigger({ value, icon, label }: { value: string; icon: React.ReactNode; label: string }) {
  return (
    <TabsTrigger 
      value={value} 
      className="flex-1 rounded-[1.2rem] px-6 py-4 text-[11px] font-black uppercase tracking-widest data-[state=active]:bg-[#007bff] data-[state=active]:text-white data-[state=active]:shadow-xl transition-all gap-3"
    >
      <span className="scale-110">{icon}</span> {label}
    </TabsTrigger>
  );
}
