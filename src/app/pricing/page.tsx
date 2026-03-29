
"use client";

import { Check, Zap, Shield, Crown, Sparkles, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { useRouter } from "next/navigation";
import { Badge } from "@/components/ui/badge";

const OFFERS = [
  {
    id: "basic",
    name: "الباقة الأساسية",
    price: "100",
    description: "مثالية للاستشارات البسيطة والطارئة والتحقق من النماذج.",
    features: ["٣ استشارات ذكية عالية الدقة", "تحميل ٥ نماذج قانونية محققة", "دعم فني عبر البريد", "وصول لمجتمع المستشار"],
    icon: <Zap className="h-8 w-8 text-blue-400" />,
    color: "border-blue-500/20",
    bg: "bg-blue-500/5"
  },
  {
    id: "pro",
    name: "الباقة الاحترافية",
    price: "250",
    description: "الخيار الذهبي لرواد الأعمال، الشركات الناشئة، والاحتياجات الأسرية.",
    features: ["استشارات ذكية غير محدودة", "تحميل كافة النماذج الـ ٢٥٠+", "مكالمة فيديو ١٥ دقيقة مجانية", "أولوية قصوى في معالجة الطلبات", "تدقيق قانوني آلي للوثائق"],
    icon: <Crown className="h-8 w-8 text-amber-400" />,
    color: "border-amber-500/40",
    bg: "bg-amber-500/5",
    popular: true
  },
  {
    id: "vip",
    name: "الباقة السيادية",
    price: "500",
    description: "تغطية قانونية شاملة للنزاعات المعقدة والشركات الكبرى.",
    features: ["كل مميزات الباقة الاحترافية", "مكالمات فيديو وصوت غير محدودة", "مراجعة يدوية للعقود من مستشار", "مستشار خاص متاح للطوارئ", "تقارير تحليل قانوني معمقة"],
    icon: <Shield className="h-8 w-8 text-emerald-400" />,
    color: "border-emerald-500/20",
    bg: "bg-emerald-500/5"
  }
];

export default function PricingPage() {
  const router = useRouter();

  const handleSelect = (offerId: string) => {
    router.push(`/checkout?plan=${offerId}`);
  };

  return (
    <div className="container mx-auto px-4 py-24 max-w-7xl text-right" dir="rtl">
      <div className="text-center space-y-6 mb-20 relative">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[500px] h-[300px] bg-primary/10 blur-[120px] -z-10" />
        <Badge variant="outline" className="text-primary border-primary/30 px-6 py-1.5 rounded-full font-black text-xs uppercase tracking-widest bg-primary/5">
           باقات الحماية القانونية
        </Badge>
        <h1 className="text-5xl md:text-7xl font-black text-white leading-tight">اختر خطتك <span className="text-gradient">المستقبلية</span></h1>
        <p className="text-muted-foreground text-xl max-w-2xl mx-auto leading-relaxed opacity-70">
          استثمر في أمانك القانوني مع باقات مرنة صممت لتوفر لك الحماية، الدقة، والسرعة الفائقة في اتخاذ القرار.
        </p>
      </div>

      <div className="grid md:grid-cols-3 gap-10">
        {OFFERS.map((offer) => (
          <Card key={offer.id} className={`glass-cosmic relative overflow-hidden flex flex-col ${offer.color} border-2 group hover:scale-[1.02] transition-all duration-500 rounded-[3rem]`}>
            {offer.popular && (
              <div className="absolute top-0 right-0 bg-primary text-primary-foreground text-[10px] font-black px-6 py-2 rounded-bl-[1.5rem] shadow-xl flex items-center gap-2">
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
                  <span className="text-xs opacity-40 font-bold">/ شهرياً</span>
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
                className={`w-full h-16 rounded-2xl text-xl font-black transition-all group overflow-hidden relative ${offer.popular ? 'cosmic-gradient shadow-2xl shadow-primary/20' : 'glass hover:bg-white/10'}`}
              >
                <span className="relative z-10 flex items-center justify-center gap-3">
                  اشترك الآن <Sparkles className="h-5 w-5" />
                </span>
                <div className="absolute inset-0 bg-white/20 translate-x-full group-hover:translate-x-0 transition-transform duration-500" />
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>
      
      <div className="mt-24 text-center p-12 glass rounded-[4rem] border-white/5 max-w-4xl mx-auto space-y-6">
         <h3 className="text-3xl font-black">هل تحتاج إلى حلول مخصصة؟</h3>
         <p className="text-muted-foreground text-lg">نحن نوفر باقات خاصة للمؤسسات الحكومية والشركات القابضة.</p>
         <Button variant="outline" className="rounded-2xl h-14 px-10 text-lg font-bold glass border-primary/20 hover:bg-primary/10">
           تواصل مع قسم المبيعات
         </Button>
      </div>
    </div>
  );
}
