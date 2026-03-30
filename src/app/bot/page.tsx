"use client";

import { useState, useRef, useEffect } from "react";
import { useUser, useFirestore, useCollection } from "@/firebase";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Progress } from "@/components/ui/progress";
import { 
  ArrowUp, BrainCircuit, Activity, Lock, Coins, Loader2, MessageCircle, Scale, ShieldAlert, Target, Terminal, Brain, Sparkles
} from "lucide-react";
import { collection, addDoc, query, orderBy, doc, updateDoc, increment, onSnapshot } from "firebase/firestore";
import { useMemoFirebase } from "@/firebase/provider";
import { executeDecisionEngine, type DecisionOutput } from "@/ai/flows/decision-engine-flow";
import { useToast } from "@/hooks/use-toast";
import { motion, AnimatePresence } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import Link from "next/link";

const AI_LAYERS = [
  { id: "general", name: "الذكاء العام", icon: <MessageCircle />, color: "from-blue-500 to-blue-700", desc: "دردشة قانونية اعتيادية للإجابة السريعة." },
  { id: "expert", name: "محرك القرار السيادي", icon: <BrainCircuit />, color: "from-amber-500 to-amber-700", desc: "تحليل هيكلي عميق وخطوات عمل فورية." },
  { id: "predictive", name: "الذكاء التنبؤي", icon: <Activity />, color: "from-purple-500 to-purple-700", desc: "توقع النتائج القضائية والاستراتيجيات المستقبلية." }
];

