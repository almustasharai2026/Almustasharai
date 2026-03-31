
'use client';

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  ShieldCheck, Palette, Users, Zap, 
  Ban, Star, Wallet, Eye, Settings, Image as ImageIcon,
  MessageSquare, Globe, Lock, Loader2, TrendingUp,
  ArrowRight, CheckCircle, RefreshCw, Terminal, CreditCard,
  Menu, X, LogOut
} from "lucide-react";
import { useUser, useFirestore, useCollection, useMemoFirebase } from "@/firebase";
import { useToast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";
import { collection, query, where, doc, updateDoc, getDocs, increment, serverTimestamp } from "firebase/firestore";
import { roles as ROLES_LIST, SOVEREIGN_ADMIN_EMAIL } from "@/lib/roles";
import { cn } from "@/lib/utils";

type AdminTab = 'global' | 'users' | 'design' | 'ai';

export default function SupremeCommandCenter() {
  const { user, role, isUserLoading, signOut } = useUser();
  const db = useFirestore();
  const router = useRouter();
  const { toast } = useToast();
  
  const [activeTab, setActiveTab] = useState<AdminTab>('global');
  const [targetUserEmail, setTargetUserEmail] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // جلب إحصائيات سريعة للكوكب - تم تغليفها ببروتوكول useMemoFirebase السيادي
  const usersQuery = useMemoFirebase(() => {
    if (!db) return null;
    return collection(db, "users");
  }, [db]);
  const { data: allUsers } = useCollection(usersQuery);
  
  const requestsQuery = useMemoFirebase(() => {
    if (!db) return null;
    return collection(db, "paymentRequests");
  }, [db]);
  const { data: allRequests } = useCollection(requestsQuery);

  // حماية الوصول الصارمة للملك فقط
  const isOwner = user?.email === SOVEREIGN_ADMIN_EMAIL;

  if (isUserLoading) return (
    <div className="h-screen bg-[#020205] flex items-center justify-center">
      <Loader2 className="animate-spin text-primary h-12 w-12" />
    </div>
  );

  if (!isOwner) {
    return (
      <div className="h-screen flex flex-col items-center justify-center bg-black text-red-500 gap-10">
        <ShieldCheck size={100} className="animate-pulse" />
        <h1 className="text-4xl font-black uppercase tracking-[0.5em]">Authority Denied</h1>
        <button onClick={() => router.push("/")} className="bg-red-600 text-white px-10 py-4 rounded-2xl">تراجع فوراً</button>
      </div>
    );
  }

  const handleUserAction = async (action: 'ban' | 'vip' | 'recharge') => {
    if (!targetUserEmail.trim() || !db) return;
    setIsProcessing(true);
    
    try {
      const q = query(collection(db, "users"), where("email", "==", targetUserEmail.trim()));
      const snap = await getDocs(q);
      
      if (snap.empty) {
        toast({ variant: "destructive", title: "فشل البروتوكول", description: "المواطن غير مسجل في سجلات الكوكب." });
        return;
      }

      const userDoc = snap.docs[0];
      const userRef = doc(db, "users", userDoc.id);

      if (action === 'ban') {
        await updateDoc(userRef, { isBanned: true });
        toast({ title: "تم الحظر السيادي 🚫", description: `تم تعطيل وصول ${targetUserEmail} نهائياً.` });
      } else if (action === 'vip') {
        await updateDoc(userRef, { role: ROLES_LIST.VIP });
        toast({ title: "ترقية ملكية ⭐", description: `تم منح ${targetUserEmail} رتبة مواطن VIP.` });
      } else if (action === 'recharge') {
        await updateDoc(userRef, { balance: increment(500) });
        toast({ title: "شحن سيادي 💸", description: "تم إضافة 500 وحدة مالية للمحفظة." });
      }
    } catch (e) {
      toast({ variant: "destructive", title: "خطأ في المزامنة" });
    } finally {
      setIsProcessing(false);
      setTargetUserEmail("");
    }
  };

  const navItems = [
    { id: 'global' as AdminTab, label: 'إدارة المنصة', icon: <Globe size={20}/> },
    { id: 'users' as AdminTab, label: 'التحكم في المواطنين', icon: <Users size={20}/> },
    { id: 'design' as AdminTab, label: 'مهندس الواجهات', icon: <Palette size={20}/> },
    { id: 'ai' as AdminTab, label: 'تفويض البوت', icon: <Zap size={20}/> },
  ];

  return (
    <div className="min-h-screen bg-[#020205] text-white flex overflow-hidden font-sans" dir="rtl">
      
      {/* 1. Mobile Overlay */}
      <AnimatePresence>
        {isSidebarOpen && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsSidebarOpen(false)}
            className="fixed inset-0 bg-black/80 backdrop-blur-md z-[100] lg:hidden"
          />
        )}
      </AnimatePresence>

      {/* 2. Responsive Sidebar */}
      <aside className={cn(
        "fixed lg:relative z-[110] h-full w-80 bg-[#05050a] border-l border-white/5 flex flex-col transition-transform duration-500 ease-in-out shadow-3xl",
        isSidebarOpen ? "translate-x-0" : "translate-x-full lg:translate-x-0"
      )}>
        {/* Sidebar Header */}
        <div className="p-8 border-b border-white/5 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-primary rounded-2xl flex items-center justify-center shadow-3xl border border-white/10">
              <ShieldCheck className="text-[#020617] h-7 w-7" />
            </div>
            <div className="flex flex-col">
              <span className="text-xl font-black tracking-tighter text-white">المستشار AI</span>
              <span className="text-[8px] text-primary font-black uppercase tracking-[0.3em]">Sovereign Node</span>
            </div>
          </div>
          <button onClick={() => setIsSidebarOpen(false)} className="lg:hidden p-2 text-white/20 hover:text-white transition-colors">
            <X size={24} />
          </button>
        </div>

        {/* Navigation Protocol */}
        <nav className="flex-1 p-6 space-y-3 overflow-y-auto">
          <p className="text-[9px] font-black uppercase tracking-[0.4em] text-white/10 mb-5 px-4">Supreme Commands</p>
          {navItems.map((item) => (
            <button 
              key={item.id}
              onClick={() => { setActiveTab(item.id); setIsSidebarOpen(false); }}
              className={`w-full flex items-center gap-5 p-5 rounded-[2rem] transition-all duration-500 ${
                activeTab === item.id 
                ? 'bg-white text-black shadow-3xl scale-105 font-black' 
                : 'text-zinc-500 hover:bg-white/5 font-bold'
              }`}
            >
              <span className={activeTab === item.id ? 'text-black' : 'text-zinc-600'}>{item.icon}</span>
              <span className="text-sm tracking-tight">{item.label}</span>
            </button>
          ))}
        </nav>

        {/* Sidebar Footer */}
        <div className="p-8 border-t border-white/5 bg-black/40">
          <button 
            onClick={() => signOut()}
            className="w-full flex items-center justify-center gap-3 p-5 rounded-2xl bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white transition-all text-xs font-black uppercase tracking-widest"
          >
            <LogOut size={18} /> تسجيل الخروج السيادي
          </button>
        </div>
      </aside>

      {/* 3. Main Operational Area */}
      <main className="flex-1 h-screen overflow-y-auto scrollbar-none relative">
        
        {/* Mobile Navbar */}
        <div className="lg:hidden sticky top-0 z-50 w-full p-6 flex justify-between items-center bg-[#020205]/80 backdrop-blur-xl border-b border-white/5">
          <button onClick={() => setIsSidebarOpen(true)} className="p-4 bg-white/5 rounded-2xl border border-white/5 text-primary">
            <Menu size={24} />
          </button>
          <div className="flex flex-col items-end">
            <span className="text-[10px] font-black text-primary uppercase tracking-widest">Sovereign Mode</span>
            <span className="text-sm font-black text-white">king2026 Active</span>
          </div>
        </div>

        <div className="p-8 lg:p-16 max-w-6xl mx-auto space-y-16">
          
          {/* Dashboard Title & Stats Overview */}
          <div className="flex flex-col md:flex-row justify-between items-end gap-10 border-b border-white/5 pb-16">
            <div className="space-y-4">
              <motion.h1 
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="text-5xl lg:text-7xl font-black tracking-tighter italic bg-gradient-to-r from-emerald-400 via-amber-500 to-primary bg-clip-text text-transparent"
              >
                غرفة القيادة العليا
              </motion.h1>
              <p className="text-zinc-500 text-[10px] uppercase tracking-[0.5em] mt-2">Authority Protocol v5.5 | User: king2026</p>
            </div>
            <div className="flex items-center gap-6">
               <QuickStat label="المواطنين" value={allUsers?.length || 0} />
               <QuickStat label="طلبات الدفع" value={allRequests?.filter(r => r.status === 'pending').length || 0} />
               <div className="bg-emerald-500/10 p-6 rounded-[2rem] border border-emerald-500/20 shadow-3xl text-left">
                  <span className="text-zinc-500 text-[8px] font-black uppercase block mb-1">رصيد المالك</span>
                  <span className="text-3xl font-black text-emerald-500 tabular-nums">∞ ج.م</span>
               </div>
            </div>
          </div>

          {/* Active Workstation */}
          <div className="glass-cosmic border-white/5 rounded-[4rem] p-10 lg:p-16 relative overflow-hidden shadow-3xl min-h-[600px]">
            <div className="absolute top-0 right-0 w-96 h-96 bg-primary/5 blur-[100px] -z-10" />
            
            <AnimatePresence mode="wait">
              {activeTab === 'global' && (
                <motion.div key="global" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-12">
                  <h3 className="text-4xl font-black italic flex items-center gap-5"><Settings size={32} className="text-emerald-500" /> إدارة الكوكب</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <ControlBox title="منحة التسجيل" value="50 ج.م" desc="تعديل هدية المواطنين الجدد" action="تعديل" />
                    <ControlBox title="حالة الفوترة" value="نشط" desc="إيقاف أو تشغيل نظام الخصم المالي" action="تعطيل" />
                    <ControlBox title="تسعيرة المستشار AI" value="5 ج.م" desc="تكلفة السؤال للذكاء الاصطناعي" action="تعديل" />
                    <ControlBox title="عمولة الخبير" value="30 ج.م" desc="تكلفة فتح جلسة اتصال مع محامي" action="تعديل" />
                  </div>
                </motion.div>
              )}

              {activeTab === 'users' && (
                <motion.div key="users" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-12">
                   <h3 className="text-4xl font-black italic flex items-center gap-5"><Users size={32} className="text-blue-500" /> التحكم في المواطنين</h3>
                   <div className="bg-black/40 p-12 rounded-[3.5rem] border border-white/5 space-y-10 shadow-inner">
                      <div className="space-y-3">
                        <label className="text-[10px] font-black text-white/20 uppercase tracking-widest px-6">تحديد الهوية المستهدفة</label>
                        <input 
                          value={targetUserEmail}
                          onChange={(e) => setTargetUserEmail(e.target.value)}
                          placeholder="ابحث عن مواطن (إيميل أو ID)..." 
                          className="w-full h-20 bg-white/5 border border-white/5 rounded-3xl px-8 text-white text-2xl font-bold outline-none focus:ring-4 focus:ring-blue-500/10 transition-all text-right" 
                        />
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <UserActionBtn onClick={() => handleUserAction('ban')} loading={isProcessing} icon={<Ban size={20}/>} label="حظر نهائي" color="red" />
                        <UserActionBtn onClick={() => handleUserAction('vip')} loading={isProcessing} icon={<Star size={20}/>} label="منح رتبة VIP" color="amber" />
                        <UserActionBtn onClick={() => handleUserAction('recharge')} loading={isProcessing} icon={<Wallet size={20}/>} label="شحن رصيد يدوي" color="white" />
                      </div>
                   </div>
                </motion.div>
              )}

              {activeTab === 'design' && (
                <motion.div key="design" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-12">
                   <h3 className="text-4xl font-black italic flex items-center gap-5"><Palette size={32} className="text-amber-500" /> مهندس المظهر</h3>
                   <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                      <div className="space-y-6">
                        <label className="text-xs font-black text-zinc-500 uppercase tracking-widest block">لون هوية الكوكب</label>
                        <div className="flex items-center gap-8 p-8 bg-white/5 rounded-[2.5rem] border border-white/5">
                          <input type="color" className="w-24 h-24 rounded-full bg-transparent border-none cursor-pointer overflow-hidden shadow-3xl" defaultValue="#D4AF37" />
                          <div className="space-y-1">
                            <span className="font-black text-white text-lg block">Sovereign Gold</span>
                            <span className="font-mono text-xs text-zinc-500">HEX: #D4AF37</span>
                          </div>
                        </div>
                      </div>
                      <div className="space-y-6">
                        <label className="text-xs font-black text-zinc-500 uppercase tracking-widest block">خلفية البوابة (Cinema URL)</label>
                        <div className="relative group">
                           <input defaultValue="https://picsum.photos/seed/legal99/1920/1080" className="w-full bg-white/5 border border-white/5 p-6 rounded-3xl text-[10px] text-zinc-400 font-mono focus:border-amber-500 transition-all pr-12" />
                           <ImageIcon size={20} className="absolute right-6 top-1/2 -translate-y-1/2 text-zinc-600" />
                        </div>
                        <p className="text-[10px] text-zinc-600 px-6 italic">سيتم تطبيق الصورة فوراً تحت طبقة الزجاج البلوري لكافة المواطنين.</p>
                      </div>
                   </div>
                   <button className="bg-primary text-black font-black px-12 py-6 rounded-3xl hover:scale-105 transition-all shadow-3xl text-xl mt-10">حفظ التغييرات البصرية</button>
                </motion.div>
              )}

              {activeTab === 'ai' && (
                <motion.div key="ai" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-12">
                   <h3 className="text-4xl font-black italic flex items-center gap-5"><Zap size={32} className="text-purple-500" /> تفويض البوت</h3>
                   <div className="p-10 bg-purple-500/5 border border-purple-500/10 rounded-[3.5rem] mb-10">
                      <p className="text-white/60 text-xl leading-relaxed font-bold">يمكنك تفويض "المستشار السيادي" للقيام بمهام إدارية ورقابية تلقائية لضمان أمان الكوكب.</p>
                   </div>
                   <div className="space-y-6">
                     <ToggleSwitch label="السماح للبوت بتعديل ثيم الموقع حسب الوقت" enabled={true} />
                     <ToggleSwitch label="تفعيل 'الرد الملكي' الفوري لطلبات الـ VIP" enabled={true} />
                     <ToggleSwitch label="السماح للبوت بحظر المسيئين آلياً (Smart Shield)" enabled={false} />
                     <ToggleSwitch label="توليد تقارير أسبوعية سيادية تلقائياً" enabled={true} />
                   </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* God Terminal Preview */}
          <div className="bg-[#050505] border border-white/5 rounded-[3rem] overflow-hidden flex flex-col h-80 shadow-3xl">
              <div className="p-6 border-b border-white/5 bg-white/[0.02] flex justify-between items-center">
                <div className="flex items-center gap-3">
                  <Terminal className="text-emerald-500" size={20} />
                  <span className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Supreme Sovereign Logs</span>
                </div>
                <div className="flex gap-2">
                   <div className="w-2.5 h-2.5 bg-red-500/40 rounded-full" />
                   <div className="w-2.5 h-2.5 bg-amber-500/40 rounded-full" />
                   <div className="w-2.5 h-2.5 bg-emerald-500/40 rounded-full" />
                </div>
              </div>
              <div className="p-8 font-mono text-[11px] overflow-y-auto space-y-3 flex-1 scrollbar-none text-zinc-500 italic">
                <div>&gt;&gt; INITIALIZING AUTHORITY PROTOCOL... DONE</div>
                <div>&gt;&gt; CONNECTING TO NEON POSTGRES... STABLE</div>
                <div>&gt;&gt; SCANNING FOR CITIZEN VIOLATIONS... CLEAN</div>
                <div>&gt;&gt; SOVEREIGN HUB ACTIVE | king2026 SUPREMACY RECOGNIZED</div>
              </div>
          </div>

        </div>
      </main>
    </div>
  );
}

