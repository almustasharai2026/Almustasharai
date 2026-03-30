
"use client";

import { useState, useEffect } from "react";
import { useUser, useFirestore, useDoc, useCollection } from "@/firebase";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Shield, Wallet, Zap, Gavel, FileCheck, Activity, 
  ArrowUpRight, Users, Lock, Sparkles, Star, Bell,
  ChevronRight, ArrowDownRight, TrendingUp, Fingerprint
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import Link from "next/link";
import { doc, onSnapshot, collection, query, orderBy, limit } from "firebase/firestore";
import { useMemoFirebase } from "@/firebase/provider";

export default function SovereignEcosystemHub() {
  const { user } = useUser();
  const db = useFirestore();
  const [profile, setProfile] = useState<any>(null);

  useEffect(() => {
    if (!db || !user) return;
    const unsub = onSnapshot(doc(db, "users", user.uid), (doc) => {
      setProfile(doc.data());
    });
    return () => unsub();
  }, [db, user]);

  const transQuery = useMemoFirebase(() => user ? query(
    collection(db!, "users", user.uid, "transactions"), 
    orderBy("timestamp", "desc"), 
    limit(5)
  ) : null, [db, user]);
  const { data: recentTransactions } = useCollection(transQuery);

  if (!profile) return <div className="h-screen bg-black flex items-center justify-center"><Activity className="animate-spin text-primary h-12 w-12" /></div>;

  return (
    <div className="min-h-screen bg-[#02040a] text-white p-6 lg:p-12 font-sans selection:bg-primary/30" dir="rtl">
      
      {/* Sovereign Atmosphere */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[-10%] left-[20%] w-[800px] h-[800px] bg-indigo-600/10 blur-[150px] rounded-full" />
        <div className="absolute bottom-[-10%] right-[10%] w-[600px] h-[600px] bg-amber-500/5 blur-[120px] rounded-full" />
      </div>

      <main className="max-w-7xl mx-auto relative z-10 space-y-12">
        
        {/* Header: Universal Digital ID */}
        <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-8">
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <div className="h-16 w-16 rounded-2xl bg-indigo-600 flex items-center justify-center shadow-2xl border border-white/10 group hover:scale-110 transition-all duration-500">
                <Fingerprint className="h-8 w-8 text-white" />
              </div>
              <div>
                <h1 className="text-4xl font-black tracking-tighter text-white">الكيان السيادي <span className="text-primary"> الرقمي</span></h1>
                <p className="text-white/30 text-sm font-bold tracking-[0.2em] uppercase">User Digital Identity: {profile.digitalId}</p>
              </div>
            </div>
          </div>
          <div className="flex gap-3">
             <Badge variant="outline" className="glass border-emerald-500/20 text-emerald-500 px-6 py-2 rounded-full font-black text-[10px] uppercase">Identity Verified</Badge>
             <Badge variant="outline" className="glass border-primary/20 text-primary px-6 py-2 rounded-full font-black text-[10px] uppercase">Level: Platinum</Badge>
          </div>
        </header>

        {/* Global Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard 
            label="رصيد المحفظة" 
            value={`${profile.balance} EGP`} 
            icon={<Wallet className="text-emerald-400" />} 
            sub="Ready for Operations"
            color="emerald"
          />
          <StatCard 
            label="معدل الموثوقية (Trust)" 
            value={`${profile.trustScore}%`} 
            icon={<Shield className="text-indigo-400" />} 
            sub="Auto-Moderation Rating"
            progress={profile.trustScore}
            color="indigo"
          />
          <StatCard 
            label="عمليات النشاط" 
            value="142" 
            icon={<Activity className="text-amber-400" />} 
            sub="Last 30 Days Activity"
            color="amber"
          />
          <StatCard 
            label="الاستباقية الذكية" 
            value="High" 
            icon={<Sparkles className="text-purple-400" />} 
            sub="AI Predictive Layer Active"
            color="purple"
          />
        </div>

        {/* Ecosystem Core Sections */}
        <div className="grid lg:grid-cols-12 gap-8">
          
          {/* Left Column: Intelligence Hub */}
          <div className="lg:col-span-8 space-y-8">
            
            {/* Quick Intelligence Access */}
            <section className="grid md:grid-cols-2 gap-6">
              <EcosystemCard 
                href="/bot"
                title="محرك القرار الذكي"
                desc="تحليل استراتيجي فوري، تحديد المخاطر، واقتراح المسارات القانونية البديلة."
                icon={<Zap className="h-8 w-8 text-primary" />}
                action="بدء التحليل"
              />
              <EcosystemCard 
                href="/contracts"
                title="مصنع العقود الذكية"
                desc="توليد وثائق قانونية سيادية مخصصة ببياناتك الرقمية فورياً."
                icon={<FileCheck className="h-8 w-8 text-emerald-400" />}
                action="إصدار وثيقة"
              />
            </section>

            {/* Predictive Dashboard Section */}
            <Card className="glass-cosmic border-none rounded-[3rem] p-10 relative overflow-hidden shadow-2xl">
               <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-600/5 blur-[80px] -z-10" />
               <div className="flex justify-between items-center mb-10">
                  <h3 className="text-2xl font-black text-white flex items-center gap-4"><TrendingUp className="text-primary" /> مؤشر التنبؤ القانوني</h3>
                  <Badge className="bg-white/5 text-primary border-none">Predictive AI: ON</Badge>
               </div>
               <div className="space-y-8 py-10 text-center">
                  <div className="h-32 w-32 mx-auto rounded-full border-4 border-dashed border-primary/20 flex items-center justify-center">
                     <Lock className="h-12 w-12 text-white/5" />
                  </div>
                  <p className="text-white/20 font-bold max-w-sm mx-auto">لم يتم رصد قضايا نشطة حالياً للتحليل التنبئي. ابدأ استشارة جديدة لتفعيل طبقة الذكاء الاستباقي.</p>
               </div>
            </Card>
          </div>

          {/* Right Column: Economy & Log */}
          <div className="lg:col-span-4 space-y-8">
            
            {/* Wallet Recharge Quick */}
            <Card className="glass-cosmic border-none rounded-[3rem] p-8 shadow-2xl relative overflow-hidden">
               <div className="absolute inset-0 bg-gradient-to-br from-indigo-600/10 via-transparent to-transparent" />
               <h3 className="text-xl font-black mb-6 flex items-center gap-3"><Wallet className="h-5 w-5 text-primary" /> شحن المحفظة</h3>
               <div className="space-y-4">
                  <div className="p-6 bg-white/[0.03] rounded-2xl border border-white/5 text-center group hover:border-primary/30 transition-all cursor-pointer">
                     <p className="text-[10px] text-white/20 font-black uppercase mb-2">رقم التحويل الموحد</p>
                     <p className="text-2xl font-black text-white tracking-[0.2em]">01130031531</p>
                     <p className="text-[9px] text-primary mt-2 font-bold">Vodafone Cash Gateway</p>
                  </div>
                  <Link href="/pricing" className="block">
                    <Button className="w-full btn-primary h-14 rounded-2xl font-black text-sm shadow-xl">تفعيل باقة سيادية <ArrowUpRight className="ml-2 h-4 w-4" /></Button>
                  </Link>
               </div>
            </Card>

            {/* Financial Ledger (Transactions) */}
            <Card className="glass-cosmic border-none rounded-[3rem] p-8 shadow-2xl">
               <h3 className="text-xl font-black mb-6 flex items-center justify-between">
                  <span>سجل العمليات المالي</span>
                  <Activity className="h-4 w-4 text-white/20" />
               </h3>
               <div className="space-y-4">
                  {recentTransactions?.map(t => (
                    <div key={t.id} className="flex items-center justify-between p-4 bg-white/5 rounded-2xl border border-white/5 group hover:bg-white/[0.08] transition-all">
                       <div className="flex items-center gap-4">
                          <div className={`h-10 w-10 rounded-xl flex items-center justify-center ${t.amount < 0 ? 'bg-red-500/10 text-red-500' : 'bg-emerald-500/10 text-emerald-500'}`}>
                             {t.amount < 0 ? <ArrowDownRight className="h-5 w-5" /> : <ArrowUpRight className="h-5 w-5" />}
                          </div>
                          <div>
                             <p className="text-xs font-black text-white/80">{t.service}</p>
                             <p className="text-[10px] text-white/20 font-bold">{new Date(t.timestamp).toLocaleDateString('ar-EG')}</p>
                          </div>
                       </div>
                       <span className={`font-black text-sm tabular-nums ${t.amount < 0 ? 'text-red-400' : 'text-emerald-400'}`}>
                         {t.amount}
                       </span>
                    </div>
                  ))}
                  {(!recentTransactions || recentTransactions.length === 0) && (
                    <p className="text-center py-10 text-white/10 font-bold text-xs">لا توجد معاملات مالية مسجلة.</p>
                  )}
               </div>
            </Card>

            {/* Experts Match Shortcut */}
            <Link href="/marketplace">
              <div className="p-8 glass-cosmic rounded-[3rem] border-primary/20 bg-primary/5 flex items-center gap-6 group cursor-pointer hover:bg-primary/10 transition-all shadow-2xl">
                 <div className="h-14 w-14 rounded-2xl bg-primary/10 flex items-center justify-center text-primary shrink-0 shadow-inner group-hover:scale-110 transition-transform">
                    <Gavel className="h-7 w-7" />
                 </div>
                 <div>
                    <h4 className="font-black text-lg text-white">هيئة الخبراء</h4>
                    <p className="text-[10px] text-primary font-bold uppercase tracking-widest">Connect with High Council</p>
                 </div>
                 <ChevronRight className="mr-auto h-5 w-5 text-white/20 group-hover:text-primary transition-all" />
              </div>
            </Link>
          </div>

        </div>
      </main>
    </div>
  );
}

function StatCard({ label, value, icon, sub, progress, color }: any) {
  const colors: any = {
    emerald: "border-emerald-500/10",
    indigo: "border-indigo-500/10",
    amber: "border-amber-500/10",
    purple: "border-purple-500/10"
  };

  return (
    <Card className={`glass-cosmic border-none rounded-[2.5rem] p-8 shadow-xl relative overflow-hidden ${colors[color]}`}>
      <div className="flex justify-between items-start mb-6">
        <div className="h-12 w-12 rounded-2xl bg-white/5 flex items-center justify-center shadow-inner">
          {icon}
        </div>
        <Badge variant="ghost" className="text-[10px] opacity-20 font-black uppercase tracking-widest">Real-time</Badge>
      </div>
      <div className="space-y-1">
        <p className="text-[10px] text-white/30 font-black uppercase tracking-widest">{label}</p>
        <h4 className="text-3xl font-black text-white tabular-nums tracking-tighter">{value}</h4>
      </div>
      {progress !== undefined && <Progress value={progress} className="h-1 mt-6 bg-white/5" />}
      <p className="text-[9px] text-white/10 font-bold mt-4 uppercase tracking-tighter">{sub}</p>
    </Card>
  );
}

function EcosystemCard({ href, title, desc, icon, action }: any) {
  return (
    <Link href={href} className="block group">
      <Card className="glass-cosmic border-none rounded-[3rem] p-10 h-full flex flex-col hover:scale-[1.02] transition-all duration-500 shadow-2xl relative overflow-hidden">
         <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-primary/20 to-transparent" />
         <div className="h-16 w-16 rounded-[1.5rem] bg-white/5 flex items-center justify-center mb-8 group-hover:bg-primary/10 transition-colors shadow-inner">
            {icon}
         </div>
         <h3 className="text-3xl font-black text-white mb-4">{title}</h3>
         <p className="text-white/30 font-bold text-lg leading-relaxed flex-grow">{desc}</p>
         <div className="mt-8 flex items-center gap-3 text-primary font-black text-xs uppercase tracking-widest">
            {action} <ChevronRight className="h-4 w-4" />
         </div>
      </Card>
    </Link>
  );
}
