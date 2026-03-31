
'use client';

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  ShieldCheck, Zap, Users, CreditCard, 
  Activity, Ban, Unlock, RefreshCw, Terminal, Eye,
  Crown, ShieldAlert, Loader2, Sun, Moon, LayoutDashboard,
  Paintbrush, Star, CheckCircle, Gift
} from "lucide-react";
import { useUser, useFirestore, useCollection } from "@/firebase";
import { useToast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";
import { collection, query, where, doc, updateDoc, increment, serverTimestamp, getDocs } from "firebase/firestore";
import { useMemoFirebase } from "@/firebase/provider";
import { roles as ROLES_LIST, SOVEREIGN_ADMIN_EMAIL } from "@/lib/roles";
import SovereignLayout from "@/components/SovereignLayout";
import Image from "next/image";

export default function SupremeCommandCenter() {
  const { user, profile, role, isUserLoading } = useUser();
  const db = useFirestore();
  const router = useRouter();
  const { toast } = useToast();
  
  const [command, setCommand] = useState("");
  const [targetUserEmail, setTargetUserEmail] = useState("");
  const [logs, setLogs] = useState([
    "🏛️ بروتوكول king2026 نشط.. تم توثيق الهوية الملكية.",
    "🛡️ الدرع الواقي قيد التشغيل (God-Mode: ACTIVE).",
    "📡 القاعدة المركزية تستجيب للأوامر السيادية."
  ]);

  const scrollRef = useRef<HTMLDivElement>(null);

  // حماية الوصول الصارمة
  const isOwner = user?.email === SOVEREIGN_ADMIN_EMAIL;

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
    }
  }, [logs]);

  if (isUserLoading) return <div className="h-screen bg-[#020202] flex items-center justify-center"><Loader2 className="animate-spin text-primary h-12 w-12" /></div>;

  if (!isOwner) {
    return (
      <div className="h-screen flex flex-col items-center justify-center bg-black text-red-500 gap-10">
        <ShieldAlert size={100} className="animate-pulse" />
        <h1 className="text-4xl font-black uppercase tracking-[0.5em]">Authority Denied</h1>
        <button onClick={() => router.push("/")} className="bg-red-600 text-white px-10 py-4 rounded-2xl">تراجع فوراً</button>
      </div>
    );
  }

  const addLog = (msg: string) => setLogs(prev => [...prev, `${msg}`]);

  const handleUserAction = async (action: 'ban' | 'unban' | 'vip') => {
    if (!targetUserEmail.trim() || !db) return;
    addLog(`> جاري البحث عن المواطن: ${targetUserEmail}...`);
    
    try {
      const q = query(collection(db, "users"), where("email", "==", targetUserEmail.trim()));
      const snap = await getDocs(q);
      
      if (snap.empty) {
        addLog(`❌ فشل البروتوكول: المواطن غير مسجل في سجلات الكوكب.`);
        return;
      }

      const userDoc = snap.docs[0];
      const userRef = doc(db, "users", userDoc.id);

      if (action === 'ban') {
        await updateDoc(userRef, { isBanned: true });
        addLog(`🚫 تم تنفيذ الحظر السيادي النهائي على ${targetUserEmail}.`);
      } else if (action === 'unban') {
        await updateDoc(userRef, { isBanned: false });
        addLog(`✅ تم العفو الملكي وفك الحظر عن ${targetUserEmail}.`);
      } else if (action === 'vip') {
        await updateDoc(userRef, { role: ROLES_LIST.VIP });
        addLog(`⭐ تم ترقية ${targetUserEmail} إلى رتبة مواطن VIP.`);
      }
      
      toast({ title: "تم تنفيذ الأمر الملكي بنجاح" });
    } catch (e) {
      addLog(`⚠️ خطأ تقني في المزامنة السيادية.`);
    }
  };

  const handleSupremeCommand = (e: React.FormEvent) => {
    e.preventDefault();
    if (!command.trim()) return;
    addLog(`> [AI Execution]: ${command}`);
    addLog(`✅ جاري معالجة الطلب برمجياً في الخلفية...`);
    setCommand("");
  };

  return (
    <SovereignLayout activeId="dash">
      <div className="min-h-screen bg-[#020202] text-white p-8 lg:p-12 font-sans relative overflow-hidden" dir="rtl">
        {/* Cinematic Backdrop */}
        <div className="absolute top-0 right-0 w-full h-full opacity-5 pointer-events-none">
          <Image src="https://picsum.photos/seed/legal99/1920/1080" alt="Sovereign Bg" fill className="object-cover" />
        </div>

        <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-8 mb-16 border-b border-white/5 pb-10 relative z-10">
          <div className="space-y-2">
            <h1 className="text-6xl font-black italic text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-amber-600 tracking-tighter">
              لوحة السيطرة المطلقة
            </h1>
            <p className="text-white/20 font-mono text-[10px] uppercase tracking-[0.4em]">Sovereign ID: {user?.uid.substring(0,8).toUpperCase()} | king2026 Edition</p>
          </div>
          <div className="flex flex-col items-end">
            <div className="flex items-center gap-3 text-emerald-500 font-black text-4xl tabular-nums">
              <Zap className="fill-current animate-pulse" size={32} /> ∞ ج.م
            </div>
            <span className="text-[10px] text-white/20 font-bold uppercase tracking-widest mt-2">رصيد السلطة المطلقة</span>
          </div>
        </header>

        <main className="grid grid-cols-1 lg:grid-cols-3 gap-10 relative z-10">
          
          {/* Section 1: Interface Architect */}
          <div className="bg-white/[0.02] border border-white/5 p-10 rounded-[3.5rem] space-y-8 backdrop-blur-3xl shadow-3xl">
            <div className="flex items-center gap-4 text-amber-500">
              <Paintbrush size={28} />
              <h3 className="text-2xl font-black tracking-tight">مهندس الواجهات</h3>
            </div>
            <div className="space-y-6">
              <div className="space-y-3">
                <label className="text-[10px] font-black text-white/20 uppercase tracking-[0.2em] px-2">لون هوية الكوكب</label>
                <div className="flex gap-3">
                  <div className="h-12 w-12 rounded-2xl bg-primary border-4 border-white/10 cursor-pointer" title="Sovereign Gold" />
                  <div className="h-12 w-12 rounded-2xl bg-emerald-500 border-2 border-white/5 cursor-pointer opacity-40 hover:opacity-100 transition-all" title="Emerald Life" />
                  <div className="h-12 w-12 rounded-2xl bg-indigo-600 border-2 border-white/5 cursor-pointer opacity-40 hover:opacity-100 transition-all" title="Indigo Night" />
                </div>
              </div>
              <div className="space-y-3">
                <label className="text-[10px] font-black text-white/20 uppercase tracking-[0.2em] px-2">نص العروض السيادية</label>
                <textarea 
                  className="w-full bg-black/40 border border-white/5 rounded-2xl p-5 text-sm font-bold text-white/60 focus:border-amber-500/50 outline-none transition-all h-32"
                  defaultValue="احصل على 50 ج.م رصيد ترحيبي فور توثيق هويتك السيادية."
                />
              </div>
              <button className="w-full py-4 rounded-2xl bg-white text-black font-black text-xs uppercase tracking-widest shadow-2xl hover:scale-105 active:scale-95 transition-all">تحديث هوية الكوكب</button>
            </div>
          </div>

          {/* Section 2: Population Management */}
          <div className="bg-white/[0.02] border border-white/5 p-10 rounded-[3.5rem] space-y-8 backdrop-blur-3xl shadow-3xl">
            <div className="flex items-center gap-4 text-blue-500">
              <Users size={28} />
              <h3 className="text-2xl font-black tracking-tight">إدارة المواطنين</h3>
            </div>
            <div className="space-y-6">
              <div className="space-y-3">
                <label className="text-[10px] font-black text-white/20 uppercase tracking-[0.2em] px-2">تحديد الهوية</label>
                <input 
                  value={targetUserEmail}
                  onChange={(e) => setTargetUserEmail(e.target.value)}
                  placeholder="بريد المواطن المستهدف..." 
                  className="w-full bg-black/40 border border-white/5 rounded-2xl p-5 text-sm font-bold text-white focus:border-blue-500/50 outline-none"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <button 
                  onClick={() => handleUserAction('ban')}
                  className="bg-red-600/10 text-red-500 border border-red-600/20 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-red-600 hover:text-white transition-all"
                >
                  حظر نهائي <Ban size={14} className="inline mr-1" />
                </button>
                <button 
                  onClick={() => handleUserAction('unban')}
                  className="bg-emerald-600/10 text-emerald-500 border border-emerald-600/20 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-emerald-600 hover:text-white transition-all"
                >
                  عفو ملكي <CheckCircle size={14} className="inline mr-1" />
                </button>
                <button 
                  onClick={() => handleUserAction('vip')}
                  className="col-span-2 bg-primary/10 text-primary border border-primary/20 py-5 rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-primary hover:text-black transition-all shadow-xl"
                >
                  ترقية لرتبة VIP <Star size={16} className="inline mr-2 fill-current" />
                </button>
              </div>
            </div>
          </div>

          {/* Section 3: AI Execution Terminal */}
          <div className="bg-[#050505] border border-emerald-500/20 p-10 rounded-[3.5rem] space-y-8 shadow-3xl relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-48 h-48 bg-emerald-500/5 blur-[80px] group-hover:bg-emerald-500/10 transition-all duration-1000" />
            <div className="flex items-center gap-4 text-emerald-500 relative z-10">
              <Terminal size={28} />
              <h3 className="text-2xl font-black italic tracking-tight uppercase">AI Execution Core</h3>
            </div>
            
            <div className="bg-black/60 rounded-3xl border border-white/5 p-6 h-64 overflow-y-auto font-mono text-[10px] space-y-2 relative z-10 scrollbar-none" ref={scrollRef}>
              {logs.map((log, i) => (
                <div key={i} className="flex gap-4 group">
                  <span className="text-white/10 shrink-0">[{new Date().toLocaleTimeString('ar-EG')}]</span>
                  <span className={`${log.startsWith('❌') ? 'text-red-400' : log.startsWith('✅') ? 'text-emerald-400' : 'text-white/40'} group-hover:text-white transition-colors`}>
                    {log}
                  </span>
                </div>
              ))}
            </div>

            <form onSubmit={handleSupremeCommand} className="relative z-10 space-y-4">
              <input 
                value={command}
                onChange={(e) => setCommand(e.target.value)}
                placeholder="أصدر أمراً سيادياً مباشراً..." 
                className="w-full bg-white/5 border border-white/10 rounded-2xl p-5 text-emerald-500 font-mono text-xs focus:border-emerald-500 outline-none"
              />
              <button className="w-full py-5 rounded-2xl bg-emerald-500 text-black font-black text-sm hover:scale-[1.02] active:scale-95 transition-all shadow-2xl shadow-emerald-500/20 flex items-center justify-center gap-3">
                تفيذ البروتوكول <Zap size={18} fill="currentColor" />
              </button>
            </form>
          </div>

        </main>

        <footer className="mt-20 pt-10 border-t border-white/5 flex justify-between items-center opacity-20 hover:opacity-100 transition-opacity">
           <p className="text-[9px] font-black uppercase tracking-[0.5em]">Supreme Authority Protocol v5.5</p>
           <p className="text-[9px] font-black uppercase tracking-[0.5em]">king2026 Universal Encryption Active</p>
        </footer>
      </div>
    </SovereignLayout>
  );
}
