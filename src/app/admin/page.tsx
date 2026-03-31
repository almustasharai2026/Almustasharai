"use client";

import { useUser, useFirestore, useCollection } from "@/firebase";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { 
  Users, Gavel, ShieldAlert, Tag, Activity, Trash2, 
  UserPlus, Plus, Ban, History, ShieldCheck, Lock, Settings
} from "lucide-react";
import { collection, doc, deleteDoc, addDoc, serverTimestamp } from "firebase/firestore";
import { useMemoFirebase } from "@/firebase/provider";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { banSovereignUser } from "@/lib/sovereign-moderation";
import { Loading } from "@/components/Loading";

/**
 * غرفة القيادة العليا - النسخة المتقدمة.
 * تتميز بنظام التبويبات الملونة والأزرار المخصصة للإدارة.
 */
export default function MasterAdminPanel() {
  const { user, role } = useUser();
  const db = useFirestore();
  const { toast } = useToast();
  
  const [newBannedWord, setNewBannedWord] = useState("");

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
      toast({ title: "تم التحديث" });
    } catch (e) {
      toast({ variant: "destructive", title: "فشل التحديث" });
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
            <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">لوحة القيادة العليا</h1>
            <p className="text-[10px] text-[#007bff] font-black uppercase tracking-widest">Advanced Admin Hub</p>
          </div>
        </div>
        <Button variant="outline" className="rounded-xl gap-2 font-black text-xs border-blue-500/20 text-blue-600">
          <Settings className="h-4 w-4" /> الإعدادات
        </Button>
      </header>

      <Tabs defaultValue="users" className="space-y-8">
        <TabsList className="bg-white dark:bg-slate-900 border border-border p-1 rounded-2xl h-auto flex flex-wrap gap-1 shadow-sm">
          <TabTrigger value="users" icon={<Users className="h-4 w-4" />} label="المستخدمون" />
          <TabTrigger value="advisors" icon={<Gavel className="h-4 w-4" />} label="المستشارون" />
          <TabTrigger value="banned" icon={<ShieldAlert className="h-4 w-4" />} label="الكلمات المحظورة" />
          <TabTrigger value="offers" icon={<Tag className="h-4 w-4" />} label="العروض" />
          <TabTrigger value="logs" icon={<Activity className="h-4 w-4" />} label="سجل الأحداث" />
        </TabsList>

        <div className="mt-8">
          <TabsContent value="users">
            <Card className="border-none rounded-3xl shadow-xl overflow-hidden bg-white dark:bg-slate-900">
              <CardHeader className="bg-slate-50 dark:bg-white/[0.02] border-b border-border p-8 flex flex-row items-center justify-between">
                <CardTitle className="text-xl font-black">إدارة المواطنين</CardTitle>
                <Button className="rounded-xl bg-[#17a2b8] hover:bg-[#138496] gap-2 font-black text-xs text-white">
                  <UserPlus className="h-4 w-4" /> إضافة مستخدم
                </Button>
              </CardHeader>
              <CardContent className="p-0">
                <div className="divide-y divide-border">
                  {citizens?.map(citizen => (
                    <div key={citizen.id} className="p-6 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-white/[0.02] transition-colors">
                      <div className="flex items-center gap-4">
                        <div className={`h-12 w-12 rounded-xl flex items-center justify-center font-black ${citizen.isBanned ? 'bg-red-500/20 text-red-500' : 'bg-blue-500/10 text-blue-500'}`}>
                          {citizen.fullName?.charAt(0)}
                        </div>
                        <div>
                          <p className="font-black text-sm">{citizen.fullName}</p>
                          <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest">{citizen.email}</p>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button className="admin-btn bg-red-500 hover:bg-red-600">حذف</Button>
                        <Button 
                          className={`admin-btn ${citizen.isBanned ? 'bg-emerald-500' : 'bg-[#17a2b8]'}`}
                          onClick={() => banSovereignUser(db!, citizen.id, !citizen.isBanned)}
                        >
                          {citizen.isBanned ? "فك الحظر" : "حظر"}
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="advisors">
            <Card className="border-none rounded-3xl shadow-xl bg-white dark:bg-slate-900">
              <CardHeader className="p-8 border-b border-border flex flex-row items-center justify-between">
                <CardTitle className="text-xl font-black">هيئة المستشارين</CardTitle>
                <Button className="admin-btn">إضافة مستشار</Button>
              </CardHeader>
              <CardContent className="p-8 pt-6">
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {experts?.map(exp => (
                    <div key={exp.id} className="p-5 bg-[#f8f9fa] dark:bg-white/5 rounded-2xl border border-border flex flex-col gap-4">
                      <div>
                        <p className="font-black text-lg">{exp.name}</p>
                        <p className="text-[10px] text-[#007bff] font-black uppercase">{exp.specialization}</p>
                      </div>
                      <div className="flex gap-2">
                         <Button className="admin-btn flex-1 !m-0">تعديل</Button>
                         <Button className="admin-btn bg-red-500 flex-1 !m-0">حذف</Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="banned">
            <Card className="border-none rounded-3xl shadow-xl p-8 bg-white dark:bg-slate-900">
              <div className="space-y-6">
                <div className="flex gap-2">
                  <Input 
                    value={newBannedWord} 
                    onChange={e => setNewBannedWord(e.target.value)}
                    placeholder="أدخل كلمة محظورة..." 
                    className="h-12 rounded-xl text-right font-bold bg-[#f8f9fa] dark:bg-white/5" 
                  />
                  <Button onClick={handleAddWord} className="h-12 px-8 bg-[#007bff] rounded-xl font-black text-white">إضافة</Button>
                </div>
                <div className="flex flex-wrap gap-2 p-6 bg-[#f8f9fa] dark:bg-white/5 rounded-2xl min-h-[150px]">
                  {bannedWords?.map(bw => (
                    <div key={bw.id} className="bg-white dark:bg-slate-800 border border-border px-4 py-2 rounded-xl flex items-center gap-3 group shadow-sm">
                      <span className="font-bold text-sm">{bw.word}</span>
                      <button onClick={() => deleteDoc(doc(db!, "system", "moderation", "forbiddenWords", bw.id))} className="text-red-500 hover:scale-110 transition-transform">
                        <Trash2 className="h-3 w-3" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </Card>
          </TabsContent>

          <TabsContent value="offers">
            <div className="grid md:grid-cols-2 gap-6">
              {currentOffers?.map(offer => (
                <Card key={offer.id} className="border-none rounded-3xl p-6 bg-white dark:bg-slate-900 shadow-xl flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="h-14 w-14 bg-blue-500/10 rounded-2xl flex items-center justify-center text-[#007bff]">
                      <Tag className="h-7 w-7" />
                    </div>
                    <div>
                      <p className="font-black text-xl">{offer.name}</p>
                      <p className="text-2xl font-black text-emerald-500 tabular-nums">{offer.price} EGP</p>
                    </div>
                  </div>
                  <Button className="admin-btn bg-red-500 hover:bg-red-600" onClick={() => deleteDoc(doc(db!, "system", "offers", offer.id))}>حذف</Button>
                </Card>
              ))}
              <Button variant="outline" className="border-dashed border-primary/20 h-32 rounded-3xl text-primary/40 font-black gap-2 hover:bg-primary/5 text-lg">
                <Plus className="h-6 w-6" /> إضافة عرض جديد
              </Button>
            </div>
          </TabsContent>

          <TabsContent value="logs">
            <Card className="border-none rounded-3xl overflow-hidden bg-slate-900 shadow-2xl">
              <div className="p-8 bg-black/40 border-b border-white/5 flex items-center gap-3">
                <Activity className="h-5 w-5 text-blue-400" />
                <h3 className="font-black text-white">سجل العمليات السيادي</h3>
              </div>
              <div className="p-6 font-mono text-[11px] text-emerald-400 space-y-2 max-h-[450px] overflow-y-auto scrollbar-hide bg-black/20">
                {sovereignLogs?.map((log, i) => (
                  <div key={i} className="flex gap-4 opacity-80 hover:opacity-100 transition-opacity border-b border-white/5 pb-2">
                    <span className="text-white/20 shrink-0">[{new Date(log.createdAt?.seconds * 1000).toLocaleTimeString()}]</span>
                    <span className="text-blue-400 shrink-0 uppercase font-black">LOG:</span>
                    <span className="break-all">{log.event}: {JSON.stringify(log.data)}</span>
                  </div>
                ))}
                {sovereignLogs?.length === 0 && <div className="text-center py-10 text-white/10">لا توجد سجلات حديثة...</div>}
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
      className="flex-1 rounded-xl px-6 py-3.5 text-[11px] font-black uppercase tracking-widest data-[state=active]:bg-[#007bff] data-[state=active]:text-white transition-all gap-2"
    >
      {icon} {label}
    </TabsTrigger>
  );
}