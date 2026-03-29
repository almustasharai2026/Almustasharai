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
  Trash2,
  ShieldCheck,
  Zap,
  Info,
  Loader2,
  AlertTriangle
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
  { id: "lawyer", name: "المحامي الفائق", icon: "⚖️", color: "from-blue-600 to-indigo-800", desc: "خبير القضايا المعقدة" },
  { id: "judge", name: "خبير القضاء", icon: "👨‍⚖️", color: "from-slate-700 to-slate-900", desc: "رؤية منصة الحكم" },
  { id: "consultant", name: "مستشار استراتيجي", icon: "🏢", color: "from-emerald-600 to-teal-900", desc: "نمو الشركات والصفقات" },
  { id: "notary", name: "الكاتب العدل", icon: "✒️", color: "from-amber-600 to-orange-800", desc: "صحة وتوثيق المستندات" },
  { id: "forensic", name: "خبير جنائي", icon: "🔍", color: "from-zinc-700 to-black", desc: "تحليل الأدلة الجنائية" },
  { id: "arbitrator", name: "المحكم الدولي", icon: "🌍", color: "from-violet-600 to-purple-800", desc: "فض النزاعات الدولية" },
  { id: "mediator", name: "الوسيط القانوني", icon: "🤝", color: "from-sky-500 to-blue-700", desc: "حلول ودية سريعة" },
  { id: "researcher", name: "الباحث الأكاديمي", icon: "📚", color: "from-green-600 to-emerald-800", desc: "دراسات فقهية عميقة" },
  { id: "prosecutor", name: "المدعي العام", icon: "📜", color: "from-rose-600 to-red-800", desc: "حماية الحقوق العامة" },
];

const DISCLAIMER_TEXT = "\n\n--- \n⚠️ إخلاء مسؤولية: هذا الرد نتاج تحليل ذكاء اصطناعي لأغراض استرشادية فقط. لا يعتبر نصيحة قانونية نهائية، ويُنصح دائماً بمراجعة محامي مختص قبل اتخاذ أي إجراء قانوني.";

