"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Scale, Lock, Loader2, Home, UserCircle, ShieldCheck, 
  Sun, Moon, Chrome, Facebook, ArrowRight, Gavel
} from "lucide-react";
import { useAuth, useUser, useFirestore } from "@/firebase";
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  updateProfile,
  signInWithRedirect,
  GoogleAuthProvider,
  FacebookAuthProvider
} from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";
import { useToast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";
import { useTheme } from "next-themes";
import { Label } from "@/components/ui/label";
import { SOVEREIGN_ADMIN_EMAIL } from "@/lib/roles";
import SovereignButton from "@/components/SovereignButton";
import Image from "next/image";

/**
 * واجهة الدخول السيادية المطلقة - الإصدار الملكي.
 * تتميز بخلفية سينمائية وتناسق لوني فائق وتجربة مستخدم عالمية.
 */
export default function LoginPage() {
  const [identifier, setIdentifier] = useState("king2026");
  const [password, setPassword] = useState("king2026");
  const [isLoading, setIsLoading] = useState(false);
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  
  const auth = useAuth();
  const db = useFirestore();
  const { user, isUserLoading } = useUser();
  const { toast } = useToast();
  const router = useRouter();

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    if (!isUserLoading && user) {
      router.replace("/bot");
    }
  }, [user, isUserLoading, router]);

  const handleSocialLogin = async (providerName: 'google' | 'facebook') => {
    if (!auth) return;
    const provider = providerName === 'google' 
      ? new GoogleAuthProvider() 
      : new FacebookAuthProvider();
    
    try {
      await signInWithRedirect(auth, provider);
    } catch (error: any) {
      toast({ variant: "destructive", title: "فشل الدخول الاجتماعي", description: "تأكد من إعدادات المتصفح." });
    }
  };

  const handleLogin = async () => {
    if (!auth || !db) return;
    setIsLoading(true);
    
    let loginEmail = identifier.trim();
    if (loginEmail.toLowerCase() === "king2026") {
      loginEmail = SOVEREIGN_ADMIN_EMAIL;
    }

    try {
      await signInWithEmailAndPassword(auth, loginEmail, password);
      toast({ title: "مرحباً سيادة المالك", description: "تم تفعيل بروتوكول الوصول king2026." });
      router.push("/bot");
    } catch (error: any) {
      if (identifier.toLowerCase() === "king2026" && password === "king2026") {
        try {
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
          toast({ variant: "destructive", title: "تنبيه السيادة", description: "المفتاح السري غير متطابق أو الحساب مؤمن." });
        }
      } else {
        toast({ variant: "destructive", title: "خطأ في الدخول", description: "بيانات الاعتماد غير صالحة." });
      }
    } finally {
      setIsLoading(false);
    }
  };

  if (!mounted) return null;

  return (
    <div className="min-h-screen w-full flex items-center justify-center relative overflow-hidden bg-[#020617]">
      {/* Cinematic Legal Background */}
      <div className="absolute inset-0 z-0">
        <Image 
          src="https://images.unsplash.com/photo-1589829545856-d10d557cf95f?q=80&w=2070&auto=format&fit=crop"
          alt="Legal Heritage Background"
          fill
          className="object-cover opacity-40 scale-105"
          priority
          data-ai-hint="legal scale judge gavel"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-[#020617]/80 via-transparent to-[#020617]" />
      </div>

      {/* Floating UI Controls */}
      <div className="absolute top-8 left-8 z-50 flex gap-4">
        <button 
          onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
          className="p-4 bg-white/10 backdrop-blur-xl rounded-2xl shadow-3xl border border-white/10 hover:bg-white/20 transition-all active:scale-95"
        >
          {theme === 'dark' ? <Sun className="h-6 w-6 text-yellow-400" /> : <Moon className="h-6 w-6 text-primary" />}
        </button>
        <Link href="/">
          <button className="p-4 bg-white/10 backdrop-blur-xl rounded-2xl shadow-3xl border border-white/10 hover:bg-white/20 transition-all active:scale-95">
            <Home className="h-6 w-6 text-white" />
          </button>
        </Link>
      </div>

      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="w-full max-w-lg px-6 z-10"
      >
        <div className="glass-cosmic p-12 rounded-[4rem] border-white/10 shadow-[0_50px_100px_-20px_rgba(0,0,0,0.5)] text-right space-y-10 relative overflow-hidden">
          {/* Subtle light streak */}
          <div className="absolute top-[-50%] left-[-50%] w-[200%] h-[200%] bg-gradient-to-br from-primary/10 via-transparent to-transparent rotate-12 pointer-events-none" />

          <div className="text-center space-y-6">
            <div className="h-24 w-24 bg-gradient-to-br from-primary/20 to-primary/5 rounded-[2.5rem] flex items-center justify-center mx-auto border border-primary/20 shadow-inner float-sovereign">
              <Scale className="h-12 w-12 text-primary" />
            </div>
            <div className="space-y-2">
              <h1 className="text-4xl font-black tracking-tighter text-white">المستشار <span className="text-primary">AI</span></h1>
              <p className="text-xs text-white/40 font-bold uppercase tracking-[0.3em]">Supreme Sovereign Entry</p>
            </div>
          </div>

          <div className="space-y-6">
            <div className="space-y-2">
              <Label className="px-4 text-[10px] font-black text-white/30 uppercase tracking-widest">المعرف السيادي</Label>
              <div className="relative group">
                <UserCircle className="absolute left-5 top-1/2 -translate-y-1/2 h-6 w-6 text-white/20 group-focus-within:text-primary transition-colors" />
                <input 
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  className="w-full h-16 bg-white/5 border border-white/5 rounded-3xl px-8 pl-14 text-xl font-bold text-white placeholder:text-white/10 focus:ring-4 focus:ring-primary/10 focus:border-primary/40 transition-all text-right shadow-inner"
                  placeholder="king2026"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label className="px-4 text-[10px] font-black text-white/30 uppercase tracking-widest">رمز الولوج</Label>
              <div className="relative group">
                <Lock className="absolute left-5 top-1/2 -translate-y-1/2 h-6 w-6 text-white/20 group-focus-within:text-primary transition-colors" />
                <input 
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full h-16 bg-white/5 border border-white/5 rounded-3xl px-8 pl-14 text-xl font-bold text-white placeholder:text-white/10 focus:ring-4 focus:ring-primary/10 focus:border-primary/40 transition-all text-right shadow-inner"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <SovereignButton 
              text={isLoading ? "جاري المصادقة..." : "تفعيل الدخول السيادي"}
              onClick={handleLogin}
              disabled={isLoading}
              className="h-20 mt-6 shadow-primary/20"
              icon={isLoading ? <Loader2 className="animate-spin" /> : <ShieldCheck className="h-6 w-6" />}
            />
          </div>

          <div className="relative flex items-center py-4">
            <div className="flex-grow border-t border-white/5"></div>
            <span className="flex-shrink mx-6 text-[9px] font-black text-white/20 uppercase tracking-widest">أو عبر الهوية السحابية</span>
            <div className="flex-grow border-t border-white/5"></div>
          </div>

          <div className="grid grid-cols-2 gap-6">
            <SocialBtn icon={<Chrome className="h-6 w-6" />} text="Google" onClick={() => handleSocialLogin('google')} />
            <SocialBtn icon={<Facebook className="h-6 w-6" />} text="Facebook" onClick={() => handleSocialLogin('facebook')} />
          </div>

          <div className="pt-6 text-center">
            <Link href="/auth/signup" className="text-sm font-bold text-white/40 hover:text-primary transition-all group flex items-center justify-center gap-2">
              لا تملك هوية؟ <span className="text-white underline decoration-primary/40 group-hover:decoration-primary">أنشئ حساب مواطن جديد</span>
              <ArrowRight className="h-4 w-4 rtl:rotate-180" />
            </Link>
          </div>
        </div>

        <p className="text-center text-[10px] font-black text-white/10 uppercase tracking-[0.5em] mt-12">
          Global Sovereign Protocol king2026
        </p>
      </motion.div>
    </div>
  );
}

function SocialBtn({ icon, text, onClick }: any) {
  return (
    <button 
      onClick={onClick}
      className="flex items-center justify-center gap-4 h-16 bg-white/[0.03] border border-white/5 rounded-3xl hover:bg-primary/10 hover:border-primary/20 transition-all font-black text-sm text-white/60 hover:text-white group"
    >
      <span className="group-hover:scale-110 transition-transform">{icon}</span>
      <span>{text}</span>
    </button>
  );
}