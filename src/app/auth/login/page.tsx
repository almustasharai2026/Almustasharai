
"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Scale, Lock, Loader2, Home, UserCircle, ShieldCheck, AlertCircle } from "lucide-react";
import { useState, useEffect } from "react";
import { useAuth, useUser, useFirestore } from "@/firebase";
import { signInWithEmailAndPassword, createUserWithEmailAndPassword, updateProfile } from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";
import { useToast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";
import { SOVEREIGN_ADMIN_EMAIL } from "@/lib/roles";
import SovereignButton from "@/components/SovereignButton";

export default function LoginPage() {
  const [identifier, setIdentifier] = useState("king2026");
  const [password, setPassword] = useState("king2026");
  const [isLoading, setIsLoading] = useState(false);
  const [lockoutTime, setLockoutTime] = useState(0);
  
  const auth = useAuth();
  const db = useFirestore();
  const { user, isUserLoading } = useUser();
  const { toast } = useToast();
  const router = useRouter();

  // محاكاة عداد فك الحظر في حال وجود خطأ too-many-requests
  useEffect(() => {
    if (lockoutTime > 0) {
      const timer = setTimeout(() => setLockoutTime(prev => prev - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [lockoutTime]);

  useEffect(() => {
    if (!isUserLoading && user) {
      router.replace("/bot");
    }
  }, [user, isUserLoading, router]);

  const handleLogin = async () => {
    if (!auth || !db) return;
    setIsLoading(true);
    
    // بروتوكول تحويل الهوية السيادية king2026
    let loginEmail = identifier.trim();
    if (loginEmail.toLowerCase() === "king2026") {
      loginEmail = SOVEREIGN_ADMIN_EMAIL;
    }

    try {
      // 1. محاولة الدخول السيادي
      await signInWithEmailAndPassword(auth, loginEmail, password);
      toast({ title: "مرحباً سيادة المالك", description: "تم تفعيل بروتوكول الوصول king2026." });
      router.push("/bot");
    } catch (error: any) {
      console.error("Login Protocol Check:", error.code);
      
      if (error.code === 'auth/too-many-requests') {
        setLockoutTime(60);
        toast({ 
          variant: "destructive", 
          title: "حماية السيادة نشطة", 
          description: "تم رصد محاولات دخول مكثفة. يرجى الانتظار دقيقة واحدة لتأمين الحدود الرقمية." 
        });
        setIsLoading(false);
        return;
      }

      // 2. بروتوكول التصحيح الذكي للمالك (Sovereign Auto-Repair)
      if (identifier.toLowerCase() === "king2026" && password === "king2026") {
        try {
          // محاولة إنشاء الحساب إذا كان غير موجود أو يحتاج لمزامنة
          const userCredential = await createUserWithEmailAndPassword(auth, loginEmail, password);
          const newUser = userCredential.user;
          await updateProfile(newUser, { displayName: "king2026" });
          await setDoc(doc(db, "users", newUser.uid), {
            id: newUser.uid,
            email: loginEmail,
            fullName: "king2026",
            balance: 999999,
            role: "admin",
            createdAt: new Date().toISOString(),
            isBanned: false
          });
          toast({ title: "تم التأسيس السيادي بنجاح ✅" });
          router.push("/bot");
        } catch (signupError: any) {
          if (signupError.code === 'auth/email-already-in-use') {
            toast({ 
              variant: "destructive", 
              title: "تنبيه السيادة", 
              description: "الهوية موجودة ولكن المفتاح السري غير متطابق. يرجى استخدام المفتاح الصحيح المعتمد." 
            });
          } else {
            toast({ variant: "destructive", title: "فشل الوصول السيادي" });
          }
        }
      } else {
        toast({ variant: "destructive", title: "خطأ في الهوية", description: "بيانات الاعتماد غير صالحة." });
      }
    } finally {
      setIsLoading(false);
    }
  };

  if (isUserLoading) return (
    <div className="h-screen flex items-center justify-center bg-[#020617]">
      <Loader2 className="h-12 w-12 animate-spin text-primary opacity-20" />
    </div>
  );

  return (
    <div className="container flex items-center justify-center min-h-screen py-12 px-4 bg-slate-50 dark:bg-[#020617]">
      <Card className="w-full max-w-md glass-cosmic border-none rounded-[3rem] shadow-3xl relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-primary to-transparent" />
        <CardHeader className="space-y-4 text-center pt-12 pb-8">
          <div className="flex justify-center mb-2">
            <div className="h-16 w-16 bg-primary/10 rounded-2xl flex items-center justify-center border border-primary/20 shadow-inner">
              <Scale className="h-8 w-8 text-primary" />
            </div>
          </div>
          <div>
            <CardTitle className="text-3xl font-black text-white">الدخول السيادي</CardTitle>
            <CardDescription className="text-white/30 font-bold uppercase tracking-widest text-[10px] mt-2">Supreme Command - king2026 Edition</CardDescription>
          </div>
        </CardHeader>
        <CardContent className="space-y-6 text-right px-8">
          {lockoutTime > 0 && (
            <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-2xl flex items-center gap-4 text-red-500">
              <AlertCircle className="h-5 w-5 shrink-0" />
              <p className="text-xs font-bold">محرك الحماية نشط. يرجى الانتظار {lockoutTime} ثانية قبل المحاولة التالية.</p>
            </div>
          )}
          <div className="space-y-2">
            <Label className="text-white/40 text-xs px-2 font-bold uppercase tracking-widest">الهوية الملكية</Label>
            <div className="relative">
              <UserCircle className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-white/20" />
              <Input 
                placeholder="king2026" 
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                className="glass border-white/[0.05] h-14 rounded-2xl text-lg text-right font-bold pr-4"
                disabled={lockoutTime > 0}
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label className="text-white/40 text-xs font-bold uppercase tracking-widest px-2">المفتاح السري</Label>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-white/20" />
              <Input 
                type="password" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="glass border-white/[0.05] h-14 rounded-2xl text-lg text-right pr-4"
                disabled={lockoutTime > 0}
              />
            </div>
          </div>
          <SovereignButton 
            text={isLoading ? "جاري التحقق..." : lockoutTime > 0 ? `انتظر ${lockoutTime}ث` : "فتح بوابة القيادة"}
            onClick={handleLogin}
            disabled={isLoading || lockoutTime > 0}
            className="mt-2"
            icon={isLoading ? <Loader2 className="animate-spin" /> : <ShieldCheck className="h-5 w-5" />}
          />
        </CardContent>
        <CardFooter className="flex flex-col space-y-4 border-t border-white/5 pt-8 pb-10">
          <Link href="/" className="flex items-center gap-2 text-xs text-white/30 hover:text-white transition-all font-bold">
            <Home className="h-4 w-4" /> العودة للرئيسية
          </Link>
        </CardFooter>
      </Card>
    </div>
  );
}
