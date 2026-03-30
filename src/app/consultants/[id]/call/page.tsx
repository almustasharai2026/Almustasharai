"use client";

import { useState, useRef, useEffect, use } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  Mic, MicOff, Video, VideoOff, PhoneOff, Settings, 
  MessageSquare, Send, X, Lock, AlertTriangle, Loader2
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useToast } from "@/hooks/use-toast";
import { useUser, useFirestore, useDoc, useCollection } from "@/firebase";
import { doc, collection, query, orderBy, limit, updateDoc } from "firebase/firestore";
import { useMemoFirebase } from "@/firebase/provider";
import { motion, AnimatePresence } from "framer-motion";
import { sendSovereignLiveMessage } from "@/lib/sovereign-live-chat";
import { checkSovereignViolation } from "@/lib/sovereign-moderation";
import { getSovereignQuickReply } from "@/lib/sovereign-ai";

export default function ProfessionalLiveRoom({ params }: { params: Promise<{ id: string }> }) {
  const { id: consultantId } = use(params);
  const { user } = useUser();
  const db = useFirestore();
  const router = useRouter();
  const { toast } = useToast();

  const [isMicOn, setIsMicOn] = useState(true);
  const [isVideoOn, setIsVideoOn] = useState(true);
  const [chatMessage, setChatMessage] = useState("");
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [hasViolated, setHasViolated] = useState(false);
  const [stream, setStream] = useState<MediaStream | null>(null);

  const videoRef = useRef<HTMLVideoElement>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);

  const consultantRef = useMemoFirebase(() => db ? doc(db, "consultants", consultantId) : null, [db, consultantId]);
  const { data: consultant } = useDoc(consultantRef);

  const wordsQuery = useMemoFirebase(() => db ? collection(db, "system", "moderation", "forbiddenWords") : null, [db]);
  const { data: forbiddenWords } = useCollection(wordsQuery);

  const messagesQuery = useMemoFirebase(() => {
    if (!db || !consultantId) return null;
    return query(collection(db, "liveConsultations", consultantId, "messages"), orderBy("timestamp", "asc"), limit(100));
  }, [db, consultantId]);
  const { data: messages } = useCollection(messagesQuery);

  useEffect(() => {
    const initMedia = async () => {
      try {
        const mediaStream = await navigator.mediaDevices.getUserMedia({ 
          video: true, 
          audio: true 
        });
        setStream(mediaStream);
        if (videoRef.current) {
          videoRef.current.srcObject = mediaStream;
        }
      } catch (err) {
        console.error("Media protocol failed:", err);
        toast({ 
          variant: "destructive", 
          title: "بروتوكول الوسائط معطل", 
          description: "يرجى منح صلاحيات الكاميرا والميكروفون لتفعيل الاتصال السيادي." 
        });
      }
    };
    initMedia();

    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, [toast]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    if (stream) {
      stream.getVideoTracks().forEach(track => track.enabled = isVideoOn);
      stream.getAudioTracks().forEach(track => track.enabled = isMicOn);
    }
  }, [isVideoOn, isMicOn, stream]);

  const handleSendMessage = async () => {
    if (!chatMessage.trim() || !user || !db || hasViolated) return;

    // 🔥 تفعيل الدرع الواقي (Sovereign Moderation Shield)
    const isViolated = checkSovereignViolation(chatMessage, forbiddenWords || []);
    
    if (isViolated) {
      setHasViolated(true);
      if (stream) stream.getTracks().forEach(t => t.stop());
      
      await updateDoc(doc(db, "users", user.uid), { isBanned: true });
      toast({ 
        variant: "destructive", 
        title: "انتهاك سيادي مكتشف! 🚫", 
        description: "تم إنهاء الجلسة وحظر الحساب لمخالفة بروتوكول الأمان والكلمات المحظورة." 
      });
      setChatMessage("");
      setTimeout(() => router.push("/"), 3000);
      return;
    }

    const currentInput = chatMessage;
    setChatMessage("");

    // 1. إرسال رسالة المواطن
    sendSovereignLiveMessage(db, consultantId, user.uid, user.displayName || "مواطن سيادي", currentInput);

    // 2. تفعيل المساعد الذكي السيادي (AI Autopilot)
    const aiReply = await getSovereignQuickReply(currentInput);
    if (aiReply) {
      // إرسال رد المحرك السيادي بصفة مساعد (Assistant)
      sendSovereignLiveMessage(db, consultantId, "assistant", "المستشار AI", aiReply);
    }
  };

  if (hasViolated) {
    return (
      <div className="fixed inset-0 bg-red-950/90 backdrop-blur-3xl z-[300] flex flex-col items-center justify-center text-center p-10">
         <AlertTriangle className="h-32 w-32 text-red-500 mb-8 animate-bounce" />
         <h1 className="text-5xl font-black text-white mb-4">تم إنهاء الجلسة سيادياً</h1>
         <p className="text-xl text-red-200 font-bold max-w-lg">خالفت بروتوكولات الأمان والكلمات المحظورة. تم تجميد الحساب نهائياً.</p>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-[#050505] z-[200] flex flex-col md:flex-row overflow-hidden font-sans" dir="rtl">
      <main className="flex-grow relative flex flex-col">
        <div className="flex-grow flex items-center justify-center bg-[#080808] relative group">
          <div className="text-center space-y-10 animate-in fade-in duration-1000">
             <div className="h-48 w-48 rounded-[4rem] glass-cosmic mx-auto flex items-center justify-center border-2 border-primary/20 shadow-3xl overflow-hidden relative">
                <Loader2 className="h-20 w-20 text-primary animate-spin opacity-40" />
                <div className="absolute inset-0 bg-gradient-to-t from-primary/20 to-transparent" />
             </div>
             <div className="space-y-2">
                <h2 className="text-5xl font-black text-white tracking-tighter">{consultant?.name || "المستشار الخبير"}</h2>
                <p className="text-primary font-black text-xs uppercase tracking-[0.3em] opacity-60">جاري انتظار انضمام الخبير للغرفة...</p>
             </div>
          </div>

          <motion.div 
            drag
            dragConstraints={{ left: -1000, right: 0, top: -600, bottom: 0 }}
            className="absolute bottom-12 right-12 w-72 md:w-[450px] aspect-video rounded-[3rem] overflow-hidden border-2 border-white/10 shadow-3xl glass z-50 cursor-move group/local"
          >
            <video 
              ref={videoRef} 
              autoPlay 
              muted 
              playsInline 
              className={`w-full h-full object-cover mirror transition-opacity duration-500 ${isVideoOn ? 'opacity-100' : 'opacity-0'}`} 
            />
            {!isVideoOn && (
              <div className="absolute inset-0 bg-slate-950 flex flex-col items-center justify-center gap-4">
                <div className="h-20 w-20 rounded-full bg-white/5 flex items-center justify-center border border-white/10">
                  <VideoOff className="h-10 w-10 text-white/20" />
                </div>
                <p className="text-[10px] font-black text-white/20 uppercase tracking-widest">الكاميرا مغلقة سيادياً</p>
              </div>
            )}
            <div className="absolute top-6 left-6 flex items-center gap-2 px-3 py-1 rounded-full bg-black/40 backdrop-blur-md border border-white/5">
               <div className={`h-1.5 w-1.5 rounded-full ${isMicOn ? 'bg-emerald-500' : 'bg-red-500'}`} />
               <span className="text-[8px] font-black text-white/60 uppercase">Local Citizen</span>
            </div>
          </motion.div>
        </div>

        <div className="h-36 glass-cosmic border-t border-white/5 flex items-center justify-center gap-6 md:gap-10 px-6 md:px-12 relative z-[60]">
          <LiveControlBtn 
            active={isMicOn} 
            onClick={() => setIsMicOn(!isMicOn)} 
            icon={isMicOn ? <Mic /> : <MicOff />} 
            color={isMicOn ? 'blue' : 'red'} 
            label={isMicOn ? "الصوت مفعل" : "الصوت مكتوم"}
          />
          <LiveControlBtn 
            active={isVideoOn} 
            onClick={() => setIsVideoOn(!isVideoOn)} 
            icon={isVideoOn ? <Video /> : <VideoOff />} 
            color={isVideoOn ? 'blue' : 'red'}
            label={isVideoOn ? "الكاميرا مفعلة" : "الكاميرا مغلقة"}
          />
          <Button variant="destructive" size="icon" className="h-24 w-24 md:h-28 md:w-28 rounded-[3rem] bg-red-600 hover:bg-red-700 shadow-2xl shadow-red-600/30 transition-all hover:scale-110 active:scale-90" onClick={() => router.push("/dashboard")}>
            <PhoneOff className="h-10 w-10 md:h-12 md:w-12" />
          </Button>
          <LiveControlBtn 
            active={isSidebarOpen} 
            onClick={() => setIsSidebarOpen(!isSidebarOpen)} 
            icon={<MessageSquare />} 
            color="blue" 
            label="الدردشة المشفرة"
          />
          <Button variant="outline" size="icon" className="h-16 w-16 md:h-20 md:w-20 rounded-[2.2rem] glass text-white/20 hover:text-white border-white/5">
            <Settings className="h-6 w-6" />
          </Button>
        </div>
      </main>

      <AnimatePresence>
        {isSidebarOpen && (
          <motion.aside 
            initial={{ width: 0, opacity: 0 }} 
            animate={{ width: 450, opacity: 1 }} 
            exit={{ width: 0, opacity: 0 }} 
            className="w-full md:w-[450px] glass-cosmic border-r border-white/5 flex flex-col z-[70]"
          >
            <header className="p-10 border-b border-white/5 flex items-center justify-between bg-white/[0.02]">
              <div className="space-y-1">
                <h3 className="font-black text-3xl text-white">الاتصال الأمن</h3>
                <p className="text-[10px] text-primary font-black uppercase tracking-widest flex items-center gap-2">
                  <Lock className="h-3 w-3" /> Sovereign Encrypted End-to-End
                </p>
              </div>
              <Button variant="ghost" size="icon" onClick={() => setIsSidebarOpen(false)} className="h-12 w-12 rounded-2xl hover:bg-white/5 text-white/20"><X /></Button>
            </header>
            
            <ScrollArea className="flex-grow p-10">
              <div className="space-y-10">
                {messages?.map((m, idx) => (
                  <div key={idx} className={`flex flex-col ${m.senderId === user?.uid ? 'items-start' : 'items-end'}`}>
                    <div className="flex items-center gap-3 mb-2 px-4">
                       <span className={`text-[9px] font-black uppercase tracking-widest ${m.senderId === 'assistant' ? 'text-primary' : 'text-white/20'}`}>
                         {m.senderName}
                       </span>
                    </div>
                    <div className={`p-6 rounded-[2.5rem] max-w-[95%] text-sm leading-relaxed border shadow-xl ${
                      m.senderId === user?.uid 
                        ? 'bg-primary border-white/10 text-slate-950 font-bold rounded-tr-none' 
                        : m.senderId === 'assistant'
                        ? 'bg-indigo-600/20 border-primary/20 text-white rounded-tl-none italic'
                        : 'glass border-white/5 text-white/80 rounded-tl-none'
                    }`}>
                      {m.text}
                    </div>
                  </div>
                ))}
                <div ref={chatEndRef} />
              </div>
            </ScrollArea>

            <div className="p-10 bg-black/60 border-t border-white/5">
              <div className="relative">
                <Input 
                  placeholder="أرسل رسالة سيادية..." 
                  value={chatMessage} 
                  onChange={(e) => setChatMessage(e.target.value)} 
                  onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()} 
                  className="glass border-white/10 h-20 rounded-[1.8rem] pr-8 pl-20 text-lg focus:ring-primary/20" 
                />
                <Button 
                  onClick={handleSendMessage} 
                  disabled={!chatMessage.trim()} 
                  className="absolute left-3 top-1/2 -translate-y-1/2 h-14 w-14 rounded-2xl bg-primary text-slate-950 hover:bg-indigo-400 transition-colors shadow-lg"
                >
                  <Send className="rotate-180 h-6 w-6" />
                </Button>
              </div>
            </div>
          </motion.aside>
        )}
      </AnimatePresence>
    </div>
  );
}

function LiveControlBtn({ active, onClick, icon, color, label }: any) {
  const colors: any = {
    blue: "text-primary border-primary/20 bg-primary/5 hover:bg-primary/10",
    red: "text-red-500 bg-red-500/10 border-red-500/20 hover:bg-red-500/20",
    gray: "text-white/20 border-white/5"
  };
  return (
    <div className="flex flex-col items-center gap-3 group">
      <Button 
        variant="outline" 
        size="icon" 
        className={`h-16 w-16 md:h-20 md:w-20 rounded-[2.2rem] glass border-2 transition-all duration-500 ${colors[color]} ${active ? 'scale-110 border-primary/40 shadow-[0_0_30px_rgba(99,102,241,0.2)]' : 'opacity-40'}`} 
        onClick={onClick}
      >
        <div className="scale-125">{icon}</div>
      </Button>
      <span className="text-[8px] font-black text-white/20 uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-opacity">{label}</span>
    </div>
  );
}
