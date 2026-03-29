
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
  Sparkles, 
  Paperclip, 
  Camera, 
  Mic, 
  X, 
  History,
  Trash2,
  ShieldCheck,
  Zap,
  Info,
  ChevronLeft,
  CheckCircle2
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

type Message = {
  id: string;
  role: "user" | "bot";
  content: string;
  timestamp: Date;
  character?: string;
  attachments?: string[];
};

const CHARACTERS = [
  { id: "lawyer", name: "المحامي الفائق", icon: "⚖️", color: "from-blue-600 to-indigo-800", desc: "خبير القضايا المعقدة" },
  { id: "judge", name: "خبير القضاء", icon: "👨‍⚖️", color: "from-red-600 to-rose-900", desc: "رؤية منصة الحكم" },
  { id: "consultant", name: "مستشار استراتيجي", icon: "🏢", color: "from-emerald-600 to-teal-900", desc: "نمو الشركات والصفقات" },
  { id: "notary", name: "الكاتب العدل", icon: "✒️", color: "from-amber-600 to-orange-900", desc: "صحة وتوثيق المستندات" },
  { id: "forensic", name: "خبير جنائي", icon: "🔍", color: "from-zinc-700 to-black", desc: "تحليل الأدلة الجنائية" },
  { id: "arbitrator", name: "المحكم الدولي", icon: "🌍", color: "from-violet-600 to-purple-900", desc: "فض النزاعات الدولية" },
  { id: "mediator", name: "الوسيط القانوني", icon: "🤝", color: "from-sky-500 to-blue-800", desc: "حلول ودية سريعة" },
  { id: "researcher", name: "الباحث الأكاديمي", icon: "📚", color: "from-green-600 to-emerald-900", desc: "دراسات فقهية عميقة" },
  { id: "prosecutor", name: "المدعي العام", icon: "📜", color: "from-orange-600 to-red-900", desc: "حماية الحقوق العامة" },
];

