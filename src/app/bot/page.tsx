
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
  Sparkles,
  Wallet,
  Scale,
  MessageSquare,
  Camera,
  Mic,
  XCircle,
  Clock,
  Menu,
  Paperclip,
  History,
  LayoutGrid,
  Image as ImageIcon,
  Zap,
  ChevronLeft
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
  { id: "ai-standard", name: "المستشار الذكي", icon: "🤖", cost: 1, desc: "إجابات سريعة وذكية لكافة التساؤلات" },
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
      // In a real app, integrate Web Speech API here
      setTimeout(() => setIsRecording(false), 3000); 
    }
  };

  return (
    <div className="flex h-[calc(100vh-5rem)] w-full overflow-hidden bg-[#0a0a0a]" dir="rtl">
      
      {/* Sidebar - Pro History & Navigation */}
      <aside className={`transition-all duration-300 ease-in-out border-l border-white/[0.03] bg-[#0d0d0d] flex flex-col relative z-50 ${isSidebarOpen ? 'w-[300px]' : 'w-0 opacity-0 overflow-hidden'}`}>
        <div className="p-4 flex flex-col h-full">
          <Button onClick={startNewSession} className="w-full h-11 rounded-xl bg-white/[0.03] border border-white/[0.05] hover:bg-white/[0.08] gap-3 font-bold text-xs mb-6 shadow-sm">
            <Plus className="h-4 w-4" /> محادثة جديدة
          </Button>
          
          <div className="flex-1 overflow-hidden flex flex-col">
            <div className="flex items-center justify-between px-2 mb-4">
               <p className="text-[9px] text-white/20 font-black uppercase tracking-widest">تاريخ الدردشات</p>
               <History className="h-3 w-3 text-white/10" />
            </div>
            
            <ScrollArea className="flex-1">
              <div className="space-y-1 pr-2">
                {sessions?.map((sess) => (
                  <div
                    key={sess.id}
                    onClick={() => setSessionId(sess.id)}
                    className={`w-full text-right p-3 rounded-xl text-[13px] transition-all truncate flex items-center justify-between group cursor-pointer border ${sessionId === sess.id ? 'bg-primary/5 text-primary border-primary/20 shadow-lg' : 'text-white/40 border-transparent hover:bg-white/[0.02]'}`}
                  >
                    <div className="flex items-center gap-3 truncate">
                      <MessageSquare className={`h-3.5 w-3.5 ${sessionId === sess.id ? 'text-primary' : 'text-white/20'}`} />
                      <span className="truncate">{sess.title}</span>
                    </div>
                    <button onClick={(e) => deleteSession(sess.id, e)} className="opacity-0 group-hover:opacity-100 hover:text-red-500 transition-all p-1">
                      <Trash2 className="h-3 w-3" />
                    </button>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </div>

          <div className="mt-auto pt-6 border-t border-white/[0.03] space-y-4">
             <div className="grid grid-cols-4 gap-2 mb-4">
                <NavIcon icon={<LayoutGrid />} label="المشاريع" />
                <NavIcon icon={<ImageIcon />} label="الصور" />
                <NavIcon icon={<Plus />} label="التطبيقات" />
                <NavIcon icon={<Zap />} label="الترقية" onClick={() => router.push('/pricing')} />
             </div>
             
             <div className="p-4 bg-white/[0.02] border border-white/[0.05] rounded-2xl flex items-center justify-between">
                <div className="text-right">
                   <p className="text-[8px] text-white/30 font-black uppercase">الرصيد الكوني</p>
                   <p className="text-lg font-black text-white">{profile?.balance || 0} <span className="text-[10px] text-primary">EGP</span></p>
                </div>
                <Wallet className="h-5 w-5 text-primary" />
             </div>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col relative bg-[#0a0a0a]">
        <header className="h-14 border-b border-white/[0.03] flex items-center justify-between px-6 bg-[#0a0a0a]/80 backdrop-blur-md z-30">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="rounded-lg hover:bg-white/[0.03]">
              <Menu className="h-4 w-4" />
            </Button>
            <div className="flex items-center gap-3">
               <span className="text-lg">{activeChar.icon}</span>
               <h1 className="text-[13px] font-bold text-white/80">{activeChar.name}</h1>
            </div>
          </div>
          
          <div className="flex gap-1 bg-white/[0.02] p-1 rounded-xl border border-white/[0.05]">
             {CHARACTERS.map(c => (
               <Button 
                key={c.id} 
                variant="ghost" 
                size="sm" 
                className={`h-8 px-3 rounded-lg text-[11px] transition-all font-bold ${activeChar.id === c.id ? 'bg-primary text-white shadow-lg' : 'text-white/30 hover:bg-white/5'}`}
                onClick={() => setActiveChar(c)}
               >
                 <span className="ml-1.5">{c.icon}</span>
                 {c.name}
               </Button>
             ))}
          </div>
        </header>

        <ScrollArea className="flex-1" ref={scrollRef}>
          <div className="max-w-4xl mx-auto p-6 space-y-10 pb-20">
            {messages?.length === 0 && (
              <div className="py-20 text-center space-y-8 animate-in fade-in duration-1000">
                 <div className="inline-flex p-8 rounded-[3rem] bg-white/[0.02] border border-white/[0.05] mb-4">
                    <Sparkles className="h-14 w-14 text-primary animate-pulse" />
                 </div>
                 <h2 className="text-4xl font-black text-white/90 tracking-tighter">أهلاً بك في فضاء العدالة</h2>
                 <p className="text-[15px] text-white/30 max-w-sm mx-auto leading-relaxed">أنا رفيقك القانوني الذكي. اطرح سؤالك لنبدأ التحليل الاحترافي فوراً.</p>
              </div>
            )}
            {messages?.map((msg) => (
              <div key={msg.id} className={`flex gap-6 ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'} animate-in fade-in slide-in-from-bottom-2`}>
                <div className={`h-9 w-9 rounded-xl flex items-center justify-center shrink-0 border ${
                  msg.role === 'bot' ? 'bg-white/[0.03] border-white/[0.05]' : 'bg-primary border-primary/20 text-white shadow-xl'
                }`}>
                  {msg.role === 'bot' ? <Sparkles className="h-4 w-4 text-primary" /> : <User className="h-4 w-4" />}
                </div>
                <div className={`max-w-[85%] space-y-1 ${msg.role === 'user' ? 'text-left' : 'text-right'}`}>
                  <div className={`p-5 rounded-2xl text-[15px] leading-relaxed border transition-all ${
                    msg.role === 'bot' 
                    ? 'bg-white/[0.01] border-white/[0.03] text-white/80 rounded-tr-none whitespace-pre-wrap shadow-inner' 
                    : 'bg-primary/10 border-primary/20 text-white font-medium rounded-tl-none shadow-sm'
                  }`}>
                    {msg.content}
                  </div>
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex gap-6 animate-pulse">
                <div className="h-9 w-9 rounded-xl bg-white/[0.03] border border-white/[0.05]" />
                <div className="bg-white/[0.01] p-5 rounded-xl rounded-tr-none w-24 border border-white/[0.03] flex justify-center gap-1.5 items-center">
                  <div className="w-1.5 h-1.5 bg-primary/40 rounded-full animate-bounce" />
                  <div className="w-1.5 h-1.5 bg-primary/40 rounded-full animate-bounce [animation-delay:0.2s]" />
                  <div className="w-1.5 h-1.5 bg-primary/40 rounded-full animate-bounce [animation-delay:0.4s]" />
                </div>
              </div>
            )}
          </div>
        </ScrollArea>

        {/* Input Area - Camera, Mic, Upload integration */}
        <div className="p-6 bg-[#0a0a0a]/90 backdrop-blur-md border-t border-white/[0.03]">
          <div className="max-w-4xl mx-auto space-y-4">
            <div className="relative flex items-end gap-3 bg-white/[0.02] border border-white/[0.05] rounded-[24px] p-2 focus-within:border-primary/40 transition-all shadow-2xl">
              
              <div className="flex flex-col flex-1">
                 <textarea 
                  placeholder={`اطرح سؤالك على ${activeChar.name}...`} 
                  className="w-full bg-transparent border-none focus:ring-0 text-[16px] text-right p-4 min-h-[56px] max-h-40 resize-none text-white/90 placeholder:text-white/10"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleSend();
                    }
                  }}
                 />
                 
                 <div className="flex items-center justify-between p-2 mt-2">
                    <div className="flex items-center gap-1">
                       <Button variant="ghost" size="icon" onClick={() => fileInputRef.current?.click()} className="h-9 w-9 rounded-lg text-white/20 hover:text-primary hover:bg-white/[0.03]" title="رفع ملف">
                          <Paperclip className="h-4 w-4" />
                       </Button>
                       <Button variant="ghost" size="icon" onClick={toggleCamera} className="h-9 w-9 rounded-lg text-white/20 hover:text-primary hover:bg-white/[0.03]" title="كاميرا">
                          <Camera className="h-4 w-4" />
                       </Button>
                       <Button variant="ghost" size="icon" onClick={handleVoiceTyping} className={`h-9 w-9 rounded-lg transition-all ${isRecording ? 'bg-red-500 text-white animate-pulse' : 'text-white/20 hover:text-primary hover:bg-white/[0.03]'}`} title="تحدث">
                          <Mic className="h-4 w-4" />
                       </Button>
                       <input type="file" ref={fileInputRef} className="hidden" />
                    </div>

                    <div className="flex items-center gap-6">
                       <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-white/20">
                          <Clock className="h-3.5 w-3.5" /> تكلفة الرد: {activeChar.cost} EGP
                       </div>
                       <Button 
                        onClick={handleSend} 
                        disabled={isLoading || !input.trim()}
                        className={`h-10 px-6 rounded-xl transition-all ${
                          input.trim() ? 'bg-primary text-white shadow-xl' : 'bg-white/[0.03] text-white/10'
                        }`}
                       >
                         {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4 rotate-180" />}
                       </Button>
                    </div>
                 </div>
              </div>
            </div>
            
            <p className="text-center text-[10px] text-white/10 font-medium">كافة الاستشارات لأغراض استرشادية، يرجى مراجعة محامي مختص.</p>
          </div>
        </div>
      </main>

      {/* Camera Dialog */}
      <Dialog open={isCameraOpen} onOpenChange={setIsCameraOpen}>
        <DialogContent className="bg-[#0d0d0d] border-white/10 p-6 rounded-[32px] max-w-2xl">
          <DialogHeader>
            <DialogTitle className="text-center font-bold text-lg">التقاط مستند أو صورة</DialogTitle>
          </DialogHeader>
          <div className="relative aspect-video rounded-2xl overflow-hidden bg-black border border-white/5 shadow-2xl">
            <video ref={videoRef} autoPlay muted playsInline className="w-full h-full object-cover mirror" />
            <div className="absolute bottom-6 left-1/2 -translate-x-1/2">
               <Button onClick={toggleCamera} className="h-16 w-16 rounded-full bg-primary text-white shadow-2xl hover:scale-105 transition-all">
                  <Camera className="h-8 w-8" />
               </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Low Balance Guard */}
      {showLowBalance && (
        <div className="absolute inset-0 z-[100] bg-black/80 backdrop-blur-xl flex items-center justify-center p-6">
          <div className="bg-[#0d0d0d] p-12 rounded-[40px] text-center max-w-sm border border-white/[0.05] shadow-2xl animate-in zoom-in">
             <XCircle className="h-16 w-16 text-red-500 mx-auto mb-6" />
             <h2 className="text-2xl font-black text-white mb-4">نفذ رصيدك المتاح</h2>
             <p className="text-white/40 text-[13px] mb-8 leading-relaxed">للاستمرار في طرح الأسئلة والحصول على استشارات، يرجى شحن الرصيد من لوحة التحكم.</p>
             <div className="flex flex-col gap-3">
               <Button onClick={() => router.push('/pricing')} className="w-full h-14 rounded-2xl bg-primary text-white font-black text-lg shadow-xl">شحن الرصيد الآن</Button>
               <Button variant="ghost" onClick={() => setShowLowBalance(false)} className="text-white/20 font-bold">ربما لاحقاً</Button>
             </div>
          </div>
        </div>
      )}
    </div>
  );
}

function NavIcon({ icon, label, onClick }: { icon: React.ReactNode; label: string; onClick?: () => void }) {
  return (
    <button onClick={onClick} className="flex flex-col items-center gap-1.5 p-2 rounded-xl hover:bg-white/[0.03] transition-all group">
       <div className="h-10 w-10 rounded-xl bg-white/[0.02] border border-white/[0.05] flex items-center justify-center text-white/20 group-hover:text-primary group-hover:border-primary/20 group-hover:bg-primary/5 transition-all">
          {icon}
       </div>
       <span className="text-[10px] text-white/20 font-bold uppercase tracking-widest">{label}</span>
    </button>
  );
}
