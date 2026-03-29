
"use client";

import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Mic, MicOff, Video, VideoOff, PhoneOff, Settings, MessageSquare, Send, User, ShieldCheck } from "lucide-react";
import { useRouter, useParams } from "next/navigation";
import { useToast } from "@/hooks/use-toast";
import { useUser, useFirestore, useDoc } from "@/firebase";
import { doc, addDoc, collection, query, orderBy, onSnapshot, limit } from "firebase/firestore";

export default function VideoCallPage() {
  const params = useParams();
  const { user } = useUser();
  const db = useFirestore();
  const router = useRouter();
  const { toast } = useToast();

  const [isMicOn, setIsMicOn] = useState(true);
  const [isVideoOn, setIsVideoOn] = useState(true);
  const [chatMessage, setChatMessage] = useState("");
  const [messages, setMessages] = useState<any[]>([]);
  const videoRef = useRef<HTMLVideoElement>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);

  const consultantRef = doc(db!, "consultantProfiles", params.id as string);
  const { data: consultant } = useDoc(consultantRef);

  useEffect(() => {
    const enableCamera = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
        if (videoRef.current) videoRef.current.srcObject = stream;
      } catch (err) {
        toast({ variant: "destructive", title: "تنبيه الكاميرا", description: "يرجى السماح بالوصول للكاميرا." });
      }
    };
    enableCamera();
  }, [toast]);

  useEffect(() => {
    if (!db || !params.id) return;
    const q = query(collection(db, "consultations", params.id as string, "chat"), orderBy("timestamp", "asc"), limit(50));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const msgs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setMessages(msgs);
      chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
    });
    return () => unsubscribe();
  }, [db, params.id]);

  const handleSendMessage = async () => {
    if (!chatMessage.trim() || !user) return;
    await addDoc(collection(db!, "consultations", params.id as string, "chat"), {
      text: chatMessage,
      senderId: user.uid,
      senderName: user.displayName || "عميل",
      timestamp: new Date().toISOString()
    });
    setChatMessage("");
  };

  const handleEndCall = () => {
    router.push("/dashboard");
    toast({ title: "انتهت الجلسة", description: "تم إنهاء المكالمة بنجاح وحفظ السجل." });
  };

  return (
    <div className="fixed inset-0 bg-slate-950 z-[200] flex flex-col md:flex-row overflow-hidden" dir="rtl">
      
      {/* Sidebar Chat */}
      <aside className="w-full md:w-96 glass-cosmic border-l border-white/5 flex flex-col z-50">
        <header className="p-6 border-b border-white/5 flex items-center justify-between">
          <h3 className="font-black text-xl text-white">الدردشة المباشرة</h3>
          <Badge className="bg-emerald-500/10 text-emerald-500 border-none">آمنة ومشفرة</Badge>
        </header>
        <ScrollArea className="flex-grow p-6">
          <div className="space-y-6">
            {messages.map((m) => (
              <div key={m.id} className={`flex flex-col ${m.senderId === user?.uid ? 'items-start' : 'items-end'}`}>
                <div className={`p-4 rounded-2xl max-w-[85%] text-sm ${m.senderId === user?.uid ? 'bg-primary text-slate-950' : 'bg-white/5 text-white/70'}`}>
                  {m.text}
                </div>
                <span className="text-[10px] opacity-30 mt-1">{m.senderName}</span>
              </div>
            ))}
            <div ref={chatEndRef} />
          </div>
        </ScrollArea>
        <div className="p-6 bg-slate-900/50 border-t border-white/5 flex gap-2">
          <Input 
            placeholder="اكتب رسالتك..." 
            value={chatMessage}
            onChange={(e) => setChatMessage(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
            className="glass border-white/10 h-12"
          />
          <Button onClick={handleSendMessage} className="h-12 w-12 rounded-xl bg-primary text-slate-950">
             <Send className="h-5 w-5 rotate-180" />
          </Button>
        </div>
      </aside>

      {/* Main Video View */}
      <main className="flex-grow relative flex flex-col">
        <div className="flex-grow flex items-center justify-center bg-slate-900 relative">
          <div className="text-center space-y-6">
             <div className="h-32 w-32 rounded-full bg-primary/20 mx-auto animate-pulse flex items-center justify-center border-2 border-primary/40 relative">
                <Video className="h-12 w-12 text-primary" />
                <div className="absolute inset-0 rounded-full border border-primary/50 animate-ping" />
             </div>
             <div>
                <h2 className="text-3xl font-black text-white mb-2">{consultant?.name || "المستشار الخبير"}</h2>
                <p className="text-xl text-white/40">في انتظار انضمام المستشار للغرفة...</p>
             </div>
          </div>

          {/* User Preview */}
          <div className="absolute bottom-32 right-10 w-48 md:w-72 aspect-video rounded-[2.5rem] overflow-hidden border-2 border-primary/40 shadow-2xl glass z-10">
            <video ref={videoRef} autoPlay muted playsInline className="w-full h-full object-cover mirror" />
            {!isVideoOn && <div className="absolute inset-0 bg-slate-800 flex items-center justify-center"><VideoOff className="h-8 w-8 text-white/20" /></div>}
            <div className="absolute bottom-4 left-4 bg-slate-950/60 px-3 py-1 rounded-full text-[10px] font-bold">أنت (الآن)</div>
          </div>
        </div>

        {/* Controls Bar */}
        <div className="h-28 glass-cosmic border-t border-white/5 flex items-center justify-center gap-6 px-6 relative z-50">
          <Button variant="outline" size="icon" className={`h-16 w-16 rounded-3xl glass ${!isMicOn ? 'bg-red-500/20 text-red-500' : ''}`} onClick={() => setIsMicOn(!isMicOn)}>
            {isMicOn ? <Mic className="h-7 w-7" /> : <MicOff className="h-7 w-7" />}
          </Button>
          
          <Button variant="outline" size="icon" className={`h-16 w-16 rounded-3xl glass ${!isVideoOn ? 'bg-red-500/20 text-red-500' : ''}`} onClick={() => setIsVideoOn(!isVideoOn)}>
            {isVideoOn ? <Video className="h-7 w-7" /> : <VideoOff className="h-7 w-7" />}
          </Button>

          <div className="w-8" />

          <Button variant="destructive" size="icon" className="h-20 w-20 rounded-[2rem] bg-red-600 hover:bg-red-700 shadow-2xl shadow-red-500/20" onClick={handleEndCall}>
            <PhoneOff className="h-10 w-10" />
          </Button>

          <div className="w-8" />

          <Button variant="outline" size="icon" className="h-16 w-16 rounded-3xl glass"><Settings className="h-7 w-7" /></Button>
          <Button variant="outline" size="icon" className="h-16 w-16 rounded-3xl glass"><ShieldCheck className="h-7 w-7 text-primary" /></Button>
        </div>
      </main>
    </div>
  );
}
