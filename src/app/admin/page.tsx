'use client';

import { useState } from "react";
import { motion } from "framer-motion";
import { 
  ShieldCheck, Users, Zap, Ban, Star, Wallet, 
  Settings, Loader2, ChevronLeft, LayoutGrid, Terminal
} from "lucide-react";
import SovereignLayout from "@/components/SovereignLayout";
import { useUser, useFirestore, useCollection, useMemoFirebase } from "@/firebase";
import { useToast } from "@/hooks/use-toast";
import { collection, query, where, doc, updateDoc, getDocs, increment } from "firebase/firestore";
import { roles as ROLES_LIST, SOVEREIGN_ADMIN_EMAIL } from "@/lib/roles";

/**
 * لوحة تحكم الملك (The King's Lounge).
 * واجهة جرمية مدمجة لإدارة الكوكب بلمسة واحدة.
 */
export default function SupremeCommandCenter() {
  const { user, role, isUserLoading } = useUser();
  const db = useFirestore();
  const { toast } = useToast();
  
  const [targetEmail, setTargetUserEmail] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);

  const isOwner = user?.email === SOVEREIGN_ADMIN_EMAIL;

  if (isUserLoading) return <div className="h-screen flex items-center justify-center bg-black"><Loader2 className="animate-spin text-[#ff5722]" /></div>;

  if (!isOwner) return <div className="h-screen bg-black flex items-center justify-center text-red-500 font-black">AUTHORITY DENIED 🚨</div>;

  const handleAction = async (action: 'ban' | 'vip' | 'recharge') => {
    if (!targetEmail.trim() || !db) return;
    setIsProcessing(true);
    try {
      const q = query(collection(db, "users"), where("email", "==", targetEmail.trim()));
      const snap = await getDocs(q);
      if (snap.empty) { toast({ variant: "destructive", title: "فشل البروتوكول" }); return; }
      
      const userRef = doc(db, "users", snap.docs[0].id);
      if (action === 'ban') await updateDoc(userRef, { isBanned: true });
      else if (action === 'vip') await updateDoc(userRef, { role: ROLES_LIST.VIP });
      else if (action === 'recharge') await updateDoc(userRef, { balance: increment(500) });
      
      toast({ title: "تم تنفيذ الأمر السيادي ✅" });
    } finally {
      setIsProcessing(false);
      setTargetUserEmail("");
    }
  };

  return (
    <SovereignLayout activeId="admin">
      <div className="space-y-10 animate-in fade-in duration-1000">
        
        <header className="space-y-2">
           <h2 className="text-2xl font-bold italic text-white">لوحة التحكم العليا</h2>
           <p className="text-[10px] text-zinc-500 uppercase font-black tracking-widest">King's Management Mode</p>
        </header>

        <div className="grid grid-cols-2 gap-4">
           <QuickAction label="المواطنين" value="1.2k" icon={<Users size={18}/>} color="#ff5722" />
           <QuickAction label="الرصيد الملكي" value="∞" icon={<Wallet size={18}/>} color="#10b981" />
        </div>

        <div className="bg-[#252525] p-8 rounded-[3rem] border border-white/5 space-y-8 shadow-inner">
           <div className="space-y-3">
              <label className="text-[9px] font-black text-zinc-500 uppercase tracking-widest px-2">معرف المواطن المستهدف</label>
              <input 
                value={targetEmail}
                onChange={(e) => setTargetUserEmail(e.target.value)}
                placeholder="أدخل البريد الإلكتروني.."
                className="w-full bg-black/40 border border-white/5 p-5 rounded-2xl text-white font-bold outline-none focus:border-[#ff5722] transition-all"
              />
           </div>

           <div className="space-y-3">
              <p className="text-[9px] font-black text-zinc-500 uppercase tracking-widest px-2">أوامر التنفيذ المباشر</p>
              <ActionButton onClick={() => handleAction('ban')} icon={<Ban size={16}/>} label="حظر نهائي" color="red" />
              <ActionButton onClick={() => handleAction('vip')} icon={<Star size={16}/>} label="ترقية VIP" color="amber" />
              <ActionButton onClick={() => handleAction('recharge')} icon={<Zap size={16}/>} label="شحن 500 EGP" color="emerald" />
           </div>
        </div>

        <div className="p-6 bg-black/40 rounded-[2.5rem] border border-white/5 font-mono text-[9px] text-zinc-600 italic space-y-2">
           <div className="flex items-center gap-2"><Terminal size={12} /> &gt;&gt; LOG: INITIALIZING king2026 AUTHORITY...</div>
           <div className="flex items-center gap-2">&gt;&gt; LOG: SECURE CONNECTION ESTABLISHED.</div>
        </div>

      </div>
    </SovereignLayout>
  );
}

function QuickAction({ label, value, icon, color }: any) {
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

function ActionButton({ label, onClick, icon, color }: any) {
  const colors: any = {
    red: "hover:bg-red-500 text-red-500 border-red-500/20",
    amber: "hover:bg-amber-500 text-amber-500 border-amber-500/20",
    emerald: "hover:bg-emerald-500 text-emerald-500 border-emerald-500/20"
  };
  return (
    <button 
      onClick={onClick}
      className={`w-full bg-black/20 p-5 rounded-3xl flex justify-between items-center group transition-all border ${colors[color]} hover:text-black`}
    >
      <div className="flex items-center gap-4">
        {icon}
        <span className="text-sm font-bold">{label}</span>
      </div>
      <ChevronLeft size={16} />
    </button>
  );
}
