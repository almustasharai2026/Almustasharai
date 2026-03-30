"use client";

import { useState, useEffect } from "react";
import { useUser, useFirestore, useCollection } from "@/firebase";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  ArrowUp, BrainCircuit, Activity, Lock, Coins, Loader2, MessageCircle, Scale, ShieldAlert, Target, Terminal, Brain, Sparkles, RefreshCcw
} from "lucide-react";
import { collection, addDoc, doc, updateDoc, increment, onSnapshot } from "firebase/firestore";
import { useMemoFirebase } from "@/firebase/provider";
import { executeDecisionEngine, type DecisionOutput } from "@/ai/flows/decision-engine-flow";
import { useToast } from "@/hooks/use-toast";
import { motion, AnimatePresence } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { useRouter } from "next/navigation";

export default function SovereignDecisionBot() {
  const { user, profile } = useUser();
  const db = useFirestore();
  const { toast } = useToast();
  const router = useRouter();
  
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [decisionData, setDecisionData] = useState<DecisionOutput | null>(null);

  const wordsQuery = useMemoFirebase(() => db ? collection(db, "system", "moderation", "forbiddenWords") : null, [db]);
  const { data: forbiddenWords } = useCollection(wordsQuery);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    if (!user) {
      toast({ title: "بروتوكول مجهول", description: "يجب تسجيل الدخول لتفعيل محرك القرار السيادي." });
      router.push("/auth/login");
      return;
    }

    // الدرع الواقي (Moderation)
    const violation = forbiddenWords?.find(fw => input.toLowerCase().includes(fw.word.toLowerCase()));
    if (violation) {
      await updateDoc(doc(db!, "users", user.uid), { isBanned: true });
      toast({ variant: "destructive", title: "انتهاك سيادي مكتشف", description: "تم حظر الحساب فوراً لمخالفة بروتوكول الأمان." });
      router.push("/");
      return;
    }

    if (profile && profile.balance < 2 && profile.role !== 'admin') {
      toast({ variant: "destructive", title: "رصيد غير كافٍ", description: "محرك القرار يتطلب وحدتين ماليتين على الأقل." });
      router.push("/pricing");
      return;
    }

    setIsLoading(true);
    setDecisionData(null);

    try {
      const result = await executeDecisionEngine({ context: input });
      setDecisionData(result);
      
      if (profile?.role !== 'admin') {
        await updateDoc(doc(db!, "users", user.uid), { balance: increment(-2) });
        await addDoc(collection(db!, "users", user.uid, "transactions"), {
          amount: -2,
          service: "محرك القرار السيادي",
          timestamp: new Date().toISOString(),
          type: "deduction"
        });
      }
      setInput("");
    } catch (e) {
      toast({ variant: "destructive", title: "خطأ في المعالجة", description: "تعذر الاتصال بالمحرك السيادي حالياً." });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex h-screen bg-[#02040a] text-white overflow-hidden font-sans" dir="rtl">
      
      <main className="flex-1 flex flex-col bg-black relative">
        <ScrollArea className="flex-1 px-8 pt-20">
          <div className="max-w-4xl mx-auto py-12">
            <AnimatePresence mode="wait">
              {!decisionData && !isLoading ? (
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="min-h-[60vh] flex flex-col items-center justify-center text-center space-y-12">
                   <div className="relative">
                      <div className="absolute inset-0 bg-primary blur-[120px] opacity-20 animate-pulse" />
                      <div className="h-32 w-32 rounded-[3rem] bg-indigo-600/20 flex items-center justify-center border border-white/10 relative z-10">
                        <BrainCircuit className="h-16 w-16 text-primary" />
                      </div>
                   </div>
                   <div className="space-y-6">
                      <h2 className="text-6xl font-black tracking-tighter leading-tight">محرك <span className="text-gradient">اتخاذ القرار</span></h2>
                      <p className="text-white/30 text-xl font-bold max-w-lg mx-auto">أدخل معطيات الحالة ليقوم الذكاء الاصطناعي السيادي بتحليل المخاطر وإصدار التوصيات.</p>
                   </div>
                   
                   <div className="grid grid-cols-2 md:grid-cols-3 gap-4 w-full max-w-2xl opacity-40">
                      {["تحليل نزاع عقاري", "تقييم مخاطر عقد", "استراتيجية دفاع"].map(q => (
                        <button key={q} onClick={() => setInput(q)} className="p-4 glass rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-white/5 transition-all">{q}</button>
                      ))}
                   </div>
                </motion.div>
              ) : isLoading ? (
                <div className="py-40 flex flex-col items-center gap-12">
                   <div className="relative">
                      <div className="h-40 w-40 rounded-full border-t-2 border-primary animate-spin" />
                      <div className="absolute inset-0 flex items-center justify-center">
                         <Brain className="h-12 w-12 text-primary animate-pulse" />
                      </div>
                   </div>
                   <div className="text-center space-y-4">
                      <p className="text-4xl font-black tracking-tighter">جاري التحليل السيادي للمدخلات...</p>
                      <Badge className="bg-primary/10 text-primary border-none animate-pulse px-6 py-1">GENESIS ENGINE ACTIVE</Badge>
                   </div>
                </div>
              ) : (
                <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="space-y-10 pb-40">
                   <Card className="glass-cosmic border-none rounded-[4rem] p-12 lg:p-20 shadow-2xl relative overflow-hidden">
                      <div className="absolute top-0 right-0 p-12 opacity-5"><ShieldAlert className="h-64 w-64" /></div>
                      
                      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-8 mb-16 relative z-10">
                        <div className="flex items-center gap-6">
                           <div className="h-16 w-16 rounded-2xl bg-indigo-600 flex items-center justify-center shadow-2xl"><Terminal className="h-8 w-8 text-white" /></div>
                           <h3 className="text-4xl font-black text-white">تقرير القرار السيادي</h3>
                        </div>
                        <div className="flex gap-4">
                           <Badge className="bg-primary/10 text-primary border-none px-8 py-3 rounded-2xl font-black text-xs">ثقة: {decisionData?.confidenceScore}%</Badge>
                           <Badge className="bg-white/5 text-white/40 border-none px-8 py-3 rounded-2xl font-black text-xs uppercase">خطر: {decisionData?.riskLevel}</Badge>
                        </div>
                      </div>

                      <div className="grid md:grid-cols-2 gap-12 relative z-10">
                         <div className="space-y-6 p-10 glass rounded-[3rem] border-white/5 hover:border-primary/20 transition-all">
                            <h4 className="text-[10px] font-black text-primary uppercase tracking-[0.3em] flex items-center gap-3">
                               <Target className="h-4 w-4" /> الإجراء الفوري الموصى به
                            </h4>
                            <p className="text-2xl font-bold leading-relaxed text-white/90">{decisionData?.recommendedAction}</p>
                         </div>
                         <div className="space-y-6 p-10 glass rounded-[3rem] border-white/5 hover:border-indigo-400/20 transition-all">
                            <h4 className="text-[10px] font-black text-indigo-400 uppercase tracking-[0.3em] flex items-center gap-3">
                               <Activity className="h-4 w-4" /> التنبؤ الاستراتيجي للمسار
                            </h4>
                            <p className="text-xl font-medium italic text-indigo-100/60 leading-relaxed">{decisionData?.prediction}</p>
                         </div>
                      </div>
                      
                      <div className="mt-16 flex items-center justify-between border-t border-white/5 pt-12">
                         <div className="flex gap-4">
                            {decisionData?.alternatives.map((alt, i) => (
                              <Badge key={i} variant="outline" className="border-white/5 bg-white/[0.02] px-6 py-2 rounded-xl text-[10px] font-bold text-white/40">{alt}</Badge>
                            ))}
                         </div>
                         <Button variant="ghost" onClick={() => setDecisionData(null)} className="h-14 px-8 rounded-2xl font-black text-sm border border-white/5 hover:bg-white/5 gap-3">
                           <RefreshCcw className="h-4 w-4" /> تحليل جديد
                         </Button>
                      </div>
                   </Card>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </ScrollArea>

        {/* Sovereign Input Capsule */}
        <div className="p-10 bg-gradient-to-t from-black via-black/90 to-transparent">
           <div className="max-w-4xl mx-auto">
              <div className="relative glass-cosmic rounded-[3rem] p-3 flex items-center gap-4 border-white/10 shadow-[0_0_100px_rgba(0,0,0,0.8)] focus-within:border-primary/30 transition-all group">
                <textarea 
                  rows={1}
                  placeholder="صف الحالة القانونية أو التجارية بتفصيل..."
                  className="flex-1 bg-transparent border-none focus:ring-0 text-xl py-5 px-8 text-white placeholder:text-white/10 resize-none font-medium h-full"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && (e.preventDefault(), handleSend())}
                />
                <Button 
                  onClick={handleSend} 
                  disabled={isLoading || !input.trim()} 
                  className="h-16 w-16 rounded-[2rem] bg-white text-black hover:bg-indigo-50 shadow-2xl transition-all flex-shrink-0"
                >
                  {isLoading ? <Loader2 className="h-7 w-7 animate-spin" /> : <ArrowUp className="h-8 w-8" />}
                </Button>
              </div>
              <div className="flex justify-between mt-8 px-10 opacity-20">
                  <div className="flex items-center gap-3 text-[10px] font-black uppercase tracking-widest"><Lock className="h-3.5 w-3.5" /> Sovereign Encrypted Link</div>
                  <div className="flex items-center gap-3 text-[10px] font-black uppercase tracking-widest">Balance: {profile?.balance || 0} EGP</div>
              </div>
           </div>
        </div>
      </main>
    </div>
  );
}