
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
  Wallet,
  Upload,
  ShieldAlert,
  Activity,
  History,
  Gift,
  ArrowUpRight,
  Sparkles,
  ChevronLeft
} from "lucide-react";
import Link from "next/link";
import { useUser, useAuth, useDoc, useFirestore } from "@/firebase";
import { signOut } from "firebase/auth";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { doc, addDoc, collection } from "firebase/firestore";
import { useMemoFirebase } from "@/firebase/provider";

export default function Dashboard() {
  const { user, isUserLoading } = useUser();
  const db = useFirestore();
  const auth = useAuth();
  const router = useRouter();
  const { toast } = useToast();
  const [chargeAmount, setChargeAmount] = useState("");
  const [isCharging, setIsCharging] = useState(false);

  const userDocRef = useMemoFirebase(() => user ? doc(db!, "users", user.uid) : null, [db, user]);
  const { data: profile } = useDoc(userDocRef);

  const handleLogout = async () => {
    if (auth) {
      await signOut(auth);
      router.push("/auth/login");
    }
  };

  const handleChargeRequest = async () => {
    if (!chargeAmount || !user || !db) {
      toast({ variant: "destructive", title: "بيانات ناقصة", description: "يرجى إدخال المبلغ المراد شحنه أولاً." });
      return;
    }
    
    setIsCharging(true);
    try {
      await addDoc(collection(db, "paymentRequests"), {
        userId: user.uid,
        userName: profile?.fullName || user.email,
        userEmail: user.email,
        amount: Number(chargeAmount),
        status: "pending",
        type: "wallet_transfer",
        createdAt: new Date().toISOString()
      });
      toast({
        title: "تم استلام طلب الشحن",
        description: "سيتم مراجعة التحويل وتحديث رصيدك خلال ١٥ دقيقة كحد أقصى.",
      });
      setChargeAmount("");
    } catch (e) {
      toast({ variant: "destructive", title: "فشل النظام", description: "تعذر إرسال الطلب، يرجى مراجعة الاتصال." });
    } finally {
      setIsCharging(false);
    }
  };

  if (isUserLoading) return (
    <div className="container py-40 text-center">
      <div className="inline-flex h-24 w-24 animate-spin rounded-full border-[6px] border-primary border-t-transparent mb-6 shadow-[0_0_30px_rgba(37,99,235,0.2)]" />
      <p className="text-2xl font-black text-white/40">جاري استدعاء السجلات السيادية...</p>
    </div>
  );

  if (!user) {
    router.push("/auth/login");
    return null;
  }

  const isAdmin = user.email === "bishoysamy390@gmail.com";

  return (
    <div className="container mx-auto px-6 py-16 max-w-7xl" dir="rtl">
      {isAdmin && (
        <div className="mb-16 p-10 glass-cosmic rounded-[3rem] border-primary/20 flex flex-col md:flex-row items-center justify-between gap-10 animate-in zoom-in duration-1000 shadow-[0_0_50px_rgba(37,99,235,0.1)]">
          <div className="flex items-center gap-8">
             <div className="h-24 w-24 bg-primary/20 rounded-[2rem] flex items-center justify-center shadow-2xl border border-primary/30">
               <ShieldAlert className="h-12 w-12 text-primary" />
             </div>
             <div className="text-right">
                <h2 className="font-black text-primary text-4xl mb-2">مركز السيطرة العليا</h2>
                <p className="text-xl text-white/50 font-medium">كامل السلطات مفعلة لك يا سيادة المدير لإدارة الكوكب.</p>
             </div>
          </div>
          <Link href="/admin">
            <Button size="lg" className="cosmic-gradient rounded-[1.8rem] font-black px-14 h-20 text-xl shadow-2xl hover:scale-[1.05] transition-all">
               دخول غرفة العمليات
            </Button>
          </Link>
        </div>
      )}

      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-10 mb-20">
        <div className="text-right space-y-3">
          <h1 className="text-6xl font-black text-white">أهلاً، <span className="text-gradient">{profile?.fullName || "مستشارنا"}</span></h1>
          <p className="text-xl text-white/30 font-medium">أهلاً بك في فضاء العمل القانوني الخاص بك.</p>
        </div>
        <div className="flex gap-5">
          <Button variant="ghost" className="glass rounded-[1.5rem] h-16 px-8 border-white/5 hover:bg-white/5 font-bold" onClick={() => toast({ title: "مركز الإعدادات", description: "سيتم تفعيل ميزات التخصيص قريباً." })}>
            <Settings className="h-6 w-6 ml-3" /> الإعدادات
          </Button>
          <Button variant="destructive" className="rounded-[1.5rem] h-16 px-8 bg-red-600/10 text-red-500 border-none font-bold" onClick={handleLogout}>
            <LogOut className="h-6 w-6 ml-3" /> مغادرة
          </Button>
        </div>
      </div>

      <div className="grid lg:grid-cols-12 gap-12">
        <div className="lg:col-span-4 space-y-12">
          {/* Identity & Balance Orb */}
          <Card className="glass-cosmic border-none rounded-[4rem] p-12 relative overflow-hidden group hover:shadow-primary/10 transition-all duration-700">
            <div className="absolute -top-10 -right-10 w-48 h-48 bg-primary/10 blur-[100px]" />
            <div className="space-y-10 text-center">
              <div className="h-40 w-40 bg-white/5 rounded-full mx-auto flex items-center justify-center border-2 border-white/5 shadow-2xl relative">
                <User className="h-20 w-20 text-white/80" />
                <div className="absolute bottom-2 right-2 h-10 w-10 bg-emerald-500 rounded-full border-[6px] border-slate-950 shadow-lg" />
              </div>
              <div className="bg-white/[0.02] p-10 rounded-[3rem] border border-white/5 shadow-inner">
                 <p className="text-[10px] text-white/30 font-black mb-3 uppercase tracking-[0.3em]">رصيدك الكوني المتاح</p>
                 <p className="text-6xl font-black text-white">
                   {profile?.balance || 0}
                   <span className="text-sm text-primary font-bold mr-3">EGP</span>
                 </p>
                 {profile?.balance === 50 && (
                   <div className="mt-6 flex items-center gap-3 justify-center text-emerald-400 text-xs font-black animate-pulse bg-emerald-500/10 py-2 rounded-full">
                      <Gift className="h-4 w-4" /> رصيد ترحيبي مجاني نشط
                   </div>
                 )}
              </div>
            </div>
          </Card>

          {/* Wallet Charge Station */}
          <Card className="glass-card border-none rounded-[4rem] p-12 space-y-10">
            <div className="flex items-center justify-between">
              <Wallet className="h-10 w-10 text-primary" />
              <h3 className="font-black text-3xl text-white">شحن الرصيد</h3>
            </div>
            <div className="space-y-8">
              <div className="glass p-6 rounded-[2rem] text-center border-primary/20 bg-primary/5 shadow-inner">
                <Label className="text-[10px] text-primary font-black block mb-3 uppercase tracking-widest">رقم التحويل الرسمي</Label>
                <p className="text-3xl font-black text-white tracking-[0.2em] select-all">01130031531</p>
              </div>
              <div className="space-y-3">
                <Label className="text-white/30 text-xs px-2">المبلغ المراد إضافته</Label>
                <Input 
                  type="number" 
                  placeholder="EGP 500" 
                  value={chargeAmount}
                  onChange={(e) => setChargeAmount(e.target.value)}
                  className="glass border-white/5 h-16 rounded-[1.5rem] text-2xl text-center font-black"
                />
              </div>
              <div 
                className="border-2 border-dashed border-white/10 rounded-[2rem] p-8 text-center hover:bg-white/[0.02] transition-all cursor-pointer group"
                onClick={() => toast({ title: "رفع الإثبات", description: "يرجى اختيار صورة إيصال التحويل." })}
              >
                <Upload className="h-10 w-10 mx-auto mb-3 opacity-20 group-hover:opacity-100 transition-all text-primary" />
                <p className="text-xs font-black opacity-30 group-hover:opacity-100">ارفق صورة التحويل للمراجعة</p>
              </div>
              <Button 
                onClick={handleChargeRequest} 
                disabled={isCharging || !chargeAmount}
                className="w-full btn-primary h-20 rounded-[2rem] text-2xl font-black shadow-2xl"
              >
                {isCharging ? "جاري الإرسال..." : "إرسال طلب الشحن"}
              </Button>
            </div>
          </Card>
        </div>

        {/* Sessions & History Feed */}
        <div className="lg:col-span-8 space-y-12">
          <section className="space-y-10">
            <div className="flex items-center justify-between">
              <Link href="/consultants" className="text-primary font-black hover:scale-105 transition-all flex items-center gap-3 bg-primary/10 px-6 py-3 rounded-full">
                 <ArrowUpRight className="h-6 w-6" /> حجز استشارة فيديو جديدة
              </Link>
              <h2 className="text-4xl font-black flex items-center gap-5">الجلسات المجدولة <Activity className="h-8 w-8 text-primary animate-pulse" /></h2>
            </div>
            
            <Card className="glass-cosmic border-none rounded-[4rem] p-12 hover:shadow-primary/5 transition-all duration-700 relative overflow-hidden">
              <div className="flex flex-col md:flex-row items-center justify-between gap-10">
                <div className="text-right flex items-center gap-8">
                  <div className="h-24 w-24 glass rounded-[2.5rem] flex items-center justify-center border border-white/5 shadow-2xl">
                    <Video className="h-10 w-10 text-primary" />
                  </div>
                  <div>
                    <h4 className="text-3xl font-black text-white">د. سارة الفهد</h4>
                    <p className="text-primary font-black text-lg mt-1">قانون الشركات والنزاعات</p>
                    <Badge className="bg-white/5 text-white/40 mt-3 border-none px-4 py-1.5 rounded-full font-bold">اليوم | 10:00 مساءً</Badge>
                  </div>
                </div>
                <Link href="/consultants/1/call">
                  <Button className="cosmic-gradient rounded-[2rem] px-14 h-20 text-2xl font-black shadow-2xl hover:scale-105 transition-all">دخول الجلسة الآن</Button>
                </Link>
              </div>
            </Card>
          </section>

          <section className="space-y-10">
            <div className="flex items-center justify-between">
              <Button variant="link" className="text-white/20 font-bold">عرض الأرشيف الكامل</Button>
              <h2 className="text-4xl font-black flex items-center gap-5">سجل العمليات <History className="h-8 w-8 text-white/20" /></h2>
            </div>
            <Card className="glass border-none rounded-[4rem] py-32 text-center text-white/20 bg-white/[0.01]">
               <History className="h-20 w-20 opacity-10 mx-auto mb-6" />
               <p className="text-2xl font-black">سجلك القانوني نظيف تماماً</p>
               <Button variant="link" className="text-primary mt-6 text-xl font-black" onClick={() => router.push('/bot')}>ابدأ أول محادثة ذكية الآن</Button>
            </Card>
          </section>
        </div>
      </div>
    </div>
  );
}
