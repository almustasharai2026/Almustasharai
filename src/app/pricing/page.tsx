
"use client";

import { Check, Zap, Shield, Crown, Sparkles, Star, Clock, Loader2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useState } from "react";
import { useFirestore, useCollection, useUser } from "@/firebase";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { useMemoFirebase } from "@/firebase/provider";
import SovereignButton from "@/components/SovereignButton";
import { useRouter } from "next/navigation";

export default function PricingPage() {
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const db = useFirestore();
  const { user } = useUser();
  const router = useRouter();

  // تصحيح المسار: الانتقال من system/offers إلى system/config/offers لضمان عدد قطاعات فردي للمجموعة
  const offersQuery = useMemoFirebase(() => db ? collection(db, "system", "config", "offers") : null, [db]);
  const { data: remoteOffers, isLoading: isOffersLoading } = useCollection(offersQuery);

  const DEFAULT_OFFERS = [
    {
      id: "basic",
      name: "الباقة الأساسية",
      price: 100,
      minutes: "30",
      description: "بداية رحلة العدالة الرقمية.",
      features: ["٣٠ دقيقة استشارة", "إصدار عقد واحد", "دعم فني عالي"],
      icon: <Zap className="h-8 w-8 text-blue-400" />
    },
    {
      id: "pro",
      name: "الباقة الاحترافية",
      price: 250,
      minutes: "100",
      description: "للمواطنين ذوي الاحتياجات القانونية المستمرة.",
      features: ["١٠٠ دقيقة استشارة", "إصدار ٥ عقود", "أولوية الدخول للخبراء"],
      icon: <Crown className="h-8 w-8 text-amber-400" />,
      isPopular: true
    },
    {
      id: "vip",
      name: "الباقة السيادية",
      price: 500,
      minutes: "Unlimited",
      description: "حماية قانونية مطلقة وشاملة.",
      features: ["دقائق غير محدودة", "إصدار كافة الوثائق", "مستشار خاص متاح"],
      icon: <Shield className="h-8 w-8 text-emerald-400" />
    }
  ];

  const offersToDisplay = remoteOffers && remoteOffers.length > 0 ? remoteOffers : DEFAULT_OFFERS;

  const handleSelect = async (offer: any) => {
    if (!user || !db) {
      router.push("/auth/login");
      return;
    }
    setLoadingId(offer.id);
    
    try {
      await addDoc(collection(db, "paymentRequests"), {
        userId: user.uid,
        userName: user.displayName || user.email,
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
    <div className="container mx-auto px-4 py-24 max-w-7xl text-right" dir="rtl">
      <div className="text-center space-y-6 mb-20">
        <Badge variant="outline" className="text-primary border-primary/30 px-6 py-1.5 rounded-full font-black text-xs uppercase tracking-widest bg-primary/5">
           باقات الرصيد السيادي
        </Badge>
        <h1 className="text-5xl md:text-7xl font-black text-white leading-tight">اشحن محفظتك <span className="text-gradient">القانونية</span></h1>
      </div>

      {isOffersLoading ? (
        <div className="py-20 flex justify-center"><Loader2 className="h-12 w-12 animate-spin text-primary opacity-20" /></div>
      ) : (
        <div className="grid md:grid-cols-3 gap-10">
          {offersToDisplay.map((offer) => (
            <Card key={offer.id} className={`glass-cosmic relative overflow-hidden flex flex-col border-2 group transition-all duration-500 rounded-[3.5rem] ${offer.isPopular ? 'border-amber-500/40' : 'border-white/5'}`}>
              <CardHeader className="pt-12 p-10 space-y-6">
                <div className="h-20 w-20 rounded-3xl bg-primary/5 flex items-center justify-center border border-white/5">
                  <Zap className="h-8 w-8 text-blue-400" />
                </div>
                <div>
                  <CardTitle className="text-3xl font-black text-white">{offer.name}</CardTitle>
                  <div className="flex items-baseline gap-2 mt-4">
                    <span className="text-6xl font-black text-white tracking-tighter">{offer.price}</span>
                    <span className="text-muted-foreground font-bold text-sm">EGP</span>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="flex-grow px-10 space-y-5">
                {offer.features?.map((feature: string, i: number) => (
                  <div key={i} className="flex items-start gap-4 text-sm group/item">
                    <div className="h-6 w-6 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                      <Check className="h-3.5 w-3.5 text-primary" />
                    </div>
                    <span className="opacity-70 group-hover/item:opacity-100 transition-opacity font-medium">{feature}</span>
                  </div>
                ))}
              </CardContent>

              <CardFooter className="p-10 pt-6">
                <SovereignButton 
                  text={loadingId === offer.id ? "جاري المعالجة..." : "اشترك في الباقة"} 
                  onClick={() => handleSelect(offer)}
                  disabled={loadingId === offer.id}
                  className={offer.isPopular ? "bg-amber-600" : ""}
                />
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
