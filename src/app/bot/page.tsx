"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { useUser, useFirestore, useCollection } from "@/firebase";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  Send, Sparkles, Plus, History, Camera, Mic, 
  Paperclip, ChevronLeft, Menu, X, 
  Loader2, Gavel, User, LayoutGrid, Scale,
  MessageCircle, AlertCircle, Image as ImageIcon, Archive, MicOff, CheckCircle2, ChevronRight,
  Coins
} from "lucide-react";
import { collection, addDoc, query, orderBy, serverTimestamp, doc, updateDoc, increment, limit, onSnapshot } from "firebase/firestore";
import { useMemoFirebase } from "@/firebase/provider";
import { processLegalQuery } from "@/ai/flows/legal-chat-flow";
import { useToast } from "@/hooks/use-toast";
import { motion, AnimatePresence } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";

const CHARACTERS = [
  { id: "legal-advisor", name: "المستشار الذكي", icon: <Sparkles className="h-4 w-4" />, emoji: "🤖", cost: 1, desc: "خبير شامل لكافة الاستشارات القانونية الأولية.", color: "from-blue-500 to-blue-700" },
  { id: "lawyer", name: "المحامي الفائق", icon: <Gavel className="h-4 w-4" />, emoji: "⚖️", cost: 5, desc: "متخصص في بناء استراتيجيات الدفاع والنزاعات المعقدة.", color: "from-amber-500 to-amber-700" },
  { id: "notary", name: "الكاتب العدل", icon: <Scale className="h-4 w-4" />, emoji: "✒️", cost: 1, desc: "متخصص في تدقيق العقود وصحة المستندات الرسمية.", color: "from-emerald-500 to-emerald-700" }
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
  const [isListening, setIsListening] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!db || !user) return;
    const unsub = onSnapshot(doc(db, "users", user.uid), (doc) => {
      setUserData(doc.data());
    });
    return () => unsub();
  }, [db, user]);

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

  const scrollToBottom = useCallback(() => {
    if (scrollRef.current) {
      const scrollElement = scrollRef.current.querySelector('[data-radix-scroll-area-viewport]');
      if (scrollElement) {
        scrollElement.scrollTop = scrollElement.scrollHeight;
      }
    }
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading, scrollToBottom]);

  const handleSend = async () => {
    if (!input.trim() || isLoading || !user || !userData) return;
    
    if (userData.balance < activeChar.cost && userData.role !== 'admin') {
      toast({ 
        variant: "destructive", 
        title: "رصيد غير كافٍ", 
        description: `تحتاج إلى ${activeChar.cost} EGP للمتابعة.` 
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

      await addDoc(collection(db!, "users", user.uid, "chatSessions", currentSessId, "messages"), {
        role: "user",
        content: input,
        timestamp: serverTimestamp()
      });

      const result = await processLegalQuery({
        prompt: input,
        characterName: activeChar.name,
        characterDesc: activeChar.desc
      });

      await addDoc(collection(db!, "users", user.uid, "chatSessions", currentSessId, "messages"), {
        role: "assistant",
        content: result.response,
        timestamp: serverTimestamp()
      });

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
      toast({ variant: "destructive", title: "خطأ", description: "تعذر معالجة الاستشارة حالياً." });
    } finally {
      setIsLoading(false);
    }
  };

  const startListening = () => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      toast({ variant: "destructive", title: "غير مدعوم", description: "متصفحك لا يدعم التعرف على الصوت." });
      return;
    }
    const recognition = new SpeechRecognition();
    recognition.lang = 'ar-SA';
    recognition.onstart = () => setIsListening(true);
    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      setInput(prev => prev + " " + transcript);
      setIsListening(false);
    };
    recognition.onerror = () => setIsListening(false);
    recognition.onend = () => setIsListening(false);
    recognition.start();
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setInput(prev => prev + ` [مرفق: ${file.name}] `);
      toast({ title: "تم الإرفاق بنجاح" });
    }
  };

  const isBalanceZero = (userData?.balance || 0) <= 0 && userData?.role !== 'admin';

  return (
    <div className="flex h-[calc(100vh-4rem)] bg-[#020617] overflow-hidden" dir="rtl">
      
      <AnimatePresence>
        {isSidebarOpen && (
          <motion.aside 
            initial={{ width: 0, opacity: 0 }}
            animate={{ width: 320, opacity: 1 }}
            exit={{ width: 0, opacity: 0 }}
            className="border-l border-white/5 bg-slate-950/50 flex flex-col z-50 backdrop-blur-3xl shadow-2xl"
          >
            <div className="px-6 py-8 flex items-center justify-between border-b border-white/5">
               <div className="flex items-center gap-3">
                  <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary border border-primary/20"><History className="h-4 w-4" /></div>
                  <span className="font-black text-sm text-white/60 tracking-widest uppercase">تاريخ السيادة</span>
               </div>
               <Button variant="ghost" size="icon" onClick={() => setIsSidebarOpen(false)} className="lg:hidden text-white/20 hover:text-white rounded-xl">
                 <X className="h-5 w-5" />
               </Button>
            </div>

            <div className="p-6">
              <Button 
                onClick={() => {setSessionId(null); setInput("");}} 
                className="w-full h-14 rounded-2xl bg-primary hover:bg-primary/90 text-white gap-3 font-black shadow-lg shadow-primary/20 transition-all active:scale-95"
              >
                <Plus className="h-5 w-5" /> محادثة جديدة
              </Button>
            </div>

            <ScrollArea className="flex-1 px-4">
              <div className="space-y-1">
                {sessions?.map(s => (
                  <button 
                    key={s.id} 
                    onClick={() => setSessionId(s.id)}
                    className={`w-full text-right p-4 rounded-2xl text-xs transition-all flex items-center gap-4 ${sessionId === s.id ? 'bg-white/5 text-primary border border-white/5' : 'text-white/40 hover:bg-white/[0.02] border border-transparent'}`}
                  >
                    <MessageCircle className="h-4 w-4 opacity-50" />
                    <span className="truncate font-bold">{s.title || "استشارة سيادية"}</span>
                  </button>
                ))}
              </div>
            </ScrollArea>

            <div className="p-6 border-t border-white/5">
               <div className="p-5 glass-cosmic rounded-3xl border-primary/10 bg-primary/5">
                  <div className="flex items-center justify-between mb-4">
                    <p className="text-[9px] text-white/20 font-black uppercase tracking-widest">رصيدك المتاح</p>
                    <Coins className="h-3 w-3 text-primary animate-pulse" />
                  </div>
                  <div className="flex items-baseline gap-2">
                    <span className="text-3xl font-black text-white tabular-nums">{userData?.balance || 0}</span>
                    <span className="text-[10px] text-primary font-black uppercase">EGP</span>
                  </div>
                  <Link href="/pricing" className="block mt-4">
                    <Button variant="ghost" className="w-full h-10 rounded-xl bg-white/5 text-white/60 hover:text-white font-black text-[10px] gap-2">شحن رصيد الآن <ChevronRight className="h-3 w-3" /></Button>
                  </Link>
               </div>
            </div>
          </motion.aside>
        )}
      </AnimatePresence>

      <main className="flex-1 flex flex-col relative bg-[#020617]">
        {!isSidebarOpen && (
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={() => setIsSidebarOpen(true)} 
            className="absolute top-4 right-4 z-50 h-10 w-10 glass border border-white/10 rounded-xl text-white/40 hover:text-white"
          >
            <Menu className="h-5 w-5" />
          </Button>
        )}

        <header className="h-16 border-b border-white/5 flex items-center justify-center px-6 bg-slate-950/40 backdrop-blur-3xl z-10">
          <div className="flex gap-1.5 bg-white/5 p-1 rounded-2xl border border-white/5">
             {CHARACTERS.map(c => (
               <button 
                key={c.id} 
                className={`h-9 px-6 rounded-xl text-[10px] font-black transition-all flex items-center gap-2 ${activeChar.id === c.id ? 'bg-primary text-white shadow-xl' : 'text-white/30 hover:bg-white/5'}`}
                onClick={() => {setActiveChar(c); setSessionId(null);}}
               >
                 {c.icon} {c.name}
               </button>
             ))}
          </div>
        </header>

        <ScrollArea ref={scrollRef} className="flex-1">
          <div className="max-w-3xl mx-auto space-y-12 pb-40 pt-10 px-6">
            {(!messages || messages.length === 0) && (
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="py-20 text-center space-y-8">
                 <div className={`h-24 w-24 bg-gradient-to-br ${activeChar.color} rounded-[2.5rem] flex items-center justify-center mx-auto shadow-2xl border border-white/10`}>
                    <span className="text-4xl">{activeChar.emoji}</span>
                 </div>
                 <div className="space-y-3">
                    <h3 className="text-4xl font-black text-white tracking-tighter">أهلاً بك في البوابة القانونية</h3>
                    <p className="text-white/20 text-lg font-bold max-w-sm mx-auto leading-relaxed">أنا {activeChar.name}. كيف يمكنني خدمتك سيادياً اليوم؟</p>
                 </div>
                 <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-w-xl mx-auto pt-4">
                    {["كيف أبدأ إجراءات التأسيس؟", "تحليل عقد إيجار قديم", "خطوات الطلاق للضرر", "حقوق الموظف في الاستقالة"].map(q => (
                      <button key={q} onClick={() => setInput(q)} className="text-right p-5 glass-cosmic rounded-[1.8rem] text-xs font-bold text-white/30 hover:text-primary hover:border-primary/30 transition-all hover:scale-[1.02] shadow-xl">{q}</button>
                    ))}
                 </div>
              </motion.div>
            )}
            
            {messages?.map((msg, i) => (
              <motion.div 
                key={i} 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`flex gap-6 ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}
              >
                <div className={`h-12 w-12 rounded-2xl flex items-center justify-center shrink-0 border transition-all ${msg.role === 'user' ? 'bg-primary border-white/10 text-white' : 'glass-cosmic border-white/10 text-primary'}`}>
                  {msg.role === 'user' ? <User className="h-6 w-6" /> : <Scale className="h-6 w-6" />}
                </div>
                <div className={`p-8 rounded-[2.5rem] text-sm leading-relaxed shadow-2xl ${msg.role === 'user' ? 'bg-primary/5 text-white border border-primary/10 rounded-tr-none' : 'glass-cosmic text-white/80 rounded-tl-none border-white/10'}`}>
                  {msg.content}
                </div>
              </motion.div>
            ))}
            
            {isLoading && (
              <div className="flex gap-6 animate-pulse">
                <div className="h-12 w-12 rounded-2xl glass-cosmic border border-primary/20 flex items-center justify-center text-primary">
                   <Loader2 className="h-6 w-6 animate-spin" />
                </div>
                <div className="glass-cosmic p-8 rounded-[2.5rem] rounded-tl-none border-white/5 flex gap-2 items-center">
                  <div className="w-1.5 h-1.5 bg-primary rounded-full animate-bounce" />
                  <div className="w-1.5 h-1.5 bg-primary rounded-full animate-bounce delay-100" />
                  <div className="w-1.5 h-1.5 bg-primary rounded-full animate-bounce delay-200" />
                </div>
              </div>
            )}
          </div>
        </ScrollArea>

        <div className="p-8 bg-gradient-to-t from-[#020617] via-[#020617]/90 to-transparent absolute bottom-0 inset-x-0">
          <div className="max-w-3xl mx-auto relative">
            
            {isBalanceZero && (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="absolute inset-0 z-20 glass-cosmic rounded-[3rem] flex items-center justify-between px-12 border-red-500/20 backdrop-blur-xl">
                <div className="flex items-center gap-5">
                  <div className="h-12 w-12 rounded-full bg-red-500/20 flex items-center justify-center"><AlertCircle className="h-6 w-6 text-red-500" /></div>
                  <p className="text-sm font-black text-white">الرصيد المتاح غير كافٍ. يرجى الشحن للمتابعة.</p>
                </div>
                <Link href="/pricing">
                  <Button className="btn-primary px-10 h-12 rounded-2xl font-black text-xs">شحن الرصيد</Button>
                </Link>
              </motion.div>
            )}

            <div className={`glass-cosmic rounded-[3rem] p-2.5 flex items-center gap-3 border-white/5 shadow-[0_30px_60px_rgba(0,0,0,0.5)] ${isBalanceZero ? 'opacity-20 pointer-events-none' : ''}`}>
              <div className="flex items-center gap-1.5 p-1.5 bg-white/5 rounded-3xl border border-white/5">
                 <input type="file" ref={fileInputRef} className="hidden" onChange={handleFileUpload} />
                 <input type="file" ref={cameraInputRef} capture="environment" accept="image/*" className="hidden" onChange={handleFileUpload} />
                 
                 <MediaBtn icon={<Camera />} tooltip="التقاط" onClick={() => cameraInputRef.current?.click()} />
                 <MediaBtn 
                    icon={isListening ? <MicOff className="animate-pulse text-red-500" /> : <Mic />} 
                    tooltip="إملاء" 
                    onClick={startListening} 
                 />
                 <MediaBtn icon={<Paperclip />} tooltip="مرفق" onClick={() => fileInputRef.current?.click()} />
              </div>
              
              <input 
                placeholder={`اسأل ${activeChar.name}...`}
                className="flex-1 bg-transparent border-none focus:ring-0 text-base font-bold text-right p-4 text-white/90 placeholder:text-white/10"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && handleSend()}
              />

              <Button onClick={handleSend} disabled={!input.trim() || isLoading} className="h-14 w-14 rounded-[1.8rem] btn-primary shrink-0 transition-transform active:scale-90">
                {isLoading ? <Loader2 className="h-6 w-6 animate-spin" /> : <Send className="h-6 w-6 rotate-180" />}
              </Button>
            </div>
            <div className="flex justify-between items-center px-10 mt-4 opacity-20">
               <p className="text-[8px] font-black uppercase tracking-[0.3em]">Sovereign Encryption Protocol</p>
               <p className="text-[8px] font-black uppercase tracking-[0.3em]">{activeChar.cost} EGP / الرسالة</p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

function MediaBtn({ icon, tooltip, onClick }: any) {
  return (
    <div className="group relative">
      <Button variant="ghost" size="icon" onClick={onClick} className="h-10 w-10 rounded-2xl text-white/20 hover:text-primary hover:bg-white/5 transition-all">
        {icon}
      </Button>
      <div className="absolute bottom-full mb-3 left-1/2 -translate-x-1/2 glass px-3 py-1.5 rounded-xl text-[9px] font-black opacity-0 group-hover:opacity-100 transition-all pointer-events-none whitespace-nowrap">
        {tooltip}
      </div>
    </div>
  );
}
