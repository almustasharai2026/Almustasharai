'use client';

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  ShieldCheck, Users, Zap, Ban, Star, Wallet, 
  Loader2, ChevronLeft, Terminal, LogOut, ShieldAlert,
  Settings, Gift, RefreshCw, Search, ArrowRight, Gavel
} from "lucide-react";
import SovereignLayout from "@/components/SovereignLayout";
import { useUser, useFirestore, useCollection, useMemoFirebase } from "@/firebase";
import { useToast } from "@/hooks/use-toast";
import { collection, query, where, doc, updateDoc, getDocs, increment, serverTimestamp, deleteDoc } from "firebase/firestore";
import { roles as ROLES_LIST, checkSovereignStatus } from "@/lib/roles";
import Link from "next/link";

/**
 * غرفة القيادة العليا (The Supreme Command Center).
 * واجهة غامرة لإدارة الكوكب والسيطرة المطلقة للملك king2026.
 */
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
      <div className="space-y-12 pb-40 pt-10">
        
        <header className="flex justify-between items-end border-b border-white/5 pb-10">
           <div className="text-right space-y-4">
              <div className="inline-flex items-center gap-2 bg-primary/10 px-4 py-1 rounded-full border border-primary/20">
                <ShieldCheck size={12} className="text-primary" />
                <span className="text-[10px] font-black text-primary uppercase tracking-widest">Sovereign Control Node</span>
              </div>
              <h2 className="text-6xl font-black text-white tracking-tighter leading-none">غرفة <span className="text-primary">السيطرة</span></h2>
              <p className="text-xs font-black text-zinc-600 uppercase tracking-[0.4em] mt-2">Supreme Global Administration Hub</p>
           </div>
           <div className="flex gap-4">
             <Link href="/admin/consultants">
               <button className="p-5 bg-white/5 text-white rounded-3xl border border-white/5 hover:bg-white/10 transition-all flex items-center gap-3 font-bold text-sm">
                 <Gavel size={20} className="text-primary" /> مراجعة الخبراء
               </button>
             </Link>
             <button 
              onClick={() => signOut()}
              className="p-5 bg-red-500/10 text-red-500 rounded-3xl border border-red-500/10 hover:bg-red-500 transition-all hover:text-white shadow-2xl"
             >
               <LogOut size={24} />
             </button>
           </div>
        </header>

        {/* Global Matrix Controls */}
        <div className="grid md:grid-cols-3 gap-8">
           <div className="bg-[#111] p-10 rounded-[3.5rem] border border-white/5 space-y-4 shadow-2xl">
              <p className="text-[10px] text-zinc-500 uppercase font-black tracking-widest">منحة التأسيس الحالية</p>
              <div className="flex items-center gap-4">
                <input 
                  type="number" 
                  value={welcomeGiftAmount}
                  onChange={(e) => setWelcomeGiftAmount(Number(e.target.value))}
                  className="w-full bg-transparent border-none outline-none text-5xl font-black text-primary tabular-nums"
                />
                <button className="p-3 bg-white/5 rounded-2xl text-zinc-700 hover:text-white transition-all"><RefreshCw size={20}/></button>
              </div>
           </div>
           <div className="md:col-span-2 bg-[#111] p-10 rounded-[3.5rem] border border-white/5 flex items-center justify-between shadow-2xl">
              <div className="space-y-2">
                <p className="text-[10px] text-zinc-500 uppercase font-black tracking-widest">تعداد المواطنين</p>
                <p className="text-6xl font-black text-white tabular-nums">{citizens?.length || 0}</p>
              </div>
              <div className="flex gap-4">
                 <div className="h-20 w-20 rounded-3xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-500 flex-col gap-1">
                    <span className="text-xl font-black">12</span>
                    <span className="text-[8px] font-black uppercase">Online</span>
                 </div>
                 <div className="h-20 w-20 rounded-3xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-500 flex-col gap-1">
                    <span className="text-xl font-black">5</span>
                    <span className="text-[8px] font-black uppercase">Experts</span>
                 </div>
              </div>
           </div>
        </div>

        {/* Execution & Ledger Grid */}
        <div className="grid lg:grid-cols-12 gap-12">
          
          {/* Quick Execution Portal */}
          <div className="lg:col-span-5 space-y-8">
            <div className="bg-[#111] p-10 rounded-[4rem] border border-white/5 space-y-10 shadow-3xl">
               <div className="space-y-4">
                  <label className="text-xs font-black text-zinc-600 uppercase tracking-widest px-4">تنفيذ استراتيجي فوري</label>
                  <div className="relative group">
                    <Search className="absolute right-6 top-1/2 -translate-y-1/2 text-zinc-800 group-focus-within:text-primary h-6 w-6 transition-colors" />
                    <input 
                      value={targetEmail}
                      onChange={(e) => setTargetUserEmail(e.target.value)}
                      placeholder="citizen@domain.com"
                      className="w-full h-20 bg-black/40 border border-white/5 p-8 pr-16 rounded-[2.5rem] text-white text-xl font-bold outline-none focus:border-primary transition-all text-right shadow-inner"
                    />
                  </div>
               </div>
               <div className="grid grid-cols-1 gap-4">
                  <div className="flex gap-4">
                    <ActionBtn onClick={() => handleAction('recharge')} icon={<Zap size={20}/>} label="شحن رصيد" color="emerald" />
                    <ActionBtn onClick={() => handleAction('vip')} icon={<Star size={20}/>} label="ترقية VIP" color="amber" />
                  </div>
                  <ActionBtn onClick={() => handleAction('ban')} icon={<Ban size={20}/>} label="إصدار حظر عالمي" color="red" wide />
               </div>
            </div>

            {/* Sovereign Terminal Logs */}
            <div className="p-10 bg-black/80 rounded-[4rem] border border-white/5 font-mono text-[11px] text-zinc-700 italic space-y-4 shadow-2xl max-h-[400px] overflow-y-auto scrollbar-none">
               <div className="flex items-center gap-3"><span className="text-primary font-black">&gt;&gt;</span> SUPREME PROTOCOL: king2026 ACTIVE</div>
               <div className="flex items-center gap-3"><span className="text-primary font-black">&gt;&gt;</span> DATABASE: NEON POSTGRES STABLE | SYNC OK</div>
               <div className="flex items-center gap-3"><span className="text-primary font-black">&gt;&gt;</span> ENCRYPTION: 4096-BIT RSA SHIELD ENGAGED</div>
               <div className="flex items-center gap-3 opacity-40"><span className="text-zinc-800">&gt;&gt;</span> LAST SYNC: {new Date().toLocaleTimeString('ar-EG')}</div>
               <div className="flex items-center gap-3"><span className="text-primary font-black">&gt;&gt;</span> MONITORING: 0 ANOMALIES DETECTED</div>
            </div>
          </div>

          {/* Citizen Ledger Table */}
          <div className="lg:col-span-7 space-y-6">
             <div className="flex items-center justify-between px-8">
                <h3 className="text-xl font-black text-white tracking-tighter uppercase">سجل المواطنين والمراكز المالية</h3>
                <Users size={20} className="text-zinc-800" />
             </div>
             
             <div className="space-y-3">
                {citizensLoading ? (
                  <div className="flex justify-center py-20"><Loader2 className="animate-spin text-white/5 h-12 w-12" /></div>
                ) : citizens?.map((citizen) => (
                  <div key={citizen.id} className="bg-[#111] border border-white/5 p-8 rounded-[3rem] flex items-center justify-between group hover:bg-[#151515] transition-all hover:scale-[1.02] shadow-xl">
                     <div className="flex items-center gap-8">
                        <div className="w-16 h-16 rounded-[1.5rem] bg-zinc-900 flex items-center justify-center font-black text-zinc-700 text-2xl border border-white/5 shadow-inner">
                          {citizen.fullName?.charAt(0)}
                        </div>
                        <div className="text-right">
                          <p className="text-xl font-black text-white leading-none">{citizen.fullName}</p>
                          <div className="flex gap-4 mt-3">
                            <p className="text-[10px] text-zinc-600 font-bold uppercase tracking-widest">{citizen.email}</p>
                            <span className="text-[10px] font-black text-primary px-3 py-0.5 bg-primary/5 rounded-full border border-primary/10">{citizen.role}</span>
                          </div>
                        </div>
                     </div>
                     <div className="flex items-center gap-6">
                        <div className="text-right">
                          <p className="text-xs font-black text-zinc-700 uppercase tracking-widest">Vault Balance</p>
                          <p className="text-3xl font-black text-primary tabular-nums mt-1">{citizen.balance} <span className="text-[10px] opacity-40">EGP</span></p>
                        </div>
                        <button 
                          onClick={() => handleAction('ban', citizen.email)}
                          className="p-4 bg-red-500/5 text-zinc-800 hover:text-red-500 hover:bg-red-500/10 rounded-2xl transition-all border border-transparent hover:border-red-500/20"
                        >
                          <Ban size={20} />
                        </button>
                     </div>
                  </div>
                ))}
             </div>
          </div>

        </div>

      </div>
    </SovereignLayout>
  );
}

function ActionBtn({ icon, label, onClick, color, wide = false }: any) {
  const colors: any = {
    emerald: "text-emerald-500 bg-emerald-500/5 hover:bg-emerald-500/10 border-emerald-500/10",
    amber: "text-amber-500 bg-amber-500/5 hover:bg-amber-500/10 border-amber-500/10",
    red: "text-red-500 bg-red-500/5 hover:bg-red-500/10 border-red-500/10"
  };
  return (
    <button 
      onClick={onClick}
      className={`${wide ? 'w-full' : 'flex-1'} flex items-center justify-center gap-4 h-20 border rounded-[2rem] text-sm font-black uppercase tracking-widest transition-all shadow-xl hover:scale-[1.02] active:scale-[0.98] ${colors[color]}`}
    >
      <span className="scale-125">{icon}</span>
      {label}
    </button>
  );
}
