"use client";

import { useState, useRef, useEffect } from "react";
import { useUser, useFirestore, useCollection } from "@/firebase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  Send, Sparkles, Plus, History, Camera, Mic, 
  Paperclip, Wallet, ChevronLeft, Menu, X, Trash2, 
  Loader2, Gavel, User, LayoutGrid, Scale, CreditCard,
  MessageCircle, AlertCircle, ShoppingBag, Trash
} from "lucide-react";
import { collection, addDoc, query, orderBy, serverTimestamp, doc, updateDoc, increment, deleteDoc, limit, onSnapshot } from "firebase/firestore";
import { useMemoFirebase } from "@/firebase/provider";
import { processLegalQuery } from "@/ai/flows/legal-chat-flow";
import { useToast } from "@/hooks/use-toast";
import { motion, AnimatePresence } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";

const CHARACTERS = [
  { id: "legal-advisor", name: "المستشار الذكي", icon: <Sparkles />, emoji: "🤖", cost: 1, desc: "خبير شامل لكافة الاستشارات القانونية الأولية." },
  { id: "lawyer", name: "المحامي الفائق", icon: <Gavel />, emoji: "⚖️", cost: 5, desc: "متخصص في بناء استراتيجيات الدفاع والنزاعات المعقدة." },
  { id: "notary", name: "الكاتب العدل", icon: <Scale />, emoji: "✒️", cost: 1, desc: "متخصص في تدقيق العقود وصحة المستندات الرسمية." }
];

