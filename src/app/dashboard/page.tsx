"use client";

import { useUser, useFirestore, useDoc } from "@/firebase";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  Wallet, Activity, History, Gift, ArrowUpRight, 
  ShieldCheck, User, LogOut, Settings, CreditCard,
  MessageSquare, BookOpen, Sparkles, PhoneCall, Loader2
} from "lucide-react";
import Link from "next/link";
import { doc, addDoc, collection, serverTimestamp } from "firebase/firestore";
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { motion } from "framer-motion";

export default function UltimateSaaSDashboard() {
  const { user } = useUser();
  const db = useFirestore();
  const { toast } = useToast();
  const [chargeAmount, setChargeAmount] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const userDocRef = user ? doc(db!, "users", user.uid) : null;
  const { data: profile, isLoading } = useDoc(userDocRef as any);

  const handleCharge = async () => {
    if (!chargeAmount || Number(chargeAmount) <= 0) {
      toast({ variant: "destructive", title: "مبلغ غير صحيح", description: "يرجى إدخال مبلغ صالح للشحن." });
      return;
    }
    
    setIsSubmitting(true);
    try {
      await addDoc(collection(db!, "paymentRequests"), {
        userId: user!.uid,
        userName: profile?.fullName || user!.email,
        amount: Number(chargeAmount),
        status: "pending",
        createdAt: new Date().toISOString()
      });
      
      toast({ title: "تم تسجيل طلبك", description: "المدير يراجع التحويل الآن. سيتم تحديث رصيدك فوراً." });
      setChargeAmount("");
    } catch (e) {
      toast({ variant: "destructive", title: "خطأ في الشبكة", description: "فشل إرسال الطلب، حاول مرة أخرى." });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) return <div className="h-screen flex items-center justify-center"><Loader2 className="animate-spin h-10 w-10 text-primary" /></div>;

  return (
    <div className="container mx-auto px-8 py-20 max-w-7xl" dir="rtl">
      
      {/* SaaS Premium Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-12 mb-24">
        <div className="text-right space-y-4">
          <h1 className="text-6xl md:text-7xl font-black text-white tracking-tighter leading-none">
            أهلاً، <span className="text-gradient">{profile?.fullName?.split(' ')[0] || "مستشارنا"}</span>
          </h1>
          <p className="text-2xl text-white/30 font-bold max-w-xl">مركز السيطرة القانونية الخاص بك. كل ما تحتاجه في مكان واحد.</p>
        </div>
        <div className="flex gap-4">
           <Button variant="ghost" className="glass-cosmic h-16 px-8 rounded-3xl font-black border-white/5 hover:bg-white/5">
             <Settings className="h-5 w-5 ml-3" /> الإعدادات
           </Button>
           <Button onClick={() => window.location.href = "/auth/login"} variant="destructive" className="h-16 px-8 rounded-3xl font-black bg-red-500/10 text-red-500 border-none hover:bg-red-500/20">
             <LogOut className="h-5 w-5 ml-3" /> خروج
           </Button>
        </div>
      </div>

      <div className="grid lg:grid-cols-12 gap-12">
        
        {/* Left Console: Financial & Identity */}
        <div className="lg:col-span-4 space-y-12">
          <Card className="glass-cosmic border-none rounded-[4rem] p-12 relative overflow-hidden group shadow-2xl">
            <div className="absolute top-0 right-0 w-48 h-48 bg-primary/10 blur-[80px] -z-10" />
            <div className="text-center space-y-10">
              <div className="h-40 w-40 glass-cosmic rounded-full mx-auto flex items-center justify-center border-2 border-primary/20 shadow-2xl relative">
                <User className="h-20 w-20 text-white/80" />
                <div className="absolute bottom-2 right-2 h-10 w-10 bg-emerald-500 rounded-full border-[6px] border-[#050505] shadow-lg shadow-emerald-500/20" />
              </div>
              
              <div className="space-y-4">
                <div className="bg-white/[0.02] p-10 rounded-[3rem] border border-white/5 shadow-inner">
                   <p className="text-[10px] text-white/20 font-black uppercase mb-4 tracking-[0.4em]">الرصيد السيادي</p>
                   <p className="text-7xl font-black text-white tabular-nums tracking-tighter">
                     {profile?.balance || 0} <span className="text-sm text-primary uppercase block mt-2">EGP Available</span>
                   </p>
                </div>
                <Link href="/pricing" className="w-full block">
                  <Button className="w-full btn-primary h-20 rounded-[2rem] text-xl font-black shadow-2xl">شحن رصيد جديد <ArrowUpRight className="mr-3 h-6 w-6" /></Button>
                </Link>
              </div>
            </div>
          </Card>

          <Card className="glass-cosmic border-none rounded-[3.5rem] p-12 space-y-10 shadow-2xl">
            <div className="flex items-center justify-between">
              <CreditCard className="h-10 w-10 text-primary" />
              <h3 className="font-black text-2xl text-white">إيداع مالي سريع</h3>
            </div>
            <div className="p-8 glass-cosmic rounded-3xl text-center bg-primary/5 border-primary/10">
               <p className="text-[10px] text-primary font-black mb-3 tracking-widest">رقم التحويل الرسمي المعتمد</p>
               <p className="text-3xl font-black text-white tracking-[0.2em]">01130031531</p>
               <p className="text-[10px] text-white/20 mt-3 font-bold">فودافون كاش / اتصالات كاش</p>
            </div>
            <div className="space-y-5">
              <div className="space-y-2">
                <Label className="text-white/20 text-[10px] font-black mr-2 uppercase">أدخل المبلغ المرسل</Label>
                <Input 
                  type="number" 
                  placeholder="المبلغ المحول (EGP)" 
                  value={chargeAmount}
                  onChange={e => setChargeAmount(e.target.value)}
                  className="glass border-white/10 h-16 rounded-2xl text-center text-2xl font-black text-white"
                />
              </div>
              <Button 
                onClick={handleCharge} 
                disabled={isSubmitting || !chargeAmount}
                className="w-full h-16 rounded-2xl font-black bg-white/[0.03] hover:bg-white/[0.08] text-white/60 border border-white/5 transition-all"
              >
                {isSubmitting ? <Loader2 className="animate-spin" /> : "إبلاغ الإدارة بالتحويل"}
              </Button>
            </div>
          </Card>
        </div>

        {/* Right Console: Activity & Pillars */}
        <div className="lg:col-span-8 space-y-12">
          
          <section className="space-y-10">
            <div className="flex items-center justify-between">
              <Link href="/bot">
                <Button className="h-12 px-8 rounded-2xl glass-cosmic border-primary/20 text-primary hover:bg-primary hover:text-white font-black text-xs transition-all shadow-xl">
                  بدء جلسة ذكاء اصطناعي <Activity className="mr-3 h-4 w-4" />
                </Button>
              </Link>
              <h2 className="text-3xl font-black flex items-center gap-5 text-white">العمليات الأخيرة <Activity className="h-6 w-6 text-primary animate-pulse" /></h2>
            </div>
            
            <Card className="glass-cosmic border-none rounded-[4rem] py-32 text-center shadow-2xl">
               <History className="h-20 w-20 text-white/5 mx-auto mb-8" />
               <p className="text-white/20 font-black text-2xl">لا توجد سجلات سيادية حديثة.</p>
               <p className="text-sm text-white/10 font-bold mt-2">ابدأ استشارتك الأولى الآن لتظهر هنا.</p>
            </Card>
          </section>

          <section className="grid md:grid-cols-2 gap-10">
             <SupremePillar 
                href="/consultants" 
                icon={<PhoneCall className="h-8 w-8 text-emerald-400" />} 
                title="حجز مستشار خبير" 
                color="emerald" 
                desc="اتصال فيديو مباشر ومشفر."
             />
             <SupremePillar 
                href="/templates" 
                icon={<BookOpen className="h-8 w-8 text-amber-400" />} 
                title="المكتبة القانونية" 
                color="amber"
                desc="٢٥٠+ نموذج وعقد جاهز."
             />
          </section>

          {/* SaaS Assurance */}
          <div className="p-10 glass-cosmic rounded-[3rem] border-white/5 flex items-center gap-10">
             <div className="h-20 w-20 rounded-[2rem] bg-emerald-500/10 flex items-center justify-center shrink-0 border border-emerald-500/20">
                <ShieldCheck className="h-10 w-10 text-emerald-500" />
             </div>
             <div>
                <h4 className="text-xl font-black text-white mb-2">حماية البيانات السيادية</h4>
                <p className="text-white/30 text-sm font-medium leading-relaxed">كافة عملياتك واستشاراتك داخل المنصة محمية بتشفير 256-bit لضمان أعلى مستويات السرية والخصوصية القانونية.</p>
             </div>
          </div>
        </div>

      </div>
    </div>
  );
}

function SupremePillar({ href, icon, title, color, desc }: any) {
  const colors: any = {
    emerald: "border-emerald-500/20 hover:border-emerald-500/40 bg-emerald-500/5",
    amber: "border-amber-500/20 hover:border-amber-500/40 bg-amber-500/5",
    blue: "border-blue-500/20 hover:border-blue-500/40 bg-blue-500/5",
  };

  return (
    <Link href={href}>
      <motion.div 
        whileHover={{ y: -10 }}
        className={`p-12 glass-cosmic rounded-[3.5rem] border-white/5 ${colors[color]} transition-all group shadow-2xl relative overflow-hidden`}
      >
         <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-white/10 to-transparent" />
         <div className={`h-16 w-16 rounded-2xl bg-white/5 flex items-center justify-center mb-8 group-hover:scale-110 transition-transform shadow-xl`}>
            {icon}
         </div>
         <h4 className="text-3xl font-black text-white mb-3">{title}</h4>
         <p className="text-white/30 font-bold text-sm leading-relaxed">{desc}</p>
         <div className="mt-8 flex items-center gap-2 text-primary font-black text-[10px] uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-all">
            فتح البوابة <ArrowUpRight className="h-3 w-3" />
         </div>
      </motion.div>
    </Link>
  );
}