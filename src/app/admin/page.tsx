
"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Users, ShieldAlert, Wallet, Crown, Search, Bell, LogOut, 
  Trash2, CheckCircle2, XCircle, ShieldCheck, 
  Activity, ArrowLeft, Loader2, ArrowRightLeft,
  Zap, History, Cpu, Globe, ChevronLeft, UserMinus, Star, Eye, FileCheck, Gavel, Settings,
  Mic, Camera, Paperclip, Send, Sparkles, Plus, MessageSquare
} from "lucide-react";
import { useUser, useFirestore, useCollection } from "@/firebase";
import { useToast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { collection, doc, updateDoc, deleteDoc, increment, serverTimestamp, addDoc, query, orderBy, limit } from "firebase/firestore";
import { useMemoFirebase } from "@/firebase/provider";
import Link from "next/link";
import { roles as ROLES_LIST } from "@/lib/roles";
import SovereignButton from "@/components/SovereignButton";
import IdCaptureWizard from "@/components/IdCaptureWizard";

/**
 * غرفة القيادة السيادية العليا (The Supreme Command Hub).
 * تضم المستشار السيادي (المتحكم الآلي) مع كافة أدوات الإدارة المطلقة.
 */
export default function SupremeCommandCenter() {
  const { user, profile, role, signOut } = useUser();
  const db = useFirestore();
  const router = useRouter();
  const { toast } = useToast();
  
  const [activeTab, setActiveTab] = useState("overview");
  const [inputText, setInputText] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [isCameraOpen, setIsCameraOpen] = useState(false);

  const scrollRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const usersQuery = useMemoFirebase(() => db ? collection(db, "users") : null, [db]);
  const { data: allUsers, isLoading: isUsersLoading } = useCollection(usersQuery);

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

  const handleSend = async (customText?: string) => {
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

      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: text, persona: "المستشار السيادي (المتحكم الآلي)" })
      });
      const data = await res.json();

      await addDoc(collection(db, "users", user.uid, "sovereignChat"), {
        role: "ai",
        text: data.response,
        timestamp: serverTimestamp()
      });
    } catch (e) {
      toast({ variant: "destructive", title: "فشل نداء السيادة" });
    } finally {
      setIsTyping(false);
    }
  };

  const toggleRecording = () => {
    const SpeechRecognition = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition;
    if (!SpeechRecognition) return;
    const recognition = new SpeechRecognition();
    recognition.lang = 'ar-SA';
    if (!isRecording) {
      recognition.start(); setIsRecording(true);
      recognition.onresult = (e: any) => { setInputText(prev => prev + " " + e.results[0][0].transcript); setIsRecording(false); };
      recognition.onerror = () => setIsRecording(false);
    } else { recognition.stop(); setIsRecording(false); }
  };

  if (role !== ROLES_LIST.ADMIN) {
    return (
      <div className="h-screen flex flex-col items-center justify-center bg-[#02020a] text-red-500 font-black gap-10">
        <ShieldAlert className="h-32 w-32 animate-pulse" />
        <h1 className="text-5xl uppercase tracking-[0.5em] text-center leading-tight">Access Denied:<br />Sovereign Node Restricted</h1>
        <Button onClick={() => router.push("/")} className="bg-red-600 text-white px-12 h-16 rounded-2xl text-xl font-black">الانسحاب فوراً</Button>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-[#02020a] text-white font-sans overflow-hidden" dir="rtl">
      
      {/* Supreme Admin Sidebar */}
      <aside className="w-80 bg-[#050510] border-l border-white/5 flex flex-col z-50 shadow-3xl">
        <div className="p-10 border-b border-white/5 flex items-center gap-5 bg-black/40">
          <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-primary to-amber-600 flex items-center justify-center shadow-2xl border border-white/20">
            <Crown className="h-8 w-8 text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-black tracking-tighter">غرفة القيادة</h2>
            <p className="text-[9px] font-black text-primary uppercase tracking-[0.3em]">king2026 Sovereign</p>
          </div>
        </div>

        <nav className="flex-1 p-6 space-y-3 overflow-y-auto scrollbar-none">
          <AdminNavBtn icon={<Activity />} text="نظرة شاملة" active={activeTab === "overview"} onClick={() => setActiveTab("overview")} />
          <AdminNavBtn icon={<Users />} text="إدارة المواطنين" active={activeTab === "users"} onClick={() => setActiveTab("users")} />
          <AdminNavBtn icon={<MessageSquare />} text="المستشار السيادي" active={activeTab === "ai_controller"} onClick={() => setActiveTab("ai_controller")} />
          
          <div className="pt-6 space-y-2">
            <p className="text-[9px] font-black text-white/20 uppercase tracking-[0.2em] px-4">أوامر السيطرة السريعة</p>
            <QuickActionBtn icon={<UserMinus />} text="تطهير مستخدم" onClick={() => setActiveTab("users")} color="red" />
            <QuickActionBtn icon={<Zap />} text="توجيه مالي" onClick={() => setActiveTab("users")} color="amber" />
            <QuickActionBtn icon={<Settings />} text="تعديل بروتوكول" onClick={() => setActiveTab("settings")} color="blue" />
          </div>
        </nav>

        <div className="p-8 border-t border-white/5 bg-black/30">
          <button onClick={() => router.push("/bot")} className="w-full flex items-center gap-5 px-6 py-4 rounded-2xl text-white/40 hover:text-white hover:bg-white/5 transition-all font-black text-sm group">
            <ArrowLeft className="group-hover:translate-x-1 transition-transform" />
            <span>العودة لمركز المواطنين</span>
          </button>
        </div>
      </aside>

      {/* Supreme Workspace */}
      <main className="flex-1 flex flex-col relative overflow-hidden bg-[radial-gradient(circle_at_top_left,_var(--tw-gradient-stops))] from-primary/5 via-transparent to-transparent">
        
        <header className="h-24 bg-black/40 backdrop-blur-3xl border-b border-white/5 flex items-center justify-between px-12 z-40">
          <div className="flex items-center gap-8">
            <div className="h-12 w-12 bg-primary/10 rounded-2xl flex items-center justify-center text-primary border border-primary/20 shadow-inner">
              <Cpu className="h-6 w-6 animate-pulse" />
            </div>
            <h1 className="text-2xl font-black tracking-tight text-primary uppercase">Supreme Control Node: Active</h1>
          </div>
          <div className="flex items-center gap-8">
            <div className="text-right">
               <p className="text-sm font-black text-white">سيادة المالك king2026</p>
               <p className="text-[10px] text-emerald-500 font-black uppercase tracking-widest">Global Master Authority</p>
            </div>
            <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-primary to-amber-600 flex items-center justify-center font-black text-2xl text-primary shadow-2xl">K</div>
          </div>
        </header>

        <div className="flex-1 p-12 overflow-y-auto scrollbar-thin">
          <AnimatePresence mode="wait">
            
            {activeTab === "ai_controller" && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="h-full flex flex-col max-w-5xl mx-auto space-y-10">
                <div className="flex items-center justify-between glass-cosmic p-8 rounded-[3.5rem] bg-white/5 border border-white/10">
                   <div className="flex items-center gap-6">
                      <div className="h-16 w-16 rounded-[1.5rem] bg-primary/20 flex items-center justify-center shadow-xl border border-primary/20">
                         <Sparkles className="h-10 w-10 text-primary animate-pulse" />
                      </div>
                      <div>
                         <h2 className="text-3xl font-black text-white">المستشار السيادي</h2>
                         <p className="text-[10px] text-white/40 font-black uppercase tracking-widest mt-1">Autonomous Control Unit v4.5</p>
                      </div>
                   </div>
                   <div className="flex gap-4">
                      <ToolBtn icon={<Paperclip />} onClick={() => fileInputRef.current?.click()} tooltip="رفع مستندات" />
                      <ToolBtn icon={<Camera />} onClick={() => setIsCameraOpen(true)} tooltip="التقاط صورة" />
                      <ToolBtn icon={<Mic />} onClick={toggleRecording} active={isRecording} color="red" tooltip="أمر صوتي" />
                   </div>
                </div>

                <div ref={scrollRef} className="flex-1 space-y-8 pb-40">
                   {adminChat?.length === 0 && (
                     <div className="py-20 text-center opacity-20"><p className="text-2xl font-black uppercase tracking-[0.5em]">Waiting for Sovereign Commands...</p></div>
                   )}
                   {adminChat?.map((m) => (
                     <div key={m.id} className={`flex flex-col ${m.role === 'user' ? 'items-start' : 'items-end'}`}>
                        <div className={`p-7 rounded-[2.5rem] max-w-[85%] text-lg leading-relaxed shadow-2xl border ${
                          m.role === 'user' ? 'bg-white text-slate-900 border-white/10 rounded-tr-none font-bold' : 'bg-[#0a0a1f] text-white border-primary/20 rounded-tl-none font-medium'
                        }`}>
                          {m.text}
                        </div>
                     </div>
                   ))}
                   {isTyping && <div className="p-4 bg-primary/5 rounded-full w-fit animate-pulse text-[8px] font-black uppercase text-primary">جاري المعالجة السيادية...</div>}
                </div>

                <div className="absolute bottom-12 inset-x-12">
                   <div className="max-w-4xl mx-auto relative glass-cosmic border-2 border-white/10 rounded-[2.5rem] overflow-hidden shadow-3xl">
                      <div className="flex items-center px-8 py-5 gap-6">
                        <textarea 
                          value={inputText} onChange={(e) => setInputText(e.target.value)}
                          onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && handleSend()}
                          placeholder="أصدر أمراً سيادياً للمتحكم الآلي..."
                          className="flex-1 bg-transparent border-none outline-none text-xl font-bold text-white placeholder:text-white/10 resize-none py-2"
                          rows={1}
                        />
                        <button onClick={() => handleSend()} disabled={!inputText.trim() || isTyping} className="h-16 w-16 rounded-[1.5rem] bg-primary text-white flex items-center justify-center shadow-xl transition-all disabled:opacity-20"><Send className="rotate-180 h-7 w-7" /></button>
                      </div>
                   </div>
                </div>
              </motion.div>
            )}

            {activeTab === "overview" && (
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-12">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                  <StatBox label="إجمالي المواطنين" value={allUsers?.length || 0} icon={<Users />} color="blue" />
                  <StatBox label="طلبات خبراء" value={allUsers?.filter(u => u.role === ROLES_LIST.PENDING_EXPERT).length || 0} icon={<Gavel />} color="violet" />
                  <StatBox label="إشارة الأمان" value="Optimal" icon={<ShieldCheck />} color="emerald" />
                  <StatBox label="رصيد king2026" value="Unlimited" icon={<Crown />} color="amber" />
                </div>
              </motion.div>
            )}

          </AnimatePresence>
        </div>
      </main>

      <Dialog open={isCameraOpen} onOpenChange={setIsCameraOpen}>
        <DialogContent className="glass-cosmic border-none rounded-[3rem] p-10 max-w-2xl bg-black">
           <IdCaptureWizard onComplete={() => { setIsCameraOpen(false); toast({ title: "تم التوثيق السيادي ✅" }); }} />
        </DialogContent>
      </Dialog>
      <input type="file" ref={fileInputRef} className="hidden" multiple onChange={() => toast({ title: "تم رفع الملفات لغرفة القيادة ✅" })} />
    </div>
  );
}

