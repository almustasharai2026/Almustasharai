"use client";

import { useUser, useFirestore, useCollection } from "@/firebase";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Gavel, UserMinus, Loader2, ShieldCheck, ArrowRight } from "lucide-react";
import { collection, doc, deleteDoc, updateDoc } from "firebase/firestore";
import { useMemoFirebase } from "@/firebase/provider";
import { useToast } from "@/hooks/use-toast";
import { motion } from "framer-motion";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function AdminConsultants() {
  const { user, role } = useUser();
  const db = useFirestore();
  const { toast } = useToast();
  const router = useRouter();

  const consultantsQuery = useMemoFirebase(() => db ? collection(db, "consultants") : null, [db]);
  const { data: allConsultants, isLoading } = useCollection(consultantsQuery);

  if (role !== "admin") {
    return (
      <div className="h-screen flex flex-col items-center justify-center bg-black text-red-500 font-black gap-8">
        <h1 className="text-4xl uppercase tracking-[0.5em]">Sovereign Lock Active</h1>
      </div>
    );
  }

  const removeConsultant = async (id: string) => {
    if (!confirm("هل أنت متأكد من استبعاد هذا الخبير من الهيئة؟")) return;
    try {
      await deleteDoc(doc(db!, "consultants", id));
      toast({ title: "تم الاستبعاد", description: "تم حذف ملف الخبير من النظام." });
    } catch (e) {
      toast({ variant: "destructive", title: "فشل الإجراء" });
    }
  };

  return (
    <div className="min-h-screen bg-[#020617] p-8 lg:p-20 font-sans" dir="rtl">
      <header className="max-w-7xl mx-auto flex justify-between items-center mb-24">
        <div className="flex items-center gap-6">
           <div className="h-16 w-16 rounded-2xl bg-indigo-600 flex items-center justify-center shadow-3xl border border-white/10">
              <Gavel className="h-8 w-8 text-white" />
           </div>
           <h1 className="text-5xl font-black text-white tracking-tighter">إدارة <span className="text-primary">هيئة الخبراء</span></h1>
        </div>
        <Link href="/admin">
          <Button variant="ghost" className="text-white/40 hover:text-white gap-3 font-bold">
            <ArrowRight className="h-4 w-4" /> العودة للقيادة
          </Button>
        </Link>
      </header>

      <main className="max-w-5xl mx-auto">
        {isLoading ? (
          <div className="py-20 flex justify-center"><Loader2 className="h-12 w-12 animate-spin text-primary opacity-20" /></div>
        ) : (
          <Card className="glass-cosmic border-none rounded-[3rem] p-10 shadow-3xl">
            <div className="space-y-4">
              {allConsultants?.map(c => (
                <div key={c.id} className="flex items-center justify-between p-8 glass rounded-[2.5rem] border-white/5 bg-white/[0.01] hover:bg-white/[0.03] transition-all">
                   <div className="flex items-center gap-8 text-right">
                      <div className="h-16 w-16 rounded-2xl bg-primary/10 flex items-center justify-center font-black text-primary text-2xl">{c.name?.charAt(0)}</div>
                      <div>
                         <p className="text-2xl font-black text-white">{c.name}</p>
                         <p className="text-xs text-primary font-bold uppercase mt-1 tracking-widest">{c.specialization}</p>
                      </div>
                   </div>
                   <div className="flex items-center gap-6">
                      <Badge className="bg-emerald-500/10 text-emerald-500 border-none px-6 py-2 rounded-xl font-black text-[10px] flex gap-2">
                        <ShieldCheck className="h-3 w-3" /> Mapped Expert
                      </Badge>
                      <Button 
                        variant="ghost" 
                        onClick={() => removeConsultant(c.id)} 
                        className="h-12 w-12 rounded-xl text-white/10 hover:text-red-500 hover:bg-red-500/10"
                      >
                        <UserMinus className="h-5 w-5" />
                      </Button>
                   </div>
                </div>
              ))}
              {allConsultants?.length === 0 && (
                <div className="py-20 text-center text-white/20 font-bold">لا يوجد خبراء مسجلين حالياً.</div>
              )}
            </div>
          </Card>
        )}
      </main>
    </div>
  );
}
