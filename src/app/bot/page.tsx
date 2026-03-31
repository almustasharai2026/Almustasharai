"use client";

import { useState } from "react";
import { useUser, useFirestore, useCollection } from "@/firebase";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  ArrowUp, BrainCircuit, Activity, Coins, Loader2, Scale, ShieldAlert, Terminal, Brain, Sparkles, RefreshCcw, UserCheck, Star, ChevronRight, AlertTriangle, Info
} from "lucide-react";
import { collection, addDoc, doc, updateDoc, increment } from "firebase/firestore";
import { useMemoFirebase } from "@/firebase/provider";
import { executeDecisionEngine, type DecisionOutput } from "@/ai/flows/decision-engine-flow";
import { matchConsultantSovereign } from "@/lib/sovereign-match";
import { checkSovereignViolation } from "@/lib/sovereign-moderation";
import { getSovereignQuickReply } from "@/lib/sovereign-ai";
import { analyzeSovereignCase, type DecisionResult } from "@/lib/sovereign-decision";
import { useToast } from "@/hooks/use-toast";
import { motion, AnimatePresence } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function SovereignDecisionBot() {
  const { user, profile } = useUser();
  const db = useFirestore();
  const { toast } = useToast();
  const router = useRouter();
  
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [decisionData, setDecisionData] = useState<DecisionOutput | null>(null);
  const [quickReply, setQuickReply] = useState<string | null>(null);
  const [fastAnalysis, setFastAnalysis] = useState<DecisionResult | null>(null);
  const [bestMatch, setBestMatch] = useState<any | null>(null);

  const wordsQuery = useMemoFirebase(() => db ? collection(db, "system", "moderation", "forbiddenWords") : null, [db]);
  const { data: forbiddenWords } = useCollection(wordsQuery);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    if (!user || !db) {
      toast({ title: "بروتوكول مجهول", description: "يجب تسجيل الدخول لتفعيل محرك القرار السيادي." });
      router.push("/auth/login");
      return;
    }

    const isViolated = checkSovereignViolation(input, forbiddenWords || []);
    
    if (isViolated) {
      await updateDoc(doc(db, "users", user.uid), { isBanned: true });
      toast({ 
        variant: "destructive", 
        title: "انتهاك سيادي مكتشف 🚫", 
        description: "تم حظر الحساب فوراً لمخالفة بروتوكول الأمان والكلمات المحظورة." 
      });
      setInput("");
      setTimeout(() => router.push("/"), 2000);
      return;
    }

    if (profile && profile.balance < 2 && profile.role !== 'admin') {
      toast({ variant: "destructive", title: "رصيد غير كافٍ", description: "محرك القرار يتطلب وحدتين ماليتين على الأقل." });
      router.push("/pricing");
      return;
    }

    setIsLoading(true);
    setDecisionData(null);
    setQuickReply(null);
    setFastAnalysis(null);
    setBestMatch(null);

    try {
      // 1. التحليل الاستراتيجي السريع (Fast Decision Logic)
      const fast = analyzeSovereignCase(input);
      setFastAnalysis(fast);

      // 2. الحصول على الرد السريع (Keyword-based)
      const quick = await getSovereignQuickReply(input);
      setQuickReply(quick);

      // 3. تفعيل محرك القرار المعمق (Genkit AI)
      const result = await executeDecisionEngine({ context: input });
      setDecisionData(result);
      
      if (profile?.role !== 'admin') {
        await updateDoc(doc(db, "users", user.uid), { balance: increment(-2) });
        await addDoc(collection(db, "users", user.uid, "transactions"), {
          amount: -2,
          service: "محرك القرار السيادي",
          timestamp: new Date().toISOString(),
          type: "deduction"
        });
      }
      
      const match = await matchConsultantSovereign(db, input);
      setBestMatch(match);

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
                      <p className="text-white/30 text-xl font-bold max-w-lg mx-auto">أدخل معطيات الحالة ليقوم الذكاء الاصطناعي السيادي بتحليل المخاطر وإصدار التوصيات الفورية.</p>
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
                   <p className="text-4xl font-black tracking-tighter">جاري التحليل السيادي...</p>
                </div>
              ) : (
                <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="space-y-10 pb-40">
                   
                   {/* Fast Analysis Results */}
                   {fastAnalysis && (
                     <Card className={`glass-cosmic border-none rounded-[3rem] p-1 shadow-2xl relative overflow-hidden ${fastAnalysis.risk === 'high' ? 'ring-2 ring-red-500/20' : ''}`}>
                        <div className="p-10 space-y-8">
                           <div className="flex justify-between items-center">
                              <div className="flex items-center gap-4">
                                 <div className={`h-12 w-12 rounded-2xl flex items-center justify-center ${fastAnalysis.risk === 'high' ? 'bg-red-500/20 text-red-500' : 'bg-primary/20 text-primary'}`}>
                                    <ShieldAlert />
                                 </div>
                                 <h4 className="text-2xl font-black">تحليل أولي: مستوى الخطورة {fastAnalysis.risk === 'high' ? 'مرتفع' : fastAnalysis.risk === 'medium' ? 'متوسط' : 'منخفض'}</h4>
                              </div>
                              <Badge variant="outline" className="px-4 py-1 text-[10px] font-black uppercase opacity-40">Fast Logic Layer</Badge>
                           </div>
                           
                           <div className="space-y-4">
                              <p className="text-xl font-bold text-white/80">{fastAnalysis.decision}</p>
                              <div className="grid gap-3">
                                 {fastAnalysis.recommendations.map((rec, i) => (
                                   <div key={i} className="flex items-center gap-3 text-sm text-white/40 font-medium bg-white/5 p-4 rounded-2xl">
                                      <Info className="h-4 w-4 text-primary shrink-0" /> {rec}
                                   </div>
                                 ))}
                              </div>
                           </div>
                        </div>
                     </Card>
                   )}

                   {/* Main AI Decision Report */}
                   <Card className="glass-cosmic border-none rounded-[4rem] p-12 lg:p-20 shadow-2xl relative overflow-hidden">
                      <div className="absolute top-0 right-0 p-12 opacity-5"><ShieldAlert className="h-64 w-64" /></div>
                      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-8 mb-16 relative z-10">
                        <div className="flex items-center gap-6">
                           <div className="h-16 w-16 rounded-2xl bg-indigo-600 flex items-center justify-center shadow-2xl"><Terminal className="h-8 w-8 text-white" /></div>
                           <h3 className="text-4xl font-black text-white">تقرير القرار السيادي</h3>
                        </div>
                        <Badge className="bg-primary/10 text-primary border-none px-8 py-3 rounded-2xl font-black text-xs uppercase tracking-widest">Confidential AI Report</Badge>
                      </div>

                      {quickReply && (
                        <div className="mb-12 p-8 glass rounded-[2rem] border-primary/20 bg-primary/5">
                           <div className="flex items-center gap-4 mb-4">
                              <Sparkles className="h-5 w-5 text-primary" />
                              <h4 className="font-black text-sm uppercase tracking-widest text-primary">استجابة سريعة فورية</h4>
                           </div>
                           <p className="text-lg font-bold text-white/80 leading-relaxed">{quickReply}</p>
                        </div>
                      )}

                      <div className="grid md:grid-cols-2 gap-12 relative z-10">
                         <div className="space-y-6 p-10 glass rounded-[3rem] border-white/5">
                            <h4 className="text-[10px] font-black text-primary uppercase tracking-[0.3em]">القرار الموصى به</h4>
                            <p className="text-2xl font-bold text-white/90">{decisionData?.recommendedAction}</p>
                         </div>
                         <div className="space-y-6 p-10 glass rounded-[3rem] border-white/5">
                            <h4 className="text-[10px] font-black text-indigo-400 uppercase tracking-[0.3em]">التنبؤ الاستراتيجي</h4>
                            <p className="text-xl font-medium italic text-indigo-100/60">{decisionData?.prediction}</p>
                         </div>
                      </div>

                      {bestMatch && (
                        <div className="mt-16 p-8 bg-primary/5 rounded-[3rem] border border-primary/10 flex items-center justify-between">
                           <div className="flex items-center gap-6">
                              <UserCheck className="h-10 w-10 text-primary" />
                              <div>
                                 <p className="text-[10px] font-black text-primary uppercase mb-1">الخبير المرشح لهذه الحالة</p>
                                 <h4 className="text-2xl font-black text-white">{bestMatch.name}</h4>
                              </div>
                           </div>
                           <Link href="/consultants">
                              <Button className="btn-primary rounded-2xl h-14 px-10">حجز جلسة فورا</Button>
                           </Link>
                        </div>
                      )}
                      
                      <div className="mt-16 pt-12 border-t border-white/5 flex justify-end">
                         <Button variant="ghost" onClick={() => { setDecisionData(null); setBestMatch(null); setQuickReply(null); setFastAnalysis(null); }} className="h-14 px-8 rounded-2xl font-black text-sm border border-white/5 hover:bg-white/5 gap-3">
                           <RefreshCcw className="h-4 w-4" /> تحليل جديد
                         </Button>
                      </div>
                   </Card>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </ScrollArea>

        <div className="p-10 bg-gradient-to-t from-black via-black/90 to-transparent">
           <div className="max-w-4xl mx-auto">
              <div className="relative glass-cosmic rounded-[3rem] p-3 flex items-center gap-4 border-white/10 shadow-[0_0_100px_rgba(0,0,0,0.8)] focus-within:border-primary/30 transition-all">
                <textarea 
                  rows={1}
                  placeholder="صف الحالة القانونية أو التجارية بتفصيل..."
                  className="flex-1 bg-transparent border-none focus:ring-0 text-xl py-5 px-8 text-white placeholder:text-white/10 resize-none font-medium text-right"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && (e.preventDefault(), handleSend())}
                />
                <Button 
                  onClick={handleSend} 
                  disabled={isLoading || !input.trim()} 
                  className="h-16 w-16 rounded-[2rem] bg-white text-black hover:bg-indigo-50 shadow-2xl transition-all"
                >
                  {isLoading ? <Loader2 className="h-7 w-7 animate-spin" /> : <ArrowUp className="h-8 w-8" />}
                </Button>
              </div>
           </div>
        </div>
      </main>
    </div>
  );
}
