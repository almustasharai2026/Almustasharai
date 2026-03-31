
'use client';

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { 
  ShieldCheck, Users, Zap, Ban, Star, Wallet, 
  Settings, Loader2, ChevronLeft, Terminal, Gift,
  DollarSign, ShieldAlert, Activity
} from "lucide-react";
import SovereignLayout from "@/components/SovereignLayout";
import { useUser, useFirestore, useMemoFirebase } from "@/firebase";
import { useToast } from "@/hooks/use-toast";
import { collection, query, where, doc, updateDoc, getDocs, increment, serverTimestamp, addDoc } from "firebase/firestore";
import { roles as ROLES_LIST, checkSovereignStatus } from "@/lib/roles";

/**
 * غرفة القيادة العليا (Supreme God Mode Hub).
 * تصميم يحاكي أجهزة التحكم العسكرية الفاخرة للسيطرة على الكوكب.
 */
export default function SupremeCommandCenter() {
  const { user, profile, role, isUserLoading } = useUser();
  const db = useFirestore();
  const { toast } = useToast();
  
  const [targetEmail, setTargetUserEmail] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [stats, setStats] = useState({ users: 0, revenue: 0, violations: 0 });

  // التحقق من بروتوكول الهوية المحدث
  const sovereign = checkSovereignStatus(user?.email);

  useEffect(() => {
    if (sovereign.isOwner && db) {
      // محاكاة جلب الإحصائيات السيادية
      setStats({ users: 1240, revenue: 85400, violations: 0 });
    }
  }, [sovereign.isOwner, db]);

  if (isUserLoading) return <div className="h-screen flex items-center justify-center bg-[#0f0f0f]"><Loader2 className="animate-spin text-[#ff5722]" /></div>;

  if (!sovereign.isOwner) return (
    <div className="h-screen bg-black flex flex-col items-center justify-center text-red-500 gap-6">
      <ShieldAlert size={80} strokeWidth={3} className="animate-pulse" />
      <h1 className="text-4xl font-black uppercase tracking-[0.5em]">Authority Denied</h1>
      <p className="text-zinc-600 font-bold uppercase text-xs">king2026 Shield Active</p>
    </div>
  );

  const handleAction = async (action: 'ban' | 'vip' | 'recharge' | 'gift') => {
    if (!targetEmail.trim() || !db) return;
    setIsProcessing(true);
    try {
      const q = query(collection(db, "users"), where("email", "==", targetEmail.trim()));
      const snap = await getDocs(q);
      
      if (snap.empty) {
        toast({ variant: "destructive", title: "فشل البروتوكول", description: "المواطن المستهدف غير مسجل في السجلات." });
        return;
      }
      
      const targetUser = snap.docs[0];
      const userRef = doc(db, "users", targetUser.id);

      if (action === 'ban') {
        await updateDoc(userRef, { isBanned: true, bannedAt: serverTimestamp() });
        toast({ title: "تم الحظر السيادي 🚫", description: `تم طرد ${targetEmail} من الكوكب.` });
      } else if (action === 'vip') {
        await updateDoc(userRef, { role: ROLES_LIST.VIP });
        toast({ title: "ترقية استراتيجية ⭐", description: `تم منح ${targetEmail} شارة الـ VIP.` });
      } else if (action === 'recharge') {
        await updateDoc(userRef, { balance: increment(500) });
        toast({ title: "شحن رصيد ملكي ✅", description: "تمت إضافة 500 EGP للمحفظة." });
      }

      // توثيق الأمر في سجلات الأحداث
      await addDoc(collection(db, "system", "logs", "events"), {
        type: "SUPREME_COMMAND",
        action,
        target: targetEmail,
        admin: "king2026",
        timestamp: serverTimestamp()
      });

    } finally {
      setIsProcessing(false);
      setTargetUserEmail("");
    }
  };

  return (
    <SovereignLayout activeId="admin">
      <div className="space-y-10 animate-in fade-in duration-1000 pb-20">
        
        <header className="space-y-2 border-b border-white/5 pb-6">
           <h2 className="text-3xl font-black italic text-white tracking-tighter">مركز <span className="text-[#ff5722]">السيطرة العليا</span></h2>
           <p className="text-[9px] text-zinc-500 uppercase font-black tracking-[0.4em]">Sovereign Command Executive Mode</p>
        </header>

        {/* Global Statistics Cards */}
        <div className="grid grid-cols-2 gap-4">
           <StatCard label="المواطنين" value={stats.users.toLocaleString()} icon={<Users size={16}/>} color="#3b82f6" />
           <StatCard label="السيولة السيادية" value="∞" icon={<Wallet size={16}/>} color="#10b981" />
        </div>

        {/* Tactical Control Device */}
        <div className="bg-[#252525] p-8 rounded-[3.5rem] border border-white/5 space-y-8 shadow-2xl relative overflow-hidden group">
           <div className="absolute top-0 right-0 w-32 h-32 bg-[#ff5722]/5 blur-[60px] group-hover:bg-[#ff5722]/10 transition-all duration-1000" />
           
           <div className="space-y-3 relative z-10">
              <label className="text-[9px] font-black text-zinc-500 uppercase tracking-widest px-2">معرف المواطن (البريد الإلكتروني)</label>
              <div className="relative">
                <input 
                  value={targetEmail}
                  onChange={(e) => setTargetUserEmail(e.target.value)}
                  placeholder="name@domain.com"
                  className="w-full h-16 bg-black/40 border border-white/5 p-5 rounded-2xl text-white font-bold outline-none focus:border-[#ff5722] focus:ring-4 focus:ring-[#ff5722]/5 transition-all text-right shadow-inner"
                />
                <Terminal size={16} className="absolute left-5 top-1/2 -translate-y-1/2 text-zinc-700" />
              </div>
           </div>

           <div className="space-y-3 relative z-10">
              <p className="text-[9px] font-black text-zinc-500 uppercase tracking-widest px-2">أوامر التنفيذ الفوري</p>
              <div className="grid grid-cols-1 gap-3">
                <TacticalBtn onClick={() => handleAction('ban')} icon={<Ban size={16}/>} label="حظر نهائي واستبعاد" color="red" />
                <TacticalBtn onClick={() => handleAction('vip')} icon={<Star size={16}/>} label="ترقية لرتبة VIP" color="amber" />
                <TacticalBtn onClick={() => handleAction('recharge')} icon={<Zap size={16}/>} label="شحن 500 EGP فورياً" color="emerald" />
              </div>
           </div>
        </div>

        {/* Sovereign Logs */}
        <div className="p-8 bg-black/60 rounded-[3rem] border border-white/5 font-mono text-[10px] text-zinc-600 italic space-y-3 shadow-inner max-h-48 overflow-y-auto scrollbar-none">
           <div className="flex items-center gap-3"><span className="text-[#ff5722]">&gt;&gt;</span> INITIALIZING AUTHORITY PROTOCOL... DONE</div>
           <div className="flex items-center gap-3"><span className="text-[#ff5722]">&gt;&gt;</span> CONNECTING TO NEON POSTGRES... STABLE</div>
           <div className="flex items-center gap-3"><span className="text-[#ff5722]">&gt;&gt;</span> SOVEREIGN HUB ACTIVE | king2026 SUPREMACY RECOGNIZED</div>
           <div className="flex items-center gap-3 opacity-40"><span className="text-zinc-800">&gt;&gt;</span> LAST SYNC: {new Date().toLocaleTimeString()}</div>
        </div>

      </div>
    </SovereignLayout>
  );
}

