
"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { useUser, useFirestore, useDoc, useCollection } from "@/firebase";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  Send, Sparkles, Plus, History, Camera, Mic, 
  Paperclip, ChevronLeft, Menu, X, 
  Loader2, Gavel, User, LayoutGrid, Scale,
  MessageCircle, AlertCircle, Image as ImageIcon, Archive, MicOff, CheckCircle2, ChevronRight,
  Coins, Settings, UserPlus, AlignLeft, Lightbulb, Terminal, FileText, AudioLines, Trash2, ArrowUp,
  Target, ShieldAlert, BarChart3, BrainCircuit, Activity
} from "lucide-react";
import { collection, addDoc, query, orderBy, serverTimestamp, doc, updateDoc, increment, limit, onSnapshot, deleteDoc } from "firebase/firestore";
import { useMemoFirebase } from "@/firebase/provider";
import { executeDecisionEngine, type DecisionOutput } from "@/ai/flows/decision-engine-flow";
import { useToast } from "@/hooks/use-toast";
import { motion, AnimatePresence } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";

const AI_LAYERS = [
  { id: "general", name: "الذكاء العام", icon: <MessageCircle />, color: "from-blue-500 to-blue-700", desc: "دردشة قانونية اعتيادية للإجابة السريعة." },
  { id: "expert", name: "محرك القرار السيادي", icon: <BrainCircuit />, color: "from-amber-500 to-amber-700", desc: "تحليل هيكلي عميق وخطوات عمل فورية." },
  { id: "predictive", name: "الذكاء التنبؤي", icon: <BarChart3 />, color: "from-purple-500 to-purple-700", desc: "توقع النتائج القضائية والاستراتيجيات المستقبلية." }
];

