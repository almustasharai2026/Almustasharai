
"use client";

import { useUser, useFirestore, useCollection } from "@/firebase";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Users, Gavel, ShieldAlert, Tag, Activity, Settings, X, Wallet, CheckCircle2
} from "lucide-react";
import { collection, doc, updateDoc, deleteDoc } from "firebase/firestore";
import { useMemoFirebase } from "@/firebase/provider";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";

export default function MasterAdminPanel() {
  const { user, profile, role } = useUser();
  const db = useFirestore();
  const { toast } = useToast();
  
  const [activeTab, setActiveTab] = useState("users");

  // استعلامات الإدارة السيادية
  const usersQuery = useMemoFirebase(() => db ? collection(db, "users") : null, [db]);
  const { data: allUsers } = useCollection(usersQuery);

  const offersQuery = useMemoFirebase(() => db ? collection(db, "system", "config", "offers") : null, [db]);
  const { data: offers } = useCollection(offersQuery);

  const logsQuery = useMemoFirebase(() => db ? collection(db, "analytics") : null, [db]);
  const { data: logs } = useCollection(logsQuery);

  const paymentsQuery = useMemoFirebase(() => db ? collection(db, "paymentRequests") : null, [db]);
  const { data: paymentRequests } = useCollection(paymentsQuery);

  if (role !== "admin") {
    return <div className="h-screen flex items-center justify-center font-black bg-black text-red-600">Sovereign Lock Active</div>;
  }

  const approvePayment = async (requestId: string, userId: string, amount: number) => {
    if (!db) return;
    try {
      await updateDoc(doc(db, "paymentRequests", requestId), { status: "approved" });
      // شحن رصيد المواطن فعلياً
      await updateDoc(doc(db, "users", userId), { balance: (allUsers?.find(u => u.id === userId)?.balance || 0) + amount });
      toast({ title: "تم قبول الدفع", description: `تم شحن ${amount} EGP للمواطن.` });
    } catch (e) {
      toast({ variant: "destructive", title: "فشل الإجراء" });
    }
  };

  return (
    <div className="min-h-screen p-6 lg:p-10 bg-slate-50 dark:bg-[#020617]" dir="rtl">
      <Card className="glass-cosmic border-none rounded-[2rem] overflow-hidden shadow-2xl bg-white dark:bg-slate-900 max-w-6xl mx-auto">
        <header className="p-8 bg-gradient-to-r from-[#4e54c8] to-[#8f94fb] text-white flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="h-12 w-12 rounded-xl bg-white/20 flex items-center justify-center border border-white/10 shadow-inner">
              <Settings className="h-6 w-6" />
            </div>
            <div>
              <h1 className="text-2xl font-black tracking-tight">غرفة القيادة العليا</h1>
              <p className="text-[10px] font-bold opacity-60 uppercase tracking-widest">Master Protocol: king2026</p>
            </div>
          </div>
        </header>

        <Tabs defaultValue="users" className="p-8" onValueChange={setActiveTab}>
          <TabsList className="bg-slate-100 dark:bg-white/5 p-1 rounded-2xl h-auto flex flex-wrap gap-1 mb-10 border border-black/5">
            <TabTrigger value="users" label="المواطنين" icon={<Users className="h-4 w-4" />} />
            <TabTrigger value="payments" label="طلبات الدفع" icon={<Wallet className="h-4 w-4" />} />
            <TabTrigger value="advisors" label="هيئة الخبراء" icon={<Gavel className="h-4 w-4" />} />
            <TabTrigger value="offers" label="العروض" icon={<Tag className="h-4 w-4" />} />
            <TabTrigger value="logs" label="السجلات" icon={<Activity className="h-4 w-4" />} />
          </TabsList>

          <div className="min-h-[400px]">
            <TabsContent value="users" className="space-y-4">
              {allUsers?.map(u => (
                <div key={u.id} className="p-6 bg-slate-50 dark:bg-black/20 rounded-3xl border border-border flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center font-black text-primary">{u.fullName?.charAt(0)}</div>
                    <div>
                      <p className="font-black text-sm">{u.fullName}</p>
                      <p className="text-[10px] text-muted-foreground">{u.email}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <p className="text-sm font-black tabular-nums">{u.balance} EGP</p>
                    <Button variant="outline" size="sm" className="rounded-xl text-[10px] font-bold">تعديل</Button>
                  </div>
                </div>
              ))}
            </TabsContent>

            <TabsContent value="payments" className="space-y-4">
              {paymentRequests?.filter(r => r.status === "pending").map(r => (
                <div key={r.id} className="p-6 bg-amber-50 dark:bg-amber-900/10 rounded-3xl border border-amber-200 dark:border-amber-900/30 flex items-center justify-between">
                  <div>
                    <p className="font-black text-sm">{r.userName}</p>
                    <p className="text-[10px] font-bold text-amber-600">طلب شحن: {r.amount} EGP</p>
                  </div>
                  <Button 
                    onClick={() => approvePayment(r.id, r.userId, r.amount)}
                    className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl gap-2 font-black text-xs"
                  >
                    <CheckCircle2 className="h-4 w-4" /> قبول التحويل
                  </Button>
                </div>
              ))}
              {(!paymentRequests || paymentRequests.filter(r => r.status === "pending").length === 0) && (
                <div className="py-20 text-center opacity-30 font-bold">لا يوجد طلبات دفع معلقة.</div>
              )}
            </TabsContent>

            <TabsContent value="offers" className="space-y-4">
               {offers?.map(o => (
                 <div key={o.id} className="p-6 bg-slate-50 dark:bg-black/20 rounded-3xl border border-border flex items-center justify-between">
                    <p className="font-black text-sm">{o.name}</p>
                    <div className="flex items-center gap-4">
                       <p className="text-sm font-black text-primary">{o.price} EGP</p>
                       <Button variant="ghost" className="text-red-500 hover:bg-red-500/10 rounded-xl"><X className="h-4 w-4" /></Button>
                    </div>
                 </div>
               ))}
               <Button className="w-full h-14 rounded-2xl border-dashed border-2 border-primary/20 bg-primary/5 text-primary font-black">إضافة باقة جديدة</Button>
            </TabsContent>

            <TabsContent value="logs">
              <div className="max-h-[400px] overflow-y-auto bg-slate-100 dark:bg-black/40 p-6 rounded-[2rem] font-mono text-[10px] space-y-2">
                {logs?.map((log, i) => (
                  <div key={i} className="opacity-70 border-b border-black/5 pb-2">
                    <span className="text-primary font-bold">[{new Date(log.createdAt?.seconds * 1000).toLocaleTimeString()}]</span> {log.event}: {JSON.stringify(log.data)}
                  </div>
                ))}
              </div>
            </TabsContent>
          </div>
        </Tabs>
      </Card>
    </div>
  );
}

function TabTrigger({ value, icon, label }: { value: string; icon: React.ReactNode; label: string }) {
  return (
    <TabsTrigger 
      value={value} 
      className="flex-1 rounded-xl px-6 py-3 text-xs font-black data-[state=active]:bg-white dark:data-[state=active]:bg-slate-800 data-[state=active]:text-primary data-[state=active]:shadow-xl transition-all gap-3"
    >
      {icon} {label}
    </TabsTrigger>
  );
}
