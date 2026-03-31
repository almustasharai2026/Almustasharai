
"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Scale, Lock, Loader2, Home, UserCircle, ShieldCheck } from "lucide-react";
import { useState, useEffect } from "react";
import { useAuth, useUser, useFirestore } from "@/firebase";
import { signInWithEmailAndPassword, createUserWithEmailAndPassword, updateProfile } from "firebase/auth";
import { doc, setDoc, getDoc } from "firebase/firestore";
import { useToast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";
import SovereignButton from "@/components/SovereignButton";

/**
 * بوابة الدخول السيادية للمالك king2026.
 * تدعم الدخول والإنشاء التلقائي للهوية الملكية لضمان عدم الانقطاع.
 */
export default function LoginPage() {
  const [identifier, setIdentifier] = useState("king2026");
  const [password, setPassword] = useState("king2026");
  const [isLoading, setIsLoading] = useState(false);
  const auth = useAuth();
  const db = useFirestore();
  const { user, isUserLoading } = useUser();
  const { toast } = useToast();
  const router = useRouter();

  useEffect(() => {
    if (!isUserLoading && user) {
      router.replace("/bot");
    }
  }, [user, isUserLoading, router]);

  const handleLogin = async () => {
    if (!auth || !db) return;
    setIsLoading(true);
    
    // بروتوكول تحويل الهوية السيادية king2026 إلى البريد المعتمد سحابياً
    let loginEmail = identifier.trim();
    if (loginEmail.toLowerCase() === "king2026") {
      loginEmail = "bishoysamy390@gmail.com";
    }

    try {
      // 1. محاولة الدخول المعتادة
      await signInWithEmailAndPassword(auth, loginEmail, password);
      toast({ 
        title: "مرحباً سيادة المالك", 
        description: "تم تفعيل بروتوكول الوصول السيادي king2026 بنجاح." 
      });
      router.push("/bot");
    } catch (error: any) {
      console.error("Login Protocol Check:", error.code);
      
      // 2. إذا كانت البيانات هي بيانات المالك ولم يجد الحساب، نقوم بإنشائه فوراً (Sovereign Force Creation)
      if ((error.code === 'auth/user-not-found' || error.code === 'auth/invalid-credential') && 
          identifier.toLowerCase() === "king2026" && password === "king2026") {
        
        try {
          toast({ title: "تنبيه سيادي", description: "جاري تهيئة الهوية الملكية في السحابة..." });
          const userCredential = await createUserWithEmailAndPassword(auth, loginEmail, password);
          const newUser = userCredential.user;
          
          await updateProfile(newUser, { displayName: "king2026" });
          
          // توثيق الرتبة في Firestore
          await setDoc(doc(db, "users", newUser.uid), {
            id: newUser.uid,
            email: loginEmail,
            fullName: "king2026",
            balance: 999999,
            role: "admin",
            createdAt: new Date().toISOString(),
            isBanned: false
          });

          toast({ title: "تمت السيادة ✅", description: "تم إنشاء وتفعيل حساب المالك بنجاح." });
          router.push("/bot");
          return;
        } catch (signupError: any) {
          toast({ variant: "destructive", title: "فشل التأسيس", description: signupError.message });
        }
      }

      let errorMsg = "يرجى التحقق من المفتاح السيادي الخاص بك.";
      if (error.code === 'auth/wrong-password') errorMsg = "كلمة المرور غير صحيحة.";
      
      toast({ 
        variant: "destructive", 
        title: "فشل الوصول السيادي", 
        description: errorMsg 
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (isUserLoading) return (
    <div className="h-screen flex items-center justify-center bg-[#020617]">
      <div className="flex flex-col items-center gap-4">
        <Loader2 className="h-12 w-12 animate-spin text-primary opacity-20" />
        <div className="animate-pulse text-white font-black tracking-[0.5em] uppercase text-[10px]">Sovereign Link Active</div>
      </div>
    </div>
  );

  return (
    <div className="container flex items-center justify-center min-h-screen py-12 px-4 bg-slate-50 dark:bg-[#020617]">
      <Card className="w-full max-w-md glass-cosmic border-none rounded-[3rem] shadow-3xl relative overflow-hidden">
        <CardHeader className="space-y-4 text-center pt-12 pb-8">
          <div className="flex justify-center mb-2">
            <div className="h-16 w-16 bg-primary/10 rounded-2xl flex items-center justify-center border border-primary/20 shadow-inner">
              <Scale className="h-8 w-8 text-primary" />
            </div>
          </div>
          <div>
            <CardTitle className="text-3xl font-black text-white">الدخول السيادي</CardTitle>
            <CardDescription className="text-white/30 font-bold">مركز القيادة العليا - king2026</CardDescription>
          </div>
        </CardHeader>
        <CardContent className="space-y-6 text-right px-8">
          <div className="space-y-2">
            <Label className="text-white/40 text-xs px-2 font-bold uppercase tracking-widest">الهوية أو البريد</Label>
            <div className="relative">
              <UserCircle className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-white/20" />
              <Input 
                placeholder="king2026 أو البريد الإلكتروني" 
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                className="glass border-white/[0.05] h-14 rounded-2xl text-lg text-right font-medium pr-4 focus:ring-primary/20"
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
                className="glass border-white/[0.05] h-14 rounded-2xl text-lg text-right pr-4 focus:ring-primary/20"
              />
            </div>
          </div>
          <SovereignButton 
            text={isLoading ? "جاري التحقق من السيادة..." : "دخول سيادي مطلق"}
            onClick={handleLogin}
            disabled={isLoading}
            className="mt-2"
            icon={isLoading ? <Loader2 className="animate-spin" /> : <ShieldCheck className="h-5 w-5" />}
          />
        </CardContent>
        <CardFooter className="flex flex-col space-y-4 border-t border-white/5 pt-8 pb-10">
          <div className="text-sm text-center text-white/30">
            ليس لديك هوية سيادية؟{" "}
            <Link href="/auth/signup" className="text-white font-bold hover:underline">انضم الآن</Link>
          </div>
          <Link href="/" className="flex items-center gap-2 text-xs text-white/30 hover:text-white transition-all font-bold">
            <Home className="h-4 w-4" /> العودة للصفحة الرئيسية
          </Link>
        </CardFooter>
      </Card>
    </div>
  );
}
