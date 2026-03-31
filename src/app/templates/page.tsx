"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Download, Search, BookOpen, Wallet, Loader2, FileType, FileText, CheckCircle2, ChevronLeft } from "lucide-react";
import { jsPDF } from "jspdf";
import { useToast } from "@/hooks/use-toast";
import { useUser, useFirestore, useDoc } from "@/firebase";
import { doc, updateDoc, increment } from "firebase/firestore";
import { useRouter } from "next/navigation";
import { useMemoFirebase } from "@/firebase/provider";
import { motion, AnimatePresence } from "framer-motion";
import { ScrollArea } from "@/components/ui/scroll-area";
import SovereignButton from "@/components/SovereignButton";

const TEMPLATE_PRICE = 25;

const TEMPLATES = [
  { id: "1", title: "عقد إيجار سكني موحد", description: "نموذج قانوني متوافق مع تعديلات قانون الإيجار الجديد وحماية حقوق الطرفين.", category: "عقاري" },
  { id: "2", title: "اتفاقية عدم إفصاح (NDA)", description: "حماية كاملة للأسرار التجارية، البيانات الحساسة، والملكية الفكرية للمؤسسات.", category: "تجاري" },
  { id: "3", title: "توكيل قانوني عام", description: "صيغة رسمية شاملة للتمثيل أمام الجهات الحكومية، البنوك، والمحاكم.", category: "عام" },
  { id: "4", title: "عقد عمل قطاع خاص", description: "نموذج متكامل يحفظ حقوق العامل وصاحب العمل حسب قانون العمل الموحد.", category: "عمالي" },
  { id: "5", title: "مذكرة تفاهم (MoU)", description: "تحديد أطر التعاون المبدئي والشراكات الاستراتيجية بين الكيانات التجارية.", category: "تجاري" },
  { id: "6", title: "عريضة دعوى طلاق للضرر", description: "الصيغة القانونية المعتمدة لمحاكم الأسرة لرفع دعاوى الطلاق للضرر.", category: "أحوال شخصية" },
  { id: "7", title: "عقد تأسيس شركة LLC", description: "نموذج تأسيس شركة ذات مسؤولية محدودة حسب اشتراطات وزارة التجارة.", category: "تجاري" },
  { id: "8", title: "إنذار رسمي على يد محضر", description: "صيغة الإنذار القانوني الرسمي لمطالبة مالية أو إخلاء عقار.", category: "قضائي" },
];

