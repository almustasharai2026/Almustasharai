"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { 
  Scale, Lock, Loader2, Home, UserCircle, ShieldCheck, 
  Sun, Moon, Chrome, Facebook, ArrowRight
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

/**
 * واجهة الدخول السيادية المطورة.
 * تدعم الوضع المظلم، الدخول عبر جوجل وفيسبوك، وبروتوكول king2026.
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
    <div className="min-h-screen flex flex-col items-center justify-center p-6 relative overflow-hidden bg-slate-50 dark:bg-[#020617]">
      {/* Background Decor */}
      <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-primary/5 blur-[150px] rounded-full pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-accent/5 blur-[150px] rounded-full pointer-events-none" />

      {/* Theme Toggle Top Right */}
      <div className="absolute top-8 left-8 z-50">
        <button 
          onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
          className="p-4 bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-border dark:border-white/10 hover:scale-110 transition-all active:scale-95"
        >
          {theme === 'dark' ? <Sun className="h-6 w-6 text-primary" /> : <Moon className="h-6 w-6 text-primary" />}
        </button>
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md z-10"
      >
        <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-2xl p-10 rounded-[3.5rem] shadow-3xl border border-white dark:border-white/5 text-right space-y-8">
          
          <div className="text-center space-y-4">
            <div className="h-20 w-20 bg-primary/10 rounded-3xl flex items-center justify-center mx-auto border border-primary/20">
              <Scale className="h-10 w-10 text-primary" />
            </div>
            <h1 className="text-3xl font-black tracking-tighter text-slate-900 dark:text-white">بوابة الوصول</h1>
            <p className="text-xs text-muted-foreground font-bold uppercase tracking-widest">Sovereign Law Planet Access</p>
          </div>

          <div className="space-y-5">
            <div className="space-y-2">
              <Label className="px-2 text-xs font-black text-muted-foreground uppercase tracking-widest">الهوية</Label>
              <div className="relative group">
                <UserCircle className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
                <input 
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  className="w-full h-14 bg-slate-100 dark:bg-black/40 border-none rounded-2xl px-6 pl-12 text-lg font-bold focus:ring-2 focus:ring-primary/20 transition-all text-right"
                  placeholder="king2026"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label className="px-2 text-xs font-black text-muted-foreground uppercase tracking-widest">المفتاح السري</Label>
              <div className="relative group">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
                <input 
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full h-14 bg-slate-100 dark:bg-black/40 border-none rounded-2xl px-6 pl-12 text-lg font-bold focus:ring-2 focus:ring-primary/20 transition-all text-right"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <SovereignButton 
              text={isLoading ? "جاري المصادقة..." : "دخول سيادي"}
              onClick={handleLogin}
              disabled={isLoading}
              className="h-16 mt-4"
              icon={isLoading ? <Loader2 className="animate-spin" /> : <ShieldCheck />}
            />
          </div>

          <div className="relative flex items-center py-2">
            <div className="flex-grow border-t border-border dark:border-white/5"></div>
            <span className="flex-shrink mx-4 text-[10px] font-black text-muted-foreground uppercase tracking-widest">أو عبر المنصات الاجتماعية</span>
            <div className="flex-grow border-t border-border dark:border-white/5"></div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <SocialBtn icon={<Chrome className="h-5 w-5" />} text="Google" onClick={() => handleSocialLogin('google')} />
            <SocialBtn icon={<Facebook className="h-5 w-5" />} text="Facebook" onClick={() => handleSocialLogin('facebook')} />
          </div>

          <div className="pt-4 text-center">
            <Link href="/auth/signup" className="text-sm font-bold text-muted-foreground hover:text-primary transition-colors">
              لا تملك هوية؟ <span className="text-primary underline">سجل مواطن جديد</span>
            </Link>
          </div>
        </div>

        <Link href="/" className="flex items-center gap-3 justify-center mt-10 text-xs font-black text-muted-foreground hover:text-primary transition-all group">
          العودة للرئيسية <Home className="h-4 w-4 group-hover:-translate-y-1 transition-transform" />
        </Link>
      </motion.div>
    </div>
  );
}

function SocialBtn({ icon, text, onClick }: any) {
  return (
    <button 
      onClick={onClick}
      className="flex items-center justify-center gap-3 h-14 bg-slate-100 dark:bg-white/5 rounded-2xl hover:bg-primary/10 dark:hover:bg-white/10 transition-all border border-transparent hover:border-primary/20 font-bold text-sm"
    >
      {icon}
      <span>{text}</span>
    </button>
  );
}