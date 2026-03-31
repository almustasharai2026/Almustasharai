
"use client";

import { useUser, useFirestore, useCollection } from "@/firebase";
import { motion } from "framer-motion";
import { 
  Shield, Wallet, Zap, FileCheck, ChevronRight, Fingerprint, Sparkles, Lock, Activity, Terminal, Gavel, Loader2
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import Link from "next/link";
import { calculateSovereignTrust } from "@/lib/sovereign-trust";
import ProtectedRoute from "@/components/ProtectedRoute";
import { collection, query } from "firebase/firestore";
import { useMemoFirebase } from "@/firebase/provider";

/**
 * لوحة التحكم المركزية (المركز السيادي).
 * تعرض حالة المواطن، الرصيد المالي، ومعدل الموثوقية الرقمية.
 */
export default function SovereignDashboard() {
  const { user, profile, isUserLoading } = useUser();
  const db = useFirestore();

  // بروتوكول جلب المعاملات السيادية (Sessions/Transactions)
  const transactionsQuery = useMemoFirebase(() => {
    if (!db || !user) return null;
    return query(collection(db, "wallets", user.uid, "transactions"));
  }, [db, user]);

  const { data: transactions, isLoading: transLoading } = useCollection(transactionsQuery);

  // حساب معدل الموثوقية السيادي
  const trustScore = profile ? calculateSovereignTrust(profile) : 50;

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-[#02040a] text-white p-6 lg:p-12 font-sans overflow-hidden" dir="rtl">
        
        {/* Cosmic Background Ambiance */}
        <div className="fixed inset-0 pointer-events-none">
          <div className="absolute top-[-10%] left-[-10%] w-[800px] h-[800px] bg-indigo-600/5 blur-[150px] rounded-full" />
          <div className="absolute bottom-[-10%] right-[-10%] w-[600px] h-[600px] bg-amber-500/5 blur-[150px] rounded-full" />
        </div>

        <div className="max-w-7xl mx-auto relative z-10 space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-1000">
          
          <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-8">
            <div className="flex items-center gap-6">
              <div className="h-20 w-20 rounded-[2rem] bg-indigo-600 flex items-center justify-center shadow-[0_0_50px_rgba(99,102,241,0.3)] border border-white/10">
                <Fingerprint className="h-10 w-10 text-white" />
              </div>
              <div>
                <div className="sovereign-badge mb-2">Sovereign Identity Protocol v4.5</div>
                <h1 className="text-5xl font-black tracking-tighter text-white">المركز <span className="text-primary">السيادي</span></h1>
                <p className="text-white/30 text-sm font-bold tracking-[0.3em] mt-1">
                  {user ? `SOV-${user.uid.substring(0,8).toUpperCase()}` : "GUEST-ID"}
                </p>
              </div>
            </div>
            
            <div className="flex gap-4">
              {(isUserLoading || transLoading) && (
                <div className="flex items-center gap-2 text-xs text-white/20 animate-pulse">
                  <Activity className="h-3 w-3" /> Synchronizing...
                </div>
              )}
              {profile?.role === 'admin' && (
                <Link href="/admin">
                  <Button variant="outline" className="h-14 px-8 rounded-2xl border-primary/20 bg-primary/5 text-primary font-black gap-3 hover:bg-primary/10">
                    <Terminal className="h-5 w-5" /> غرفة القيادة
                  </Button>
                </Link>
              )}
            </div>
          </header>

          {/* Sovereign Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <StatCard 
              label="الرصيد السيادي" 
              value={`${profile?.balance ?? 0} EGP`} 
              icon={<Wallet className="text-emerald-400" />} 
            />
            <StatCard 
              label="معدل الموثوقية" 
              value={`${trustScore}%`} 
              icon={<Shield className="text-indigo-400" />} 
              progress={trustScore} 
            />
            <StatCard 
              label="إجمالي العمليات" 
              value={`${transactions?.length ?? 0} معاملة`} 
              icon={<Activity className="text-amber-400" />} 
            />
            <StatCard 
              label="حالة الامتثال" 
              value={profile?.isBanned ? "محظور" : "آمن"} 
              icon={<Lock className={profile?.isBanned ? "text-red-400" : "text-emerald-400"} />} 
            />
          </div>

          <div className="grid lg:grid-cols-12 gap-10">
            <div className="lg:col-span-8 space-y-10">
              <h2 className="text-3xl font-black flex items-center gap-4">
                <Sparkles className="text-primary" /> البوابات النشطة
              </h2>
              <div className="grid md:grid-cols-2 gap-8">
                <PortalCard 
                  href="/bot" 
                  title="محرك القرار" 
                  desc="تحليل استراتيجي فوري باستخدام الذكاء الاصطناعي التنبؤي." 
                  icon={<Zap className="h-8 w-8" />} 
                  color="from-amber-500 to-orange-600"
                />
                <PortalCard 
                  href="/templates" 
                  title="مكتبة العقود" 
                  desc="توليد وثائق قانونية معتمدة وموثقة سيادياً." 
                  icon={<FileCheck className="h-8 w-8" />} 
                  color="from-blue-500 to-indigo-600"
                />
                <PortalCard 
                  href="/consultants" 
                  title="مجلس الخبراء" 
                  desc="اتصال فيديو مباشر ومشفر مع كبار المستشارين." 
                  icon={<Gavel className="h-8 w-8" />} 
                  color="from-purple-500 to-pink-600"
                />
                <PortalCard 
                  href="/pricing" 
                  title="شحن الرصيد" 
                  desc="إدارة باقات الوقت والوحدات المالية." 
                  icon={<Wallet className="h-8 w-8" />} 
                  color="from-emerald-500 to-teal-600"
                />
              </div>
            </div>

            {/* System Status & Analytics Sidebar */}
            <div className="lg:col-span-4 space-y-8">
              <Card className="glass-cosmic border-none rounded-[3.5rem] p-10 shadow-2xl relative overflow-hidden">
                 <div className="absolute top-0 right-0 p-10 opacity-5"><Activity className="h-32 w-32" /></div>
                 <h3 className="text-2xl font-black mb-8 border-b border-white/5 pb-4">حالة الاتصال</h3>
                 <div className="space-y-6">
                    <StatusItem 
                      label="Firebase Protocol" 
                      status="Sovereign Stable" 
                      icon={<Activity className="h-5 w-5" />} 
                    />
                    <StatusItem 
                      label="Sovereign Shield" 
                      status="Active & Protected" 
                      icon={<Shield className="h-5 w-5" />} 
                    />
                 </div>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}

function StatCard({ label, value, icon, progress }: any) {
  return (
    <Card className="glass-cosmic border-none rounded-[2.5rem] p-8 group hover:scale-[1.05] transition-all duration-500 shadow-xl">
      <div className="flex justify-between items-start mb-6">
        <div className="h-14 w-14 rounded-2xl bg-white/5 flex items-center justify-center shadow-inner group-hover:bg-white/10 transition-colors border border-white/5">{icon}</div>
      </div>
      <p className="text-[10px] text-white/30 font-black uppercase mb-1 tracking-widest">{label}</p>
      <h4 className="text-3xl font-black text-white tabular-nums tracking-tighter">{value}</h4>
      {progress !== undefined && <Progress value={progress} className="h-1.5 mt-6 bg-white/5 shadow-inner" />}
    </Card>
  );
}

function PortalCard({ href, title, desc, icon, color }: any) {
  return (
    <Link href={href}>
      <Card className="glass-card border-none rounded-[3.5rem] p-10 h-full group relative overflow-hidden shadow-2xl">
         <div className={`absolute top-0 left-0 w-1.5 h-full bg-gradient-to-b ${color}`} />
         <div className="h-20 w-20 rounded-[2rem] bg-white/5 flex items-center justify-center mb-8 group-hover:scale-110 group-hover:bg-primary/10 transition-all duration-500 border border-white/5">{icon}</div>
         <h3 className="text-3xl font-black text-white mb-4 group-hover:text-primary transition-colors">{title}</h3>
         <p className="text-white/30 font-bold text-lg leading-relaxed">{desc}</p>
         <div className="mt-10 flex items-center gap-3 text-primary font-black text-xs uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-all translate-x-4 group-hover:translate-x-0">
            فتح البوابة <ChevronRight className="h-4 w-4" />
         </div>
      </Card>
    </Link>
  );
}

function StatusItem({ label, status, icon }: any) {
  return (
    <div className="flex items-center gap-5 p-4 rounded-2xl bg-white/[0.03] border border-white/5 group hover:bg-white/[0.05] transition-all">
       <div className="h-10 w-10 rounded-xl bg-white/5 flex items-center justify-center group-hover:text-primary transition-colors">
         {icon}
       </div>
       <div>
          <p className="text-sm font-bold text-white/80">{label}</p>
          <p className="text-[10px] text-emerald-400 font-black uppercase mt-1 tracking-wider">{status}</p>
       </div>
    </div>
  );
}
