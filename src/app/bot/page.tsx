
"use client";

import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { 
  Send, 
  User, 
  Paperclip, 
  Camera, 
  Mic, 
  Trash2,
  ShieldCheck,
  Zap,
  Loader2,
  AlertTriangle,
  Settings,
  X,
  ChevronRight,
  MessageSquare,
  MicOff,
  Scale
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

type Message = {
  id: string;
  role: "user" | "bot";
  content: string;
  timestamp: Date;
  character?: string;
  attachments?: { type: 'image' | 'file' | 'audio', url: string }[];
};

const CHARACTERS = [
  { id: "lawyer", name: "المحامي الفائق", icon: "⚖️", color: "from-blue-600/30 to-indigo-600/10", desc: "خبير القضايا والنزاعات المعقدة" },
  { id: "judge", name: "خبير القضاء", icon: "👨‍⚖️", color: "from-slate-600/30 to-slate-900/10", desc: "رؤية ثاقبة من منصة الحكم" },
  { id: "consultant", name: "مستشار استراتيجي", icon: "🏢", color: "from-emerald-600/30 to-teal-600/10", desc: "نمو الشركات والصفقات التجارية" },
  { id: "notary", name: "الكاتب العدل", icon: "✒️", color: "from-amber-600/30 to-orange-600/10", desc: "صحة وتوثيق المستندات والوكالات" },
  { id: "forensic", name: "خبير جنائي", icon: "🔍", color: "from-zinc-600/30 to-black/10", desc: "تحليل الأدلة الجنائية والتقنية" },
  { id: "arbitrator", name: "المحكم الدولي", icon: "🌍", color: "from-violet-600/30 to-purple-600/10", desc: "فض النزاعات الدولية والعقود" },
  { id: "mediator", name: "الوسيط القانوني", icon: "🤝", color: "from-sky-600/30 to-blue-600/10", desc: "حلول ودية سريعة خارج المحاكم" },
  { id: "researcher", name: "الباحث الأكاديمي", icon: "📚", color: "from-green-600/30 to-emerald-600/10", desc: "دراسات فقهية وقانونية عميقة" },
  { id: "prosecutor", name: "المدعي العام", icon: "📜", color: "from-rose-600/30 to-red-600/10", desc: "حماية الحقوق العامة والادعاء" },
];

const DISCLAIMER_TEXT = "\n\n--- \n⚠️ إخلاء مسؤولية: هذا الرد نتاج تحليل ذكاء اصطناعي لأغراض استرشادية فقط. لا يعتبر نصيحة قانونية نهائية، ويُنصح دائماً بمراجعة محامي مختص قبل اتخاذ أي إجراء قانوني.";

export default function BotPage() {
  const [messages, setMessages] = useState<Message[]>([
    { id: "1", role: "bot", content: "مرحباً بك في كوكب المستشار الذكي. اختر الخبير المتخصص الذي تود بدء الجلسة معه.", timestamp: new Date() }
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [activeChar, setActiveChar] = useState(CHARACTERS[0]);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isRecording, setIsRecording] = useState(false);
  
  const scrollRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  useEffect(() => {
    if (scrollRef.current) {
      const viewport = scrollRef.current.querySelector('[data-radix-scroll-area-viewport]');
      if (viewport) viewport.scrollTop = viewport.scrollHeight;
    }
  }, [messages, isLoading]);

  const handleSelectCharacter = (char: typeof CHARACTERS[0]) => {
    setActiveChar(char);
    toast({
      title: `تفعيل ${char.name}`,
      description: `أنت الآن تتحدث مع ${char.desc}.`,
    });
  };

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;
    
    const userMsg: Message = { id: Date.now().toString(), role: "user", content: input, timestamp: new Date() };
    setMessages(prev => [...prev, userMsg]);
    setInput("");
    setIsLoading(true);

    setTimeout(() => {
      const botMsg: Message = { 
        id: (Date.now() + 1).toString(), 
        role: "bot", 
        character: activeChar.name,
        content: `بصفتي ${activeChar.name}، قمت بمراجعة استفسارك. من الناحية القانونية المتعلقة بـ ${activeChar.desc}، أرى أن الخطوة الأولى هي التأكد من استيفاء كافة المتطلبات الإجرائية المعمول بها في التشريعات الحالية.` + DISCLAIMER_TEXT,
        timestamp: new Date() 
      };
      setMessages(prev => [...prev, botMsg]);
      setIsLoading(false);
    }, 1800);
  };

  const toggleRecording = () => {
    setIsRecording(!isRecording);
    if (!isRecording) {
      toast({ title: "جاري التسجيل...", description: "تحدث الآن، وسنقوم بتحليل رسالتك." });
    } else {
      toast({ title: "تم الحفظ", description: "جاري تحويل التسجيل الصوتي لنص..." });
    }
  };

  return (
    <div className="flex h-[calc(100vh-5rem)] w-full overflow-hidden bg-slate-950/20" dir="rtl">
      
      {/* Sidebar - Character Intelligence Matrix */}
      <aside className={`w-80 glass border-l border-white/5 transition-all duration-700 hidden lg:flex flex-col p-8 gap-10 ${isSidebarOpen ? 'ml-0' : '-mr-80'}`}>
        <div className="flex items-center gap-4 px-2">
          <div className="h-12 w-12 rounded-2xl bg-primary/10 flex items-center justify-center border border-primary/20 shadow-[0_0_20px_rgba(37,99,235,0.1)]">
             <Scale className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h2 className="text-xl font-black text-white">الخبراء</h2>
            <p className="text-[10px] text-white/30 font-bold uppercase tracking-widest">Expert Matrix</p>
          </div>
        </div>

        <ScrollArea className="flex-1 -mx-2 px-2">
          <div className="space-y-3">
            {CHARACTERS.map((char) => (
              <button
                key={char.id}
                onClick={() => handleSelectCharacter(char)}
                className={`w-full flex items-center gap-4 p-4 rounded-[1.8rem] transition-all border group relative overflow-hidden ${
                  activeChar.id === char.id 
                  ? 'bg-white/5 border-white/10 shadow-2xl' 
                  : 'border-transparent hover:bg-white/[0.02]'
                }`}
              >
                <div className={`h-12 w-12 rounded-2xl flex items-center justify-center text-2xl bg-gradient-to-br ${char.color} shrink-0 shadow-inner`}>
                  {char.icon}
                </div>
                <div className="text-right">
                  <p className="text-sm font-black text-white/80">{char.name}</p>
                  <p className="text-[10px] text-white/30 line-clamp-1 font-medium">{char.desc}</p>
                </div>
                {activeChar.id === char.id && <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-primary rounded-full" />}
              </button>
            ))}
          </div>
        </ScrollArea>

        <div className="p-6 bg-primary/5 border border-primary/10 rounded-[2rem] flex items-center gap-4">
          <ShieldCheck className="h-8 w-8 text-primary/40 shrink-0" />
          <p className="text-[10px] text-white/40 leading-relaxed font-bold">كل المحادثات مشفرة وفق بروتوكول الأمان السيادي لـ "المستشار AI".</p>
        </div>
      </aside>

      {/* Main Intelligent Command Center */}
      <main className="flex-1 flex flex-col relative overflow-hidden">
        
        {/* Chat Header */}
        <header className="h-24 border-b border-white/[0.03] flex items-center justify-between px-10 bg-slate-950/40 backdrop-blur-3xl z-30">
          <div className="flex items-center gap-5">
             <Button variant="ghost" size="icon" className="lg:hidden rounded-2xl glass" onClick={() => setIsSidebarOpen(!isSidebarOpen)}>
                <Settings className="h-5 w-5" />
             </Button>
             <div className="h-14 w-14 rounded-3xl bg-white/5 flex items-center justify-center text-3xl shadow-2xl border border-white/5">
                {activeChar.icon}
             </div>
             <div>
                <h1 className="text-xl font-black text-white">{activeChar.name}</h1>
                <p className="text-[10px] text-primary flex items-center gap-2 font-black uppercase tracking-widest">
                   <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                   التحليل الذكي مفعل
                </p>
             </div>
          </div>
          <div className="flex gap-3">
             <Button variant="ghost" size="icon" className="h-12 w-12 rounded-2xl hover:bg-red-500/10 text-red-500/40 hover:text-red-500" onClick={() => {
               setMessages([messages[0]]);
               toast({ title: "تم التطهير", description: "بدء جلسة تحليل جديدة." });
             }}>
                <Trash2 className="h-5 w-5" />
             </Button>
          </div>
        </header>

        {/* Message Matrix Viewport */}
        <ScrollArea className="flex-1 p-8 md:p-16" ref={scrollRef}>
          <div className="max-w-4xl mx-auto space-y-16 pb-12">
            {messages.map((msg) => (
              <div key={msg.id} className={`flex gap-8 ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'} animate-in fade-in slide-in-from-bottom-4 duration-700`}>
                <div className={`h-14 w-14 rounded-3xl flex items-center justify-center shrink-0 shadow-2xl border ${
                  msg.role === 'bot' ? 'bg-white/5 border-white/5' : 'bg-primary border-primary/20 text-white'
                }`}>
                  {msg.role === 'bot' ? <MessageSquare className="h-6 w-6 opacity-30" /> : <User className="h-7 w-7" />}
                </div>
                <div className={`max-w-[80%] space-y-3 ${msg.role === 'user' ? 'text-left' : 'text-right'}`}>
                  <div className={`p-8 md:p-10 rounded-[2.5rem] text-sm md:text-xl leading-loose whitespace-pre-wrap border shadow-2xl ${
                    msg.role === 'bot' 
                    ? 'bg-white/[0.01] border-white/[0.03] text-white/80 rounded-tr-none' 
                    : 'bg-white/5 border-white/10 text-white font-medium rounded-tl-none'
                  }`}>
                    {msg.content}
                    
                    {msg.id === "1" && (
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mt-10">
                        {CHARACTERS.slice(0, 6).map((char) => (
                          <Button
                            key={char.id}
                            variant="outline"
                            className="bg-white/5 border-white/[0.03] hover:border-primary/40 h-auto py-5 rounded-[1.8rem] group transition-all flex flex-col gap-2"
                            onClick={() => handleSelectCharacter(char)}
                          >
                            <span className="text-2xl group-hover:scale-125 transition-transform duration-500">{char.icon}</span>
                            <span className="text-[10px] font-black text-white/50 group-hover:text-primary">{char.name}</span>
                          </Button>
                        ))}
                      </div>
                    )}
                  </div>
                  <span className="text-[10px] text-white/20 px-6 font-black uppercase tracking-widest">
                    {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex gap-8 animate-pulse">
                <div className="h-14 w-14 rounded-3xl bg-white/5 flex items-center justify-center border border-white/5">
                  <Loader2 className="h-6 w-6 animate-spin text-white/10" />
                </div>
                <div className="bg-white/[0.01] p-10 rounded-[2.5rem] rounded-tr-none w-40 border border-white/[0.03] flex justify-center gap-3">
                  <div className="w-2 h-2 bg-primary/40 rounded-full animate-bounce" />
                  <div className="w-2 h-2 bg-primary/40 rounded-full animate-bounce [animation-delay:0.2s]" />
                  <div className="w-2 h-2 bg-primary/40 rounded-full animate-bounce [animation-delay:0.4s]" />
                </div>
              </div>
            )}
          </div>
        </ScrollArea>

        {/* Futuristic Command Input */}
        <div className="p-10 bg-slate-950/60 backdrop-blur-3xl border-t border-white/[0.03]">
          <div className="max-w-4xl mx-auto flex gap-5 items-end">
            <div className="flex gap-3 pb-1">
              <Button 
                type="button" 
                variant="ghost" 
                size="icon" 
                className="h-16 w-16 rounded-[1.8rem] glass hover:bg-primary/10 transition-all"
                onClick={() => toast({ title: "الذكاء المستندي", description: "جاري فتح مستكشف الملفات..." })}
              >
                <Paperclip className="h-6 w-6 opacity-30" />
              </Button>
              <Button 
                type="button" 
                variant="ghost" 
                size="icon" 
                className="h-16 w-16 rounded-[1.8rem] glass hover:bg-primary/10 transition-all"
                onClick={() => toast({ title: "المسح البصري", description: "جاري تشغيل عدسة المسح القانوني..." })}
              >
                <Camera className="h-6 w-6 opacity-30" />
              </Button>
            </div>
            <div className="flex-grow relative">
              <Input 
                placeholder={`تواصل مع ${activeChar.name} بمواصفات "المستشار ٤"...`} 
                className="pr-8 pl-20 text-right glass border-white/[0.03] rounded-[2rem] h-16 text-lg focus-visible:ring-1 ring-primary/40 shadow-2xl"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSend()}
              />
              <Button 
                onClick={handleSend} 
                disabled={isLoading || !input.trim()}
                className={`absolute left-2.5 top-2.5 h-11 w-11 rounded-2xl transition-all duration-500 ${
                  input.trim() ? 'bg-primary text-white scale-100 shadow-[0_0_20px_rgba(37,99,235,0.4)]' : 'bg-white/5 text-white/20 scale-90'
                }`}
              >
                <Send className="h-5 w-5 rotate-180" />
              </Button>
            </div>
            <Button 
              type="button" 
              variant="ghost" 
              size="icon" 
              className={`h-16 w-16 rounded-[1.8rem] glass transition-all ${isRecording ? 'bg-red-500/20 text-red-500 animate-pulse border-red-500/20' : 'hover:bg-red-500/10 text-red-400'}`}
              onClick={toggleRecording}
            >
              {isRecording ? <MicOff className="h-6 w-6" /> : <Mic className="h-6 w-6" />}
            </Button>
          </div>
          <p className="text-[10px] text-center mt-8 opacity-20 font-black uppercase tracking-[0.5em] text-white">Advanced Legal Core AI Engine - v4.1 Platinum</p>
        </div>
      </main>
    </div>
  );
}
