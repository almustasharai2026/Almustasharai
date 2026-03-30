"use client";

import { useUser, useFirestore, useDoc } from "@/firebase";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  Wallet, Activity, History, ArrowUpRight, 
  ShieldCheck, User, LogOut, Settings, CreditCard,
  BookOpen, PhoneCall, Loader2, Zap, Star
} from "lucide-react";
import Link from "next/link";
import { doc, addDoc, collection } from "firebase/firestore";
import { useState } from "react";
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
      
      toast({ title: "تم تسجيل طلبك", description: "سيتم تحديث رصيدك فور مراجعة التحويل." });
      setChargeAmount("");
    } catch (e) {
      toast({ variant: "destructive", title: "خطأ", description: "فشل إرسال الطلب." });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) return <div className="h-screen flex items-center justify-center"><Loader2 className="animate-spin h-12 w-12 text-primary" /></div>;

  return (
    <div className="container mx-auto px-8 py-20 max-w-7xl text-right" dir="rtl">
      
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-12 mb-24">
        <div className="space-y-4">
          <h1 className="text-6xl font-black text-white tracking-tighter leading-none">
            أهلاً، <span className="text-gradient">{profile?.fullName?.split(' ')[0] || "مستشارنا"}</span>
          </h1>
          <p className="text-2xl text-white/30 font-bold max-w-xl">مركز السيطرة القانوني الخاص بك.</p>
        </div>
        <div className="flex gap-4">
           <Button variant="ghost" className="glass-cosmic h-16 px-10 rounded-[2rem] font-black border-white/5 hover:bg-white/5 gap-3">
             <Settings className="h-5 w-5" /> الإعدادات
           </Button>
           <Button onClick={() => window.location.href = "/auth/login"} variant="destructive" className="h-16 px-10 rounded-[2rem] font-black bg-red-500/10 text-red-500 border-none hover:bg-red-500/20 gap-3">
             <LogOut className="h-5 w-5" /> خروج
           </Button>
        </div>
      </div>

      <div className="grid lg:grid-cols-12 gap-12">
        
        <div className="lg:col-span-4 space-y-12">
          <Card className="glass-cosmic border-none rounded-[4rem] p-12 relative overflow-hidden shadow-2xl">
            <div className="text-center space-y-10">
              <div className="h-44 w-44 glass-cosmic rounded-full mx-auto flex items-center justify-center border-4 border-primary/20 shadow-2xl relative">
                <User className="h-24 w-24 text-white/80" />
                <div className="absolute bottom-3 right-3 h-10 w-10 bg-emerald-500 rounded-full border-[6px] border-slate-950 shadow-lg" />
              </div>
              
              <div className="space-y-6">
                <div className="bg-white/[0.02] p-10 rounded-[3rem] border border-white/5 shadow-inner">
                   <p className="text-[10px] text-white/20 font-black uppercase mb-4 tracking-[0.4em]">الرصيد المتاح</p>
                   <p className="text-7xl font-black text-white tabular-nums tracking-tighter">
                     {profile?.balance || 0} <span className="text-sm text-primary uppercase block mt-2">EGP Available</span>
                   </p>
                </div>
                <Link href="/pricing" className="w-full block">
                  <Button className="w-full btn-primary h-20 rounded-[2.5rem] text-2xl font-black shadow-2xl">شحن رصيد <ArrowUpRight className="mr-3 h-7 w-7" /></Button>
                </Link>
              </div>
            </div>
          </Card>

          <Card className="glass-cosmic border-none rounded-[3.5rem] p-12 space-y-10 shadow-2xl">
            <div className="flex items-center justify-between">
              <CreditCard className="h-10 w-10 text-primary" />
              <h3 className="font-black text-2xl text-white">إيداع مالي</h3>
            </div>
            <div className="p-8 glass-cosmic rounded-3xl text-center bg-primary/5 border-primary/10">
               <p className="text-[10px] text-primary font-black mb-3 tracking-widest">رقم التحويل المعتمد</p>
               <p className="text-3xl font-black text-white tracking-widest">01130031531</p>
               <p className="text-[10px] text-white/20 mt-3 font-bold">Vodafone Cash</p>
            </div>
            <div className="space-y-5">
              <div className="space-y-3">
                <Label className="text-white/20 text-[10px] font-black mr-2 uppercase">المبلغ المحول</Label>
                <Input 
                  type="number" 
                  placeholder="EGP" 
                  value={chargeAmount}
                  onChange={e => setChargeAmount(e.target.value)}
                  className="glass border-white/10 h-16 rounded-2xl text-center text-3xl font-black text-white"
                />
              </div>
              <Button 
                onClick={handleCharge} 
                disabled={isSubmitting || !chargeAmount}
                className="w-full h-16 rounded-2xl font-black bg-white/[0.03] hover:bg-white/[0.08] text-white/60 border border-white/5 transition-all"
              >
                {isSubmitting ? <Loader2 className="animate-spin h-6 w-6" /> : "إبلاغ الإدارة بالتحويل"}
              </Button>
            </div>
          </Card>
        </div>

        <div className="lg:col-span-8 space-y-12">
          
          <section className="space-y-10">
            <div className="flex items-center justify-between">
              <Link href="/bot">
                <Button className="h-14 px-10 rounded-[1.8rem] glass-cosmic border-primary/20 text-primary hover:bg-primary hover:text-white font-black text-sm transition-all">
                  بدء استشارة AI <Zap className="mr-3 h-5 w-5" />
                </Button>
              </Link>
              <h2 className="text-4xl font-black text-white flex items-center gap-6">السجل السيادي <Activity className="h-8 w-8 text-primary animate-pulse" /></h2>
            </div>
            
            <Card className="glass-cosmic border-none rounded-[4rem] py-40 text-center shadow-2xl border-white/5">
               <History className="h-24 w-24 text-white/5 mx-auto mb-10" />
               <p className="text-white/20 font-black text-3xl">لا توجد عمليات نشطة.</p>
               <p className="text-sm text-white/10 font-bold mt-3">ابدأ رحلتك القانونية الآن لتظهر هنا.</p>
            </Card>
          </section>

          <section className="grid md:grid-cols-2 gap-10">
             <ActionCard 
                href="/consultants" 
                icon={<PhoneCall className="h-10 w-10 text-emerald-400" />} 
                title="حجز مستشار" 
                desc="اتصال فيديو مباشر ومشفر."
                color="emerald"
             />
             <ActionCard 
                href="/templates" 
                icon={<BookOpen className="h-10 w-10 text-amber-400" />} 
                title="المكتبة السيادية" 
                desc="٢٥٠+ نموذج وعقد معتمد."
                color="amber"
             />
          </section>

          <div className="p-12 glass-cosmic rounded-[3.5rem] border-white/5 flex items-center gap-12 relative overflow-hidden">
             <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/5 blur-[100px] -z-10" />
             <div className="h-24 w-24 rounded-[2rem] bg-emerald-500/10 flex items-center justify-center shrink-0 border border-emerald-500/20">
                <ShieldCheck className="h-12 w-12 text-emerald-500" />
             </div>
             <div>
                <h4 className="text-2xl font-black text-white mb-3">حماية بياناتك السيادية</h4>
                <p className="text-white/30 text-lg font-medium leading-relaxed">كافة استشاراتك ووثائقك محمية بتشفير عسكري لضمان أقصى درجات السرية القانونية.</p>
             </div>
          </div>
        </div>

      </div>
    </div>
  );
}

function ActionCard({ href, icon, title, desc, color }: any) {
  const colors: any = {
    emerald: "border-emerald-500/20 bg-emerald-500/5",
    amber: "border-amber-500/20 bg-amber-500/5",
  };

  return (
    <Link href={href} className="block group">
      <motion.div 
        whileHover={{ y: -12 }}
        className={`p-14 glass-cosmic rounded-[4rem] border-white/5 ${colors[color]} transition-all shadow-2xl relative overflow-hidden`}
      >
         <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-white/10 to-transparent" />
         <div className="h-20 w-20 rounded-[2rem] bg-white/5 flex items-center justify-center mb-10 group-hover:scale-110 transition-transform shadow-inner">
            {icon}
         </div>
         <h4 className="text-4xl font-black text-white mb-4">{title}</h4>
         <p className="text-white/30 font-bold text-xl leading-relaxed">{desc}</p>
         <div className="mt-10 flex items-center gap-3 text-primary font-black text-[10px] uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-all">
            فتح البوابة <ArrowUpRight className="h-4 w-4" />
         </div>
      </motion.div>
    </Link>
  );
}