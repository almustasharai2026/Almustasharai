'use client';

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  ShieldCheck, Users, Zap, Ban, Star, Wallet, 
  Loader2, ChevronLeft, Terminal, LogOut, ShieldAlert,
  Settings, Gift, RefreshCw, Search
} from "lucide-react";
import SovereignLayout from "@/components/SovereignLayout";
import { useUser, useFirestore, useCollection, useMemoFirebase } from "@/firebase";
import { useToast } from "@/hooks/use-toast";
import { collection, query, where, doc, updateDoc, getDocs, increment, serverTimestamp, deleteDoc } from "firebase/firestore";
import { roles as ROLES_LIST, checkSovereignStatus } from "@/lib/roles";

export default function SupremeCommandCenter() {
  const { user, profile, isUserLoading, signOut } = useUser();
  const db = useFirestore();
  const { toast } = useToast();
  
  const [targetEmail, setTargetUserEmail] = useState("");
  const [welcomeGiftAmount, setWelcomeGiftAmount] = useState(50);
  const [isProcessing, setIsProcessing] = useState(false);

  const sovereign = checkSovereignStatus(user?.email);

  // جلب قائمة المواطنين للرقابة
  const usersQuery = useMemoFirebase(() => {
    if (!db || !sovereign.isOwner) return null;
    return query(collection(db, "users"), where("email", "!=", user?.email));
  }, [db, user, sovereign.isOwner]);
  
  const { data: citizens, isLoading: citizensLoading } = useCollection(usersQuery);

  if (isUserLoading) return <div className="h-screen flex items-center justify-center bg-[#050505]"><Loader2 className="animate-spin text-primary" /></div>;

  if (!sovereign.isOwner) return (
    <div className="h-screen bg-black flex flex-col items-center justify-center text-red-500 gap-6">
      <ShieldAlert size={80} strokeWidth={3} className="animate-pulse" />
      <h1 className="text-4xl font-black uppercase tracking-[0.5em]">Authority Denied</h1>
      <p className="text-zinc-600 font-bold uppercase text-xs">ROOT OWNER ACCESS ONLY</p>
    </div>
  );

  const handleAction = async (action: 'ban' | 'vip' | 'recharge', email?: string) => {
    const target = email || targetEmail;
    if (!target.trim() || !db) return;
    
    setIsProcessing(true);
    try {
      const q = query(collection(db, "users"), where("email", "==", target.trim()));
      const snap = await getDocs(q);
      
      if (snap.empty) {
        toast({ variant: "destructive", title: "فشل البروتوكول", description: "المواطن المستهدف غير مسجل." });
        return;
      }
      
      const targetUser = snap.docs[0];
      const userRef = doc(db, "users", targetUser.id);

      if (action === 'ban') {
        await updateDoc(userRef, { isBanned: true, bannedAt: serverTimestamp() });
        toast({ title: "تم الحظر السيادي 🚫" });
      } else if (action === 'vip') {
        await updateDoc(userRef, { role: ROLES_LIST.VIP });
        toast({ title: "ترقية استراتيجية ⭐" });
      } else if (action === 'recharge') {
        await updateDoc(userRef, { balance: increment(500) });
        toast({ title: "شحن رصيد ملكي ✅" });
      }
    } catch (e) {
      toast({ variant: "destructive", title: "خطأ في التنفيذ" });
    } finally {
      setIsProcessing(false);
      setTargetUserEmail("");
    }
  };

  return (
    <SovereignLayout activeId="admin">
      <div className="space-y-10 pb-32 pt-4">
        
        <header className="flex justify-between items-center border-b border-white/5 pb-6">
           <div className="text-right">
              <h2 className="text-2xl font-black text-white tracking-tighter">غرفة <span className="text-primary">القيادة</span></h2>
              <p className="text-[8px] font-black text-zinc-600 uppercase tracking-widest mt-1">Supreme Admin Hub</p>
           </div>
           <button 
            onClick={() => signOut()}
            className="p-3 bg-red-500/10 text-red-500 rounded-2xl border border-red-500/10 hover:bg-red-500 transition-all hover:text-white"
           >
             <LogOut size={18} />
           </button>
        </header>

        {/* Global Controls */}
        <div className="grid grid-cols-2 gap-4">
           <div className="bg-white/[0.02] p-6 rounded-[2.5rem] border border-white/5 space-y-2">
              <p className="text-[8px] text-zinc-500 uppercase font-black tracking-widest">منحة التأسيس</p>
              <div className="flex items-center gap-2">
                <input 
                  type="number" 
                  value={welcomeGiftAmount}
                  onChange={(e) => setWelcomeGiftAmount(Number(e.target.value))}
                  className="w-full bg-transparent border-none outline-none text-2xl font-black text-primary tabular-nums"
                />
                <button className="text-zinc-700 hover:text-white"><RefreshCw size={14}/></button>
              </div>
           </div>
           <div className="bg-white/[0.02] p-6 rounded-[2.5rem] border border-white/5 space-y-2 text-center flex flex-col items-center justify-center">
              <p className="text-[8px] text-zinc-500 uppercase font-black tracking-widest">المواطنون</p>
              <p className="text-2xl font-black text-white tabular-nums">{citizens?.length || 0}</p>
           </div>
        </div>

        {/* Quick Execution Bar */}
        <div className="bg-white/[0.02] p-8 rounded-[3rem] border border-white/5 space-y-6">
           <div className="space-y-2">
              <label className="text-[8px] font-black text-zinc-600 uppercase tracking-widest px-2">تنفيذ سريع عبر البريد</label>
              <input 
                value={targetEmail}
                onChange={(e) => setTargetUserEmail(e.target.value)}
                placeholder="citizen@domain.com"
                className="w-full h-14 bg-black/40 border border-white/5 p-5 rounded-2xl text-white text-sm font-bold outline-none focus:border-primary transition-all text-right"
              />
           </div>
           <div className="flex gap-2">
              <ActionBtn onClick={() => handleAction('recharge')} icon={<Zap size={14}/>} label="شحن" color="emerald" />
              <ActionBtn onClick={() => handleAction('vip')} icon={<Star size={14}/>} label="VIP" color="amber" />
              <ActionBtn onClick={() => handleAction('ban')} icon={<Ban size={14}/>} label="حظر" color="red" />
           </div>
        </div>

        {/* Citizens Ledger */}
        <div className="space-y-4">
           <div className="flex items-center justify-between px-4">
              <h3 className="text-xs font-black text-white/40 uppercase tracking-widest">سجل المواطنين</h3>
              <Users size={14} className="text-zinc-800" />
           </div>
           
           <div className="space-y-2">
              {citizensLoading ? (
                <Loader2 className="animate-spin text-white/5 mx-auto" />
              ) : citizens?.map((citizen) => (
                <div key={citizen.id} className="bg-white/[0.01] border border-white/5 p-5 rounded-[2rem] flex items-center justify-between group hover:bg-white/[0.03] transition-all">
                   <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-xl bg-zinc-900 flex items-center justify-center font-black text-zinc-700 text-xs border border-white/5">
                        {citizen.fullName?.charAt(0)}
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-bold text-white leading-none">{citizen.fullName}</p>
                        <p className="text-[9px] text-zinc-600 font-bold mt-1">{citizen.email}</p>
                      </div>
                   </div>
                   <div className="flex items-center gap-2">
                      <span className="text-[10px] font-black text-primary tabular-nums bg-primary/5 px-3 py-1 rounded-lg border border-primary/10">{citizen.balance}</span>
                      <button 
                        onClick={() => handleAction('ban', citizen.email)}
                        className="p-2 text-zinc-800 hover:text-red-500 transition-colors"
                      >
                        <Ban size={14} />
                      </button>
                   </div>
                </div>
              ))}
           </div>
        </div>

        {/* Sovereign Logs */}
        <div className="p-8 bg-black/60 rounded-[3rem] border border-white/5 font-mono text-[9px] text-zinc-700 italic space-y-2 shadow-inner">
           <div className="flex items-center gap-2"><span className="text-primary font-black">&gt;&gt;</span> SUPREME PROTOCOL: king2026 ACTIVE</div>
           <div className="flex items-center gap-2"><span className="text-primary font-black">&gt;&gt;</span> DATABASE: NEON POSTGRES STABLE</div>
           <div className="flex items-center gap-2 opacity-40"><span className="text-zinc-800">&gt;&gt;</span> AUTH_DOMAIN: studio-3724556052-f179c</div>
        </div>

      </div>
    </SovereignLayout>
  );
}

function ActionBtn({ icon, label, onClick, color }: any) {
  const colors: any = {
    emerald: "text-emerald-500 hover:bg-emerald-500/10 border-emerald-500/10",
    amber: "text-amber-500 hover:bg-amber-500/10 border-amber-500/10",
    red: "text-red-500 hover:bg-red-500/10 border-red-500/10"
  };
  return (
    <button 
      onClick={onClick}
      className={`flex-1 flex items-center justify-center gap-2 h-12 bg-white/[0.02] border rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all ${colors[color]}`}
    >
      {icon} {label}
    </button>
  );
}
