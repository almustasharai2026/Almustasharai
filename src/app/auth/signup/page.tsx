"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Scale, Gift, Globe, Facebook, Loader2 } from "lucide-react";
import { useState, useEffect } from "react";
import { useAuth, useFirestore, useUser } from "@/firebase";
import { createUserWithEmailAndPassword, updateProfile as updateAuthProfile } from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";
import { useToast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";

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

  // 🔥 بروتوكول التحقق الاستباقي: إذا كان مسجلاً، توجه فوراً للوحة التحكم
  useEffect(() => {
    if (!isUserLoading && user) {
      router.replace("/dashboard");
    }
  }, [user, isUserLoading, router]);

  const handleSignup = async () => {
    if (!auth || !db || !email || !password || !fullName) {
      toast({ variant: "destructive", title: "بيانات ناقصة", description: "يرجى تعبئة كافة الحقول." });
      return;
    }
    
    setIsLoading(true);
    try {
      // 1. إنشاء الحساب في Auth
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const newUser = userCredential.user;
      
      // 2. تحديث الاسم التعريفي
      await updateAuthProfile(newUser, { displayName: fullName });
      
      // 3. إنشاء الملف السيادي في Firestore مع الرصيد الترحيبي
      // يجب انتظار هذه الخطوة لضمان جاهزية الملف عند الوصول للوحة التحكم
      await setDoc(doc(db, "users", newUser.uid), {
        id: newUser.uid,
        email,
        fullName,
        balance: 50,
        languagePreference: "ar",
        dateJoined: new Date().toISOString(),
        status: "active",
        createdAt: new Date().toISOString(),
        role: "user"
      });
      
      toast({ title: "مبروك!", description: "تم إنشاء الحساب وحصلت على ٥٠ جنيه رصيد ترحيبي." });
      router.push("/dashboard");
    } catch (error: any) {
      toast({ variant: "destructive", title: "خطأ في التسجيل", description: error.message });
    } finally {
      setIsLoading(false);
    }
  };

  if (isUserLoading) return null;

  return (
    <div className="container flex items-center justify-center min-h-[calc(100vh-10rem)] py-12 px-4">
      <Card className="w-full max-w-md glass-cosmic border-none rounded-[3rem] shadow-2xl relative overflow-hidden">
        <CardHeader className="space-y-4 text-center pt-12">
          <div className="flex justify-center">
            <div className="h-16 w-16 bg-white/5 rounded-2xl flex items-center justify-center border border-white/10">
              <Scale className="h-8 w-8 text-white" />
            </div>
          </div>
          <div>
            <CardTitle className="text-3xl font-black text-white">انضم للكوكب</CardTitle>
            <CardDescription className="text-white/40">ابدأ رحلتك القانونية الأكثر راحة.</CardDescription>
          </div>
        </CardHeader>
        <CardContent className="space-y-6 text-right px-8 pb-10">
          
          <div className="bg-white/5 border border-white/10 p-4 rounded-3xl flex items-center gap-4 animate-in zoom-in">
             <div className="h-10 w-10 rounded-full bg-white/10 flex items-center justify-center">
               <Gift className="h-5 w-5 text-white" />
             </div>
             <p className="text-[10px] text-white/60 font-bold leading-tight">هدية ٥٠ جنيه رصيد مجاني فور التسجيل!</p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Button variant="outline" className="h-12 rounded-2xl glass border-white/10 hover:bg-white/5 flex gap-2">
              <Globe className="h-4 w-4" /> Google
            </Button>
            <Button variant="outline" className="h-12 rounded-2xl glass border-white/10 hover:bg-white/5 flex gap-2">
              <Facebook className="h-4 w-4" /> Facebook
            </Button>
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
          
          <Button 
            className="w-full btn-primary h-16 rounded-2xl text-xl font-black shadow-2xl mt-2"
            onClick={handleSignup}
            disabled={isLoading}
          >
            {isLoading ? <Loader2 className="h-6 w-6 animate-spin" /> : "انطلق الآن"}
          </Button>
        </CardContent>
        <CardFooter className="flex flex-col space-y-6 border-t border-white/5 pt-8 pb-10">
          <div className="text-sm text-center text-white/30">
            لديك حساب بالفعل؟{" "}
            <Link href="/auth/login" className="text-white font-bold hover:underline">سجل دخولك</Link>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
}