export default function CosmicBotPage() {
  const [messages, setMessages] = useState<Message[]>([
    { id: "1", role: "bot", content: "مرحباً بك في مركز القيادة القانونية الذكي. أي من خبرائنا التسعة تود استشارته اليوم؟", timestamp: new Date() }
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [activeChar, setActiveChar] = useState(CHARACTERS[0]);
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
    const selectionMsg: Message = {
      id: Date.now().toString(),
      role: "bot",
      content: `تم تفعيل نظام ${char.name} بنجاح. أنا جاهز تماماً لتحليل قضيتك الآن.`,
      timestamp: new Date(),
      character: char.name
    };
    setMessages(prev => [...prev, selectionMsg]);
    toast({
      title: "تغيير الشخصية",
      description: `أنت الآن تتحدث مع ${char.name}`,
    });
  };

  const handleSend = async () => {
    if (!input.trim()) return;
    const userMsg: Message = { id: Date.now().toString(), role: "user", content: input, timestamp: new Date() };
    setMessages(prev => [...prev, userMsg]);
    setInput("");
    setIsLoading(true);

    // Simulated Cosmic Response
    setTimeout(() => {
      const botMsg: Message = { 
        id: (Date.now() + 1).toString(), 
        role: "bot", 
        character: activeChar.name,
        content: `بصفتي ${activeChar.name}، قمت بتحليل طلبك عبر خوارزميات العدالة الذكية. إليك التحليل المبدئي لموقفك بناءً على المعطيات القانونية الحالية...`,
        timestamp: new Date() 
      };
      setMessages(prev => [...prev, botMsg]);
      setIsLoading(false);
    }, 2000);
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl h-[calc(100vh-6rem)] flex flex-col gap-6" dir="rtl">
      <div className="grid lg:grid-cols-12 gap-6 flex-grow overflow-hidden">
        
        {/* Futuristic Personality Bar */}
        <div className="lg:col-span-3 hidden lg:flex flex-col gap-4 overflow-y-auto pr-2 custom-scrollbar">
          <div className="glass-cosmic p-6 rounded-[3rem] space-y-6">
            <div className="flex items-center justify-between px-2">
               <Zap className="h-5 w-5 text-accent animate-pulse" />
               <h3 className="font-black text-white text-xl">طاقم الخبراء</h3>
            </div>
            <div className="space-y-3">
              {CHARACTERS.map((char) => (
                <button
                  key={char.id}
                  onClick={() => setActiveChar(char)}
                  className={`w-full flex items-center gap-4 p-4 rounded-[2rem] transition-all duration-500 border-2 ${
                    activeChar.id === char.id 
                    ? 'border-accent bg-accent/20 shadow-xl scale-105' 
                    : 'border-transparent opacity-60 hover:opacity-100 hover:bg-white/5'
                  }`}
                >
                  <div className={`h-12 w-12 rounded-2xl flex items-center justify-center text-2xl shadow-lg bg-gradient-to-br ${char.color} text-white`}>
                    {char.icon}
                  </div>
                  <div className="text-right flex-grow">
                    <p className="text-sm font-black text-white">{char.name}</p>
                    <p className="text-[10px] opacity-70 text-white/70">{char.desc}</p>
                  </div>
                  {activeChar.id === char.id && <div className="w-2 h-2 rounded-full bg-accent animate-ping" />}
                </button>
              ))}
            </div>
          </div>
          <div className="mt-auto glass-cosmic p-6 rounded-[2rem] flex items-center gap-4 border-accent/20">
            <div className="h-10 w-10 rounded-full bg-accent/20 flex items-center justify-center">
              <ShieldCheck className="h-6 w-6 text-accent" />
            </div>
            <div className="text-right">
              <p className="text-xs font-bold text-white">تشفير سيادي مفعل</p>
              <p className="text-[8px] opacity-50 uppercase tracking-widest text-accent">Quantum Secure Layer</p>
            </div>
          </div>
        </div>

        {/* Chat Interface (Supreme Dashboard) */}
        <Card className="lg:col-span-9 glass-cosmic border-none rounded-[3rem] flex flex-col overflow-hidden relative shadow-2xl">
          
          {/* Header Bar */}
          <div className="p-6 border-b border-white/5 flex items-center justify-between bg-black/20 backdrop-blur-xl">
            <div className="flex items-center gap-4">
              <div className={`h-16 w-16 rounded-[1.5rem] bg-gradient-to-br ${activeChar.color} text-white flex items-center justify-center text-4xl shadow-2xl relative overflow-hidden group`}>
                <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-500" />
                {activeChar.icon}
              </div>
              <div className="text-right">
                <h2 className="text-2xl font-black text-white">{activeChar.name}</h2>
                <div className="flex items-center gap-2 mt-1">
                  <span className="h-2 w-2 rounded-full bg-green-500 shadow-[0_0_10px_rgba(34,197,94,0.8)]" />
                  <span className="text-[10px] font-bold text-accent uppercase tracking-widest">النظام بكامل طاقته</span>
                </div>
              </div>
            </div>
            <div className="flex gap-3">
              <Button variant="ghost" size="icon" className="h-12 w-12 rounded-2xl bg-white/5 hover:bg-white/10 text-white"><History className="h-5 w-5" /></Button>
              <Button 
                variant="ghost" 
                size="icon" 
                className="h-12 w-12 rounded-2xl bg-white/5 hover:bg-red-500/20 text-red-500"
                onClick={() => setMessages([{ id: "1", role: "bot", content: "مرحباً بك في مركز القيادة القانونية الذكي. أي من خبرائنا التسعة تود استشارته اليوم؟", timestamp: new Date() }])}
              >
                <Trash2 className="h-5 w-5" />
              </Button>
            </div>
          </div>

          {/* Messages Cosmic Area */}
          <ScrollArea className="flex-grow p-8" ref={scrollRef}>
            <div className="max-w-4xl mx-auto space-y-12 pb-10">
              {messages.map((msg) => (
                <div key={msg.id} className={`flex gap-6 ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'} animate-in fade-in slide-in-from-bottom-4 duration-500`}>
                  <div className={`h-16 w-16 rounded-2xl flex items-center justify-center shrink-0 shadow-2xl border-2 border-white/10 ${
                    msg.role === 'bot' ? (msg.character ? `bg-gradient-to-br ${CHARACTERS.find(c => c.name === msg.character)?.color || activeChar.color}` : 'bg-zinc-800') : 'bg-accent'
                  } text-white`}>
                    {msg.role === 'bot' ? <span className="text-3xl">{CHARACTERS.find(c => c.name === msg.character)?.icon || activeChar.icon}</span> : <User className="h-8 w-8" />}
                  </div>
                  <div className={`max-w-[85%] space-y-4 ${msg.role === 'user' ? 'text-left' : 'text-right'}`}>
                    <div className={`p-8 rounded-[2.5rem] text-xl leading-relaxed shadow-2xl relative group ${
                      msg.role === 'bot' 
                      ? 'bg-white/5 border border-white/10 text-white rounded-tr-none' 
                      : 'cosmic-gradient text-white rounded-tl-none'
                    }`}>
                      {msg.content}
                      
                      {/* Expert Selection Buttons - Only show for the first bot message */}
                      {msg.id === "1" && msg.role === "bot" && (
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mt-8">
                          {CHARACTERS.map((char) => (
                            <Button
                              key={char.id}
                              variant="outline"
                              className="glass-cosmic border-white/10 hover:border-accent hover:bg-accent/10 h-auto py-5 flex flex-col items-center gap-2 rounded-2xl transition-all group/btn"
                              onClick={() => handleSelectCharacter(char)}
                            >
                              <span className="text-3xl group-hover/btn:scale-125 transition-transform duration-500">{char.icon}</span>
                              <span className="text-xs font-black text-white">{char.name}</span>
                            </Button>
                          ))}
                        </div>
                      )}

                      <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-40 transition-opacity">
                        <Info className="h-4 w-4" />
                      </div>
                    </div>
                    <span className="text-[10px] opacity-40 px-6 font-bold text-white uppercase tracking-tighter">
                      {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                </div>
              ))}
              {isLoading && (
                <div className="flex gap-6 animate-pulse">
                  <div className={`h-16 w-16 rounded-2xl bg-gradient-to-br ${activeChar.color} text-white flex items-center justify-center shrink-0`}>
                    <Sparkles className="h-8 w-8 animate-spin-slow" />
                  </div>
                  <div className="bg-white/5 p-8 rounded-[2.5rem] rounded-tr-none flex gap-4 items-center border border-white/10">
                    <div className="w-4 h-4 bg-accent rounded-full animate-bounce" />
                    <div className="w-4 h-4 bg-accent rounded-full animate-bounce [animation-delay:0.2s]" />
                    <div className="w-4 h-4 bg-accent rounded-full animate-bounce [animation-delay:0.4s]" />
                  </div>
                </div>
              )}
            </div>
          </ScrollArea>

          {/* Input Center (Supreme Design) */}
          <div className="p-8 bg-black/40 backdrop-blur-3xl border-t border-white/5">
            <div className="max-w-4xl mx-auto flex gap-4 items-end">
              <div className="flex gap-3 pb-2">
                <Button type="button" variant="ghost" size="icon" className="rounded-2xl h-14 w-14 bg-white/5 hover:bg-accent hover:text-white transition-all border border-white/10 group">
                  <Paperclip className="h-6 w-6 group-hover:rotate-45 transition-transform" />
                </Button>
                <Button type="button" variant="ghost" size="icon" className="rounded-2xl h-14 w-14 bg-white/5 hover:bg-accent hover:text-white transition-all border border-white/10">
                  <Camera className="h-6 w-6" />
                </Button>
              </div>
              <div className="flex-grow relative">
                <Input 
                  placeholder={`اكتب رسالتك لـ ${activeChar.name}...`} 
                  className="pr-8 pl-20 text-right glass-cosmic border-white/5 rounded-[2.5rem] h-20 text-2xl shadow-inner focus-visible:ring-2 ring-accent/50 text-white placeholder:text-white/20"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                />
                <Button 
                  onClick={handleSend} 
                  className="absolute left-3 top-3 h-14 w-14 rounded-2xl cosmic-gradient text-white shadow-2xl hover:scale-105 active:scale-95 transition-all"
                >
                  <Send className="h-8 w-8 rotate-180" />
                </Button>
              </div>
              <Button type="button" variant="ghost" size="icon" className="rounded-2xl h-14 w-14 bg-red-500/10 hover:bg-red-500 hover:text-white transition-all border border-red-500/20 group">
                <Mic className="h-6 w-6 group-active:scale-125 transition-all" />
              </Button>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
