"use client";

import { useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Wallet, QrCode, ShieldCheck, ArrowRight, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useUser, useFirestore } from "@/firebase";
import { collection, addDoc } from "firebase/firestore";

export default function CheckoutPage() {
  const searchParams = useSearchParams();
  const plan = searchParams.get("plan") || "basic";
  const { user } = useUser();
  const db = useFirestore();
  const { toast } = useToast();
  const router = useRouter();
  
  const [phoneNumber, setPhoneNumber] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const getPrice = () => {
    if (plan === "pro") return 250;
    if (plan === "vip") return 500;
    return 100;
  };

  const handleConfirm = async () => {
    if (!user || !db) return;
    if (!phoneNumber) {
      toast({ variant: "destructive", title: "بيان مطلوب", description: "يرجى إدخال رقم الهاتف الذي قمت بالتحويل منه." });
      return;
    }

    setIsSubmitting(true);
    try {
      // إنشاء طلب دفع سيادي (Payment Request)
      await addDoc(collection(db, "paymentRequests"), {
        userId: user.uid,
        userName: user.displayName || user.email,
        userPhone: phoneNumber,
        amount: getPrice(),
        status: "pending",
        plan: plan,
        createdAt: new Date().toISOString()
      });

      toast({
        title: "تم استلام طلبك السيادي",
        description: "جاري مراجعة التحويل من قبل الإدارة. سيتم الشحن خلال دقائق.",
      });
      router.push("/dashboard");
    } catch (e) {
      toast({ variant: "destructive", title: "فشل إرسال الطلب" });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-20 max-w-4xl text-right" dir="rtl">
      <div className="grid lg:grid-cols-12 gap-10">
        
        <div className="lg:col-span-7 space-y-6">
          <Card className="glass-cosmic border-none rounded-[2rem] p-8 shadow-2xl">
            <CardHeader className="p-0 mb-8">
              <CardTitle className="text-2xl font-bold flex items-center gap-3 justify-end text-white">
                 تأكيد عملية الدفع <Wallet className="h-6 w-6 text-primary" />
              </CardTitle>
              <CardDescription className="text-right text-white/40">اتبع الخطوات لإتمام عملية الشحن بأمان سيادي.</CardDescription>
            </CardHeader>

            <div className="space-y-8">
              <div className="p-6 glass-cosmic rounded-2xl border-primary/20 bg-primary/5 text-center">
                <p className="text-sm opacity-60 mb-2">حول المبلغ المطلوب إلى هذا الرقم</p>
                <h3 className="text-3xl font-black text-white tracking-widest">01130031531</h3>
                <p className="text-xs text-primary font-bold mt-2">فودافون كاش / اتصالات كاش</p>
              </div>

              <div className="space-y-4">
                <div className="space-y-2">
                  <Label className="text-white/60">رقم الهاتف الذي قمت بالتحويل منه</Label>
                  <Input 
                    placeholder="01xxxxxxxxx" 
                    className="glass border-white/10 h-14 rounded-2xl text-center text-xl font-bold" 
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-white/60">إثبات التحويل</Label>
                  <div className="border-2 border-dashed border-white/10 rounded-2xl p-10 text-center hover:bg-white/5 transition-all cursor-pointer group">
                    <QrCode className="h-12 w-12 mx-auto mb-3 opacity-20 group-hover:text-primary group-hover:opacity-100 transition-all" />
                    <p className="text-sm opacity-40 font-bold">رفع لقطة الشاشة (Screenshot)</p>
                  </div>
                </div>
              </div>

              <Button 
                onClick={handleConfirm} 
                disabled={isSubmitting}
                className="w-full btn-primary h-16 rounded-2xl text-xl font-black shadow-2xl"
              >
                {isSubmitting ? <Loader2 className="animate-spin" /> : "تأكيد التحويل الآن"}
              </Button>
            </div>
          </Card>
        </div>

        <div className="lg:col-span-5 space-y-6">
          <Card className="glass-cosmic border-none rounded-[2rem] p-8 bg-slate-900/80">
            <h3 className="text-xl font-bold mb-6 border-b border-white/5 pb-4">ملخص الطلب السيادي</h3>
            <div className="space-y-4 text-lg">
              <div className="flex justify-between">
                <span className="opacity-50 font-medium text-sm uppercase tracking-widest">الباقة</span>
                <span className="text-white font-black">{plan.toUpperCase()}</span>
              </div>
              <div className="flex justify-between">
                <span className="opacity-50 font-medium text-sm uppercase tracking-widest">القيمة</span>
                <span className="text-white font-black tabular-nums">{getPrice()} EGP</span>
              </div>
              <div className="flex justify-between border-t border-white/5 pt-4">
                <span className="font-black text-sm uppercase tracking-widest text-primary">الإجمالي</span>
                <span className="text-3xl font-black text-primary tabular-nums">{getPrice()} EGP</span>
              </div>
            </div>
            <div className="mt-8 p-5 bg-emerald-500/10 rounded-2xl flex items-center gap-4 border border-emerald-500/20">
               <ShieldCheck className="h-6 w-6 text-emerald-500 shrink-0" />
               <p className="text-[10px] text-emerald-500 leading-relaxed font-black uppercase tracking-wider">السيادة المالية للمواطن محمية ببروتوكولات التشفير اللحظي.</p>
            </div>
          </Card>
          
          <Button variant="ghost" onClick={() => router.back()} className="w-full gap-3 opacity-30 hover:opacity-100 font-bold transition-opacity">
            <ArrowRight className="h-4 w-4" /> العودة للباقات
          </Button>
        </div>

      </div>
    </div>
  );
}
