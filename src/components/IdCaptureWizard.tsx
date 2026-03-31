'use client';

import { useState, useRef, useCallback, useEffect } from "react";
import dynamic from 'next/dynamic';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Camera, RefreshCw, ShieldCheck, CreditCard, ChevronLeft, ChevronRight, AlertCircle, Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

// استيراد ديناميكي لمنع أخطاء الترطيب (Next.js SSR Fix)
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
  { id: 'syndicateFront', title: 'وجه كارنيه النقابة', icon: <CreditCard className="h-6 w-6" /> },
  { id: 'syndicateBack', title: 'ظهر كارنيه النقابة', icon: <CreditCard className="h-6 w-6" /> },
  { id: 'nationalFront', title: 'وجه بطاقة الهوية', icon: <ShieldCheck className="h-6 w-6" /> },
  { id: 'nationalBack', title: 'ظهر بطاقة الهوية', icon: <ShieldCheck className="h-6 w-6" /> },
];

/**
 * معالج تصوير الهوية السيادي (Sovereign ID Capture Wizard).
 * يوفر واجهة احترافية لالتقاط وثائق المحامين بأسلوب ملكي.
 */
export default function IdCaptureWizard({ onComplete }: IdCaptureWizardProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [capturedImages, setCapturedImages] = useState<Record<string, string>>({});
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isCapturing, setIsCapturing] = useState(false);
  const [hasCameraPermission, setHasCameraPermission] = useState(false);
  const webcamRef = useRef<any>(null);

  // بروتوكول تفعيل الكاميرا
  useEffect(() => {
    const checkPermission = async () => {
      try {
        await navigator.mediaDevices.getUserMedia({ video: true });
        setHasCameraPermission(true);
      } catch (err) {
        setHasCameraPermission(false);
        setError("يرجى منح صلاحية الوصول للكاميرا لتفعيل التوثيق السيادي.");
      }
    };
    checkPermission();
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
        setError("فشل التقاط الصورة السيادية، تأكد من ثبات العدسة.");
      }
    } catch (e) {
      setError("تعذر تفعيل محرك الالتقاط.");
    } finally {
      setIsCapturing(false);
    }
  }, [currentStep]);

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

  return (
    <div className="space-y-8 animate-in fade-in duration-700 max-w-2xl mx-auto" dir="rtl">
      {/* Sovereign Progress Indicator */}
      <div className="flex items-center justify-between px-4">
        <span className="text-[10px] font-black text-primary uppercase tracking-[0.3em]">Step {currentStep + 1} / 4</span>
        <div className="flex gap-2">
          {STEPS.map((_, i) => (
            <div 
              key={i} 
              className={`h-1.5 w-10 rounded-full transition-all duration-700 ${
                i <= currentStep ? 'bg-primary shadow-[0_0_15px_rgba(212,175,55,0.5)]' : 'bg-white/5'
              }`} 
            />
          ))}
        </div>
      </div>

      <Card className="glass-cosmic border-white/10 rounded-[3.5rem] overflow-hidden shadow-3xl">
        <CardContent className="p-0">
          <motion.div 
            key={currentStep}
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            className="p-10 space-y-8"
          >
            <div className="flex items-center gap-6 text-right">
              <div className="h-16 w-16 rounded-[1.5rem] bg-primary/10 flex items-center justify-center text-primary shadow-2xl border border-primary/20">
                {STEPS[currentStep].icon}
              </div>
              <div>
                <h3 className="text-3xl font-black text-white tracking-tight">{STEPS[currentStep].title}</h3>
                <p className="text-xs text-white/30 font-bold uppercase tracking-widest mt-1">Sovereign Identity Protocol</p>
              </div>
            </div>

            {/* Lens Portal */}
            <div className="relative aspect-[4/3] rounded-[2.5rem] bg-black/40 overflow-hidden border-2 border-white/5 shadow-inner group">
              {/* Always show video container per safety rules */}
              <div className="w-full h-full relative">
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
                      <img 
                        src={capturedImages[STEPS[currentStep].id]} 
                        className="w-full h-full object-cover animate-in fade-in zoom-in duration-500" 
                        alt="Sovereign Document" 
                      />
                    ) : (
                      <div className="text-center space-y-6 opacity-20 group-hover:opacity-40 transition-opacity">
                        <Camera className="h-24 w-24 mx-auto text-primary" />
                        <p className="text-xs font-black uppercase tracking-[0.4em]">Lens Portal Standby</p>
                      </div>
                    )}
                  </div>
                )}
              </div>
              
              <AnimatePresence>
                {error && (
                  <motion.div 
                    initial={{ y: -20, opacity: 0 }} 
                    animate={{ y: 0, opacity: 1 }} 
                    className="absolute top-6 inset-x-6 bg-red-600/90 backdrop-blur-md text-white p-5 rounded-2xl text-xs font-bold flex items-center gap-4 shadow-2xl z-[100]"
                  >
                    <AlertCircle className="h-6 w-6 shrink-0" /> {error}
                  </motion.div>
                )}
              </AnimatePresence>

              {isCapturing && (
                <div className="absolute inset-0 bg-black/60 backdrop-blur-sm flex flex-col items-center justify-center z-[110] gap-4">
                  <Loader2 className="h-12 w-12 animate-spin text-primary" />
                  <span className="text-[10px] font-black uppercase tracking-widest text-primary">Capturing...</span>
                </div>
              )}
            </div>

            <div className="flex gap-4">
              {isCameraActive ? (
                <Button 
                  onClick={capture} 
                  disabled={isCapturing} 
                  className="flex-1 h-20 rounded-3xl bg-primary text-[#020617] font-black text-xl shadow-2xl hover:scale-105 active:scale-95 transition-all"
                >
                  التقاط الوثيقة الآن
                </Button>
              ) : (
                <>
                  <Button 
                    variant="outline" 
                    onClick={() => { setError(null); setIsCameraActive(true); }} 
                    className="flex-1 h-20 rounded-3xl border-white/10 bg-white/5 text-white font-black text-lg gap-4 hover:bg-white/10 shadow-xl"
                  >
                    {capturedImages[STEPS[currentStep].id] ? <RefreshCw className="h-6 w-6" /> : <Camera className="h-6 w-6" />}
                    {capturedImages[STEPS[currentStep].id] ? 'إعادة التصوير' : 'تفعيل العدسة'}
                  </Button>
                  
                  {capturedImages[STEPS[currentStep].id] && (
                    <Button 
                      onClick={handleNext} 
                      className="flex-1 h-20 rounded-3xl bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-black text-xl gap-4 shadow-2xl hover:scale-105 transition-all"
                    >
                      {currentStep === STEPS.length - 1 ? 'إتمام التوثيق' : 'الوثيقة التالية'}
                      <ChevronLeft className="h-6 w-6" />
                    </Button>
                  )}
                </>
              )}
            </div>
          </motion.div>
        </CardContent>
      </Card>

      <div className="flex justify-between items-center px-8">
        <button 
          onClick={handleBack} 
          disabled={currentStep === 0}
          className="text-[10px] font-black text-white/20 hover:text-primary disabled:opacity-0 transition-all flex items-center gap-2 uppercase tracking-widest"
        >
          <ChevronRight className="h-4 w-4" /> Previous Protocol
        </button>
        <div className="text-right">
          <p className="text-[9px] font-black text-white/10 uppercase tracking-[0.2em] mb-1">Current Protocol</p>
          <p className="text-sm font-bold text-white/40">{STEPS[currentStep].title}</p>
        </div>
      </div>
    </div>
  );
}
