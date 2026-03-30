"use client";

import { useState, useEffect } from "react";
import { useUser, useFirestore, useCollection } from "@/firebase";
import { motion } from "framer-motion";
import { 
  Shield, Wallet, Zap, FileCheck, ChevronRight, Fingerprint, Sparkles, Lock, Activity, Loader2
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import Link from "next/link";
import { doc, onSnapshot, collection, query, orderBy, limit } from "firebase/firestore";
import { useMemoFirebase } from "@/firebase/provider";

export default function SovereignEcosystemHub() {
  const { user, isUserLoading } = useUser();
  const db = useFirestore();
  const [profile, setProfile] = useState<any>(null);

  useEffect(() => {
    if (!db || !user) return;
    // Real-time listener without blocking render
    const unsub = onSnapshot(doc(db, "users", user.uid), (doc) => {
      setProfile(doc.data());
    }, (err) => console.warn("Sovereign sync limited."));
    return () => unsub();
  }, [db, user]);

  const transQuery = useMemoFirebase(() => {
    if (!user || !db) return null;
    return query(
      collection(db, "users", user.uid, "transactions"), 
      orderBy("timestamp", "desc"), 
      limit(5)
    );
  }, [db, user]);
  
  const { data: recentTransactions } = useCollection(transQuery);

  // ❌ NO BLOCKING: render UI even if loading or no user
  const displayProfile = profile || { 
    balance: user ? "..." : 0, 
    trustScore: user ? 50 : 0, 
    digitalId: user ? "SYNCING..." : "GUEST-ID" 
  };

  return (
    <div className="min-h-screen bg-[#02040a] text-white p-6 lg:p-12 font-sans" dir="rtl">
      {/* ⚠️ Loading Alert Bar (Forced Safe Mode Indicator) */}
      {isUserLoading && (
        <div className="fixed top-0 left-0 w-full bg-primary/10 border-b border-primary/20 py-1 text-center text-[8px] font-black tracking-widest z-[200]">
          SYNCHRONIZING SOVEREIGN ASSETS... (SAFE MODE ACTIVE)
        </div>
      )}

      <div className="max-w-7xl mx-auto relative z-10 space-y-12">
        <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-8">
          <div className="flex items-center gap-4">
            <div className="h-16 w-16 rounded-2xl bg-indigo-600 flex items-center justify-center shadow-2xl">
              <Fingerprint className="h-8 w-8 text-white" />
            </div>
            <div>
              <h1 className="text-4xl font-black tracking-tighter text-white">الكيان السيادي <span className="text-primary">الرقمي</span></h1>
              <p className="text-white/30 text-sm font-bold tracking-[0.2em]">User ID: {displayProfile.digitalId}</p>
            </div>
          </div>
          
          {!user && !isUserLoading && (
            <Link href="/auth/login">
              <Button className="btn-primary rounded-xl px-8 h-12 font-black">تسجيل الدخول للوصول الكامل</Button>
            </Link>
          )}
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard label="رصيد المحفظة" value={`${displayProfile.balance} EGP`} icon={<Wallet className="text-emerald-400" />} />
          <StatCard label="معدل الموثوقية" value={`${displayProfile.trustScore}%`} icon={<Shield className="text-indigo-400" />} progress={displayProfile.trustScore} />
          <StatCard label="الحالة الأمنية" value={profile?.isBanned ? "Banned" : "Safe"} icon={<Lock className={profile?.isBanned ? "text-red-400" : "text-amber-400"} />} />
          <StatCard label="الذكاء النشط" value="Ready" icon={<Sparkles className="text-purple-400" />} />
        </div>

        <div className="grid lg:grid-cols-12 gap-8">
          <div className="lg:col-span-8 space-y-8">
            <div className="grid md:grid-cols-2 gap-6">
              <EcosystemCard href="/bot" title="محرك القرار" desc="بدء تحليل استراتيجي فوري للحالات المعقدة." icon={<Zap />} action="دخول" />
              <EcosystemCard href="/templates" title="المكتبة" desc="توليد الوثائق السيادية المعتمدة فورياً." icon={<FileCheck />} action="استعراض" />
            </div>
          </div>
          <div className="lg:col-span-4">
            <Card className="glass-cosmic border-none rounded-[3rem] p-8 shadow-2xl">
               <h3 className="text-xl font-black mb-6">سجل العمليات المالي</h3>
               <div className="space-y-4">
                  {recentTransactions && recentTransactions.length > 0 ? (
                    recentTransactions.map(t => (
                      <div key={t.id} className="flex items-center justify-between p-4 bg-white/5 rounded-2xl border border-white/5">
                         <p className="text-xs font-black text-white/80">{t.service}</p>
                         <span className={`font-black text-sm ${t.amount < 0 ? 'text-red-400' : 'text-emerald-400'}`}>{t.amount}</span>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-10 space-y-2 opacity-20">
                       <Activity className="h-8 w-8 mx-auto" />
                       <p className="text-[10px] font-bold uppercase tracking-widest">لا توجد معاملات حديثة</p>
                    </div>
                  )}
               </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({ label, value, icon, progress }: any) {
  return (
    <Card className="glass-cosmic border-none rounded-[2.5rem] p-8">
      <div className="flex justify-between items-start mb-6">
        <div className="h-12 w-12 rounded-2xl bg-white/5 flex items-center justify-center">{icon}</div>
      </div>
      <p className="text-[10px] text-white/30 font-black uppercase mb-1">{label}</p>
      <h4 className="text-3xl font-black text-white tabular-nums">{value}</h4>
      {progress !== undefined && <Progress value={progress} className="h-1 mt-6 bg-white/5" />}
    </Card>
  );
}

function EcosystemCard({ href, title, desc, icon, action }: any) {
  return (
    <Link href={href} className="group">
      <Card className="glass-cosmic border-none rounded-[3rem] p-10 h-full hover:scale-[1.02] transition-all">
         <div className="h-16 w-16 rounded-[1.5rem] bg-white/5 flex items-center justify-center mb-8 group-hover:bg-primary/10 transition-colors">{icon}</div>
         <h3 className="text-3xl font-black text-white mb-4">{title}</h3>
         <p className="text-white/30 font-bold text-lg leading-relaxed">{desc}</p>
         <div className="mt-8 text-primary font-black text-xs uppercase tracking-widest">{action} <ChevronRight className="h-4 w-4 inline" /></div>
      </Card>
    </Link>
  );
}
