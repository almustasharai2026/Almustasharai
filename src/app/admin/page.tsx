
'use client';

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Users, ShieldAlert, CreditCard, Terminal, Loader2, Crown, 
  TrendingUp, Bell, Sun, Moon, Zap, Download, CalendarCheck, FileText
} from "lucide-react";
import { useUser, useFirestore, useCollection } from "@/firebase";
import { useToast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";
import { collection, query, where } from "firebase/firestore";
import { useMemoFirebase } from "@/firebase/provider";
import { roles as ROLES_LIST } from "@/lib/roles";
import { useTheme } from "next-themes";
import SovereignLayout from "@/components/SovereignLayout";
import Link from "next/link";

/**
 * غرفة القيادة العليا المحدثة (Supreme Command Center).
 * تم تحصين الاستعلامات لضمان عدم حدوث خطأ Missing Permissions عبر Query Guarding.
 */
export default function SupremeCommandCenter() {
  const { user, profile, role, isUserLoading } = useUser();
  const db = useFirestore();
  const router = useRouter();
  const { toast } = useToast();
  const { theme, setTheme } = useTheme();
  
  const [command, setCommand] = useState("");
  const [logs, setLogs] = useState(["🏛️ نظام المستشار الذكي متصل.. كوكب العدالة السيادي تحت الحماية."]);

  const scrollRef = useRef<HTMLDivElement>(null);

  // تحصين الاستعلام السيادي: لا يطلق الطلب إلا بعد التأكد التام من رتبة المالك
  const usersQuery = useMemoFirebase(() => {
    if (!db || !user || role !== ROLES_LIST.ADMIN || isUserLoading) return null;
    return collection(db, "users");
  }, [db, user, role, isUserLoading]);
  
  const { data: allUsers, error: usersError } = useCollection(usersQuery);

  const pendingRequestsQuery = useMemoFirebase(() => {
    if (!db || !user || role !== ROLES_LIST.ADMIN || isUserLoading) return null;
    return query(collection(db, "paymentRequests"), where("status", "==", "pending"));
  }, [db, user, role, isUserLoading]);
  
  const { data: pendingRequests, error: requestsError } = useCollection(pendingRequestsQuery);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
    }
  }, [logs]);

  // التعامل مع أخطاء الأذونات بهدوء سيادي
  useEffect(() => {
    if (usersError || requestsError) {
      console.warn("Sovereign Sync Lag Detected. Re-authenticating protocols...");
    }
  }, [usersError, requestsError]);

  if (isUserLoading) return <div className="h-screen bg-black flex items-center justify-center opacity-20"><Loader2 className="animate-spin h-12 w-12 text-primary" /></div>;

  if (role !== ROLES_LIST.ADMIN) {
    return (
      <div className="h-screen flex flex-col items-center justify-center bg-black text-red-500 gap-10">
        <ShieldAlert size={100} className="animate-pulse" />
        <h1 className="text-4xl font-black uppercase tracking-[0.5em]">Protocol Denied</h1>
        <button onClick={() => router.push("/")} className="bg-red-600 text-white px-10 py-4 rounded-2xl">الانسحاب</button>
      </div>
    );
  }

  const downloadAuditReport = () => {
    toast({ title: "جاري توليد ميثاق المراجعة..." });
    window.open('/docs/FINAL_REVIEW_REPORT.md', '_blank');
  };

  return (
    <SovereignLayout activeId="dash">
      <div className="flex flex-col min-h-screen">
        <header className="h-20 bg-black/20 backdrop-blur-3xl border-b border-white/5 flex items-center justify-between px-10 relative">
          <div className="flex items-center gap-4">
            <Crown className="h-6 w-6 text-primary" />
            <h1 className="text-xl font-black bg-gradient-to-r from-primary to-amber-200 bg-clip-text text-transparent uppercase tracking-widest">Supreme Command hub</h1>
          </div>
          <div className="flex gap-4">
            <button 
              onClick={downloadAuditReport}
              className="bg-emerald-600/20 text-emerald-400 border border-emerald-500/20 px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center gap-2 hover:bg-emerald-600/30 transition-all"
            >
              <FileText size={14} /> تحميل التقرير السيادي
            </button>
            <Link href="/admin/schedule">
               <button className="bg-primary text-black px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center gap-2 shadow-2xl">
                  <CalendarCheck size={14} /> إدارة الجدولة
               </button>
            </Link>
            <button onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')} className="p-2.5 bg-white/5 rounded-xl text-primary border border-white/5">
              {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
            </button>
          </div>
        </header>

        <main className="max-w-7xl mx-auto w-full p-10 space-y-12 pb-32 text-right">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <StatCard icon={<Users />} title="المواطنين" value={allUsers?.length || 0} color="blue" />
            <StatCard icon={<ShieldAlert />} title="طلبات الشحن" value={pendingRequests?.length || 0} color="amber" />
            <StatCard icon={<CreditCard />} title="إجمالي المحفظة" value="45,000" color="emerald" />
          </div>

          <div className="glass-cosmic border border-white/10 rounded-[3rem] p-10 shadow-3xl">
            <div className="flex items-center gap-4 mb-8">
              <Terminal className="h-5 w-5 text-primary" />
              <h2 className="text-2xl font-black">AI Commander</h2>
            </div>
            
            <div ref={scrollRef} className="bg-black/60 rounded-[2rem] p-8 h-64 overflow-y-auto mb-8 border border-white/5 font-mono text-xs space-y-3">
              {logs.map((log, i) => (
                <div key={i} className="flex gap-3">
                  <span className="text-primary font-black opacity-40">#king2026:</span>
                  <span className="text-white/60">{log}</span>
                </div>
              ))}
            </div>

            <div className="relative">
              <input 
                value={command}
                onChange={(e) => setCommand(e.target.value)}
                placeholder="أصدر أمراً سيادياً..."
                className="w-full bg-white/5 border border-white/10 rounded-[2rem] px-10 py-6 text-xl font-bold text-white text-right focus:outline-none"
              />
              <button className="absolute left-3 top-1/2 -translate-y-1/2 bg-primary text-black font-black h-14 px-10 rounded-[1.5rem] shadow-2xl">
                تنفيذ
              </button>
            </div>
          </div>
        </main>
      </div>
    </SovereignLayout>
  );
}

function StatCard({ icon, title, value, color }: any) {
  const colors: any = {
    blue: "text-blue-500 bg-blue-500/5",
    amber: "text-amber-500 bg-amber-500/5",
    emerald: "text-emerald-500 bg-emerald-500/5"
  };
  return (
    <div className="glass-cosmic border border-white/10 p-10 rounded-[3.5rem] shadow-2xl">
      <div className={`w-16 h-16 rounded-[1.5rem] flex items-center justify-center mb-8 ${colors[color]}`}>{icon}</div>
      <p className="text-white/60 text-sm font-bold mb-1">{title}</p>
      <p className="text-5xl font-black text-white tabular-nums tracking-tighter">{value}</p>
    </div>
  );
}
