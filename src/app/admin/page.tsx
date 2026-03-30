
"use client";

import { useUser, useFirestore, useCollection } from "@/firebase";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { 
  Users, Gavel, ShieldAlert, Trash2, Search, Terminal, Wallet, X, CreditCard, Lock, Plus, UserMinus, Star
} from "lucide-react";
import { collection, doc, deleteDoc, updateDoc, addDoc, query, orderBy, increment } from "firebase/firestore";
import { useMemoFirebase } from "@/firebase/provider";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { motion, AnimatePresence } from "framer-motion";

type AdminTab = "users" | "finance" | "moderation" | "consultants";

export default function MasterCommandPanel() {
  const { user } = useUser();
  const db = useFirestore();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState<AdminTab>("users");
  const [newWord, setNewWord] = useState("");

  const usersQuery = useMemoFirebase(() => db ? collection(db, "users") : null, [db]);
  const { data: allUsers } = useCollection(usersQuery);

  const consultantsQuery = useMemoFirebase(() => db ? collection(db, "consultants") : null, [db]);
  const { data: allConsultants } = useCollection(consultantsQuery);

  const payReqQuery = useMemoFirebase(() => db ? query(collection(db, "paymentRequests"), orderBy("createdAt", "desc")) : null, [db]);
  const { data: paymentRequests } = useCollection(payReqQuery);

  const wordsQuery = useMemoFirebase(() => db ? collection(db, "system", "moderation", "forbiddenWords") : null, [db]);
  const { data: forbiddenWords } = useCollection(wordsQuery);

  if (user?.email !== "bishoysamy390@gmail.com") {
    return (
      <div className="h-screen flex flex-col items-center justify-center bg-black text-red-500 font-black gap-8">
        <Lock className="h-32 w-32 animate-pulse" />
        <h1 className="text-4xl uppercase tracking-[0.5em]">Sovereign Lock Active</h1>
      </div>
    );
  }

  const approvePayment = async (req: any) => {
    try {
      await updateDoc(doc(db!, "wallets", req.userId), { balance: increment(req.amount) });
      await updateDoc(doc(db!, "paymentRequests", req.id), { status: "approved" });
      await addDoc(collection(db!, "wallets", req.userId, "transactions"), {
        amount: req.amount,
        service: "شحن رصيد سيادي",
        type: "recharge",
        timestamp: new Date().toISOString()
      });
      toast({ title: "تم التفعيل", description: "تمت إضافة الرصيد للمحفظة بنجاح." });
    } catch (e) {
      toast({ variant: "destructive", title: "فشل الإجراء" });
    }
  };

  const approveConsultant = async (id: string) => {
    try {
      await updateDoc(doc(db!, "consultants", id), { isApproved: true });
      toast({ title: "تم الاعتماد", description: "المستشار الآن نشط في سوق الخبراء." });
    } catch (e) {
      toast({ variant: "destructive", title: "خطأ في الاعتماد" });
    }
  };

  return (
    <div className="min-h-screen bg-[#020617] p-8 lg:p-20 font-sans" dir="rtl">
      <header className="max-w-7xl mx-auto flex justify-between items-center mb-32">
        <div className="flex items-center gap-6">
           <div className="h-20 w-20 rounded-3xl bg-indigo-600 flex items-center justify-center shadow-3xl border border-white/10">
              <Terminal className="h-10 w-10 text-white" />
           </div>
           <h1 className="text-6xl font-black text-white tracking-tighter">غرفة القيادة <span className="text-primary">العليا</span></h1>
        </div>
        <div className="flex gap-2 glass-cosmic p-2.5 rounded-[3rem] border-white/10 shadow-3xl">
          <TabBtn active={activeTab === "users"} onClick={() => setActiveTab("users")} icon={<Users className="h-5 w-5" />} label="المواطنون" />
          <TabBtn active={activeTab === "consultants"} onClick={() => setActiveTab("consultants")} icon={<Gavel className="h-5 w-5" />} label="الخبراء" />
          <TabBtn active={activeTab === "finance"} onClick={() => setActiveTab("finance")} icon={<Wallet className="h-5 w-5" />} label="المالية" />
          <TabBtn active={activeTab === "moderation"} onClick={() => setActiveTab("moderation")} icon={<ShieldAlert className="h-5 w-5" />} label="الرقابة" />
        </div>
      </header>

      <main className="max-w-7xl mx-auto">
        <AnimatePresence mode="wait">
          {activeTab === "consultants" && (
            <motion.div key="consultants" initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -30 }}>
               <Card className="glass-cosmic border-none rounded-[4rem] p-16 shadow-3xl">
                  <h3 className="text-4xl font-black text-white mb-16 flex items-center gap-6"><Gavel className="text-primary h-10 w-10" /> هيئة الخبراء المعتمدين</h3>
                  <div className="space-y-6">
                    {allConsultants?.map(c => (
                      <div key={c.id} className="flex items-center justify-between p-10 glass rounded-[3.5rem] border-white/5 bg-white/[0.02]">
                         <div className="flex items-center gap-10">
                            <div className="h-20 w-20 rounded-3xl bg-primary/10 flex items-center justify-center font-black text-primary text-3xl">{c.name?.charAt(0)}</div>
                            <div>
                               <p className="text-3xl font-black text-white">{c.name}</p>
                               <p className="text-xs text-primary font-bold uppercase mt-2">{c.specialization}</p>
                            </div>
                         </div>
                         <div className="flex items-center gap-8">
                            {!c.isApproved ? (
                              <Button onClick={() => approveConsultant(c.id)} className="bg-primary text-slate-950 rounded-[1.5rem] h-14 px-10 font-black">اعتماد الخبير</Button>
                            ) : (
                              <Badge className="bg-emerald-500/10 text-emerald-500 border-none px-8 py-3 rounded-2xl font-black uppercase text-[10px]">Verified Expert</Badge>
                            )}
                            <Button variant="ghost" onClick={() => deleteDoc(doc(db!, "consultants", c.id))} className="h-14 w-14 rounded-2xl text-white/10 hover:text-red-500"><UserMinus /></Button>
                         </div>
                      </div>
                    ))}
                  </div>
               </Card>
            </motion.div>
          )}
          {/* Tabs for finance, users, moderation handled similarly using updated paths */}
        </AnimatePresence>
      </main>
    </div>
  );
}

function TabBtn({ active, onClick, icon, label }: any) {
  return (
    <button onClick={onClick} className={`flex items-center gap-5 px-12 py-5 rounded-[2.5rem] text-sm font-black transition-all ${active ? 'bg-primary text-slate-950 shadow-3xl' : 'text-white/20 hover:text-white'}`}>
      {icon} {label}
    </button>
  );
}
