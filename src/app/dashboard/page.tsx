"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { useFirestore } from "@/firebase";
import { getWallet } from "@/lib/wallet";
import ProtectedRoute from "@/components/ProtectedRoute";
import { Card } from "@/components/ui/card";
import { Wallet, Activity, Shield, Fingerprint } from "lucide-react";
import { motion } from "framer-motion";

export default function SovereignDashboard() {
  const { user, profile } = useAuth();
  const db = useFirestore();
  const [wallet, setWallet] = useState<any>(null);

  useEffect(() => {
    if (!user || !db) return;
    getWallet(db, user.uid).then(setWallet);
  }, [user, db, profile?.balance]);

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-[#02040a] text-white p-6 lg:p-12 font-sans" dir="rtl">
        <div className="max-w-7xl mx-auto space-y-12">
          
          <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-8">
            <div className="flex items-center gap-6">
              <div className="h-20 w-20 rounded-[2rem] bg-indigo-600 flex items-center justify-center shadow-3xl border border-white/10">
                <Fingerprint className="h-10 w-10 text-white" />
              </div>
              <div>
                <div className="sovereign-badge mb-2">Sovereign Identity Protocol v4.5</div>
                <h1 className="text-5xl font-black tracking-tighter text-white">المركز <span className="text-primary">السيادي</span></h1>
                <p className="text-white/30 text-sm font-bold tracking-widest mt-1">
                  {user ? `SOV-${user.uid.substring(0,8).toUpperCase()}` : "GUEST-ID"}
                </p>
              </div>
            </div>
          </header>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <StatCard label="الرصيد السيادي" value={`${wallet?.balance ?? profile?.balance ?? 0} EGP`} icon={<Wallet className="text-emerald-400" />} />
            <StatCard label="الموثوقية الرقمية" value={`${profile?.trustScore ?? 50}%`} icon={<Shield className="text-indigo-400" />} />
            <StatCard label="المعاملات المالية" value={`${wallet?.transactions?.length ?? 0}`} icon={<Activity className="text-amber-400" />} />
            <StatCard label="الحالة الأمنية" value={profile?.isBanned ? "محظور" : "آمن"} icon={<Shield className={profile?.isBanned ? "text-red-400" : "text-emerald-400"} />} />
          </div>

          <div className="grid lg:grid-cols-12 gap-10">
            <div className="lg:col-span-8">
               <Card className="glass-cosmic border-none rounded-[3.5rem] p-10 h-full">
                  <h3 className="text-2xl font-black mb-8 border-b border-white/5 pb-4">آخر النشاطات السيادية</h3>
                  <div className="space-y-4">
                    {wallet?.transactions?.map((t: any) => (
                      <div key={t.id} className="flex items-center justify-between p-6 glass rounded-2xl border-white/5 bg-white/[0.01]">
                         <div>
                            <p className="font-bold text-white">{t.service}</p>
                            <p className="text-[10px] text-white/20 uppercase font-black">{t.type}</p>
                         </div>
                         <p className={`text-xl font-black ${t.amount < 0 ? 'text-red-400' : 'text-emerald-400'} tabular-nums`}>
                           {t.amount} EGP
                         </p>
                      </div>
                    ))}
                    {(!wallet?.transactions || wallet.transactions.length === 0) && (
                      <p className="text-center py-20 text-white/10 font-bold">لا توجد معاملات مسجلة حالياً.</p>
                    )}
                  </div>
               </Card>
            </div>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}

function StatCard({ label, value, icon }: any) {
  return (
    <Card className="glass-cosmic border-none rounded-[2.5rem] p-8 group hover:scale-[1.05] transition-all duration-500 shadow-xl">
      <div className="h-14 w-14 rounded-2xl bg-white/5 flex items-center justify-center border border-white/5 mb-6">{icon}</div>
      <p className="text-[10px] text-white/30 font-black uppercase mb-1 tracking-widest">{label}</p>
      <h4 className="text-3xl font-black text-white tabular-nums tracking-tighter">{value}</h4>
    </Card>
  );
}
