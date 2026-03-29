
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
  AlertTriangle,
  ChevronLeft,
  Settings,
  X
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
  { id: "lawyer", name: "المحامي الفائق", icon: "⚖️", color: "from-blue-600 via-indigo-700 to-indigo-900", desc: "خبير القضايا والنزاعات المعقدة" },
  { id: "judge", name: "خبير القضاء", icon: "👨‍⚖️", color: "from-slate-700 via-slate-800 to-slate-950", desc: "رؤية ثاقبة من منصة الحكم" },
  { id: "consultant", name: "مستشار استراتيجي", icon: "🏢", color: "from-emerald-600 via-teal-700 to-teal-900", desc: "نمو الشركات والصفقات التجارية" },
  { id: "notary", name: "الكاتب العدل", icon: "✒️", color: "from-amber-600 via-orange-700 to-orange-900", desc: "صحة وتوثيق المستندات والوكالات" },
  { id: "forensic", name: "خبير جنائي", icon: "🔍", color: "from-zinc-700 via-zinc-800 to-black", desc: "تحليل الأدلة الجنائية والتقنية" },
  { id: "arbitrator", name: "المحكم الدولي", icon: "🌍", color: "from-violet-600 via-purple-700 to-purple-900", desc: "فض النزاعات الدولية والعقود" },
  { id: "mediator", name: "الوسيط القانوني", icon: "🤝", color: "from-sky-500 via-blue-600 to-blue-800", desc: "حلول ودية سريعة خارج المحاكم" },
  { id: "researcher", name: "الباحث الأكاديمي", icon: "📚", color: "from-green-600 via-emerald-700 to-emerald-900", desc: "دراسات فقهية وقانونية عميقة" },
  { id: "prosecutor", name: "المدعي العام", icon: "📜", color: "from-rose-600 via-red-700 to-red-900", desc: "حماية الحقوق العامة والادعاء" },
];

const DISCLAIMER_TEXT = "\n\n--- \n⚠️ إخلاء مسؤولية: هذا الرد نتاج تحليل ذكاء اصطناعي لأغراض استرشادية فقط. لا يعتبر نصيحة قانونية نهائية، ويُنصح دائماً بمراجعة محامي مختص قبل اتخاذ أي إجراء قانوني.";

