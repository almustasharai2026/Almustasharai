
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
  CreditCard,
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

export default function personalLegalCommandCenter() {
  const { user, isUserLoading } = useUser();
  const auth = useAuth();
  const router = useRouter();
  const { toast } = useToast();
  const [isCharging, setIsCharging] = useState(false);

  const handleLogout = async () => {
    if (auth) {
      await signOut(auth);
      router.push("/auth/login");
    }
  };

  if (isUserLoading) return <div className="container py-20 text-center font-black text-2xl animate-pulse">جاري الاتصال بالقاعدة المركزية...</div>;
  if (!user) return <div className="container py-20 text-center">يرجى تسجيل الدخول للوصول إلى مركز القيادة.</div>;

  const isAdmin = user.email === "bishoysamy390@gmail.com";

  return (
    <div className="container mx-auto px-4 py-12 max-w-7xl text-right" dir="rtl">
      {/* Admin Quick Entry */}
      {isAdmin && (
        <div className="mb-10 p-6 glass-cosmic rounded-[2.5rem] border-2 border-accent flex items-center justify-between animate-in zoom-in duration-500">
          <Link href="/admin">
            <Button size="lg" className="cosmic-gradient rounded-2xl font-black shadow-xl">دخول غرفة العمليات</Button>
          </Link>
          <div className="flex items-center gap-4">
            <div className="text-right">
              <p className="font-black text-accent text-xl">صلاحيات المالك مفعلة</p>
              <p className="text-xs opacity-60">كامل السيطرة على نظام المستشار</p>
            </div>
            <ShieldAlert className="h-10 w-10 text-accent animate-pulse" />
          </div>
        </div>
      )}

      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-8 mb-12">
        <div className="space-y-2">
          <h1 className="text-5xl font-black text-primary">مركز القيادة الشخصي</h1>
          <div className="flex items-center gap-4 justify-end">
            <p className="text-xl text-muted-foreground">رصيد الوعي: <span className="text-accent font-black">1,250 EGP</span></p>
            <Zap className="h-5 w-5 text-accent animate-pulse" />
          </div>
        </div>
        <div className="flex gap-4">
          <Button variant="outline" className="rounded-2xl h-14 px-8 border-2 font-bold gap-2">
            <Settings className="h-5 w-5" /> الإعدادات
          </Button>
          <Button variant="destructive" className="rounded-2xl h-14 px-8 font-bold gap-2" onClick={handleLogout}>
            <LogOut className="h-5 w-5" /> خروج
          </Button>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-10">
        <div className="space-y-8">
          <Card className="glass-cosmic border-none rounded-[3rem] overflow-hidden">
            <CardContent className="pt-10 text-center space-y-6">
              <div className="relative inline-block group">
                <div className="absolute -inset-4 bg-primary/20 rounded-full blur-xl group-hover:bg-accent/20 transition-all" />
                <div className="h-32 w-32 cosmic-gradient rounded-full flex items-center justify-center border-4 border-white/20 relative shadow-2xl">
                  <User className="h-16 w-16 text-white" />
                </div>
              </div>
              <div>
                <h3 className="text-2xl font-black">{user.displayName || "مستكشف المستشار"}</h3>
                <p className="text-sm opacity-60">{user.email}</p>
              </div>
              <Button className="w-full h-12 rounded-2xl bg-white/10 hover:bg-white/20 border-white/20 text-primary font-bold">تعديل الملف الكوني</Button>
            </CardContent>
          </Card>

          <Card className="glass-cosmic border-none rounded-[3rem] p-4">
            <CardHeader className="text-center">
              <CardTitle className="text-2xl flex items-center gap-3 justify-center">
                شحن الرصيد
                <Wallet className="h-6 w-6 text-accent" />
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-3">
                <Label className="font-bold">رقم محفظة المركز (01026427301)</Label>
                <Input placeholder="المبلغ المراد إيداعه" type="number" className="h-14 rounded-2xl glass-cosmic border-none" />
              </div>
              <div className="border-2 border-dashed border-white/20 rounded-[2rem] p-8 text-center cursor-pointer hover:bg-white/5 transition-all group">
                <Upload className="h-10 w-10 mx-auto mb-3 text-muted-foreground group-hover:text-accent transition-all" />
                <p className="text-sm font-bold opacity-60">أرفق إيصال العملية هنا</p>
              </div>
              <Button className="w-full h-14 rounded-2xl cosmic-gradient font-black text-lg shadow-xl">إرسال طلب الشحن</Button>
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-2 space-y-10">
          <section className="space-y-6">
            <div className="flex items-center justify-between">
              <Link href="/consultants">
                <Button variant="link" className="text-accent font-black text-lg">بدء مهمة جديدة</Button>
              </Link>
              <h2 className="text-3xl font-black text-primary flex items-center gap-4">
                <Activity className="h-8 w-8 text-accent animate-pulse" /> الجلسات القادمة
              </h2>
            </div>
            
            <Card className="glass-cosmic border-none rounded-[3rem] hover:shadow-2xl transition-all group">
              <CardContent className="p-8 flex flex-col sm:flex-row items-center justify-between gap-8">
                <div className="flex items-center gap-6">
                  <Button size="lg" className="rounded-2xl px-10 cosmic-gradient font-black shadow-xl">اتصال فوري</Button>
                  <Badge className="bg-green-500/20 text-green-500 border-green-500/40 p-2 px-4 rounded-xl font-bold">جلسة مؤكدة</Badge>
                </div>
                <div className="text-right flex items-center gap-6">
                  <div>
                    <h4 className="text-2xl font-black text-primary">د. سارة الفهد</h4>
                    <div className="flex items-center gap-4 text-sm font-bold opacity-60 justify-end mt-1">
                      <span className="flex items-center gap-2">10:00 AM <Clock className="h-4 w-4" /></span>
                      <span className="flex items-center gap-2">اليوم <Calendar className="h-4 w-4" /></span>
                    </div>
                  </div>
                  <div className="h-20 w-20 glass-cosmic rounded-full flex items-center justify-center group-hover:rotate-12 transition-transform shadow-xl">
                    <Video className="h-10 w-10 text-primary" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </section>

          <section className="space-y-6">
            <h2 className="text-3xl font-black text-primary flex items-center gap-4 justify-end">
              أرشيف المهام السابقة
              <History className="h-8 w-8 text-accent" />
            </h2>
            <Card className="glass-cosmic border-none rounded-[3rem] p-16 text-center">
              <History className="h-16 w-16 mx-auto mb-6 opacity-10" />
              <p className="text-xl font-bold opacity-30">لا توجد سجلات مؤرشفة حتى الآن.</p>
            </Card>
          </section>
        </div>
      </div>
    </div>
  );
}
