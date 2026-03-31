"use client";

import { Check, Zap, Crown, Shield, Loader2, Wallet, Plus, ArrowRight, ShieldCheck, Sparkles } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useState } from "react";
import { useFirestore, useUser } from "@/firebase";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import SovereignButton from "@/components/SovereignButton";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import Link from "next/link";

/**
 * صفحة باقات الرصيد السيادي (Sovereign Credits Vault).
 * تصميم مبتكر يعتمد نظام البطاقات المتوهجة والمؤثرات البصرية الفاخرة.
 */
export default function PricingPage() {
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const db = useFirestore();
  const { user, profile } = useUser();
  const router = useRouter();

  const OFFERS = [
    {
      id: "starter",
      name: "باقة المبادرة",
      price: 100,
      credits: 100,
      description: "بداية رحلة العدالة الرقمية، مثالية للاستفسارات الفردية.",
      features: ["١٠٠ رسالة استشارة AI", "أرشفة سحابية لمدة شهر", "دعم فني أساسي"],
      icon: <Zap className="h-10 w-10" />,
      color: "from-blue-500 to-indigo-600",
      glow: "shadow-blue-500/20"
    },
    {
      id: "professional",
      name: "الباقة الاحترافية",
      price: 250,
      credits: 300,
      description: "للمواطنين ذوي الاحتياجات القانونية المستمرة ورجال الأعمال.",
      features: ["٣٠٠ رسالة استشارة AI", "إصدار ٥ عقود معتمدة", "أولوية الدخول لمجلس الخبراء", "أرشفة سحابية دائمة"],
      icon: <Crown className="h-10 w-10" />,
      isPopular: true,
      color: "from-amber-500 to-orange-600",
      glow: "shadow-amber-500/30"
    },
    {
      id: "sovereign",
      name: "العضوية السيادية",
      price: 500,
      credits: 700,
      description: "حماية قانونية مطلقة وشاملة لكافة معاملاتك.",
      features: ["٧٠٠ رسالة استشارة AI", "إصدار كافة الوثائق بلا حدود", "مستشار خاص متاح ٢٤/٧", "تحليل وثائق عبر الرؤية الحاسوبية"],
      icon: <Shield className="h-10 w-10" />,
      color: "from-emerald-500 to-teal-600",
      glow: "shadow-emerald-500/20"
    }
  ];

  const handleSelect = async (offer: any) => {
    if (!user || !db) {
      router.push("/auth/login");
      return;
    }
    setLoadingId(offer.id);
    
    try {
      await addDoc(collection(db, "paymentRequests"), {
        userId: user.uid,
        userName: profile?.fullName || user.email,
        amount: offer.price,
        plan: offer.name,
        status: "pending",
        createdAt: serverTimestamp()
      });
      
      router.push(`/checkout?plan=${offer.id}`);
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingId(null);
    }
  };

  return (
    <div className="min-h-screen bg-[#02020a] py-32 px-6 relative overflow-hidden" dir="rtl">
      {/* Background Cosmic Blobs */}
      <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-primary/5 blur-[150px] rounded-full -z-10" />
      <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-indigo-600/5 blur-[150px] rounded-full -z-10" />

      <div className="max-w-7xl mx-auto space-y-32">
        
        <header className="text-center space-y-8 max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-3 bg-white/5 border border-white/10 px-6 py-2 rounded-full text-[10px] font-black uppercase tracking-[0.3em] text-primary shadow-inner">
             <Wallet className="h-4 w-4" /> Sovereign Financial Node
          </div>
          <h1 className="text-6xl md:text-8xl font-black text-white tracking-tighter leading-none">
            استثمر في <br /><span className="text-gradient">أمانك القانوني</span>
          </h1>
          <p className="text-xl text-white/40 font-bold leading-relaxed">
            نظام الوحدات المالية السيادي يمنحك الوصول الكامل لكافة محركات الذكاء الاصطناعي وهيئة الخبراء. اختر قوتك الآن.
          </p>
        </header>

        <div className="grid lg:grid-cols-3 gap-12">
          {OFFERS.map((offer) => (
            <motion.div 
              key={offer.id} 
              whileHover={{ y: -20, scale: 1.02 }} 
              transition={{ type: "spring", stiffness: 200, damping: 20 }}
              className="h-full"
            >
              <Card className={`rounded-[4rem] border-2 relative overflow-hidden h-full flex flex-col transition-all duration-700 bg-white/[0.03] backdrop-blur-3xl shadow-3xl ${offer.isPopular ? 'border-primary shadow-primary/20 bg-primary/[0.02]' : 'border-white/5'}`}>
                
                {offer.isPopular && (
                  <div className="absolute top-10 left-[-50px] bg-primary text-[#02020a] font-black text-[10px] py-2.5 w-48 -rotate-45 text-center shadow-2xl z-20 uppercase tracking-[0.2em]">
                    الأكثر سيادة
                  </div>
                )}

                <CardHeader className="p-12 pb-8 space-y-10">
                  <div className={`h-24 w-24 rounded-[2.5rem] bg-gradient-to-br ${offer.color} flex items-center justify-center text-white shadow-2xl border border-white/20 ${offer.glow}`}>
                    {offer.icon}
                  </div>
                  <div className="space-y-3">
                    <CardTitle className="text-4xl font-black text-white tracking-tight">{offer.name}</CardTitle>
                    <div className="flex items-baseline gap-3">
                      <span className="text-7xl font-black text-white tabular-nums tracking-tighter">{offer.price}</span>
                      <span className="text-white/30 font-black text-sm uppercase tracking-widest">EGP / باقة</span>
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="px-12 flex-grow space-y-10">
                  <p className="text-white/40 font-bold text-lg leading-relaxed">{offer.description}</p>
                  <div className="space-y-5">
                    {offer.features.map((f, i) => (
                      <div key={i} className="flex items-center gap-5 group">
                        <div className="h-7 w-7 rounded-xl bg-white/5 flex items-center justify-center shrink-0 border border-white/5 group-hover:border-primary/40 transition-all">
                          <Check className="h-4 w-4 text-primary" />
                        </div>
                        <span className="text-sm font-black text-white/60 group-hover:text-white transition-colors">{f}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>

                <CardFooter className="p-12 pt-6 mt-auto">
                  <SovereignButton 
                    text={loadingId === offer.id ? "جاري التفعيل..." : "الحصول على الوحدات"} 
                    onClick={() => handleSelect(offer)}
                    disabled={loadingId === offer.id}
                    icon={loadingId === offer.id ? <Loader2 className="animate-spin" /> : <Plus />}
                    className="h-20 rounded-[2rem] shadow-xl"
                  />
                </CardFooter>
              </Card>
            </motion.div>
          ))}
        </div>

        <div className="max-w-4xl mx-auto glass-cosmic p-12 rounded-[4rem] border-white/5 bg-white/[0.01] flex flex-col md:flex-row items-center justify-between gap-10">
           <div className="flex items-center gap-8">
              <div className="h-20 w-20 rounded-3xl bg-emerald-500/10 flex items-center justify-center border border-emerald-500/20">
                 <ShieldCheck className="h-10 w-10 text-emerald-500" />
              </div>
              <div className="text-right">
                 <h4 className="text-2xl font-black text-white">حماية مالية مطلقة</h4>
                 <p className="text-white/30 font-bold text-sm">كافة المعاملات المالية موثقة ومؤمنة ببروتوكولات التشفير السيادية v4.5</p>
              </div>
           </div>
           <div className="flex items-center gap-4 bg-white/5 px-8 py-4 rounded-2xl border border-white/5">
              <Sparkles className="h-5 w-5 text-primary animate-pulse" />
              <span className="text-xs font-black text-white uppercase tracking-widest">Sovereign Encryption Level: High</span>
           </div>
        </div>

        <footer className="text-center pt-20">
           <div className="flex flex-col items-center gap-6">
              <p className="text-[9px] font-black text-white/10 uppercase tracking-[0.6em]">Sovereign Financial Protocol king2026 | Global Node v4.5</p>
           </div>
        </footer>
      </div>
    </div>
  );
}