// --- المكونات المساعدة للسيطرة ---

const ControlBox = ({ title, value, desc, action }: any) => (
  <div className="bg-black/40 border border-white/5 p-10 rounded-[3rem] flex justify-between items-center group hover:border-emerald-500/30 transition-all duration-500 shadow-xl">
    <div className="text-right">
      <p className="text-[10px] text-zinc-500 font-black uppercase tracking-widest mb-2">{title}</p>
      <p className="text-4xl font-black text-white tracking-tighter">{value}</p>
      <p className="text-[10px] text-zinc-600 mt-2 font-bold">{desc}</p>
    </div>
    <button className="bg-white/5 border border-white/10 px-8 py-4 rounded-2xl text-[10px] font-black hover:bg-emerald-500 hover:text-black transition-all active:scale-90 shadow-2xl">
      {action}
    </button>
  </div>
);

const UserActionBtn = ({ onClick, loading, icon, label, color }: any) => {
  const styles: any = {
    red: "bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white border-red-500/20",
    amber: "bg-amber-500/10 text-amber-500 hover:bg-amber-500 hover:text-black border-amber-500/20",
    white: "bg-white text-black hover:scale-95 border-white"
  };
  return (
    <button 
      onClick={onClick}
      disabled={loading}
      className={`py-6 rounded-3xl font-black text-xs transition-all shadow-xl border flex items-center justify-center gap-4 ${styles[color]}`}
    >
      {loading ? <Loader2 className="animate-spin" size={20}/> : icon} {label}
    </button>
  );
};

const ToggleSwitch = ({ label, enabled }: any) => (
  <div className="flex justify-between items-center bg-black/40 p-10 rounded-[3rem] border border-white/5 hover:bg-black/60 transition-all shadow-inner">
    <span className="text-lg font-black text-zinc-300">{label}</span>
    <div className={`w-20 h-10 rounded-full relative p-2 transition-all duration-500 cursor-pointer ${enabled ? 'bg-emerald-500 shadow-[0_0_25px_rgba(16,185,129,0.4)]' : 'bg-zinc-800'}`}>
       <div className={`w-6 h-6 bg-white rounded-full transition-all duration-500 shadow-xl ${enabled ? 'translate-x-[-2.5rem]' : 'translate-x-0'}`} />
    </div>
  </div>
);

const QuickStat = ({ label, value }: any) => (
  <div className="hidden md:flex flex-col items-end">
    <span className="text-[8px] font-black text-zinc-500 uppercase tracking-widest">{label}</span>
    <span className="text-xl font-black text-white tabular-nums">{value}</span>
  </div>
);

const Badge = ({ children, className }: any) => (
  <span className={cn("px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border border-emerald-500/20 bg-emerald-500/5 text-emerald-500", className)}>
    {children}
  </span>
);
