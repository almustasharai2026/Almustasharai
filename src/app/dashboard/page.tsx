"use client";

import { useUser } from "@/firebase";
import ProtectedRoute from "@/components/ProtectedRoute";
import { Card, CardContent } from "@/components/ui/card";
import { Wallet, CalendarCheck, Gavel, ArrowLeftRight, ShieldCheck, ChevronLeft } from "lucide-react";
import Link from "next/link";
import { motion } from "framer-motion";
import { getBalance } from "@/lib/roles";

/**
 * لوحة التحكم السيادية للمواطن الرقمي.
 * توفر رؤية شاملة للرصيد، الحجوزات، والوصول السريع للهيئة القانونية.
 */
export default function Dashboard() {
  const { user, profile } = useUser();
  const balance = getBalance(profile);

  return (
    <ProtectedRoute>
      <div className="p-5 space-y-6 animate-in fade-in duration-500">
        
        {/* Sovereign Header */}
        <div className="flex items-center justify-between px-1">
          <div className="text-right">
            <h2 className="text-xl font-black text-primary tracking-tight">أهلاً، {profile?.fullName?.split(' ')[0] || "سيادة المواطن"}</h2>
            <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest">Sovereign Profile ID: {user?.uid.substring(0, 8)}</p>
          </div>
          <div className="h-10 w-10 rounded-full bg-accent/10 flex items-center justify-center border border-accent/20">
            <ShieldCheck className="h-5 w-5 text-accent" />
          </div>
        </div>

        {/* Financial Heart (Balance Card) */}
        <motion.div 
          whileHover={{ scale: 1.02 }}
          transition={{ type: "spring", stiffness: 400, damping: 10 }}
        >
          <Card className="bg-primary border-none rounded-[2rem] shadow-xl shadow-primary/20 relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:rotate-12 transition-transform duration-700">
              <Wallet className="h-24 w-24 text-white" />
            </div>
            <CardContent className="p-8 space-y-2 relative z-10">
              <p className="text-xs font-black text-accent uppercase tracking-[0.2em]">الرصيد السيادي المتاح</p>
              <div className="flex items-baseline gap-2">
                <h3 className="text-4xl font-black text-white tabular-nums">
                  {balance === Infinity ? "∞" : balance}
                </h3>
                <span className="text-sm font-bold text-white/60">جنيه مصري</span>
              </div>
              <div className="pt-4">
                <Link href="/pricing" className="text-[10px] bg-white/10 hover:bg-white/20 text-white px-4 py-2 rounded-full font-bold transition-colors inline-flex items-center gap-2">
                  شحن المحفظة <ChevronLeft className="h-3 w-3" />
                </Link>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Quick Navigation Grid */}
        <div className="grid grid-cols-2 gap-4">
          <NavCard 
            href="/bookings" 
            title="حجوزاتي" 
            desc="الجلسات المجدولة" 
            icon={<CalendarCheck className="h-6 w-6 text-primary" />} 
          />
          <NavCard 
            href="/consultants" 
            title="المستشارين" 
            desc="مجلس الخبراء" 
            icon={<Gavel className="h-6 w-6 text-primary" />} 
          />
        </div>

        {/* Recent Activity Section Placeholder */}
        <div className="space-y-4 pt-2">
          <div className="flex items-center justify-between px-1">
            <h3 className="text-xs font-black uppercase tracking-widest text-muted-foreground/50">آخر النشاطات</h3>
            <ArrowLeftRight className="h-3 w-3 text-muted-foreground/30" />
          </div>
          
          <div className="space-y-3">
            <div className="p-4 bg-secondary/30 rounded-2xl border border-border/50 flex items-center justify-between opacity-60">
              <span className="text-[10px] font-bold text-muted-foreground">لا توجد عمليات حديثة موثقة</span>
              <div className="h-1.5 w-1.5 rounded-full bg-muted-foreground/30" />
            </div>
          </div>
        </div>

      </div>
    </ProtectedRoute>
  );
}

function NavCard({ href, title, desc, icon }: { href: string; title: string; desc: string; icon: React.ReactNode }) {
  return (
    <Link href={href} className="block group">
      <div className="p-6 bg-white dark:bg-slate-800 border border-border/50 rounded-[2rem] text-right space-y-4 hover:border-accent/40 transition-all duration-300 shadow-sm hover:shadow-md">
        <div className="h-12 w-12 rounded-2xl bg-secondary flex items-center justify-center group-hover:scale-110 transition-transform">
          {icon}
        </div>
        <div>
          <h4 className="font-black text-primary text-sm">{title}</h4>
          <p className="text-[10px] text-muted-foreground font-medium">{desc}</p>
        </div>
      </div>
    </Link>
  );
}
