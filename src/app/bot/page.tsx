
"use client";

import { useState, useRef, useEffect } from "react";
import { useUser, useFirestore, useCollection } from "@/firebase";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  Send, Sparkles, Plus, History, Camera, Mic, 
  Paperclip, Wallet, ChevronLeft, Menu, X, Trash2, 
  Loader2, Gavel, User, LayoutGrid, Scale, CreditCard,
  MessageCircle, AlertCircle, ShoppingBag, MicOff,
  Files, Image as ImageIcon, Archive
} from "lucide-react";
import { collection, addDoc, query, orderBy, serverTimestamp, doc, updateDoc, increment, limit, onSnapshot } from "firebase/firestore";
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
  const [isListening, setIsListening] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const scrollAreaRef = useRef<HTMLDivElement>(null);

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
      toast({ variant: "destructive", title: "فشل الإرسال", description: "حدث خطأ في النظام." });
    } finally {
      setIsLoading(false);
    }
  };

  const startListening = () => {
    if (!('webkitSpeechRecognition' in window)) {
      toast({ variant: "destructive", title: "غير مدعوم", description: "متصفحك لا يدعم التعرف على الصوت." });
      return;
    }
    const recognition = new (window as any).webkitSpeechRecognition();
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
      setInput(prev => prev + ` [تم إرفاق: ${file.name}] `);
      toast({ title: "تم إرفاق الملف", description: "سيقوم المستشار بتحليله عند الإرسال." });
    }
  };

  const isBalanceZero = (userData?.balance || 0) <= 0 && userData?.role !== 'admin';

  return (
    <div className="flex h-[calc(100vh-4rem)] bg-[#050505] overflow-hidden" dir="rtl">
      
      {/* Sidebar Replit Style */}
      <AnimatePresence mode="wait">
        {isSidebarOpen && (
          <motion.aside 
            initial={{ width: 0, opacity: 0 }}
            animate={{ width: 300, opacity: 1 }}
            exit={{ width: 0, opacity: 0 }}
            className="border-l border-white/[0.03] bg-[#0a0a0a] flex flex-col z-50 shadow-2xl relative"
          >
            {/* Quick Actions Icons */}
            <div className="flex gap-4 p-5 border-b border-white/[0.03] justify-center">
               <IconButton icon={<Archive />} tooltip="الأرشيف" />
               <IconButton icon={<Files />} tooltip="المستندات" />
               <IconButton icon={<ImageIcon />} tooltip="الصور" />
               <IconButton icon={<LayoutGrid />} tooltip="التطبيقات" />
            </div>

            <div className="p-5">
              <Button 
                onClick={() => {setSessionId(null); setInput("");}} 
                className="w-full h-12 rounded-xl bg-primary text-white gap-3 font-black text-xs shadow-lg shadow-primary/20 hover:scale-[1.02] transition-all"
              >
                <Plus className="h-4 w-4" /> محادثة جديدة
              </Button>
            </div>

            <ScrollArea className="flex-1 px-4">
              <p className="text-[10px] font-black text-white/20 uppercase tracking-widest mb-4 px-2">سجلات المحادثة</p>
              <div className="space-y-1">
                {sessions?.map(s => (
                  <button 
                    key={s.id} 
                    onClick={() => setSessionId(s.id)}
                    className={`w-full text-right p-3 rounded-xl text-[11px] transition-all flex items-center gap-3 ${sessionId === s.id ? 'bg-white/[0.05] text-primary border border-white/5' : 'text-white/40 hover:bg-white/[0.02] border border-transparent'}`}
                  >
                    <MessageCircle className="h-3.5 w-3.5 opacity-50" />
                    <span className="truncate font-bold">{s.title || "استشارة جديدة"}</span>
                  </button>
                ))}
              </div>
            </ScrollArea>

            <div className="p-5 border-t border-white/[0.03] bg-black/20">
               <div className="p-4 glass-cosmic rounded-2xl border-primary/10">
                  <p className="text-[9px] text-white/20 font-black uppercase mb-2">رصيدك الحالي</p>
                  <div className="flex items-baseline gap-2">
                    <span className="text-2xl font-black text-white">{userData?.balance || 0}</span>
                    <span className="text-[9px] text-primary font-black">EGP</span>
                  </div>
                  <Link href="/pricing">
                    <Button variant="ghost" className="w-full h-8 mt-3 rounded-lg bg-primary/10 text-primary text-[10px] font-black">ترقية الرصيد</Button>
                  </Link>
               </div>
            </div>
          </motion.aside>
        )}
      </AnimatePresence>

      <main className="flex-1 flex flex-col relative">
        <header className="h-16 border-b border-white/[0.03] flex items-center justify-between px-6 bg-black/40 backdrop-blur-3xl z-10">
          <div className="flex items-center gap-4">
            {!isSidebarOpen && (
              <Button variant="ghost" size="icon" onClick={() => setIsSidebarOpen(true)} className="text-white/20 hover:text-white">
                <Menu className="h-5 w-5" />
              </Button>
            )}
            <div className="flex items-center gap-3">
               <div className="h-9 w-9 rounded-xl glass-cosmic flex items-center justify-center text-sm shadow-xl border-white/5">{activeChar.emoji}</div>
               <div>
                 <h2 className="text-xs font-black text-white">{activeChar.name}</h2>
                 <p className="text-[9px] text-white/30 font-bold uppercase tracking-tighter">AI AGENT ACTIVE</p>
               </div>
            </div>
          </div>
          
          <div className="flex gap-1.5 bg-white/5 p-1 rounded-xl border border-white/5">
             {CHARACTERS.map(c => (
               <button 
                key={c.id} 
                className={`h-8 px-4 rounded-lg text-[10px] font-black transition-all ${activeChar.id === c.id ? 'bg-primary text-white shadow-lg shadow-primary/20' : 'text-white/30 hover:bg-white/5'}`}
                onClick={() => {setActiveChar(c); setSessionId(null);}}
               >
                 {c.name}
               </button>
             ))}
          </div>
        </header>

        <ScrollArea className="flex-1 p-6">
          <div className="max-w-3xl mx-auto space-y-10 pb-32">
            {(!messages || messages.length === 0) && (
              <div className="py-20 text-center space-y-6">
                 <div className="h-20 w-20 bg-primary/10 rounded-[2rem] flex items-center justify-center mx-auto shadow-[0_0_40px_rgba(37,99,235,0.1)] border border-primary/20">
                    <Sparkles className="h-10 w-10 text-primary animate-pulse" />
                 </div>
                 <h3 className="text-3xl font-black text-white tracking-tighter">غرفة الاستشارة الاحترافية</h3>
                 <p className="text-white/20 text-sm max-w-xs mx-auto leading-relaxed">أنا {activeChar.name}، جاهز لتحليل استفساراتك القانونية بدقة فائقة.</p>
              </div>
            )}
            
            {messages?.map((msg, i) => (
              <motion.div 
                key={i} 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`flex gap-5 ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}
              >
                <div className={`h-10 w-10 rounded-xl flex items-center justify-center shrink-0 border transition-all ${msg.role === 'user' ? 'bg-primary border-white/10 text-white shadow-lg' : 'glass-cosmic border-white/10 text-primary shadow-xl'}`}>
                  {msg.role === 'user' ? <User className="h-5 w-5" /> : <Gavel className="h-5 w-5" />}
                </div>
                <div className={`p-6 rounded-[2rem] text-sm leading-7 shadow-xl ${msg.role === 'user' ? 'bg-primary/5 text-white border border-primary/10 rounded-tr-none' : 'glass-cosmic text-white/80 rounded-tl-none border-white/10'}`}>
                  {msg.content}
                </div>
              </motion.div>
            ))}
            
            {isLoading && (
              <div className="flex gap-5">
                <div className="h-10 w-10 rounded-xl glass-cosmic border border-primary/20 flex items-center justify-center text-primary">
                   <Loader2 className="h-5 w-5 animate-spin" />
                </div>
                <div className="glass-cosmic p-6 rounded-[2rem] rounded-tl-none border-white/5 flex gap-1.5 items-center">
                  <div className="w-1 h-1 bg-primary rounded-full animate-bounce" />
                  <div className="w-1 h-1 bg-primary rounded-full animate-bounce delay-100" />
                  <div className="w-1 h-1 bg-primary rounded-full animate-bounce delay-200" />
                </div>
              </div>
            )}
          </div>
        </ScrollArea>

        {/* Floating Input Controller */}
        <div className="p-6 bg-gradient-to-t from-black via-black/80 to-transparent absolute bottom-0 inset-x-0">
          <div className="max-w-3xl mx-auto relative">
            
            {isBalanceZero && (
              <div className="absolute inset-0 z-20 glass-cosmic rounded-[2.5rem] flex items-center justify-between px-10 border-red-500/20 backdrop-blur-md">
                <div className="flex items-center gap-4">
                  <AlertCircle className="h-6 w-6 text-red-500" />
                  <p className="text-xs font-black text-white">رصيدك لا يسمح بالاستمرار. يرجى الشحن.</p>
                </div>
                <Link href="/pricing">
                  <Button className="btn-primary px-8 h-10 rounded-xl font-black text-[10px]">اشحن الآن</Button>
                </Link>
              </div>
            )}

            <div className={`glass-cosmic rounded-[2.5rem] p-2 flex items-center gap-2 border-white/5 shadow-2xl ${isBalanceZero ? 'opacity-20 pointer-events-none grayscale' : ''}`}>
              <div className="flex items-center gap-1 p-1 bg-white/[0.02] rounded-2xl border border-white/5">
                 <input type="file" ref={fileInputRef} className="hidden" onChange={handleFileUpload} />
                 <input type="file" ref={cameraInputRef} capture="environment" accept="image/*" className="hidden" onChange={handleFileUpload} />
                 
                 <MediaBtn icon={<Camera />} tooltip="التقاط" onClick={() => cameraInputRef.current?.click()} />
                 <MediaBtn 
                    icon={isListening ? <MicOff className="animate-pulse text-red-500" /> : <Mic />} 
                    tooltip="صوت" 
                    onClick={startListening} 
                 />
                 <MediaBtn icon={<Paperclip />} tooltip="ملف" onClick={() => fileInputRef.current?.click()} />
              </div>
              
              <input 
                placeholder={`اسأل ${activeChar.name} عن أي موضوع قانوني...`}
                className="flex-1 bg-transparent border-none focus:ring-0 text-sm font-medium text-right p-4 text-white/90 placeholder:text-white/10"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              />

              <Button onClick={handleSend} disabled={!input.trim() || isLoading} className="h-12 w-12 rounded-2xl btn-primary shrink-0 transition-transform active:scale-90">
                {isLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : <Send className="h-5 w-5 rotate-180" />}
              </Button>
            </div>
            <div className="flex justify-between items-center px-6 mt-3 opacity-20">
               <p className="text-[8px] font-black uppercase tracking-[0.2em]">Sovereign AI Protocol</p>
               <p className="text-[8px] font-black uppercase tracking-[0.2em]">Cost: {activeChar.cost} EGP / Msg</p>
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
      <Button variant="ghost" size="icon" onClick={onClick} className="h-9 w-9 rounded-xl text-white/20 hover:text-primary hover:bg-white/5 transition-all">
        {icon}
      </Button>
      <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 glass rounded-md text-[8px] font-black px-2 py-1 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
        {tooltip}
      </div>
    </div>
  );
}

function IconButton({ icon, tooltip }: any) {
  return (
    <div className="group relative">
      <Button variant="ghost" size="icon" className="h-10 w-10 rounded-xl bg-white/[0.02] border border-white/5 text-white/30 hover:text-primary hover:bg-white/5 transition-all">
        {icon}
      </Button>
      <div className="absolute left-full ml-2 top-1/2 -translate-y-1/2 glass rounded-md text-[8px] font-black px-2 py-1 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-50">
        {tooltip}
      </div>
    </div>
  );
}
