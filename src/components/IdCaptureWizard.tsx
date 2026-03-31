'use client';

import { useState, useRef, useCallback } from "react";
import Webcam from "react-webcam";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Camera, RefreshCw, CheckCircle2, ShieldCheck, CreditCard, ChevronLeft, ChevronRight, AlertCircle } from "lucide-react";
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
  const webcamRef = useRef<Webcam>(null);

  const capture = useCallback(() => {
    try {
      const imageSrc = webcamRef.current?.getScreenshot();
      if (imageSrc) {
        setCapturedImages(prev => ({ ...prev, [STEPS[currentStep].id]: imageSrc }));
        setIsCameraActive(false);
        setError(null);
      } else {
        setError("فشل التقاط الصورة، يرجى المحاولة ثانية.");
      }
    } catch (e) {
      setError("تعذر الوصول للكاميرا.");
    }
  }, [webcamRef, currentStep]);

  const handleNext = () => {
    if (currentStep < STEPS.length - 1) {
      setCurrentStep(prev => prev + 1);
    } else {
      onComplete(capturedImages as any);
    }
  };

  const handleBack = () => {
    if (currentStep > 0) setCurrentStep(prev => prev - 1);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex items-center justify-between mb-2 px-2">
        <span className="text-[10px] font-black text-primary uppercase tracking-[0.2em]">Step {currentStep + 1} of 4</span>
        <div className="flex gap-1">
          {STEPS.map((_, i) => (
            <div key={i} className={`h-1 w-6 rounded-full transition-all ${i <= currentStep ? 'bg-primary' : 'bg-slate-200 dark:bg-white/10'}`} />
          ))}
        </div>
      </div>

      <Card className="rounded-[2.5rem] border-2 border-primary/10 overflow-hidden bg-slate-50 dark:bg-black/20 shadow-inner">
        <CardContent className="p-0">
          <AnimatePresence mode="wait">
            <motion.div 
              key={currentStep}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="p-8 space-y-6"
            >
              <div className="flex items-center gap-4 text-right">
                <div className="h-12 w-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary">
                  {STEPS[currentStep].icon}
                </div>
                <div>
                  <h3 className="text-xl font-black text-slate-900 dark:text-white">{STEPS[currentStep].title}</h3>
                  <p className="text-xs text-muted-foreground font-bold">يرجى تثبيت الوثيقة والتقاط صورة واضحة.</p>
                </div>
              </div>

              <div className="relative aspect-[4/3] rounded-[2rem] bg-black overflow-hidden border-4 border-white/5 shadow-2xl">
                {isCameraActive ? (
                  <Webcam
                    audio={false}
                    ref={webcamRef}
                    screenshotFormat="image/jpeg"
                    videoConstraints={{ facingMode: "environment" }}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center relative">
                    {capturedImages[STEPS[currentStep].id] ? (
                      <img src={capturedImages[STEPS[currentStep].id]} className="w-full h-full object-cover" alt="captured" />
                    ) : (
                      <div className="text-center space-y-4">
                        <Camera className="h-16 w-16 mx-auto text-white/10" />
                        <p className="text-xs text-white/20 font-black uppercase tracking-widest">Camera Ready</p>
                      </div>
                    )}
                  </div>
                )}
                {error && (
                  <div className="absolute top-4 inset-x-4 bg-red-600 text-white p-3 rounded-xl text-xs font-bold flex items-center gap-2">
                    <AlertCircle className="h-4 w-4" /> {error}
                  </div>
                )}
              </div>

              <div className="flex gap-3">
                {isCameraActive ? (
                  <Button onClick={capture} className="flex-1 h-14 rounded-2xl bg-primary text-white font-black text-lg shadow-xl">التقاط الآن</Button>
                ) : (
                  <>
                    <Button 
                      variant="outline" 
                      onClick={() => setIsCameraActive(true)} 
                      className="flex-1 h-14 rounded-2xl border-primary/20 text-primary font-black gap-2 hover:bg-primary/5"
                    >
                      {capturedImages[STEPS[currentStep].id] ? <RefreshCw className="h-5 w-5" /> : <Camera className="h-5 w-5" />}
                      {capturedImages[STEPS[currentStep].id] ? 'إعادة الالتقاط' : 'فتح الكاميرا'}
                    </Button>
                    
                    {capturedImages[STEPS[currentStep].id] && (
                      <Button onClick={handleNext} className="flex-1 h-14 rounded-2xl bg-primary text-white font-black text-lg gap-2">
                        {currentStep === 3 ? 'إتمام المصادقة' : 'التالي'} <ChevronLeft className="h-5 w-5" />
                      </Button>
                    )}
                  </>
                )}
              </div>
            </motion.div>
          </AnimatePresence>
        </CardContent>
      </Card>

      <div className="flex justify-between px-4">
        <button 
          onClick={handleBack} 
          disabled={currentStep === 0}
          className="text-xs font-black text-muted-foreground hover:text-primary disabled:opacity-0 transition-all flex items-center gap-2"
        >
          <ChevronRight className="h-4 w-4" /> الخطوة السابقة
        </button>
      </div>
    </div>
  );
}