
'use client';

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  ShieldCheck, Zap, Users, CreditCard, 
  Activity, Ban, Unlock, RefreshCw, Terminal, Eye,
  Crown, ShieldAlert, Loader2, Sun, Moon, LayoutDashboard,
  Map, BellRing, Smartphone, MessageCircle, TrendingUp
} from "lucide-react";
import { useUser, useFirestore, useCollection } from "@/firebase";
import { useToast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";
import { collection, query, where, doc, updateDoc, increment, serverTimestamp } from "firebase/firestore";
import { useMemoFirebase } from "@/firebase/provider";
import { roles as ROLES_LIST } from "@/lib/roles";
import { useTheme } from "next-themes";
import SovereignLayout from "@/components/SovereignLayout";
import Image from "next/image";
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer 
} from 'recharts';

// بيانات تجريبية لمحاكاة نمو الأرباح والاستشارات (Sovereign Pulse Data)
const intelligenceData = [
  { name: 'السبت', profit: 4000, consultations: 24 },
  { name: 'الأحد', profit: 3000, consultations: 18 },
  { name: 'الاثنين', profit: 5000, consultations: 35 },
  { name: 'الثلاثاء', profit: 2780, consultations: 12 },
  { name: 'الأربعاء', profit: 6890, consultations: 48 },
  { name: 'الخميس', profit: 8390, consultations: 52 },
  { name: 'الجمعة', profit: 4490, consultations: 30 },
];

/**
 * غرفة القيادة العليا - إصدار "الذكاء السيادي" (Sovereign Intel v5.5).
 */
