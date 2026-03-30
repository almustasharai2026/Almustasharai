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
  const { user } = useUser();
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
    if (!input.trim() || isLoading || !user) return;

    // Safety check for user data
    if (!userData && !isLoading) {
      toast({ title: "جاري المزامنة", description: "يرجى الانتظار ثانية واحدة حتى تكتمل مزامنة هويتك." });
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
                <p className="text-3xl font-black tabular-nums">{userData?.balance || 0} <span className="text-xs text-primary">EGP</span></p>
             </div>
          </div>
      </aside>

      <main className="flex-1 flex flex-col bg-black">
        <ScrollArea className="flex-1 px-8">
          <div className="max-w-4xl mx-auto py-12">
            <AnimatePresence mode="wait">
              {!decisionData && !isLoading ? (
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="min-h-[60vh] flex flex-col items-center justify-center text-center space-y-12">
                   <Scale className="h-12 w-12 text-primary" />
                   <h2 className="text-4xl font-black">أصدر قرارك السيادي</h2>
                </motion.div>
              ) : isLoading ? (
                <div className="py-40 flex flex-col items-center gap-8">
                   <Loader2 className="h-20 w-24 animate-spin text-primary opacity-20" />
                </div>
              ) : (
                <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} className="space-y-10 pb-40">
                   <Card className="glass-cosmic border-none rounded-[4rem] p-14 shadow-2xl">
                      <h3 className="text-4xl font-black text-white mb-10">تقرير القرار السيادي</h3>
                      <div className="grid md:grid-cols-2 gap-12">
                         <div className="space-y-4">
                            <h4 className="text-sm font-black text-primary uppercase">الإجراء الفوري</h4>
                            <p className="text-xl font-bold">{decisionData?.recommendedAction}</p>
                         </div>
                         <div className="space-y-4">
                            <h4 className="text-sm font-black text-white/20 uppercase">التنبؤ الاستراتيجي</h4>
                            <p className="text-lg italic text-indigo-200">{decisionData?.prediction}</p>
                         </div>
                      </div>
                      <Button variant="ghost" onClick={() => setDecisionData(null)} className="mt-12 rounded-xl border border-white/5">تحليل جديد</Button>
                   </Card>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </ScrollArea>

        <div className="p-8 bg-gradient-to-t from-black to-transparent">
           <div className="max-w-4xl mx-auto relative glass-cosmic rounded-[2.5rem] p-2 flex items-center gap-4 border-white/10">
              <textarea 
                rows={1}
                placeholder="أدخل المعطيات السيادية..."
                className="flex-1 bg-transparent border-none focus:ring-0 text-lg py-4 px-4 text-white placeholder:text-white/10 resize-none"
                value={input}
                onChange={(e) => setInput(e.target.value)}
              />
              <Button onClick={handleSend} disabled={isLoading || !input.trim()} className="h-14 w-14 rounded-2xl bg-white text-black">
                <ArrowUp className="h-7 w-7" />
              </Button>
           </div>
        </div>
      </main>
    </div>
  );
}
