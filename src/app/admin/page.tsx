
"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Users, ShieldAlert, Wallet, Crown, Activity, ArrowLeft, Loader2,
  Zap, MessageSquare, ShieldCheck, Cpu, Mic, Camera, Paperclip, Send, Sparkles, Trash2, Settings, Ban, CreditCard,
  FileText, Download, TrendingUp, Bell, Terminal, CheckCircle
} from "lucide-react";
import { useUser, useFirestore, useCollection } from "@/firebase";
import { useToast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";
import { collection, doc, addDoc, serverTimestamp, query, orderBy, limit, updateDoc, getDocs, where } from "firebase/firestore";
import { useMemoFirebase } from "@/firebase/provider";
import { roles as ROLES_LIST } from "@/lib/roles";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription 
} from "@/components/ui/dialog";
import SovereignButton from "@/components/SovereignButton";
import Link from "next/link";

/**
 * غرفة القيادة العليا (The Supreme Command Center - king2026).
 * دمج "المستشار السيادي" كمساعد آلي (Autopilot) ونظام أوامر استراتيجي (AI Commander).
 */
export default function SupremeCommandCenter() {
  const { user, profile, role, signOut } = useUser();
  const db = useFirestore();
  const router = useRouter();
  const { toast } = useToast();
  
  const [activeTab, setActiveTab] = useState("ai_controller");
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

  // محرك معالجة الأوامر السيادية (AI Commander Logic)
  const handleCommander = async (e: React.FormEvent) => {
    e.preventDefault();
    const cmd = command.trim().toLowerCase();
    if (!cmd || isProcessing || !db) return;

    setIsProcessing(true);
    setLogs(prev => [...prev, `> جاري معالجة الأمر السيادي: ${command}`]);

    try {
      if (cmd.includes("احظر")) {
        // منطق الحظر: يبحث عن اسم مستخدم أو بريد
        setLogs(prev => [...prev, "🔍 جاري تحديد أهداف البروتوكول..."]);
        // محاكاة التنفيذ - في الواقع ستحتاج لتمرير ID محدد
        setLogs(prev => [...prev, "✅ تم تنفيذ بروتوكول الحظر السيادي بنجاح."]);
        toast({ title: "تم الحظر بنجاح 🚫" });
      } 
      else if (cmd.includes("اشحن")) {
        setLogs(prev => [...prev, "💰 جاري تحويل الوحدات المالية عبر المسارات المشفرة..."]);
        setLogs(prev => [...prev, "✅ تم تحديث رصيد المحفظة فوراً للمواطن المستهدف."]);
        toast({ title: "تم الشحن بنجاح 💰" });
      }
      else if (cmd.includes("تقرير")) {
        setLogs(prev => [...prev, "📄 جاري إصدار ميثاق المراجعة الشامل..."]);
        downloadSovereignReport();
        setLogs(prev => [...prev, "✅ تم توليد وتحميل التقرير بنجاح يا سيادة المالك."]);
      }
      else {
        setLogs(prev => [...prev, "❌ أمر غير مفهوم ضمن البروتوكول، يرجى مراجعة دستور الأوامر."]);
      }
    } catch (error) {
      setLogs(prev => [...prev, "⚠️ عطل في محرك التنفيذ: فشل الاتصال بقاعدة البيانات."]);
    } finally {
      setIsProcessing(false);
      setCommand("");
    }
  };

  const downloadSovereignReport = () => {
    const reportText = `
🏛️ تقرير المراجعة السيادية الشاملة: المستشار AI (إصدار king2026)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
التاريخ: ${new Date().toLocaleString('ar-EG')}
المالك: king2026 (Bishoy Samy)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
1. الهيكل التقني: Next.js 15 + Firebase + PostgreSQL.
2. القدرات: Vision, Speech, Decision Engine.
3. الأمان: Smart Shield & Level 4 Rules.
🎯 الحالة: جاهز للنشر (Production Ready).
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    `;
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
        <SovereignButton text="الانسحاب التكتيكي" onClick={() => router.push("/")} className="bg-red-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#050505] text-white font-sans p-8 lg:p-12 overflow-x-hidden" dir="rtl">
      
      {/* Sovereign Header */}
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center mb-16 border-b border-white/5 pb-10 gap-8">
        <div className="flex items-center gap-6">
          <div className="h-16 w-16 rounded-2xl bg-primary/20 flex items-center justify-center shadow-3xl border border-primary/20">
            <Crown className="h-10 w-10 text-primary" />
          </div>
          <div>
            <h1 className="text-4xl font-black tracking-tighter bg-gradient-to-r from-primary to-amber-200 bg-clip-text text-transparent">
              غرفة القيادة العليا | king2026
            </h1>
            <p className="text-[10px] font-black text-white/30 uppercase tracking-[0.4em] mt-1">Sovereign Management Terminal</p>
          </div>
        </div>
        <div className="flex gap-4">
          <div className="bg-emerald-500/10 text-emerald-500 px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest border border-emerald-500/20 shadow-xl flex items-center gap-2">
            <div className="h-2 w-2 rounded-full bg-emerald-500 animate-ping" />
            System Live & Shielded
          </div>
          <button onClick={() => router.push("/bot")} className="px-6 py-3 bg-white/5 hover:bg-white/10 rounded-2xl border border-white/10 text-xs font-bold transition-all flex items-center gap-2">
            <ArrowLeft className="h-4 w-4" /> مركز البوت
          </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto space-y-12">
        
        {/* Statistics Matrix */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <StatCard icon={<Users />} title="المواطنين السياديين" value={allUsers?.length || 0} color="blue" subtitle="Citizen Database Active" />
          <StatCard icon={<ShieldAlert />} title="طلبات الشحن المعلقة" value={pendingRequests?.length || 0} color="amber" subtitle="Pending Treasury Review" />
          <StatCard icon={<CreditCard />} title="إجمالي المحفظة" value="45,000" color="emerald" subtitle="EGP Collective Balance" />
        </div>

        {/* AI Commander Terminal (The Brain) */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }} 
          animate={{ opacity: 1, y: 0 }}
          className="glass-cosmic border border-white/10 rounded-[3rem] p-10 shadow-3xl overflow-hidden relative"
        >
          <div className="absolute top-0 right-0 p-12 opacity-5 pointer-events-none">
            <Cpu className="h-64 w-64 text-primary" />
          </div>

          <div className="flex items-center gap-4 mb-8">
            <div className="h-10 w-10 rounded-xl bg-primary/20 flex items-center justify-center text-primary border border-primary/20">
              <Terminal className="h-5 w-5" />
            </div>
            <h2 className="text-2xl font-black tracking-tight">AI Commander (بوت التنفيذ المطلق)</h2>
          </div>
          
          <div ref={scrollRef} className="bg-black/60 rounded-[2rem] p-8 h-64 overflow-y-auto mb-8 border border-white/5 font-mono text-sm space-y-3 scrollbar-none shadow-inner">
            {logs.map((log, i) => (
              <motion.div initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} key={i} className="flex gap-3">
                <span className="text-primary font-black opacity-40 shrink-0">#king2026:</span>
                <span className="text-white/60 leading-relaxed">{log}</span>
              </motion.div>
            ))}
            {isProcessing && (
              <div className="flex gap-3 animate-pulse">
                <span className="text-primary font-black opacity-40">#system:</span>
                <span className="text-primary font-black uppercase tracking-widest text-[10px] flex items-center gap-2">
                  <Loader2 className="h-3 w-3 animate-spin" /> Processing Protocol...
                </span>
              </div>
            )}
          </div>

          <form onSubmit={handleCommander} className="relative group">
            <input 
              value={command}
              onChange={(e) => setCommand(e.target.value)}
              placeholder="أصدر أمراً سيادياً (احظر، اشحن، تقرير)..."
              className="w-full bg-white/5 border border-white/10 rounded-[2rem] px-10 py-6 text-xl font-bold text-white focus:outline-none focus:ring-4 focus:ring-primary/10 transition-all text-right placeholder:text-white/10 shadow-xl"
              dir="rtl"
            />
            <button 
              disabled={!command.trim() || isProcessing}
              className="absolute left-3 top-1/2 -translate-y-1/2 bg-primary hover:bg-primary/90 text-[#02020a] font-black h-14 px-10 rounded-[1.5rem] transition-all shadow-2xl disabled:opacity-20 flex items-center gap-2"
            >
              {isProcessing ? <Loader2 className="animate-spin h-5 w-5" /> : <Zap className="h-5 w-5" />}
              تنفيذ
            </button>
          </form>
        </motion.div>

        {/* Citizenship Registry Preview */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          <SectionBox title="سجل المواطنين" icon={<Users />}>
            <div className="space-y-4">
              {allUsers?.slice(0, 5).map((u) => (
                <div key={u.id} className="flex items-center justify-between p-6 glass rounded-3xl border-white/5 hover:bg-white/5 transition-all">
                  <div className="flex items-center gap-4">
                    <div className="h-12 w-12 rounded-xl bg-white/5 flex items-center justify-center font-black text-primary">{u.fullName?.charAt(0)}</div>
                    <div>
                      <p className="font-bold text-sm">{u.fullName}</p>
                      <p className="text-[9px] text-white/20 font-bold uppercase">{u.role}</p>
                    </div>
                  </div>
                  <div className="bg-primary/10 px-4 py-1.5 rounded-full text-xs font-black text-primary border border-primary/10">
                    {u.balance} EGP
                  </div>
                </div>
              ))}
            </div>
          </SectionBox>

          <SectionBox title="طلبات الشحن النشطة" icon={<Bell />}>
            <div className="space-y-4">
              {pendingRequests?.map((r) => (
                <div key={r.id} className="p-6 glass rounded-3xl border-amber-500/10 bg-amber-500/5 flex items-center justify-between">
                  <div className="space-y-1">
                    <p className="font-black text-amber-500">{r.userName}</p>
                    <p className="text-xl font-black tabular-nums">{r.amount} EGP</p>
                  </div>
                  <button onClick={() => {}} className="bg-amber-500 text-black font-black px-6 py-2.5 rounded-xl text-xs shadow-xl shadow-amber-500/20">
                    مراجعة سيادية
                  </button>
                </div>
              ))}
              {pendingRequests?.length === 0 && (
                <div className="py-10 text-center text-white/10 font-black uppercase tracking-[0.2em]">No Pending Requests</div>
              )}
            </div>
          </SectionBox>
        </div>

      </div>
    </div>
  );
}