export default function BotPage() {
  const [messages, setMessages] = useState<Message[]>([
    { id: "1", role: "bot", content: "مرحباً بك في مركز القيادة القانونية الذكي. أي من خبرائنا تود استشارته اليوم؟", timestamp: new Date() }
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
    toast({
      title: "تم تفعيل الشخصية",
      description: `أنت الآن تتحدث مع ${char.name}`,
    });
  };

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;
    
    const userMsg: Message = { id: Date.now().toString(), role: "user", content: input, timestamp: new Date() };
    setMessages(prev => [...prev, userMsg]);
    setInput("");
    setIsLoading(true);

    // AI Simulation
    setTimeout(() => {
      const botMsg: Message = { 
        id: (Date.now() + 1).toString(), 
        role: "bot", 
        character: activeChar.name,
        content: `بصفتي ${activeChar.name}، قمت بتحليل استفسارك بعناية. إليك التحليل القانوني المبدئي بناءً على المعطيات المقدمة...` + DISCLAIMER_TEXT,
        timestamp: new Date() 
      };
      setMessages(prev => [...prev, botMsg]);
      setIsLoading(false);
    }, 1500);
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl h-[calc(100vh-8rem)] flex flex-col gap-6" dir="rtl">
      <div className="grid lg:grid-cols-12 gap-6 flex-grow overflow-hidden">
        
        {/* Sidebar: Character Selection */}
        <div className="lg:col-span-3 hidden lg:flex flex-col gap-4 overflow-y-auto pr-2 custom-scrollbar">
          <div className="glass-card p-6 rounded-[2rem] space-y-4">
            <h3 className="font-bold text-white text-lg px-2 flex items-center gap-2">
              <Zap className="h-5 w-5 text-primary" />
              طاقم الخبراء
            </h3>
            <div className="space-y-2">
              {CHARACTERS.map((char) => (
                <button
                  key={char.id}
                  onClick={() => handleSelectCharacter(char)}
                  className={`w-full flex items-center gap-3 p-3 rounded-xl transition-all border ${
                    activeChar.id === char.id 
                    ? 'border-primary bg-primary/10' 
                    : 'border-transparent hover:bg-white/5'
                  }`}
                >
                  <div className={`h-10 w-10 rounded-lg flex items-center justify-center text-xl bg-gradient-to-br ${char.color}`}>
                    {char.icon}
                  </div>
                  <div className="text-right flex-grow">
                    <p className="text-sm font-bold text-white">{char.name}</p>
                    <p className="text-[10px] text-muted-foreground">{char.desc}</p>
                  </div>
                </button>
              ))}
            </div>
          </div>
          
          <div className="mt-auto glass-card p-4 rounded-xl flex items-center gap-3 bg-red-500/5 border-red-500/20">
            <AlertTriangle className="h-5 w-5 text-red-500" />
            <div className="text-right">
              <p className="text-[10px] font-bold text-red-500">تنبيه قانوني</p>
              <p className="text-[8px] opacity-70">الردود استرشادية فقط ولا تعتبر نصيحة قانونية ملزمة.</p>
            </div>
          </div>
        </div>

        {/* Main Chat Area */}
        <Card className="lg:col-span-9 glass border-none rounded-[2rem] flex flex-col overflow-hidden relative shadow-2xl">
          
          {/* Chat Header */}
          <div className="p-4 border-b border-white/5 flex items-center justify-between bg-slate-900/50 backdrop-blur-md">
            <div className="flex items-center gap-4">
              <div className={`h-12 w-12 rounded-xl bg-gradient-to-br ${activeChar.color} flex items-center justify-center text-2xl shadow-lg`}>
                {activeChar.icon}
              </div>
              <div className="text-right">
                <h2 className="text-lg font-bold text-white">{activeChar.name}</h2>
                <span className="text-[10px] text-primary flex items-center gap-1">
                  <span className="h-1.5 w-1.5 rounded-full bg-green-500 animate-pulse" />
                  النظام جاهز للتحليل الذكي
                </span>
              </div>
            </div>
            <div className="flex gap-2">
              <Button 
                variant="ghost" 
                size="icon" 
                className="h-10 w-10 rounded-xl hover:bg-red-500/10 text-red-500"
                onClick={() => setMessages([{ id: "1", role: "bot", content: "مرحباً بك في مركز القيادة القانونية الذكي. أي من خبرائنا تود استشارته اليوم؟", timestamp: new Date() }])}
              >
                <Trash2 className="h-5 w-5" />
              </Button>
            </div>
          </div>

          {/* Messages List */}
          <ScrollArea className="flex-grow p-6" ref={scrollRef}>
            <div className="max-w-4xl mx-auto space-y-8 pb-4">
              {messages.map((msg) => (
                <div key={msg.id} className={`flex gap-4 ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'} animate-in fade-in slide-in-from-bottom-2`}>
                  <div className={`h-12 w-12 rounded-xl flex items-center justify-center shrink-0 shadow-lg ${
                    msg.role === 'bot' ? `bg-gradient-to-br ${CHARACTERS.find(c => c.name === msg.character)?.color || activeChar.color}` : 'bg-primary'
                  } text-white`}>
                    {msg.role === 'bot' ? <span>{CHARACTERS.find(c => c.name === msg.character)?.icon || activeChar.icon}</span> : <User className="h-6 w-6" />}
                  </div>
                  <div className={`max-w-[80%] space-y-2 ${msg.role === 'user' ? 'text-left' : 'text-right'}`}>
                    <div className={`p-5 rounded-2xl text-sm md:text-lg leading-relaxed whitespace-pre-wrap ${
                      msg.role === 'bot' 
                      ? 'bg-slate-800/50 border border-white/5 text-white rounded-tr-none' 
                      : 'bg-primary text-white rounded-tl-none'
                    }`}>
                      {msg.content}
                      
                      {msg.id === "1" && (
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-2 mt-6">
                          {CHARACTERS.map((char) => (
                            <Button
                              key={char.id}
                              variant="outline"
                              className="glass border-white/5 hover:border-primary/50 h-auto py-3 px-2 flex flex-col items-center gap-1 rounded-xl"
                              onClick={() => handleSelectCharacter(char)}
                            >
                              <span className="text-xl">{char.icon}</span>
                              <span className="text-[10px] font-bold">{char.name}</span>
                            </Button>
                          ))}
                        </div>
                      )}
                    </div>
                    <span className="text-[10px] opacity-40 px-2">
                      {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                </div>
              ))}
              {isLoading && (
                <div className="flex gap-4 animate-pulse">
                  <div className={`h-12 w-12 rounded-xl bg-primary/20 flex items-center justify-center`}>
                    <Loader2 className="h-6 w-6 animate-spin text-primary" />
                  </div>
                  <div className="bg-slate-800/50 p-5 rounded-2xl rounded-tr-none w-32 flex gap-2 items-center">
                    <div className="w-2 h-2 bg-primary rounded-full animate-bounce" />
                    <div className="w-2 h-2 bg-primary rounded-full animate-bounce [animation-delay:0.2s]" />
                    <div className="w-2 h-2 bg-primary rounded-full animate-bounce [animation-delay:0.4s]" />
                  </div>
                </div>
              )}
            </div>
          </ScrollArea>

          {/* Input Panel */}
          <div className="p-6 bg-slate-900/80 backdrop-blur-xl border-t border-white/5">
            <div className="max-w-4xl mx-auto flex gap-3 items-end">
              <div className="flex gap-2 pb-1">
                <Button type="button" variant="ghost" size="icon" className="h-12 w-12 rounded-xl glass hover:bg-primary/20 transition-all">
                  <Paperclip className="h-5 w-5" />
                </Button>
                <Button type="button" variant="ghost" size="icon" className="h-12 w-12 rounded-xl glass hover:bg-primary/20 transition-all">
                  <Camera className="h-5 w-5" />
                </Button>
              </div>
              <div className="flex-grow relative">
                <Input 
                  placeholder={`اكتب استشارتك لـ ${activeChar.name}...`} 
                  className="pr-6 pl-16 text-right glass border-white/5 rounded-2xl h-14 text-lg focus-visible:ring-1 ring-primary/50"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                />
                <Button 
                  onClick={handleSend} 
                  disabled={isLoading}
                  className="absolute left-2 top-2 h-10 w-10 rounded-xl btn-primary"
                >
                  <Send className="h-5 w-5 rotate-180" />
                </Button>
              </div>
              <Button type="button" variant="ghost" size="icon" className="h-12 w-12 rounded-xl bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white transition-all">
                <Mic className="h-5 w-5" />
              </Button>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