export default function BotPage() {
  const [messages, setMessages] = useState<Message[]>([
    { id: "1", role: "bot", content: "مرحباً بك في مركز القيادة القانونية الذكي. أي من خبرائنا التسعة تود استشارته اليوم؟", timestamp: new Date() }
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [activeChar, setActiveChar] = useState(CHARACTERS[0]);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
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
      title: `تم تفعيل ${char.name}`,
      description: `النظام مهيأ الآن لاستقبال استشارات ${char.desc}`,
    });
  };

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;
    
    const userMsg: Message = { id: Date.now().toString(), role: "user", content: input, timestamp: new Date() };
    setMessages(prev => [...prev, userMsg]);
    setInput("");
    setIsLoading(true);

    // AI Simulation with high precision logic
    setTimeout(() => {
      const botMsg: Message = { 
        id: (Date.now() + 1).toString(), 
        role: "bot", 
        character: activeChar.name,
        content: `بصفتي ${activeChar.name}، قمت بتحليل استفسارك بعناية فائقة. بناءً على المعطيات القانونية والتشريعات ذات الصلة بـ (${activeChar.desc})، إليك التحليل المبدئي:\n\n1. الوصف القانوني للحالة يتطلب تدقيقاً في المستندات.\n2. الإجراء المقترح هو البدء بتوثيق المطالبة رسمياً.\n3. هناك سوابق تدعم موقفك إذا تم إثبات الضرر المباشر.` + DISCLAIMER_TEXT,
        timestamp: new Date() 
      };
      setMessages(prev => [...prev, botMsg]);
      setIsLoading(false);
    }, 2000);
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-[1600px] h-[calc(100vh-8rem)] flex flex-col gap-6" dir="rtl">
      <div className="grid lg:grid-cols-12 gap-6 flex-grow overflow-hidden">
        
        {/* Sidebar: Character Selection (Cosmic Style) */}
        <div className={`lg:col-span-3 flex flex-col gap-4 overflow-y-auto pr-2 transition-all duration-500 ${isSidebarOpen ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0 absolute'}`}>
          <div className="glass-cosmic p-8 rounded-[2.5rem] space-y-6 border-white/5">
            <h3 className="font-black text-white text-xl px-2 flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-primary/20 flex items-center justify-center">
                <Zap className="h-6 w-6 text-primary animate-pulse" />
              </div>
              طاقم الخبراء
            </h3>
            <div className="space-y-3">
              {CHARACTERS.map((char) => (
                <button
                  key={char.id}
                  onClick={() => handleSelectCharacter(char)}
                  className={`w-full flex items-center gap-4 p-4 rounded-2xl transition-all border group ${
                    activeChar.id === char.id 
                    ? 'border-primary/40 bg-primary/10 shadow-xl shadow-primary/5' 
                    : 'border-transparent hover:bg-white/5'
                  }`}
                >
                  <div className={`h-12 w-12 rounded-2xl flex items-center justify-center text-2xl bg-gradient-to-br ${char.color} shadow-lg transition-transform group-hover:scale-110`}>
                    {char.icon}
                  </div>
                  <div className="text-right flex-grow">
                    <p className="text-sm font-black text-white">{char.name}</p>
                    <p className="text-[10px] text-muted-foreground opacity-60 line-clamp-1">{char.desc}</p>
                  </div>
                  {activeChar.id === char.id && <div className="h-2 w-2 rounded-full bg-primary animate-pulse" />}
                </button>
              ))}
            </div>
          </div>
          
          <div className="mt-auto glass-card p-6 rounded-2xl flex items-center gap-4 bg-red-500/5 border-red-500/10">
            <AlertTriangle className="h-8 w-8 text-red-500 opacity-40 shrink-0" />
            <div className="text-right">
              <p className="text-xs font-black text-red-500 mb-1">تنبيه قانوني هام</p>
              <p className="text-[9px] opacity-70 leading-relaxed text-muted-foreground">الردود الصادرة هي تحليل ذكي للأغراض الاسترشادية وليست نصيحة مهنية ملزمة.</p>
            </div>
          </div>
        </div>

        {/* Main Chat Area (Supreme Control Center) */}
        <Card className={`${isSidebarOpen ? 'lg:col-span-9' : 'lg:col-span-12'} glass-cosmic border-none rounded-[3rem] flex flex-col overflow-hidden relative shadow-2xl transition-all duration-500`}>
          
          {/* Chat Header */}
          <div className="p-6 border-b border-white/5 flex items-center justify-between bg-slate-900/40 backdrop-blur-3xl relative z-20">
            <div className="flex items-center gap-5">
              <Button variant="ghost" size="icon" className="h-10 w-10 rounded-xl glass hover:bg-white/10 lg:hidden" onClick={() => setIsSidebarOpen(!isSidebarOpen)}>
                 <Settings className="h-5 w-5" />
              </Button>
              <div className={`h-14 w-14 rounded-2xl bg-gradient-to-br ${activeChar.color} flex items-center justify-center text-3xl shadow-2xl relative overflow-hidden group`}>
                <div className="absolute inset-0 bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity" />
                {activeChar.icon}
              </div>
              <div className="text-right">
                <h2 className="text-xl font-black text-white flex items-center gap-2">
                  {activeChar.name}
                  <Badge variant="outline" className="text-[8px] border-primary/20 text-primary py-0 px-2 rounded-full font-bold">نشط الآن</Badge>
                </h2>
                <span className="text-[11px] text-primary flex items-center gap-2 font-bold opacity-60">
                  <span className="h-1.5 w-1.5 rounded-full bg-green-500 animate-pulse shadow-[0_0_10px_rgba(34,197,94,1)]" />
                  بروتوكول التحليل الذكي مفعل
                </span>
              </div>
            </div>
            <div className="flex gap-3">
              <Button 
                variant="ghost" 
                size="icon" 
                className="h-12 w-12 rounded-2xl glass hover:bg-red-500/20 text-red-500 transition-all"
                onClick={() => setMessages([{ id: "1", role: "bot", content: "تم إعادة تهيئة مركز القيادة. أي خبير تود التحدث إليه؟", timestamp: new Date() }])}
              >
                <Trash2 className="h-5 w-5" />
              </Button>
              <Button 
                variant="ghost" 
                size="icon" 
                className="h-12 w-12 rounded-2xl glass hover:bg-primary/20 text-primary hidden lg:flex"
                onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              >
                {isSidebarOpen ? <X className="h-5 w-5" /> : <Settings className="h-5 w-5" />}
              </Button>
            </div>
          </div>

          {/* Messages List */}
          <ScrollArea className="flex-grow p-8" ref={scrollRef}>
            <div className="max-w-5xl mx-auto space-y-10 pb-8">
              {messages.map((msg) => (
                <div key={msg.id} className={`flex gap-6 ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'} animate-in fade-in slide-in-from-bottom-4 duration-500`}>
                  <div className={`h-14 w-14 rounded-2xl flex items-center justify-center shrink-0 shadow-2xl transition-transform hover:scale-110 ${
                    msg.role === 'bot' ? `bg-gradient-to-br ${CHARACTERS.find(c => c.name === msg.character)?.color || activeChar.color}` : 'cosmic-gradient'
                  } text-white`}>
                    {msg.role === 'bot' ? <span className="text-2xl">{CHARACTERS.find(c => c.name === msg.character)?.icon || activeChar.icon}</span> : <User className="h-7 w-7" />}
                  </div>
                  <div className={`max-w-[85%] space-y-3 ${msg.role === 'user' ? 'text-left' : 'text-right'}`}>
                    <div className={`p-6 md:p-8 rounded-[2rem] text-sm md:text-xl leading-relaxed whitespace-pre-wrap shadow-2xl relative group ${
                      msg.role === 'bot' 
                      ? 'bg-slate-900/60 border border-white/5 text-white rounded-tr-none' 
                      : 'cosmic-gradient text-white rounded-tl-none font-bold'
                    }`}>
                      {msg.content}
                      
                      {msg.id === "1" && (
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mt-8">
                          {CHARACTERS.map((char) => (
                            <Button
                              key={char.id}
                              variant="outline"
                              className="glass border-white/10 hover:border-primary/50 h-auto py-4 px-3 flex flex-col items-center gap-2 rounded-2xl group transition-all"
                              onClick={() => handleSelectCharacter(char)}
                            >
                              <span className="text-2xl group-hover:scale-125 transition-transform">{char.icon}</span>
                              <span className="text-[11px] font-black text-white">{char.name}</span>
                            </Button>
                          ))}
                        </div>
                      )}
                      
                      {/* Message Tail Decoration */}
                      <div className={`absolute top-0 w-4 h-4 ${msg.role === 'user' ? 'left-[-4px] bg-primary' : 'right-[-4px] bg-slate-900/60'} -z-10`} style={{ clipPath: 'polygon(100% 0, 0 0, 100% 100%)' }} />
                    </div>
                    <span className="text-[10px] opacity-40 px-4 font-bold flex items-center gap-2 justify-end">
                      {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      <ShieldCheck className="h-3 w-3 text-emerald-500" />
                    </span>
                  </div>
                </div>
              ))}
              {isLoading && (
                <div className="flex gap-6 animate-pulse">
                  <div className="h-14 w-14 rounded-2xl bg-primary/20 flex items-center justify-center">
                    <Loader2 className="h-7 w-7 animate-spin text-primary" />
                  </div>
                  <div className="bg-slate-900/60 p-8 rounded-[2rem] rounded-tr-none w-48 flex gap-3 items-center justify-center border border-white/5">
                    <div className="w-3 h-3 bg-primary rounded-full animate-bounce" />
                    <div className="w-3 h-3 bg-primary rounded-full animate-bounce [animation-delay:0.2s]" />
                    <div className="w-3 h-3 bg-primary rounded-full animate-bounce [animation-delay:0.4s]" />
                  </div>
                </div>
              )}
            </div>
          </ScrollArea>

          {/* Input Panel (Supreme Integration) */}
          <div className="p-8 bg-slate-950/80 backdrop-blur-3xl border-t border-white/5 relative z-20">
            <div className="max-w-5xl mx-auto flex gap-4 items-end">
              <div className="flex gap-2 pb-1">
                <Button type="button" variant="ghost" size="icon" className="h-14 w-14 rounded-2xl glass hover:bg-primary/20 transition-all group" title="ارفاق ملفات">
                  <Paperclip className="h-6 w-6 group-hover:rotate-45 transition-transform" />
                </Button>
                <Button type="button" variant="ghost" size="icon" className="h-14 w-14 rounded-2xl glass hover:bg-primary/20 transition-all group" title="استخدام الكاميرا">
                  <Camera className="h-6 w-6 group-hover:scale-110 transition-transform" />
                </Button>
              </div>
              <div className="flex-grow relative">
                <Input 
                  placeholder={`اكتب استشارتك لـ ${activeChar.name}...`} 
                  className="pr-6 pl-20 text-right glass border-white/5 rounded-[1.5rem] h-16 text-xl focus-visible:ring-2 ring-primary/40 placeholder:opacity-30"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                />
                <Button 
                  onClick={handleSend} 
                  disabled={isLoading || !input.trim()}
                  className="absolute left-2.5 top-2.5 h-11 px-6 rounded-xl btn-primary group overflow-hidden"
                >
                  <Send className="h-5 w-5 rotate-180 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                </Button>
              </div>
              <Button type="button" variant="ghost" size="icon" className="h-14 w-14 rounded-2xl bg-red-600/10 text-red-500 hover:bg-red-600 hover:text-white transition-all shadow-lg hover:shadow-red-600/20" title="رسالة صوتية">
                <Mic className="h-6 w-6" />
              </Button>
            </div>
            <p className="text-[9px] text-center mt-4 opacity-30 font-bold uppercase tracking-[0.2em]">الذكاء الاصطناعي القانوني - الفئة الرابعة المتقدمة</p>
          </div>
        </Card>
      </div>
    </div>
  );
}
