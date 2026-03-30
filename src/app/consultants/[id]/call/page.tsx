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
        const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
        if (videoRef.current) videoRef.current.srcObject = stream;
      } catch (err) {
        toast({ variant: "destructive", title: "بروتوكول الوسائط", description: "يرجى تفعيل الكاميرا والميكروفون." });
      }
    };
    initMedia();
  }, [toast]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSendMessage = async () => {
    if (!chatMessage.trim() || !user || !db || hasViolated) return;

    // 🔥 تفعيل الدرع الواقي (Sovereign Moderation Shield)
    const isViolated = checkSovereignViolation(chatMessage, forbiddenWords || []);
    
    if (isViolated) {
      setHasViolated(true);
      // حظر المستخدم سيادياً فوراً
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

    sendSovereignLiveMessage(db, consultantId, user.uid, user.displayName || "مواطن سيادي", chatMessage);
    setChatMessage("");
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
             <div className="h-48 w-48 rounded-[4rem] glass-cosmic mx-auto flex items-center justify-center border-2 border-primary/20 shadow-3xl">
                <Loader2 className="h-20 w-20 text-primary animate-spin opacity-40" />
             </div>
             <h2 className="text-5xl font-black text-white tracking-tighter">{consultant?.name || "المستشار الخبير"}</h2>
          </div>
          <motion.div 
            drag
            dragConstraints={{ left: -1000, right: 0, top: -600, bottom: 0 }}
            className="absolute bottom-12 right-12 w-72 md:w-[450px] aspect-video rounded-[3rem] overflow-hidden border-2 border-white/10 shadow-3xl glass z-50 cursor-move"
          >
            <video ref={videoRef} autoPlay muted playsInline className="w-full h-full object-cover mirror" />
            {!isVideoOn && <div className="absolute inset-0 bg-slate-900/90 flex items-center justify-center"><VideoOff className="h-16 w-16 text-white/10" /></div>}
          </motion.div>
        </div>

        <div className="h-36 glass-cosmic border-t border-white/5 flex items-center justify-center gap-10 px-12 relative z-[60]">
          <LiveControlBtn active={isMicOn} onClick={() => setIsMicOn(!isMicOn)} icon={isMicOn ? <Mic /> : <MicOff />} color={isMicOn ? 'blue' : 'red'} />
          <LiveControlBtn active={isVideoOn} onClick={() => setIsVideoOn(!isVideoOn)} icon={isVideoOn ? <Video /> : <VideoOff />} color={isVideoOn ? 'blue' : 'red'} />
          <Button variant="destructive" size="icon" className="h-28 w-28 rounded-[3rem] bg-red-600" onClick={() => router.push("/dashboard")}>
            <PhoneOff className="h-12 w-12" />
          </Button>
          <LiveControlBtn active={isSidebarOpen} onClick={() => setIsSidebarOpen(!isSidebarOpen)} icon={<MessageSquare />} color="blue" />
        </div>
      </main>

      <AnimatePresence>
        {isSidebarOpen && (
          <motion.aside initial={{ width: 0 }} animate={{ width: 450 }} exit={{ width: 0 }} className="w-full md:w-[450px] glass-cosmic border-r border-white/5 flex flex-col z-[70]">
            <header className="p-10 border-b border-white/5 flex items-center justify-between bg-white/[0.02]">
              <div className="space-y-1">
                <h3 className="font-black text-3xl text-white">الاتصال الأمن</h3>
                <p className="text-[10px] text-primary font-black uppercase tracking-widest flex items-center gap-2"><Lock className="h-3 w-3" /> Sovereign Encrypted</p>
              </div>
              <Button variant="ghost" size="icon" onClick={() => setIsSidebarOpen(false)} className="h-12 w-12 rounded-2xl"><X /></Button>
            </header>
            <ScrollArea className="flex-grow p-10">
              <div className="space-y-10">
                {messages?.map((m, idx) => (
                  <div key={idx} className={`flex flex-col ${m.senderId === user?.uid ? 'items-start' : 'items-end'}`}>
                    <div className={`p-6 rounded-[2.5rem] max-w-[95%] text-sm leading-relaxed border ${m.senderId === user?.uid ? 'bg-primary border-white/10 text-slate-950 font-bold rounded-tr-none' : 'glass border-white/5 text-white/80 rounded-tl-none'}`}>
                      {m.text}
                    </div>
                  </div>
                ))}
                <div ref={chatEndRef} />
              </div>
            </ScrollArea>
            <div className="p-10 bg-black/60 border-t border-white/5">
              <div className="relative">
                <Input placeholder="أرسل رسالة سيادية..." value={chatMessage} onChange={(e) => setChatMessage(e.target.value)} onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()} className="glass border-white/10 h-20 rounded-[1.8rem] pr-8 pl-20 text-lg" />
                <Button onClick={handleSendMessage} disabled={!chatMessage.trim()} className="absolute left-3 top-1/2 -translate-y-1/2 h-14 w-14 rounded-2xl bg-primary text-slate-950"><Send className="rotate-180" /></Button>
              </div>
            </div>
          </motion.aside>
        )}
      </AnimatePresence>
    </div>
  );
}

function LiveControlBtn({ active, onClick, icon, color }: any) {
  const colors: any = {
    blue: "text-primary border-primary/20 bg-primary/5 hover:bg-primary/10",
    red: "text-red-500 bg-red-500/10 border-red-500/20",
    gray: "text-white/20 border-white/5"
  };
  return (
    <Button variant="outline" size="icon" className={`h-20 w-20 rounded-[2.2rem] glass border-2 transition-all ${colors[color]} ${active ? 'scale-110 border-primary/40' : ''}`} onClick={onClick}>{icon}</Button>
  );
}