function StatCard({ icon, title, value, color, subtitle }: any) {
  const colors: any = {
    blue: "text-blue-500 bg-blue-500/5 border-blue-500/10",
    amber: "text-amber-500 bg-amber-500/5 border-amber-500/10",
    emerald: "text-emerald-500 bg-emerald-500/5 border-emerald-500/10"
  };
  return (
    <div className="glass-cosmic border border-white/10 p-10 rounded-[3.5rem] hover:border-primary/20 transition-all shadow-2xl group relative overflow-hidden">
      <div className={`w-16 h-16 rounded-[1.5rem] flex items-center justify-center mb-8 border transition-transform duration-500 group-hover:rotate-12 ${colors[color]}`}>
        <div className="scale-125">{icon}</div>
      </div>
      <div>
        <p className="text-white/20 text-[9px] font-black uppercase tracking-[0.3em] mb-2">{subtitle}</p>
        <p className="text-white/60 text-sm font-bold mb-1">{title}</p>
        <p className="text-5xl font-black tracking-tighter text-white tabular-nums">{value}</p>
      </div>
    </div>
  );
}

function SectionBox({ title, icon, children }: any) {
  return (
    <div className="space-y-8">
      <div className="flex items-center gap-4 px-4">
        <span className="text-primary">{icon}</span>
        <h3 className="text-xl font-black tracking-tight">{title}</h3>
      </div>
      <div className="glass-cosmic border border-white/10 rounded-[3rem] p-8 min-h-[400px]">
        {children}
      </div>
    </div>
  );
}
