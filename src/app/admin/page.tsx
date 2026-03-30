"use client";

import { useUser, useFirestore, useCollection } from "@/firebase";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { 
  Users, Gavel, ShieldAlert, Settings, 
  Trash2, Ban, CheckCircle, Search, Activity, UserPlus, X, Plus
} from "lucide-react";
import { collection, doc, deleteDoc, updateDoc, addDoc } from "firebase/firestore";
import { useMemoFirebase } from "@/firebase/provider";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
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
    return <div className="h-screen flex items-center justify-center text-red-500 font-black tracking-widest uppercase bg-black">Access Denied - Sovereign Lock Active</div>;
  }

  const handleAction = async (action: () => Promise<void>, msg: string) => {
    try {
      await action();
      toast({ title: "تم الإجراء بنجاح", description: msg });
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
    <div className="min-h-screen bg-[#020617] p-12" dir="rtl">
      <header className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-start md:items-center gap-12 mb-20">
        <div className="space-y-3">
          <h1 className="text-6xl font-black text-white tracking-tighter">غرفة القيادة <span className="text-primary">العليا</span></h1>
          <p className="text-white/30 text-xl font-bold">السيطرة السيادية المطلقة على كافة أنظمة الكيان.</p>
        </div>
        <div className="flex gap-2 bg-white/5 p-2 rounded-[2.5rem] border border-white/10 backdrop-blur-xl shadow-2xl">
          <TabBtn active={activeTab === "users"} onClick={() => setActiveTab("users")} icon={<Users className="h-4 w-4" />} label="المواطنون" />
          <TabBtn active={activeTab === "consultants"} onClick={() => setActiveTab("consultants")} icon={<Gavel className="h-4 w-4" />} label="هيئة الخبراء" />
          <TabBtn active={activeTab === "moderation"} onClick={() => setActiveTab("moderation")} icon={<ShieldAlert className="h-4 w-4" />} label="جهاز الرقابة" />
        </div>
      </header>

      <main className="max-w-7xl mx-auto">
        <AnimatePresence mode="wait">
          {activeTab === "users" && (
            <motion.div key="users" initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -30 }} className="space-y-10">
              <div className="grid md:grid-cols-3 gap-8">
                 <StatMini label="المواطنون المسجلون" val={allUsers?.length || 0} color="blue" />
                 <StatMini label="الحسابات المحظورة" val={allUsers?.filter(u => u.isBanned).length || 0} color="red" />
                 <StatMini label="العمليات الحالية" val={12} color="emerald" />
              </div>
              <Card className="glass-cosmic border-none rounded-[4rem] p-14 shadow-2xl">
                <div className="flex justify-between items-center mb-12">
                   <h3 className="text-3xl font-black text-white">قاعدة بيانات المواطنين</h3>
                   <div className="relative w-80 group">
                     <Search className="absolute right-5 top-1/2 -translate-y-1/2 h-5 w-5 text-white/20 group-focus-within:text-primary transition-colors" />
                     <Input className="glass border-white/5 h-14 rounded-2xl pr-14 text-lg font-bold" placeholder="بحث سيادي..." />
                   </div>
                </div>
                <div className="space-y-4">
                  {allUsers?.map(u => (
                    <div key={u.id} className="flex items-center justify-between p-8 glass rounded-[2.5rem] border-white/5 hover:bg-white/[0.03] transition-all group">
                      <div className="flex items-center gap-8">
                        <div className={`h-16 w-16 rounded-2xl flex items-center justify-center text-xl font-black shadow-xl ${u.isBanned ? 'bg-red-500/20 text-red-500' : 'bg-primary/10 text-primary'}`}>{u.fullName.charAt(0)}</div>
                        <div className="space-y-1">
                          <p className="font-black text-2xl text-white">{u.fullName}</p>
                          <p className="text-xs text-white/20 font-bold uppercase tracking-widest">{u.email}</p>
                        </div>
                      </div>
                      <div className="flex gap-4">
                        <Button variant="ghost" className={`h-12 px-8 rounded-2xl font-black text-xs transition-all ${u.isBanned ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20' : 'bg-red-500/10 text-red-500 border border-red-500/20'}`} onClick={() => handleAction(() => updateDoc(doc(db!, "users", u.id), { isBanned: !u.isBanned }), u.isBanned ? "تم فك الحظر" : "تم الحظر")}>
                          {u.isBanned ? <CheckCircle className="h-4 w-4 ml-3" /> : <Ban className="h-4 w-4 ml-3" />} {u.isBanned ? "إلغاء الحظر" : "حظر سيادي"}
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => handleAction(() => deleteDoc(doc(db!, "users", u.id)), "تم الحذف نهائياً")} className="h-12 w-12 rounded-2xl text-white/10 hover:text-red-500 hover:bg-red-500/10 transition-colors">
                          <Trash2 className="h-5 w-5" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            </motion.div>
          )}

          {activeTab === "consultants" && (
            <motion.div key="consultants" initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -30 }} className="space-y-12">
               <div className="flex justify-between items-center">
                  <h3 className="text-4xl font-black text-white">إدارة هيئة الخبراء</h3>
                  <Button className="btn-primary h-16 px-10 rounded-[2rem] font-black gap-4 text-lg shadow-2xl"><UserPlus className="h-6 w-6" /> تسجيل خبير جديد</Button>
               </div>
               <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-10">
                  {consultants?.map(c => (
                    <Card key={c.id} className="glass-cosmic border-none rounded-[4rem] p-10 group relative overflow-hidden shadow-2xl">
                       <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 blur-3xl -z-10 group-hover:bg-primary/10 transition-all" />
                       <div className="flex items-center gap-6 mb-8">
                          <div className="h-20 w-20 rounded-[2rem] bg-primary/10 flex items-center justify-center text-primary group-hover:scale-110 transition-transform border border-primary/20 shadow-inner"><Gavel className="h-10 w-10" /></div>
                          <div className="space-y-2">
                             <h4 className="font-black text-2xl text-white">{c.name}</h4>
                             <Badge className="bg-white/5 text-primary border-none text-[9px] font-black uppercase tracking-tighter px-4 py-1 rounded-full">{c.specialty}</Badge>
                          </div>
                       </div>
                       <p className="text-sm text-white/30 font-bold leading-relaxed mb-10 line-clamp-2">{c.bio}</p>
                       <div className="flex justify-between items-center border-t border-white/5 pt-8">
                          <div className="flex gap-3">
                             <Button variant="ghost" size="icon" className="h-10 w-10 rounded-xl text-white/20 hover:text-white"><Settings className="h-5 w-5" /></Button>
                             <Button variant="ghost" size="icon" className="h-10 w-10 rounded-xl text-white/20 hover:text-red-500" onClick={() => handleAction(() => deleteDoc(doc(db!, "consultantProfiles", c.id)), "تم حذف الخبير")}><Trash2 className="h-5 w-5" /></Button>
                          </div>
                          <Badge className="bg-emerald-500/10 text-emerald-500 border-none px-6 py-2 rounded-full font-black tabular-nums">{c.hourlyRate} EGP/h</Badge>
                       </div>
                    </Card>
                  ))}
               </div>
            </motion.div>
          )}

          {activeTab === "moderation" && (
            <motion.div key="moderation" initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -30 }} className="grid md:grid-cols-2 gap-12">
               <Card className="glass-cosmic border-none rounded-[4rem] p-14 shadow-2xl relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-64 h-64 bg-red-500/5 blur-[100px] -z-10" />
                  <h3 className="text-3xl font-black text-white mb-10 flex items-center gap-5"><ShieldAlert className="text-red-500 h-8 w-8" /> الكلمات المحظورة</h3>
                  <div className="flex gap-4 mb-12">
                     <Input value={newWord} onChange={e => setNewWord(e.target.value)} placeholder="أضف كلمة للرقابة السيادية..." className="glass border-white/5 h-16 rounded-2xl px-8 text-xl font-bold shadow-inner" />
                     <Button onClick={addForbiddenWord} className="h-16 w-16 rounded-2xl bg-red-600 hover:bg-red-700 shadow-2xl shrink-0"><Plus className="h-8 w-8" /></Button>
                  </div>
                  <div className="flex flex-wrap gap-4">
                     {forbiddenWords?.map(w => (
                       <Badge key={w.id} className="glass border-white/10 text-white/60 py-4 px-6 rounded-2xl flex items-center gap-4 group hover:border-red-500/30 transition-all">
                          <span className="font-black text-sm">{w.word}</span>
                          <button onClick={() => deleteDoc(doc(db!, "settings", "moderation", "forbiddenWords", w.id))} className="text-white/10 hover:text-red-500 transition-colors"><X className="h-4 w-4" /></button>
                       </Badge>
                     ))}
                  </div>
               </Card>

               <Card className="glass-cosmic border-none rounded-[4rem] p-14 relative overflow-hidden shadow-2xl">
                  <div className="absolute top-0 left-0 w-full h-full bg-red-500/[0.02] -z-10" />
                  <h3 className="text-3xl font-black text-white mb-10 flex items-center gap-5"><Activity className="text-primary h-8 w-8 animate-pulse" /> رادار الانتهاكات</h3>
                  <div className="space-y-8">
                     <div className="p-8 glass rounded-[2.5rem] border-red-500/10 flex items-start gap-6 bg-red-500/[0.02]">
                        <div className="h-14 w-14 rounded-2xl bg-red-500/20 flex items-center justify-center text-red-500 shrink-0"><ShieldAlert className="h-7 w-7" /></div>
                        <div className="space-y-2">
                           <p className="text-sm text-white/80 font-black">رصد انتهاك سيادي: "كلمة محظورة"</p>
                           <p className="text-[10px] text-white/20 font-bold">المواطن: محمد علي · سجل النظام: 14:22</p>
                           <Badge className="bg-red-500/10 text-red-500 border-none mt-4 px-4 py-1 rounded-full font-black text-[9px] uppercase tracking-widest">Auto Ban Executed</Badge>
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
    <button onClick={onClick} className={`flex items-center gap-4 px-10 py-4 rounded-[2rem] text-sm font-black transition-all ${active ? 'bg-primary text-white shadow-2xl shadow-primary/30' : 'text-white/20 hover:text-white hover:bg-white/5'}`}>
      {icon}
      {label}
    </button>
  );
}

function StatMini({ label, val, color }: any) {
  const colors: any = {
    blue: "text-blue-400 bg-blue-500/10 border-blue-500/20",
    red: "text-red-400 bg-red-500/10 border-red-500/20",
    emerald: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20"
  };
  return (
    <div className={`p-10 glass-cosmic rounded-[3rem] border ${colors[color]} shadow-2xl`}>
       <p className="text-[10px] font-black uppercase tracking-[0.3em] opacity-40 mb-4">{label}</p>
       <p className="text-6xl font-black tabular-nums tracking-tighter">{val}</p>
    </div>
  );
}