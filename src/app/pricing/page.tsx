"use client";

import { Check, Zap, Crown, Shield, Loader2, Wallet, Plus, ArrowRight } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useState } from "react";
import { useFirestore, useUser } from "@/firebase";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import SovereignButton from "@/components/SovereignButton";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import Link from "next/link";

export default function PricingPage() {
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const db = useFirestore();
  const { user, profile } = useUser();
  const router = useRouter();

  const OFFERS = [
    {
      id: "basic",
      name: "الباقة الأساسية",
      price: 100,
      credits: 100,
      description: "بداية رحلة العدالة الرقمية.",
      features: ["١٠٠ رسالة استشارة", "إصدار عقد واحد", "دعم فني عالي"],
      icon: <Zap className="h-8 w-8 text-blue-500" />,
      color: "blue"
    },
    {
      id: "pro",
      name: "الباقة الاحترافية",
      price: 250,
      credits: 300,
      description: "للمواطنين ذوي الاحتياجات القانونية المستمرة.",
      features: ["٣٠٠ رسالة استشارة", "إصدار ٥ عقود", "أولوية الدخول للخبراء"],
      icon: <Crown className="h-8 w-8 text-amber-500" />,
      isPopular: true,
      color: "amber"
    },
    {
      id: "vip",
      name: "الباقة السيادية",
      price: 500,
      credits: 700,
      description: "حماية قانونية مطلقة وشاملة.",
      features: ["٧٠٠ رسالة استشارة", "إصدار كافة الوثائق", "مستشار خاص متاح"],
      icon: <Shield className="h-8 w-8 text-emerald-500" />,
      color: "emerald"
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
    <div className="min-h-screen bg-[#f8f9fc] dark:bg-[#02040a] py-24 px-6 text-right" dir="rtl">
      <div className="max-w-7xl mx-auto space-y-24">
        
        <header className="text-center space-y-8 relative">
          <div className="absolute -top-20 inset-x-0 h-64 bg-primary/5 blur-[150px] -z-10 rounded-full" />
          <div className="inline-flex items-center gap-3 bg-primary/10 text-primary border border-primary/20 px-6 py-2 rounded-full text-xs font-black uppercase tracking-[0.2em] shadow-inner">
             <Wallet className="h-4 w-4" /> المحفظة السيادية
          </div>
          <h1 className="text-6xl md:text-8xl font-black text-slate-900 dark:text-white tracking-tighter leading-none">
            اشحن رصيد <br /><span className="text-gradient">العدالة</span>
          </h1>
          <p className="text-xl text-muted-foreground font-bold max-w-2xl mx-auto">
            اختر الباقة الأنسب لاحتياجاتك القانونية. يتم تحويل الرصيد فور تأكيد المعاملة السيادية.
          </p>
        </header>

        <div className="grid md:grid-cols-3 gap-10">
          {OFFERS.map((offer) => (
            <motion.div key={offer.id} whileHover={{ y: -10 }} transition={{ type: "spring", stiffness: 300 }}>
              <Card className={`rounded-[4rem] border-2 relative overflow-hidden h-full flex flex-col transition-all duration-500 shadow-2xl bg-white dark:bg-slate-900/80 ${offer.isPopular ? 'border-primary shadow-primary/20' : 'border-border dark:border-white/5'}`}>
                {offer.isPopular && (
                  <div className="absolute top-8 left-[-40px] bg-primary text-white font-black text-[10px] py-2 w-40 -rotate-45 text-center shadow-xl z-20 uppercase tracking-widest">
                    الأكثر طلباً
                  </div>
                )}

                <CardHeader className="p-12 pb-8 space-y-8">
                  <div className="h-20 w-20 rounded-3xl bg-slate-100 dark:bg-white/5 flex items-center justify-center border border-border dark:border-white/5 shadow-inner">
                    {offer.icon}
                  </div>
                  <div className="space-y-2">
                    <CardTitle className="text-3xl font-black text-slate-900 dark:text-white">{offer.name}</CardTitle>
                    <div className="flex items-baseline gap-2">
                      <span className="text-6xl font-black text-slate-900 dark:text-white tabular-nums tracking-tighter">{offer.price}</span>
                      <span className="text-muted-foreground font-black text-sm uppercase tracking-widest">EGP</span>
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="px-12 flex-grow space-y-6">
                  <p className="text-muted-foreground font-medium leading-relaxed">{offer.description}</p>
                  <div className="space-y-4">
                    {offer.features.map((f, i) => (
                      <div key={i} className="flex items-center gap-4 group">
                        <div className="h-6 w-6 rounded-lg bg-emerald-500/10 flex items-center justify-center shrink-0 border border-emerald-500/20">
                          <Check className="h-3.5 w-3.5 text-emerald-500" />
                        </div>
                        <span className="text-sm font-bold text-slate-600 dark:text-white/60 group-hover:text-primary transition-colors">{f}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>

                <CardFooter className="p-12 pt-6 mt-auto">
                  <SovereignButton 
                    text={loadingId === offer.id ? "جاري المعالجة..." : "تفعيل الباقة"} 
                    onClick={() => handleSelect(offer)}
                    disabled={loadingId === offer.id}
                    icon={loadingId === offer.id ? <Loader2 className="animate-spin" /> : <Plus />}
                  />
                </CardFooter>
              </Card>
            </motion.div>
          ))}
        </div>

        <footer className="text-center pt-10">
           <div className="flex flex-col items-center gap-6">
              <p className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.4em]">Sovereign Payment Protocol Secure v4.5</p>
              <div className="flex items-center gap-4 text-xs font-black text-slate-400">
                 <Shield className="h-4 w-4 text-emerald-500" />
                 <span>مدعوم بتقنيات التشفير اللحظي</span>
                 <div className="h-1 w-1 rounded-full bg-slate-300" />
                 <Link href="/terms" className="hover:text-primary underline decoration-primary/20">سياسة الإرجاع</Link>
              </div>
           </div>
        </footer>
      </div>
    </div>
  );
}