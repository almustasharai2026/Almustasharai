
"use client";

import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { 
  Send, 
  User, 
  Trash2,
  Loader2,
  Plus,
  History,
  Sparkles,
  Wallet,
  Scale,
  MessageSquare,
  Briefcase,
  Image as ImageIcon,
  ChevronRight,
  AlertCircle,
  XCircle
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { processLegalQuery } from "@/ai/flows/legal-chat-flow";
import { useUser, useFirestore, useCollection, useDoc } from "@/firebase";
import { 
  collection, 
  addDoc, 
  query, 
  orderBy, 
  serverTimestamp, 
  doc, 
  updateDoc, 
  increment,
  setDoc,
  deleteDoc
} from "firebase/firestore";
import { useMemoFirebase } from "@/firebase/provider";
import Link from "next/link";
import { useRouter } from "next/navigation";

type Message = {
  id: string;
  role: "user" | "bot";
  content: string;
  timestamp: any;
  character?: string;
};

const CHARACTERS = [
  { id: "ai-standard", name: "مستشارك الذكي", icon: "🤖", color: "from-primary/30 to-primary/5", desc: "إجابات سريعة وذكية لكافة التساؤلات", cost: 1 },
  { id: "lawyer", name: "المحامي الفائق", icon: "⚖️", color: "from-blue-600/30 to-indigo-600/10", desc: "خبير القضايا والنزاعات المعقدة", cost: 5 },
  { id: "judge", name: "خبير القضاء", icon: "👨‍⚖️", color: "from-slate-600/30 to-slate-900/10", desc: "رؤية ثاقبة من منصة الحكم", cost: 5 },
  { id: "consultant", name: "مستشار استراتيجي", icon: "🏢", color: "from-emerald-600/30 to-teal-600/10", desc: "نمو الشركات والصفقات التجارية", cost: 5 },
  { id: "notary", name: "الكاتب العدل", icon: "✒️", color: "from-amber-600/30 to-orange-600/10", desc: "صحة وتوثيق المستندات", cost: 1 },
];

const DISCLAIMER_TEXT = "\n\n--- \n⚠️ إخلاء مسؤولية: هذا الرد نتاج تحليل ذكاء اصطناعي لأغراض استرشادية فقط.";

export default function BotPage() {
  const { user } = useUser();
  const db = useFirestore();
  const router = useRouter();
  const { toast } = useToast();
  
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [activeChar, setActiveChar] = useState(CHARACTERS[0]);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [showLowBalance, setShowLowBalance] = useState(false);

  // User Profile for Balance
  const userDocRef = useMemoFirebase(() => user ? doc(db!, "users", user.uid) : null, [db, user]);
  const { data: profile } = useDoc(userDocRef);

  // History Sessions (Sidebar)
  const historyQuery = useMemoFirebase(() => user ? query(collection(db!, "users", user.uid, "chatSessions"), orderBy("lastMessageAt", "desc")) : null, [db, user]);
  const { data: sessions } = useCollection(historyQuery);

  // Current Messages
  const messagesQuery = useMemoFirebase(() => (user && sessionId) ? query(collection(db!, "users", user.uid, "chatSessions", sessionId, "messages"), orderBy("timestamp", "asc")) : null, [db, user, sessionId]);
  const { data: messages } = useCollection(messagesQuery);

  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      const viewport = scrollRef.current.querySelector('[data-radix-scroll-area-viewport]');
      if (viewport) viewport.scrollTop = viewport.scrollHeight;
    }
  }, [messages, isLoading]);

  const startNewSession = async () => {
    if (!user || !db) return;
    const sessionRef = await addDoc(collection(db, "users", user.uid, "chatSessions"), {
      title: "محادثة جديدة",
      characterId: activeChar.id,
      lastMessageAt: serverTimestamp(),
      createdAt: serverTimestamp()
    });
    setSessionId(sessionRef.id);
  };

  const deleteSession = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!user || !db) return;
    await deleteDoc(doc(db, "users", user.uid, "chatSessions", id));
    if (sessionId === id) setSessionId(null);
    toast({ title: "تم الحذف", description: "تم مسح سجل المحادثة بنجاح." });
  };

  const handleSend = async () => {
    if (!input.trim() || isLoading || !user || !db) return;

    const cost = activeChar.cost;
    const currentBalance = profile?.balance || 0;

    if (currentBalance < cost) {
      setShowLowBalance(true);
      return;
    }

    setIsLoading(true);
    let currentSessId = sessionId;

    if (!currentSessId) {
      const sessionRef = await addDoc(collection(db, "users", user.uid, "chatSessions"), {
        title: input.slice(0, 30),
        characterId: activeChar.id,
        lastMessageAt: serverTimestamp(),
        createdAt: serverTimestamp()
      });
      currentSessId = sessionRef.id;
      setSessionId(currentSessId);
    }

    try {
      // 1. Deduct Balance
      await updateDoc(doc(db, "users", user.uid), {
        balance: increment(-cost)
      });

      // 2. Save User Message
      await addDoc(collection(db, "users", user.uid, "chatSessions", currentSessId, "messages"), {
        role: "user",
        content: input,
        timestamp: serverTimestamp()
      });

      // 3. Call AI
      const result = await processLegalQuery({
        prompt: input,
        characterName: activeChar.name,
        characterDesc: activeChar.desc
      });

      // 4. Save Bot Response
      await addDoc(collection(db, "users", user.uid, "chatSessions", currentSessId, "messages"), {
        role: "bot",
        content: result.response + DISCLAIMER_TEXT,
        timestamp: serverTimestamp(),
        character: activeChar.name
      });

      // 5. Update Session
      await updateDoc(doc(db, "users", user.uid, "chatSessions", currentSessId), {
        lastMessageAt: serverTimestamp(),
        title: (messages?.length || 0) <= 2 ? input.slice(0, 30) : undefined
      });

      setInput("");
    } catch (error) {
      toast({ variant: "destructive", title: "خطأ في النظام", description: "فشل في معالجة طلبك، يرجى المحاولة لاحقاً." });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex h-[calc(100vh-5rem)] w-full overflow-hidden bg-slate-950/20" dir="rtl">
      
      {/* Sidebar - ChatGPT Style */}
      <aside className="w-80 glass border-l border-white/5 flex flex-col p-6 gap-8 hidden lg:flex">
        <div className="flex flex-col gap-6">
           <Button onClick={startNewSession} className="w-full h-14 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 justify-start px-6 gap-4 font-black">
              <Plus className="h-5 w-5 text-primary" /> محادثة جديدة
           </Button>

           <div className="grid grid-cols-4 gap-2">
              <SidebarAction icon={<History />} label="الأرشيف" />
              <SidebarAction icon={<Briefcase />} label="الحقيبة" />
              <SidebarAction icon={<ImageIcon />} label="المرفقات" />
              <SidebarAction icon={<Sparkles className="text-primary" />} label="الترقية" onClick={() => router.push('/pricing')} />
           </div>
        </div>

        <div className="flex-1 flex flex-col gap-4 overflow-hidden">
          <h3 className="text-[10px] text-white/20 font-black uppercase tracking-[0.2em] px-2">الدردشات الأخيرة</h3>
          <ScrollArea className="flex-1">
            <div className="space-y-1">
              {sessions?.map((sess) => (
                <div
                  key={sess.id}
                  onClick={() => setSessionId(sess.id)}
                  className={`w-full text-right p-4 rounded-xl text-sm transition-all truncate flex items-center justify-between group cursor-pointer ${sessionId === sess.id ? 'bg-white/5 text-primary font-bold' : 'text-white/40 hover:bg-white/[0.02]'}`}
                >
                  <span className="truncate flex-1">{sess.title}</span>
                  <button onClick={(e) => deleteSession(sess.id, e)} className="opacity-0 group-hover:opacity-100 hover:text-red-500 transition-all p-1">
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              ))}
              {sessions?.length === 0 && <p className="text-[10px] text-white/10 text-center py-10">لا يوجد سجلات حالياً</p>}
            </div>
          </ScrollArea>
        </div>

        <div className="p-4 bg-primary/5 border border-primary/10 rounded-2xl flex items-center justify-between">
          <div className="text-right">
             <p className="text-[8px] text-white/30 font-black uppercase">الرصيد المتاح</p>
             <p className="text-xl font-black text-white">{profile?.balance || 0} <span className="text-[10px] text-primary">EGP</span></p>
          </div>
          <Link href="/pricing">
            <Button size="icon" variant="ghost" className="h-10 w-10 rounded-xl glass hover:bg-primary/20">
               <Plus className="h-4 w-4" />
            </Button>
          </Link>
        </div>
      </aside>

      {/* Main Chat Area */}
      <main className="flex-1 flex flex-col relative">
        <header className="h-20 border-b border-white/[0.03] flex items-center justify-between px-8 bg-slate-950/40 backdrop-blur-3xl z-30">
          <div className="flex items-center gap-4">
             <div className="h-12 w-12 rounded-2xl bg-white/5 flex items-center justify-center text-2xl shadow-xl border border-white/5">
                {activeChar.icon}
             </div>
             <div>
                <h1 className="text-lg font-black text-white">{activeChar.name}</h1>
                <p className="text-[10px] text-primary font-black uppercase tracking-widest flex items-center gap-2">
                   <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                   تكلفة الرسالة: {activeChar.cost} EGP
                </p>
             </div>
          </div>
          
          <div className="flex gap-2">
             {CHARACTERS.map(c => (
               <Button 
                key={c.id} 
                variant="ghost" 
                size="icon" 
                className={`h-10 w-10 rounded-xl transition-all ${activeChar.id === c.id ? 'bg-primary/20 text-primary border border-primary/20' : 'glass opacity-40'}`}
                onClick={() => setActiveChar(c)}
                title={c.name}
               >
                 {c.icon}
               </Button>
             ))}
          </div>
        </header>

        <ScrollArea className="flex-1 p-6 md:p-10" ref={scrollRef}>
          <div className="max-w-4xl mx-auto space-y-12 pb-10">
            {messages?.length === 0 && (
              <div className="py-20 text-center space-y-6 opacity-20">
                 <Scale className="h-20 w-20 mx-auto" />
                 <p className="text-2xl font-black">اطرح استفسارك القانوني لنبدأ التحليل</p>
              </div>
            )}
            {messages?.map((msg) => (
              <div key={msg.id} className={`flex gap-6 ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'} animate-in fade-in slide-in-from-bottom-2 duration-500`}>
                <div className={`h-12 w-12 rounded-2xl flex items-center justify-center shrink-0 border ${
                  msg.role === 'bot' ? 'bg-white/5 border-white/5' : 'bg-primary border-primary/20 text-white'
                }`}>
                  {msg.role === 'bot' ? <Sparkles className="h-5 w-5 opacity-40" /> : <User className="h-6 w-6" />}
                </div>
                <div className={`max-w-[85%] space-y-2 ${msg.role === 'user' ? 'text-left' : 'text-right'}`}>
                  <div className={`p-6 md:p-8 rounded-[2rem] text-sm md:text-lg leading-loose border shadow-xl ${
                    msg.role === 'bot' 
                    ? 'bg-white/[0.01] border-white/[0.03] text-white/80 rounded-tr-none whitespace-pre-wrap' 
                    : 'bg-white/5 border-white/10 text-white font-medium rounded-tl-none'
                  }`}>
                    {msg.content}
                  </div>
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex gap-6 animate-pulse">
                <div className="h-12 w-12 rounded-2xl bg-white/5 border border-white/5" />
                <div className="bg-white/[0.01] p-6 rounded-[2rem] rounded-tr-none w-32 border border-white/[0.03] flex justify-center gap-2">
                  <div className="w-1.5 h-1.5 bg-primary/40 rounded-full animate-bounce" />
                  <div className="w-1.5 h-1.5 bg-primary/40 rounded-full animate-bounce [animation-delay:0.2s]" />
                  <div className="w-1.5 h-1.5 bg-primary/40 rounded-full animate-bounce [animation-delay:0.4s]" />
                </div>
              </div>
            )}
          </div>
        </ScrollArea>

        {showLowBalance && (
          <div className="absolute inset-0 z-40 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-6">
            <div className="glass-cosmic p-12 rounded-[3rem] text-center max-w-md border-red-500/20 shadow-2xl animate-in zoom-in duration-500">
               <XCircle className="h-20 w-20 text-red-500 mx-auto mb-8" />
               <h2 className="text-3xl font-black text-white mb-4">نفذ رصيدك</h2>
               <p className="text-white/40 text-lg mb-10 leading-relaxed font-black">تحتاج إلى شحن رصيد الكوكب لتتمكن من استكمال محادثاتك القانونية الفائقة.</p>
               <div className="flex flex-col gap-4">
                 <Link href="/pricing" className="w-full">
                    <Button className="w-full h-16 rounded-2xl cosmic-gradient text-xl font-black">شحن الرصيد الآن</Button>
                 </Link>
                 <Button variant="ghost" onClick={() => setShowLowBalance(false)} className="text-white/20 font-bold">إغلاق التنبيه</Button>
               </div>
            </div>
          </div>
        )}

        <div className="p-8 bg-slate-950/60 backdrop-blur-3xl border-t border-white/[0.03]">
          <div className="max-w-4xl mx-auto flex gap-4 items-end">
            <div className="flex-grow relative">
              <Input 
                placeholder={`اكتب سؤالك هنا...`} 
                className="pr-6 pl-16 text-right glass border-white/[0.03] rounded-2xl h-14 text-lg focus-visible:ring-1 ring-primary/40"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSend()}
              />
              <Button 
                onClick={handleSend} 
                disabled={isLoading || !input.trim() || showLowBalance}
                className={`absolute left-2 top-2 h-10 w-10 rounded-xl transition-all ${
                  input.trim() ? 'bg-primary text-white scale-100 shadow-xl' : 'bg-white/5 text-white/20 scale-90'
                }`}
              >
                <Send className="h-4 w-4 rotate-180" />
              </Button>
            </div>
          </div>
          <p className="text-[10px] text-center mt-6 opacity-20 font-black uppercase tracking-[0.4em] text-white">نظام الاستشارة الذكي - الجيل الرابع</p>
        </div>
      </main>
    </div>
  );
}

function SidebarAction({ icon, label, onClick }: any) {
  return (
    <div className="flex flex-col items-center gap-1 group cursor-pointer" onClick={onClick}>
      <div className="h-12 w-12 rounded-full glass flex items-center justify-center text-white/30 group-hover:text-white group-hover:bg-white/5 transition-all">
        {icon}
      </div>
      <span className="text-[8px] text-white/20 font-black uppercase group-hover:text-primary transition-colors">{label}</span>
    </div>
  );
}
