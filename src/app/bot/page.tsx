"use client";

import { useState } from "react";
import { analyzeCase, type DecisionResult } from "@/lib/aiDecision";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { 
  BrainCircuit, Activity, ShieldAlert, Target, RefreshCcw, 
  ChevronRight, Loader2, Sparkles, Scale, Info 
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import ProtectedRoute from "@/components/ProtectedRoute";

/**
 * بوابة محرك القرار السيادي.
 * واجهة متطورة لتحليل الحالات وإصدار التوصيات الاستراتيجية.
 */
export default function SovereignDecisionPage() {
  const [input, setInput] = useState("");
  const [result, setResult] = useState<DecisionResult | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const handleAnalyze = () => {
    if (!input.trim()) return;
    
    setIsAnalyzing(true);
    // محاكاة معالجة المحرك السيادي
    setTimeout(() => {
      const data = analyzeCase(input);
      setResult(data);
      setIsAnalyzing(false);
    }, 800);
  };

  const getRiskColor = (risk: string) => {
    switch(risk) {
      case 'high': return 'bg-red-500 text-white';
      case 'medium': return 'bg-amber-500 text-white';
      default: return 'bg-emerald-500 text-white';
    }
  };

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-[#02040a] text-white p-6 lg:p-12" dir="rtl">
        <div className="max-w-5xl mx-auto space-y-12">
          
          <header className="text-center space-y-6">
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="inline-flex h-20 w-20 rounded-[2rem] bg-indigo-600/20 border border-white/10 items-center justify-center text-primary shadow-3xl"
            >
              <BrainCircuit className="h-10 w-10" />
            </motion.div>
            <h1 className="text-5xl font-black tracking-tighter">محرك <span className="text-gradient">القرار السيادي</span></h1>
            <p className="text-white/30 text-xl font-bold max-w-2xl mx-auto">أدخل معطيات الحالة ليقوم النظام بتحليل المخاطر وإصدار بروتوكول العمل الموصى به.</p>
          </header>

          <div className="grid lg:grid-cols-12 gap-10">
            {/* Input Side */}
            <div className="lg:col-span-5 space-y-6">
              <Card className="glass-cosmic border-none rounded-[3rem] p-8 shadow-2xl">
                <CardHeader className="p-0 mb-6">
                  <CardTitle className="text-xl font-bold flex items-center gap-3 justify-end text-white">
                    وصف الحالة <Info className="h-5 w-5 text-primary" />
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-0 space-y-6">
                  <Textarea 
                    placeholder="صف الحالة القانونية أو المالية بتفصيل..."
                    className="glass border-white/10 min-h-[250px] rounded-2xl p-6 text-lg leading-relaxed focus:ring-primary/20 text-right"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                  />
                  <Button 
                    onClick={handleAnalyze}
                    disabled={isAnalyzing || !input.trim()}
                    className="w-full btn-primary h-16 rounded-2xl text-xl font-black shadow-2xl gap-3"
                  >
                    {isAnalyzing ? <Loader2 className="h-6 w-6 animate-spin" /> : <>تفعيل المحرك <Sparkles className="h-5 w-5" /></>}
                  </Button>
                </CardContent>
              </Card>
            </div>

            {/* Results Side */}
            <div className="lg:col-span-7">
              <AnimatePresence mode="wait">
                {result ? (
                  <motion.div
                    key="results"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="space-y-8"
                  >
                    <Card className="glass-cosmic border-none rounded-[3rem] p-10 shadow-2xl relative overflow-hidden">
                      <div className="absolute top-0 right-0 p-10 opacity-5"><ShieldAlert className="h-40 w-40" /></div>
                      
                      <div className="flex justify-between items-start mb-10">
                        <div className="space-y-2">
                          <h3 className="text-3xl font-black text-white">التقرير الاستراتيجي</h3>
                          <Badge className={`${getRiskColor(result.risk)} border-none px-6 py-1.5 rounded-full font-black text-[10px] uppercase tracking-widest`}>
                            مخاطر {result.risk === 'high' ? 'مرتفعة' : result.risk === 'medium' ? 'متوسطة' : 'منخفضة'}
                          </Badge>
                        </div>
                        <div className="text-left bg-white/5 p-4 rounded-2xl border border-white/10 min-w-[140px]">
                          <p className="text-[9px] text-white/20 font-black uppercase mb-1 tracking-widest text-center">مستوى اليقين</p>
                          <div className="flex items-center justify-center gap-3">
                            <span className="text-3xl font-black text-primary tabular-nums">{result.confidence}%</span>
                            <Target className="h-5 w-5 text-primary opacity-40" />
                          </div>
                          <Progress value={result.confidence} className="h-1 mt-3 bg-white/5" />
                        </div>
                      </div>

                      <div className="space-y-8">
                        <div className="p-6 glass rounded-2xl bg-white/[0.02] border-white/5 border-r-4 border-r-primary">
                          <h4 className="text-[10px] font-black text-primary uppercase tracking-[0.2em] mb-3">القرار المبدئي</h4>
                          <p className="text-xl font-bold text-white/90 leading-relaxed">{result.decision}</p>
                        </div>

                        <div className="space-y-4">
                          <h4 className="text-[10px] font-black text-white/20 uppercase tracking-[0.2em] px-4 flex items-center gap-2">
                            <Activity className="h-3 w-3" /> التوصيات الإجرائية الفورية
                          </h4>
                          <div className="grid gap-3">
                            {result.recommendations.map((rec, i) => (
                              <div key={i} className="flex items-start gap-4 text-sm text-white/50 font-bold bg-white/[0.01] p-5 rounded-2xl border border-white/5 hover:bg-white/5 transition-all group">
                                <div className="h-6 w-6 rounded-lg bg-primary/10 flex items-center justify-center text-primary shrink-0 font-black text-[10px] group-hover:scale-110 transition-transform">{i+1}</div>
                                {rec}
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>

                      <div className="mt-12 pt-8 border-t border-white/5 flex justify-end">
                        <Button 
                          variant="ghost" 
                          onClick={() => { setResult(null); setInput(""); }}
                          className="h-12 px-6 rounded-xl text-white/20 hover:text-white gap-2 font-black text-[10px] uppercase tracking-widest"
                        >
                          <RefreshCcw className="h-4 w-4" /> تحليل حالة جديدة
                        </Button>
                      </div>
                    </Card>
                  </motion.div>
                ) : (
                  <motion.div 
                    key="empty"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="h-full flex flex-col items-center justify-center py-20 grayscale opacity-20 border-2 border-dashed border-white/5 rounded-[4rem]"
                  >
                    <Scale className="h-24 w-24 mb-6" />
                    <p className="text-2xl font-black">انتظار تفعيل المحرك...</p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}
