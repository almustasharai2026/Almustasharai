
"use client";

import { useUser, useFirestore, useCollection } from "@/firebase";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { 
  Users, Gavel, ShieldAlert, Tag, Activity, Trash2, 
  UserPlus, Plus, Ban, CheckCircle2, History, ShieldCheck, Lock
} from "lucide-react";
import { collection, doc, deleteDoc, addDoc, serverTimestamp } from "firebase/firestore";
import { useMemoFirebase } from "@/firebase/provider";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { motion, AnimatePresence } from "framer-motion";
import { banSovereignUser } from "@/lib/sovereign-moderation";
import { Loading } from "@/components/Loading";

/**
 * غرفة القيادة العليا - النسخة المتقدمة.
 * توفر تحكماً تبويبياً شاملاً في كافة مفاصل المنصة.
 */
export default function MasterAdminPanel() {
  const { user, role } = useUser();
  const db = useFirestore();
  const { toast } = useToast();
  
  const [newBannedWord, setNewBannedWord] = useState("");

  // استعلامات سحابية سيادية
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

  // بروتوكول حماية الحدود: لا يسمح إلا للمالك king2026 بالدخول
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
      toast({ title: "تم تحديث الرقابة", description: "أضيفت الكلمة لدرع الحماية السيادي." });
    } catch (e) {
      toast({ variant: "destructive", title: "فشل التحديث" });
    }
  };

  return (
    <div className="min-h-screen bg-[#020617] p-5 lg:p-10 text-right" dir="rtl">
      <header className="mb-10 flex items-center gap-4">
        <div className="h-12 w-12 rounded-2xl bg-primary flex items-center justify-center shadow-lg shadow-primary/20">
          <ShieldCheck className="h-6 w-6 text-white" />
        </div>
        <div>
          <h1 className="text-2xl font-black text-white tracking-tight">غرفة القيادة العليا</h1>
          <p className="text-[10px] text-primary font-black uppercase tracking-[0.2em]">Master Control Hub | v5.5</p>
        </div>
      </header>

      <Tabs defaultValue="users" className="space-y-8">
        <TabsList className="bg-slate-900/50 border border-white/5 p-1 rounded-2xl h-auto flex flex-wrap gap-1">
          <TabTrigger value="users" icon={<Users className="h-4 w-4" />} label="المواطنون" />
          <TabTrigger value="advisors" icon={<Gavel className="h-4 w-4" />} label="المستشارون" />
          <TabTrigger value="banned" icon={<ShieldAlert className="h-4 w-4" />} label="المحظورات" />
          <TabTrigger value="offers" icon={<Tag className="h-4 w-4" />} label="العروض" />
          <TabTrigger value="logs" icon={<Activity className="h-4 w-4" />} label="سجل الأحداث" />
        </TabsList>

        <TabsContent value="users">
          <Card className="glass-cosmic border-none rounded-[2.5rem] shadow-2xl overflow-hidden">
            <CardHeader className="bg-white/[0.02] border-b border-white/5 p-8 flex flex-row items-center justify-between">
              <CardTitle className="text-xl font-black text-white">إدارة المواطنين الرقميين</CardTitle>
              <Button className="rounded-xl bg-accent hover:bg-emerald-600 gap-2 font-black text-xs">
                <UserPlus className="h-4 w-4" /> إضافة مواطن
              </Button>
            </CardHeader>
            <CardContent className="p-0">
              <div className="divide-y divide-white/5">
                {citizens?.map(citizen => (
                  <div key={citizen.id} className="p-6 flex items-center justify-between hover:bg-white/[0.02] transition-colors">
                    <div className="flex items-center gap-4">
                      <div className={`h-12 w-12 rounded-xl flex items-center justify-center font-black ${citizen.isBanned ? 'bg-red-500/20 text-red-500' : 'bg-primary/10 text-primary'}`}>
                        {citizen.fullName?.charAt(0)}
                      </div>
                      <div>
                        <p className="font-black text-white text-sm">{citizen.fullName}</p>
                        <p className="text-[10px] text-white/30 font-bold uppercase tracking-widest">{citizen.email}</p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="ghost" size="icon" className="text-white/20 hover:text-red-500"><Trash2 className="h-4 w-4" /></Button>
                      <Button 
                        variant={citizen.isBanned ? "destructive" : "outline"}
                        onClick={() => banSovereignUser(db!, citizen.id, !citizen.isBanned)}
                        className="rounded-xl h-9 text-[10px] font-black"
                      >
                        {citizen.isBanned ? "فك الحظر" : <Ban className="h-4 w-4" />}
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="advisors">
          <Card className="glass-cosmic border-none rounded-[2.5rem]">
            <CardHeader className="p-8">
              <CardTitle className="text-xl font-black flex items-center gap-3">هيئة الخبراء المعتمدين <Plus className="h-5 w-5 text-accent cursor-pointer" /></CardTitle>
            </CardHeader>
            <CardContent className="p-8 pt-0">
              <div className="grid md:grid-cols-2 gap-4">
                {experts?.map(exp => (
                  <div key={exp.id} className="p-5 glass rounded-3xl border-white/5 flex items-center justify-between">
                    <div>
                      <p className="font-black text-white">{exp.name}</p>
                      <p className="text-[10px] text-primary font-bold uppercase">{exp.specialization}</p>
                    </div>
                    <Button variant="outline" size="sm" className="rounded-xl border-white/5 text-[9px] font-black uppercase">تعديل الصلاحيات</Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="banned">
          <Card className="glass-cosmic border-none rounded-[2.5rem] p-8">
            <div className="space-y-6">
              <div className="flex gap-2">
                <Input 
                  value={newBannedWord} 
                  onChange={e => setNewBannedWord(e.target.value)}
                  placeholder="أضف كلمة للقائمة السوداء..." 
                  className="glass h-12 rounded-xl text-right font-bold" 
                />
                <Button onClick={handleAddWord} className="h-12 px-8 bg-primary rounded-xl font-black">إدراج</Button>
              </div>
              <div className="flex flex-wrap gap-2 p-6 bg-white/5 rounded-3xl min-h-[100px]">
                {bannedWords?.map(bw => (
                  <Badge key={bw.id} className="bg-slate-800 text-white border-white/10 px-4 py-2 rounded-xl flex items-center gap-2 group">
                    {bw.word}
                    <Trash2 onClick={() => deleteDoc(doc(db!, "system", "moderation", "forbiddenWords", bw.id))} className="h-3 w-3 text-red-500 cursor-pointer opacity-0 group-hover:opacity-100 transition-opacity" />
                  </Badge>
                ))}
              </div>
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="offers">
          <div className="grid gap-4">
            {currentOffers?.map(offer => (
              <Card key={offer.id} className="glass-cosmic border-none rounded-3xl p-6 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="h-12 w-12 bg-accent/10 rounded-2xl flex items-center justify-center text-accent">
                    <Tag className="h-6 w-6" />
                  </div>
                  <div>
                    <p className="font-black text-white">{offer.name}</p>
                    <p className="text-xl font-black text-accent tabular-nums">{offer.price} EGP</p>
                  </div>
                </div>
                <Button variant="ghost" onClick={() => deleteDoc(doc(db!, "system", "offers", offer.id))} className="text-red-500">حذف</Button>
              </Card>
            ))}
            <Button variant="outline" className="border-dashed border-white/10 h-20 rounded-3xl text-white/30 font-black gap-2">
              <Plus className="h-5 w-5" /> إضافة عرض سيادي جديد
            </Button>
          </div>
        </TabsContent>

        <TabsContent value="logs">
          <Card className="bg-slate-900 border-none rounded-[2.5rem] overflow-hidden">
            <div className="p-8 bg-black/40 border-b border-white/5 flex items-center gap-3">
              <History className="h-5 w-5 text-primary" />
              <h3 className="font-black text-white">سجل العمليات السيادي</h3>
            </div>
            <div className="p-6 font-mono text-[10px] text-emerald-500 space-y-2 max-h-[500px] overflow-y-auto scrollbar-hide bg-black/20">
              {sovereignLogs?.map((log, i) => (
                <div key={i} className="flex gap-4 opacity-80 hover:opacity-100 transition-opacity">
                  <span className="text-white/20 shrink-0">[{new Date(log.createdAt?.seconds * 1000).toLocaleTimeString()}]</span>
                  <span className="text-primary shrink-0">PROTOCOL_OK:</span>
                  <span className="break-all">{log.event}: {JSON.stringify(log.data)}</span>
                </div>
              ))}
              {sovereignLogs?.length === 0 && <div className="text-center py-10 text-white/10">لا توجد عمليات مسجلة حالياً...</div>}
            </div>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

function TabTrigger({ value, icon, label }: { value: string; icon: React.ReactNode; label: string }) {
  return (
    <TabsTrigger 
      value={value} 
      className="flex-1 rounded-xl px-6 py-3 text-[10px] font-black uppercase tracking-widest data-[state=active]:bg-primary data-[state=active]:text-white transition-all gap-2"
    >
      {icon} {label}
    </TabsTrigger>
  );
}
