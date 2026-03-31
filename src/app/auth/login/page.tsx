'use client';

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Scale, Globe, Facebook, Lock } from "lucide-react";
import { useState } from "react";
import { useAuth } from "@/firebase";
import { signInWithEmailAndPassword } from "firebase/auth";
import { useToast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";
import SovereignButton from "@/components/SovereignButton";

export default function LoginPage() {
  const [email, setEmail] = useState("bishoysamy390@gmail.com");
  const [password, setPassword] = useState("King@2026");
  const [isLoading, setIsLoading] = useState(false);
  const auth = useAuth();
  const { toast } = useToast();
  const router = useRouter();

  const handleLogin = async () => {
    if (!auth) return;
    setIsLoading(true);
    try {
      await signInWithEmailAndPassword(auth, email, password);
      toast({ title: "تم تسجيل الدخول", description: "مرحباً بك مجدداً في كوكب المستشار." });
      router.push("/dashboard");
    } catch (error: any) {
      toast({ variant: "destructive", title: "فشل الدخول", description: "تأكد من البريد وكلمة المرور." });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container flex items-center justify-center min-h-[calc(100vh-10rem)] py-12 px-4">
      <Card className="w-full max-w-md glass-cosmic border-none rounded-[3rem] shadow-2xl relative overflow-hidden">
        <CardHeader className="space-y-4 text-center pt-12 pb-8">
          <div className="flex justify-center mb-2">
            <div className="h-16 w-16 bg-white/5 rounded-2xl flex items-center justify-center border border-white/10">
              <Scale className="h-8 w-8 text-white" />
            </div>
          </div>
          <div>
            <CardTitle className="text-3xl font-black text-white">تسجيل الدخول</CardTitle>
            <CardDescription className="text-white/40">أهلاً بك في الجيل القادم من القانون</CardDescription>
          </div>
        </CardHeader>
        <CardContent className="space-y-6 text-right px-8">
          
          <div className="grid grid-cols-2 gap-4">
            <Button variant="outline" className="h-12 rounded-2xl glass border-white/10 hover:bg-white/5 flex gap-2">
              <Globe className="h-4 w-4" /> Google
            </Button>
            <Button variant="outline" className="h-12 rounded-2xl glass border-white/10 hover:bg-white/5 flex gap-2">
              <Facebook className="h-4 w-4" /> Facebook
            </Button>
          </div>

          <div className="relative flex items-center gap-4 py-2">
            <div className="h-px bg-white/5 flex-1" />
            <span className="text-[10px] text-white/20 font-bold">أو عبر البريد</span>
            <div className="h-px bg-white/5 flex-1" />
          </div>

          <div className="space-y-2">
            <Label className="text-white/40 text-xs px-2">البريد الإلكتروني</Label>
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
              <Link href="#" className="text-[10px] text-white/30 hover:underline">نسيت كلمة المرور؟</Link>
              <Label className="text-white/40 text-xs">كلمة المرور</Label>
            </div>
            <Input 
              type="password" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="glass border-white/[0.05] h-14 rounded-2xl text-lg text-right"
            />
          </div>
          
          <SovereignButton 
            text={isLoading ? "جاري الدخول..." : "دخول سيادي"}
            onClick={handleLogin}
            disabled={isLoading}
            className="mt-2"
            icon={<Lock className="h-5 w-5" />}
          />
        </CardContent>
        <CardFooter className="flex flex-col space-y-4 border-t border-white/5 pt-8 pb-10">
          <div className="text-sm text-center text-white/30">
            ليس لديك حساب؟{" "}
            <Link href="/auth/signup" className="text-white font-bold hover:underline">إنشاء حساب جديد</Link>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
}
