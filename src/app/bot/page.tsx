
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
  FileText,
  History,
  Trash2,
  ShieldCheck,
  Zap
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

type Message = {
  id: string;
  role: "user" | "bot";
  content: string;
  timestamp: Date;
  character?: string;
};

const CHARACTERS = [
  { id: "lawyer", name: "المحامي الفائق", icon: "⚖️", color: "from-blue-600 to-indigo-800", desc: "تحليل العقود والنزاعات" },
  { id: "judge", name: "خبير القضاء", icon: "👨‍⚖️", color: "from-red-600 to-rose-900", desc: "رؤية من منصة الحكم" },
  { id: "consultant", name: "مستشار استراتيجي", icon: "🏢", color: "from-emerald-600 to-teal-900", desc: "تأسيس ونمو الشركات" },
  { id: "notary", name: "الكاتب العدل", icon: "✒️", color: "from-amber-600 to-orange-900", desc: "توثيق وصحة المحررات" },
];

export default function CosmicBotPage() {
  const [messages, setMessages] = useState<Message[]>([
    { id: "1", role: "bot", content: "مرحباً بك في أفق العدالة الذكي. كيف يمكنني مساعدتك اليوم؟", timestamp: new Date() }
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

  const handleSend = async () => {
    if (!input.trim()) return;
    const userMsg: Message = { id: Date.now().toString(), role: "user", content: input, timestamp: new Date() };
    setMessages(prev => [...prev, userMsg]);
    setInput("");
    setIsLoading(true);

    setTimeout(() => {
      const botMsg: Message = { 
        id: (Date.now() + 1).toString(), 
        role: "bot", 
        character: activeChar.name,
        content: `بصفتي ${activeChar.name}، وبعد مراجعة نظام القوانين في قاعدتي البيانية، أرى أن موقفك يتطلب...`,
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
        <div className="lg:col-span-3 hidden lg:flex flex-col gap-4">
          <div className="glass-cosmic p-6 rounded-[2.5rem] space-y-6">
            <h3 className="font-black text-primary text-xl px-2 flex items-center justify-end gap-2">
              الوعي القانوني
              <Zap className="h-5 w-5 text-accent" />
            </h3>
            <div className="space-y-3">
              {CHARACTERS.map((char) => (
                <button
                  key={char.id}
                  onClick={() => setActiveChar(char)}
                  className={`w-full flex items-center gap-4 p-4 rounded-3xl transition-all duration-500 border-2 ${
                    activeChar.id === char.id 
                    ? 'border-accent bg-accent/10 shadow-xl scale-105' 
                    : 'border-transparent opacity-60 hover:opacity-100 hover:bg-white/5'
                  }`}
                >
                  <div className={`h-12 w-12 rounded-2xl flex items-center justify-center text-2xl shadow-lg bg-gradient-to-br ${char.color} text-white`}>
                    {char.icon}
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-black">{char.name}</p>
                    <p className="text-[10px] opacity-70">{char.desc}</p>
                  </div>
                </button>
              ))}
            </div>
          </div>
          <div className="mt-auto glass-cosmic p-6 rounded-[2rem] flex items-center gap-3">
            <ShieldCheck className="h-10 w-10 text-accent" />
            <div className="text-right">
              <p className="text-[10px] font-bold">تشفير كوني نشط</p>
              <p className="text-[8px] opacity-50 uppercase">AES-256 Quantum Secure</p>
            </div>
          </div>
        </div>

        {/* Chat Interface */}
        <Card className="lg:col-span-9 glass-cosmic border-none rounded-[3rem] flex flex-col overflow-hidden relative shadow-2xl">
          {/* Active Character Header */}
          <div className="p-6 border-b flex items-center justify-between bg-white/10 dark:bg-black/20 backdrop-blur-md">
            <div className="flex items-center gap-4">
              <div className={`h-14 w-14 rounded-2xl bg-gradient-to-br ${activeChar.color} text-white flex items-center justify-center text-3xl shadow-xl animate-pulse`}>
                {activeChar.icon}
              </div>
              <div className="text-right">
                <h2 className="text-2xl font-black">{activeChar.name}</h2>
                <div className="flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-green-500 animate-ping" />
                  <span className="text-[10px] font-bold opacity-60">النظام متصل بالأقمار الصناعية</span>
                </div>
              </div>
            </div>
            <div className="flex gap-2">
              <Button variant="ghost" size="icon" className="rounded-2xl hover:bg-white/10"><History className="h-5 w-5" /></Button>
              <Button variant="ghost" size="icon" className="rounded-2xl hover:bg-red-500/20 text-red-500"><Trash2 className="h-5 w-5" /></Button>
            </div>
          </div>

          {/* Messages Area */}
          <ScrollArea className="flex-grow p-8" ref={scrollRef}>
            <div className="max-w-4xl mx-auto space-y-10">
              {messages.map((msg) => (
                <div key={msg.id} className={`flex gap-6 ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                  <div className={`h-14 w-14 rounded-2xl flex items-center justify-center shrink-0 shadow-2xl ${
                    msg.role === 'bot' ? `bg-gradient-to-br ${activeChar.color}` : 'bg-primary'
                  } text-white`}>
                    {msg.role === 'bot' ? <span className="text-3xl">{activeChar.icon}</span> : <User className="h-8 w-8" />}
                  </div>
                  <div className={`max-w-[80%] space-y-2 ${msg.role === 'user' ? 'text-left' : 'text-right'}`}>
                    <div className={`p-8 rounded-[2.5rem] text-lg leading-relaxed shadow-xl ${
                      msg.role === 'bot' 
                      ? 'bg-white/80 dark:bg-zinc-900/80 backdrop-blur-xl border border-white/20 rounded-tr-none' 
                      : 'cosmic-gradient text-white rounded-tl-none'
                    }`}>
                      {msg.content}
                    </div>
                    <span className="text-[10px] opacity-40 px-4">
                      {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                </div>
              ))}
              {isLoading && (
                <div className="flex gap-6 animate-pulse">
                  <div className={`h-14 w-14 rounded-2xl bg-gradient-to-br ${activeChar.color} text-white flex items-center justify-center shrink-0`}>
                    <Sparkles className="h-7 w-7 animate-spin-slow" />
                  </div>
                  <div className="bg-white/40 dark:bg-zinc-900/40 p-8 rounded-[2.5rem] rounded-tr-none flex gap-3 items-center">
                    <div className="w-3 h-3 bg-accent rounded-full animate-bounce" />
                    <div className="w-3 h-3 bg-accent rounded-full animate-bounce [animation-delay:0.2s]" />
                    <div className="w-3 h-3 bg-accent rounded-full animate-bounce [animation-delay:0.4s]" />
                  </div>
                </div>
              )}
            </div>
          </ScrollArea>

          {/* Input Center */}
          <div className="p-8 bg-white/20 dark:bg-black/20 backdrop-blur-2xl border-t">
            <div className="max-w-4xl mx-auto flex gap-4 items-end">
              <div className="flex gap-2 pb-1">
                <Button type="button" variant="ghost" size="icon" className="rounded-2xl h-14 w-14 bg-white/10 hover:bg-accent hover:text-white transition-all">
                  <Paperclip className="h-6 w-6" />
                </Button>
                <Button type="button" variant="ghost" size="icon" className="rounded-2xl h-14 w-14 bg-white/10 hover:bg-accent hover:text-white transition-all">
                  <Camera className="h-6 w-6" />
                </Button>
              </div>
              <div className="flex-grow relative">
                <Input 
                  placeholder={`تحدث مع ${activeChar.name}...`} 
                  className="pr-6 pl-16 text-right glass-cosmic border-none rounded-[2rem] h-16 text-xl shadow-inner focus-visible:ring-accent"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                />
                <Button 
                  onClick={handleSend} 
                  className="absolute left-2 top-2 h-12 w-12 rounded-2xl cosmic-gradient text-white shadow-xl hover:scale-105 active:scale-95 transition-all"
                >
                  <Send className="h-6 w-6 rotate-180" />
                </Button>
              </div>
              <Button type="button" variant="ghost" size="icon" className="rounded-2xl h-14 w-14 bg-red-500/10 hover:bg-red-500 hover:text-white transition-all">
                <Mic className="h-6 w-6" />
              </Button>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