function AdminNavBtn({ icon, text, active, onClick }: any) {
  return (
    <button onClick={onClick} className={`w-full flex items-center gap-6 px-8 py-5 rounded-[1.8rem] transition-all duration-500 font-black text-sm relative group ${active ? "bg-white/10 text-white shadow-2xl scale-[1.05]" : "text-white/20 hover:text-white hover:bg-white/5"}`}>
      <span className={`shrink-0 transition-transform duration-500 ${active ? "scale-125 text-primary" : "group-hover:scale-110"}`}>{icon}</span>
      <span className="tracking-tight text-lg">{text}</span>
    </button>
  );
}

function QuickActionBtn({ icon, text, onClick, color }: any) {
  const colors: any = {
    red: "text-red-500 bg-red-500/5 hover:bg-red-500/10 border-red-500/10",
    amber: "text-amber-500 bg-amber-500/5 hover:bg-amber-500/10 border-amber-500/10",
    blue: "text-blue-500 bg-blue-500/5 hover:bg-blue-500/10 border-blue-500/10",
  };
  return (
    <button onClick={onClick} className={`w-full flex items-center gap-4 px-6 py-3 rounded-xl border transition-all text-[10px] font-black uppercase tracking-widest ${colors[color]}`}>
      {icon} <span>{text}</span>
    </button>
  );
}

