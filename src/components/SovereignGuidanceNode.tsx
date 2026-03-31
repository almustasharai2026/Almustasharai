'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useFirestore, useUser } from '@/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { 
  Sparkles, ArrowLeft, Loader2, Scale, 
  FileText, Users, Zap, Search, ShieldCheck 
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

/**
 * محرك التوجيه السيادي (Sovereign AI Router).
 * يقوم بتحليل نية المستخدم وتوجيهه للمسار القانوني الأنسب.
 */
export default function SovereignGuidanceNode() {
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [detectedIntent, setDetectedIntent] = useState<string | null>(null);
  const router = useRouter();
  const db = useFirestore();
  const { user, profile } = useUser();

  const processLegalIntent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim() || loading || !db) return;

    setLoading(true);
    
    // --- بروتوكول تحليل النية السيادي (Intent Classification Logic) ---
    // محاكاة معالجة المحرك الذكي Gemini
    setTimeout(async () => {
      let targetPath = '/bot';
      let intentLabel = 'استشارة ذكية';
      let intentKey = 'general_ai';

      const lowerQuery = query.toLowerCase();

      if (lowerQuery.includes('عقد') || lowerQuery.includes('نموذج') || lowerQuery.includes('ورقة') || lowerQuery.includes('صيغة')) {
        targetPath = '/templates';
        intentLabel = 'المكتبة الرقمية';
        intentKey = 'document_drafting';
      } else if (lowerQuery.includes('حجز') || lowerQuery.includes('مقابلة') || lowerQuery.includes('محامي') || lowerQuery.includes('خبير')) {
        targetPath = '/consultants';
        intentLabel = 'مجلس الخبراء';
        intentKey = 'expert_consultation';
      }

      // توثيق "نية المواطن" في السجلات السيادية للرقابة والتحليل
      if (user) {
        try {
          await addDoc(collection(db, "user_intents"), {
            userId: user.uid,
            userName: profile?.fullName || "مواطن",
            rawQuery: query,
            detectedIntent: intentKey,
            timestamp: serverTimestamp()
          });
        } catch (err) {
          console.error("Intent Logging Failed:", err);
        }
      }

      setLoading(false);
      setDetectedIntent(intentLabel);

      // الانتقال السيادي بعد تأكيد المسار للمواطن
      setTimeout(() => {
        router.push(`${targetPath}?q=${encodeURIComponent(query)}`);
      }, 1200);
    }, 1800);
  };

  return (
    <div className="w-full max-w-4xl mx-auto space-y-10 relative">
      <form onSubmit={processLegalIntent} className="relative group">
        {/* Sovereign Glow */}
        <div className="absolute inset-0 bg-primary/10 blur-[60px] rounded-[4rem] opacity-0 group-focus-within:opacity-100 transition-opacity duration-1000" />
        
        <div className="relative z-10 glass-cosmic border-2 border-white/10 rounded-[3.5rem] overflow-hidden focus-within:border-primary/40 transition-all duration-500 shadow-3xl">
          <div className="flex items-center px-10 py-8 gap-8">
            <div className="hidden md:flex h-16 w-16 rounded-3xl bg-white/5 items-center justify-center text-white/20 group-focus-within:text-primary transition-colors">
              <Search size={32} />
            </div>
            
            <input 
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="اشرح حالتك القانونية بوضوح.. سأقوم بتوجيهك فوراً للمسار الأنسب"
              className="flex-1 bg-transparent border-none outline-none text-2xl md:text-3xl font-black text-white placeholder:text-white/10 text-right py-2"
              disabled={loading}
              dir="rtl"
            />

            <button 
              type="submit"
              disabled={loading || !query.trim()}
              className="h-16 w-16 md:h-20 md:w-20 rounded-[2rem] bg-primary text-[#020617] flex items-center justify-center hover:scale-110 active:scale-95 transition-all shadow-3xl disabled:opacity-20 disabled:grayscale"
            >
              {loading ? <Loader2 className="h-10 w-10 animate-spin" /> : <ArrowLeft className="h-10 w-10 rotate-180" />}
            </button>
          </div>
        </div>
      </form>

      <AnimatePresence mode="wait">
        {loading && (
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="flex flex-col items-center gap-4 py-4"
          >
            <div className="flex items-center gap-3">
              <Sparkles className="text-primary animate-pulse h-5 w-5" />
              <p className="text-[10px] font-black text-primary uppercase tracking-[0.5em] animate-pulse">جاري تحديد المسار القانوني الأمثل لموقفك السيادي...</p>
            </div>
          </motion.div>
        )}

        {detectedIntent && !loading && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-primary/5 border border-primary/20 p-8 rounded-[3rem] flex items-center justify-between shadow-2xl backdrop-blur-3xl"
          >
            <div className="flex items-center gap-6">
              <div className="h-16 w-16 bg-primary rounded-2xl flex items-center justify-center text-[#020617] shadow-xl">
                {detectedIntent.includes('المكتبة') ? <FileText size={32} /> : <Users size={32} />}
              </div>
              <div className="text-right">
                <p className="text-2xl font-black text-white">تم اكتشاف الغرض من طلبك!</p>
                <p className="text-sm font-bold text-white/40 mt-1 uppercase tracking-widest">تحويل سيادي مباشر إلى: <span className="text-primary">{detectedIntent}</span></p>
              </div>
            </div>
            <div className="h-12 w-12 rounded-full border-2 border-primary/30 flex items-center justify-center text-primary">
               <Zap className="h-6 w-6 animate-bounce" fill="currentColor" />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex flex-wrap justify-center gap-3 pt-4 opacity-30 hover:opacity-60 transition-opacity">
         <span className="text-[9px] font-black text-white uppercase tracking-widest px-4 py-2 border border-white/10 rounded-full">AI Intent Core v4.5</span>
         <span className="text-[9px] font-black text-white uppercase tracking-widest px-4 py-2 border border-white/10 rounded-full">Direct Handoff Protocol</span>
         <span className="text-[9px] font-black text-white uppercase tracking-widest px-4 py-2 border border-white/10 rounded-full">Sovereign Encryption</span>
      </div>
    </div>
  );
}
