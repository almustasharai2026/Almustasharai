
'use client';

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  ShieldCheck, Palette, Users, Zap, 
  Ban, Star, Wallet, Eye, Settings, Image as ImageIcon,
  MessageSquare, Globe, Lock, Loader2, TrendingUp,
  ArrowRight, CheckCircle, RefreshCw, Terminal, CreditCard
} from "lucide-react";
import { useUser, useFirestore, useCollection } from "@/firebase";
import { useToast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";
import { collection, query, where, doc, updateDoc, getDocs, increment, serverTimestamp } from "firebase/firestore";
import SovereignLayout from "@/components/SovereignLayout";
import { roles as ROLES_LIST, SOVEREIGN_ADMIN_EMAIL } from "@/lib/roles";

type AdminTab = 'global' | 'users' | 'design' | 'ai';

export default function SupremeCommandCenter() {
  const { user, profile, role, isUserLoading } = useUser();
  const db = useFirestore();
  const router = useRouter();
  const { toast } = useToast();
  
  const [activeTab, setActiveTab] = useState<AdminTab>('global');
  const [targetUserEmail, setTargetUserEmail] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);

  // جلب إحصائيات سريعة للكوكب
  const usersQuery = collection(db!, "users");
  const { data: allUsers } = useCollection(usersQuery as any);
  
  const requestsQuery = collection(db!, "paymentRequests");
  const { data: allRequests } = useCollection(requestsQuery as any);

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

  return (
    <SovereignLayout activeId="dash">
      <div className="min-h-screen bg-[#050505] text-white p-8 lg:p-12 font-sans relative overflow-hidden" dir="rtl">
        
        {/* Header - الإمبراطورية */}
        <header className="flex flex-col md:flex-row justify-between items-end mb-16 border-b border-white/5 pb-10">
          <div className="space-y-2">
            <motion.h1 
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="text-6xl font-black tracking-tighter italic bg-gradient-to-r from-emerald-400 via-amber-500 to-primary bg-clip-text text-transparent"
            >
              مركز السيطرة الملكي
            </motion.h1>
            <p className="text-zinc-500 text-[10px] uppercase tracking-[0.5em] mt-2">Sovereign Mode: Active | User: Bishoy Samy</p>
          </div>
          
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-left bg-emerald-500/10 p-6 rounded-[2rem] border border-emerald-500/20 shadow-3xl backdrop-blur-xl"
          >
             <span className="text-zinc-500 text-[8px] font-black uppercase block mb-2 tracking-widest">رصيد المالك السيادي</span>
             <div className="flex items-center gap-3">
                <Zap className="text-emerald-500 animate-pulse" size={24} fill="currentColor" />
                <span className="text-4xl font-black text-emerald-500 tabular-nums">∞ <small className="text-xs">ج.م</small></span>
             </div>
          </motion.div>
        </header>

        <div className="grid grid-cols-12 gap-10">
          
          {/* القائمة الجانبية للصلاحيات */}
          <aside className="col-span-12 lg:col-span-3 space-y-3">
            <AdminNav active={activeTab === 'global'} onClick={() => setActiveTab('global')} icon={<Globe size={20}/>} label="إدارة المنصة" />
            <AdminNav active={activeTab === 'users'} onClick={() => setActiveTab('users')} icon={<Users size={20}/>} label="التحكم في المواطنين" />
            <AdminNav active={activeTab === 'design'} onClick={() => setActiveTab('design')} icon={<Palette size={20}/>} label="مهندس الواجهات" />
            <AdminNav active={activeTab === 'ai'} onClick={() => setActiveTab('ai')} icon={<Zap size={20}/>} label="تفويض البوت" />
            
            <div className="mt-10 p-6 glass-cosmic rounded-3xl border-white/5">
               <p className="text-[10px] font-black text-white/20 uppercase tracking-widest mb-4 text-center">حالة الكوكب الحالية</p>
               <div className="space-y-4">
                  <QuickStat label="المواطنين" value={allUsers?.length || 0} icon={<Users size={12}/>} />
                  <QuickStat label="طلبات الدفع" value={allRequests?.filter(r => r.status === 'pending').length || 0} icon={<CreditCard size={12}/>} />
                  <QuickStat label="أمان النظام" value="100%" icon={<ShieldCheck size={12}/>} />
               </div>
            </div>
          </aside>

          {/* مساحة العمل الحية - زجاجية بلورية */}
          <main className="col-span-12 lg:col-span-9 glass-cosmic border-white/5 rounded-[4rem] p-12 relative overflow-hidden shadow-3xl">
            <div className="absolute top-0 right-0 w-96 h-96 bg-primary/5 blur-[100px] -z-10" />
            
            <AnimatePresence mode="wait">
              {/* 1. إدارة المنصة والسيولة */}
              {activeTab === 'global' && (
                <motion.div key="global" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-10">
                  <div className="flex items-center justify-between border-b border-white/5 pb-6">
                    <h3 className="text-3xl font-black italic flex items-center gap-4"><Settings className="text-emerald-500" /> إعدادات السيستم</h3>
                    <Badge variant="outline" className="border-emerald-500/30 text-emerald-500">بروتوكول king2026 نشط</Badge>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <ControlBox title="منحة التسجيل" value="50 ج.م" desc="تعديل هدية المواطنين الجدد" action="تعديل" />
                    <ControlBox title="حالة الفوترة" value="نشط" desc="إيقاف أو تشغيل نظام الخصم المالي" action="تعطيل" />
                    <ControlBox title="تسعيرة المستشار AI" value="5 ج.م" desc="تكلفة السؤال الواحد للذكاء الاصطناعي" action="تعديل" />
                    <ControlBox title="عمولة الخبير" value="30 ج.م" desc="تكلفة فتح جلسة اتصال مع محامي" action="تعديل" />
                  </div>
                </motion.div>
              )}

              {/* 2. إدارة المستخدمين (التحكم في البشر) */}
              {activeTab === 'users' && (
                <motion.div key="users" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-10">
                   <h3 className="text-3xl font-black italic flex items-center gap-4"><Users className="text-blue-500" /> التحكم في المواطنين</h3>
                   <div className="bg-black/40 p-10 rounded-[3rem] border border-white/5 space-y-8 shadow-inner">
                      <div className="space-y-2 text-right">
                        <label className="text-[10px] font-black text-white/20 uppercase tracking-widest px-4">تحديد الهوية المستهدفة</label>
                        <input 
                          value={targetUserEmail}
                          onChange={(e) => setTargetUserEmail(e.target.value)}
                          placeholder="ابحث عن مواطن (إيميل أو ID)..." 
                          className="w-full bg-white/5 border border-white/5 rounded-2xl p-6 text-white text-xl font-bold outline-none focus:ring-4 focus:ring-blue-500/10 transition-all" 
                        />
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <button 
                          onClick={() => handleUserAction('ban')}
                          disabled={isProcessing}
                          className="bg-red-500/10 text-red-500 py-5 rounded-2xl font-black text-xs hover:bg-red-500 hover:text-white transition-all shadow-xl flex items-center justify-center gap-3"
                        >
                          {isProcessing ? <Loader2 className="animate-spin" size={16}/> : <Ban size={16}/>} حظر نهائي
                        </button>
                        <button 
                          onClick={() => handleUserAction('vip')}
                          disabled={isProcessing}
                          className="bg-amber-500/10 text-amber-500 py-5 rounded-2xl font-black text-xs hover:bg-amber-500 hover:text-black transition-all shadow-xl flex items-center justify-center gap-3"
                        >
                          {isProcessing ? <Loader2 className="animate-spin" size={16}/> : <Star size={16}/>} منح رتبة VIP
                        </button>
                        <button 
                          onClick={() => handleUserAction('recharge')}
                          disabled={isProcessing}
                          className="bg-white text-black py-5 rounded-2xl font-black text-xs hover:scale-95 transition-all shadow-xl flex items-center justify-center gap-3"
                        >
                          {isProcessing ? <Loader2 className="animate-spin" size={16}/> : <Wallet size={16}/>} شحن رصيد يدوي
                        </button>
                      </div>
                   </div>
                </motion.div>
              )}

              {/* 3. مهندس الواجهات (المظهر) */}
              {activeTab === 'design' && (
                <motion.div key="design" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-10">
                   <h3 className="text-3xl font-black italic flex items-center gap-4"><Palette className="text-amber-500" /> مهندس المظهر</h3>
                   <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                      <div className="space-y-6">
                        <label className="text-xs font-black text-zinc-500 uppercase tracking-widest block">لون هوية الكوكب</label>
                        <div className="flex items-center gap-6 p-6 bg-white/5 rounded-3xl border border-white/5">
                          <input type="color" className="w-24 h-24 rounded-[2rem] bg-transparent border-none cursor-pointer overflow-hidden shadow-2xl" defaultValue="#D4AF37" />
                          <div className="space-y-1">
                            <span className="font-black text-white block">Sovereign Gold</span>
                            <span className="font-mono text-[10px] text-zinc-500">HEX: #D4AF37</span>
                          </div>
                        </div>
                      </div>
                      <div className="space-y-6">
                        <label className="text-xs font-black text-zinc-500 uppercase tracking-widest block">خلفية البوابة (Cinema URL)</label>
                        <div className="relative group">
                           <input defaultValue="https://picsum.photos/seed/legal99/1920/1080" className="w-full bg-white/5 border border-white/5 p-6 rounded-3xl text-[10px] text-zinc-400 font-mono focus:border-amber-500 transition-all" />
                           <ImageIcon size={18} className="absolute left-6 top-1/2 -translate-y-1/2 text-zinc-600" />
                        </div>
                        <p className="text-[10px] text-zinc-600 px-4">سيتم تطبيق الصورة فوراً تحت طبقة الزجاج البلوري.</p>
                      </div>
                   </div>
                   <button className="bg-primary text-black font-black px-10 py-5 rounded-2xl hover:scale-105 transition-all shadow-3xl">حفظ التغييرات البصرية</button>
                </motion.div>
              )}

              {/* 4. تفويض البوت (AI Governance) */}
              {activeTab === 'ai' && (
                <motion.div key="ai" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-10">
                   <h3 className="text-3xl font-black italic flex items-center gap-4"><Zap className="text-purple-500" /> تفويض البوت</h3>
                   <div className="p-8 bg-purple-500/5 border border-purple-500/10 rounded-[3rem] mb-8">
                      <p className="text-white/60 text-lg leading-relaxed font-bold">هنا يمكنك تفويض "المستشار السيادي" للقيام بمهام إدارية ورقابية تلقائية لضمان أمان الكوكب في غيابك.</p>
                   </div>
                   <div className="space-y-4">
                     <ToggleSwitch label="السماح للبوت بتعديل ثيم الموقع حسب الوقت" enabled={true} />
                     <ToggleSwitch label="تفعيل 'الرد الملكي' الفوري لطلبات الـ VIP" enabled={true} />
                     <ToggleSwitch label="السماح للبوت بحظر المسيئين آلياً (Smart Shield)" enabled={false} />
                     <ToggleSwitch label="توليد تقارير أسبوعية سيادية تلقائياً" enabled={true} />
                   </div>
                </motion.div>
              )}
            </AnimatePresence>

          </main>
        </div>

        <footer className="mt-20 pt-10 border-t border-white/5 flex justify-between items-center opacity-30 hover:opacity-100 transition-opacity">
           <p className="text-[9px] font-black uppercase tracking-[0.5em]">Supreme Authority Protocol v5.5 | king2026</p>
           <div className="flex gap-6 text-[9px] font-black uppercase tracking-widest">
              <a href="#" className="text-primary">System Logs</a>
              <a href="#">Encryption Key</a>
              <a href="#">Server Pulse</a>
           </div>
        </footer>
      </div>
    </SovereignLayout>
  );
}

