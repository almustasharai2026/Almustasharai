"use client";

import { useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Wallet, QrCode, ShieldCheck, CheckCircle2, ArrowRight } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function CheckoutPage() {
  const searchParams = useSearchParams();
  const plan = searchParams.get("plan") || "basic";
  const { toast } = useToast();
  const router = useRouter();

  const getPrice = () => {
    if (plan === "pro") return "250";
    if (plan === "vip") return "500";
    return "100";
  };

  const handleConfirm = () => {
    toast({
      title: "تم استلام طلب الدفع",
      description: "جاري مراجعة التحويل. سيتم تفعيل الباقة في خلال ١٥ دقيقة.",
    });
    router.push("/dashboard");
  };

  return (
    <div className="container mx-auto px-4 py-20 max-w-4xl text-right" dir="rtl">
      <div className="grid lg:grid-cols-12 gap-10">
        
        <div className="lg:col-span-7 space-y-6">
          <Card className="glass-cosmic border-none rounded-[2rem] p-8 shadow-2xl">
            <CardHeader className="p-0 mb-8">
              <CardTitle className="text-2xl font-bold flex items-center gap-3 justify-end">
                 تأكيد عملية الدفع <Wallet className="h-6 w-6 text-primary" />
              </CardTitle>
              <CardDescription className="text-right">اتبع الخطوات لإتمام عملية الشحن بأمان.</CardDescription>
            </CardHeader>

            <div className="space-y-8">
              <div className="p-6 glass-cosmic rounded-2xl border-primary/20 bg-primary/5 text-center">
                <p className="text-sm opacity-60 mb-2">حول المبلغ المطلوب إلى هذا الرقم</p>
                <h3 className="text-3xl font-black text-white tracking-widest">01130031531</h3>
                <p className="text-xs text-primary font-bold mt-2">فودافون كاش / اتصالات كاش</p>
              </div>

              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>رقم الهاتف الذي قمت بالتحويل منه</Label>
                  <Input placeholder="01xxxxxxxxx" className="glass border-white/10 h-12 text-center text-lg" />
                </div>
                <div className="space-y-2">
                  <Label>إرفاق صورة التحويل (سكرين شوت)</Label>
                  <div className="border-2 border-dashed border-white/10 rounded-2xl p-8 text-center hover:bg-white/5 transition-all cursor-pointer">
                    <QrCode className="h-10 w-10 mx-auto mb-2 opacity-40" />
                    <p className="text-sm opacity-50">اضغط لرفع الصورة</p>
                  </div>
                </div>
              </div>

              <Button onClick={handleConfirm} className="w-full btn-primary h-14 rounded-2xl text-lg font-bold">
                تأكيد التحويل الآن
              </Button>
            </div>
          </Card>
        </div>

        <div className="lg:col-span-5 space-y-6">
          <Card className="glass-cosmic border-none rounded-[2rem] p-8 bg-slate-900/80">
            <h3 className="text-xl font-bold mb-6 border-b border-white/5 pb-4">ملخص الطلب</h3>
            <div className="space-y-4 text-lg">
              <div className="flex justify-between">
                <span className="opacity-50">الباقة المختارة:</span>
                <span className="text-white font-bold">{plan.toUpperCase()}</span>
              </div>
              <div className="flex justify-between">
                <span className="opacity-50">القيمة:</span>
                <span className="text-white font-bold">{getPrice()} EGP</span>
              </div>
              <div className="flex justify-between border-t border-white/5 pt-4">
                <span className="font-bold">الإجمالي:</span>
                <span className="text-2xl font-black text-primary">{getPrice()} EGP</span>
              </div>
            </div>
            <div className="mt-8 p-4 bg-emerald-500/10 rounded-xl flex items-center gap-3 border border-emerald-500/20">
               <ShieldCheck className="h-5 w-5 text-emerald-500" />
               <p className="text-[10px] text-emerald-500 leading-relaxed font-bold">معالجة آمنة ومضمونة ١٠٠٪ تحت إشراف إدارة المنصة.</p>
            </div>
          </Card>
          
          <Button variant="ghost" onClick={() => router.back()} className="w-full gap-2 opacity-50 hover:opacity-100">
            <ArrowRight className="h-4 w-4" /> العودة للباقات
          </Button>
        </div>

      </div>
    </div>
  );
}