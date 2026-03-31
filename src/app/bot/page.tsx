
"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Send, User, Cpu, ShieldCheck, Sparkles, Copy, Trash2, Reply, 
  Settings, Users, Gavel, ShieldAlert, Tag, Activity, Plus, Ban, X
} from "lucide-react";
import ProtectedRoute from "@/components/ProtectedRoute";
import Image from "next/image";
import { useUser, useFirestore, useCollection } from "@/firebase";
import { useToast } from "@/hooks/use-toast";
import { collection, doc, deleteDoc, addDoc, serverTimestamp } from "firebase/firestore";
import { useMemoFirebase } from "@/firebase/provider";

interface Message {
  role: "user" | "ai";
  text: string;
  id: string;
}

type AdminTab = "users" | "advisors" | "banned" | "offers" | "logs";

export default function AdvancedBotPage() {
  const { profile } = useUser();
  const db = useFirestore();
  const { toast } = useToast();
  
  // Chat States
  const [messages, setMessages] = useState<Message[]>([
    { role: "ai", text: "أهلاً بك في النسخة السيادية المتقدمة. أنا محركك القانوني المحدث، كيف يمكنني مساعدتك؟", id: "init" }
  ]);
  const [inputText, setInputText] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Admin States
  const [isAdminOpen, setIsAdminOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<AdminTab>("users");

  // Remote Data for Admin
  const logsQuery = useMemoFirebase(() => db ? collection(db, "analytics") : null, [db]);
  const { data: logs } = useCollection(logsQuery);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
    }
  }, [messages, isTyping]);

  const handleSend = (textOverride?: string) => {
    const val = textOverride || inputText;
    if (!val.trim() || isTyping) return;

    const userMsg: Message = { role: "user", text: val.trim(), id: Date.now().toString() };
    setMessages(prev => [...prev, userMsg]);
    setInputText("");
    setIsTyping(true);

    setTimeout(() => {
      const aiMsg: Message = { 
        role: "ai", 
        text: "بصفتي المحرك السيادي، قمت بتحليل طلبك. نوصي بمراجعة بروتوكولات الامتثال المحدثة في المكتبة القانونية.", 
        id: (Date.now() + 1).toString() 
      };
      setMessages(prev => [...prev, aiMsg]);
      setIsTyping(false);
    }, 1000);
  };

  const deleteMessage = (id: string) => {
    setMessages(prev => prev.filter(m => m.id !== id));
    toast({ title: "تم التطهير", description: "حُذفت الرسالة سيادياً." });
  };

  const copyMessage = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({ title: "تم النسخ", description: "النص متاح الآن في حافظتك." });
  };

  const quickReply = (text: string) => {
    setInputText(`بخصوص ما ذكرت: "${text.substring(0, 20)}..."، أود أن أسأل عن: `);
    toast({ title: "تم تفعيل الرد السريع" });
  };

  const isOwner = profile?.role === "admin" || profile?.email === "bishoysamy390@gmail.com";

  return (
    <ProtectedRoute>
      <div className="flex flex-col h-[calc(100vh-4rem)] bg-slate-50 dark:bg-slate-950 relative overflow-hidden">
        
        {/* Sovereign Spirits - 3 Characters */}
        <div className="absolute top-20 inset-x-0 flex justify-around px-10 pointer-events-none z-0 opacity-20">
           <motion.div animate={{ y: [0, -20, 0] }} transition={{ duration: 4, repeat: Infinity }} className="grayscale hover:grayscale-0 transition-all">
             <Image src="https://picsum.photos/seed/char1/200/200" width={60} height={60} className="rounded-full border-2 border-primary" alt="Spirit 1" data-ai-hint="legal character" />
           </motion.div>
           <motion.div animate={{ y: [0, -15, 0] }} transition={{ duration: 3, repeat: Infinity, delay: 1 }} className="grayscale hover:grayscale-0 transition-all">
             <Image src="https://picsum.photos/seed/char2/200/200" width={60} height={60} className="rounded-full border-2 border-primary" alt="Spirit 2" data-ai-hint="judge character" />
           </motion.div>
           <motion.div animate={{ y: [0, -25, 0] }} transition={{ duration: 5, repeat: Infinity, delay: 0.5 }} className="grayscale hover:grayscale-0 transition-all">
             <Image src="https://picsum.photos/seed/char3/200/200" width={60} height={60} className="rounded-full border-2 border-primary" alt="Spirit 3" data-ai-hint="notary character" />
           </motion.div>
        </div>

        {/* Floating Admin Toggle (for mobile/quick access) */}
        {isOwner && (
          <button 
            onClick={() => setIsAdminOpen(!isAdminOpen)}
            className="fixed bottom-24 right-6 h-12 w-12 rounded-full bg-primary text-white shadow-2xl flex items-center justify-center z-[100] hover:scale-110 transition-transform active:scale-95"
          >
            <Settings className={`h-6 w-6 ${isAdminOpen ? 'rotate-90' : ''} transition-transform`} />
          </button>
        )}

        {/* Chat Messages */}
        <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-6 relative z-10">
          {messages.map((m) => (
            <motion.div
              key={m.id}
              initial={{ opacity: 0, x: m.role === "user" ? 20 : -20 }}
              animate={{ opacity: 1, x: 0 }}
              className={`flex flex-col ${m.role === "user" ? "items-end" : "items-start"}`}
            >
              <div className={`p-4 rounded-2xl text-sm max-w-[85%] relative group shadow-sm ${
                m.role === "user"
                  ? "bg-[#dcf8c6] text-slate-900 rounded-tr-none font-bold"
                  : "bg-white dark:bg-slate-800 border border-border rounded-tl-none"
              }`}>
                {m.text}
                <div className="flex items-center gap-1 mt-3 pt-2 border-t border-black/5 opacity-0 group-hover:opacity-100 transition-opacity">
                   <button onClick={() => quickReply(m.text)} className="p-1 hover:bg-black/5 rounded text-primary/60"><Reply className="h-3 w-3" /></button>
                   <button onClick={() => copyMessage(m.text)} className="p-1 hover:bg-black/5 rounded text-primary/60"><Copy className="h-3 w-3" /></button>
                   <button onClick={() => deleteMessage(m.id)} className="p-1 hover:bg-black/5 rounded text-red-500/60"><Trash2 className="h-3 w-3" /></button>
                </div>
              </div>
            </motion.div>
          ))}
          {isTyping && (
            <div className="flex gap-1 p-2">
              <div className="w-1.5 h-1.5 bg-primary rounded-full animate-bounce" />
              <div className="w-1.5 h-1.5 bg-primary rounded-full animate-bounce delay-100" />
              <div className="w-1.5 h-1.5 bg-primary rounded-full animate-bounce delay-200" />
            </div>
          )}
        </div>

        {/* Chat Input */}
        <div className="p-4 bg-white dark:bg-slate-900 border-t border-border relative z-20">
          <div className="max-w-2xl mx-auto flex gap-2">
            <input
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              placeholder="اكتب رسالتك السيادية..."
              className="flex-1 bg-secondary/30 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-primary/20 outline-none"
            />
            <button
              onClick={() => handleSend()}
              className="bg-[#28a745] text-white px-6 rounded-xl font-bold hover:bg-emerald-600 transition-colors shadow-lg active:scale-95"
            >
              إرسال
            </button>
          </div>
        </div>

        {/* Advanced Sovereign Admin Hub */}
        <AnimatePresence>
          {isAdminOpen && (
            <motion.div 
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="fixed inset-x-0 bottom-0 h-[70vh] bg-white dark:bg-slate-950 z-[110] rounded-t-[3rem] shadow-[0_-20px_50px_rgba(0,0,0,0.3)] border-t border-white/10 overflow-hidden"
            >
              <div className="p-2 flex justify-center">
                <div className="w-12 h-1.5 bg-slate-300 dark:bg-slate-700 rounded-full" />
              </div>
              
              <div className="p-6 flex items-center justify-between border-b border-border">
                <h3 className="text-xl font-black flex items-center gap-2">
                  <Settings className="h-5 w-5 text-primary" /> مركز القيادة العليا
                </h3>
                <button onClick={() => setIsAdminOpen(false)} className="p-2 hover:bg-secondary rounded-full">
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="flex flex-col h-full">
                {/* Tabs Header */}
                <div className="flex overflow-x-auto p-4 gap-2 scrollbar-hide border-b border-border bg-slate-50 dark:bg-slate-900/50">
                  <TabBtn id="users" label="المستخدمون" icon={<Users />} active={activeTab} onClick={setActiveTab} />
                  <TabBtn id="advisors" label="المستشارون" icon={<Gavel />} active={activeTab} onClick={setActiveTab} />
                  <TabBtn id="banned" label="الرقابة" icon={<ShieldAlert />} active={activeTab} onClick={setActiveTab} />
                  <TabBtn id="offers" label="العروض" icon={<Tag />} active={activeTab} onClick={setActiveTab} />
                  <TabBtn id="logs" label="السجل" icon={<Activity />} active={activeTab} onClick={setActiveTab} />
                </div>

                {/* Tabs Content */}
                <div className="flex-1 overflow-y-auto p-6 pb-24">
                  {activeTab === "users" && (
                    <div className="grid grid-cols-1 gap-3">
                      <AdminAction icon={<Plus />} label="إضافة مواطن جديد" color="blue" />
                      <AdminAction icon={<Trash2 />} label="تطهير سجل مستخدم" color="red" />
                      <AdminAction icon={<Ban />} label="حظر / فك حظر سيادي" color="amber" />
                    </div>
                  )}
                  {activeTab === "advisors" && (
                    <div className="grid grid-cols-1 gap-3">
                      <AdminAction icon={<Plus />} label="تعيين مستشار خبير" color="blue" />
                      <AdminAction icon={<Trash2 />} label="استبعاد من الهيئة" color="red" />
                      <AdminAction icon={<ShieldCheck />} label="تعديل صلاحيات الوصول" color="indigo" />
                    </div>
                  )}
                  {activeTab === "banned" && (
                    <div className="grid grid-cols-1 gap-3">
                      <AdminAction icon={<Plus />} label="إضافة كلمة للقائمة السوداء" color="red" />
                      <AdminAction icon={<Trash2 />} label="حذف كلمة من الرقابة" color="emerald" />
                    </div>
                  )}
                  {activeTab === "offers" && (
                    <div className="grid grid-cols-1 gap-3">
                      <AdminAction icon={<Plus />} label="إنشاء باقة شحن جديدة" color="blue" />
                      <AdminAction icon={<Trash2 />} label="إلغاء عرض مالي" color="red" />
                    </div>
                  )}
                  {activeTab === "logs" && (
                    <div className="bg-slate-100 dark:bg-black/40 p-4 rounded-2xl font-mono text-[10px] space-y-2 max-h-[300px] overflow-y-auto">
                      {logs?.map((log, i) => (
                        <div key={i} className="flex gap-2 opacity-70">
                          <span className="text-primary font-bold">[{log.createdAt?.seconds}]</span>
                          <span className="text-white">{log.event}:</span>
                          <span className="text-emerald-500">{JSON.stringify(log.data)}</span>
                        </div>
                      ))}
                      {(!logs || logs.length === 0) && <p className="text-center opacity-30">لا توجد سجلات حالية</p>}
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

      </div>
    </ProtectedRoute>
  );
}

function TabBtn({ id, label, icon, active, onClick }: { id: AdminTab, label: string, icon: any, active: AdminTab, onClick: any }) {
  const isActive = active === id;
  return (
    <button
      onClick={() => onClick(id)}
      className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-black transition-all whitespace-nowrap ${
        isActive ? "bg-primary text-white shadow-lg" : "bg-white dark:bg-slate-800 text-muted-foreground hover:bg-secondary"
      }`}
    >
      {icon} {label}
    </button>
  );
}

function AdminAction({ icon, label, color }: { icon: any, label: string, color: string }) {
  const colors: any = {
    blue: "bg-blue-500 hover:bg-blue-600",
    red: "bg-red-500 hover:bg-red-600",
    amber: "bg-amber-500 hover:bg-amber-600",
    emerald: "bg-emerald-500 hover:bg-emerald-600",
    indigo: "bg-indigo-500 hover:bg-indigo-600"
  };
  return (
    <button className={`w-full flex items-center gap-4 p-4 rounded-2xl text-white font-bold text-sm transition-all shadow-md active:scale-95 ${colors[color]}`}>
      <span className="p-2 bg-white/20 rounded-lg">{icon}</span>
      {label}
    </button>
  );
}
