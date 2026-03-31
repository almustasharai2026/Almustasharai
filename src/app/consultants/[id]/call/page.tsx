
"use client";

import { useState, useRef, useEffect, use } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  Mic, MicOff, Video, VideoOff, PhoneOff, 
  MessageSquare, Send, X, Lock, Loader2
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useToast } from "@/hooks/use-toast";
import { useUser, useFirestore, useDoc, useCollection } from "@/firebase";
import { doc, collection, query, orderBy, limit } from "firebase/firestore";
import { useMemoFirebase } from "@/firebase/provider";
import { motion, AnimatePresence } from "framer-motion";
import { sendSovereignLiveMessage } from "@/lib/sovereign-live-chat";

export default function DirectLiveRoom({ params }: { params: Promise<{ id: string }> }) {
  const { id: consultantId } = use(params);
  const { user } = useUser();
  const db = useFirestore();
  const router = useRouter();
  const { toast } = useToast();

  const [isMicOn, setIsMicOn] = useState(true);
  const [isVideoOn, setIsVideoOn] = useState(true);
  const [chatMessage, setChatMessage] = useState("");
  const [stream, setStream] = useState<MediaStream | null>(null);

  const videoRef = useRef<HTMLVideoElement>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);

  const consultantRef = useMemoFirebase(() => db ? doc(db, "consultants", consultantId) : null, [db, consultantId]);
  const { data: consultant } = useDoc(consultantRef);

  const messagesQuery = useMemoFirebase(() => {
    if (!db || !user || !consultantId) return null;
    return query(collection(db, "liveConsultations", consultantId, "messages"), orderBy("timestamp", "asc"), limit(100));
  }, [db, user, consultantId]);
  
  const { data: messages } = useCollection(messagesQuery);

  useEffect(() => {
    const initMedia = async () => {
      try {
        const mediaStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
        setStream(mediaStream);
        if (videoRef.current) videoRef.current.srcObject = mediaStream;
      } catch (err) {
        toast({ variant: "destructive", title: "خطأ في الكاميرا" });
      }
    };
    initMedia();
    return () => stream?.getTracks().forEach(t => t.stop());
  }, []);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSendMessage = () => {
    if (!chatMessage.trim() || !user || !db) return;
    sendSovereignLiveMessage(db, consultantId, user.uid, user.displayName || "مواطن", chatMessage);
    setChatMessage("");
  };

  return (
    <div className="fixed inset-0 bg-black z-[200] flex flex-col font-sans" dir="rtl">
      {/* Video Main */}
      <div className="flex-1 relative bg-zinc-900 flex items-center justify-center">
        <video 
          ref={videoRef} 
          autoPlay 
          muted 
          playsInline 
          className={`w-full h-full object-cover mirror ${isVideoOn ? 'opacity-100' : 'opacity-0'}`} 
        />
        {!isVideoOn && <div className="absolute text-white/20 font-black text-xl uppercase">Video Disabled</div>}
        
        {/* Remote Mock Placeholder */}
        <div className="absolute top-10 left-10 w-48 h-64 glass rounded-[2rem] border border-white/10 flex items-center justify-center">
           <p className="text-[10px] text-white/40 font-black text-center px-4">Waiting for Expert...</p>
        </div>
      </div>

      {/* Simplified Controls */}
      <div className="h-32 glass border-t border-white/5 flex items-center justify-center gap-8 px-6">
        <button onClick={() => setIsMicOn(!isMicOn)} className={`p-5 rounded-3xl transition-all ${isMicOn ? 'bg-white/5 text-white' : 'bg-red-500 text-white'}`}>
          {isMicOn ? <Mic /> : <MicOff />}
        </button>
        <button onClick={() => setIsVideoOn(!isVideoOn)} className={`p-5 rounded-3xl transition-all ${isVideoOn ? 'bg-white/5 text-white' : 'bg-red-500 text-white'}`}>
          {isVideoOn ? <Video /> : <VideoOff />}
        </button>
        <button onClick={() => router.push("/")} className="p-6 bg-red-600 rounded-[2.5rem] text-white shadow-2xl hover:scale-110 active:scale-95 transition-all">
          <PhoneOff size={32} />
        </button>
      </div>

      {/* Overlay Minimal Chat */}
      <div className="absolute bottom-40 right-10 w-80 h-96 glass rounded-[3rem] border border-white/5 flex flex-col shadow-3xl overflow-hidden">
        <ScrollArea className="flex-1 p-6">
          <div className="space-y-4">
            {messages?.map((m, idx) => (
              <div key={idx} className={`p-4 rounded-2xl text-xs ${m.senderId === user?.uid ? 'bg-primary text-black ml-4' : 'bg-zinc-800 text-white mr-4'}`}>
                {m.text}
              </div>
            ))}
            <div ref={chatEndRef} />
          </div>
        </ScrollArea>
        <div className="p-4 bg-black/40 border-t border-white/5 flex gap-2">
          <input 
            value={chatMessage}
            onChange={e => setChatMessage(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleSendMessage()}
            placeholder="رسالة.."
            className="flex-1 bg-transparent border-none outline-none text-xs font-bold text-white px-2"
          />
          <button onClick={handleSendMessage} className="p-2 bg-primary rounded-xl text-black">
            <Send size={16} className="rotate-180" />
          </button>
        </div>
      </div>
    </div>
  );
}
