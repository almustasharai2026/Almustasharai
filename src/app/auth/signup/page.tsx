"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Scale, Gift, Loader2, Home } from "lucide-react";
import { useState, useEffect } from "react";
import { useAuth, useFirestore, useUser } from "@/firebase";
import { createUserWithEmailAndPassword, updateProfile } from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";
import { useToast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";
import SovereignButton from "@/components/SovereignButton";

export default function SignupPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
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

  const handleSignup = async () => {
    if (!auth || !db || !email || !password || !fullName) {
      toast({ variant: "destructive", title: "بيانات ناقصة", description: "يرجى تعبئة كافة الحقول." });
      return;
    }
    
    setIsLoading(true);
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const newUser = userCredential.user;
      
      await updateProfile(newUser, { displayName: fullName });
      
      await setDoc(doc(db, "users", newUser.uid), {
        id: newUser.uid,
        email,
        fullName,
        balance: 50,
        role: "user",
        createdAt: new Date().toISOString(),
        isBanned: false
      });
      
      toast({ title: "تم إنشاء الهوية السيادية", description: "حصلت على ٥٠ EGP رصيد ترحيبي." });
      router.push("/bot");
    } catch (error: any) {
      toast({ variant: "destructive", title: "فشل إنشاء الحساب", description: error.message });
    } finally {
      setIsLoading(false);
    }
  };

  if (isUserLoading) return null;

  return (
    <div className="container flex items-center justify-center min-h-screen py-12 px-4">
      <Card className="w-full max-w-md glass-cosmic border-none rounded-[3rem] shadow-3xl relative overflow-hidden">
        <CardHeader className="space-y-4 text-center pt-12">
          <div className="flex justify-center">
            <div className="h-16 w-16 bg-primary/10 rounded-2xl flex items-center justify-center border border-primary/20">
              <Scale className="h-8 w-8 text-primary" />
            </div>
          </div>
          <div>
            <CardTitle className="text-3xl font-black text-white">انضم للكوكب</CardTitle>
            <CardDescription className="text-white/30">ابدأ رحلتك القانونية المتميزة الآن.</CardDescription>
          </div>
        </CardHeader>
        <CardContent className="space-y-6 text-right px-8 pb-10">
          <div className="bg-primary/5 border border-primary/10 p-4 rounded-2xl flex items-center gap-4">
             <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
               <Gift className="h-5 w-5" />
             </div>
             <p className="text-[10px] text-primary font-black leading-tight uppercase tracking-widest">هدية ٥٠ EGP رصيد مجاني فور التسجيل!</p>
          </div>

          <div className="space-y-2">
            <Label className="text-white/40 text-xs px-2">الاسم الكامل</Label>
            <Input 
              placeholder="مثال: بيشوي سامي" 
              className="glass border-white/[0.05] h-14 rounded-2xl text-lg text-right"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label className="text-white/40 text-xs px-2">البريد الإلكتروني</Label>
            <Input 
              type="email" 
              placeholder="name@example.com" 
              className="glass border-white/[0.05] h-14 rounded-2xl text-lg text-right"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label className="text-white/40 text-xs px-2">كلمة المرور</Label>
            <Input 
              type="password" 
              className="glass border-white/[0.05] h-14 rounded-2xl text-lg text-right"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          
          <SovereignButton 
            text={isLoading ? "جاري المعالجة..." : "انطلق الآن"}
            onClick={handleSignup}
            disabled={isLoading}
            icon={isLoading ? <Loader2 className="animate-spin" /> : null}
          />
        </CardContent>
        <CardFooter className="flex flex-col space-y-6 border-t border-white/5 pt-8 pb-10">
          <div className="text-sm text-center text-white/30">
            لديك حساب بالفعل؟{" "}
            <Link href="/auth/login" className="text-white font-bold hover:underline">سجل دخولك</Link>
          </div>
          <Link href="/" className="flex items-center gap-2 text-xs text-white/30 hover:text-white transition-all font-bold">
            <Home className="h-4 w-4" /> العودة للصفحة الرئيسية
          </Link>
        </CardFooter>
      </Card>
    </div>
  );
}