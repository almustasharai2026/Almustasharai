
"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Scale, ShieldCheck, Gift, Sparkles } from "lucide-react";
import { useState } from "react";
import { useAuth, useFirestore } from "@/firebase";
import { createUserWithEmailAndPassword, updateProfile } from "firebase/auth";
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
  const { toast } = useToast();
  const router = useRouter();

  const handleSignup = async () => {
    if (!auth || !db || !email || !password || !fullName) {
      toast({ variant: "destructive", title: "بيانات ناقصة", description: "يرجى تعبئة كافة الحقول." });
      return;
    }
    
    setIsLoading(true);
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      await updateProfile(user, { displayName: fullName });

      // Create user profile with 50 EGP Welcome Bonus
      await setDoc(doc(db, "users", user.uid), {
        id: user.uid,
        email: email,
        fullName: fullName,
        balance: 50, // WELCOME BONUS
        languagePreference: "ar",
        dateJoined: new Date().toISOString(),
        status: "active",
        createdAt: new Date().toISOString()
      });

      toast({
        title: "تم إنشاء الحساب بنجاح!",
        description: "لقد حصلت على ٥٠ جنيه رصيد ترحيبي مجاناً في محفظتك.",
      });
      router.push("/dashboard");
    } catch (error: any) {
      console.error(error);
      toast({
        variant: "destructive",
        title: "خطأ في التسجيل",
        description: error.message || "حدث خطأ أثناء إنشاء الحساب.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container flex items-center justify-center min-h-[calc(100vh-10rem)] py-12 px-4">
      <Card className="w-full max-w-md glass-cosmic border-none rounded-[2.5rem] shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-indigo-500 via-primary to-cyan-500" />
        <CardHeader className="space-y-4 text-center pt-12">
          <div className="flex justify-center">
            <div className="h-20 w-20 bg-primary/10 rounded-3xl flex items-center justify-center shadow-inner border border-white/5 animate-pulse">
              <Scale className="h-10 w-10 text-primary" />
            </div>
          </div>
          <div>
            <CardTitle className="text-3xl font-black text-white">انضم لكوكب المستشار</CardTitle>
            <CardDescription className="text-lg opacity-60">ابدأ رحلتك القانونية الذكية الآن.</CardDescription>
          </div>
        </CardHeader>
        <CardContent className="space-y-6 text-right pb-10">
          <div className="bg-primary/10 border border-primary/20 p-5 rounded-[1.5rem] flex items-center gap-4 animate-in zoom-in duration-700">
             <div className="h-12 w-12 rounded-full bg-primary/20 flex items-center justify-center shrink-0">
               <Gift className="h-6 w-6 text-primary" />
             </div>
             <div>
               <p className="text-sm text-primary font-black leading-tight">هدية ترحيبية!</p>
               <p className="text-[11px] opacity-70">سجل الآن واحصل على ٥٠ جنيه رصيد مجاني فوراً.</p>
             </div>
          </div>

          <div className="space-y-2 mt-4">
            <Label htmlFor="full-name" className="text-sm font-bold opacity-70">الاسم الكامل</Label>
            <Input 
              id="full-name" 
              placeholder="مثال: بيشوي سامي" 
              className="glass border-white/5 h-14 rounded-2xl text-lg pr-4 focus:ring-primary/50"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email" className="text-sm font-bold opacity-70">البريد الإلكتروني</Label>
            <Input 
              id="email" 
              type="email" 
              placeholder="name@example.com" 
              className="glass border-white/5 h-14 rounded-2xl text-lg pr-4 focus:ring-primary/50"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password" className="text-sm font-bold opacity-70">كلمة المرور</Label>
            <Input 
              id="password" 
              type="password" 
              className="glass border-white/5 h-14 rounded-2xl text-lg pr-4 focus:ring-primary/50"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          
          <Button 
            className="w-full cosmic-gradient h-16 rounded-2xl text-xl font-black mt-4 shadow-2xl shadow-primary/20 group overflow-hidden relative"
            onClick={handleSignup}
            disabled={isLoading}
          >
            <span className="relative z-10 flex items-center gap-2">
              {isLoading ? "جاري المعالجة..." : "انطلق الآن"}
              {!isLoading && <Sparkles className="h-5 w-5 group-hover:rotate-12 transition-transform" />}
            </span>
            <div className="absolute inset-0 bg-white/10 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
          </Button>
        </CardContent>
        <CardFooter className="flex flex-col space-y-6 border-t border-white/5 pt-8 bg-slate-900/40">
          <div className="text-sm text-center text-muted-foreground">
            لديك حساب بالفعل؟{" "}
            <Link href="/auth/login" className="text-primary font-bold hover:underline">سجل دخولك من هنا</Link>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
}
