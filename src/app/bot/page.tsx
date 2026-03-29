
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
  XCircle,
  Clock,
  Layers,
  Menu
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
  { id: "ai-standard", name: "مستشارك الذكي", icon: "🤖", cost: 1, desc: "إجابات سريعة وذكية لكافة التساؤلات" },
  { id: "notary", name: "الكاتب العدل", icon: "✒️", cost: 1, desc: "صحة وتوثيق المستندات" },
  { id: "lawyer", name: "المحامي الفائق", icon: "⚖️", cost: 5, desc: "خبير القضايا والنزاعات المعقدة" },
  { id: "judge", name: "خبير القضاء", icon: "👨‍⚖️", cost: 5, desc: "رؤية ثاقبة من منصة الحكم" },
  { id: "consultant", name: "مستشار استراتيجي", icon: "🏢", cost: 5, desc: "نمو الشركات والصفقات التجارية" },
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
    toast({ title: "بداية جديدة", description: "تم فتح قناة استشارة جديدة." });
  };

  const deleteSession = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!user || !db) return;
    await deleteDoc(doc(db, "users", user.uid, "chatSessions", id));
    if (sessionId === id) setSessionId(null);
    toast({ title: "تم المسح", description: "تم حذف سجل المحادثة نهائياً." });
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

      // 5. Update Session Title if it's the first message
      await updateDoc(doc(db, "users", user.uid, "chatSessions", currentSessId), {
        lastMessageAt: serverTimestamp(),
        title: (messages?.length || 0) <= 2 ? input.slice(0, 40) : undefined
      });

      setInput("");
    } catch (error) {
      toast({ variant: "destructive", title: "خطأ سيادي", description: "تعذر الاتصال بالمحرك القانوني، حاول مجدداً." });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex h-[calc(100vh-5rem)] w-full overflow-hidden bg-background" dir="rtl">
      
      {/* Sidebar - ChatGPT Style */}
      <aside className="w-80 glass-cosmic border-l border-white/5 flex flex-col p-4 gap-6 hidden lg:flex relative z-50">
        <div className="flex flex-col gap-4">
           <Button onClick={startNewSession} className="w-full h-12 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 justify-start px-4 gap-3 font-bold text-sm">
              <Plus className="h-4 w-4 text-primary" /> محادثة جديدة
           </Button>

           <div className="grid grid-cols-4 gap-2">
              <SidebarAction icon={<History className="h-4 w-4" />} label="الأرشيف" />
              <SidebarAction icon={<Briefcase className="h-4 w-4" />} label="الحقيبة" />
              <SidebarAction icon={<Layers className="h-4 w-4" />} label="المشاريع" />
              <SidebarAction icon={<Sparkles className="h-4 w-4 text-primary" />} label="الترقية" onClick={() => router.push('/pricing')} />
           </div>
        </div>

        <div className="flex-1 flex flex-col gap-2 overflow-hidden">
          <p className="text-[10px] text-white/20 font-black uppercase tracking-widest px-2 mb-2">السجل الأخير</p>
          <ScrollArea className="flex-1">
            <div className="space-y-1">
              {sessions?.map((sess) => (
                <div
                  key={sess.id}
                  onClick={() => setSessionId(sess.id)}
                  className={`w-full text-right p-3 rounded-xl text-xs transition-all truncate flex items-center justify-between group cursor-pointer ${sessionId === sess.id ? 'bg-white/5 text-primary border border-white/5 shadow-lg' : 'text-white/40 hover:bg-white/[0.02]'}`}
                >
                  <div className="flex items-center gap-3 truncate">
                    <MessageSquare className={`h-3.5 w-3.5 ${sessionId === sess.id ? 'text-primary' : 'text-white/20'}`} />
                    <span className="truncate">{sess.title}</span>
                  </div>
                  <button onClick={(e) => deleteSession(sess.id, e)} className="opacity-0 group-hover:opacity-100 hover:text-red-500 transition-all p-1">
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              ))}
              {sessions?.length === 0 && <p className="text-[10px] text-white/10 text-center py-10">لا توجد محادثات سابقة</p>}
            </div>
          </ScrollArea>
        </div>

        <div className="mt-auto pt-4 border-t border-white/5">
          <div className="p-4 glass rounded-2xl flex items-center justify-between group cursor-pointer hover:bg-white/5 transition-all" onClick={() => router.push('/dashboard')}>
            <div className="text-right">
               <p className="text-[8px] text-white/30 font-black uppercase tracking-widest">رصيدك الكوني</p>
               <p className="text-lg font-black text-white">{profile?.balance || 0} <span className="text-[10px] text-primary">EGP</span></p>
            </div>
            <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center border border-primary/20">
               <Wallet className="h-4 w-4 text-primary" />
            </div>
          </div>
        </div>
      </aside>

      {/* Main Chat Area */}
      <main className="flex-1 flex flex-col relative bg-slate-950/20 backdrop-blur-sm">
        <header className="h-16 border-b border-white/[0.03] flex items-center justify-between px-6 bg-slate-950/40 backdrop-blur-3xl z-30">
          <div className="flex items-center gap-3">
             <div className="h-10 w-10 rounded-xl bg-white/5 flex items-center justify-center text-xl shadow-inner border border-white/5">
                {activeChar.icon}
             </div>
             <div>
                <h1 className="text-sm font-black text-white">{activeChar.name}</h1>
                <p className="text-[8px] text-white/30 font-bold uppercase tracking-widest">
                   {activeChar.cost === 1 ? 'رسالة قياسية' : 'استشارة متخصصة'}
                </p>
             </div>
          </div>
          
          <div className="flex gap-1.5">
             {CHARACTERS.map(c => (
               <Button 
                key={c.id} 
                variant="ghost" 
                size="icon" 
                className={`h-9 w-9 rounded-xl transition-all ${activeChar.id === c.id ? 'bg-primary/20 text-primary border border-primary/20' : 'glass opacity-30 hover:opacity-100'}`}
                onClick={() => setActiveChar(c)}
                title={c.name}
               >
                 <span className="text-lg">{c.icon}</span>
               </Button>
             ))}
          </div>
        </header>

        <ScrollArea className="flex-1 p-4 md:p-8" ref={scrollRef}>
          <div className="max-w-3xl mx-auto space-y-10 pb-10">
            {messages?.length === 0 && (
              <div className="py-20 text-center space-y-8 animate-in fade-in duration-1000">
                 <div className="inline-flex p-6 rounded-[2.5rem] bg-white/5 border border-white/10 mb-4">
                    <Scale className="h-12 w-12 text-primary/40" />
                 </div>
                 <h2 className="text-2xl font-black text-white/80">أهلاً بك في فضاء العدالة الذكي</h2>
                 <p className="text-sm text-white/30 max-w-sm mx-auto leading-relaxed font-medium">أنا هنا لمساعدتك في كافة الأمور القانونية والتوثيقية. اطرح سؤالك لنبدأ التحليل.</p>
                 <div className="flex flex-wrap gap-3 justify-center">
                    <SamplePrompt text="تأسيس شركة في مصر" onClick={setInput} />
                    <SamplePrompt text="صيغة عقد إيجار" onClick={setInput} />
                    <SamplePrompt text="حقوق الموظف في الاستقالة" onClick={setInput} />
                 </div>
              </div>
            )}
            {messages?.map((msg) => (
              <div key={msg.id} className={`flex gap-4 ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'} animate-in fade-in slide-in-from-bottom-2 duration-500`}>
                <div className={`h-10 w-10 rounded-xl flex items-center justify-center shrink-0 border ${
                  msg.role === 'bot' ? 'bg-white/5 border-white/5' : 'bg-primary border-primary/20 text-white shadow-lg'
                }`}>
                  {msg.role === 'bot' ? <Sparkles className="h-4 w-4 opacity-40 text-primary" /> : <User className="h-5 w-5" />}
                </div>
                <div className={`max-w-[85%] space-y-1 ${msg.role === 'user' ? 'text-left' : 'text-right'}`}>
                  <div className={`p-5 md:p-6 rounded-2xl text-sm md:text-base leading-relaxed border shadow-xl ${
                    msg.role === 'bot' 
                    ? 'bg-white/[0.01] border-white/[0.03] text-white/70 rounded-tr-none whitespace-pre-wrap' 
                    : 'bg-primary/5 border-primary/20 text-white font-medium rounded-tl-none'
                  }`}>
                    {msg.content}
                  </div>
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex gap-4 animate-pulse">
                <div className="h-10 w-10 rounded-xl bg-white/5 border border-white/5" />
                <div className="bg-white/[0.01] p-5 rounded-2xl rounded-tr-none w-24 border border-white/[0.03] flex justify-center gap-1.5 items-center">
                  <div className="w-1 h-1 bg-primary/40 rounded-full animate-bounce" />
                  <div className="w-1 h-1 bg-primary/40 rounded-full animate-bounce [animation-delay:0.2s]" />
                  <div className="w-1 h-1 bg-primary/40 rounded-full animate-bounce [animation-delay:0.4s]" />
                </div>
              </div>
            )}
          </div>
        </ScrollArea>

        {/* Low Balance Guard */}
        {showLowBalance && (
          <div className="absolute inset-0 z-[100] bg-slate-950/80 backdrop-blur-xl flex items-center justify-center p-6">
            <div className="glass-cosmic p-12 rounded-[3rem] text-center max-w-sm border-red-500/20 shadow-2xl animate-in zoom-in duration-500">
               <XCircle className="h-16 w-16 text-red-500 mx-auto mb-6" />
               <h2 className="text-2xl font-black text-white mb-3">نفذ رصيدك</h2>
               <p className="text-white/40 text-sm mb-8 leading-relaxed font-black uppercase tracking-widest">تحتاج لشحن رصيد الكوكب لتتمكن من استكمال المحادثة.</p>
               <div className="flex flex-col gap-3">
                 <Button onClick={() => router.push('/pricing')} className="w-full h-14 rounded-2xl bg-primary text-white font-black text-lg shadow-xl">شحن الرصيد الآن</Button>
                 <Button variant="ghost" onClick={() => setShowLowBalance(false)} className="text-white/20 text-xs font-bold">ربما لاحقاً</Button>
               </div>
            </div>
          </div>
        )}

        {/* Message Input - Floating Style */}
        <div className="p-6 bg-slate-950/60 backdrop-blur-3xl border-t border-white/[0.03]">
          <div className="max-w-3xl mx-auto flex gap-3 items-end">
            <div className="flex-grow relative">
              <Input 
                placeholder={`اطرح سؤالك على ${activeChar.name}...`} 
                className="pr-6 pl-14 text-right glass border-white/[0.03] rounded-2xl h-14 text-base focus-visible:ring-1 ring-primary/40"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              />
              <Button 
                onClick={handleSend} 
                disabled={isLoading || !input.trim() || showLowBalance}
                className={`absolute left-2 top-2 h-10 w-10 rounded-xl transition-all ${
                  input.trim() ? 'bg-primary text-white scale-100 shadow-xl' : 'bg-white/5 text-white/10 scale-90'
                }`}
              >
                <Send className="h-4 w-4 rotate-180" />
              </Button>
            </div>
          </div>
          <div className="flex justify-center gap-8 mt-4 opacity-20">
             <div className="flex items-center gap-2 text-[8px] font-black uppercase tracking-widest text-white">
                <Clock className="h-3 w-3" /> تكلفة الرسالة: {activeChar.cost} EGP
             </div>
             <div className="flex items-center gap-2 text-[8px] font-black uppercase tracking-widest text-white">
                <AlertCircle className="h-3 w-3" /> استشارة ذكية أولية
             </div>
          </div>
        </div>
      </main>
    </div>
  );
}

function SidebarAction({ icon, label, onClick }: any) {
  return (
    <div className="flex flex-col items-center gap-1 group cursor-pointer" onClick={onClick}>
      <div className="h-10 w-10 rounded-xl glass flex items-center justify-center text-white/20 group-hover:text-primary group-hover:bg-white/5 transition-all border border-white/5">
        {icon}
      </div>
      <span className="text-[7px] text-white/20 font-black uppercase group-hover:text-white transition-colors">{label}</span>
    </div>
  );
}

function SamplePrompt({ text, onClick }: { text: string; onClick: (val: string) => void }) {
  return (
    <Button 
      variant="outline" 
      className="rounded-xl h-10 px-4 glass border-white/5 text-white/40 hover:text-white hover:border-primary/40 text-[10px] font-bold"
      onClick={() => onClick(text)}
    >
      {text}
    </Button>
  );
}
