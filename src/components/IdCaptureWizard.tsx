
'use client';

import { useState, useRef, useCallback, useEffect } from "react";
import Webcam from "react-webcam";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Camera, RefreshCw, ShieldCheck, CreditCard, ChevronLeft, ChevronRight, AlertCircle, Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface IdCaptureWizardProps {
  onComplete: (docs: {
    syndicateFront: string;
    syndicateBack: string;
    nationalFront: string;
    nationalBack: string;
  }) => void;
}

const STEPS = [
  { id: 'syndicateFront', title: 'وجه كارنيه النقابة', icon: <CreditCard className="h-6 w-6" /> },
  { id: 'syndicateBack', title: 'ظهر كارنيه النقابة', icon: <CreditCard className="h-6 w-6" /> },
  { id: 'nationalFront', title: 'وجه بطاقة الهوية', icon: <ShieldCheck className="h-6 w-6" /> },
  { id: 'nationalBack', title: 'ظهر بطاقة الهوية', icon: <ShieldCheck className="h-6 w-6" /> },
];

export default function IdCaptureWizard({ onComplete }: IdCaptureWizardProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [capturedImages, setCapturedImages] = useState<Record<string, string>>({});
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isCapturing, setIsCapturing] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const webcamRef = useRef<Webcam>(null);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const capture = useCallback(() => {
    if (!webcamRef.current) return;
    
    setIsCapturing(true);
    try {
      const imageSrc = webcamRef.current.getScreenshot();
      if (imageSrc) {
        setCapturedImages(prev => ({ ...prev, [STEPS[currentStep].id]: imageSrc }));
        setIsCameraActive(false);
        setError(null);
      } else {
        setError("فشل التقاط الصورة، يرجى التحقق من إضاءة الغرفة وثبات العدسة.");
      }
    } catch (e) {
      setError("تعذر تفعيل محرك الالتقاط السيادي.");
    } finally {
      setIsCapturing(false);
    }
  }, [webcamRef, currentStep]);

  const handleNext = () => {
    if (currentStep < STEPS.length - 1) {
      setCurrentStep(prev => prev + 1);
      setIsCameraActive(false);
      setError(null);
    } else {
      onComplete(capturedImages as any);
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
      setIsCameraActive(false);
      setError(null);
    }
  };

  if (!isMounted) return null;

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex items-center justify-between mb-2 px-2">
        <span className="text-[10px] font-black text-primary uppercase tracking-[0.2em]">Sovereign Capture: Step {currentStep + 1} of 4</span>
        <div className="flex gap-1.5">
          {STEPS.map((_, i) => (
            <div key={i} className={`h-1.5 w-8 rounded-full transition-all duration-500 ${i <= currentStep ? 'bg-primary shadow-[0_0_10px_rgba(99,102,241,0.5)]' : 'bg-slate-200 dark:bg-white/5'}`} />
          ))}
        </div>
      </div>

      <Card className="rounded-[3rem] border-2 border-primary/10 overflow-hidden bg-slate-50 dark:bg-black/40 shadow-inner relative">
        <CardContent className="p-0">
          <AnimatePresence mode="wait">
            <motion.div 
              key={currentStep}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
              className="p-8 space-y-6"
            >
              <div className="flex items-center gap-5 text-right">
                <div className="h-14 w-14 rounded-2xl bg-primary/10 flex items-center justify-center text-primary shadow-xl border border-primary/5">
                  {STEPS[currentStep].icon}
                </div>
                <div>
                  <h3 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">{STEPS[currentStep].title}</h3>
                  <p className="text-[10px] text-muted-foreground font-black uppercase tracking-widest mt-1">Identity Recognition Active</p>
                </div>
              </div>

              <div className="relative aspect-[4/3] rounded-[2.5rem] bg-[#050505] overflow-hidden border-4 border-white/5 shadow-3xl group">
                {isCameraActive ? (
                  <Webcam
                    audio={false}
                    ref={webcamRef}
                    screenshotFormat="image/jpeg"
                    videoConstraints={{ facingMode: "environment" }}
                    className="w-full h-full object-cover"
                    onUserMediaError={() => setError("يرجى منح صلاحية الكاميرا للمتصفح لتفعيل التوثيق.")}
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center relative">
                    {capturedImages[STEPS[currentStep].id] ? (
                      <img src={capturedImages[STEPS[currentStep].id]} className="w-full h-full object-cover" alt="captured sovereign document" />
                    ) : (
                      <div className="text-center space-y-6 opacity-20 group-hover:opacity-40 transition-opacity">
                        <Camera className="h-24 w-24 mx-auto text-primary" />
                        <p className="text-xs font-black uppercase tracking-[0.3em]">Lens Standby Mode</p>
                      </div>
                    )}
                  </div>
                )}
                
                <AnimatePresence>
                  {error && (
                    <motion.div initial={{ y: -20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: -20, opacity: 0 }} className="absolute top-6 inset-x-6 bg-red-600/90 backdrop-blur-md text-white p-4 rounded-2xl text-xs font-black flex items-center gap-3 shadow-2xl z-50">
                      <AlertCircle className="h-5 w-5" /> {error}
                    </motion.div>
                  )}
                </AnimatePresence>

                {isCapturing && (
                  <div className="absolute inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[60]">
                    <Loader2 className="h-12 w-12 animate-spin text-primary" />
                  </div>
                )}
              </div>

              <div className="flex gap-4">
                {isCameraActive ? (
                  <Button onClick={capture} disabled={isCapturing} className="flex-1 h-16 rounded-[1.5rem] bg-primary text-white font-black text-xl shadow-2xl hover:scale-105 active:scale-95 transition-all">التقاط الوثيقة السيادية</Button>
                ) : (
                  <>
                    <Button 
                      variant="outline" 
                      onClick={() => { setError(null); setIsCameraActive(true); }} 
                      className="flex-1 h-16 rounded-[1.5rem] border-primary/20 bg-white dark:bg-white/5 text-primary font-black text-lg gap-3 hover:bg-primary/5 shadow-xl transition-all"
                    >
                      {capturedImages[STEPS[currentStep].id] ? <RefreshCw className="h-6 w-6" /> : <Camera className="h-6 w-6" />}
                      {capturedImages[STEPS[currentStep].id] ? 'إعادة التصوير' : 'تفعيل العدسة'}
                    </Button>
                    
                    {capturedImages[STEPS[currentStep].id] && (
                      <Button onClick={handleNext} className="flex-1 h-16 rounded-[1.5rem] bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-black text-xl gap-3 shadow-2xl hover:scale-105 transition-all">
                        {currentStep === 3 ? 'إتمام بروتوكول المصادقة' : 'التالي'} <ChevronLeft className="h-6 w-6" />
                      </Button>
                    )}
                  </>
                )}
              </div>
            </motion.div>
          </AnimatePresence>
        </CardContent>
      </Card>

      <div className="flex justify-between items-center px-6 pb-2">
        <button 
          onClick={handleBack} 
          disabled={currentStep === 0}
          className="text-[10px] font-black text-muted-foreground hover:text-primary disabled:opacity-0 transition-all flex items-center gap-2 uppercase tracking-widest"
        >
          <ChevronRight className="h-4 w-4" /> Previous Protocol
        </button>
        <span className="text-[10px] font-black text-muted-foreground/30 uppercase tracking-[0.2em]">{STEPS[currentStep].title}</span>
      </div>
    </div>
  );
}
