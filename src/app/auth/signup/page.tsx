
"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Scale, ShieldCheck, Loader2, Home, Gavel, 
  Camera, CheckCircle2, User, Mail, Phone, Lock, FileCheck 
} from "lucide-react";
import { useAuth, useFirestore, useUser } from "@/firebase";
import { createUserWithEmailAndPassword, updateProfile } from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import SovereignButton from "@/components/SovereignButton";
import IdCaptureWizard from "@/components/IdCaptureWizard";
import { verifyLegalIdentity } from "@/ai/flows/verify-id-flow";
import { roles as ROLES_LIST, SOVEREIGN_ADMIN_EMAIL } from "@/lib/roles";

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
    if (!auth || !db) return;

    if (!email || !password || !fullName || !phone) {
      toast({ variant: "destructive", title: "بيانات ناقصة", description: "يرجى تعبئة كافة الحقول الأساسية للمتابعة." });
      return;
    }

    // 🔥 بروتوكول التوجيه القسري لتصوير الوثائق للمحامين
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
        userData.verificationRequest = {
          docs: idDocs,
          submittedAt: new Date().toISOString(),
          status: 'pending'
        };

        // محاولة التحقق الذكي عبر Gemini بأسلوب آمن
        try {
          const aiResult = await verifyLegalIdentity({
            frontIdUri: idDocs.syndicateFront,
            backIdUri: idDocs.syndicateBack,
            docType: 'syndicate'
          });
          if (aiResult) {
            userData.verificationRequest.aiPreCheck = aiResult;
          }
        } catch (aiErr) {
          console.warn("AI Pre-check skipped due to technical timeout");
        }
      }
      
      await setDoc(doc(db, "users", newUser.uid), userData);
      
      toast({ 
        title: isProfessional ? "بانتظار المراجعة السيادية ✅" : "مرحباً بك في الكوكب", 
        description: isProfessional 
          ? "سيتم مراجعة وثائقك من قبل king2026 لتفعيل حسابك كخبير." 
          : "حصلت على ٥٠ EGP رصيد ترحيبي مجاني." 
      });
      router.push("/bot");
    } catch (error: any) {
      toast({ variant: "destructive", title: "فشل إنشاء الحساب", description: error.message });
    } finally {
      setIsLoading(false);
    }
  };

  if (isUserLoading) return null;

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-slate-50 dark:bg-[#020617] relative overflow-hidden" dir="rtl">
      <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-primary/10 blur-[150px] rounded-full pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-96 h-96 bg-indigo-500/10 blur-[150px] rounded-full pointer-events-none" />

      <Card className="w-full max-w-lg glass-cosmic border-none rounded-[3.5rem] shadow-3xl relative z-10">
        <CardHeader className="text-center pt-12 space-y-4">
          <div className="flex justify-center">
            <div className="h-16 w-16 bg-primary/10 rounded-2xl flex items-center justify-center border border-primary/20">
              <Scale className="h-8 w-8 text-primary" />
            </div>
          </div>
          <div>
            <CardTitle className="text-3xl font-black text-slate-900 dark:text-white">تسجيل مواطن جديد</CardTitle>
            <CardDescription className="text-muted-foreground font-bold">انضم لكوكب المستشار AI واستلم رصيدك السيادي.</CardDescription>
          </div>
        </CardHeader>
        
        <CardContent className="space-y-6 text-right px-8 pb-10">
          <AnimatePresence mode="wait">
            {!isCapturing ? (
              <motion.div 
                key="form"
                initial={{ opacity: 0, x: 20 }} 
                animate={{ opacity: 1, x: 0 }} 
                exit={{ opacity: 0, x: -20 }} 
                className="space-y-6"
              >
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label className="text-xs font-black text-muted-foreground uppercase tracking-widest px-2">الاسم الكامل رباعي</Label>
                    <div className="relative group">
                      <User className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
                      <input 
                        value={fullName}
                        onChange={e => setFullName(e.target.value)}
                        placeholder="الاسم كما هو مكتوب في الهوية الوطنية"
                        className="w-full h-14 bg-slate-100 dark:bg-black/40 border-none rounded-2xl px-6 pl-12 text-lg font-bold focus:ring-2 focus:ring-primary/20 transition-all text-right"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label className="text-xs font-black text-muted-foreground uppercase tracking-widest px-2">البريد الإلكتروني</Label>
                      <input 
                        type="email"
                        value={email}
                        onChange={e => setEmail(e.target.value)}
                        placeholder="name@domain.com"
                        className="w-full h-14 bg-slate-100 dark:bg-black/40 border-none rounded-2xl px-6 text-sm font-bold focus:ring-2 focus:ring-primary/20 text-right"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-xs font-black text-muted-foreground uppercase tracking-widest px-2">رقم الجوال</Label>
                      <input 
                        value={phone}
                        onChange={e => setPhone(e.target.value)}
                        placeholder="01xxxxxxxxx"
                        className="w-full h-14 bg-slate-100 dark:bg-black/40 border-none rounded-2xl px-6 text-sm font-bold focus:ring-2 focus:ring-primary/20 text-right"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-xs font-black text-muted-foreground uppercase tracking-widest px-2">كلمة المرور</Label>
                    <input 
                      type="password"
                      value={password}
                      onChange={e => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full h-14 bg-slate-100 dark:bg-black/40 border-none rounded-2xl px-6 text-lg font-bold focus:ring-2 focus:ring-primary/20 text-right"
                    />
                  </div>
                </div>

                {/* 🔥 تحصين أحداث النقر في خانة المحامي */}
                <div 
                  className={`p-6 rounded-3xl border-2 transition-all cursor-pointer group ${isProfessional ? 'border-primary bg-primary/5' : 'border-slate-100 dark:border-white/5 hover:border-primary/20'}`}
                  onClick={() => setIsProfessional(!isProfessional)}
                >
                  <div className="flex items-center justify-between pointer-events-none">
                    <div className="flex items-center gap-4">
                      <div className={`h-6 w-6 rounded-lg border-2 flex items-center justify-center transition-all ${isProfessional ? 'bg-primary border-primary' : 'border-slate-300 dark:border-white/20'}`}>
                        {isProfessional && <ShieldCheck className="h-4 w-4 text-white" />}
                      </div>
                      <div>
                        <p className="text-sm font-black text-slate-900 dark:text-white group-hover:text-primary transition-colors">أنا محامي أو مستشار قانوني</p>
                        <p className="text-[10px] text-muted-foreground font-bold leading-tight mt-1">يتطلب هذا الخيار توثيق الهوية المهنية للقبول في مجلس الخبراء.</p>
                      </div>
                    </div>
                    <Gavel className={`h-6 w-6 transition-all ${isProfessional ? 'text-primary' : 'opacity-20'}`} />
                  </div>
                </div>

                <AnimatePresence>
                  {isProfessional && (
                    <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="space-y-4 overflow-hidden pt-2">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label className="text-xs font-black text-muted-foreground uppercase tracking-widest px-2">هاتف العمل (إن وجد)</Label>
                          <input 
                            value={workPhone}
                            onChange={e => setWorkPhone(e.target.value)}
                            placeholder="رقم المكتب الرسمي"
                            className="w-full h-14 bg-slate-100 dark:bg-black/40 border-none rounded-2xl px-6 text-sm font-bold focus:ring-2 focus:ring-primary/20 text-right"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label className="text-xs font-black text-muted-foreground uppercase tracking-widest px-2">عنوان المكتب (إن وجد)</Label>
                          <input 
                            value={workAddress}
                            onChange={e => setWorkAddress(e.target.value)}
                            placeholder="المحافظة، المنطقة..."
                            className="w-full h-14 bg-slate-100 dark:bg-black/40 border-none rounded-2xl px-6 text-sm font-bold focus:ring-2 focus:ring-primary/20 text-right"
                          />
                        </div>
                      </div>
                      
                      {idDocs ? (
                        <div className="bg-emerald-500/10 p-4 rounded-2xl border border-emerald-500/20 flex items-center justify-between">
                           <div className="flex items-center gap-3">
                              <CheckCircle2 className="h-5 w-5 text-emerald-500" />
                              <span className="text-[10px] text-emerald-500 font-black uppercase tracking-widest">Identity Secured</span>
                           </div>
                           <button onClick={() => setIsCapturing(true)} className="text-[10px] text-emerald-500 underline font-black">تعديل الصور</button>
                        </div>
                      ) : (
                        <div className="bg-amber-500/10 p-4 rounded-2xl border border-amber-500/20 flex items-center gap-3">
                          <Camera className="h-5 w-5 text-amber-500" />
                          <p className="text-[10px] text-amber-500 font-bold leading-tight">يجب تصوير مستنداتك المهنية لفتح بروتوكول حساب الخبير.</p>
                        </div>
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>
                
                <SovereignButton 
                  text={isLoading ? "جاري المعالجة..." : (isProfessional && !idDocs ? "متابعة تصوير الوثائق" : "إنشاء الحساب السيادي")}
                  onClick={handleSignup}
                  disabled={isLoading}
                  icon={isLoading ? <Loader2 className="animate-spin" /> : (isProfessional && !idDocs ? <Camera /> : <ShieldCheck />)}
                />
              </motion.div>
            ) : (
              <motion.div 
                key="wizard"
                initial={{ opacity: 0, scale: 0.95 }} 
                animate={{ opacity: 1, scale: 1 }} 
                exit={{ opacity: 0 }} 
                className="space-y-6"
              >
                <IdCaptureWizard onComplete={(docs) => {
                  setIdDocs(docs);
                  setIsCapturing(false);
                  toast({ title: "تم توثيق الوثائق بنجاح ✅", description: "البيانات جاهزة للمراجعة من قبل king2026." });
                }} />
                <button onClick={() => setIsCapturing(false)} className="w-full text-xs font-black text-muted-foreground hover:text-slate-900 dark:hover:text-white transition-colors py-2 uppercase tracking-widest">
                  إلغاء والعودة للبيانات
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </CardContent>

        <CardFooter className="flex flex-col space-y-6 border-t border-slate-100 dark:border-white/5 pt-8 pb-10">
          <div className="text-sm text-center text-muted-foreground font-bold">
            لديك هوية سيادية؟{" "}
            <Link href="/auth/login" className="text-primary hover:underline">سجل دخولك الآن</Link>
          </div>
          <Link href="/" className="flex items-center gap-2 text-xs font-black text-muted-foreground hover:text-primary transition-all">
            <Home className="h-4 w-4" /> العودة للرئيسية
          </Link>
        </CardFooter>
      </Card>
    </div>
  );
}
