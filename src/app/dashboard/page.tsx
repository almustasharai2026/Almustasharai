
"use client";

import { useUser } from "@/firebase";
import ProtectedRoute from "@/components/ProtectedRoute";
import SovereignLayout from "@/components/SovereignLayout";
import { ShieldCheck, Crown, Sparkles, FileText, Activity } from "lucide-react";
import Link from "next/link";
import { motion } from "framer-motion";
import { getBalance, roles as ROLES_LIST } from "@/lib/roles";
import RoyalWallet from "@/components/RoyalWallet";

/**
 * لوحة تحكم المواطن السيادي المحدثة.
 * تدمج المحفظة الملكية كعنصر أساسي في القيادة المالية.
 */
export default function Dashboard() {
  const { user, profile, role, isUserLoading } = useUser();
  const balance = getBalance(profile);

  return (
    <ProtectedRoute>
      <SovereignLayout activeId="bookings">
        <div className="min-h-screen p-8 lg:p-20 font-sans bg-sovereign-cinematic">
          <div className="max-w-6xl mx-auto space-y-20">
            
            {/* Sovereign Header */}
            <header className="flex flex-col md:flex-row items-center justify-between gap-12">
              <div className="text-center md:text-right space-y-6">
                <div className="sovereign-badge mx-auto md:mx-0 animate-pulse">
                   <ShieldCheck className="h-3 w-3" /> Citizen Identity Protocol Verified
                </div>
                <h1 className="text-6xl md:text-7xl font-black text-white tracking-tighter leading-tight">
                  مرحباً بك، <br />
                  <span className="text-gradient">سيادة {profile?.fullName?.split(' ')[0] || "المواطن"}</span>
                </h1>
                <p className="text-xl text-white/30 font-bold">
                  مركز القيادة المالية والقانونية للمعرف: <span className="font-mono text-primary bg-primary/5 px-4 py-1 rounded-lg">{user?.uid.substring(0, 8).toUpperCase()}</span>
                </p>
              </div>
              
              {role === ROLES_LIST.ADMIN && (
                <Link href="/admin">
                  <motion.button 
                    whileHover={{ scale: 1.05 }}
                    className="bg-primary/10 hover:bg-primary/20 border-2 border-primary/30 text-primary px-10 py-6 rounded-[2.5rem] font-black text-lg flex items-center gap-5 transition-all shadow-3xl group"
                  >
                    <Crown className="h-8 w-8 group-hover:rotate-12 transition-transform" /> 
                    غرفة القيادة العليا
                  </motion.button>
                </Link>
              )}
            </header>

            {/* The Royal Wallet Section - قسم المحفظة الملكية */}
            <section className="space-y-8">
               <div className="flex items-center gap-4 px-6">
                  <div className="h-1 w-12 bg-primary rounded-full" />
                  <h3 className="text-2xl font-black text-white tracking-tight uppercase">Sovereign Financial Hub</h3>
               </div>
               <RoyalWallet userRole={role} balance={balance} />
            </section>

            {/* Strategic Gates - البوابات الاستراتيجية */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-10">
              <NavBox href="/bot" title="البوت الذكي" desc="استشارات AI فورية" icon={<Sparkles />} color="blue" />
              <NavBox href="/consultants" title="مجلس الخبراء" desc="اتصال مرئي مشفر" icon={<Activity />} color="violet" />
              <NavBox href="/templates" title="المكتبة الرقمية" desc="وثائق وعقود معتمدة" icon={<FileText />} color="amber" />
            </div>

            {/* Footer Sign-off */}
            <footer className="text-center pt-20 pb-10 opacity-10">
               <p className="text-[10px] font-black uppercase tracking-[1em] text-white">king2026 Sovereign Protocol</p>
            </footer>

          </div>
        </div>
      </SovereignLayout>
    </ProtectedRoute>
  );
}

function NavBox({ href, title, desc, icon, color }: any) {
  const colors: any = {
    blue: "text-blue-500 bg-blue-500/5 hover:border-blue-500/30",
    violet: "text-violet-500 bg-violet-500/5 hover:border-violet-500/30",
    amber: "text-amber-500 bg-amber-500/5 hover:border-amber-500/30",
  };
  return (
    <Link href={href} className="group">
      <div className={`p-12 glass-cosmic rounded-[4rem] text-right space-y-8 hover:shadow-3xl transition-all duration-700 hover:scale-[1.05] relative overflow-hidden border-white/5 ${colors[color]}`}>
        <div className={`h-20 w-20 rounded-[2rem] bg-white/5 flex items-center justify-center shadow-inner border border-white/10 transition-all duration-700 group-hover:rotate-12 group-hover:bg-current group-hover:text-black`}>
          <div className="scale-[1.8]">{icon}</div>
        </div>
        <div>
          <h4 className="font-black text-3xl text-white tracking-tighter">{title}</h4>
          <p className="text-xs text-white/20 font-bold uppercase tracking-widest mt-2">{desc}</p>
        </div>
        <div className="absolute bottom-12 left-12 p-3 bg-white/5 rounded-2xl opacity-0 group-hover:opacity-100 transition-all duration-500 translate-x-10 group-hover:translate-x-0">
           <ChevronLeft className="h-5 w-5 text-primary" />
        </div>
      </div>
    </Link>
  );
}
