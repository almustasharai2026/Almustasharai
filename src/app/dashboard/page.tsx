
"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  Calendar, 
  Clock, 
  Video, 
  User, 
  Settings, 
  LogOut,
  History,
  Wallet,
  Upload,
  ShieldAlert,
  Zap,
  Activity
} from "lucide-react";
import Link from "next/link";
import { useUser, useAuth } from "@/firebase";
import { signOut } from "firebase/auth";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";

export default function PersonalLegalCommandCenter() {
  const { user, isUserLoading } = useUser();
  const auth = useAuth();
  const router = useRouter();
  const { toast } = useToast();
  const [chargeAmount, setChargeAmount] = useState("");

  const handleLogout = async () => {
    if (auth) {
      await signOut(auth);
      router.push("/auth/login");
    }
  };

  const handleChargeRequest = () => {
    if (!chargeAmount) {
      toast({ variant: "destructive", title: "خطأ", description: "يرجى إدخال المبلغ أولاً" });
      return;
    }
    toast({
      title: "تم إرسال الطلب",
      description: "جاري مراجعة إيصال التحويل من قبل الإدارة.",
    });
    setChargeAmount("");
  };

  if (isUserLoading) return <div className="container py-20 text-center font-black text-2xl animate-pulse text-accent">جاري الاتصال بالقاعدة المركزية...</div>;
  if (!user) return <div className="container py-20 text-center">يرجى تسجيل الدخول للوصول إلى مركز القيادة.</div>;

  const isAdmin = user.email === "bishoysamy390@gmail.com";

  return (
    <div className="container mx-auto px-4 py-12 max-w-7xl text-right" dir="rtl">
      {/* Admin Quick Entry */}
      {isAdmin && (
        <div className="mb-10 p-8 glass-cosmic rounded-[3rem] border-2 border-accent/40 flex flex-col md:flex-row items-center justify-between animate-in zoom-in duration-700 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-40 h-40 bg-accent/20 blur-[80px] rounded-full" />
          <div className="flex items-center gap-6 relative z-10">
             <ShieldAlert className="h-14 w-14 text-accent animate-pulse" />
             <div className="text-right">
                <h2 className="font-black text-accent text-3xl">صلاحيات المالك مفعلة</h2>
                <p className="text-sm opacity-70 text-white/80">لديك السيطرة الكاملة على نظام المستشار ٤</p>
             </div>
          </div>
          <Link href="/admin" className="relative z-10 mt-6 md:mt-0">
            <Button size="lg" className="cosmic-gradient rounded-2xl font-black h-16 px-12 text-xl shadow-[0_0_30px_rgba(255,107,0,0.5)] hover:scale-105 transition-transform">
               دخول غرفة العمليات العليا
            </Button>
          </Link>
        </div>
      )}

      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-8 mb-16">
        <div className="space-y-4">
          <h1 className="text-6xl font-black text-white tracking-tighter">مركز القيادة <span className="text-accent">الشخصي</span></h1>
          <div className="flex items-center gap-4 justify-end bg-white/5 p-3 px-6 rounded-2xl border border-white/10">
            <p className="text-2xl font-medium text-white/80">رصيد الوعي: <span className="text-accent font-black">1,250 EGP</span></p>
            <Zap className="h-6 w-6 text-accent animate-pulse" />
          </div>
        </div>
        <div className="flex gap-4">
          <Button variant="outline" className="rounded-2xl h-14 px-8 border-2 border-white/10 glass-cosmic font-bold gap-2 text-white hover:bg-white/10">
            <Settings className="h-5 w-5" /> الإعدادات
          </Button>
          <Button variant="destructive" className="rounded-2xl h-14 px-8 font-bold gap-2 shadow-2xl" onClick={handleLogout}>
            <LogOut className="h-5 w-5" /> خروج آمن
          </Button>
        </div>
      </div>

      <div className="grid lg:grid-cols-12 gap-10">
        {/* Profile and Charging Section */}
        <div className="lg:col-span-4 space-y-10">
          <Card className="glass-cosmic border-none rounded-[3.5rem] overflow-hidden shadow-2xl">
            <CardContent className="pt-12 text-center space-y-8">
              <div className="relative inline-block group">
                <div className="absolute -inset-6 bg-accent/30 rounded-full blur-2xl group-hover:bg-accent/50 transition-all duration-700" />
                <div className="h-40 w-40 cosmic-gradient rounded-full flex items-center justify-center border-8 border-white/10 relative shadow-2xl">
                  <User className="h-20 w-20 text-white" />
                </div>
              </div>
              <div className="space-y-2">
                <h3 className="text-3xl font-black text-white">{user.displayName || "مستكشف المستشار"}</h3>
                <p className="text-lg opacity-60 font-medium text-white/70">{user.email}</p>
                <Badge className="bg-accent/20 text-accent border-accent/40 mt-2 px-4 py-1 rounded-full">عضو بلاتيني</Badge>
              </div>
              <Button className="w-full h-14 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 text-white font-black text-lg transition-all">
                تعديل الملف الكوني
              </Button>
            </CardContent>
          </Card>

          <Card className="glass-cosmic border-none rounded-[3.5rem] p-4 shadow-2xl relative overflow-hidden">
            <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-accent/10 blur-[50px] rounded-full" />
            <CardHeader className="text-center pt-8">
              <CardTitle className="text-3xl font-black flex items-center gap-4 justify-center text-white">
                شحن الرصيد
                <Wallet className="h-8 w-8 text-accent" />
              </CardTitle>
              <CardDescription className="text-lg text-white/50">قم بشحن محفظتك القانونية فوراً</CardDescription>
            </CardHeader>
            <CardContent className="space-y-8 p-8">
              <div className="space-y-4">
                <div className="bg-accent/10 p-4 rounded-2xl border border-accent/20 text-center">
                  <Label className="font-black text-accent text-lg block mb-2">رقم محفظة المركز</Label>
                  <p className="text-3xl font-black text-white tracking-widest">01130031531</p>
                </div>
                <div className="space-y-2">
                   <Label className="font-bold text-white/80 pr-2">المبلغ المراد إيداعه (EGP)</Label>
                   <Input 
                    placeholder="أدخل القيمة.." 
                    type="number" 
                    value={chargeAmount}
                    onChange={(e) => setChargeAmount(e.target.value)}
                    className="h-16 rounded-2xl glass-cosmic border-white/10 text-2xl text-white text-center focus:ring-accent" 
                   />
                </div>
              </div>
              <div className="border-4 border-dashed border-white/5 rounded-[2.5rem] p-10 text-center cursor-pointer hover:bg-white/5 transition-all group relative overflow-hidden">
                <Upload className="h-12 w-12 mx-auto mb-4 text-white/40 group-hover:text-accent group-hover:scale-110 transition-all" />
                <p className="text-lg font-black text-white/60 group-hover:text-white transition-colors">أرفق إيصال العملية هنا</p>
                <p className="text-xs opacity-40 mt-2">يدعم الصور (JPG, PNG)</p>
              </div>
              <Button 
                onClick={handleChargeRequest}
                className="w-full h-16 rounded-2xl cosmic-gradient font-black text-xl shadow-[0_10px_40px_rgba(255,107,0,0.3)] hover:translate-y-[-4px] transition-all"
              >
                إرسال طلب التحقق
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Activity and Sessions Section */}
        <div className="lg:col-span-8 space-y-12">
          <section className="space-y-8">
            <div className="flex items-center justify-between">
              <Link href="/consultants">
                <Button variant="link" className="text-accent font-black text-xl hover:no-underline hover:text-white transition-colors">ابدأ مهمة جديدة +</Button>
              </Link>
              <h2 className="text-4xl font-black text-white flex items-center gap-6">
                <Activity className="h-10 w-10 text-accent animate-pulse" /> الجلسات القادمة
              </h2>
            </div>
            
            <Card className="glass-cosmic border-none rounded-[4rem] hover:shadow-[0_20px_60px_rgba(0,0,0,0.4)] transition-all group border border-white/5">
              <CardContent className="p-10 flex flex-col sm:flex-row items-center justify-between gap-10">
                <div className="flex items-center gap-8">
                  <Button size="lg" className="rounded-[2rem] px-12 h-16 cosmic-gradient font-black text-xl shadow-2xl hover:scale-105 transition-all">اتصال فوري</Button>
                  <div className="flex flex-col gap-2">
                    <Badge className="bg-green-500/20 text-green-400 border-green-500/30 p-2 px-6 rounded-full font-black text-sm">جلسة مؤكدة</Badge>
                    <span className="text-xs text-white/40 font-bold mr-2">معرف الجلسة: #77291</span>
                  </div>
                </div>
                <div className="text-right flex items-center gap-8">
                  <div className="space-y-2">
                    <h4 className="text-3xl font-black text-white">د. سارة الفهد</h4>
                    <div className="flex items-center gap-6 text-lg font-bold text-white/50 justify-end mt-1">
                      <span className="flex items-center gap-2">10:00 AM <Clock className="h-5 w-5 text-accent" /></span>
                      <span className="flex items-center gap-2">اليوم <Calendar className="h-5 w-5 text-accent" /></span>
                    </div>
                  </div>
                  <div className="h-24 w-24 glass-cosmic rounded-3xl flex items-center justify-center group-hover:rotate-12 transition-transform shadow-2xl border border-white/10 bg-white/5">
                    <Video className="h-12 w-12 text-accent" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </section>

          <section className="space-y-8">
            <h2 className="text-4xl font-black text-white flex items-center gap-6 justify-end">
              أرشيف المهام السابقة
              <History className="h-10 w-10 text-accent" />
            </h2>
            <Card className="glass-cosmic border-none rounded-[4rem] p-24 text-center relative overflow-hidden">
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-[0.03]">
                 <History className="h-64 w-64" />
              </div>
              <p className="text-2xl font-black text-white/20 relative z-10">لا توجد سجلات مؤرشفة في الذاكرة الحالية.</p>
              <Button variant="ghost" className="mt-6 text-accent font-bold hover:bg-accent/10 rounded-xl relative z-10">تحديث السجلات</Button>
            </Card>
          </section>
        </div>
      </div>
    </div>
  );
}
