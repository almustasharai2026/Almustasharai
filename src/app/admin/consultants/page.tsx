"use client";

import { useUser, useFirestore, useCollection } from "@/firebase";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Gavel, UserCheck, UserMinus, Loader2, ShieldCheck, 
  ArrowRight, FileCheck, ExternalLink, Clock, AlertTriangle 
} from "lucide-react";
import { collection, doc, deleteDoc, updateDoc } from "firebase/firestore";
import { useMemoFirebase } from "@/firebase/provider";
import { useToast } from "@/hooks/use-toast";
import Link from "next/link";
import { roles as ROLES_LIST } from "@/lib/roles";
import { motion, AnimatePresence } from "framer-motion";

/**
 * غرفة مراجعة الخبراء (The Expert Review Room).
 * مخصصة للملك king2026 لمراجعة وثائق المحامين وتفعيل صلاحياتهم.
 */
export default function AdminConsultants() {
  const { user, role, isUserLoading } = useUser();
  const db = useFirestore();
  const { toast } = useToast();

  // جلب كافة المستخدمين الذين ينتظرون التوثيق أو الخبراء الحاليين
  const usersQuery = useMemoFirebase(() => {
    if (!db || !user || role !== ROLES_LIST.ADMIN) return null;
    return collection(db, "users");
  }, [db, user, role]);
  
  const { data: allUsers, isLoading } = useCollection(usersQuery);

  // تصفية الخبراء والطلبات المعلقة
  const expertsAndPending = allUsers?.filter(u => 
    u.role === ROLES_LIST.CONSULTANT || u.role === ROLES_LIST.PENDING_EXPERT
  );

  if (isUserLoading) {
    return (
      <div className="h-screen flex items-center justify-center bg-black">
        <Loader2 className="h-12 w-12 animate-spin text-primary opacity-20" />
      </div>
    );
  }

  if (role !== ROLES_LIST.ADMIN) {
    return (
      <div className="h-screen flex flex-col items-center justify-center bg-black text-red-500 font-black gap-8">
        <AlertTriangle className="h-20 w-20" />
        <h1 className="text-4xl uppercase tracking-[0.5em]">Sovereign Lock Active</h1>
      </div>
    );
  }

  const approveExpert = async (targetUser: any) => {
    try {
      await updateDoc(doc(db!, "users", targetUser.id), {
        role: ROLES_LIST.CONSULTANT,
        "verificationRequest.status": "approved",
        "verificationRequest.verifiedAt": new Date().toISOString()
      });
      // إنشاء ملف خبير في مجموعة الخبراء
      await updateDoc(doc(db!, "consultants", targetUser.id), {
        id: targetUser.id,
        name: targetUser.fullName,
        specialization: "مستشار قانوني معتمد",
        rating: 5.0,
        reviews: 0
      }, { upsert: true } as any);

      toast({ title: "تم التفعيل السيادي ✅", description: `تم ترقية ${targetUser.fullName} إلى رتبة خبير.` });
    } catch (e) {
      toast({ variant: "destructive", title: "فشل بروتوكول التفعيل" });
    }
  };

  const rejectExpert = async (id: string) => {
    if (!confirm("هل أنت متأكد من رفض وطلب إعادة توثيق هذا الخبير؟")) return;
    try {
      await updateDoc(doc(db!, "users", id), {
        role: ROLES_LIST.USER,
        verificationRequest: null
      });
      toast({ title: "تم الرفض", description: "تمت إزالة طلب التوثيق وتحويل الحساب لمواطن عادي." });
    } catch (e) {
      toast({ variant: "destructive", title: "فشل الإجراء" });
    }
  };

  return (
    <div className="min-h-screen bg-[#020617] p-8 lg:p-20 font-sans relative overflow-hidden" dir="rtl">
      {/* Glows */}
      <div className="absolute top-0 left-0 w-[500px] h-[500px] bg-primary/5 blur-[150px] -z-10" />

      <header className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-start md:items-center mb-24 gap-8">
        <div className="flex items-center gap-6">
           <div className="h-16 w-16 rounded-2xl bg-primary/20 flex items-center justify-center shadow-3xl border border-primary/20">
              <Gavel className="h-8 w-8 text-primary" />
           </div>
           <div>
              <h1 className="text-5xl font-black text-white tracking-tighter">إدارة <span className="text-primary">مجلس الخبراء</span></h1>
              <p className="text-white/20 font-bold uppercase tracking-widest text-[10px] mt-2">Expert Authentication Chamber</p>
           </div>
        </div>
        <Link href="/admin">
          <Button variant="ghost" className="text-white/40 hover:text-white gap-3 font-black text-xs uppercase tracking-widest h-14 px-8 rounded-2xl glass">
            <ArrowRight className="h-4 w-4" /> العودة لغرفة القيادة
          </Button>
        </Link>
      </header>

      <main className="max-w-6xl mx-auto">
        {isLoading ? (
          <div className="py-20 flex justify-center"><Loader2 className="h-12 w-12 animate-spin text-primary opacity-20" /></div>
        ) : (
          <div className="grid gap-8">
            <AnimatePresence>
              {expertsAndPending?.map((u, i) => (
                <motion.div 
                  key={u.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1 }}
                >
                  <Card className="glass-cosmic border-none rounded-[3rem] p-10 overflow-hidden relative group">
                    <div className="flex flex-col lg:flex-row gap-12">
                      {/* User Info */}
                      <div className="flex-1 space-y-8">
                        <div className="flex items-start justify-between">
                          <div className="flex items-center gap-6">
                            <div className="h-20 w-20 rounded-3xl bg-primary/10 flex items-center justify-center font-black text-primary text-3xl shadow-inner border border-primary/5">
                              {u.fullName?.charAt(0)}
                            </div>
                            <div>
                              <h3 className="text-3xl font-black text-white">{u.fullName}</h3>
                              <p className="text-white/40 font-bold text-sm mt-1">{u.email} | {u.phone}</p>
                              <div className="flex gap-2 mt-4">
                                {u.role === ROLES_LIST.PENDING_EXPERT ? (
                                  <Badge className="bg-amber-500/10 text-amber-500 border-none px-4 py-1 rounded-lg font-black text-[10px] flex gap-2">
                                    <Clock className="h-3 w-3" /> قيد المراجعة السيادية
                                  </Badge>
                                ) : (
                                  <Badge className="bg-emerald-500/10 text-emerald-500 border-none px-4 py-1 rounded-lg font-black text-[10px] flex gap-2">
                                    <ShieldCheck className="h-3 w-3" /> خبير سيادي معتمد
                                  </Badge>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Document Preview Grid */}
                        {u.verificationRequest?.docs && (
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            {Object.entries(u.verificationRequest.docs).map(([key, src]: any) => (
                              <div key={key} className="space-y-2">
                                <p className="text-[8px] font-black text-white/20 uppercase text-center">{key}</p>
                                <div className="aspect-[4/3] rounded-2xl overflow-hidden border border-white/5 relative group/img">
                                  <img src={src} className="w-full h-full object-cover transition-transform duration-500 group-hover/img:scale-110" alt={key} />
                                  <div className="absolute inset-0 bg-black/60 opacity-0 group-hover/img:opacity-100 transition-opacity flex items-center justify-center">
                                    <button onClick={() => window.open(src, '_blank')} className="p-3 bg-primary rounded-xl text-black"><ExternalLink size={16} /></button>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>

                      {/* Action Portal */}
                      <div className="w-full lg:w-72 flex flex-col justify-center gap-4 bg-white/5 p-8 rounded-[2.5rem] border border-white/5">
                        <p className="text-[10px] font-black text-white/20 uppercase tracking-widest text-center mb-4">Sovereign Action Portal</p>
                        {u.role === ROLES_LIST.PENDING_EXPERT && (
                          <Button 
                            onClick={() => approveExpert(u)}
                            className="h-16 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-black text-lg shadow-xl shadow-emerald-600/20 gap-3"
                          >
                            <UserCheck className="h-6 w-6" /> تفعيل كخبير
                          </Button>
                        )}
                        <Button 
                          variant="ghost"
                          onClick={() => rejectExpert(u.id)}
                          className="h-16 rounded-2xl bg-red-600/10 text-red-500 hover:bg-red-600 hover:text-white font-black text-lg gap-3 transition-all"
                        >
                          <UserMinus className="h-6 w-6" /> {u.role === ROLES_LIST.PENDING_EXPERT ? 'رفض الطلب' : 'استبعاد'}
                        </Button>
                      </div>
                    </div>
                  </Card>
                </motion.div>
              ))}
            </AnimatePresence>

            {expertsAndPending?.length === 0 && (
              <div className="py-40 text-center glass-cosmic rounded-[4rem] border-dashed border-white/5">
                 <FileCheck className="h-20 w-20 mx-auto text-white/5 mb-6" />
                 <p className="text-3xl font-black text-white/20">لا توجد طلبات توثيق حالية</p>
                 <p className="text-white/10 font-bold mt-2">سيظهر هنا المحامون الذين يتقدمون بطلبات الانضمام لمجلس الخبراء.</p>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
