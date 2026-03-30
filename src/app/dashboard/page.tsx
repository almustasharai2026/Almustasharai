
"use client";

import { useState, useEffect } from "react";
import { useUser, useFirestore, useDoc, useCollection } from "@/firebase";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Shield, Wallet, Zap, Gavel, FileCheck, Activity, 
  ArrowUpRight, Lock, Sparkles, Star, Bell,
  ChevronRight, ArrowDownRight, TrendingUp, Fingerprint, AlertCircle
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import Link from "next/link";
import { doc, onSnapshot, collection, query, orderBy, limit } from "firebase/firestore";
import { useMemoFirebase } from "@/firebase/provider";

export default function SovereignEcosystemHub() {
  const { user, isUserLoading } = useUser();
  const db = useFirestore();
  const [profile, setProfile] = useState<any>(null);
  const [loadingError, setLoadingError] = useState(false);

  useEffect(() => {
    if (!db || !user) return;
    
    const timeout = setTimeout(() => {
      if (!profile) setLoadingError(true);
    }, 5000);

    const unsub = onSnapshot(doc(db, "users", user.uid), (doc) => {
      setProfile(doc.data());
      setLoadingError(false);
      clearTimeout(timeout);
    });
    return () => {
      unsub();
      clearTimeout(timeout);
    };
  }, [db, user, profile]);

  const transQuery = useMemoFirebase(() => user ? query(
    collection(db!, "users", user.uid, "transactions"), 
    orderBy("timestamp", "desc"), 
    limit(5)
  ) : null, [db, user]);
  const { data: recentTransactions } = useCollection(transQuery);

  if (loadingError) {
    return (
      <div className="h-screen bg-black flex flex-col items-center justify-center p-10 text-center space-y-6">
        <AlertCircle className="h-16 w-16 text-red-500 animate-pulse" />
        <h2 className="text-2xl font-bold">تعذر تحميل الملف السيادي</h2>
        <p className="text-white/40 max-w-xs">يبدو أن هناك مشكلة في الاتصال بقاعدة البيانات المركزية.</p>
        <Button onClick={() => window.location.reload()} variant="outline" className="border-white/10 font-bold">إعادة محاولة الاتصال</Button>
      </div>
    );
  }

  if (!profile) return (
    <div className="h-screen bg-black flex flex-col items-center justify-center gap-4">
      <Activity className="animate-spin text-primary h-12 w-12" />
      <span className="text-[10px] font-black uppercase tracking-[0.3em] text-white/20">Syncing Identity...</span>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#02040a] text-white p-6 lg:p-12 font-sans selection:bg-primary/30" dir="rtl">
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[-10%] left-20% w-[800px] h-[800px] bg-indigo-600/10 blur-[150px] rounded-full" />
      </div>

      <main className="max-w-7xl mx-auto relative z-10 space-y-12">
        <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-8">
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <div className="h-16 w-16 rounded-2xl bg-indigo-600 flex items-center justify-center shadow-2xl border border-white/10">
                <Fingerprint className="h-8 w-8 text-white" />
              </div>
              <div>
                <h1 className="text-4xl font-black tracking-tighter text-white">الكيان السيادي <span className="text-primary"> الرقمي</span></h1>
                <p className="text-white/30 text-sm font-bold tracking-[0.2em] uppercase">User ID: {profile.digitalId || 'Unknown'}</p>
              </div>
            </div>
          </div>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard label="رصيد المحفظة" value={`${profile.balance || 0} EGP`} icon={<Wallet className="text-emerald-400" />} color="emerald" />
          <StatCard label="معدل الموثوقية" value={`${profile.trustScore || 0}%`} icon={<Shield className="text-indigo-400" />} progress={profile.trustScore} color="indigo" />
          <StatCard label="الحالة الأمنية" value="Safe" icon={<Lock className="text-amber-400" />} color="amber" />
          <StatCard label="الذكاء النشط" value="Ready" icon={<Sparkles className="text-purple-400" />} color="purple" />
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
                  {recentTransactions?.map(t => (
                    <div key={t.id} className="flex items-center justify-between p-4 bg-white/5 rounded-2xl border border-white/5">
                       <p className="text-xs font-black text-white/80">{t.service}</p>
                       <span className={`font-black text-sm ${t.amount < 0 ? 'text-red-400' : 'text-emerald-400'}`}>{t.amount}</span>
                    </div>
                  ))}
               </div>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}

function StatCard({ label, value, icon, progress, color }: any) {
  return (
    <Card className="glass-cosmic border-none rounded-[2.5rem] p-8 shadow-xl">
      <div className="flex justify-between items-start mb-6">
        <div className="h-12 w-12 rounded-2xl bg-white/5 flex items-center justify-center shadow-inner">{icon}</div>
      </div>
      <p className="text-[10px] text-white/30 font-black uppercase tracking-widest">{label}</p>
      <h4 className="text-3xl font-black text-white tabular-nums tracking-tighter">{value}</h4>
      {progress !== undefined && <Progress value={progress} className="h-1 mt-6 bg-white/5" />}
    </Card>
  );
}

function EcosystemCard({ href, title, desc, icon, action }: any) {
  return (
    <Link href={href} className="group">
      <Card className="glass-cosmic border-none rounded-[3rem] p-10 h-full hover:scale-[1.02] transition-all shadow-2xl relative overflow-hidden">
         <div className="h-16 w-16 rounded-[1.5rem] bg-white/5 flex items-center justify-center mb-8 group-hover:bg-primary/10 transition-colors">{icon}</div>
         <h3 className="text-3xl font-black text-white mb-4">{title}</h3>
         <p className="text-white/30 font-bold text-lg">{desc}</p>
         <div className="mt-8 text-primary font-black text-xs uppercase">{action} <ChevronRight className="h-4 w-4 inline" /></div>
      </Card>
    </Link>
  );
}