export default function SupremeCommandCenter() {
  const { user, profile, role, isUserLoading } = useUser();
  const db = useFirestore();
  const router = useRouter();
  const { toast } = useToast();
  const { theme, setTheme } = useTheme();
  
  const [command, setCommand] = useState("");
  const [isAutoPilot, setIsAutoPilot] = useState(true);
  const [notifying, setNotifying] = useState(false);
  const [logs, setLogs] = useState([
    "🏛️ بروتوكول king2026 نشط.. تم توثيق الهوية الملكية.",
    "🛡️ الدرع الواقي قيد التشغيل (Auto-Pilot: ON).",
    "📡 الاتصال بالقاعدة المركزية مستقر.",
    "📊 محرك الاستخبارات البصرية جاهز للتحليل."
  ]);

  const scrollRef = useRef<HTMLDivElement>(null);

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
      } else if (action === "تقرير") {
        setLogs(prev => [...prev, "📄 جاري توليد ميثاق المراجعة السيادي الشامل..."]);
        setTimeout(() => setLogs(prev => [...prev, "✅ التقرير جاهز في الأرشيف المركزي."]), 1500);
      } else {
        setLogs(prev => [...prev, "❌ عذراً سيادة المالك، لم يتم العثور على هذا البروتوكول في ميثاق الأوامر."]);
      }
    } catch (err) {
      setLogs(prev => [...prev, `⚠️ فشل تنفيذ العملية: خطأ في مزامنة Firestore.`]);
    }

    setCommand("");
  };

  const sendGlobalBroadcast = (type: string) => {
    setNotifying(true);
    setLogs(prev => [...prev, `📢 بدء بروتوكول البث الشامل عبر ${type}...`]);
    
    setTimeout(() => {
      toast({ title: `تم إرسال تنبيه ${type} بنجاح ✅`, description: "تم استهداف كافة المواطنين والخبراء النشطين." });
      setLogs(prev => [...prev, `✅ اكتمل البث عبر ${type}. تم استلام التأكيد من 1,240 مواطن.`]);
      setNotifying(false);
    }, 2000);
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
        
        {/* Sovereign Background Image Overlay */}
        <div className="absolute inset-0 -z-10 opacity-10 grayscale">
          <Image 
            src="https://picsum.photos/seed/court1/1920/1080"
            alt="Admin Background"
            fill
            className="object-cover"
            data-ai-hint="courtroom justice"
          />
        </div>

        <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-8 mb-16 border-b border-white/5 pb-10">
          <div className="space-y-2">
            <h1 className="text-5xl font-black tracking-tighter flex items-center gap-5 text-white">
              <ShieldCheck className="text-emerald-500 w-14 h-14 shadow-3xl" /> 
              سيطرة <span className="text-primary">الملك</span>
            </h1>
            <p className="text-white/20 font-mono text-[10px] uppercase tracking-[0.4em]">Master Sovereign ID: king2026_supreme</p>
          </div>

          <div className={`p-1.5 rounded-[1.8rem] border-2 transition-all duration-700 flex gap-2 ${isAutoPilot ? 'border-emerald-500/20 bg-emerald-500/5' : 'border-amber-500/20 bg-amber-500/5'}`}>
            <button onClick={() => setIsAutoPilot(true)} className={`px-8 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all ${isAutoPilot ? 'bg-emerald-500 text-black shadow-2xl' : 'text-white/20 hover:text-white'}`}>الذكاء الاصطناعي (Auto)</button>
            <button onClick={() => setIsAutoPilot(false)} className={`px-8 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all ${!isAutoPilot ? 'bg-amber-500 text-black shadow-2xl' : 'text-white/20 hover:text-white'}`}>التحكم اليدوي (Manual)</button>
          </div>
        </header>

        {/* Intelligence Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-16">
          <div className="lg:col-span-2 glass-cosmic border border-white/10 rounded-[3.5rem] p-10 shadow-3xl">
            <div className="flex justify-between items-center mb-10">
              <div>
                <h2 className="text-3xl font-black text-white">تحليلات النمو السيادي</h2>
                <p className="text-white/20 text-[10px] font-bold uppercase tracking-widest mt-2">Profit vs Consultation Volume</p>
              </div>
              <div className="h-3 w-3 bg-emerald-500 rounded-full animate-pulse shadow-[0_0_15px_rgba(16,185,129,0.5)]" />
            </div>
            
            <div className="h-[300px] w-full pr-4">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={intelligenceData}>
                  <defs>
                    <linearGradient id="colorProfit" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#D4AF37" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#D4AF37" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#ffffff05" vertical={false} />
                  <XAxis dataKey="name" stroke="#ffffff20" fontSize={10} tickLine={false} axisLine={false} />
                  <YAxis stroke="#ffffff20" fontSize={10} tickLine={false} axisLine={false} />
                  <Tooltip 
                    contentStyle={{backgroundColor: '#050505', border: '1px solid #ffffff10', borderRadius: '1rem'}}
                    itemStyle={{color: '#D4AF37'}}
                  />
                  <Area type="monotone" dataKey="profit" stroke="#D4AF37" fillOpacity={1} fill="url(#colorProfit)" strokeWidth={4} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="glass-cosmic border border-white/10 rounded-[3.5rem] p-10 flex flex-col justify-center items-center text-center space-y-8 shadow-3xl">
             <div className="w-24 h-24 bg-blue-500/10 rounded-[2rem] flex items-center justify-center animate-pulse border border-blue-500/20">
                <Map className="text-blue-500" size={40} />
             </div>
             <div>
               <h3 className="text-2xl font-black text-white">التوزيع الجغرافي</h3>
               <p className="text-white/20 text-[10px] font-bold uppercase tracking-widest mt-1">Global Expert Density</p>
             </div>
             <div className="w-full space-y-6">
                <ProgressItem label="القاهرة" value={65} color="blue" />
                <ProgressItem label="الإسكندرية" value={20} color="emerald" />
                <ProgressItem label="المنصورة" value={15} color="amber" />
             </div>
          </div>
        </div>

        {/* Communication Broadcast Center */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
          <NotifyCard 
            icon={<MessageCircle />} 
            title="تنبيهات WhatsApp" 
            desc="إرسال إشعار مباشر لجميع المحامين المشتركين عبر المحرك الأخضر." 
            color="emerald"
            onClick={() => sendGlobalBroadcast('WhatsApp')}
            loading={notifying}
          />
          <NotifyCard 
            icon={<Smartphone />} 
            title="Push Protocol" 
            desc="تنبيهات سيادية فورية تظهر على شاشات المواطنين المحمولة." 
            color="blue"
            onClick={() => sendGlobalBroadcast('Push')}
            loading={notifying}
          />
          <NotifyCard 
            icon={<BellRing />} 
            title="النشرة الملكية" 
            desc="إرسال ملخص لأحدث القوانين والمراسيم عبر البريد الإلكتروني." 
            color="amber"
            onClick={() => sendGlobalBroadcast('Email')}
            loading={notifying}
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          <div className="lg:col-span-1 space-y-8">
            <div className="glass-cosmic border border-white/10 rounded-[3.5rem] p-10 shadow-3xl space-y-8">
              <div className="flex items-center gap-4 text-amber-500 border-b border-white/5 pb-6">
                <Zap size={24} fill="currentColor" />
                <h3 className="text-xl font-black uppercase tracking-widest">إجراءات سريعة</h3>
              </div>
              <div className="space-y-4">
                <button onClick={() => setCommand("شحن 500 [ID]")} className="w-full h-16 bg-white text-black font-black rounded-2xl hover:bg-primary transition-all active:scale-95 shadow-xl">شحن رصيد طوارئ (500)</button>
                <button className="w-full h-16 bg-white/5 border border-white/5 text-white/40 font-bold rounded-2xl hover:bg-white/10 transition-all">فتح بث مباشر سيادي</button>
                <button className="w-full h-16 bg-red-600/10 text-red-500 border border-red-600/20 font-black rounded-2xl hover:bg-red-600 hover:text-white transition-all uppercase text-[10px] tracking-[0.2em]">إغلاق الكوكب فوراً 🚨</button>
              </div>
            </div>
          </div>

          <div className="lg:col-span-2">
            <div className="bg-[#050505] border border-white/5 rounded-[3.5rem] overflow-hidden flex flex-col h-[600px] shadow-3xl relative">
              <div className="absolute inset-0 bg-gradient-to-b from-primary/5 to-transparent pointer-events-none" />
              <div className="p-8 border-b border-white/5 bg-white/[0.02] flex justify-between items-center relative z-10">
                <div className="flex items-center gap-4">
                  <Terminal className="text-primary" size={24} />
                  <span className="text-[10px] font-black uppercase tracking-[0.5em] text-white/40">God-Mode Terminal v5.5</span>
                </div>
              </div>
              <div ref={scrollRef} className="p-10 font-mono text-xs overflow-y-auto space-y-4 flex-1 relative z-10 scrollbar-none">
                {logs.map((log, i) => (
                  <div key={i} className="flex gap-6 group animate-in slide-in-from-right-2 duration-500">
                    <span className="text-white/10 shrink-0 select-none">[{new Date().toLocaleTimeString('ar-EG')}]</span>
                    <span className="text-white/40 group-hover:text-primary transition-colors leading-relaxed"><span className="text-primary/40">#root:</span> {log}</span>
                  </div>
                ))}
              </div>
              <form onSubmit={handleSupremeCommand} className="p-6 bg-black/60 border-t border-white/5 flex gap-6 relative z-10">
                 <input value={command} onChange={(e) => setCommand(e.target.value)} placeholder="أصدر أمراً سيادياً مباشراً..." className="flex-1 bg-transparent text-primary outline-none font-mono text-sm placeholder:text-white/10" autoFocus />
                 <button type="submit" className="text-white/20 hover:text-white transition-all"><RefreshCw size={20} className="hover:rotate-180 transition-all duration-700" /></button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </SovereignLayout>
  );
}