export default function SupremeTemplatesLibrary() {
  const { user } = useUser();
  const db = useFirestore();
  const router = useRouter();
  const { toast } = useToast();
  
  const [searchTerm, setSearchTerm] = useState("");
  const [data, setData] = useState({ name: "", idNumber: "", details: "" });
  const [activeCategory, setActiveCategory] = useState("الكل");
  const [isProcessing, setIsProcessing] = useState<string | null>(null);

  const userDocRef = useMemoFirebase(() => user ? doc(db!, "users", user.uid) : null, [db, user]);
  const { data: profile } = useDoc(userDocRef as any);

  const categories = ["الكل", "عقاري", "تجاري", "أحوال شخصية", "عمالي", "قضائي"];

  const filtered = TEMPLATES.filter(t => 
    (t.title.includes(searchTerm)) && (activeCategory === "الكل" || t.category === activeCategory)
  );

  const handleDownload = async (template: typeof TEMPLATES[0]) => {
    if (!user) {
      toast({ variant: "destructive", title: "سيادة المستخدم، يرجى الدخول", description: "يجب تسجيل الدخول لإصدار الوثائق القانونية المعتمدة." });
      router.push("/auth/login");
      return;
    }

    if (!data.name || !data.idNumber) {
      toast({ variant: "destructive", title: "بيانات الهوية ناقصة", description: "يرجى إكمال الاسم رباعي ورقم الهوية الوطنية للمصادقة." });
      return;
    }

    const currentBalance = profile?.balance || 0;
    if (currentBalance < TEMPLATE_PRICE && profile?.role !== 'admin') {
      toast({ variant: "destructive", title: "الرصيد غير كافٍ", description: `تكلفة الإصدار ${TEMPLATE_PRICE} EGP. رصيدك الحالي: ${currentBalance} EGP.` });
      router.push("/pricing");
      return;
    }

    setIsProcessing(template.id);
    try {
      if (profile?.role !== 'admin') {
        await updateDoc(doc(db!, "users", user.uid), { balance: increment(-TEMPLATE_PRICE) });
      }

      const pdf = new jsPDF();
      pdf.setFont("helvetica", "bold");
      pdf.text("ALMUSTASHAR AI - CERTIFIED DOCUMENT", 105, 20, { align: "center" });
      pdf.line(20, 25, 190, 25);
      pdf.setFontSize(14);
      pdf.text(`Type: ${template.title}`, 20, 45);
      pdf.text(`Beneficiary: ${data.name}`, 20, 60);
      pdf.text(`ID: ${data.idNumber}`, 20, 75);
      pdf.save(`${template.title.replace(/\s/g, '_')}_certified.pdf`);
      toast({ title: "تم إصدار الوثيقة بنجاح ✅" });
    } catch (e) {
      toast({ variant: "destructive", title: "فشل البروتوكول" });
    } finally {
      setIsProcessing(null);
    }
  };

  return (
    <div className="min-h-screen bg-[#f8f9fc] dark:bg-[#02040a] text-slate-900 dark:text-white p-8 lg:p-20 font-sans" dir="rtl">
      <header className="max-w-7xl mx-auto mb-24 relative">
        <div className="absolute -top-40 right-0 w-[600px] h-[600px] bg-primary/5 blur-[200px] -z-10" />
        <div className="flex flex-col md:flex-row items-start md:items-end justify-between gap-12 text-right">
          <div className="space-y-6">
            <div className="sovereign-badge">
               <BookOpen className="h-3 w-3" /> الأرشيف القانوني السيادي
            </div>
            <h1 className="text-6xl md:text-8xl font-black text-slate-900 dark:text-white tracking-tighter leading-none">
              مكتبة <br /><span className="text-gradient">الوثائق</span>
            </h1>
          </div>
          <div className="relative w-full md:w-[450px]">
            <Search className="absolute right-6 top-1/2 -translate-y-1/2 h-6 w-6 text-slate-400 dark:text-white/20" />
            <Input 
              placeholder="ابحث في المكتبة السيادية..." 
              className="bg-white dark:bg-white/5 border-border dark:border-white/5 h-20 rounded-[2rem] pr-16 text-xl font-bold placeholder:text-slate-300 dark:placeholder:text-white/10 shadow-3xl text-right"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto grid lg:grid-cols-12 gap-12">
        {/* Config Panel */}
        <aside className="lg:col-span-4 space-y-8">
          <Card className="rounded-[3.5rem] border-none shadow-2xl bg-white dark:bg-slate-900/80 p-10 sticky top-32">
            <div className="space-y-8">
              <div className="flex items-center gap-4 text-right">
                <div className="h-12 w-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary shadow-inner border border-primary/10">
                  <FileText className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="text-xl font-black">بيانات المصادقة</h3>
                  <p className="text-[10px] text-muted-foreground font-black uppercase tracking-widest mt-1">Sovereign Meta-Data</p>
                </div>
              </div>

              <div className="space-y-6">
                <div className="space-y-2">
                  <Label className="px-4 text-[10px] font-black text-muted-foreground uppercase tracking-widest">الاسم رباعي</Label>
                  <Input value={data.name} onChange={e => setData({...data, name: e.target.value})} className="h-14 rounded-2xl bg-slate-50 dark:bg-white/5 border-border dark:border-white/5 font-bold" />
                </div>
                <div className="space-y-2">
                  <Label className="px-4 text-[10px] font-black text-muted-foreground uppercase tracking-widest">رقم الهوية</Label>
                  <Input value={data.idNumber} onChange={e => setData({...data, idNumber: e.target.value})} className="h-14 rounded-2xl bg-slate-50 dark:bg-white/5 border-border dark:border-white/5 font-black tracking-widest text-center" />
                </div>
              </div>

              <div className="pt-6 border-t border-border dark:border-white/5">
                 <div className="flex justify-between items-center bg-slate-50 dark:bg-black/20 p-5 rounded-3xl shadow-inner">
                    <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">رصيدك</span>
                    <span className="text-2xl font-black text-primary tabular-nums">{profile?.balance || 0} EGP</span>
                 </div>
              </div>
            </div>
          </Card>
        </aside>

        {/* Catalog */}
        <main className="lg:col-span-8 space-y-10">
          <ScrollArea className="w-full pb-4" dir="rtl">
            <div className="flex gap-3">
              {categories.map(cat => (
                <button
                  key={cat}
                  onClick={() => setActiveCategory(cat)}
                  className={`px-8 py-3 rounded-2xl text-xs font-black uppercase tracking-widest transition-all ${
                    activeCategory === cat 
                      ? 'bg-primary text-white shadow-xl shadow-primary/20 scale-105' 
                      : 'bg-white dark:bg-white/5 text-muted-foreground hover:text-primary border border-border dark:border-white/5'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </ScrollArea>

          <div className="grid md:grid-cols-2 gap-8">
            {filtered.map((t, i) => (
              <motion.div key={t.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
                <Card className="rounded-[3rem] border-none shadow-xl bg-white dark:bg-slate-900/80 p-10 group hover:bg-slate-50 dark:hover:bg-slate-900 transition-all border border-transparent hover:border-primary/20 h-full flex flex-col">
                  <div className="flex justify-between items-start mb-8">
                    <Badge className="bg-primary/10 text-primary border-none px-4 font-black uppercase text-[9px] tracking-widest">{t.category}</Badge>
                    <FileType className="h-8 w-8 text-primary opacity-10 group-hover:opacity-100 transition-all" />
                  </div>
                  <h3 className="text-2xl font-black mb-4 leading-tight">{t.title}</h3>
                  <p className="text-sm text-muted-foreground font-medium leading-relaxed mb-10 flex-grow">{t.description}</p>
                  <SovereignButton 
                    text={isProcessing === t.id ? "جاري الإصدار..." : "إصدار فوري معتمد"} 
                    onClick={() => handleDownload(t)}
                    disabled={isProcessing === t.id}
                    className="h-16 rounded-2xl text-lg shadow-primary/10"
                    icon={isProcessing === t.id ? <Loader2 className="animate-spin" /> : <Download />}
                  />
                </Card>
              </motion.div>
            ))}
          </div>
        </main>
      </div>
    </div>
  );
}