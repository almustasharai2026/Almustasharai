
"use client";

import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  BrainCircuit, 
  Send, 
  User, 
  Bot, 
  Sparkles, 
  Paperclip, 
  Camera, 
  Mic, 
  X, 
  Image as ImageIcon,
  FileText,
  Volume2,
  Settings2
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import Image from "next/image";

type Message = {
  id: string;
  role: "user" | "bot";
  content: string;
  timestamp: Date;
  attachments?: { type: 'image' | 'file' | 'audio', url: string, name?: string }[];
  character?: string;
};

const CHARACTERS = [
  { id: "lawyer", name: "محامي", en: "Lawyer", icon: "⚖️", color: "bg-blue-500" },
  { id: "judge", name: "قاضي", en: "Judge", icon: "👨‍⚖️", color: "bg-red-600" },
  { id: "consultant", name: "مستشار", en: "Consultant", icon: "📋", color: "bg-green-600" },
  { id: "notary", name: "كاتب عدل", en: "Notary", icon: "🖋️", color: "bg-amber-600" },
  { id: "forensic", name: "خبير جنائي", en: "Forensic", icon: "🔍", color: "bg-purple-600" },
  { id: "arbitrator", name: "محكم", en: "Arbitrator", icon: "🤝", color: "bg-teal-600" },
  { id: "prosecutor", name: "مدعي عام", en: "Prosecutor", icon: "📜", color: "bg-indigo-600" },
  { id: "mediator", name: "وسيط", en: "Mediator", icon: "🕊️", color: "bg-emerald-500" },
  { id: "researcher", name: "باحث قانوني", en: "Researcher", icon: "📚", color: "bg-gray-600" },
];

