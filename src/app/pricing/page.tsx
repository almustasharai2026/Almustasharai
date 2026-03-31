
"use client";

import { Check, Zap, Crown, Shield, Loader2, Wallet, Plus } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { useState } from "react";
import { useFirestore, useUser } from "@/firebase";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import SovereignButton from "@/components/SovereignButton";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";

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
      icon: <Zap className="h-10 w-10 text-blue-400" />,
      color: "from-blue-500/20 to-indigo-600/5",
      border: "border-blue-500/20"
    },
    {
      id: "professional",
      name: "الباقة الاحترافية",
      price: 250,
      credits: 300,
      description: "للمواطنين ذوي الاحتياجات القانونية المستمرة ورجال الأعمال.",
      features: ["٣٠٠ رسالة استشارة AI", "إصدار ٥ عقود معتمدة", "أولوية الدخول لمجلس الخبراء"],
      icon: <Crown className="h-10 w-10 text-amber-400" />,
      isPopular: true,
      color: "from-amber-500/20 to-orange-600/5",
      border: "border-amber-500/40"
    },
    {
      id: "sovereign",
      name: "العضوية السيادية",
      price: 500,
      credits: 700,
      description: "حماية قانونية مطلقة وشاملة لكافة معاملاتك.",
      features: ["٧٠٠ رسالة استشارة AI", "إصدار كافة الوثائق بلا حدود", "مستشار خاص متاح ٢٤/٧"],
      icon: <Shield className="h-10 w-10 text-emerald-400" />,
      color: "from-emerald-500/20 to-teal-600/5",
      border: "border-emerald-500/20"
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
      <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-primary/5 blur-[150px] rounded-full -z-10" />

      <div className="max-w-7xl mx-auto space-y-24">
        <header className="text-center space-y-8 max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-3 bg-white/5 border border-white/10 px-6 py-2 rounded-full text-[10px] font-black uppercase tracking-widest text-primary">
             <Wallet className="h-4 w-4" /> Sovereign Vault
          </div>
          <h1 className="text-6xl md:text-8xl font-black text-white tracking-tighter">
            خزنة <span className="text-gradient">الرصيد السيادي</span>
          </h1>
          <p className="text-xl text-white/40 font-bold leading-relaxed">
            اختر قوتك القانونية الآن. نظام الوحدات المالية السيادي يمنحك السيطرة الكاملة على كافة خدمات الكوكب.
          </p>
        </header>

        <div className="grid lg:grid-cols-3 gap-12">
          {OFFERS.map((offer) => (
            <motion.div key={offer.id} whileHover={{ y: -20 }} transition={{ type: "spring", stiffness: 300 }}>
              <Card className={`rounded-[4rem] border-2 relative overflow-hidden h-full flex flex-col transition-all duration-700 bg-white/[0.03] backdrop-blur-3xl shadow-3xl ${offer.border}`}>
                {offer.isPopular && (
                  <div className="absolute top-10 left-[-50px] bg-primary text-[#02020a] font-black text-[10px] py-2 w-48 -rotate-45 text-center shadow-2xl z-20">
                    الأكثر سيادة
                  </div>
                )}

                <CardHeader className="p-12 pb-8 space-y-8">
                  <div className={`h-24 w-24 rounded-[2.5rem] bg-gradient-to-br ${offer.color} flex items-center justify-center border border-white/10 shadow-inner`}>
                    {offer.icon}
                  </div>
                  <div className="space-y-2">
                    <CardTitle className="text-4xl font-black text-white tracking-tight">{offer.name}</CardTitle>
                    <div className="flex items-baseline gap-2">
                      <span className="text-6xl font-black text-white tabular-nums">{offer.price}</span>
                      <span className="text-white/30 font-bold text-sm">EGP / باقة</span>
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="px-12 flex-grow space-y-8">
                  <p className="text-white/40 font-bold text-lg leading-relaxed">{offer.description}</p>
                  <div className="space-y-4">
                    {offer.features.map((f, i) => (
                      <div key={i} className="flex items-center gap-4">
                        <Check className="h-5 w-5 text-primary shrink-0" />
                        <span className="text-sm font-black text-white/60">{f}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>

                <CardFooter className="p-12 pt-6">
                  <SovereignButton 
                    text={loadingId === offer.id ? "جاري المعالجة..." : "تفعيل الباقة"} 
                    onClick={() => handleSelect(offer)}
                    disabled={loadingId === offer.id}
                    icon={<Plus />}
                    className="h-20 rounded-[2rem]"
                  />
                </CardFooter>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