export default function SovereignDecisionBot() {
  const { user, isUserLoading } = useUser();
  const db = useFirestore();
  const { toast } = useToast();
  
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [activeLayer, setActiveLayer] = useState(AI_LAYERS[1]);
  const [decisionData, setDecisionData] = useState<DecisionOutput | null>(null);
  const [userData, setUserData] = useState<any>(null);

  // Monitor user state with non-blocking logic
  useEffect(() => {
    if (!db || !user) return;
    const unsub = onSnapshot(doc(db, "users", user.uid), (doc) => {
      const data = doc.data();
      setUserData(data);
      if (data?.isBanned) {
        window.location.href = "/";
      }
    }, (err) => {
      console.warn("User state monitor limited.");
    });
    return () => unsub();
  }, [db, user]);

  const wordsQuery = useMemoFirebase(() => {
    if (!db) return null;
    return collection(db, "system", "moderation", "forbiddenWords");
  }, [db]);
  const { data: forbiddenWords } = useCollection(wordsQuery);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    if (!user) {
      toast({ title: "تنبيه", description: "يرجى تسجيل الدخول أولاً لاستخدام المحرك السيادي." });
      return;
    }

    // Moderation
    const violation = forbiddenWords?.find(fw => input.toLowerCase().includes(fw.word.toLowerCase()));
    if (violation) {
      await updateDoc(doc(db!, "users", user.uid), { isBanned: true });
      toast({ variant: "destructive", title: "انتهاك سيادي", description: "تم حظر الحساب فوراً." });
      return;
    }

    if (userData && userData.balance < 1 && userData.role !== 'admin') {
      toast({ variant: "destructive", title: "رصيد غير كافٍ" });
      return;
    }

    setIsLoading(true);
    setDecisionData(null);

    try {
      if (activeLayer.id === "expert") {
        const result = await executeDecisionEngine({ context: input });
        setDecisionData(result);
        
        if (userData?.role !== 'admin') {
          await updateDoc(doc(db!, "users", user.uid), { balance: increment(-2) });
          await addDoc(collection(db!, "users", user.uid, "transactions"), {
            amount: -2,
            service: "محرك القرار السيادي",
            timestamp: new Date().toISOString()
          });
        }
      } else {
        toast({ title: "الوضع قيد التطوير" });
      }
      setInput("");
    } catch (e) {
      toast({ variant: "destructive", title: "خطأ في المحرك" });
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
               {AI_LAYERS.map(layer => (
                 <button 
                   key={layer.id} 
                   onClick={() => setActiveLayer(layer)}
                   className={`w-full flex items-center gap-4 p-4 rounded-2xl transition-all border ${activeLayer.id === layer.id ? 'bg-primary/10 border-primary text-primary' : 'bg-white/5 border-white/5 text-white/40'}`}
                 >
                    <div className="h-8 w-8 rounded-xl bg-white/5 flex items-center justify-center">{layer.icon}</div>
                    <div className="text-right">
                       <p className="text-sm font-black">{layer.name}</p>
                    </div>
                 </button>
               ))}
            </div>
          </div>

          <div className="mt-auto">
             <div className="p-6 glass-cosmic rounded-3xl border-white/5">
                <p className="text-[9px] text-white/20 font-black uppercase mb-2 tracking-widest">الرصيد المتاح</p>
                <p className="text-3xl font-black tabular-nums">{userData?.balance || 0} <span className="text-xs text-primary">EGP</span></p>
             </div>
          </div>
      </aside>

      <main className="flex-1 flex flex-col bg-black relative">
        {/* Safe Mode Indicator */}
        {isUserLoading && (
          <div className="absolute top-0 left-0 w-full h-1 bg-primary/10 z-[100]">
            <div className="h-full bg-primary animate-pulse w-1/3" />
          </div>
        )}

        <ScrollArea className="flex-1 px-8">
          <div className="max-w-4xl mx-auto py-12">
            <AnimatePresence mode="wait">
              {!decisionData && !isLoading ? (
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="min-h-[60vh] flex flex-col items-center justify-center text-center space-y-12">
                   <div className="relative">
                      <div className="absolute inset-0 bg-primary blur-[100px] opacity-20 animate-pulse" />
                      <Scale className="h-20 w-20 text-primary relative z-10" />
                   </div>
                   <div className="space-y-4">
                      <h2 className="text-5xl font-black tracking-tighter">أصدر قرارك السيادي</h2>
                      <p className="text-white/20 text-xl font-bold">أدخل تفاصيل الحالة لتحليلها عبر محرك القرار المتقدم.</p>
                   </div>
                </motion.div>
              ) : isLoading ? (
                <div className="py-40 flex flex-col items-center gap-12">
                   <div className="relative">
                      <div className="h-32 w-32 rounded-full border-t-2 border-primary animate-spin" />
                      <div className="absolute inset-0 flex items-center justify-center">
                         <Brain className="h-10 w-10 text-primary animate-pulse" />
                      </div>
                   </div>
                   <div className="text-center space-y-2">
                      <p className="text-3xl font-black text-gradient">جاري التحليل السيادي...</p>
                      <p className="text-white/20 text-xs font-bold uppercase tracking-[0.5em]">Synchronizing Neural Law Grids</p>
                   </div>
                </div>
              ) : (
                <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} className="space-y-10 pb-40">
                   <Card className="glass-cosmic border-none rounded-[4rem] p-14 shadow-2xl overflow-hidden relative">
                      <div className="absolute top-0 right-0 p-8 opacity-5">
                         <ShieldAlert className="h-40 w-40" />
                      </div>
                      <h3 className="text-4xl font-black text-white mb-10 flex items-center gap-4">
                        <Terminal className="h-8 w-8 text-primary" /> تقرير القرار السيادي
                      </h3>
                      <div className="grid md:grid-cols-2 gap-12">
                         <div className="space-y-4 p-8 glass rounded-3xl">
                            <h4 className="text-[10px] font-black text-primary uppercase tracking-widest flex items-center gap-2">
                               <Target className="h-3 w-3" /> الإجراء الفوري الموصى به
                            </h4>
                            <p className="text-xl font-bold leading-relaxed">{decisionData?.recommendedAction}</p>
                         </div>
                         <div className="space-y-4 p-8 glass rounded-3xl">
                            <h4 className="text-[10px] font-black text-white/20 uppercase tracking-widest flex items-center gap-2">
                               <Activity className="h-3 w-3" /> التنبؤ الاستراتيجي للمسار
                            </h4>
                            <p className="text-lg italic text-indigo-200 leading-relaxed">{decisionData?.prediction}</p>
                         </div>
                      </div>
                      
                      <div className="mt-12 flex items-center justify-between border-t border-white/5 pt-10 px-4">
                         <div className="flex gap-4">
                            <Badge className="bg-white/5 text-white/40 border-none px-6 py-2 rounded-xl font-black">ثقة: {decisionData?.confidenceScore}%</Badge>
                            <Badge className="bg-primary/10 text-primary border-none px-6 py-2 rounded-xl font-black uppercase tracking-tighter">خطر: {decisionData?.riskLevel}</Badge>
                         </div>
                         <Button variant="ghost" onClick={() => setDecisionData(null)} className="rounded-xl border border-white/5 hover:bg-white/5 font-black">تحليل جديد</Button>
                      </div>
                   </Card>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </ScrollArea>

        <div className="p-8 bg-gradient-to-t from-black via-black/80 to-transparent">
           <div className="max-w-4xl mx-auto">
              <div className="relative glass-cosmic rounded-[2.5rem] p-2.5 flex items-center gap-4 border-white/10 shadow-2xl">
                <textarea 
                  rows={1}
                  placeholder="أدخل المعطيات السيادية للتحليل..."
                  className="flex-1 bg-transparent border-none focus:ring-0 text-lg py-4 px-6 text-white placeholder:text-white/10 resize-none font-medium"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && (e.preventDefault(), handleSend())}
                />
                <Button onClick={handleSend} disabled={isLoading || !input.trim()} className="h-14 w-14 rounded-[1.8rem] bg-white text-black hover:bg-indigo-50 shadow-2xl transition-all">
                  {isLoading ? <Loader2 className="h-6 w-6 animate-spin" /> : <ArrowUp className="h-7 w-7" />}
                </Button>
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
