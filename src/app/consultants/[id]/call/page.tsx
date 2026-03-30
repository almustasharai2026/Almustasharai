
"use client";

import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  Mic, MicOff, Video, VideoOff, PhoneOff, Settings, 
  MessageSquare, Send, X, 
  Lock, AlertTriangle, Loader2, Activity
} from "lucide-react";
import { useRouter, useParams } from "next/navigation";
import { useToast } from "@/hooks/use-toast";
import { useUser, useFirestore, useDoc, useCollection } from "@/firebase";
import { doc, addDoc, collection, query, orderBy, limit, updateDoc, setDoc } from "firebase/firestore";
import { useMemoFirebase } from "@/firebase/provider";
import { motion, AnimatePresence } from "framer-motion";

export default function ProfessionalLiveRoom() {
  const params = useParams();
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

  // Corrected collection name to match rules and backend schema
  const consultantRef = useMemoFirebase(() => {
    if (!db || !params.id) return null;
    return doc(db, "consultants", params.id as string);
  }, [db, params.id]);
  const { data: consultant } = useDoc(consultantRef);

  const wordsQuery = useMemoFirebase(() => {
    if (!db) return null;
    return collection(db, "system", "moderation", "forbiddenWords");
  }, [db]);
  const { data: forbiddenWords } = useCollection(wordsQuery);

  const messagesQuery = useMemoFirebase(() => {
    if (!db || !params.id) return null;
    return query(
      collection(db, "liveConsultations", params.id as string, "messages"), 
      orderBy("timestamp", "asc"), 
      limit(100)
    );
  }, [db, params.id]);
  const { data: messages } = useCollection(messagesQuery);

  const userRef = useMemoFirebase(() => user ? doc(db!, "users", user.uid) : null, [db, user]);
  const { data: currentUser } = useDoc(userRef as any);

  useEffect(() => {
    if (currentUser?.isBanned) {
      router.push("/");
      toast({ variant: "destructive", title: "حساب محظور", description: "تم حظر دخولك للنظام لمخالفة القوانين." });
    }
  }, [currentUser, router, toast]);

  useEffect(() => {
    const initMedia = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
        if (videoRef.current) videoRef.current.srcObject = stream;
      } catch (err) {
        toast({ variant: "destructive", title: "خطأ في الوسائط", description: "يرجى تفعيل الكاميرا والميكروفون." });
      }
    };
    initMedia();
  }, [toast]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSendMessage = async () => {
    if (!chatMessage.trim() || !user || !db || hasViolated) return;

    const violation = forbiddenWords?.find(fw => chatMessage.toLowerCase().includes(String(fw.word).toLowerCase()));
    
    if (violation) {
      setHasViolated(true);
      updateDoc(doc(db, "users", user.uid), { isBanned: true });
      setDoc(doc(db, "liveConsultations", params.id as string), { status: "terminated" }, { merge: true });
      toast({ variant: "destructive", title: "انتهاك سيادي!", description: "لقد استخدمت كلمات محظورة. تم حظر حسابك فوراً." });
      setTimeout(() => router.push("/"), 3000);
      return;
    }

    addDoc(collection(db, "liveConsultations", params.id as string, "messages"), {
      text: chatMessage,
      senderId: user.uid,
      senderName: user.displayName || "عميل",
      timestamp: new Date().toISOString(),
      role: "user"
    });
    setChatMessage("");
  };

  if (hasViolated) {
    return (
      <div className="fixed inset-0 bg-red-950/90 backdrop-blur-3xl z-[300] flex flex-col items-center justify-center text-center p-10">
         <AlertTriangle className="h-32 w-32 text-red-500 mb-8 animate-bounce" />
         <h1 className="text-5xl font-black text-white mb-4">تم إنهاء الجلسة فوراً</h1>
         <p className="text-xl text-red-200 font-bold max-w-lg">لقد خالفت بروتوكولات الأمان السيادية للمنصة. تم تجميد حسابك وإرسال التقرير للإدارة.</p>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-[#050505] z-[200] flex flex-col md:flex-row overflow-hidden" dir="rtl">
      <main className="flex-grow relative flex flex-col">
        <div className="flex-grow flex items-center justify-center bg-[#080808] relative group">
          <div className="text-center space-y-10 animate-in fade-in duration-1000">
             <div className="h-40 w-40 rounded-[3.5rem] glass-cosmic mx-auto flex items-center justify-center border-2 border-primary/20 relative">
                <Loader2 className="h-16 w-16 text-primary animate-spin" />
             </div>
             <div className="space-y-3">
                <h2 className="text-4xl font-black text-white tracking-tighter">{consultant?.name || "المستشار الخبير"}</h2>
                <div className="flex items-center justify-center gap-3">
                   <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                   <p className="text-emerald-500 text-sm font-black uppercase tracking-widest">في انتظار الاتصال...</p>
                </div>
             </div>
          </div>

          <motion.div 
            drag
            dragConstraints={{ left: -1000, right: 0, top: -600, bottom: 0 }}
            className="absolute bottom-10 right-10 w-64 md:w-96 aspect-video rounded-[3rem] overflow-hidden border-2 border-white/10 shadow-[0_30px_100px_rgba(0,0,0,0.8)] glass z-50 cursor-move"
          >
            <video ref={videoRef} autoPlay muted playsInline className="w-full h-full object-cover mirror" />
            {!isVideoOn && <div className="absolute inset-0 bg-slate-900 flex items-center justify-center"><VideoOff className="h-10 w-10 text-white/10" /></div>}
            <div className="absolute bottom-6 left-6 bg-black/60 backdrop-blur-xl px-4 py-1.5 rounded-full text-[10px] font-black text-white/80 border border-white/10 flex items-center gap-2">
               <div className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse" /> أنت (بث مباشر)
            </div>
          </motion.div>
        </div>

        <div className="h-32 glass-cosmic border-t border-white/5 flex items-center justify-center gap-8 px-10 relative z-[60]">
          <LiveControlBtn active={isMicOn} onClick={() => setIsMicOn(!isMicOn)} icon={isMicOn ? <Mic /> : <MicOff />} color={isMicOn ? 'blue' : 'red'} />
          <LiveControlBtn active={isVideoOn} onClick={() => setIsVideoOn(!isVideoOn)} icon={isVideoOn ? <Video /> : <VideoOff />} color={isVideoOn ? 'blue' : 'red'} />
          
          <Button 
            variant="destructive" 
            size="icon" 
            className="h-24 w-24 rounded-[2.5rem] bg-red-600 hover:bg-red-700 shadow-2xl" 
            onClick={() => router.push("/dashboard")}
          >
            <PhoneOff className="h-10 w-10 text-white" />
          </Button>

          <LiveControlBtn active={isSidebarOpen} onClick={() => setIsSidebarOpen(!isSidebarOpen)} icon={<MessageSquare />} color="blue" />
          <LiveControlBtn active={false} onClick={() => {}} icon={<Settings />} color="gray" />
        </div>
      </main>

      <AnimatePresence>
        {isSidebarOpen && (
          <motion.aside 
            initial={{ width: 0, opacity: 0 }}
            animate={{ width: 400, opacity: 1 }}
            exit={{ width: 0, opacity: 0 }}
            className="w-full md:w-[400px] glass-cosmic border-r border-white/5 flex flex-col z-[70]"
          >
            <header className="p-8 border-b border-white/5 flex items-center justify-between">
              <h3 className="font-black text-2xl text-white">الدردشة الأمنية</h3>
              <Button variant="ghost" size="icon" onClick={() => setIsSidebarOpen(false)} className="text-white/20 hover:text-white">
                <X className="h-5 w-5" />
              </Button>
            </header>

            <ScrollArea className="flex-grow p-8">
              <div className="space-y-8">
                {messages?.map((m, idx) => (
                  <div key={idx} className={`flex flex-col ${m.senderId === user?.uid ? 'items-start' : 'items-end'}`}>
                    <div className={`p-5 rounded-[2rem] max-w-[90%] text-sm leading-relaxed shadow-xl border ${m.senderId === user?.uid ? 'bg-primary border-white/10 text-slate-950 font-bold rounded-tr-none' : 'glass border-white/5 text-white/80 rounded-tl-none'}`}>
                      {m.text}
                    </div>
                  </div>
                ))}
                <div ref={chatEndRef} />
              </div>
            </ScrollArea>

            <div className="p-8 bg-black/40 backdrop-blur-3xl border-t border-white/5">
              <div className="relative group">
                <Input 
                  placeholder="رسالة سيادية..." 
                  value={chatMessage}
                  onChange={(e) => setChatMessage(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                  className="glass border-white/10 h-16 rounded-2xl pr-6 pl-16"
                />
                <Button 
                  onClick={handleSendMessage} 
                  disabled={!chatMessage.trim()}
                  className="absolute left-2 top-1/2 -translate-y-1/2 h-12 w-12 rounded-xl bg-primary text-slate-950"
                >
                   <Send className="h-5 w-5 rotate-180" />
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
    blue: "text-primary border-primary/20",
    red: "text-red-500 bg-red-500/10 border-red-500/20",
    gray: "text-white/20 hover:text-white border-white/5"
  };
  
  return (
    <Button 
      variant="outline" 
      size="icon" 
      className={`h-16 w-16 rounded-[1.8rem] glass border ${colors[color]}`} 
      onClick={onClick}
    >
      {icon}
    </Button>
  );
}
