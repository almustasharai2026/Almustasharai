
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
  Image as ImageIcon,
  Camera,
  Mic,
  XCircle,
  Clock,
  Menu,
  ChevronLeft,
  Paperclip
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
import { useRouter } from "next/navigation";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

const CHARACTERS = [
  { id: "ai-standard", name: "مستشارك الذكي", icon: "🤖", cost: 1, desc: "إجابات سريعة وذكية لكافة التساؤلات" },
  { id: "lawyer", name: "المحامي الفائق", icon: "⚖️", cost: 5, desc: "خبير القضايا والنزاعات المعقدة" },
  { id: "notary", name: "الكاتب العدل", icon: "✒️", cost: 1, desc: "صحة وتوثيق المستندات" },
  { id: "judge", name: "خبير القضاء", icon: "👨‍⚖️", cost: 5, desc: "رؤية ثاقبة من منصة الحكم" },
];

const DISCLAIMER_TEXT = "\n\n--- \n⚠️ إخلاء مسؤولية: تحليل ذكاء اصطناعي لأغراض استرشادية فقط.";

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
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const [isRecording, setIsRecording] = useState(false);

  const videoRef = useRef<HTMLVideoElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  // User Profile
  const userDocRef = useMemoFirebase(() => user ? doc(db!, "users", user.uid) : null, [db, user]);
  const { data: profile } = useDoc(userDocRef);

  // History Sessions
  const historyQuery = useMemoFirebase(() => user ? query(collection(db!, "users", user.uid, "chatSessions"), orderBy("lastMessageAt", "desc")) : null, [db, user]);
  const { data: sessions } = useCollection(historyQuery);

  // Current Messages
  const messagesQuery = useMemoFirebase(() => (user && sessionId) ? query(collection(db!, "users", user.uid, "chatSessions", sessionId, "messages"), orderBy("timestamp", "asc")) : null, [db, user, sessionId]);
  const { data: messages } = useCollection(messagesQuery);

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
      await updateDoc(doc(db, "users", user.uid), { balance: increment(-cost) });
      await addDoc(collection(db, "users", user.uid, "chatSessions", currentSessId, "messages"), {
        role: "user",
        content: input,
        timestamp: serverTimestamp()
      });

      const result = await processLegalQuery({
        prompt: input,
        characterName: activeChar.name,
        characterDesc: activeChar.desc
      });

      await addDoc(collection(db, "users", user.uid, "chatSessions", currentSessId, "messages"), {
        role: "bot",
        content: result.response + DISCLAIMER_TEXT,
        timestamp: serverTimestamp(),
        character: activeChar.name
      });

      await updateDoc(doc(db, "users", user.uid, "chatSessions", currentSessId), {
        lastMessageAt: serverTimestamp(),
        title: (messages?.length || 0) <= 2 ? input.slice(0, 40) : undefined
      });

      setInput("");
    } catch (error) {
      toast({ variant: "destructive", title: "خطأ", description: "فشل في معالجة الطلب." });
    } finally {
      setIsLoading(false);
    }
  };

  const toggleCamera = async () => {
    if (!isCameraOpen) {
      setIsCameraOpen(true);
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true });
        if (videoRef.current) videoRef.current.srcObject = stream;
      } catch (err) {
        toast({ variant: "destructive", title: "الكاميرا", description: "يرجى السماح بالوصول للكاميرا." });
      }
    } else {
      setIsCameraOpen(false);
      const stream = videoRef.current?.srcObject as MediaStream;
      stream?.getTracks().forEach(track => track.stop());
    }
  };

  const handleVoiceTyping = () => {
    setIsRecording(!isRecording);
    if (!isRecording) {
      toast({ title: "جاري الاستماع", description: "تحدث الآن ليتم تحويل صوتك لنص..." });
      // Logic for Web Speech API can be added here
      setTimeout(() => setIsRecording(false), 3000); // Dummy timeout
    }
  };

  return (
    <div className="flex h-[calc(100vh-5rem)] w-full overflow-hidden bg-background" dir="rtl">
      
      {/* ChatGPT Style Sidebar */}
      <aside className={`transition-all duration-500 ease-in-out border-l border-white/5 bg-slate-950/40 backdrop-blur-3xl flex flex-col ${isSidebarOpen ? 'w-80' : 'w-0 opacity-0 overflow-hidden'}`}>
        <div className="p-4 flex flex-col gap-4">
          <Button onClick={startNewSession} className="w-full h-12 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 gap-3 font-bold text-sm">
            <Plus className="h-4 w-4" /> محادثة جديدة
          </Button>
          
          <div className="flex-grow">
            <p className="text-[10px] text-white/20 font-black uppercase tracking-widest px-2 mb-4">السجل الأخير</p>
            <ScrollArea className="h-[calc(100vh-25rem)]">
              <div className="space-y-1 pr-2">
                {sessions?.map((sess) => (
                  <div
                    key={sess.id}
                    onClick={() => setSessionId(sess.id)}
                    className={`w-full text-right p-3 rounded-2xl text-xs transition-all truncate flex items-center justify-between group cursor-pointer ${sessionId === sess.id ? 'bg-white/5 text-primary border border-white/5 shadow-lg' : 'text-white/40 hover:bg-white/[0.02]'}`}
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
              </div>
            </ScrollArea>
          </div>
        </div>

        <div className="mt-auto p-4 border-t border-white/5 space-y-4">
          <div className="p-4 glass rounded-3xl flex items-center justify-between">
            <div className="text-right">
               <p className="text-[8px] text-white/30 font-black uppercase">رصيدك</p>
               <p className="text-lg font-black text-white">{profile?.balance || 0} <span className="text-[10px] text-primary">EGP</span></p>
            </div>
            <Wallet className="h-5 w-5 text-primary" />
          </div>
          <Button variant="ghost" className="w-full text-white/40 text-xs font-bold" onClick={() => router.push('/pricing')}>شحن الرصيد</Button>
        </div>
      </aside>

      {/* Main Chat Area */}
      <main className="flex-1 flex flex-col relative">
        <header className="h-16 border-b border-white/[0.03] flex items-center justify-between px-6 bg-slate-950/20 backdrop-blur-3xl z-30">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="rounded-xl glass">
              <Menu className="h-5 w-5" />
            </Button>
            <div className="flex items-center gap-3">
               <span className="text-xl">{activeChar.icon}</span>
               <h1 className="text-sm font-black text-white">{activeChar.name}</h1>
            </div>
          </div>
          
          <div className="flex gap-2">
             {CHARACTERS.map(c => (
               <Button 
                key={c.id} 
                variant="ghost" 
                size="icon" 
                className={`h-9 w-9 rounded-xl transition-all ${activeChar.id === c.id ? 'bg-primary/20 text-primary border border-primary/20' : 'glass opacity-30 hover:opacity-100'}`}
                onClick={() => setActiveChar(c)}
               >
                 <span className="text-lg">{c.icon}</span>
               </Button>
             ))}
          </div>
        </header>

        <ScrollArea className="flex-1 p-6" ref={scrollRef}>
          <div className="max-w-4xl mx-auto space-y-10 pb-20">
            {messages?.length === 0 && (
              <div className="py-20 text-center space-y-8 animate-in fade-in duration-1000">
                 <div className="inline-flex p-8 rounded-[3rem] bg-white/5 border border-white/10 mb-4">
                    <Sparkles className="h-14 w-14 text-primary animate-pulse" />
                 </div>
                 <h2 className="text-3xl font-black text-white/80 tracking-tighter">أهلاً بك في ذكاء العدالة</h2>
                 <p className="text-sm text-white/30 max-w-sm mx-auto leading-relaxed">أنا رفيقك القانوني الذكي. اطرح سؤالك لنبدأ التحليل الاحترافي فوراً.</p>
              </div>
            )}
            {messages?.map((msg) => (
              <div key={msg.id} className={`flex gap-4 ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'} animate-in fade-in slide-in-from-bottom-2`}>
                <div className={`h-10 w-10 rounded-2xl flex items-center justify-center shrink-0 border ${
                  msg.role === 'bot' ? 'bg-white/5 border-white/5' : 'bg-primary border-primary/20 text-white shadow-lg'
                }`}>
                  {msg.role === 'bot' ? <Sparkles className="h-4 w-4 text-primary" /> : <User className="h-5 w-5" />}
                </div>
                <div className={`max-w-[80%] space-y-1 ${msg.role === 'user' ? 'text-left' : 'text-right'}`}>
                  <div className={`p-5 rounded-[2rem] text-sm md:text-base leading-relaxed border shadow-xl ${
                    msg.role === 'bot' 
                    ? 'bg-white/[0.02] border-white/[0.05] text-white/70 rounded-tr-none whitespace-pre-wrap' 
                    : 'bg-primary/10 border-primary/20 text-white font-medium rounded-tl-none'
                  }`}>
                    {msg.content}
                  </div>
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex gap-4 animate-pulse">
                <div className="h-10 w-10 rounded-2xl bg-white/5 border border-white/5" />
                <div className="bg-white/[0.02] p-5 rounded-2xl rounded-tr-none w-24 border border-white/[0.05] flex justify-center gap-1.5 items-center">
                  <div className="w-1.5 h-1.5 bg-primary/40 rounded-full animate-bounce" />
                  <div className="w-1.5 h-1.5 bg-primary/40 rounded-full animate-bounce [animation-delay:0.2s]" />
                  <div className="w-1.5 h-1.5 bg-primary/40 rounded-full animate-bounce [animation-delay:0.4s]" />
                </div>
              </div>
            )}
          </div>
        </ScrollArea>

        {/* Floating Input Area with Modern Controls */}
        <div className="p-6 bg-slate-950/60 backdrop-blur-3xl border-t border-white/[0.03]">
          <div className="max-w-4xl mx-auto space-y-4">
            <div className="relative flex items-end gap-3">
              <div className="flex-grow relative group">
                <Input 
                  placeholder={`اطرح سؤالك على ${activeChar.name}...`} 
                  className="pr-6 pl-32 text-right glass border-white/[0.05] rounded-[2rem] h-16 text-lg focus-visible:ring-1 ring-primary/40"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                />
                
                {/* Comfort Features Buttons */}
                <div className="absolute left-3 top-1/2 -translate-y-1/2 flex items-center gap-1">
                   <Button variant="ghost" size="icon" onClick={handleVoiceTyping} className={`h-10 w-10 rounded-full transition-all ${isRecording ? 'bg-red-500 text-white animate-pulse' : 'text-white/20 hover:text-primary hover:bg-white/5'}`}>
                      <Mic className="h-5 w-5" />
                   </Button>
                   <Button variant="ghost" size="icon" onClick={toggleCamera} className="h-10 w-10 rounded-full text-white/20 hover:text-primary hover:bg-white/5">
                      <Camera className="h-5 w-5" />
                   </Button>
                   <Button variant="ghost" size="icon" onClick={() => fileInputRef.current?.click()} className="h-10 w-10 rounded-full text-white/20 hover:text-primary hover:bg-white/5">
                      <Paperclip className="h-5 w-5" />
                   </Button>
                   <input type="file" ref={fileInputRef} className="hidden" />
                </div>
              </div>

              <Button 
                onClick={handleSend} 
                disabled={isLoading || !input.trim()}
                className={`h-16 w-16 rounded-[1.8rem] transition-all ${
                  input.trim() ? 'bg-primary text-white scale-100 shadow-2xl' : 'bg-white/5 text-white/10 scale-90'
                }`}
              >
                {isLoading ? <Loader2 className="animate-spin" /> : <Send className="h-6 w-6 rotate-180" />}
              </Button>
            </div>

            <div className="flex justify-center gap-10 opacity-20">
               <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-white">
                  <Clock className="h-3.5 w-3.5" /> تكلفة الرسالة: {activeChar.cost} EGP
               </div>
               <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-white">
                  <Scale className="h-3.5 w-3.5" /> استشارة ذكية أولية
               </div>
            </div>
          </div>
        </div>
      </main>

      {/* Camera Dialog */}
      <Dialog open={isCameraOpen} onOpenChange={setIsCameraOpen}>
        <DialogContent className="glass-cosmic border-white/10 p-6 rounded-[3rem]">
          <DialogHeader>
            <DialogTitle className="text-center font-black">التقاط مستند أو صورة</DialogTitle>
          </DialogHeader>
          <div className="relative aspect-video rounded-[2rem] overflow-hidden bg-black border border-white/5 shadow-2xl">
            <video ref={videoRef} autoPlay muted playsInline className="w-full h-full object-cover mirror" />
            <div className="absolute bottom-6 left-1/2 -translate-x-1/2">
               <Button onClick={toggleCamera} className="h-16 w-16 rounded-full bg-primary text-white shadow-2xl">
                  <Camera className="h-8 w-8" />
               </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Low Balance Guard */}
      {showLowBalance && (
        <div className="absolute inset-0 z-[100] bg-slate-950/80 backdrop-blur-xl flex items-center justify-center p-6">
          <div className="glass-cosmic p-12 rounded-[4rem] text-center max-w-sm border-red-500/20 shadow-2xl animate-in zoom-in">
             <XCircle className="h-20 w-20 text-red-500 mx-auto mb-8" />
             <h2 className="text-3xl font-black text-white mb-4">نفذ رصيدك الكوني</h2>
             <p className="text-white/40 text-sm mb-10 leading-relaxed font-bold">للاستمتاع بخدمات الذكاء الاصطناعي والمستشارين، يرجى شحن الرصيد من لوحة التحكم.</p>
             <div className="flex flex-col gap-4">
               <Button onClick={() => router.push('/pricing')} className="w-full h-16 rounded-[2rem] bg-primary text-white font-black text-xl shadow-xl">شحن الرصيد الآن</Button>
               <Button variant="ghost" onClick={() => setShowLowBalance(false)} className="text-white/20 font-bold">ربما لاحقاً</Button>
             </div>
          </div>
        </div>
      )}
    </div>
  );
}
