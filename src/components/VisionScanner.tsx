
'use client';

import React, { useState } from 'react';
import { useUser, useFirestore } from "@/firebase";
import { doc, setDoc, serverTimestamp } from "firebase/firestore";
import { 
  Camera, ShieldCheck, AlertCircle, Loader2, 
  CheckCircle2, ScanFace, Sparkles, RefreshCw 
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { verifyLegalIdentity } from '@/ai/flows/verify-id-flow';
import { useToast } from '@/hooks/use-toast';

interface VisionScannerProps {
  docType: 'syndicate' | 'national_id';
  onSuccess?: (data: any) => void;
}

/**
 * الفاحص البصري السيادي (Sovereign Vision Scanner).
 * يقوم بمسح وتحليل الوثائق باستخدام بروتوكولات الذكاء الاصطناعي المتقدمة.
 */
export default function VisionScanner({ docType, onSuccess }: VisionScannerProps) {
  const { user } = useUser();
  const db = useFirestore();
  const { toast } = useToast();
  
  const [scanning, setScanning] = useState(false);
  const [result, setResult] = useState<'success' | 'fail' | null>(null);
  const [errorMsg, setErrorMsg] = useState('');
  const [preview, setPreview] = useState<string | null>(null);

  const processDocument = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user || !db) return;

    setScanning(true);
    setErrorMsg('');
    setResult(null);

    // تحويل الصورة لـ Base64 للمعالجة السيادية
    const reader = new FileReader();
    reader.onloadend = async () => {
      const base64 = reader.result as string;
      setPreview(base64);

      try {
        // استدعاء محرك التحقق السيادي (Genkit Flow)
        const analysis = await verifyLegalIdentity({
          frontIdUri: base64,
          backIdUri: base64, // في نسخة الإنتاج يتم رفع الصورتين
          docType: docType === 'syndicate' ? 'syndicate' : 'national_id'
        });

        if (analysis.isValid) {
          setResult('success');
          // توثيق النجاح في السجلات السيادية
          await setDoc(doc(db, "users", user.uid, "verifications", docType), {
            status: 'verified',
            extractedData: {
              name: analysis.extractedName,
              id: analysis.idNumber,
              profession: analysis.profession
            },
            confidence: analysis.confidence,
            timestamp: serverTimestamp()
          }, { merge: true });

          toast({ title: "تم التوثيق البصري بنجاح ✅" });
          if (onSuccess) onSuccess(analysis);
        } else {
          setResult('fail');
          setErrorMsg(analysis.moderationNote || "الوثيقة غير واضحة أو مرفوضة سيادياً.");
        }
      } catch (err) {
        setErrorMsg("تعذر الاتصال بمحرك الرؤية السيادي.");
      } finally {
        setScanning(false);
      }
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="w-full max-w-2xl mx-auto space-y-8" dir="rtl">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="glass-cosmic border-white/10 rounded-[3.5rem] p-12 relative overflow-hidden shadow-3xl"
      >
        {/* Radar Scanning Line Animation */}
        {scanning && (
          <motion.div 
            initial={{ top: 0 }}
            animate={{ top: "100%" }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
            className="absolute left-0 right-0 h-1 bg-primary shadow-[0_0_25px_rgba(212,175,55,0.8)] z-20 pointer-events-none"
          />
        )}

        <div className="relative z-10 text-center space-y-10">
          {/* Status Avatar */}
          <div className={`w-28 h-28 mx-auto rounded-[2.5rem] flex items-center justify-center transition-all duration-700 shadow-2xl ${
            result === 'success' ? 'bg-emerald-500 text-black rotate-[360deg]' : 'bg-white/5 text-primary border border-white/10'
          }`}>
            {scanning ? (
              <Loader2 className="animate-spin" size={48} />
            ) : result === 'success' ? (
              <CheckCircle2 size={48} strokeWidth={3} />
            ) : (
              <ScanFace size={48} strokeWidth={1.5} />
            )}
          </div>

          <div className="space-y-4">
            <h3 className="text-3xl font-black text-white tracking-tight italic">
              {result === 'success' ? "تمت المصادقة السيادية" : "الفاحص البصري الذكي"}
            </h3>
            <p className="text-white/30 font-bold text-sm leading-relaxed max-w-sm mx-auto">
              {result === 'success' 
                ? "لقد تم تحليل وثيقتك ومطابقتها مع معايير كوكب المستشار AI بنجاح." 
                : `يرجى رفع صورة ${docType === 'syndicate' ? 'كارنيه النقابة' : 'البطاقة الشخصية'} بوضوح ليقوم المحرك الذكي بمطابقتها.`}
            </p>
          </div>

          <div className="relative group">
            <input 
              type="file" 
              id="vision-upload"
              className="hidden" 
              onChange={processDocument}
              disabled={scanning}
              accept="image/*"
            />
            
            <AnimatePresence mode="wait">
              {!result || result === 'fail' ? (
                <motion.label 
                  key="upload"
                  htmlFor="vision-upload"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="block w-full bg-white text-black h-20 rounded-3xl font-black text-xl cursor-pointer shadow-3xl hover:bg-primary transition-all flex items-center justify-center gap-4"
                >
                  <Camera size={24} /> 
                  {scanning ? "جاري المعالجة..." : "بدء المسح البصري"}
                </motion.label>
              ) : (
                <motion.button
                  key="reset"
                  onClick={() => { setResult(null); setPreview(null); }}
                  className="w-full h-20 rounded-3xl bg-white/5 border border-white/10 text-white/40 font-bold hover:text-white transition-all flex items-center justify-center gap-4"
                >
                  <RefreshCw size={20} /> إعادة المسح السيادي
                </motion.button>
              )}
            </AnimatePresence>
          </div>

          {/* Feedback Messages */}
          <AnimatePresence>
            {errorMsg && (
              <motion.div 
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center gap-4 text-red-500 bg-red-500/10 p-6 rounded-2xl border border-red-500/20 text-xs font-black uppercase tracking-widest"
              >
                <AlertCircle size={20} className="shrink-0" /> {errorMsg}
              </motion.div>
            )}

            {result === 'success' && (
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center gap-4 text-emerald-500 bg-emerald-500/10 p-6 rounded-2xl border border-emerald-500/20 text-xs font-black uppercase tracking-widest shadow-2xl"
              >
                <ShieldCheck size={20} className="shrink-0" /> 
                بروتوكول الهوية مكتمل. تم توثيق البيانات في الخزنة المركزية.
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Cinematic Backdrop during Scan */}
        {scanning && (
          <div className="absolute inset-0 bg-primary/5 backdrop-blur-sm z-0 pointer-events-none" />
        )}
      </motion.div>

      {/* Preview Strip */}
      {preview && (
        <div className="flex justify-center">
          <div className="p-2 glass-cosmic rounded-2xl border-white/10 overflow-hidden shadow-2xl w-32 h-32">
            <img src={preview} className="w-full h-full object-cover rounded-xl opacity-40 grayscale" alt="Preview" />
          </div>
        </div>
      )}
    </div>
  );
}
