
"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Scale, Lock, Loader2, Home } from "lucide-react";
import { useState, useEffect } from "react";
import { useAuth, useUser } from "@/firebase";
import { signInWithEmailAndPassword } from "firebase/auth";
import { useToast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";
import SovereignButton from "@/components/SovereignButton";

/**
 * بوابة الدخول السيادية المحدثة.
 * تدعم بيانات الاعتماد king2026 / king2020.
 */
export default function LoginPage() {
  const [email, setEmail] = useState("bishoysamy390@gmail.com");
  const [password, setPassword] = useState("king2020");
  const [isLoading, setIsLoading] = useState(false);
  const auth = useAuth();
  const { user, isUserLoading } = useUser();
  const { toast } = useToast();
  const router = useRouter();

  useEffect(() => {
    if (!isUserLoading && user) {
      router.replace("/bot");
    }
  }, [user, isUserLoading, router]);

  const handleLogin = async () => {
    if (!auth) return;
    setIsLoading(true);
    try {
      await signInWithEmailAndPassword(auth, email, password);
      toast({ title: "مرحباً سيادة المالك", description: "تم تفعيل بروتوكول الوصول السيادي king2026." });
      router.push("/bot");
    } catch (error: any) {
      toast({ variant: "destructive", title: "فشل الدخول السيادي", description: "يرجى التحقق من بيانات المفتاح السيادي." });
    } finally {
      setIsLoading(false);
    }
  };

  if (isUserLoading) return (
    <div className="h-screen flex items-center justify-center bg-[#020617]">
      <div className="animate-pulse text-white font-black tracking-[0.5em] uppercase">Authenticating Identity...</div>
    </div>
  );

  return (
    <div className="container flex items-center justify-center min-h-screen py-12 px-4">
      <Card className="w-full max-w-md glass-cosmic border-none rounded-[3rem] shadow-3xl relative overflow-hidden">
        <CardHeader className="space-y-4 text-center pt-12 pb-8">
          <div className="flex justify-center mb-2">
            <div className="h-16 w-16 bg-primary/10 rounded-2xl flex items-center justify-center border border-primary/20">
              <Scale className="h-8 w-8 text-primary" />
            </div>
          </div>
          <div>
            <CardTitle className="text-3xl font-black text-white">الدخول السيادي</CardTitle>
            <CardDescription className="text-white/30">مركز القيادة العليا - king2026</CardDescription>
          </div>
        </CardHeader>
        <CardContent className="space-y-6 text-right px-8">
          <div className="space-y-2">
            <Label className="text-white/40 text-xs px-2">البريد السيادي</Label>
            <Input 
              type="email" 
              placeholder="name@example.com" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="glass border-white/[0.05] h-14 rounded-2xl text-lg text-right"
            />
          </div>
          <div className="space-y-2">
            <div className="flex items-center justify-between px-2">
              <Link href="#" className="text-[10px] text-white/30 hover:underline">فقدان المفتاح؟</Link>
              <Label className="text-white/40 text-xs">كلمة المرور السيادية</Label>
            </div>
            <Input 
              type="password" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="glass border-white/[0.05] h-14 rounded-2xl text-lg text-right"
            />
          </div>
          <SovereignButton 
            text={isLoading ? "جاري التفعيل..." : "دخول سيادي مطلق"}
            onClick={handleLogin}
            disabled={isLoading}
            className="mt-2"
            icon={isLoading ? <Loader2 className="animate-spin" /> : <Lock className="h-5 w-5" />}
          />
        </CardContent>
        <CardFooter className="flex flex-col space-y-4 border-t border-white/5 pt-8 pb-10">
          <div className="text-sm text-center text-white/30">
            ليس لديك حساب؟{" "}
            <Link href="/auth/signup" className="text-white font-bold hover:underline">سجل كعضو جديد</Link>
          </div>
          <Link href="/" className="flex items-center gap-2 text-xs text-white/30 hover:text-white transition-all font-bold">
            <Home className="h-4 w-4" /> العودة للصفحة الرئيسية
          </Link>
        </CardFooter>
      </Card>
    </div>
  );
}
