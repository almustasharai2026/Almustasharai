
'use client';

import { useState, useRef, useCallback, useEffect } from "react";
import dynamic from 'next/dynamic';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Camera, RefreshCw, ShieldCheck, CreditCard, ChevronLeft, ChevronRight, AlertCircle, Loader2, Sparkles } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import VisionScanner from "./VisionScanner";

const Webcam = dynamic(() => import('react-webcam'), { ssr: false });

interface IdCaptureWizardProps {
  onComplete: (docs: {
    syndicateFront: string;
    syndicateBack: string;
    nationalFront: string;
    nationalBack: string;
  }) => void;
}

const STEPS = [
  { id: 'syndicateFront', title: 'وجه كارنيه النقابة', icon: <CreditCard className="h-6 w-6" />, type: 'syndicate' },
  { id: 'syndicateBack', title: 'ظهر كارنيه النقابة', icon: <CreditCard className="h-6 w-6" />, type: 'syndicate' },
  { id: 'nationalFront', title: 'وجه بطاقة الهوية', icon: <ShieldCheck className="h-6 w-6" />, type: 'national_id' },
  { id: 'nationalBack', title: 'ظهر بطاقة الهوية', icon: <ShieldCheck className="h-6 w-6" />, type: 'national_id' },
];

export default function IdCaptureWizard({ onComplete }: IdCaptureWizardProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [capturedImages, setCapturedImages] = useState<Record<string, string>>({});
  const [isVisionMode, setIsVisionMode] = useState(false);
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isCapturing, setIsCapturing] = useState(false);
  const webcamRef = useRef<any>(null);

  const capture = useCallback(() => {
    if (!webcamRef.current) return;
    setIsCapturing(true);
    try {
      const imageSrc = webcamRef.current.getScreenshot();
      if (imageSrc) {
        setCapturedImages(prev => ({ ...prev, [STEPS[currentStep].id]: imageSrc }));
        setIsCameraActive(false);
        setError(null);
      }
    } finally {
      setIsCapturing(false);
    }
  }, [currentStep]);

  const handleNext = () => {
    if (currentStep < STEPS.length - 1) {
      setCurrentStep(prev => prev + 1);
      setIsCameraActive(false);
    } else {
      onComplete(capturedImages as any);
    }
  };

  return (
    <div className="space-y-10" dir="rtl">
      {/* Mode Switcher */}
      <div className="flex justify-center gap-4">
        <button 
          onClick={() => setIsVisionMode(false)}
          className={`px-8 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all ${!isVisionMode ? 'bg-white text-black shadow-3xl' : 'text-white/20 hover:text-white'}`}
        >
          تصوير يدوي
        </button>
        <button 
          onClick={() => setIsVisionMode(true)}
          className={`px-8 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-2 ${isVisionMode ? 'bg-primary text-black shadow-3xl' : 'text-white/20 hover:text-white'}`}
        >
          <Sparkles size={12} /> الفاحص البصري
        </button>
      </div>

      <AnimatePresence mode="wait">
        {isVisionMode ? (
          <motion.div key="vision" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}>
            <VisionScanner docType={STEPS[currentStep].type as any} onSuccess={(analysis) => {
              setCapturedImages(prev => ({ ...prev, [STEPS[currentStep].id]: "verified_image" }));
              setTimeout(handleNext, 2000);
            }} />
          </motion.div>
        ) : (
          <motion.div key="manual" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}>
            <Card className="glass-cosmic border-white/10 rounded-[3.5rem] overflow-hidden shadow-3xl">
              <CardContent className="p-10 space-y-10">
                <div className="flex items-center gap-6">
                  <div className="h-16 w-16 rounded-2xl bg-primary/10 flex items-center justify-center text-primary shadow-inner border border-primary/20">
                    {STEPS[currentStep].icon}
                  </div>
                  <div>
                    <h3 className="text-3xl font-black text-white">{STEPS[currentStep].title}</h3>
                    <p className="text-xs text-white/30 font-bold uppercase tracking-widest mt-1">Sovereign Manual Capture</p>
                  </div>
                </div>

                <div className="relative aspect-[4/3] rounded-[2.5rem] bg-black/40 overflow-hidden border-2 border-white/5">
                  {isCameraActive ? (
                    <Webcam audio={false} ref={webcamRef} screenshotFormat="image/jpeg" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      {capturedImages[STEPS[currentStep].id] ? (
                        <img src={capturedImages[STEPS[currentStep].id]} className="w-full h-full object-cover" alt="Capture" />
                      ) : (
                        <Camera className="h-20 w-20 text-white/10" />
                      )}
                    </div>
                  )}
                </div>

                <div className="flex gap-4">
                  {isCameraActive ? (
                    <Button onClick={capture} className="flex-1 h-20 rounded-3xl bg-primary text-black font-black text-xl shadow-2xl">التقاط الوثيقة</Button>
                  ) : (
                    <Button variant="outline" onClick={() => setIsCameraActive(true)} className="flex-1 h-20 rounded-3xl glass text-white font-black">
                      {capturedImages[STEPS[currentStep].id] ? 'إعادة التصوير' : 'تفعيل الكاميرا'}
                    </Button>
                  )}
                  {capturedImages[STEPS[currentStep].id] && !isCameraActive && (
                    <Button onClick={handleNext} className="flex-1 h-20 rounded-3xl bg-emerald-600 text-white font-black text-xl">متابعة</Button>
                  )}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
