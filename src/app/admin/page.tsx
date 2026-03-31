
"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Users, ShieldAlert, Wallet, Crown, Activity, ArrowLeft, Loader2,
  Zap, MessageSquare, ShieldCheck, Cpu, Mic, Camera, Paperclip, Send, Sparkles, Trash2, Settings, Ban, CreditCard
} from "lucide-react";
import { useUser, useFirestore, useCollection } from "@/firebase";
import { useToast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";
import { collection, doc, addDoc, serverTimestamp, query, orderBy, limit, updateDoc } from "firebase/firestore";
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
import IdCaptureWizard from "@/components/IdCaptureWizard";
import Link from "next/link";

/**
 * غرفة القيادة العليا - النسخة السيادية king2026.
 * دمج "المستشار السيادي" كمتحكم آلي وقائمة أوامر الإدارة الشاملة.
 */
export default function SupremeCommandCenter() {
  const { user, profile, role, signOut } = useUser();
  const db = useFirestore();
  const router = useRouter();
  const { toast } = useToast();
  
  const [activeTab, setActiveTab] = useState("ai_controller");
  const [inputText, setInputText] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [isAutopilot, setIsAutopilot] = useState(false);
  const [isCameraOpen, setIsCameraOpen] = useState(false);

  const scrollRef = useRef<HTMLDivElement>(null);

  const usersQuery = useMemoFirebase(() => db ? collection(db, "users") : null, [db]);
  const { data: allUsers } = useCollection(usersQuery);

  const chatQuery = useMemoFirebase(() => {
    if (!db || !user) return null;
    return query(collection(db, "users", user.uid, "sovereignChat"), orderBy("timestamp", "asc"), limit(50));
  }, [db, user]);
  const { data: adminChat } = useCollection(chatQuery);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
    }
  }, [adminChat, isTyping]);

  const handleSovereignSend = async (customText?: string) => {
    const text = customText || inputText.trim();
    if (!text || isTyping || !db || !user) return;

    setInputText("");
    setIsTyping(true);

    try {
      await addDoc(collection(db, "users", user.uid, "sovereignChat"), {
        role: "user",
        text,
        timestamp: serverTimestamp()
      });

      // بروتوكول معالجة الأوامر السيادية
      let persona = isAutopilot ? "المتحكم الآلي السيادي" : "المستشار السيادي الخاص";
      
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: text, persona })
      });
      const data = await res.json();

      await addDoc(collection(db, "users", user.uid, "sovereignChat"), {
        role: "ai",
        text: data.response,
        timestamp: serverTimestamp()
      });
    } catch (e) {
      toast({ variant: "destructive", title: "فشل النداء السيادي" });
    } finally {
      setIsTyping(false);
    }
  };

  const banUser = async (userId: string) => {
    if (!db) return;
    try {
      await updateDoc(doc(db, "users", userId), { isBanned: true });
      toast({ title: "تم التطهير السيادي", description: `المواطن ${userId} تم حظره نهائياً.` });
    } catch (e) { toast({ variant: "destructive", title: "فشل الحظر" }); }
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
    <div className="flex h-screen bg-[#02020a] text-white font-sans overflow-hidden" dir="rtl">
      
      {/* Supreme Sidebar */}
      <aside className="w-80 bg-[#050510] border-l border-white/5 flex flex-col z-50 shadow-3xl">
        <div className="p-10 border-b border-white/5 flex items-center gap-5 bg-black/40">
          <div className="h-14 w-14 rounded-2xl bg-primary/20 flex items-center justify-center shadow-2xl border border-primary/20">
            <Crown className="h-8 w-8 text-primary" />
          </div>
          <div>
            <h2 className="text-2xl font-black tracking-tighter">غرفة القيادة</h2>
            <p className="text-[9px] font-black text-primary uppercase tracking-widest">Sovereign king2026</p>
          </div>
        </div>

        <nav className="flex-1 p-6 space-y-3 overflow-y-auto scrollbar-none">
          <AdminNavBtn icon={<Activity />} text="المؤشرات العامة" active={activeTab === "overview"} onClick={() => setActiveTab("overview")} />
          <AdminNavBtn icon={<Users />} text="سجل المواطنين" active={activeTab === "users"} onClick={() => setActiveTab("users")} />
          <AdminNavBtn icon={<MessageSquare />} text="المستشار السيادي" active={activeTab === "ai_controller"} onClick={() => setActiveTab("ai_controller")} />
          
          <div className="pt-8 space-y-2">
            <p className="text-[9px] font-black text-white/20 uppercase tracking-[0.2em] px-4">أوامر القيادة العليا</p>
            <QuickAdminBtn icon={<Ban />} text="حظر فوري" onClick={() => handleSovereignSend("قم بحظر المستخدم المخالف فوراً.")} color="red" />
            <QuickAdminBtn icon={<CreditCard />} text="شحن سيادي" onClick={() => handleSovereignSend("قم بشحن 1000 وحدة رصيد للمواطن.")} color="amber" />
            <QuickAdminBtn icon={<Settings />} text="تعديل بروتوكول" onClick={() => handleSovereignSend("أرغب في تعديل قواعد الرقابة اللحظية.")} color="blue" />
          </div>
        </nav>

        <div className="p-8 border-t border-white/5 bg-black/30">
          <button onClick={() => router.push("/bot")} className="w-full flex items-center gap-5 px-6 py-4 rounded-2xl text-white/40 hover:text-white hover:bg-white/5 transition-all font-black text-sm">
            <ArrowLeft className="h-5 w-5" /> مركز البوت
          </button>
        </div>
      </aside>

      {/* Main Command Display */}
      <main className="flex-1 flex flex-col relative overflow-hidden bg-[radial-gradient(circle_at_top_left,_var(--tw-gradient-stops))] from-primary/5 via-transparent to-transparent">
        <header className="h-24 bg-black/40 backdrop-blur-3xl border-b border-white/5 flex items-center justify-between px-12 z-40">
          <div className="flex items-center gap-8">
            <div className="h-12 w-12 bg-primary/10 rounded-2xl flex items-center justify-center text-primary border border-primary/20">
              <Cpu className="h-6 w-6 animate-pulse" />
            </div>
            <h1 className="text-2xl font-black tracking-tight text-primary uppercase">Control Hub: king2026 Online</h1>
          </div>
          
          <div 
            className={`flex items-center gap-4 px-6 py-2 rounded-2xl border-2 transition-all cursor-pointer ${isAutopilot ? 'bg-emerald-500/10 border-emerald-500/40 shadow-[0_0_30px_rgba(16,185,129,0.2)]' : 'bg-white/5 border-white/10'}`}
            onClick={() => { setIsAutopilot(!isAutopilot); toast({ title: isAutopilot ? "تم إيقاف المتحكم الآلي" : "المستشار السيادي تولى القيادة 🤖" }); }}
          >
             <div className={`h-2.5 w-2.5 rounded-full ${isAutopilot ? 'bg-emerald-500 animate-ping' : 'bg-white/20'}`} />
             <span className="text-[10px] font-black uppercase tracking-widest">{isAutopilot ? 'Autopilot Active' : 'Manual Control'}</span>
          </div>
        </header>

        <div className="flex-1 p-12 overflow-y-auto scrollbar-thin">
          <AnimatePresence mode="wait">
            {activeTab === "ai_controller" && (
              <motion.div key="ai" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="h-full flex flex-col max-w-5xl mx-auto space-y-10 pb-40">
                <div ref={scrollRef} className="flex-1 space-y-8">
                   {adminChat?.map((m) => (
                     <div key={m.id} className={`flex flex-col ${m.role === 'user' ? 'items-start' : 'items-end'}`}>
                        <div className={`p-8 rounded-[2.5rem] max-w-[85%] text-lg leading-relaxed shadow-3xl border ${
                          m.role === 'user' ? 'bg-white text-slate-900 border-white/10 rounded-tr-none font-bold' : 'bg-[#0a0a1f] text-white border-primary/20 rounded-tl-none font-medium'
                        }`}>
                          {m.text}
                        </div>
                     </div>
                   ))}
                   {isTyping && <div className="p-4 bg-primary/5 rounded-full w-fit animate-pulse text-[8px] font-black uppercase text-primary tracking-widest">المستشار السيادي يحلل البيانات...</div>}
                </div>

                <div className="absolute bottom-12 inset-x-12">
                   <div className="max-w-4xl mx-auto relative glass-cosmic border-2 border-white/10 rounded-[2.5rem] overflow-hidden shadow-3xl">
                      <div className="flex items-center px-8 py-5 gap-6">
                        <textarea 
                          value={inputText} onChange={(e) => setInputText(e.target.value)}
                          onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && handleSovereignSend()}
                          placeholder="أصدر أمراً سيادياً للمتحكم..."
                          className="flex-1 bg-transparent border-none outline-none text-xl font-bold text-white placeholder:text-white/10 resize-none py-2"
                          rows={1}
                        />
                        <button onClick={() => handleSovereignSend()} disabled={!inputText.trim() || isTyping} className="h-16 w-16 rounded-[1.5rem] bg-primary text-white flex items-center justify-center shadow-xl transition-all disabled:opacity-20 hover:scale-105 active:scale-95"><Send className="rotate-180 h-7 w-7" /></button>
                      </div>
                   </div>
                </div>
              </motion.div>
            )}

            {activeTab === "overview" && (
              <motion.div key="overview" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="grid grid-cols-1 md:grid-cols-3 gap-12 max-w-6xl mx-auto">
                <StatCard label="إجمالي المواطنين" value={allUsers?.length || 0} icon={<Users />} color="blue" />
                <StatCard label="حالة الرقابة" value="Secure" icon={<ShieldCheck />} color="emerald" />
                <StatCard label="رصيد القيادة" value="Unlimited" icon={<Crown />} color="amber" />
              </motion.div>
            )}

            {activeTab === "users" && (
              <motion.div key="users" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6 max-w-6xl mx-auto">
                {allUsers?.map((u) => (
                  <div key={u.id} className="p-8 glass rounded-[2.5rem] flex items-center justify-between border border-white/5 hover:bg-white/[0.03] transition-all group">
                    <div className="flex items-center gap-8">
                      <div className="h-16 w-16 rounded-2xl bg-white/5 flex items-center justify-center font-black text-primary text-2xl group-hover:scale-110 transition-transform">{u.fullName?.charAt(0)}</div>
                      <div>
                        <h4 className="text-xl font-black text-white">{u.fullName}</h4>
                        <p className="text-xs text-white/30 font-bold">{u.email} · {u.role}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                       <div className="bg-primary/10 px-6 py-2 rounded-full font-black text-xs text-primary">{u.balance} EGP</div>
                       <button onClick={() => banUser(u.id)} className="h-12 w-12 rounded-xl bg-red-500/10 text-red-500 flex items-center justify-center hover:bg-red-500 hover:text-white transition-all">
                         <Ban className="h-5 w-5" />
                       </button>
                    </div>
                  </div>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </main>

      <Dialog open={isCameraOpen} onOpenChange={setIsCameraOpen}>
        <DialogContent className="glass-cosmic border-none rounded-[3rem] p-10 max-w-2xl bg-black">
           <IdCaptureWizard onComplete={() => setIsCameraOpen(false)} />
        </DialogContent>
      </Dialog>
    </div>
  );
}

function AdminNavBtn({ icon, text, active, onClick }: any) {
  return (
    <button onClick={onClick} className={`w-full flex items-center gap-6 px-8 py-5 rounded-[1.8rem] transition-all duration-500 font-black text-sm ${active ? "bg-white/10 text-white shadow-2xl scale-[1.05]" : "text-white/20 hover:text-white hover:bg-white/5"}`}>
      <span className={`shrink-0 transition-transform duration-500 ${active ? "scale-125 text-primary" : ""}`}>{icon}</span>
      <span className="tracking-tight text-lg">{text}</span>
    </button>
  );
}

function QuickAdminBtn({ icon, text, onClick, color }: any) {
  const colors: any = {
    red: "text-red-500 bg-red-500/5 hover:bg-red-500/10 border-red-500/10",
    amber: "text-amber-500 bg-amber-500/5 hover:bg-amber-500/10 border-amber-500/10",
    blue: "text-blue-500 bg-blue-500/5 hover:bg-blue-500/10 border-blue-500/10",
  };
  return (
    <button onClick={onClick} className={`w-full flex items-center justify-between px-6 py-4 rounded-2xl border transition-all text-[10px] font-black uppercase tracking-widest ${colors[color]}`}>
      <span>{text}</span>
      {icon}
    </button>
  );
}

function StatCard({ label, value, icon, color }: any) {
  const colors: any = {
    blue: "text-blue-500 bg-blue-500/10 border-blue-500/20",
    amber: "text-amber-500 bg-amber-500/10 border-amber-500/20",
    emerald: "text-emerald-500 bg-emerald-500/10 border-emerald-500/20",
  };
  return (
    <div className={`rounded-[3.5rem] bg-white/[0.02] p-12 border shadow-3xl text-center space-y-8 group hover:scale-[1.05] transition-all ${colors[color]}`}>
      <div className="h-24 w-24 rounded-[2rem] mx-auto flex items-center justify-center border border-white/5 shadow-inner bg-white/5">
        <div className="scale-[2]">{icon}</div>
      </div>
      <div>
        <p className="text-[10px] font-black text-white/20 uppercase tracking-[0.3em] mb-3">{label}</p>
        <p className="text-6xl font-black tabular-nums tracking-tighter">{value}</p>
      </div>
    </div>
  );
}
