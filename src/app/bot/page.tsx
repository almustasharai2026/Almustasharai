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
  Coins, Settings, UserPlus, AlignLeft, Lightbulb, Terminal, FileText, AudioLines
} from "lucide-react";
import { collection, addDoc, query, orderBy, serverTimestamp, doc, updateDoc, increment, limit, onSnapshot } from "firebase/firestore";
import { useMemoFirebase } from "@/firebase/provider";
import { processLegalQuery } from "@/ai/flows/legal-chat-flow";
import { useToast } from "@/hooks/use-toast";
import { motion, AnimatePresence } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";

const CHARACTERS = [
  { id: "legal-advisor", name: "المستشار الذكي", emoji: "🤖", cost: 1, desc: "خبير شامل لكافة الاستشارات القانونية.", color: "from-blue-500 to-blue-700" },
  { id: "lawyer", name: "المحامي الفائق", emoji: "⚖️", cost: 5, desc: "متخصص في النزاعات المعقدة.", color: "from-amber-500 to-amber-700" },
  { id: "notary", name: "الكاتب العدل", emoji: "✒️", cost: 1, desc: "متخصص في تدقيق العقود.", color: "from-emerald-500 to-emerald-700" }
];

export default function ChatGPTStyleChat() {
  const { user } = useUser();
  const db = useFirestore();
  const { toast } = useToast();
  
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [activeChar, setActiveChar] = useState(CHARACTERS[0]);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [userData, setUserData] = useState<any>(null);
  const [isListening, setIsListening] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!db || !user) return;
    const unsub = onSnapshot(doc(db, "users", user.uid), (doc) => {
      setUserData(doc.data());
    });
    return () => unsub();
  }, [db, user]);

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
      toast({ variant: "destructive", title: "رصيد غير كافٍ", description: "يرجى شحن رصيدك للمتابعة." });
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
        await updateDoc(doc(db!, "users", user.uid), { balance: increment(-activeChar.cost) });
      }

      setInput("");
    } catch (e) {
      toast({ variant: "destructive", title: "خطأ", description: "تعذر معالجة الاستشارة." });
    } finally {
      setIsLoading(false);
    }
  };

  const isBalanceZero = (userData?.balance || 0) <= 0 && userData?.role !== 'admin';

  return (
    <div className="flex h-screen bg-black text-white overflow-hidden font-sans" dir="rtl">
      
      <main className="flex-1 flex flex-col relative">
        
        {/* Top Header - Mobile App Style */}
        <header className="h-16 flex items-center justify-between px-4 z-20">
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" className="text-white/60 rounded-full h-10 w-10 hover:bg-white/10">
              <Settings className="h-5 w-5" />
            </Button>
            <Button variant="ghost" size="icon" className="text-white/60 rounded-full h-10 w-10 hover:bg-white/10">
              <UserPlus className="h-5 w-5" />
            </Button>
          </div>

          <Link href="/pricing">
            <Button className="bg-white/5 hover:bg-white/10 text-white rounded-full px-6 h-10 border border-white/10 gap-2 text-xs font-bold transition-all">
              <Sparkles className="h-3.5 w-3.5 text-indigo-400" />
              اشترك في Plus
            </Button>
          </Link>

          <Button variant="ghost" size="icon" className="text-white/60 rounded-full h-10 w-10 hover:bg-white/10">
            <Menu className="h-5 w-5" />
          </Button>
        </header>

        {/* Chat Area */}
        <ScrollArea ref={scrollRef} className="flex-1 px-4">
          <div className="max-w-2xl mx-auto py-10">
            {(!messages || messages.length === 0) ? (
              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }} 
                animate={{ opacity: 1, scale: 1 }} 
                className="min-h-[60vh] flex flex-col items-center justify-center text-center space-y-12"
              >
                <h2 className="text-3xl md:text-4xl font-black text-white tracking-tight">كيف يمكنني المساعدة؟</h2>
                
                <div className="grid grid-cols-2 gap-3 w-full max-w-lg">
                  <QuickAction icon={<ImageIcon className="text-emerald-400" />} label="تحليل مستند" onClick={() => setInput("ممكن تحلل لي هالمستند القانوني؟")} />
                  <QuickAction icon={<FileText className="text-orange-400" />} label="لخص النص" onClick={() => setInput("لخص لي هالنص القانوني بأسلوب بسيط")} />
                  <QuickAction icon={<Terminal className="text-blue-400" />} label="صياغة عقد" onClick={() => setInput("أريد صياغة عقد إيجار موحد")} />
                  <QuickAction icon={<Lightbulb className="text-amber-400" />} label="اقترح أفكاراً" onClick={() => setInput("اقترح لي خطة للدفاع في قضية عمالية")} />
                </div>
              </motion.div>
            ) : (
              <div className="space-y-8 pb-32">
                {messages.map((msg, i) => (
                  <div key={i} className={`flex gap-4 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[85%] p-4 rounded-2xl text-sm leading-relaxed ${msg.role === 'user' ? 'bg-[#2f2f2f] text-white rounded-tr-none' : 'text-white/90 leading-loose'}`}>
                      {msg.content}
                    </div>
                  </div>
                ))}
                {isLoading && (
                  <div className="flex gap-4 animate-pulse">
                    <div className="w-2 h-2 bg-white/20 rounded-full animate-bounce" />
                    <div className="w-2 h-2 bg-white/20 rounded-full animate-bounce delay-100" />
                    <div className="w-2 h-2 bg-white/20 rounded-full animate-bounce delay-200" />
                  </div>
                )}
              </div>
            )}
          </div>
        </ScrollArea>

        {/* Pill Input Bar - Bottom Fixed */}
        <div className="absolute bottom-8 inset-x-0 px-4">
          <div className="max-w-2xl mx-auto relative">
            
            {isBalanceZero && (
              <div className="absolute bottom-full mb-4 w-full flex justify-center">
                <Badge variant="destructive" className="py-2 px-6 rounded-full bg-red-500/20 text-red-500 border-none font-bold text-[10px]">الرصيد غير كافٍ للاستمرار</Badge>
              </div>
            )}

            <div className={`bg-[#2f2f2f] rounded-full p-2 flex items-center gap-2 shadow-2xl transition-all ${isBalanceZero ? 'opacity-40 pointer-events-none' : ''}`}>
              <div className="flex items-center gap-1">
                <Button variant="ghost" size="icon" className="h-10 w-10 rounded-full text-white/60 hover:text-white">
                  <AudioLines className="h-5 w-5" />
                </Button>
                <Button onClick={() => toast({title: "قيد التطوير"})} variant="ghost" size="icon" className="h-10 w-10 rounded-full text-white/60 hover:text-white">
                  <Mic className="h-5 w-5" />
                </Button>
              </div>

              <input 
                placeholder="اطرح سؤالك على المستشار..."
                className="flex-1 bg-transparent border-none focus:ring-0 text-sm py-2 px-2 text-white placeholder:text-white/30"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && handleSend()}
              />

              <div className="flex items-center gap-1">
                <input type="file" ref={fileInputRef} className="hidden" onChange={(e) => setInput(prev => prev + " [ملف مرفق] ")} />
                <Button 
                  onClick={() => fileInputRef.current?.click()}
                  variant="ghost" 
                  size="icon" 
                  className="h-10 w-10 rounded-full text-white/60 hover:text-white"
                >
                  <Plus className="h-5 w-5" />
                </Button>
                {input.trim() && (
                  <Button 
                    onClick={handleSend}
                    disabled={isLoading}
                    className="h-10 w-10 rounded-full bg-white text-black hover:bg-white/90 p-0"
                  >
                    {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <ArrowUp className="h-5 w-5" />}
                  </Button>
                )}
              </div>
            </div>
            
            <p className="text-[9px] text-center text-white/20 font-bold mt-4">
              يمكن لـ المستشار AI ارتكاب أخطاء. تحقق من المعلومات الهامة.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}

function QuickAction({ icon, label, onClick }: any) {
  return (
    <button 
      onClick={onClick}
      className="flex items-center gap-3 p-4 rounded-2xl border border-white/10 hover:bg-white/5 transition-all text-right group"
    >
      <div className="h-8 w-8 rounded-lg bg-white/5 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
        {icon}
      </div>
      <span className="text-[11px] font-bold text-white/60 group-hover:text-white">{label}</span>
    </button>
  );
}

function ArrowUp({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <line x1="12" y1="19" x2="12" y2="5" />
      <polyline points="5 12 12 5 19 12" />
    </svg>
  );
}