export default function UltimateChatHub() {
  const { user } = useUser();
  const db = useFirestore();
  const { toast } = useToast();
  
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [activeChar, setActiveChar] = useState(CHARACTERS[0]);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [userData, setUserData] = useState<any>(null);

  // Real-time user data for balance
  useEffect(() => {
    if (!db || !user) return;
    const unsub = onSnapshot(doc(db, "users", user.uid), (doc) => {
      setUserData(doc.data());
    });
    return () => unsub();
  }, [db, user]);

  // Queries for History
  const sessionsQuery = useMemoFirebase(() => user ? query(
    collection(db!, "users", user.uid, "chatSessions"), 
    orderBy("lastMessageAt", "desc"),
    limit(20)
  ) : null, [db, user]);
  const { data: sessions } = useCollection(sessionsQuery);

  const messagesQuery = useMemoFirebase(() => (user && sessionId) ? query(
    collection(db!, "users", user.uid, "chatSessions", sessionId, "messages"), 
    orderBy("timestamp", "asc")
  ) : null, [db, user, sessionId]);
  const { data: messages } = useCollection(messagesQuery);

  const handleSend = async () => {
    if (!input.trim() || isLoading || !user || !userData) return;
    
    // Strict Credit Check
    if (userData.balance < activeChar.cost && userData.role !== 'admin') {
      toast({ 
        variant: "destructive", 
        title: "رصيد غير كافٍ", 
        description: `تحتاج إلى ${activeChar.cost} EGP للرد من ${activeChar.name}. رصيدك الحالي: ${userData.balance} EGP.` 
      });
      return;
    }

    setIsLoading(true);
    let currentSessId = sessionId;

    try {
      if (!currentSessId) {
        const sessRef = await addDoc(collection(db!, "users", user.uid, "chatSessions"), {
          title: input.slice(0, 40),
          characterId: activeChar.id,
          lastMessageAt: serverTimestamp(),
          createdAt: serverTimestamp()
        });
        currentSessId = sessRef.id;
        setSessionId(currentSessId);
      }

      // 1. Add User Message
      await addDoc(collection(db!, "users", user.uid, "chatSessions", currentSessId, "messages"), {
        role: "user",
        content: input,
        timestamp: serverTimestamp()
      });

      // 2. AI Processing
      const result = await processLegalQuery({
        prompt: input,
        characterName: activeChar.name,
        characterDesc: activeChar.desc
      });

      // 3. Add AI Response
      await addDoc(collection(db!, "users", user.uid, "chatSessions", currentSessId, "messages"), {
        role: "assistant",
        content: result.response,
        timestamp: serverTimestamp()
      });

      // 4. Update Session & Deduct Credits
      await updateDoc(doc(db!, "users", user.uid, "chatSessions", currentSessId), {
        lastMessageAt: serverTimestamp()
      });

      if (userData.role !== 'admin') {
        await updateDoc(doc(db!, "users", user.uid), {
          balance: increment(-activeChar.cost)
        });
      }

      setInput("");
    } catch (e) {
      console.error(e);
      toast({ variant: "destructive", title: "فشل الإرسال", description: "حدث خطأ غير متوقع في الكوكب." });
    } finally {
      setIsLoading(false);
    }
  };

  const isBalanceZero = (userData?.balance || 0) <= 0 && userData?.role !== 'admin';

  return (
    <div className="flex h-[calc(100vh-4rem)] bg-[#050505] overflow-hidden" dir="rtl">
      
      {/* SaaS Premium Sidebar */}
      <AnimatePresence mode="wait">
        {isSidebarOpen && (
          <motion.aside 
            initial={{ width: 0, opacity: 0 }}
            animate={{ width: 320, opacity: 1 }}
            exit={{ width: 0, opacity: 0 }}
            className="border-l border-white/[0.03] bg-[#080808] flex flex-col p-5 z-50 shadow-2xl relative"
          >
            <div className="flex items-center justify-between mb-8">
               <h3 className="text-[10px] font-black text-white/20 uppercase tracking-[0.3em]">مركز العمليات</h3>
               <Button variant="ghost" size="icon" onClick={() => setIsSidebarOpen(false)} className="h-8 w-8 rounded-full hover:bg-white/5 text-white/20">
                  <ChevronLeft className="h-4 w-4 rotate-180" />
               </Button>
            </div>

            <Button 
              onClick={() => {setSessionId(null); setInput("");}} 
              className="w-full h-14 rounded-2xl bg-white/[0.03] hover:bg-white/[0.08] gap-4 font-black text-[13px] mb-10 border border-white/5 shadow-xl transition-all active:scale-95"
            >
              <Plus className="h-5 w-5 text-primary" /> محادثة قانونية جديدة
            </Button>

            <ScrollArea className="flex-1 -mx-2 px-2">
              <div className="space-y-2">
                {sessions?.map(s => (
                  <button 
                    key={s.id} 
                    onClick={() => setSessionId(s.id)}
                    className={`w-full text-right p-4 rounded-2xl text-xs transition-all group flex items-center gap-4 ${sessionId === s.id ? 'bg-primary/10 text-primary border border-primary/20 shadow-lg shadow-primary/5' : 'text-white/30 hover:bg-white/[0.02] border border-transparent'}`}
                  >
                    <MessageCircle className={`h-4 w-4 shrink-0 ${sessionId === s.id ? 'text-primary' : 'text-white/10'}`} />
                    <span className="truncate font-bold">{s.title || "بدون عنوان"}</span>
                  </button>
                ))}
                {(!sessions || sessions.length === 0) && (
                  <div className="py-10 text-center opacity-10">
                    <History className="h-10 w-10 mx-auto mb-2" />
                    <p className="text-[10px] font-bold">لا يوجد سجلات</p>
                  </div>
                )}
              </div>
            </ScrollArea>

            {/* Premium Features Quick Access */}
            <div className="mt-8 pt-8 border-t border-white/[0.03] space-y-3">
               <SidebarAction icon={<ShoppingBag />} label="المكتبة القانونية" href="/templates" />
               <SidebarAction icon={<LayoutGrid />} label="باقات الشحن" href="/pricing" />
               
               <div className="mt-6 p-6 glass-cosmic rounded-[2.5rem] border-primary/10 overflow-hidden relative">
                  <div className="absolute -top-4 -right-4 w-20 h-20 bg-primary/10 blur-3xl rounded-full" />
                  <p className="text-[9px] text-white/30 font-black uppercase mb-2 tracking-widest">رصيدك السيادي</p>
                  <div className="flex items-baseline gap-2">
                    <p className="text-4xl font-black text-white tabular-nums">{userData?.balance || 0}</p>
                    <span className="text-[10px] text-primary font-black">EGP</span>
                  </div>
                  <Link href="/pricing">
                    <Button variant="ghost" className="w-full h-10 mt-4 rounded-xl bg-primary/10 text-primary text-[10px] font-black hover:bg-primary/20">شحن فوري</Button>
                  </Link>
               </div>
            </div>
          </motion.aside>
        )}
      </AnimatePresence>

      <main className="flex-1 flex flex-col relative">
        <header className="h-16 border-b border-white/[0.03] flex items-center justify-between px-8 bg-black/40 backdrop-blur-3xl z-10">
          <div className="flex items-center gap-6">
            {!isSidebarOpen && (
              <Button variant="ghost" size="icon" onClick={() => setIsSidebarOpen(true)} className="text-white/20 hover:text-white">
                <Menu className="h-5 w-5" />
              </Button>
            )}
            <div className="flex items-center gap-4">
               <div className="h-10 w-10 rounded-xl glass-cosmic flex items-center justify-center text-lg shadow-xl">{activeChar.emoji}</div>
               <div>
                 <h2 className="text-sm font-black text-white">{activeChar.name}</h2>
                 <p className="text-[10px] text-white/30 font-medium">نشط الآن</p>
               </div>
            </div>
          </div>
          
          <div className="flex gap-2 bg-white/5 p-1.5 rounded-2xl border border-white/5">
             {CHARACTERS.map(c => (
               <button 
                key={c.id} 
                className={`h-10 px-5 rounded-xl text-[11px] font-black transition-all flex items-center gap-2 ${activeChar.id === c.id ? 'bg-primary text-white shadow-xl shadow-primary/20' : 'text-white/30 hover:bg-white/5'}`}
                onClick={() => {setActiveChar(c); setSessionId(null);}}
               >
                 {c.name}
               </button>
             ))}
          </div>
        </header>

        <ScrollArea className="flex-1 p-8">
          <div className="max-w-4xl mx-auto space-y-12 pb-32">
            {(!messages || messages.length === 0) && (
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="py-24 text-center space-y-8">
                 <div className="h-24 w-24 bg-primary/10 rounded-[2.5rem] flex items-center justify-center mx-auto mb-8 shadow-[0_0_50px_rgba(37,99,235,0.2)]">
                    <Sparkles className="h-12 w-12 text-primary animate-pulse" />
                 </div>
                 <h3 className="text-4xl font-black text-white tracking-tighter">أهلاً بك في غرفة الاستشارة</h3>
                 <p className="text-white/20 text-lg max-w-md mx-auto leading-relaxed font-medium">أنا {activeChar.name}. كيف يمكنني تحليل قضيتك أو مساعدتك قانونياً اليوم؟</p>
                 
                 <div className="grid grid-cols-2 gap-4 max-w-2xl mx-auto pt-10">
                    <QuickPrompt text="تحليل عقد إيجار قديم" icon="📜" onClick={setInput} />
                    <QuickPrompt text="خطوات خلع الزوج" icon="⚖️" onClick={setInput} />
                    <QuickPrompt text="مطالبة مالية من شركة" icon="🏢" onClick={setInput} />
                    <QuickPrompt text="تحقق من صحة توقيع" icon="✒️" onClick={setInput} />
                 </div>
              </motion.div>
            )}
            
            {messages?.map((msg, i) => (
              <motion.div 
                key={i} 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`flex gap-8 ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}
              >
                <div className={`h-12 w-12 rounded-2xl flex items-center justify-center shrink-0 border-2 transition-all ${msg.role === 'user' ? 'bg-primary border-primary/20 text-white shadow-lg' : 'glass-cosmic border-white/10 text-primary shadow-xl'}`}>
                  {msg.role === 'user' ? <User className="h-6 w-6" /> : <Gavel className="h-6 w-6" />}
                </div>
                <div className={`p-7 rounded-[2.5rem] text-[15px] leading-8 shadow-2xl ${msg.role === 'user' ? 'bg-primary/5 text-white border border-primary/10 rounded-tr-none' : 'glass-cosmic text-white/80 rounded-tl-none border-white/10'}`}>
                  {msg.content}
                </div>
              </motion.div>
            ))}
            
            {isLoading && (
              <div className="flex gap-8">
                <div className="h-12 w-12 rounded-2xl glass-cosmic border-2 border-primary/20 flex items-center justify-center text-primary">
                   <Loader2 className="h-6 w-6 animate-spin" />
                </div>
                <div className="glass-cosmic p-7 rounded-[2.5rem] rounded-tl-none w-32 flex justify-center gap-2 border-white/5">
                  <div className="w-1.5 h-1.5 bg-primary rounded-full animate-bounce" />
                  <div className="w-1.5 h-1.5 bg-primary rounded-full animate-bounce delay-150" />
                  <div className="w-1.5 h-1.5 bg-primary rounded-full animate-bounce delay-300" />
                </div>
              </div>
            )}
          </div>
        </ScrollArea>

        {/* Dynamic Input System */}
        <div className="p-8 bg-gradient-to-t from-black via-black/90 to-transparent">
          <div className="max-w-4xl mx-auto relative">
            
            {/* Barrier for zero balance */}
            {isBalanceZero && (
              <motion.div 
                initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
                className="absolute inset-0 z-20 glass-cosmic rounded-[3rem] flex flex-col items-center justify-center gap-4 border-red-500/30 p-10 text-center"
              >
                <AlertCircle className="h-12 w-12 text-red-500 animate-bounce" />
                <h4 className="text-xl font-black text-white">عذراً، رصيدك انتهى!</h4>
                <p className="text-white/40 text-sm">يجب شحن الرصيد للاستمرار في استخدام ميزات الكوكب السيادي.</p>
                <Link href="/pricing">
                  <Button className="btn-primary px-10 h-12 rounded-2xl font-black">اشحن الآن <CreditCard className="mr-3 h-4 w-4" /></Button>
                </Link>
              </motion.div>
            )}

            <div className={`glass-cosmic rounded-[3rem] p-3 flex items-end gap-3 border-white/5 focus-within:border-primary/40 transition-all shadow-[0_0_100px_rgba(0,0,0,0.5)] ${isBalanceZero ? 'blur-md grayscale' : ''}`}>
              <div className="flex items-center gap-1.5 p-2 bg-white/[0.02] rounded-[2rem] border border-white/5">
                 <MediaButton icon={<Camera />} tooltip="التقاط مستند" />
                 <MediaButton icon={<Mic />} tooltip="إملاء صوتي" />
                 <MediaButton icon={<Paperclip />} tooltip="إرفاق ملف" />
              </div>
              <textarea 
                placeholder={`اطرح استفسارك لـ ${activeChar.name}...`}
                className="flex-1 bg-transparent border-none focus:ring-0 text-[17px] font-medium text-right p-5 min-h-[64px] max-h-48 resize-none text-white/90 placeholder:text-white/10"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && (e.preventDefault(), handleSend())}
                disabled={isBalanceZero}
              />
              <Button onClick={handleSend} disabled={!input.trim() || isLoading || isBalanceZero} className="h-16 w-16 rounded-[2.2rem] btn-primary shrink-0 group">
                {isLoading ? <Loader2 className="animate-spin" /> : <Send className="h-7 w-7 rotate-180 group-hover:-translate-x-1 group-hover:translate-y-1 transition-transform" />}
              </Button>
            </div>
            <div className="flex justify-between items-center px-8 mt-4">
               <p className="text-[10px] text-white/10 font-bold uppercase tracking-[0.3em]">AI Protocol v4.0 Sovereign</p>
               <p className="text-[10px] text-white/10 font-bold">كل رسالة تستهلك {activeChar.cost} EGP من رصيدك</p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

function SidebarAction({ icon, label, href }: any) {
  return (
    <Link href={href} className="w-full">
      <Button variant="ghost" className="w-full justify-start h-12 rounded-xl text-white/40 hover:text-primary hover:bg-primary/10 gap-4 font-bold text-xs">
        <span className="opacity-50">{icon}</span>
        {label}
      </Button>
    </Link>
  );
}

function QuickPrompt({ text, icon, onClick }: any) {
  return (
    <button 
      onClick={() => onClick(text)}
      className="p-5 glass-cosmic rounded-3xl text-right border-white/5 hover:border-primary/20 hover:bg-white/[0.02] transition-all group"
    >
      <span className="text-xl mb-3 block">{icon}</span>
      <p className="text-sm font-black text-white/40 group-hover:text-white transition-colors leading-snug">{text}</p>
    </button>
  );
}

function MediaButton({ icon, tooltip }: any) {
  return (
    <div className="group relative">
      <Button variant="ghost" size="icon" className="h-11 w-11 rounded-full text-white/20 hover:text-primary hover:bg-white/5 transition-all">
        {icon}
      </Button>
      <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 glass-cosmic border-primary/20 text-[10px] font-black px-2 py-1 rounded opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity">
        {tooltip}
      </div>
    </div>
  );
}