function ProgressItem({ label, value, color }: any) {
  const colors: any = {
    blue: "bg-blue-500",
    emerald: "bg-emerald-500",
    amber: "bg-amber-500"
  };
  return (
    <div className="space-y-3">
      <div className="flex justify-between text-[10px] font-black uppercase tracking-widest text-white/40">
        <span>{label}</span>
        <span className="text-white">{value}%</span>
      </div>
      <div className="w-full bg-white/5 h-1.5 rounded-full overflow-hidden">
        <motion.div initial={{ width: 0 }} animate={{ width: `${value}%` }} transition={{ duration: 1.5 }} className={`h-full ${colors[color]} shadow-[0_0_10px_rgba(0,0,0,0.5)]`} />
      </div>
    </div>
  );
}

function NotifyCard({ icon, title, desc, color, onClick, loading }: any) {
  const colors: any = {
    emerald: "text-emerald-500 bg-emerald-500/10 border-emerald-500/20",
    blue: "text-blue-500 bg-blue-500/10 border-blue-500/20",
    amber: "text-amber-500 bg-amber-500/10 border-amber-500/20"
  };
  const btnColors: any = {
    emerald: "bg-emerald-500 hover:bg-emerald-400",
    blue: "bg-blue-500 hover:bg-blue-400",
    amber: "bg-amber-500 hover:bg-amber-400"
  };

  return (
    <div className="glass-cosmic border border-white/10 p-8 rounded-[3.5rem] group hover:border-primary/30 transition-all cursor-pointer shadow-3xl">
      <div className={`w-16 h-16 rounded-[1.5rem] flex items-center justify-center mb-8 bg-white/5 border border-white/5 transition-all duration-700 group-hover:rotate-12 ${colors[color]}`}>
        <div className="scale-125">{icon}</div>
      </div>
      <h4 className="text-2xl font-black text-white mb-3 tracking-tighter">{title}</h4>
      <p className="text-white/30 text-xs font-bold leading-relaxed mb-8">{desc}</p>
      <button 
        onClick={onClick}
        disabled={loading}
        className={`w-full py-4 rounded-2xl text-[10px] font-black uppercase tracking-[0.3em] transition-all relative overflow-hidden ${
          loading ? 'bg-white/5 text-white/20' : `${btnColors[color]} text-black shadow-2xl`
        }`}
      >
        {loading ? <Loader2 className="h-4 w-4 animate-spin mx-auto" /> : "إرسال البروتوكول"}
      </button>
    </div>
  );
}
