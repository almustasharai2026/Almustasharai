"use client";

import { useUser, useFirestore, useCollection } from "@/firebase";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { 
  Users, Gavel, ShieldAlert, Settings, 
  MessageSquare, LayoutDashboard, UserPlus, 
  Trash2, Ban, CheckCircle, Search, Activity
} from "lucide-react";
import { collection, doc, deleteDoc, updateDoc, query, orderBy, addDoc } from "firebase/firestore";
import { useMemoFirebase } from "@/firebase/provider";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";

export default function SupremeAdminHub() {
  const { user } = useUser();
  const db = useFirestore();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState<"users" | "consultants" | "moderation">("users");
  const [newWord, setNewWord] = useState("");

  const usersQuery = useMemoFirebase(() => collection(db!, "users"), [db]);
  const { data: allUsers } = useCollection(usersQuery);

  const consultantsQuery = useMemoFirebase(() => collection(db!, "consultantProfiles"), [db]);
  const { data: consultants } = useCollection(consultantsQuery);

  const wordsQuery = useMemoFirebase(() => collection(db!, "settings", "moderation", "forbiddenWords"), [db]);
  const { data: forbiddenWords } = useCollection(wordsQuery);

  if (user?.email !== "bishoysamy390@gmail.com") {
    return <div className="h-screen flex items-center justify-center text-red-500 font-black">ACCESS DENIED - SOVEREIGN LOCK ACTIVE</div>;
  }

  const handleAction = async (action: () => Promise<void>, msg: string) => {
    try {
      await action();
      toast({ title: "تم تنفيذ العملية", description: msg });
    } catch (e) {
      toast({ variant: "destructive", title: "فشل الإجراء", description: "تأكد من الصلاحيات والاتصال." });
    }
  };

  const addForbiddenWord = () => {
    if (!newWord.trim()) return;
    handleAction(async () => {
      await addDoc(collection(db!, "settings", "moderation", "forbiddenWords"), {
        word: newWord.trim(),
        addedAt: new Date().toISOString()
      });
      setNewWord("");
    }, "تمت إضافة الكلمة لقائمة الحظر.");
  };

  return (
    <div className="min-h-screen bg-[#050505] p-8 md:p-12" dir="rtl">
      <header className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-start md:items-center gap-8 mb-16">
        <div className="space-y-2">
          <h1 className="text-5xl font-black text-white tracking-tighter">غرفة القيادة <span className="text-primary">العليا</span></h1>
          <p className="text-white/30 font-bold">السيطرة المطلقة على الكيان والرقابة السيادية.</p>
        </div>
        <div className="flex gap-3 bg-white/5 p-1.5 rounded-[2rem] border border-white/5">
          <TabBtn active={activeTab === "users"} onClick={() => setActiveTab("users")} icon={<Users />} label="المواطنون" />
          <TabBtn active={activeTab === "consultants"} onClick={() => setActiveTab("consultants")} icon={<Gavel />} label="الخبراء" />
          <TabBtn active={activeTab === "moderation"} onClick={() => setActiveTab("moderation")} icon={<ShieldAlert />} label="الرقابة" />
        </div>
      </header>

      <main className="max-w-7xl mx-auto">
        <AnimatePresence mode="wait">
          {activeTab === "users" && (
            <motion.div key="users" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="space-y-6">
              <div className="grid md:grid-cols-3 gap-6 mb-10">
                 <StatMini label="إجمالي المسجلين" val={allUsers?.length || 0} color="blue" />
                 <StatMini label="المحظورين حالياً" val={allUsers?.filter(u => u.isBanned).length || 0} color="red" />
                 <StatMini label="نشطين الآن" val={8} color="emerald" />
              </div>
              <Card className="glass-cosmic border-none rounded-[3rem] p-10">
                <div className="flex justify-between items-center mb-8">
                   <h3 className="text-2xl font-black text-white">قاعدة بيانات المواطنين</h3>
                   <div className="relative w-64"><Search className="absolute right-4 top-1/2 -translate-y-1/2 h-4 w-4 text-white/20" /><Input className="glass border-white/5 rounded-xl pr-10" placeholder="بحث..." /></div>
                </div>
                <div className="space-y-4">
                  {allUsers?.map(u => (
                    <div key={u.id} className="flex items-center justify-between p-6 glass rounded-3xl border-white/5 hover:bg-white/[0.02] transition-all">
                      <div className="flex items-center gap-6">
                        <div className={`h-12 w-12 rounded-2xl flex items-center justify-center font-black ${u.isBanned ? 'bg-red-500/20 text-red-500' : 'bg-primary/10 text-primary'}`}>{u.fullName.charAt(0)}</div>
                        <div>
                          <p className="font-black text-white">{u.fullName}</p>
                          <p className="text-[10px] text-white/20 font-bold">{u.email}</p>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button variant="ghost" size="sm" onClick={() => handleAction(() => updateDoc(doc(db!, "users", u.id), { isBanned: !u.isBanned }), u.isBanned ? "تم فك الحظر" : "تم الحظر السيادي")} className={u.isBanned ? 'text-emerald-500 hover:bg-emerald-500/10' : 'text-red-500 hover:bg-red-500/10'}>
                          {u.isBanned ? <CheckCircle className="h-4 w-4 ml-2" /> : <Ban className="h-4 w-4 ml-2" />} {u.isBanned ? "فك حظر" : "حظر"}
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => handleAction(() => deleteDoc(doc(db!, "users", u.id)), "تم حذف المستخدم نهائياً")} className="text-white/20 hover:text-red-500 hover:bg-red-500/10">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            </motion.div>
          )}

          {activeTab === "consultants" && (
            <motion.div key="consultants" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="space-y-8">
               <div className="flex justify-between items-center">
                  <h3 className="text-3xl font-black text-white">إدارة هيئة المستشارين</h3>
                  <Button className="btn-primary h-12 px-8 rounded-2xl font-black gap-3"><UserPlus className="h-4 w-4" /> تسجيل مستشار جديد</Button>
               </div>
               <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {consultants?.map(c => (
                    <Card key={c.id} className="glass-cosmic border-none rounded-[4rem] p-8 group relative overflow-hidden">
                       <div className="flex items-center gap-5 mb-6">
                          <div className="h-16 w-16 rounded-[1.5rem] bg-primary/10 flex items-center justify-center text-primary group-hover:scale-110 transition-transform"><Gavel className="h-8 w-8" /></div>
                          <div>
                             <h4 className="font-black text-xl text-white">{c.name}</h4>
                             <Badge className="bg-white/5 text-primary border-none text-[9px] font-black">{c.specialty}</Badge>
                          </div>
                       </div>
                       <p className="text-xs text-white/30 font-medium leading-relaxed mb-8 line-clamp-2">{c.bio}</p>
                       <div className="flex justify-between items-center border-t border-white/5 pt-6">
                          <div className="flex gap-2">
                             <Button variant="ghost" size="icon" className="text-white/20 hover:text-white"><Settings className="h-4 w-4" /></Button>
                             <Button variant="ghost" size="icon" className="text-white/20 hover:text-red-500" onClick={() => handleAction(() => deleteDoc(doc(db!, "consultantProfiles", c.id)), "تم حذف المستشار")}><Trash2 className="h-4 w-4" /></Button>
                          </div>
                          <Badge className="bg-emerald-500/10 text-emerald-500 border-none px-4">{c.hourlyRate} EGP/h</Badge>
                       </div>
                    </Card>
                  ))}
               </div>
            </motion.div>
          )}

          {activeTab === "moderation" && (
            <motion.div key="moderation" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="grid md:grid-cols-2 gap-12">
               <Card className="glass-cosmic border-none rounded-[4rem] p-12">
                  <h3 className="text-2xl font-black text-white mb-8 flex items-center gap-4"><ShieldAlert className="text-red-500" /> الكلمات المحظورة</h3>
                  <div className="flex gap-3 mb-10">
                     <Input value={newWord} onChange={e => setNewWord(e.target.value)} placeholder="أضف كلمة للرقابة..." className="glass border-white/5 h-14 rounded-2xl px-6 font-bold" />
                     <Button onClick={addForbiddenWord} className="h-14 w-14 rounded-2xl bg-red-600 hover:bg-red-700 shadow-xl"><Plus /></Button>
                  </div>
                  <div className="flex flex-wrap gap-3">
                     {forbiddenWords?.map(w => (
                       <Badge key={w.id} className="glass border-white/10 text-white/60 py-3 px-5 rounded-2xl flex items-center gap-3 group">
                          {w.word}
                          <button onClick={() => deleteDoc(doc(db!, "settings", "moderation", "forbiddenWords", w.id))} className="text-white/10 hover:text-red-500"><X className="h-3 w-3" /></button>
                       </Badge>
                     ))}
                  </div>
               </Card>

               <Card className="glass-cosmic border-none rounded-[4rem] p-12 relative overflow-hidden">
                  <div className="absolute top-0 left-0 w-full h-full bg-red-500/[0.02] -z-10" />
                  <h3 className="text-2xl font-black text-white mb-8">سجل الرقابة اللحظي</h3>
                  <div className="space-y-6">
                     <div className="p-6 glass rounded-[2rem] border-red-500/10 flex items-start gap-5">
                        <div className="h-10 w-10 rounded-xl bg-red-500/20 flex items-center justify-center text-red-500 shrink-0"><Activity className="h-5 w-5" /></div>
                        <div>
                           <p className="text-xs text-white/80 font-black">تم رصد انتهاك: "لفظ خارج"</p>
                           <p className="text-[10px] text-white/20 mt-1">المستخدم: محمد علي · منذ دقيقتين</p>
                           <Badge className="bg-red-500/10 text-red-500 border-none mt-3">حظر آلي منفذ ✅</Badge>
                        </div>
                     </div>
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
    <button onClick={onClick} className={`flex items-center gap-3 px-8 py-3 rounded-[1.5rem] text-xs font-black transition-all ${active ? 'bg-primary text-white shadow-xl shadow-primary/20' : 'text-white/30 hover:text-white'}`}>
      <span className={active ? 'scale-110' : ''}>{icon}</span>
      {label}
    </button>
  );
}

function StatMini({ label, val, color }: any) {
  const colors: any = {
    blue: "text-blue-400 bg-blue-500/10",
    red: "text-red-400 bg-red-500/10",
    emerald: "text-emerald-400 bg-emerald-500/10"
  };
  return (
    <div className={`p-8 glass-cosmic rounded-[2.5rem] border-white/5 ${colors[color]}`}>
       <p className="text-[9px] font-black uppercase tracking-widest opacity-40 mb-2">{label}</p>
       <p className="text-4xl font-black tabular-nums">{val}</p>
    </div>
  );
}