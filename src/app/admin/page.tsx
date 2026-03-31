
'use client';

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  ShieldCheck, Zap, Users, CreditCard, 
  Activity, Ban, Unlock, RefreshCw, Terminal, Eye,
  Crown, ShieldAlert, Loader2, Sun, Moon, LayoutDashboard
} from "lucide-react";
import { useUser, useFirestore, useCollection } from "@/firebase";
import { useToast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";
import { collection, query, where, doc, updateDoc, increment, serverTimestamp } from "firebase/firestore";
import { useMemoFirebase } from "@/firebase/provider";
import { roles as ROLES_LIST } from "@/lib/roles";
import { useTheme } from "next-themes";
import SovereignLayout from "@/components/SovereignLayout";

/**
 * غرفة القيادة العليا - إصدار "سيطرة الملك" (God Mode v5.0).
 * تمنح المالك king2026 سلطة مطلقة وتحكماً برمجياً كاملاً في الكوكب.
 */
export default function SupremeCommandCenter() {
  const { user, profile, role, isUserLoading } = useUser();
  const db = useFirestore();
  const router = useRouter();
  const { toast } = useToast();
  const { theme, setTheme } = useTheme();
  
  const [command, setCommand] = useState("");
  const [isAutoPilot, setIsAutoPilot] = useState(true);
  const [logs, setLogs] = useState([
    "🏛️ بروتوكول king2026 نشط.. تم توثيق الهوية الملكية.",
    "🛡️ الدرع الواقي قيد التشغيل (Auto-Pilot: ON).",
    "📡 الاتصال بالقاعدة المركزية مستقر."
  ]);

  const scrollRef = useRef<HTMLDivElement>(null);

  // جلب البيانات الحية للرقابة والتحكم
  const usersQuery = useMemoFirebase(() => {
    if (!db || !user || role !== ROLES_LIST.ADMIN) return null;
    return collection(db, "users");
  }, [db, user, role]);
  const { data: allUsers } = useCollection(usersQuery);

  const pendingRequestsQuery = useMemoFirebase(() => {
    if (!db || !user || role !== ROLES_LIST.ADMIN) return null;
    return query(collection(db, "paymentRequests"), where("status", "==", "pending"));
  }, [db, user, role]);
  const { data: pendingRequests } = useCollection(pendingRequestsQuery);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
    }
  }, [logs]);

  // محرك معالجة الأوامر السيادية
  const handleSupremeCommand = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!command.trim() || !db) return;

    const cmd = command.trim().toLowerCase();
    const cmdParts = cmd.split(" ");
    const action = cmdParts[0];
    
    setLogs(prev => [...prev, `> جاري معالجة الأمر السيادي: ${command}`]);

    try {
      if (action === "احظر") {
        const targetId = cmdParts[1];
        if (targetId) {
          await updateDoc(doc(db, "users", targetId), { isBanned: true });
          setLogs(prev => [...prev, `✅ تم حظر المواطن (ID: ${targetId}) بقرار ملكي.`]);
        }
      } else if (action === "شحن") {
        const amount = Number(cmdParts[1]);
        const targetId = cmdParts[2];
        if (targetId && !isNaN(amount)) {
          await updateDoc(doc(db, "users", targetId), { balance: increment(amount) });
          setLogs(prev => [...prev, `💰 تم إضافة ${amount} وحدة للمواطن (ID: ${targetId}).`]);
        }
      } else if (action === "autopilot") {
        setIsAutoPilot(!isAutoPilot);
        setLogs(prev => [...prev, `🔄 تم تبديل وضع القيادة إلى: ${!isAutoPilot ? 'Auto' : 'Manual'}`]);
      } else {
        setLogs(prev => [...prev, "❌ عذراً سيادة المالك، لم يتم العثور على هذا البروتوكول في ميثاق الأوامر."]);
      }
    } catch (err) {
      setLogs(prev => [...prev, `⚠️ فشل تنفيذ العملية: خطأ في مزامنة Firestore.`]);
    }

    setCommand("");
  };

  const quickCredit = async (amount: number) => {
    if (!user || !db) return;
    toast({ title: `جاري شحن ${amount} EGP يدوياً...` });
    setLogs(prev => [...prev, `💸 تم تفعيل بروتوكول الشحن اليدوي: +${amount} EGP.`]);
  };

  if (isUserLoading) return <div className="h-screen bg-[#020202] flex items-center justify-center"><Loader2 className="animate-spin text-primary h-12 w-12" /></div>;

  if (role !== ROLES_LIST.ADMIN) {
    return (
      <div className="h-screen flex flex-col items-center justify-center bg-black text-red-500 gap-10">
        <ShieldAlert size={100} className="animate-pulse" />
        <h1 className="text-4xl font-black uppercase tracking-[0.5em]">Protocol Denied</h1>
        <button onClick={() => router.push("/")} className="bg-red-600 text-white px-10 py-4 rounded-2xl">تراجع</button>
      </div>
    );
  }

  return (
    <SovereignLayout activeId="dash">
      <div className="min-h-screen bg-[#020202] text-white p-10 font-sans relative overflow-hidden" dir="rtl">
        
        {/* Glows */}
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-primary/5 blur-[150px] -z-10" />

        {/* Header Section */}
        <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-8 mb-16 border-b border-white/5 pb-10">
          <div className="space-y-2">
            <h1 className="text-5xl font-black tracking-tighter flex items-center gap-5 text-white">
              <ShieldCheck className="text-primary w-14 h-14 shadow-3xl" /> 
              سيطرة <span className="text-primary">الملك</span>
            </h1>
            <p className="text-white/20 font-mono text-[10px] uppercase tracking-[0.4em]">Master Sovereign ID: king2026_supreme</p>
          </div>

          <div className={`p-1.5 rounded-[1.8rem] border-2 transition-all duration-700 flex gap-2 ${isAutoPilot ? 'border-primary/20 bg-primary/5' : 'border-amber-500/20 bg-amber-500/5'}`}>
            <button 
              onClick={() => setIsAutoPilot(true)}
              className={`px-8 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all ${isAutoPilot ? 'bg-primary text-black shadow-2xl' : 'text-white/20 hover:text-white'}`}
            >
              الذكاء الاصطناعي (Auto)
            </button>
            <button 
              onClick={() => setIsAutoPilot(false)}
              className={`px-8 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all ${!isAutoPilot ? 'bg-amber-500 text-black shadow-2xl' : 'text-white/20 hover:text-white'}`}
            >
              التحكم اليدوي (Manual)
            </button>
          </div>
        </header>

        {/* Live Stats Matrix */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
          <StatusBox title="حالة الكوكب" value="مستقر" icon={<Activity />} color="emerald" />
          <StatusBox title="المواطنين" value={allUsers?.length || 0} icon={<Users />} color="blue" />
          <StatusBox title="طلبات الشحن" value={pendingRequests?.length || 0} icon={<Eye />} color="amber" />
          <StatusBox title="الأرباح السيادية" value="45,000 EGP" icon={<CreditCard />} color="purple" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          
          {/* Action Center */}
          <div className="lg:col-span-1 space-y-8">
            <div className="glass-cosmic border border-white/10 rounded-[3.5rem] p-10 shadow-3xl space-y-8">
              <div className="flex items-center gap-4 text-amber-500 border-b border-white/5 pb-6">
                <Zap size={24} fill="currentColor" />
                <h3 className="text-xl font-black uppercase tracking-widest">إجراءات سريعة</h3>
              </div>
              <div className="space-y-4">
                <button onClick={() => quickCredit(500)} className="w-full h-16 bg-white text-black font-black rounded-2xl hover:bg-primary transition-all active:scale-95 shadow-xl">شحن رصيد طوارئ (500)</button>
                <button className="w-full h-16 bg-white/5 border border-white/5 text-white/40 font-bold rounded-2xl hover:bg-white/10 transition-all">فتح بث مباشر سيادي</button>
                <button className="w-full h-16 bg-red-600/10 text-red-500 border border-red-600/20 font-black rounded-2xl hover:bg-red-600 hover:text-white transition-all uppercase text-[10px] tracking-[0.2em]">إغلاق الكوكب فوراً 🚨</button>
              </div>
            </div>
          </div>

          {/* God Terminal (Right Container) */}
          <div className="lg:col-span-2">
            <div className="bg-[#050505] border border-white/5 rounded-[3.5rem] overflow-hidden flex flex-col h-[600px] shadow-3xl relative">
              <div className="absolute inset-0 bg-gradient-to-b from-primary/5 to-transparent pointer-events-none" />
              
              <div className="p-8 border-b border-white/5 bg-white/[0.02] flex justify-between items-center relative z-10">
                <div className="flex items-center gap-4">
                  <Terminal className="text-primary" size={24} />
                  <span className="text-[10px] font-black uppercase tracking-[0.5em] text-white/40">God-Mode Terminal v5.0</span>
                </div>
                <div className="flex gap-2">
                   <div className="w-2.5 h-2.5 bg-red-500 rounded-full shadow-[0_0_10px_rgba(239,68,68,0.5)]" />
                   <div className="w-2.5 h-2.5 bg-amber-500 rounded-full shadow-[0_0_10px_rgba(245,158,11,0.5)]" />
                   <div className="w-2.5 h-2.5 bg-emerald-500 rounded-full shadow-[0_0_10px_rgba(16,185,129,0.5)]" />
                </div>
              </div>
              
              {/* Live Terminal Content */}
              <div ref={scrollRef} className="p-10 font-mono text-xs overflow-y-auto space-y-4 flex-1 relative z-10 scrollbar-none">
                {logs.map((log, i) => (
                  <div key={i} className="flex gap-6 group animate-in slide-in-from-right-2 duration-500">
                    <span className="text-white/10 shrink-0 select-none">[{new Date().toLocaleTimeString('ar-EG')}]</span>
                    <span className="text-white/40 group-hover:text-primary transition-colors leading-relaxed">
                      <span className="text-primary/40">#root:</span> {log}
                    </span>
                  </div>
                ))}
              </div>
              
              {/* Input Command Line */}
              <form onSubmit={handleSupremeCommand} className="p-6 bg-black/60 border-t border-white/5 flex gap-6 relative z-10">
                 <input 
                  value={command}
                  onChange={(e) => setCommand(e.target.value)}
                  placeholder="أصدر أمراً سيادياً مباشراً (مثلاً: احظر ID_105)..."
                  className="flex-1 bg-transparent text-primary outline-none font-mono text-sm placeholder:text-white/5"
                  autoFocus
                 />
                 <button type="submit" className="text-white/20 hover:text-white transition-all">
                    <RefreshCw size={20} className="hover:rotate-180 transition-all duration-700" />
                 </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </SovereignLayout>
  );
}

function StatusBox({ title, value, icon, color }: any) {
  const colors: any = {
    emerald: "text-emerald-500 bg-emerald-500/5 hover:border-emerald-500/30",
    blue: "text-blue-500 bg-blue-500/5 hover:border-blue-500/30",
    amber: "text-amber-500 bg-amber-500/5 hover:border-amber-500/30",
    purple: "text-purple-500 bg-purple-500/5 hover:border-purple-500/30"
  };
  return (
    <div className={`p-10 glass-cosmic border border-white/5 rounded-[3.5rem] transition-all duration-700 group cursor-default ${colors[color]}`}>
      <div className={`w-16 h-16 rounded-[1.5rem] flex items-center justify-center mb-8 bg-white/5 shadow-inner transition-transform duration-700 group-hover:scale-110 group-hover:rotate-6`}>
        <div className="scale-125">{icon}</div>
      </div>
      <p className="text-white/20 text-[10px] font-black uppercase tracking-[0.3em] mb-2">{title}</p>
      <p className="text-4xl font-black text-white tracking-tighter">{value}</p>
    </div>
  );
}
