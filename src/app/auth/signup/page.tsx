"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Scale, Gift, Loader2, Home, Gavel, ShieldCheck, Phone, MapPin, Briefcase } from "lucide-react";
import { useState, useEffect } from "react";
import { useAuth, useFirestore, useUser } from "@/firebase";
import { createUserWithEmailAndPassword, updateProfile } from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";
import { useToast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import SovereignButton from "@/components/SovereignButton";
import IdCaptureWizard from "@/components/IdCaptureWizard";
import { verifyLegalIdentity } from "@/ai/flows/verify-id-flow";

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
    if (!auth || !db || !email || !password || !fullName || !phone) {
      toast({ variant: "destructive", title: "بيانات ناقصة", description: "يرجى تعبئة كافة الحقول الأساسية بما فيها رقم الهاتف الجوال." });
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
        workPhone: workPhone || phone, // إذا لم يكتب رقم العمل، نعتمد الشخصي
        workAddress: workAddress || "غير محدد",
        balance: 50,
        role: isProfessional ? "pending_expert" : "user",
        createdAt: new Date().toISOString(),
        isBanned: false
      };

      if (idDocs) {
        userData.verificationRequest = {
          docs: idDocs,
          submittedAt: new Date().toISOString(),
          status: 'pending'
        };

        // تفعيل الذكاء الاصطناعي للتحقق المبدئي (Sovereign AI Verify)
        try {
          const aiResult = await verifyLegalIdentity({
            frontIdUri: idDocs.syndicateFront,
            backIdUri: idDocs.syndicateBack,
            docType: 'syndicate'
          });
          userData.verificationRequest.aiPreCheck = aiResult;
        } catch (aiErr) {
          console.error("AI Pre-check failed, proceeding to manual review");
        }
      }
      
      await setDoc(doc(db, "users", newUser.uid), userData);
      
      toast({ 
        title: isProfessional ? "تم التسجيل بنجاح ✅" : "تم إنشاء الهوية السيادية", 
        description: isProfessional 
          ? "وثائقك قيد المراجعة السيادية الآن. ستحصل على تنبيه عند الاعتماد." 
          : "حصلت على ٥٠ EGP رصيد ترحيبي." 
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
    <div className="container flex items-center justify-center min-h-screen py-12 px-4 bg-slate-50 dark:bg-[#020617]">
      <Card className="w-full max-w-lg glass-cosmic border-none rounded-[3.5rem] shadow-3xl relative overflow-hidden">
        <CardHeader className="space-y-4 text-center pt-12">
          <div className="flex justify-center">
            <div className="h-16 w-16 bg-primary/10 rounded-2xl flex items-center justify-center border border-primary/20">
              <Scale className="h-8 w-8 text-primary" />
            </div>
          </div>
          <div>
            <CardTitle className="text-3xl font-black text-white">انضم للكوكب</CardTitle>
            <CardDescription className="text-white/30">سجل هويتك الرقمية للحصول على رصيد ترحيبي ٥٠ EGP.</CardDescription>
          </div>
        </CardHeader>
        
        <CardContent className="space-y-6 text-right px-8 pb-10">
          <AnimatePresence mode="wait">
            {!isCapturing ? (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-6">
                
                {/* الحقول المشتركة */}
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label className="text-white/40 text-xs px-2">الاسم الكامل رباعي</Label>
                    <Input placeholder="الاسم كما في الهوية" className="glass h-14 rounded-2xl text-lg text-right" value={fullName} onChange={e => setFullName(e.target.value)} />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label className="text-white/40 text-xs px-2">البريد الإلكتروني</Label>
                      <Input type="email" placeholder="name@domain.com" className="glass h-14 rounded-2xl text-lg text-right" value={email} onChange={e => setEmail(e.target.value)} />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-white/40 text-xs px-2">رقم الجوال</Label>
                      <Input placeholder="01xxxxxxxxx" className="glass h-14 rounded-2xl text-lg text-right" value={phone} onChange={e => setPhone(e.target.value)} />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-white/40 text-xs px-2">كلمة المرور</Label>
                    <Input type="password" placeholder="••••••••" className="glass h-14 rounded-2xl text-lg text-right" value={password} onChange={e => setPassword(e.target.value)} />
                  </div>
                </div>

                {/* خيار المحامي */}
                <div className="p-6 glass rounded-3xl border-white/5 hover:border-primary/20 transition-all cursor-pointer group" onClick={() => setIsProfessional(!isProfessional)}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <Checkbox checked={isProfessional} onCheckedChange={(v) => setIsProfessional(!!v)} className="h-6 w-6 rounded-lg" />
                      <div>
                        <p className="text-sm font-black text-white group-hover:text-primary transition-colors">أنا محامي أو مستشار قانوني</p>
                        <p className="text-[10px] text-white/30 font-bold">يتطلب هذا الخيار رفع وثائق الهوية المهنية للمصادقة.</p>
                      </div>
                    </div>
                    <Gavel className={`h-6 w-6 transition-all ${isProfessional ? 'text-primary' : 'text-white/10'}`} />
                  </div>
                </div>

                {/* حقول المحامي الإضافية */}
                <AnimatePresence>
                  {isProfessional && (
                    <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="space-y-4 overflow-hidden">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label className="text-white/40 text-xs px-2">رقم هاتف العمل (اختياري)</Label>
                          <Input placeholder="رقم المكتب" className="glass h-14 rounded-2xl text-right" value={workPhone} onChange={e => setWorkPhone(e.target.value)} />
                        </div>
                        <div className="space-y-2">
                          <Label className="text-white/40 text-xs px-2">عنوان العمل (إن وجد)</Label>
                          <Input placeholder="المكتب، الشركة..." className="glass h-14 rounded-2xl text-right" value={workAddress} onChange={e => setWorkAddress(e.target.value)} />
                        </div>
                      </div>
                      <div className="bg-amber-500/10 p-4 rounded-2xl border border-amber-500/20">
                        <p className="text-[10px] text-amber-500 font-bold leading-tight flex items-center gap-2">
                          <ShieldCheck className="h-4 w-4" /> سيطلب منك النظام تصوير كارنيه النقابة والبطاقة في الخطوة التالية.
                        </p>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
                
                <SovereignButton 
                  text={isLoading ? "جاري الإنشاء..." : (isProfessional ? "متابعة تصوير الوثائق" : "إنشاء الحساب السيادي")}
                  onClick={handleSignup}
                  disabled={isLoading}
                  icon={isLoading ? <Loader2 className="animate-spin" /> : <ShieldCheck />}
                />
              </motion.div>
            ) : (
              <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }} className="space-y-6">
                <div className="text-center space-y-2 mb-8">
                  <h3 className="text-xl font-black text-primary uppercase tracking-widest">Identity Protocol</h3>
                  <p className="text-xs text-white/30 font-bold">التقط صوراً واضحة لوثائق القيد المهني والبطاقة الشخصية.</p>
                </div>
                <IdCaptureWizard onComplete={(docs) => {
                  setIdDocs(docs);
                  setIsCapturing(false);
                  toast({ title: "تم التوثيق المبدئي ✅", description: "يمكنك الآن إرسال طلب الانضمام." });
                }} />
                <Button variant="ghost" onClick={() => setIsCapturing(false)} className="w-full text-white/20 hover:text-white h-12">إلغاء والعودة للبيانات</Button>
              </motion.div>
            )}
          </AnimatePresence>
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