export default function BotPage() {
  const [messages, setMessages] = useState<Message[]>([
    { 
      id: "1", 
      role: "bot", 
      content: "مرحباً بك في منصة المستشار الذكية. أنا مساعدك القانوني. اختر الشخصية التي تود التحدث إليها وابدأ في طرح استفساراتك.", 
      timestamp: new Date() 
    }
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [activeChar, setActiveChar] = useState(CHARACTERS[0]);
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const [hasCameraPermission, setHasCameraPermission] = useState(false);
  const [attachments, setAttachments] = useState<{ type: 'image' | 'file' | 'audio', url: string, name?: string }[]>([]);
  
  const scrollRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  useEffect(() => {
    if (scrollRef.current) {
      const scrollContainer = scrollRef.current.querySelector('[data-radix-scroll-area-viewport]');
      if (scrollContainer) scrollContainer.scrollTop = scrollContainer.scrollHeight;
    }
  }, [messages]);

  const openCamera = async () => {
    setIsCameraOpen(true);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      setHasCameraPermission(true);
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (error) {
      console.error('Error accessing camera:', error);
      setHasCameraPermission(false);
      toast({
        variant: 'destructive',
        title: 'خطأ في الكاميرا',
        description: 'يرجى السماح بالوصول للكاميرا في إعدادات المتصفح.',
      });
    }
  };

  const capturePhoto = () => {
    if (videoRef.current) {
      const canvas = document.createElement('canvas');
      canvas.width = videoRef.current.videoWidth;
      canvas.height = videoRef.current.videoHeight;
      const ctx = canvas.getContext('2d');
      ctx?.drawImage(videoRef.current, 0, 0);
      const dataUrl = canvas.toDataURL('image/jpeg');
      setAttachments([...attachments, { type: 'image', url: dataUrl, name: 'Photo' }]);
      closeCamera();
    }
  };

  const closeCamera = () => {
    if (videoRef.current?.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach(track => track.stop());
    }
    setIsCameraOpen(false);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setAttachments([...attachments, { 
          type: file.type.startsWith('image/') ? 'image' : 'file', 
          url: event.target?.result as string, 
          name: file.name 
        }]);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSend = async () => {
    if (!input.trim() && attachments.length === 0) return;

    const userMsg: Message = { 
      id: Date.now().toString(), 
      role: "user", 
      content: input, 
      timestamp: new Date(),
      attachments: attachments
    };
    
    setMessages(prev => [...prev, userMsg]);
    setInput("");
    setAttachments([]);
    setIsLoading(true);

    // AI Response Simulation
    setTimeout(() => {
      const botMsg: Message = { 
        id: (Date.now() + 1).toString(), 
        role: "bot", 
        character: activeChar.name,
        content: `بصفتي ${activeChar.name}، قمت بتحليل طلبك. فيما يخص "${input || 'الملفات المرفقة'}"، تنصح القوانين السائدة بـ... هل ترغب في تفصيل أكثر؟`, 
        timestamp: new Date() 
      };
      setMessages(prev => [...prev, botMsg]);
      setIsLoading(false);
    }, 1500);
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl text-right h-[calc(100vh-8rem)] flex flex-col" dir="rtl">
      
      {/* Characters Header - Horizontal Scrollable */}
      <div className="flex gap-4 overflow-x-auto pb-4 mb-4 no-scrollbar">
        {CHARACTERS.map((char) => (
          <button
            key={char.id}
            onClick={() => setActiveChar(char)}
            className={`flex flex-col items-center gap-2 p-3 rounded-2xl transition-all shrink-0 min-w-[100px] border-2 ${
              activeChar.id === char.id ? 'border-accent bg-accent/5 scale-105' : 'border-transparent bg-muted/30 opacity-60'
            }`}
          >
            <div className={`h-12 w-12 rounded-full flex items-center justify-center text-2xl shadow-sm ${char.color} text-white`}>
              {char.icon}
            </div>
            <span className="text-xs font-bold">{char.name}</span>
          </button>
        ))}
      </div>

      <div className="grid lg:grid-cols-4 gap-6 flex-grow overflow-hidden">
        
        {/* Sidebar Info */}
        <div className="lg:col-span-1 hidden lg:flex flex-col gap-4">
          <Card className="bg-primary text-primary-foreground border-none shadow-lg">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 justify-end text-lg">
                {activeChar.name} الذكي
                <Sparkles className="h-5 w-5 text-accent" />
              </CardTitle>
            </CardHeader>
            <CardContent className="text-xs opacity-90 leading-relaxed">
              تتحدث الآن مع {activeChar.name}. هذا المساعد مدعوم بتقنيات Gemini لتحليل النصوص والصور والملفات القانونية.
            </CardContent>
          </Card>

          <div className="space-y-2">
            <h3 className="font-bold text-primary text-sm px-2">اقتراحات لهذا الدور</h3>
            <Button variant="outline" className="w-full text-right justify-start text-xs h-auto py-3 bg-card hover:border-accent" onClick={() => setInput("ما هي الإجراءات القانونية المتبعة؟")}>ما هي الإجراءات القانونية المتبعة؟</Button>
            <Button variant="outline" className="w-full text-right justify-start text-xs h-auto py-3 bg-card hover:border-accent" onClick={() => setInput("هل يمكن تحليل هذا المستند؟")}>هل يمكن تحليل هذا المستند؟</Button>
          </div>
        </div>

        {/* Chat Area */}
        <Card className="lg:col-span-3 flex flex-col shadow-xl border-accent/10 overflow-hidden relative">
          
          {/* Camera Overlay */}
          {isCameraOpen && (
            <div className="absolute inset-0 z-50 bg-black flex flex-col items-center justify-center p-4">
              <Button variant="ghost" className="absolute top-4 right-4 text-white" onClick={closeCamera}><X className="h-8 w-8" /></Button>
              <video ref={videoRef} className="w-full max-w-md rounded-2xl aspect-video bg-muted" autoPlay muted />
              {!hasCameraPermission && (
                <Alert variant="destructive" className="mt-4 max-w-md">
                  <AlertTitle>مطلوب إذن الكاميرا</AlertTitle>
                  <AlertDescription>يرجى السماح بالوصول للكاميرا لاستخدام هذه الميزة.</AlertDescription>
                </Alert>
              )}
              <Button onClick={capturePhoto} className="mt-6 h-16 w-16 rounded-full bg-white text-black hover:bg-white/90 border-4 border-accent">
                <div className="h-10 w-10 rounded-full border-2 border-black" />
              </Button>
            </div>
          )}

          <CardHeader className="border-b bg-muted/30 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3 text-primary font-bold">
                <div className={`h-10 w-10 rounded-xl ${activeChar.color} text-white flex items-center justify-center text-xl`}>
                  {activeChar.icon}
                </div>
                <div>
                  <h2 className="text-lg leading-none">{activeChar.name}</h2>
                  <span className="text-[10px] text-muted-foreground">نشط الآن للمساعدة القانونية</span>
                </div>
              </div>
              <Button variant="ghost" size="icon"><Settings2 className="h-5 w-5" /></Button>
            </div>
          </CardHeader>
          
          <CardContent className="flex-grow overflow-hidden p-0 relative bg-muted/10">
            <ScrollArea className="h-full p-6" ref={scrollRef}>
              <div className="space-y-6">
                {messages.map((msg) => (
                  <div key={msg.id} className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                    <div className={`h-10 w-10 rounded-2xl flex items-center justify-center shrink-0 shadow-sm ${msg.role === 'bot' ? activeChar.color : 'bg-accent'} text-white`}>
                      {msg.role === 'bot' ? <span className="text-xl">{activeChar.icon}</span> : <User className="h-6 w-6" />}
                    </div>
                    <div className="max-w-[85%] space-y-2">
                      <div className={`p-4 rounded-3xl ${msg.role === 'bot' ? 'bg-card rounded-tr-none' : 'bg-primary text-white rounded-tl-none shadow-md'}`}>
                        <p className="text-sm leading-relaxed">{msg.content}</p>
                        
                        {/* Message Attachments */}
                        {msg.attachments && msg.attachments.length > 0 && (
                          <div className="mt-3 flex flex-wrap gap-2">
                            {msg.attachments.map((att, i) => (
                              <div key={i} className="rounded-lg overflow-hidden border bg-background/20 max-w-[150px]">
                                {att.type === 'image' ? (
                                  <img src={att.url} alt="Attached" className="h-24 w-full object-cover" />
                                ) : (
                                  <div className="p-2 flex items-center gap-2 text-[10px]">
                                    <FileText className="h-4 w-4" />
                                    <span className="truncate">{att.name}</span>
                                  </div>
                                )}
                              </div>
                            ))}
                          </div>
                        )}

                        <span className={`text-[10px] mt-2 block opacity-50 ${msg.role === 'user' ? 'text-left' : 'text-right'}`}>
                          {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
                {isLoading && (
                  <div className="flex gap-3">
                    <div className={`h-10 w-10 rounded-2xl ${activeChar.color} text-white flex items-center justify-center shrink-0`}>
                      <Bot className="h-6 w-6 animate-bounce" />
                    </div>
                    <div className="bg-card p-4 rounded-3xl rounded-tr-none flex gap-1 items-center">
                      <div className="w-1.5 h-1.5 bg-accent rounded-full animate-bounce" />
                      <div className="w-1.5 h-1.5 bg-accent rounded-full animate-bounce [animation-delay:0.2s]" />
                      <div className="w-1.5 h-1.5 bg-accent rounded-full animate-bounce [animation-delay:0.4s]" />
                    </div>
                  </div>
                )}
              </div>
            </ScrollArea>
          </CardContent>

          <div className="p-4 border-t bg-card space-y-4">
            
            {/* Attachment Preview */}
            {attachments.length > 0 && (
              <div className="flex gap-2 overflow-x-auto pb-2">
                {attachments.map((att, i) => (
                  <div key={i} className="relative h-16 w-16 rounded-lg border bg-muted shrink-0 group">
                    <button 
                      onClick={() => setAttachments(prev => prev.filter((_, idx) => idx !== i))}
                      className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full p-0.5 z-10 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X className="h-3 w-3" />
                    </button>
                    {att.type === 'image' ? (
                      <img src={att.url} className="h-full w-full object-cover rounded-lg" />
                    ) : (
                      <div className="h-full w-full flex items-center justify-center"><FileText className="h-6 w-6 text-muted-foreground" /></div>
                    )}
                  </div>
                ))}
              </div>
            )}

            <form onSubmit={(e) => { e.preventDefault(); handleSend(); }} className="flex gap-2 items-end">
              <div className="flex gap-1 shrink-0">
                <input type="file" ref={fileInputRef} onChange={handleFileUpload} className="hidden" />
                <Button type="button" variant="ghost" size="icon" className="text-muted-foreground hover:text-accent" onClick={() => fileInputRef.current?.click()}><Paperclip className="h-5 w-5" /></Button>
                <Button type="button" variant="ghost" size="icon" className="text-muted-foreground hover:text-accent" onClick={openCamera}><Camera className="h-5 w-5" /></Button>
                <Button type="button" variant="ghost" size="icon" className="text-muted-foreground hover:text-accent"><Mic className="h-5 w-5" /></Button>
              </div>
              
              <div className="flex-grow relative">
                <Input 
                  placeholder={`تحدث مع الـ ${activeChar.name}...`} 
                  className="pr-4 pl-12 text-right bg-muted/30 focus-visible:ring-accent rounded-2xl h-12"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  disabled={isLoading}
                />
                <Button 
                  type="submit" 
                  size="icon" 
                  className="absolute left-1 top-1 h-10 w-10 rounded-xl bg-accent hover:bg-accent/90" 
                  disabled={isLoading || (!input.trim() && attachments.length === 0)}
                >
                  <Send className="h-5 w-5 rotate-180" />
                </Button>
              </div>
            </form>
          </div>
        </Card>
      </div>
    </div>
  );
}