function StatCard({ label, value, icon, color }: any) {
  return (
    <div className="bg-[#252525] p-6 rounded-[2.5rem] border border-white/5 space-y-3 shadow-xl">
      <div style={{ color }}>{icon}</div>
      <div>
        <p className="text-[9px] text-zinc-500 uppercase font-black tracking-widest">{label}</p>
        <p className="text-2xl font-black text-white tabular-nums">{value}</p>
      </div>
    </div>
  );
}

function TacticalBtn({ label, onClick, icon, color }: any) {
  const colors: any = {
    red: "hover:bg-red-500 text-red-500 border-red-500/20",
    amber: "hover:bg-amber-500 text-amber-500 border-amber-500/20",
    emerald: "hover:bg-emerald-500 text-emerald-500 border-emerald-500/20"
  };
  return (
    <button 
      onClick={onClick}
      className={`w-full bg-black/20 p-5 rounded-[1.8rem] flex justify-between items-center group transition-all border ${colors[color]} hover:text-black shadow-lg active:scale-95`}
    >
      <div className="flex items-center gap-4">
        {icon}
        <span className="text-sm font-bold">{label}</span>
      </div>
      <ChevronLeft size={16} className="opacity-40 group-hover:opacity-100 transition-opacity" />
    </button>
  );
}

function PricingRow({ label, value }: any) {
  return (
    <div className="flex justify-between items-center px-4 py-3 bg-white/[0.02] rounded-2xl border border-white/5">
       <span className="text-xs text-zinc-500 font-bold">{label}</span>
       <span className="text-sm font-black text-white">{value}</span>
    </div>
  );
}
