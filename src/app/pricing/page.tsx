"use client";

import { Check, Zap, Shield, Crown, Sparkles, Star, Clock, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { createSovereignCheckout } from "@/lib/sovereign-checkout";
import { useState } from "react";

const OFFERS = [
  {
    id: "basic",
    name: "الباقة الأساسية",
    price: "100",
    minutes: "30",
    description: "مثالية للاستشارات البسيطة والطارئة التي لا تتجاوز نص ساعة.",
    features: ["٣٠ دقيقة اتصال فيديو مباشرة", "تحميل ٥ نماذج قانونية", "دعم فني عبر البريد", "استشارات بوت غير محدودة"],
    icon: <Zap className="h-8 w-8 text-blue-400" />,
    color: "border-blue-500/20",
    bg: "bg-blue-500/5"
  },
  {
    id: "pro",
    name: "الباقة الاحترافية",
    price: "250",
    minutes: "90",
    description: "الخيار الذهبي للاحتياجات الأسرية والتجارية المتوسطة.",
    features: ["٩٠ دقيقة اتصال فيديو مباشرة", "تحميل كافة النماذج الـ ٢٥٠+", "أولوية في حجز المستشارين", "تدقيق قانوني آلي للوثائق"],
    icon: <Crown className="h-8 w-8 text-amber-400" />,
    color: "border-amber-500/40",
    bg: "bg-amber-500/5",
    popular: true
  },
  {
    id: "vip",
    name: "الباقة السيادية",
    price: "500",
    minutes: "240",
    description: "تغطية قانونية شاملة للنزاعات المعقدة والشركات.",
    features: ["٢٤٠ دقيقة (٤ ساعات) فيديو", "مراجعة يدوية للعقود من مستشار", "مستشار خاص متاح للطوارئ", "تقارير تحليل قانوني معمقة"],
    icon: <Shield className="h-8 w-8 text-emerald-400" />,
    color: "border-emerald-500/20",
    bg: "bg-emerald-500/5"
  }
];

export default function PricingPage() {
  const [loadingId, setLoadingId] = useState<string | null>(null);

  const handleSelect = async (offerId: string) => {
    setLoadingId(offerId);
    await createSovereignCheckout(offerId);
    // سيقوم التابع بالتوجيه تلقائياً
  };

  return (
    <div className="container mx-auto px-4 py-24 max-w-7xl text-right" dir="rtl">
      <div className="text-center space-y-6 mb-20 relative">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[500px] h-[300px] bg-primary/10 blur-[120px] -z-10" />
        <Badge variant="outline" className="text-primary border-primary/30 px-6 py-1.5 rounded-full font-black text-xs uppercase tracking-widest bg-primary/5">
           باقات الوقت والحماية
        </Badge>
        <h1 className="text-5xl md:text-7xl font-black text-white leading-tight">اشحن وقتك <span className="text-gradient">القانوني</span></h1>
        <p className="text-muted-foreground text-xl max-w-2xl mx-auto leading-relaxed opacity-70">
          استثمر في وقتك مع مستشاريك. اختر الباقة التي تناسب مدة قضيتك واحصل على الحماية الفورية.
        </p>
      </div>

      <div className="grid md:grid-cols-3 gap-10">
        {OFFERS.map((offer) => (
          <Card key={offer.id} className={`glass-cosmic relative overflow-hidden flex flex-col ${offer.color} border-2 group hover:scale-[1.02] transition-all duration-500 rounded-[3.5rem]`}>
            {offer.popular && (
              <div className="absolute top-0 right-0 bg-primary text-slate-950 text-[10px] font-black px-8 py-3 rounded-bl-[2rem] shadow-xl flex items-center gap-2">
                <Star className="h-3 w-3 fill-current" />
                الأكثر طلباً
              </div>
            )}
            
            <CardHeader className="pt-12 p-10 space-y-6">
              <div className={`h-20 w-20 rounded-3xl ${offer.bg} flex items-center justify-center shadow-inner border border-white/5`}>
                {offer.icon}
              </div>
              <div>
                <CardTitle className="text-3xl font-black text-white">{offer.name}</CardTitle>
                <div className="flex items-baseline gap-2 mt-4">
                  <span className="text-6xl font-black text-white tracking-tighter">{offer.price}</span>
                  <span className="text-muted-foreground font-bold">EGP</span>
                  <Badge className="bg-white/5 text-primary border-none mr-2 font-black flex items-center gap-1">
                     <Clock className="h-3 w-3" /> {offer.minutes} دقيقة
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground mt-4 leading-relaxed font-medium">{offer.description}</p>
              </div>
            </CardHeader>

            <CardContent className="flex-grow px-10 space-y-5">
              <div className="h-px bg-white/5 w-full mb-2" />
              {offer.features.map((feature, i) => (
                <div key={i} className="flex items-start gap-4 text-sm group/item">
                  <div className="h-6 w-6 rounded-lg bg-primary/10 flex items-center justify-center shrink-0 group-hover/item:scale-110 transition-transform">
                    <Check className="h-3.5 w-3.5 text-primary" />
                  </div>
                  <span className="opacity-70 group-hover/item:opacity-100 transition-opacity leading-relaxed font-medium">{feature}</span>
                </div>
              ))}
            </CardContent>

            <CardFooter className="p-10 pt-6">
              <Button 
                onClick={() => handleSelect(offer.id)}
                disabled={loadingId === offer.id}
                className={`w-full h-16 rounded-2xl text-xl font-black transition-all group overflow-hidden relative ${offer.popular ? 'bg-indigo-600 text-white shadow-2xl shadow-primary/20' : 'glass hover:bg-white/10'}`}
              >
                <span className="relative z-10 flex items-center justify-center gap-3">
                  {loadingId === offer.id ? <Loader2 className="animate-spin" /> : <>اشترك الآن <Sparkles className="h-5 w-5" /></>}
                </span>
                <div className="absolute inset-0 bg-white/20 translate-x-full group-hover:translate-x-0 transition-transform duration-500" />
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  );
}
