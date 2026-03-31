"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Scale, ShieldCheck, Loader2, Home, Gavel, 
  Camera, CheckCircle2, User, Mail, Phone, Lock, FileCheck, Sun, Moon, ArrowRight
} from "lucide-react";
import { useAuth, useFirestore, useUser } from "@/firebase";
import { createUserWithEmailAndPassword, updateProfile } from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";
import { useToast } from "@/hooks/use-toast";
import { Label } from "@/components/ui/label";
import { useTheme } from "next-themes";
import SovereignButton from "@/components/SovereignButton";
import IdCaptureWizard from "@/components/IdCaptureWizard";
import { verifyLegalIdentity } from "@/ai/flows/verify-id-flow";
import { roles as ROLES_LIST } from "@/lib/roles";
import Image from "next/image";

/**
 * بوابة التسجيل السيادية - الإصدار الملكي الموحد.
 * تم دمج معالج تصوير الوثائق في واجهة زجاجية سينمائية فائقة الفخامة.
 */
export default function SignupPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [workPhone, setWorkPhone] = useState("");
  const [workAddress, setWorkAddress] = useState("");
  const [isProfessional, setIsProfessional] = useState(false);
  const [idDocs, setIdDocs] = useState<any>(null);
  const [isCapturing, setIsCapturing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [mounted, setMounted] = useState(false);
  
  const auth = useAuth();
  const db = useFirestore();
  const { user, isUserLoading } = useUser();
  const { toast } = useToast();
  const router = useRouter();
  const { theme, setTheme } = useTheme();

  useEffect(() => {
    setMounted(true);
    if (!isUserLoading && user) {
      router.replace("/bot");
    }
  }, [user, isUserLoading, router]);

  const handleSignup = async () => {
    if (!auth || !db) return;

    if (!email || !password || !fullName || !phone) {
      toast({ variant: "destructive", title: "بيانات ناقصة", description: "يرجى تعبئة كافة الحقول الأساسية للمتابعة." });
      return;
    }

    if (isProfessional && !idDocs) {
      setIsCapturing(true);
      return;
    }
    
    setIsLoading(true);
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const newUser = userCredential.user;
      
      await updateProfile(newUser, { displayName: fullName });
      
      const userData: any = {
        id: newUser.uid,
        email,
        fullName,
        phone,
        workPhone: workPhone || phone,
        workAddress: workAddress || "غير محدد",
        balance: 50,
        role: isProfessional ? ROLES_LIST.PENDING_EXPERT : ROLES_LIST.USER,
        createdAt: new Date().toISOString(),
        isBanned: false
      };

      if (idDocs) {
        userData.verificationRequest = { docs: idDocs, submittedAt: new Date().toISOString(), status: 'pending' };
        try {
          const aiResult = await verifyLegalIdentity({
            frontIdUri: idDocs.syndicateFront,
            backIdUri: idDocs.syndicateBack,
            docType: 'syndicate'
          });
          if (aiResult) userData.verificationRequest.aiPreCheck = aiResult;
        } catch (aiErr) { console.warn("AI Pre-check Timeout"); }
      }
      
      await setDoc(doc(db, "users", newUser.uid), userData);
      
      toast({ 
        title: isProfessional ? "بانتظار المراجعة السيادية ✅" : "مرحباً بك في الكوكب", 
        description: isProfessional ? "سيتم مراجعة وثائقك من قبل king2026 لتفعيل حسابك كخبير." : "حصلت على ٥٠ EGP رصيد ترحيبي مجاني." 
      });
      router.push("/bot");
    } catch (error: any) {
      toast({ variant: "destructive", title: "فشل إنشاء الحساب", description: error.message });
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
          className="object-cover opacity-30 scale-105"
          priority
          data-ai-hint="legal scale judge gavel"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-[#020617]/90 via-transparent to-[#020617]" />
      </div>

      {/* Floating Controls */}
      <div className="absolute top-8 left-8 z-50 flex gap-4">
        <button onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')} className="p-4 bg-white/10 backdrop-blur-xl rounded-2xl border border-white/10 text-white hover:bg-white/20 transition-all shadow-3xl">
          {theme === 'dark' ? <Sun className="h-6 w-6 text-yellow-400" /> : <Moon className="h-6 w-6 text-primary" />}
        </button>
        <Link href="/">
          <button className="p-4 bg-white/10 backdrop-blur-xl rounded-2xl border border-white/10 text-white hover:bg-white/20 shadow-3xl">
            <Home className="h-6 w-6" />
          </button>
        </Link>
      </div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-xl px-6 z-10 py-20">
        <div className="glass-cosmic p-10 md:p-12 rounded-[4rem] border-white/10 shadow-3xl text-right relative overflow-hidden">
          <div className="absolute top-0 right-0 p-12 opacity-5 pointer-events-none">
            <Scale className="h-64 w-64 text-white" />
          </div>

          <div className="text-center space-y-6 mb-10">
            <div className="h-20 w-20 bg-primary/20 rounded-3xl flex items-center justify-center mx-auto border border-primary/30 float-sovereign shadow-xl">
              <Scale className="h-10 w-10 text-primary" />
            </div>
            <h1 className="text-3xl font-black text-white tracking-tighter">تسجيل <span className="text-primary">مواطن جديد</span></h1>
            <p className="text-xs text-white/40 font-bold uppercase tracking-[0.3em]">Supreme Identity Protocol</p>
          </div>

          <AnimatePresence mode="wait">
            {!isCapturing ? (
              <motion.div key="form" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-6">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label className="px-4 text-[10px] font-black text-white/30 uppercase tracking-widest">الاسم الكامل رباعي</Label>
                    <div className="relative group">
                      <User className="absolute left-5 top-1/2 -translate-y-1/2 h-5 w-5 text-white/20 group-focus-within:text-primary" />
                      <input value={fullName} onChange={e => setFullName(e.target.value)} className="w-full h-14 bg-white/5 border border-white/5 rounded-2xl px-6 pl-12 text-lg font-bold text-white focus:ring-4 focus:ring-primary/10 transition-all text-right shadow-inner" placeholder="أحمد محمد علي..." />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label className="px-4 text-[10px] font-black text-white/30 uppercase tracking-widest">البريد الإلكتروني</Label>
                      <input type="email" value={email} onChange={e => setEmail(e.target.value)} className="w-full h-14 bg-white/5 border border-white/5 rounded-2xl px-6 text-sm font-bold text-white text-right shadow-inner" placeholder="name@domain.com" />
                    </div>
                    <div className="space-y-2">
                      <Label className="px-4 text-[10px] font-black text-white/30 uppercase tracking-widest">رقم الجوال</Label>
                      <input value={phone} onChange={e => setPhone(e.target.value)} className="w-full h-14 bg-white/5 border border-white/5 rounded-2xl px-6 text-sm font-bold text-white text-right shadow-inner" placeholder="01xxxxxxxxx" />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label className="px-4 text-[10px] font-black text-white/30 uppercase tracking-widest">رمز الولوج السري</Label>
                    <input type="password" value={password} onChange={e => setPassword(e.target.value)} className="w-full h-14 bg-white/5 border border-white/5 rounded-2xl px-6 text-lg font-bold text-white text-right shadow-inner" placeholder="••••••••" />
                  </div>
                </div>

                <div 
                  className={`p-6 rounded-[2rem] border-2 transition-all cursor-pointer group ${isProfessional ? 'border-primary bg-primary/10 shadow-lg shadow-primary/5' : 'border-white/5 bg-white/[0.02] hover:border-white/20'}`}
                  onClick={() => setIsProfessional(!isProfessional)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className={`h-6 w-6 rounded-lg border-2 flex items-center justify-center ${isProfessional ? 'bg-primary border-primary' : 'border-white/20'}`}>
                        {isProfessional && <CheckCircle2 className="h-4 w-4 text-white" />}
                      </div>
                      <div>
                        <p className="text-sm font-black text-white">أنا محامي أو مستشار قانوني</p>
                        <p className="text-[9px] text-white/40 font-bold mt-1">تفعيل بروتوكول مجلس الخبراء يتطلب توثيق الهوية المهنية.</p>
                      </div>
                    </div>
                    <Gavel className={`h-6 w-6 transition-all ${isProfessional ? 'text-primary' : 'opacity-20'}`} />
                  </div>
                </div>

                <AnimatePresence>
                  {isProfessional && (
                    <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} className="space-y-4 pt-2">
                      <div className="grid grid-cols-2 gap-4">
                        <input value={workPhone} onChange={e => setWorkPhone(e.target.value)} placeholder="هاتف المكتب" className="w-full h-12 bg-white/5 border border-white/5 rounded-xl px-4 text-xs font-bold text-white text-right" />
                        <input value={workAddress} onChange={e => setWorkAddress(e.target.value)} placeholder="عنوان المكتب" className="w-full h-12 bg-white/5 border border-white/5 rounded-xl px-4 text-xs font-bold text-white text-right" />
                      </div>
                      {idDocs ? (
                        <div className="bg-emerald-500/10 p-4 rounded-2xl border border-emerald-500/20 flex items-center justify-between shadow-xl">
                           <div className="flex items-center gap-3"><CheckCircle2 className="h-5 w-5 text-emerald-500" /><span className="text-[9px] text-emerald-500 font-black uppercase tracking-widest">Documented Authority</span></div>
                           <button onClick={() => setIsCapturing(true)} className="text-[9px] text-emerald-500 underline font-black">تحديث الصور</button>
                        </div>
                      ) : (
                        <div className="bg-primary/5 p-4 rounded-2xl border border-primary/10 flex items-center gap-3 shadow-xl">
                          <Camera className="h-5 w-5 text-primary" />
                          <p className="text-[9px] text-primary/60 font-bold">يجب تصوير الوثائق المهنية لفتح حساب خبير سيادي.</p>
                        </div>
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>
                
                <SovereignButton 
                  text={isLoading ? "جاري التأسيس..." : (isProfessional && !idDocs ? "متابعة تصوير الوثائق" : "إصدار الهوية السيادية")}
                  onClick={handleSignup}
                  disabled={isLoading}
                  className="h-20 shadow-primary/20"
                  icon={isLoading ? <Loader2 className="animate-spin" /> : (isProfessional && !idDocs ? <Camera /> : <ShieldCheck />)}
                />
              </motion.div>
            ) : (
              <motion.div key="wizard" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }} className="space-y-6">
                <IdCaptureWizard onComplete={(docs) => { setIdDocs(docs); setIsCapturing(false); toast({ title: "تم توثيق الوثائق السيادية ✅" }); }} />
                <button onClick={() => setIsCapturing(false)} className="w-full text-xs font-black text-white/20 hover:text-white transition-all py-2 uppercase tracking-widest">العودة لتعديل البيانات</button>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="mt-10 pt-8 border-t border-white/5 text-center space-y-6">
            <p className="text-sm font-bold text-white/40">لديك هوية مسجلة؟ <Link href="/auth/login" className="text-primary hover:underline">سجل دخولك السيادي</Link></p>
            <p className="text-[9px] font-black text-white/10 uppercase tracking-[0.5em]">king2026 Sovereign Protocol v4.5</p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
