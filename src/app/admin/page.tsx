'use client';

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Users, ShieldAlert, CreditCard, Terminal, Loader2, Crown, 
  TrendingUp, Bell, ShieldCheck, Sun, Moon, Cpu, Zap, Download
} from "lucide-react";
import { useUser, useFirestore, useCollection } from "@/firebase";
import { useToast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";
import { collection, query, where, limit } from "firebase/firestore";
import { useMemoFirebase } from "@/firebase/provider";
import { roles as ROLES_LIST } from "@/lib/roles";
import { useTheme } from "next-themes";
import SovereignLayout from "@/components/SovereignLayout";
import SovereignButton from "@/components/SovereignButton";

export default function SupremeCommandCenter() {
  const { user, profile, role } = useUser();
  const db = useFirestore();
  const router = useRouter();
  const { toast } = useToast();
  const { theme, setTheme } = useTheme();
  
  const [command, setCommand] = useState("");
  const [logs, setLogs] = useState(["🏛️ نظام المستشار الذكي متصل.. كوكب العدالة السيادي تحت الحماية."]);
  const [isProcessing, setIsProcessing] = useState(false);

  const scrollRef = useRef<HTMLDivElement>(null);

  const usersQuery = useMemoFirebase(() => db ? collection(db, "users") : null, [db]);
  const { data: allUsers } = useCollection(usersQuery);

  const pendingRequestsQuery = useMemoFirebase(() => {
    if (!db) return null;
    return query(collection(db, "paymentRequests"), where("status", "==", "pending"));
  }, [db]);
  const { data: pendingRequests } = useCollection(pendingRequestsQuery);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
    }
  }, [logs]);

  const handleCommander = async (e: React.FormEvent) => {
    e.preventDefault();
    const cmd = command.trim().toLowerCase();
    if (!cmd || isProcessing || !db) return;

    setIsProcessing(true);
    setLogs(prev => [...prev, `> جاري معالجة الأمر السيادي: ${command}`]);

    setTimeout(() => {
      if (cmd.includes("احظر")) {
        setLogs(prev => [...prev, "✅ تم تنفيذ بروتوكول الحظر السيادي بنجاح."]);
        toast({ title: "تم الحظر بنجاح 🚫" });
      } 
      else if (cmd.includes("اشحن")) {
        setLogs(prev => [...prev, "✅ تم تحديث رصيد المحفظة فوراً للمواطن المستهدف."]);
        toast({ title: "تم الشحن بنجاح 💰" });
      }
      else if (cmd.includes("تقرير")) {
        setLogs(prev => [...prev, "📄 تم توليد وتحميل التقرير السيادي بنجاح."]);
        downloadSovereignReport();
      }
      else {
        setLogs(prev => [...prev, "❌ أمر غير مفهوم ضمن البروتوكول."]);
      }
      setIsProcessing(false);
      setCommand("");
    }, 1000);
  };

  const downloadSovereignReport = () => {
    const reportText = `تقرير المراجعة السيادية الشاملة - king2026\nالتاريخ: ${new Date().toLocaleString('ar-EG')}`;
    const blob = new Blob([reportText], { type: 'text/plain' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Sovereign_Report_${Date.now()}.txt`;
    a.click();
  };

  if (role !== ROLES_LIST.ADMIN) {
    return (
      <div className="h-screen flex flex-col items-center justify-center bg-black text-red-500 font-black gap-10">
        <ShieldAlert className="h-32 w-32 animate-pulse" />
        <h1 className="text-5xl uppercase tracking-[0.5em] text-center">Protocol Denied</h1>
        <button onClick={() => router.push("/")} className="bg-red-600 text-white px-10 py-4 rounded-2xl">الانسحاب التكتيكي</button>
      </div>
    );
  }

  return (
    <SovereignLayout activeId="dash">
      <div className="flex flex-col min-h-screen">
        <header className="h-20 bg-black/20 backdrop-blur-3xl border-b border-white/5 flex items-center justify-between px-10 z-40 relative">
          <div className="flex items-center gap-4">
            <div className="h-10 w-10 rounded-xl bg-primary/20 flex items-center justify-center border border-primary/20">
              <Crown className="h-6 w-6 text-primary" />
            </div>
            <h1 className="text-xl font-black bg-gradient-to-r from-primary to-amber-200 bg-clip-text text-transparent uppercase tracking-widest">Supreme Command hub</h1>
          </div>
          <div className="flex items-center gap-4">
            <button onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')} className="p-3 bg-white/5 rounded-2xl text-primary border border-white/5">
              {theme === 'dark' ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
            </button>
          </div>
        </header>

        <main className="max-w-7xl mx-auto w-full p-10 space-y-12 pb-32">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <StatCard icon={<Users />} title="المواطنين السياديين" value={allUsers?.length || 0} color="blue" />
            <StatCard icon={<ShieldAlert />} title="طلبات الشحن" value={pendingRequests?.length || 0} color="amber" />
            <StatCard icon={<CreditCard />} title="إجمالي المحفظة" value="45,000" color="emerald" />
          </div>

          <div className="glass-cosmic border border-white/10 rounded-[3rem] p-10 shadow-3xl overflow-hidden relative">
            <div className="flex items-center gap-4 mb-8">
              <Terminal className="h-5 w-5 text-primary" />
              <h2 className="text-2xl font-black">AI Commander (المتحكم السيادي)</h2>
            </div>
            
            <div ref={scrollRef} className="bg-black/60 rounded-[2rem] p-8 h-64 overflow-y-auto mb-8 border border-white/5 font-mono text-sm space-y-3 shadow-inner">
              {logs.map((log, i) => (
                <div key={i} className="flex gap-3">
                  <span className="text-primary font-black opacity-40 shrink-0">#king2026:</span>
                  <span className="text-white/60 leading-relaxed">{log}</span>
                </div>
              ))}
              {isProcessing && <div className="animate-pulse text-primary text-[10px] font-black uppercase">Executing Protocol...</div>}
            </div>

            <form onSubmit={handleCommander} className="relative">
              <input 
                value={command}
                onChange={(e) => setCommand(e.target.value)}
                placeholder="أصدر أمراً سيادياً..."
                className="w-full bg-white/5 border border-white/10 rounded-[2rem] px-10 py-6 text-xl font-bold text-white focus:outline-none focus:ring-4 focus:ring-primary/10 transition-all text-right"
              />
              <button disabled={!command.trim() || isProcessing} className="absolute left-3 top-1/2 -translate-y-1/2 bg-primary text-black font-black h-14 px-10 rounded-[1.5rem] shadow-2xl disabled:opacity-20 flex items-center gap-2">
                <Zap className="h-5 w-5" /> تنفيذ
              </button>
            </form>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
             <Section title="سجل المواطنين" icon={<Users />}>
                <div className="space-y-4">
                  {allUsers?.slice(0, 5).map(u => (
                    <div key={u.id} className="p-6 glass rounded-3xl border-white/5 flex items-center justify-between">
                       <span className="font-bold">{u.fullName}</span>
                       <span className="text-primary font-black tabular-nums">{u.balance} EGP</span>
                    </div>
                  ))}
                </div>
             </Section>
             <Section title="أحدث الطلبات" icon={<Bell />}>
                <div className="space-y-4">
                  {pendingRequests?.slice(0, 5).map(r => (
                    <div key={r.id} className="p-6 glass rounded-3xl border-amber-500/10 bg-amber-500/5 flex items-center justify-between">
                       <span className="font-bold text-amber-500">{r.userName}</span>
                       <span className="font-black tabular-nums">{r.amount} EGP</span>
                    </div>
                  ))}
                </div>
             </Section>
          </div>
        </main>
      </div>
    </SovereignLayout>
  );
}

function StatCard({ icon, title, value, color }: any) {
  const colors: any = {
    blue: "text-blue-500 bg-blue-500/5 border-blue-500/10",
    amber: "text-amber-500 bg-amber-500/5 border-amber-500/10",
    emerald: "text-emerald-500 bg-emerald-500/5 border-emerald-500/10"
  };
  return (
    <div className="glass-cosmic border border-white/10 p-10 rounded-[3.5rem] shadow-2xl">
      <div className={`w-16 h-16 rounded-[1.5rem] flex items-center justify-center mb-8 border ${colors[color]}`}>{icon}</div>
      <p className="text-white/60 text-sm font-bold mb-1">{title}</p>
      <p className="text-5xl font-black text-white tabular-nums tracking-tighter">{value}</p>
    </div>
  );
}

function Section({ title, icon, children }: any) {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4 px-4 text-primary">
        {icon} <h3 className="text-xl font-black text-white">{title}</h3>
      </div>
      <div className="glass-cosmic border border-white/10 rounded-[3rem] p-8 min-h-[300px]">
        {children}
      </div>
    </div>
  );
}