function ToolBtn({ icon, onClick, active, color, tooltip }: any) {
  return (
    <button onClick={onClick} title={tooltip} className={`h-14 w-14 rounded-2xl flex items-center justify-center transition-all border shadow-lg ${active ? 'bg-red-500 border-red-500 text-white animate-pulse' : 'bg-white/5 border-white/10 text-white/40 hover:text-primary hover:border-primary/40'}`}>
      <div className="scale-125">{icon}</div>
    </button>
  );
}

function StatBox({ label, value, icon, color }: any) {
  const colors: any = {
    blue: "text-blue-500 bg-blue-500/10",
    amber: "text-amber-500 bg-amber-500/10",
    emerald: "text-emerald-500 bg-emerald-500/10",
    violet: "text-violet-500 bg-violet-500/10",
  };
  return (
    <Card className="rounded-[3rem] border-none shadow-3xl bg-white/[0.02] p-10 group hover:scale-[1.05] transition-all duration-500">
      <div className={`h-14 w-14 rounded-2xl flex items-center justify-center border border-white/5 mb-6 ${colors[color]}`}>{icon}</div>
      <p className="text-[9px] font-black text-white/20 uppercase tracking-widest mb-1">{label}</p>
      <p className="text-3xl font-black tabular-nums">{value}</p>
    </Card>
  );
}
