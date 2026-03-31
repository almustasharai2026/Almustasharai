"use client";

import { useUser } from "@/firebase";
import ProtectedRoute from "@/components/ProtectedRoute";
import SovereignLayout from "@/components/SovereignLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Wallet, ShieldCheck, Crown, Activity, Sparkles, FileText, History, Plus, ChevronLeft } from "lucide-react";
import Link from "next/link";
import { motion } from "framer-motion";
import { getBalance, roles as ROLES_LIST } from "@/lib/roles";

export default function Dashboard() {
  const { user, profile, role } = useUser();
  const balance = getBalance(profile);

  return (
    <ProtectedRoute>
      <SovereignLayout activeId="bookings">
        <div className="min-h-screen p-8 lg:p-20 font-sans">
          <div className="max-w-5xl mx-auto space-y-12">
            
            <header className="flex flex-col md:flex-row items-center justify-between gap-8 mb-16">
              <div className="text-center md:text-right space-y-4">
                <div className="sovereign-badge mx-auto md:mx-0">
                   <ShieldCheck className="h-3 w-3" /> Citizen Identity Verified
                </div>
                <h1 className="text-5xl font-black text-slate-900 dark:text-white tracking-tighter">
                  مرحباً بك، <span className="text-gradient">سيادة {profile?.fullName?.split(' ')[0] || "المواطن"}</span>
                </h1>
                <p className="text-lg text-muted-foreground font-bold">معرف الهوية: <span className="font-mono text-primary">{user?.uid.substring(0, 12).toUpperCase()}</span></p>
              </div>
              {role === ROLES_LIST.ADMIN && (
                <Link href="/admin">
                  <button className="bg-primary/5 hover:bg-primary/10 border border-primary/20 text-primary px-8 py-4 rounded-2xl font-black text-sm flex items-center gap-4 transition-all shadow-xl">
                    <Crown className="h-6 w-6" /> غرفة القيادة العليا
                  </button>
                </Link>
              )}
            </header>

            <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-stretch">
              <div className="md:col-span-7">
                <motion.div whileHover={{ scale: 1.01 }} className="h-full">
                  <Card className="h-full bg-[#1e1b4b] dark:bg-[#0a0a1f] border-none rounded-[3.5rem] shadow-3xl relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-12 opacity-5 group-hover:rotate-12 transition-transform duration-1000">
                      <Wallet className="h-48 w-48 text-white" />
                    </div>
                    
                    <CardContent className="p-12 space-y-10 relative z-10">
                      <div className="space-y-2">
                        <p className="text-[10px] font-black text-primary uppercase tracking-[0.4em]">المحفظة السيادية الموثقة</p>
                        <div className="flex items-baseline gap-4">
                          <h3 className="text-7xl font-black text-white tabular-nums tracking-tighter">
                            {balance === Infinity ? "∞" : balance.toLocaleString()}
                          </h3>
                          <span className="text-xl font-bold text-white/40 uppercase tracking-widest">EGP</span>
                        </div>
                      </div>

                      <div className="flex flex-wrap gap-4">
                        <Link href="/pricing">
                          <button className="bg-primary text-white px-8 py-4 rounded-2xl font-black text-sm shadow-xl hover:scale-105 transition-all flex items-center gap-3">
                            <Plus className="h-5 w-5" /> شحن الوحدات
                          </button>
                        </Link>
                        <Link href="/bookings">
                          <button className="bg-white/5 hover:bg-white/10 text-white border border-white/10 px-8 py-4 rounded-2xl font-black text-sm transition-all flex items-center gap-3">
                            <History className="h-5 w-5 opacity-40" /> سجل المعاملات
                          </button>
                        </Link>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              </div>

              <div className="md:col-span-5 grid grid-cols-1 gap-8">
                 <QuickStat label="استشارات نشطة" value="١٢" icon={<Activity className="text-blue-500" />} />
                 <QuickStat label="وثائق صادرة" value="٠٨" icon={<FileText className="text-violet-500" />} />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 pt-10">
              <NavBox href="/bot" title="البوت الذكي" desc="استشارات AI فورية" icon={<Sparkles />} color="blue" />
              <NavBox href="/consultants" title="مجلس الخبراء" desc="اتصال مرئي مشفر" icon={<Activity />} color="violet" />
              <NavBox href="/templates" title="المكتبة" desc="وثائق وعقود معتمدة" icon={<FileText />} color="amber" />
            </div>

          </div>
        </div>
      </SovereignLayout>
    </ProtectedRoute>
  );
}

function QuickStat({ label, value, icon }: any) {
  return (
    <Card className="rounded-[2.5rem] bg-white dark:bg-white/5 border border-border dark:border-white/5 shadow-xl hover:bg-slate-50 transition-colors">
      <CardContent className="p-8 flex items-center justify-between">
        <div className="space-y-1">
          <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">{label}</p>
          <p className="text-3xl font-black tabular-nums">{value}</p>
        </div>
        <div className="h-14 w-14 rounded-2xl bg-secondary dark:bg-white/5 flex items-center justify-center border border-border dark:border-white/5 shadow-inner">
          {icon}
        </div>
      </CardContent>
    </Card>
  );
}

function NavBox({ href, title, desc, icon, color }: any) {
  const colors: any = {
    blue: "text-blue-500 bg-blue-500/5 hover:bg-blue-500/10",
    violet: "text-violet-500 bg-violet-500/5 hover:bg-violet-500/10",
    amber: "text-amber-500 bg-amber-500/5 hover:bg-amber-500/10",
  };
  return (
    <Link href={href} className="group">
      <div className="p-10 bg-white dark:bg-slate-900 border border-border dark:border-white/5 rounded-[3rem] text-right space-y-6 hover:shadow-2xl transition-all duration-500 hover:scale-[1.05] relative overflow-hidden">
        <div className={`h-16 w-16 rounded-[1.5rem] flex items-center justify-center shadow-inner border transition-transform duration-500 group-hover:rotate-12 ${colors[color]}`}>
          <div className="scale-125">{icon}</div>
        </div>
        <div>
          <h4 className="font-black text-2xl tracking-tighter">{title}</h4>
          <p className="text-xs text-muted-foreground font-bold uppercase tracking-widest mt-1 opacity-40">{desc}</p>
        </div>
        <div className="absolute bottom-10 left-10 p-2 bg-secondary rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
           <ChevronLeft className="h-4 w-4" />
        </div>
      </div>
    </Link>
  );
}
