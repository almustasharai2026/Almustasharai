"use client";

import { useState, useRef, useEffect, use } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  Mic, MicOff, Video, VideoOff, PhoneOff, Settings, 
  MessageSquare, Send, X, 
  Lock, AlertTriangle, Loader2, Activity
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useToast } from "@/hooks/use-toast";
import { useUser, useFirestore, useDoc, useCollection } from "@/firebase";
import { doc, collection, query, orderBy, limit, updateDoc, setDoc } from "firebase/firestore";
import { useMemoFirebase } from "@/firebase/provider";
import { motion, AnimatePresence } from "framer-motion";
import { sendSovereignLiveMessage } from "@/lib/sovereign-live-chat";

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

  // جلب بيانات المستشار
  const consultantRef = useMemoFirebase(() => {
    if (!db || !consultantId) return null;
    return doc(db, "consultants", consultantId);
  }, [db, consultantId]);
  const { data: consultant } = useDoc(consultantRef);

  // جلب كلمات الرقابة اللحظية
  const wordsQuery = useMemoFirebase(() => {
    if (!db) return null;
    return collection(db, "system", "moderation", "forbiddenWords");
  }, [db]);
  const { data: forbiddenWords } = useCollection(wordsQuery);

  // جلب الرسائل اللحظية (مزامنة سيادية)
  const messagesQuery = useMemoFirebase(() => {
    if (!db || !consultantId) return null;
    return query(
      collection(db, "liveConsultations", consultantId, "messages"), 
      orderBy("timestamp", "asc"), 
      limit(100)
    );
  }, [db, consultantId]);
  const { data: messages } = useCollection(messagesQuery);

  // مراقبة حالة حظر المستخدم
  const userRef = useMemoFirebase(() => user ? doc(db!, "users", user.uid) : null, [db, user]);
  const { data: currentUserProfile } = useDoc(userRef as any);

  useEffect(() => {
    if (currentUserProfile?.isBanned) {
      router.push("/");
      toast({ variant: "destructive", title: "دخول مرفوض", description: "تم تقييد وصولك للنظام السيادي." });
    }
  }, [currentUserProfile, router, toast]);

  useEffect(() => {
    const initMedia = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
        if (videoRef.current) videoRef.current.srcObject = stream;
      } catch (err) {
        toast({ variant: "destructive", title: "بروتوكول الوسائط", description: "يرجى تفعيل الكاميرا والميكروفون للمتابعة." });
      }
    };
    initMedia();
  }, [toast]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSendMessage = () => {
    if (!chatMessage.trim() || !user || !db || hasViolated) return;

    // الدرع الواقي (Sovereign Moderation Shield)
    const violation = forbiddenWords?.find(fw => chatMessage.toLowerCase().includes(String(fw.word).toLowerCase()));
    
    if (violation) {
      setHasViolated(true);
      updateDoc(doc(db, "users", user.uid), { isBanned: true });
      toast({ variant: "destructive", title: "انتهاك سيادي!", description: "تم حظر الحساب فوراً لمخالفة بروتوكول الأمان." });
      setTimeout(() => router.push("/"), 3000);
      return;
    }

    // إرسال الرسالة السيادية (Non-blocking)
    sendSovereignLiveMessage(
      db, 
      consultantId, 
      user.uid, 
      user.displayName || "مواطن سيادي", 
      chatMessage
    );
    
    setChatMessage("");
  };

  if (hasViolated) {
    return (
      <div className="fixed inset-0 bg-red-950/90 backdrop-blur-3xl z-[300] flex flex-col items-center justify-center text-center p-10">
         <AlertTriangle className="h-32 w-32 text-red-500 mb-8 animate-bounce" />
         <h1 className="text-5xl font-black text-white mb-4">تم إنهاء الجلسة سيادياً</h1>
         <p className="text-xl text-red-200 font-bold max-w-lg">خالفت بروتوكولات الأمان. تم تجميد الحساب نهائياً.</p>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-[#050505] z-[200] flex flex-col md:flex-row overflow-hidden font-sans" dir="rtl">
      
      <main className="flex-grow relative flex flex-col">
        {/* منطقة البث المباشر */}
        <div className="flex-grow flex items-center justify-center bg-[#080808] relative group">
          <div className="text-center space-y-10 animate-in fade-in duration-1000">
             <div className="h-48 w-48 rounded-[4rem] glass-cosmic mx-auto flex items-center justify-center border-2 border-primary/20 relative shadow-3xl">
                <Loader2 className="h-20 w-20 text-primary animate-spin opacity-40" />
                <div className="absolute inset-0 bg-primary/5 rounded-[4rem] animate-pulse" />
             </div>
             <div className="space-y-4">
                <h2 className="text-5xl font-black text-white tracking-tighter">{consultant?.name || "المستشار الخبير"}</h2>
                <div className="flex items-center justify-center gap-4">
                   <div className="h-2.5 w-2.5 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_15px_rgba(16,185,129,0.5)]" />
                   <p className="text-emerald-500 text-sm font-black uppercase tracking-[0.3em]">Connecting to Secure Server...</p>
                </div>
             </div>
          </div>

          {/* معاينة الكاميرا الخاصة (قابلة للسحب) */}
          <motion.div 
            drag
            dragConstraints={{ left: -1000, right: 0, top: -600, bottom: 0 }}
            className="absolute bottom-12 right-12 w-72 md:w-[450px] aspect-video rounded-[3rem] overflow-hidden border-2 border-white/10 shadow-[0_40px_120px_rgba(0,0,0,0.9)] glass z-50 cursor-move"
          >
            <video ref={videoRef} autoPlay muted playsInline className="w-full h-full object-cover mirror" />
            {!isVideoOn && <div className="absolute inset-0 bg-slate-900/90 backdrop-blur-xl flex items-center justify-center"><VideoOff className="h-16 w-16 text-white/10" /></div>}
            <div className="absolute bottom-8 left-8 bg-black/60 backdrop-blur-xl px-6 py-2 rounded-full text-[10px] font-black text-white/80 border border-white/10 flex items-center gap-3">
               <div className="h-2 w-2 rounded-full bg-primary animate-pulse" /> بث مباشر سيادي
            </div>
          </motion.div>
        </div>

        {/* شريط التحكم السفلي */}
        <div className="h-36 glass-cosmic border-t border-white/5 flex items-center justify-center gap-10 px-12 relative z-[60]">
          <LiveControlBtn active={isMicOn} onClick={() => setIsMicOn(!isMicOn)} icon={isMicOn ? <Mic className="h-6 w-6" /> : <MicOff className="h-6 w-6" />} color={isMicOn ? 'blue' : 'red'} />
          <LiveControlBtn active={isVideoOn} onClick={() => setIsVideoOn(!isVideoOn)} icon={isVideoOn ? <Video className="h-6 w-6" /> : <VideoOff className="h-6 w-6" />} color={isVideoOn ? 'blue' : 'red'} />
          
          <Button 
            variant="destructive" 
            size="icon" 
            className="h-28 w-28 rounded-[3rem] bg-red-600 hover:bg-red-700 shadow-[0_0_60px_rgba(220,38,38,0.4)] transition-all active:scale-90" 
            onClick={() => router.push("/dashboard")}
          >
            <PhoneOff className="h-12 w-12 text-white" />
          </Button>

          <LiveControlBtn active={isSidebarOpen} onClick={() => setIsSidebarOpen(!isSidebarOpen)} icon={<MessageSquare className="h-6 w-6" />} color="blue" />
          <LiveControlBtn active={false} onClick={() => {}} icon={<Settings className="h-6 w-6" />} color="gray" />
        </div>
      </main>

      {/* شريط الدردشة اللحظي */}
      <AnimatePresence>
        {isSidebarOpen && (
          <motion.aside 
            initial={{ width: 0, opacity: 0 }}
            animate={{ width: 450, opacity: 1 }}
            exit={{ width: 0, opacity: 0 }}
            className="w-full md:w-[450px] glass-cosmic border-r border-white/5 flex flex-col z-[70] shadow-3xl"
          >
            <header className="p-10 border-b border-white/5 flex items-center justify-between bg-white/[0.02]">
              <div className="space-y-1">
                <h3 className="font-black text-3xl text-white tracking-tighter">الاتصال الأمن</h3>
                <p className="text-[10px] text-primary font-black uppercase tracking-widest flex items-center gap-2"><Lock className="h-3 w-3" /> Encrypted Link Active</p>
              </div>
              <Button variant="ghost" size="icon" onClick={() => setIsSidebarOpen(false)} className="h-12 w-12 rounded-2xl text-white/20 hover:text-white hover:bg-white/5">
                <X className="h-6 w-6" />
              </Button>
            </header>

            <ScrollArea className="flex-grow p-10">
              <div className="space-y-10">
                {messages?.map((m, idx) => (
                  <div key={idx} className={`flex flex-col ${m.senderId === user?.uid ? 'items-start' : 'items-end'}`}>
                    <div className="flex items-center gap-3 mb-3">
                       {m.senderId === user?.uid ? null : <span className="text-[10px] font-black text-white/20 uppercase">{m.senderName}</span>}
                    </div>
                    <div className={`p-6 rounded-[2.5rem] max-w-[95%] text-sm leading-relaxed shadow-2xl border transition-all ${m.senderId === user?.uid ? 'bg-primary border-white/10 text-slate-950 font-bold rounded-tr-none' : 'glass border-white/5 text-white/80 rounded-tl-none'}`}>
                      {m.text}
                    </div>
                    <div className="mt-2 px-4 text-[9px] text-white/10 font-bold uppercase tracking-widest">
                       {m.timestamp?.toDate ? m.timestamp.toDate().toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' }) : 'Transmitting...'}
                    </div>
                  </div>
                ))}
                <div ref={chatEndRef} />
              </div>
            </ScrollArea>

            <div className="p-10 bg-black/60 backdrop-blur-3xl border-t border-white/5">
              <div className="relative group">
                <Input 
                  placeholder="أرسل رسالة سيادية..." 
                  value={chatMessage}
                  onChange={(e) => setChatMessage(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                  className="glass border-white/10 h-20 rounded-[1.8rem] pr-8 pl-20 text-lg font-medium text-white placeholder:text-white/10 shadow-inner focus:border-primary/30 transition-all"
                />
                <Button 
                  onClick={handleSendMessage} 
                  disabled={!chatMessage.trim()}
                  className="absolute left-3 top-1/2 -translate-y-1/2 h-14 w-14 rounded-2xl bg-primary text-slate-950 shadow-2xl hover:scale-105 active:scale-95 transition-all"
                >
                   <Send className="h-6 w-6 rotate-180" />
                </Button>
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
    blue: "text-primary border-primary/20 hover:bg-primary/5 hover:border-primary/40 shadow-[0_0_30px_rgba(99,102,241,0.1)]",
    red: "text-red-500 bg-red-500/10 border-red-500/20 hover:bg-red-500/20 shadow-[0_0_30px_rgba(239,68,68,0.1)]",
    gray: "text-white/20 hover:text-white border-white/5 hover:bg-white/5"
  };
  
  return (
    <Button 
      variant="outline" 
      size="icon" 
      className={`h-20 w-20 rounded-[2.2rem] glass border-2 transition-all duration-500 ${colors[color]} ${active ? 'scale-110 border-primary/40' : ''}`} 
      onClick={onClick}
    >
      {icon}
    </Button>
  );
}