export default function SovereignDecisionBot() {
  const { user } = useUser();
  const db = useFirestore();
  const { toast } = useToast();
  
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [activeLayer, setActiveLayer] = useState(AI_LAYERS[1]);
  const [decisionData, setDecisionData] = useState<DecisionOutput | null>(null);
  const [userData, setUserData] = useState<any>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const scrollRef = useRef<HTMLDivElement>(null);

  // Monitor user for moderation & balance
  useEffect(() => {
    if (!db || !user) return;
    const unsub = onSnapshot(doc(db, "users", user.uid), (doc) => {
      const data = doc.data();
      setUserData(data);
      if (data?.isBanned) {
        window.location.href = "/";
        toast({ variant: "destructive", title: "حظر سيادي", description: "لقد تم حظرك من النظام لمخالفة القوانين." });
      }
    });
    return () => unsub();
  }, [db, user]);

  const wordsQuery = useMemoFirebase(() => collection(db!, "settings", "moderation", "forbiddenWords"), [db]);
  const { data: forbiddenWords } = useCollection(wordsQuery);

  const handleSend = async () => {
    if (!input.trim() || isLoading || !user || !userData) return;

    // Real-time Moderation Trigger
    const violation = forbiddenWords?.find(fw => input.toLowerCase().includes(fw.word.toLowerCase()));
    if (violation) {
      await updateDoc(doc(db!, "users", user.uid), { isBanned: true });
      toast({ variant: "destructive", title: "انتهاك سيادي!", description: "تم حظر حسابك فوراً لمحاولة استخدام لغة محظورة." });
      return;
    }

    if (userData.balance < 1 && userData.role !== 'admin') {
      toast({ variant: "destructive", title: "رصيد غير كافٍ", description: "يرجى شحن المحفظة للمتابعة." });
      return;
    }

    setIsLoading(true);
    setDecisionData(null);

    try {
      if (activeLayer.id === "expert") {
        const result = await executeDecisionEngine({ context: input });
        setDecisionData(result);
        
        // Log transaction
        if (userData.role !== 'admin') {
          await updateDoc(doc(db!, "users", user.uid), { balance: increment(-2) });
          await addDoc(collection(db!, "users", user.uid, "transactions"), {
            amount: -2,
            service: "محرك القرار السيادي",
            type: "deduction",
            timestamp: new Date().toISOString()
          });
        }
      } else {
        // Fallback or General Chat Logic
        toast({ title: "الوضع قيد التطوير", description: "هذه الطبقة ستتوفر قريباً بنسختها الكاملة." });
      }
      
      setInput("");
    } catch (e) {
      toast({ variant: "destructive", title: "فشل السيادة", description: "تعذر الوصول لمحرك القرار حالياً." });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex h-screen bg-[#02040a] text-white overflow-hidden font-sans" dir="rtl">
      
      {/* Ecosystem Sidebar */}
      <aside className="hidden lg:flex w-80 flex-col bg-[#0a0c14] border-l border-white/5 p-6 flex-shrink-0">
          <div className="flex items-center gap-4 mb-12">
             <div className="h-12 w-12 rounded-2xl bg-indigo-600 flex items-center justify-center shadow-2xl">
                <Target className="h-6 w-6" />
             </div>
             <h2 className="text-xl font-black tracking-tighter">محرك <span className="text-primary">القرار</span></h2>
          </div>

          <div className="flex-1 space-y-8">
            <div className="space-y-4">
               <p className="text-[10px] font-black text-white/20 uppercase tracking-[0.3em] px-2">طبقات الاستخبارات</p>
               {AI_LAYERS.map(layer => (
                 <button 
                   key={layer.id} 
                   onClick={() => setActiveLayer(layer)}
                   className={`w-full flex items-center gap-4 p-4 rounded-2xl transition-all border ${activeLayer.id === layer.id ? 'bg-primary/10 border-primary text-primary shadow-2xl shadow-primary/10' : 'bg-white/5 border-white/5 text-white/40 hover:bg-white/10'}`}
                 >
                    <div className="h-8 w-8 rounded-xl bg-white/5 flex items-center justify-center shrink-0">{layer.icon}</div>
                    <div className="text-right">
                       <p className="text-sm font-black">{layer.name}</p>
                       <p className="text-[9px] opacity-50 font-bold truncate w-40">{layer.desc}</p>
                    </div>
                 </button>
               ))}
            </div>
          </div>

          <div className="mt-auto">
             <div className="p-6 glass-cosmic rounded-3xl border-white/5 space-y-4">
                <div className="flex justify-between items-center">
                   <p className="text-[9px] font-black text-white/20 uppercase tracking-widest">محفظة المواطن</p>
                   <Coins className="h-3.5 w-3.5 text-primary" />
                </div>
                <p className="text-3xl font-black tabular-nums">{userData?.balance || 0} <span className="text-xs text-primary">EGP</span></p>
                <Link href="/dashboard" className="w-full block">
                  <Button variant="ghost" className="w-full rounded-xl bg-white/5 hover:bg-white/10 text-white/40 hover:text-white h-10 text-[10px] font-black uppercase tracking-widest">لوحة التحكم السيادية</Button>
                </Link>
             </div>
          </div>
      </aside>

      {/* Main Bot Hub */}
      <main className="flex-1 flex flex-col relative bg-black">
        
        {/* Atmosphere */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-4xl h-[400px] bg-indigo-600/5 blur-[120px] pointer-events-none" />

        <header className="h-20 flex items-center justify-between px-8 border-b border-white/5 backdrop-blur-3xl bg-black/40 z-20">
           <div className="flex items-center gap-4">
              <Badge className={`bg-gradient-to-br ${activeLayer.color} text-white border-none py-1.5 px-6 rounded-full font-black text-[10px] uppercase tracking-[0.2em] shadow-xl`}>
                {activeLayer.name} Active
              </Badge>
           </div>
           <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 bg-white/5 px-4 py-2 rounded-xl border border-white/5">
                 <ShieldAlert className="h-4 w-4 text-emerald-500" />
                 <span className="text-[10px] font-black uppercase tracking-widest text-emerald-500">Security Layer Locked</span>
              </div>
           </div>
        </header>

        <ScrollArea className="flex-1 px-8">
          <div className="max-w-4xl mx-auto py-12">
            
            <AnimatePresence mode="wait">
              {!decisionData && !isLoading ? (
                <motion.div 
                  initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                  className="min-h-[60vh] flex flex-col items-center justify-center text-center space-y-12"
                >
                   <div className="h-24 w-24 rounded-[2.5rem] bg-indigo-600/20 border border-indigo-500/20 flex items-center justify-center shadow-2xl relative">
                      <Scale className="h-12 w-12 text-primary" />
                      <div className="absolute -inset-4 bg-primary/10 blur-2xl rounded-full animate-pulse" />
                   </div>
                   <div className="space-y-4">
                      <h2 className="text-4xl md:text-5xl font-black text-white tracking-tighter">أصدر قرارك السيادي</h2>
                      <p className="text-white/30 text-xl font-bold max-w-lg mx-auto">أدخل تفاصيل الحالة ليقوم محرك القرار بتحليل المخاطر وتقديم المسارات الاستراتيجية فوراً.</p>
                   </div>
                   <div className="grid md:grid-cols-2 gap-4 w-full max-w-2xl">
                      <QuickIntelligence icon={<FileText className="text-blue-400" />} label="تحليل عقد توريد" />
                      <QuickIntelligence icon={<History className="text-amber-400" />} label="التنبؤ بنتيجة نزاع عمالي" />
                   </div>
                </motion.div>
              ) : isLoading ? (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="py-40 flex flex-col items-center gap-8">
                   <div className="relative">
                      <Loader2 className="h-20 w-24 animate-spin text-primary opacity-20" />
                      <Activity className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-10 w-10 text-primary animate-pulse" />
                   </div>
                   <div className="text-center space-y-2">
                      <p className="text-xl font-black tracking-widest uppercase text-white/40">Initiating Sovereign Engine...</p>
                      <p className="text-[10px] font-bold text-primary animate-bounce">Analyzing Risks & Legal Protocols</p>
                   </div>
                </motion.div>
              ) : (
                <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} className="space-y-10 pb-40">
                   {/* Structured Decision Result */}
                   <Card className="glass-cosmic border-none rounded-[4rem] p-14 shadow-2xl relative overflow-hidden">
                      <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-emerald-500 via-primary to-purple-500" />
                      
                      <div className="flex justify-between items-start mb-16">
                         <div className="space-y-2">
                            <h3 className="text-4xl font-black text-white">تقرير القرار السيادي</h3>
                            <p className="text-white/20 text-xs font-bold uppercase tracking-widest">Protocol ID: DEC-29384-X</p>
                         </div>
                         <Badge className={`py-2 px-8 rounded-full font-black text-lg border-none shadow-2xl ${decisionData?.riskLevel === 'critical' ? 'bg-red-600' : decisionData?.riskLevel === 'high' ? 'bg-orange-600' : 'bg-emerald-600'}`}>
                           RISK: {decisionData?.riskLevel.toUpperCase()}
                         </Badge>
                      </div>

                      <div className="grid md:grid-cols-2 gap-12">
                         <div className="space-y-10">
                            <div className="space-y-4">
                               <h4 className="text-sm font-black text-primary uppercase tracking-[0.2em]">الإجراء الفوري الموصى به</h4>
                               <p className="text-2xl font-bold leading-relaxed text-white/90">{decisionData?.recommendedAction}</p>
                            </div>
                            <div className="space-y-4">
                               <h4 className="text-sm font-black text-white/20 uppercase tracking-[0.2em]">نسبة الثقة في التحليل</h4>
                               <div className="space-y-2">
                                  <div className="flex justify-between text-xs font-black tabular-nums">
                                     <span>Precision Rate</span>
                                     <span className="text-primary">{decisionData?.confidenceScore}%</span>
                                  </div>
                                  <Progress value={decisionData?.confidenceScore} className="h-2 bg-white/5" />
                               </div>
                            </div>
                         </div>

                         <div className="space-y-10">
                            <div className="space-y-4">
                               <h4 className="text-sm font-black text-white/20 uppercase tracking-[0.2em]">التنبؤ الاستراتيجي (Outcome)</h4>
                               <div className="p-8 glass bg-white/5 rounded-[2rem] border-white/5 text-lg font-medium leading-loose italic text-indigo-200">
                                  "{decisionData?.prediction}"
                               </div>
                            </div>
                            <div className="space-y-4">
                               <h4 className="text-sm font-black text-white/20 uppercase tracking-[0.2em]">المسارات البديلة</h4>
                               <div className="flex flex-wrap gap-3">
                                  {decisionData?.alternatives.map((alt, i) => (
                                    <Badge key={i} variant="outline" className="glass py-2 px-6 rounded-xl border-white/10 text-white/60 font-bold">{alt}</Badge>
                                  ))}
                               </div>
                            </div>
                         </div>
                      </div>

                      <div className="mt-16 pt-10 border-t border-white/5 flex justify-between items-center">
                         <Button variant="ghost" onClick={() => setDecisionData(null)} className="rounded-2xl h-14 px-10 font-black text-white/20 hover:text-white">إجراء تحليل جديد</Button>
                         <div className="flex gap-4">
                            <Button className="btn-primary h-14 px-10 rounded-2xl font-black gap-3"><Archive className="h-4 w-4" /> حفظ في الأرشيف</Button>
                            <Button variant="outline" className="glass h-14 px-10 rounded-2xl font-black border-white/10">تصدير PDF</Button>
                         </div>
                      </div>
                   </Card>
                </motion.div>
              )}
            </AnimatePresence>

          </div>
        </ScrollArea>

        {/* Tactical Input Console */}
        <div className="absolute bottom-0 inset-x-0 px-8 pb-12 pt-10 bg-gradient-to-t from-black via-black/90 to-transparent z-30">
           <div className="max-w-4xl mx-auto">
              <div className="relative group">
                 <div className="absolute -inset-1 bg-gradient-to-r from-primary/20 via-purple-500/20 to-primary/20 rounded-[2.5rem] blur opacity-0 group-focus-within:opacity-100 transition duration-1000" />
                 <div className="relative glass-cosmic rounded-[2.5rem] p-3 flex items-center gap-4 shadow-[0_30px_100px_rgba(0,0,0,0.8)] border-white/10 focus-within:border-primary/40 transition-all">
                    <Button variant="ghost" size="icon" className="h-12 w-12 rounded-2xl text-white/20 hover:text-white hover:bg-white/5">
                       <Plus className="h-6 w-6" />
                    </Button>
                    
                    <textarea 
                      rows={1}
                      placeholder="أدخل المعطيات السيادية للتحليل..."
                      className="flex-1 bg-transparent border-none focus:ring-0 text-lg py-4 px-2 text-white placeholder:text-white/10 resize-none font-medium"
                      value={input}
                      onChange={(e) => setInput(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && (e.preventDefault(), handleSend())}
                    />

                    <div className="flex items-center gap-2">
                       <Button variant="ghost" size="icon" className="h-12 w-12 rounded-2xl text-white/20 hover:text-white"><Mic className="h-6 w-6" /></Button>
                       <Button 
                         onClick={handleSend}
                         disabled={isLoading || !input.trim()}
                         className="h-14 w-14 rounded-2xl bg-white text-black hover:bg-indigo-50 shadow-2xl transition-all active:scale-90"
                       >
                         {isLoading ? <Loader2 className="h-6 w-6 animate-spin" /> : <ArrowUp className="h-7 w-7" />}
                       </Button>
                    </div>
                 </div>
              </div>
              <div className="flex justify-center mt-6 gap-8 opacity-20">
                 <div className="flex items-center gap-2 text-[9px] font-black uppercase tracking-[0.3em]"><Lock className="h-3 w-3" /> Encrypted Link</div>
                 <div className="flex items-center gap-2 text-[9px] font-black uppercase tracking-[0.3em]"><Activity className="h-3 w-3" /> Engine: Gemini 2.5 Sovereign</div>
              </div>
           </div>
        </div>
      </main>
    </div>
  );
}

function QuickIntelligence({ icon, label }: any) {
  return (
    <button className="flex items-center gap-5 p-6 rounded-[2.2rem] glass border-white/5 hover:bg-white/5 transition-all text-right group">
       <div className="h-12 w-12 rounded-2xl bg-white/5 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
          {icon}
       </div>
       <span className="text-sm font-black text-white/40 group-hover:text-white leading-relaxed">{label}</span>
    </button>
  );
}
