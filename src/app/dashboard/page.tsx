
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
  Zap,
  Activity,
  History,
  Gift,
  ArrowUpRight,
  Sparkles
} from "lucide-react";
import Link from "next/link";
import { useUser, useAuth, useDoc, useFirestore } from "@/firebase";
import { signOut } from "firebase/auth";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { doc } from "firebase/firestore";
import { useMemoFirebase } from "@/firebase/provider";

export default function Dashboard() {
  const { user, isUserLoading } = useUser();
  const db = useFirestore();
  const auth = useAuth();
  const router = useRouter();
  const { toast } = useToast();
  const [chargeAmount, setChargeAmount] = useState("");

  // Get user profile data for balance
  const userDocRef = useMemoFirebase(() => user ? doc(db!, "users", user.uid) : null, [db, user]);
  const { data: profile } = useDoc(userDocRef);

  const handleLogout = async () => {
    if (auth) {
      await signOut(auth);
      router.push("/auth/login");
    }
  };

  const handleChargeRequest = () => {
    if (!chargeAmount) return;
    toast({
      title: "تم استلام الطلب",
      description: "سيتم مراجعة إيصال التحويل وتحديث رصيدك خلال دقائق.",
    });
    setChargeAmount("");
  };

  if (isUserLoading) return (
    <div className="container py-32 text-center">
      <div className="inline-flex h-20 w-20 animate-spin rounded-full border-4 border-primary border-t-transparent mb-4" />
      <p className="text-xl font-bold opacity-50 animate-pulse">جاري الاتصال بقاعدة البيانات القانونية...</p>
    </div>
  );

  if (!user) return (
    <div className="container py-32 text-center space-y-6">
      <ShieldAlert className="h-20 w-20 mx-auto text-red-500 opacity-20" />
      <h2 className="text-3xl font-black">الدخول مرفوض</h2>
      <p className="text-muted-foreground">يرجى تسجيل الدخول للوصول إلى مركز القيادة الخاص بك.</p>
      <Link href="/auth/login"><Button className="btn-primary rounded-xl px-12">تسجيل الدخول</Button></Link>
    </div>
  );

  const isAdmin = user.email === "bishoysamy390@gmail.com";

  return (
    <div className="container mx-auto px-4 py-12 max-w-7xl" dir="rtl">
      {/* Admin Alert */}
      {isAdmin && (
        <div className="mb-12 p-8 glass-cosmic rounded-[2.5rem] border-primary/30 flex flex-col md:flex-row items-center justify-between gap-8 animate-in zoom-in duration-700">
          <div className="flex items-center gap-6">
             <div className="h-20 w-20 bg-primary/20 rounded-3xl flex items-center justify-center shadow-2xl">
               <ShieldAlert className="h-10 w-10 text-primary" />
             </div>
             <div className="text-right">
                <h2 className="font-black text-primary text-3xl mb-1">صلاحيات المالك مفعلة</h2>
                <p className="text-lg opacity-70">أهلاً بك يا بيشوي. مركز السيطرة الكامل متاح الآن.</p>
             </div>
          </div>
          <Link href="/admin">
            <Button size="lg" className="cosmic-gradient rounded-2xl font-black px-12 h-16 text-lg shadow-2xl">
               دخول غرفة العمليات
            </Button>
          </Link>
        </div>
      )}

      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-8 mb-16 relative overflow-hidden">
        <div className="text-right space-y-3 relative z-10">
          <h1 className="text-5xl font-black text-white leading-tight">مركز القيادة <span className="text-gradient">الشخصي</span></h1>
          <div className="flex items-center gap-3 justify-end">
            <Badge className="bg-emerald-500/20 text-emerald-400 border-none px-4 py-1.5 rounded-full text-xs font-bold flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
              مستكشف نشط
            </Badge>
          </div>
        </div>
        <div className="flex gap-4">
          <Button variant="outline" className="glass rounded-2xl gap-3 h-16 px-8 border-white/10 hover:bg-white/5">
            <Settings className="h-5 w-5" /> الإعدادات
          </Button>
          <Button variant="destructive" className="rounded-2xl gap-3 h-16 px-8 bg-red-600/10 text-red-500 hover:bg-red-600 hover:text-white transition-all border-none" onClick={handleLogout}>
            <LogOut className="h-5 w-5" /> خروج
          </Button>
        </div>
      </div>

      <div className="grid lg:grid-cols-12 gap-10">
        {/* Left Column: User Profile & Wallet */}
        <div className="lg:col-span-4 space-y-10">
          <Card className="glass-cosmic border-none rounded-[3rem] overflow-hidden relative group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 blur-[60px] group-hover:bg-primary/20 transition-all" />
            <CardContent className="pt-12 text-center space-y-8">
              <div className="h-32 w-32 bg-primary/20 rounded-full mx-auto flex items-center justify-center border-4 border-white/5 shadow-2xl relative">
                <User className="h-16 w-16 text-primary" />
                <div className="absolute bottom-1 right-1 h-8 w-8 bg-emerald-500 rounded-full border-4 border-slate-900 flex items-center justify-center">
                  <Sparkles className="h-4 w-4 text-white" />
                </div>
              </div>
              <div className="space-y-1">
                <h3 className="text-3xl font-black text-white">{profile?.fullName || user.displayName || "مستشار المستقبل"}</h3>
                <p className="text-muted-foreground text-sm tracking-wider opacity-60">{user.email}</p>
              </div>
              
              <div className="bg-white/5 p-6 rounded-3xl border border-white/5">
                 <p className="text-xs text-muted-foreground font-black uppercase tracking-widest mb-2">الرصيد الكوني المتاح</p>
                 <p className="text-5xl font-black text-white flex items-center justify-center gap-2">
                   {profile?.balance || 0}
                   <span className="text-sm text-primary font-bold">EGP</span>
                 </p>
              </div>
              
              {profile?.balance === 50 && (
                <div className="flex items-center gap-2 justify-center text-emerald-400 text-xs font-bold animate-pulse">
                   <Gift className="h-4 w-4" /> رصيد ترحيبي مجاني نشط
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="glass-card border-none rounded-[3rem] p-10 space-y-8 relative overflow-hidden">
            <div className="flex items-center justify-between">
              <Wallet className="h-8 w-8 text-primary" />
              <h3 className="font-black text-2xl">تمويل المحفظة</h3>
            </div>
            <div className="space-y-6">
              <div className="glass p-5 rounded-2xl text-center border-primary/20 bg-primary/5">
                <Label className="text-[10px] text-primary font-black block mb-2 uppercase tracking-tighter">رقم التحويل (فودافون كاش)</Label>
                <p className="text-2xl font-black text-white tracking-[0.2em]">01130031531</p>
              </div>
              <div className="space-y-3">
                <Label className="text-sm font-bold opacity-60">المبلغ المراد شحنه (EGP)</Label>
                <Input 
                  type="number" 
                  placeholder="مثال: 500" 
                  value={chargeAmount}
                  onChange={(e) => setChargeAmount(e.target.value)}
                  className="glass border-white/5 h-14 rounded-2xl text-xl text-center font-black focus:ring-primary/40"
                />
              </div>
              <div className="border-2 border-dashed border-white/10 rounded-2xl p-8 text-center hover:bg-white/5 hover:border-primary/40 transition-all cursor-pointer group">
                <Upload className="h-10 w-10 mx-auto mb-3 opacity-30 group-hover:text-primary group-hover:opacity-100 transition-all" />
                <p className="text-xs font-bold opacity-40">ارفق صورة الإيصال للتحقق</p>
              </div>
              <Button onClick={handleChargeRequest} className="w-full btn-primary h-16 rounded-2xl text-xl font-black shadow-2xl shadow-primary/20">شحن الرصيد الآن</Button>
            </div>
          </Card>
        </div>

        {/* Right Column: Sessions & Archives */}
        <div className="lg:col-span-8 space-y-10">
          <section className="space-y-8">
            <div className="flex items-center justify-between">
              <Link href="/consultants" className="text-primary font-black hover:underline flex items-center gap-2 group">
                 <ArrowUpRight className="h-5 w-5 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                 حجز استشارة ذكية جديدة
              </Link>
              <h2 className="text-3xl font-black flex items-center gap-4">
                 الجلسات القادمة <Activity className="h-7 w-7 text-primary animate-pulse" />
              </h2>
            </div>
            
            <Card className="glass-cosmic border-none rounded-[3rem] p-10 hover:shadow-[0_0_60px_rgba(59,130,246,0.15)] transition-all relative group">
              <div className="flex flex-col md:flex-row items-center justify-between gap-10">
                <div className="flex items-center gap-6 text-right">
                  <div className="h-24 w-24 glass rounded-3xl flex items-center justify-center border-white/10 relative group-hover:scale-110 transition-transform">
                    <Video className="h-10 w-10 text-primary" />
                    <div className="absolute top-0 right-0 h-4 w-4 bg-emerald-500 rounded-full border-2 border-slate-900" />
                  </div>
                  <div className="space-y-2">
                    <h4 className="text-3xl font-black text-white">د. سارة الفهد</h4>
                    <p className="text-primary font-bold">خبير قانون الشركات</p>
                    <div className="flex items-center gap-6 text-xs text-muted-foreground mt-3 bg-white/5 p-3 rounded-xl w-fit">
                      <span className="flex items-center gap-2"><Calendar className="h-4 w-4 text-primary" /> اليوم</span>
                      <div className="h-4 w-px bg-white/10" />
                      <span className="flex items-center gap-2"><Clock className="h-4 w-4 text-primary" /> 10:00 مساءً</span>
                    </div>
                  </div>
                </div>
                <Link href="/consultants/1/call" className="w-full md:w-auto">
                  <Button className="cosmic-gradient rounded-2xl px-12 h-16 text-xl font-black w-full shadow-2xl hover:scale-105 transition-all">دخول الجلسة الآن</Button>
                </Link>
              </div>
            </Card>
          </section>

          <section className="space-y-8">
            <h2 className="text-3xl font-black flex items-center gap-4 justify-end">
               الأرشيف الكوني <History className="h-7 w-7 text-primary opacity-40" />
            </h2>
            <Card className="glass border-none rounded-[3.5rem] p-24 text-center text-muted-foreground bg-white/5">
               <div className="h-24 w-24 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-8">
                  <History className="h-12 w-12 opacity-20" />
               </div>
               <p className="text-2xl font-black opacity-30">السجل القانوني فارغ حالياً</p>
               <p className="text-sm opacity-20 mt-2">استشاراتك المسجلة ستظهر هنا لاحقاً</p>
            </Card>
          </section>
        </div>
      </div>
    </div>
  );
}