// --- المكونات المساعدة للسيطرة ---

const AdminNav = ({ icon, label, active, onClick }: { icon: any, label: string, active: boolean, onClick: () => void }) => (
  <button 
    onClick={onClick} 
    className={`w-full flex items-center gap-5 p-6 rounded-[2rem] transition-all duration-500 ${
      active 
      ? 'bg-white text-black shadow-3xl scale-105 font-black z-10' 
      : 'text-zinc-500 hover:bg-white/5 font-bold'
    }`}
  >
    <span className={active ? 'text-black' : 'text-zinc-600'}>{icon}</span>
    <span className="text-sm tracking-tight">{label}</span>
  </button>
);

const ControlBox = ({ title, value, desc, action }: { title: string, value: string, desc: string, action: string }) => (
  <div className="bg-black/40 border border-white/5 p-8 rounded-[3rem] flex justify-between items-center group hover:border-emerald-500/30 transition-all duration-500 shadow-xl">
    <div className="text-right">
      <p className="text-[10px] text-zinc-500 font-black uppercase tracking-widest mb-2">{title}</p>
      <p className="text-3xl font-black text-white tracking-tighter">{value}</p>
      <p className="text-[10px] text-zinc-600 mt-2 font-bold">{desc}</p>
    </div>
    <button className="bg-white/5 border border-white/10 px-6 py-3 rounded-2xl text-[10px] font-black hover:bg-emerald-500 hover:text-black transition-all active:scale-90 shadow-2xl">
      {action}
    </button>
  </div>
);

const ToggleSwitch = ({ label, enabled }: { label: string, enabled: boolean }) => (
  <div className="flex justify-between items-center bg-black/40 p-8 rounded-[2.5rem] border border-white/5 hover:bg-black/60 transition-all">
    <span className="text-sm font-black text-zinc-300">{label}</span>
    <div className={`w-16 h-8 rounded-full relative p-1.5 transition-all duration-500 cursor-pointer ${enabled ? 'bg-emerald-500 shadow-[0_0_20px_rgba(16,185,129,0.4)]' : 'bg-zinc-800'}`}>
       <div className={`w-5 h-5 bg-white rounded-full transition-all duration-500 shadow-xl ${enabled ? 'translate-x-8' : 'translate-x-0'}`} />
    </div>
  </div>
);

const QuickStat = ({ label, value, icon }: { label: string, value: number | string, icon: any }) => (
  <div className="flex items-center justify-between">
    <div className="flex items-center gap-2 text-zinc-500 uppercase font-black text-[9px]">
      {icon} <span>{label}</span>
    </div>
    <span className="text-xs font-black text-white tabular-nums">{value}</span>
  </div>
);

const Badge = ({ children, variant, className }: any) => (
  <span className={cn("px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border", className)}>
    {children}
  </span>
);
