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
  Coins, Settings, UserPlus, AlignLeft, Lightbulb, Terminal, FileText, AudioLines, Trash2, ArrowUp
} from "lucide-react";
import { collection, addDoc, query, orderBy, serverTimestamp, doc, updateDoc, increment, limit, onSnapshot, deleteDoc } from "firebase/firestore";
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
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);

  // Listen to user profile for real-time balance
  useEffect(() => {
    if (!db || !user) return;
    const unsub = onSnapshot(doc(db, "users", user.uid), (doc) => {
      setUserData(doc.data());
    });
    return () => unsub();
  }, [db, user]);

  // Query sessions for the sidebar
  const sessionsQuery = useMemoFirebase(() => user ? query(
    collection(db!, "users", user.uid, "chatSessions"), 
    orderBy("lastMessageAt", "desc"),
    limit(20)
  ) : null, [db, user]);
  const { data: recentSessions } = useCollection(sessionsQuery);

  // Query messages for current session
  const messagesQuery = useMemoFirebase(() => (user && sessionId) ? query(
    collection(db!, "users", user.uid, "chatSessions", sessionId, "messages"), 
    orderBy("timestamp", "asc")
  ) : null, [db, user, sessionId]);
  const { data: messages } = useCollection(messagesQuery);

  // Voice Recognition Setup
  useEffect(() => {
    if (typeof window !== "undefined") {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (SpeechRecognition) {
        recognitionRef.current = new SpeechRecognition();
        recognitionRef.current.lang = "ar-EG";
        recognitionRef.current.continuous = false;
        recognitionRef.current.onresult = (event: any) => {
          const transcript = event.results[0][0].transcript;
          setInput(prev => prev + " " + transcript);
          setIsListening(false);
        };
        recognitionRef.current.onend = () => setIsListening(false);
      }
    }
  }, []);

  const toggleListening = () => {
    if (isListening) {
      recognitionRef.current?.stop();
    } else {
      try {
        recognitionRef.current?.start();
        setIsListening(true);
        toast({ title: "جاري الاستماع...", description: "تحدث الآن ليقوم البوت بكتابة رسالتك." });
      } catch (e) {
        toast({ variant: "destructive", title: "خطأ", description: "الميكروفون غير متاح أو المتصفح لا يدعم هذه الميزة." });
      }
    }
  };

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

  const handleSend = async (customPrompt?: string) => {
    const textToSend = customPrompt || input;
    if (!textToSend.trim() || isLoading || !user || !userData) return;
    
    if (userData.balance < activeChar.cost && userData.role !== 'admin') {
      toast({ variant: "destructive", title: "رصيد غير كافٍ", description: "يرجى شحن رصيدك من لوحة التحكم للمتابعة." });
      return;
    }

    setIsLoading(true);
    let currentSessId = sessionId;

    try {
      if (!currentSessId) {
        const sessRef = await addDoc(collection(db!, "users", user.uid, "chatSessions"), {
          title: textToSend.slice(0, 40),
          characterId: activeChar.id,
          lastMessageAt: serverTimestamp(),
          createdAt: serverTimestamp()
        });
        currentSessId = sessRef.id;
        setSessionId(currentSessId);
      }

      await addDoc(collection(db!, "users", user.uid, "chatSessions", currentSessId, "messages"), {
        role: "user",
        content: textToSend,
        timestamp: serverTimestamp()
      });

      const result = await processLegalQuery({
        prompt: textToSend,
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
      toast({ variant: "destructive", title: "خطأ", description: "تعذر معالجة الاستشارة حالياً." });
    } finally {
      setIsLoading(false);
    }
  };

  const startNewChat = () => {
    setSessionId(null);
    setInput("");
    setIsSidebarOpen(false);
  };

  const deleteSession = async (id: string) => {
    if (!user) return;
    try {
      await deleteDoc(doc(db!, "users", user.uid, "chatSessions", id));
      if (sessionId === id) startNewChat();
      toast({ title: "تم الحذف", description: "تم مسح المحادثة من الأرشيف." });
    } catch (e) {
      toast({ variant: "destructive", title: "خطأ", description: "فشل حذف المحادثة." });
    }
  };

  const isBalanceZero = (userData?.balance || 0) <= 0 && userData?.role !== 'admin';

  return (
    <div className="flex h-screen bg-black text-white overflow-hidden font-sans" dir="rtl">
      
      {/* Dynamic Sidebar */}
      <AnimatePresence>
        {isSidebarOpen && (
          <>
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden"
              onClick={() => setIsSidebarOpen(false)}
            />
            <motion.aside 
              initial={{ x: "100%" }} animate={{ x: 0 }} exit={{ x: "100%" }}
              className="fixed right-0 top-0 h-full w-72 bg-[#171717] z-50 p-4 flex flex-col border-l border-white/5"
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="font-black text-sm text-white/40 uppercase tracking-widest">سجل المحادثات</h3>
                <Button variant="ghost" size="icon" onClick={() => setIsSidebarOpen(false)}><X className="h-5 w-5" /></Button>
              </div>
              
              <Button onClick={startNewChat} className="w-full bg-white/5 hover:bg-white/10 text-white rounded-xl mb-6 h-12 gap-3 justify-start px-4 border border-white/5">
                <Plus className="h-4 w-4" /> محادثة جديدة
              </Button>

              <ScrollArea className="flex-1">
                <div className="space-y-1">
                  {recentSessions?.map(s => (
                    <div key={s.id} className="group relative">
                      <button 
                        onClick={() => { setSessionId(s.id); setIsSidebarOpen(false); }}
                        className={`w-full text-right p-3 rounded-xl text-sm transition-all truncate pr-4 ${sessionId === s.id ? 'bg-white/10 text-white font-bold' : 'text-white/40 hover:bg-white/5 hover:text-white'}`}
                      >
                        {s.title}
                      </button>
                      <button 
                        onClick={() => deleteSession(s.id)}
                        className="absolute left-2 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 p-1 text-white/20 hover:text-red-500 transition-all"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Desktop Sidebar Stub */}
      <aside className="hidden lg:flex w-72 flex-col bg-[#171717] border-l border-white/5 p-4">
          <Button onClick={startNewChat} className="w-full bg-white/5 hover:bg-white/10 text-white rounded-xl mb-6 h-12 gap-3 justify-start px-4 border border-white/5">
            <Plus className="h-4 w-4" /> محادثة جديدة
          </Button>
          <div className="flex-1 overflow-hidden flex flex-col">
            <p className="text-[10px] font-black text-white/20 uppercase tracking-widest mb-4 px-2">محادثات سابقة</p>
            <ScrollArea className="flex-1">
              <div className="space-y-1">
                {recentSessions?.map(s => (
                  <div key={s.id} className="group relative">
                    <button 
                      onClick={() => setSessionId(s.id)}
                      className={`w-full text-right p-3 rounded-xl text-sm transition-all truncate pr-4 ${sessionId === s.id ? 'bg-white/10 text-white font-bold' : 'text-white/40 hover:bg-white/5 hover:text-white'}`}
                    >
                      {s.title}
                    </button>
                    <button 
                      onClick={() => deleteSession(s.id)}
                      className="absolute left-2 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 p-1 text-white/20 hover:text-red-500 transition-all"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </div>
          <div className="mt-auto pt-4 border-t border-white/5">
             <div className="flex items-center gap-3 p-3 bg-white/5 rounded-2xl">
                <div className="h-10 w-10 rounded-xl bg-indigo-600 flex items-center justify-center font-black">
                  {user?.email?.charAt(0).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                   <p className="text-xs font-black truncate">{userData?.fullName || "المستشار"}</p>
                   <p className="text-[9px] text-white/40 font-bold tabular-nums">الرصيد: {userData?.balance} EGP</p>
                </div>
             </div>
          </div>
      </aside>

      <main className="flex-1 flex flex-col relative bg-black">
        
        {/* Top Header */}
        <header className="h-16 flex items-center justify-between px-4 z-20 border-b border-white/5 lg:border-none">
          <Button variant="ghost" size="icon" onClick={() => setIsSidebarOpen(true)} className="lg:hidden text-white/60 rounded-full h-10 w-10 hover:bg-white/10">
            <Menu className="h-5 w-5" />
          </Button>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 bg-white/5 px-4 py-1.5 rounded-full border border-white/5">
               <Coins className="h-3.5 w-3.5 text-primary" />
               <span className="text-[10px] font-black tabular-nums text-primary">{userData?.balance || 0} EGP</span>
            </div>
            <Link href="/pricing">
              <Button className="bg-white/5 hover:bg-white/10 text-white rounded-full px-6 h-10 border border-white/10 gap-2 text-xs font-bold transition-all">
                <Sparkles className="h-3.5 w-3.5 text-indigo-400" />
                اشترك في Plus
              </Button>
            </Link>
          </div>

          <div className="flex items-center gap-2">
            <Button onClick={() => toast({title: "قيد التطوير"})} variant="ghost" size="icon" className="text-white/60 rounded-full h-10 w-10 hover:bg-white/10">
              <Settings className="h-5 w-5" />
            </Button>
          </div>
        </header>

        {/* Chat Area */}
        <ScrollArea ref={scrollRef} className="flex-1 px-4">
          <div className="max-w-3xl mx-auto py-10">
            {(!messages || messages.length === 0) ? (
              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }} 
                animate={{ opacity: 1, scale: 1 }} 
                className="min-h-[60vh] flex flex-col items-center justify-center text-center space-y-12"
              >
                <div className="h-20 w-20 rounded-[2rem] bg-indigo-600/20 border border-indigo-500/20 flex items-center justify-center shadow-2xl">
                  <Scale className="h-10 w-10 text-indigo-400" />
                </div>
                <h2 className="text-3xl md:text-4xl font-black text-white tracking-tight">كيف يمكنني المساعدة قانونياً؟</h2>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full max-w-2xl">
                  <QuickAction icon={<ImageIcon className="text-emerald-400" />} label="تحليل مستند قانوني" onClick={() => handleSend("ممكن تحلل لي هالمستند القانوني وتطلع لي الثغرات؟")} />
                  <QuickAction icon={<FileText className="text-orange-400" />} label="لخص النص بأسلوب رصين" onClick={() => handleSend("لخص لي هالنص القانوني بأسلوب بسيط ومفهوم لغير المختصين.")} />
                  <QuickAction icon={<Terminal className="text-blue-400" />} label="صياغة عقد إيجار موحد" onClick={() => handleSend("أريد صياغة عقد إيجار موحد متوافق مع تعديلات القانون الجديد.")} />
                  <QuickAction icon={<Lightbulb className="text-amber-400" />} label="اقتراح خطة دفاع عمالية" onClick={() => handleSend("اقترح لي خطة للدفاع في قضية فصل تعسفي من العمل.")} />
                </div>
              </motion.div>
            ) : (
              <div className="space-y-8 pb-40">
                {messages.map((msg, i) => (
                  <div key={i} className={`flex gap-4 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[85%] p-5 rounded-[1.8rem] text-sm leading-relaxed ${msg.role === 'user' ? 'bg-[#2f2f2f] text-white rounded-tr-none' : 'bg-white/5 border border-white/5 text-white/90 leading-loose rounded-tl-none'}`}>
                      {msg.content}
                    </div>
                  </div>
                ))}
                {isLoading && (
                  <div className="flex gap-4">
                    <div className="p-5 rounded-[1.8rem] bg-white/5 border border-white/5 rounded-tl-none">
                      <TypingDots />
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </ScrollArea>

        {/* Floating Input Area */}
        <div className="absolute bottom-0 inset-x-0 px-4 pb-8 pt-10 bg-gradient-to-t from-black via-black to-transparent z-30">
          <div className="max-w-3xl mx-auto">
            
            {isBalanceZero && (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="flex justify-center mb-4">
                <Link href="/pricing">
                  <Badge variant="destructive" className="py-2 px-6 rounded-full bg-red-500/20 text-red-500 border border-red-500/20 font-black text-[10px] cursor-pointer hover:bg-red-500/30 transition-all">
                    نفذ رصيدك السيادي - اضغط هنا للشحن الفوري
                  </Badge>
                </Link>
              </motion.div>
            )}

            <div className={`bg-[#2f2f2f] rounded-[2rem] p-2 flex items-center gap-2 shadow-2xl transition-all border border-white/5 focus-within:border-white/20 ${isBalanceZero ? 'opacity-40 pointer-events-none' : ''}`}>
              <div className="flex items-center gap-1">
                <Button onClick={() => toast({title: "قيد المزامنة"})} variant="ghost" size="icon" className="h-10 w-10 rounded-full text-white/40 hover:text-white">
                  <AudioLines className="h-5 w-5" />
                </Button>
                <Button 
                  onClick={toggleListening} 
                  variant="ghost" 
                  size="icon" 
                  className={`h-10 w-10 rounded-full transition-all ${isListening ? 'text-red-500 bg-red-500/10 animate-pulse' : 'text-white/40 hover:text-white'}`}
                >
                  {isListening ? <MicOff className="h-5 w-5" /> : <Mic className="h-5 w-5" />}
                </Button>
              </div>

              <textarea 
                rows={1}
                placeholder="اسأل المستشار عن أي موضوع قانوني..."
                className="flex-1 bg-transparent border-none focus:ring-0 text-sm py-3 px-2 text-white placeholder:text-white/20 resize-none overflow-hidden"
                value={input}
                onChange={(e) => {
                  setInput(e.target.value);
                  e.target.style.height = 'auto';
                  e.target.style.height = e.target.scrollHeight + 'px';
                }}
                onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && (e.preventDefault(), handleSend())}
              />

              <div className="flex items-center gap-1 px-1">
                <input type="file" ref={fileInputRef} className="hidden" onChange={() => toast({title: "تم إرفاق الملف"})} />
                <Button 
                  onClick={() => fileInputRef.current?.click()}
                  variant="ghost" 
                  size="icon" 
                  className="h-10 w-10 rounded-full text-white/40 hover:text-white"
                >
                  <Plus className="h-5 w-5" />
                </Button>
                
                <AnimatePresence>
                  {input.trim() && (
                    <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }}>
                      <Button 
                        onClick={() => handleSend()}
                        disabled={isLoading}
                        className="h-10 w-10 rounded-full bg-white text-black hover:bg-indigo-50 p-0 shadow-xl"
                      >
                        {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <ArrowUp className="h-5 w-5" />}
                      </Button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
            
            <p className="text-[9px] text-center text-white/10 font-bold mt-4 tracking-widest uppercase">
              Almustashar AI Sovereign System v4.0 - Verified Privacy
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}

function TypingDots() {
  return (
    <div className="flex gap-1.5 items-center px-2 py-1">
      {[0, 1, 2].map(i => (
        <motion.div
          key={i}
          className="w-1.5 h-1.5 rounded-full bg-white/40"
          animate={{ opacity: [0.3, 1, 0.3], y: [0, -3, 0] }}
          transition={{ duration: 1.2, repeat: Infinity, delay: i * 0.2 }}
        />
      ))}
    </div>
  );
}

function QuickAction({ icon, label, onClick }: any) {
  return (
    <button 
      onClick={onClick}
      className="flex items-center gap-4 p-5 rounded-[1.8rem] border border-white/5 bg-white/[0.02] hover:bg-white/5 transition-all text-right group"
    >
      <div className="h-10 w-10 rounded-xl bg-white/5 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform shadow-inner">
        {icon}
      </div>
      <span className="text-[11px] font-black text-white/40 group-hover:text-white leading-relaxed">{label}</span>
    </button>
  );
}
