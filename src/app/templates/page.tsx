"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Download, Search, BookOpen, Scale, Wallet, Loader2, FileType, FileText, CheckCircle2 } from "lucide-react";
import { jsPDF } from "jspdf";
import { useToast } from "@/hooks/use-toast";
import { useUser, useFirestore, useDoc } from "@/firebase";
import { doc, updateDoc, increment } from "firebase/firestore";
import { useRouter } from "next/navigation";
import { useMemoFirebase } from "@/firebase/provider";
import { motion, AnimatePresence } from "framer-motion";
import { ScrollArea } from "@/components/ui/scroll-area";

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
  { id: "9", title: "اتفاقية صلح وتنازل", description: "لإنهاء النزاعات القضائية ودياً وتوثيق التنازل عن الحقوق أمام المحكمة.", category: "مدني" },
  { id: "10", title: "لائحة اعتراضية (استئناف)", description: "نموذج مهني للطعن على الأحكام الابتدائية أمام محاكم الاستئناف.", category: "قضائي" },
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

  const categories = ["الكل", "عقاري", "تجاري", "أحوال شخصية", "عمالي", "قضائي", "مدني"];

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
      toast({
        variant: "destructive",
        title: "الرصيد غير كافٍ",
        description: `تكلفة إصدار هذا النموذج ${TEMPLATE_PRICE} EGP. رصيدك الحالي: ${currentBalance} EGP.`,
      });
      router.push("/pricing");
      return;
    }

    setIsProcessing(template.id);
    try {
      if (profile?.role !== 'admin') {
        await updateDoc(doc(db!, "users", user.uid), {
          balance: increment(-TEMPLATE_PRICE)
        });
      }

      const pdf = new jsPDF();
      pdf.setFont("helvetica", "bold");
      pdf.text("ALMUSTASHAR AI - PRO LEGAL DOCUMENT", 105, 20, { align: "center" });
      pdf.line(20, 25, 190, 25);
      
      pdf.setFontSize(14);
      pdf.text(`Document Type: ${template.title}`, 20, 45);
      pdf.text(`Sovereign Beneficiary: ${data.name}`, 20, 60);
      pdf.text(`National ID / Passport: ${data.idNumber}`, 20, 75);
      
      pdf.setFontSize(12);
      pdf.text("Legal Clauses & Custom Provisions:", 20, 95);
      pdf.setFont("helvetica", "normal");
      const splitText = pdf.splitTextToSize(data.details || "Standard legal clauses applied as per national regulations. All parties mentioned are liable under current jurisdiction.", 170);
      pdf.text(splitText, 20, 105);
      
      pdf.text(`Issue Date: ${new Date().toLocaleDateString('ar-EG')}`, 20, 280);
      pdf.text("Certified by Almustashar AI Core System", 105, 285, { align: "center" });
      
      pdf.save(`${template.title.replace(/\s/g, '_')}_certified.pdf`);
      
      toast({ 
        title: "تم إصدار الوثيقة", 
        description: `تم خصم ${TEMPLATE_PRICE} EGP بنجاح. الوثيقة جاهزة في مجلد التنزيلات.` 
      });
    } catch (e) {
      toast({ variant: "destructive", title: "خطأ في معالجة الوثيقة", description: "فشل النظام في توليد الملف، يرجى المحاولة لاحقاً." });
    } finally {
      setIsProcessing(null);
    }
  };

  return (
    <div className="container mx-auto px-6 py-20 max-w-7xl text-right" dir="rtl">
      <header className="mb-24 space-y-6 relative">
        <div className="absolute -top-20 right-0 w-64 h-64 bg-primary/10 blur-[120px] -z-10" />
        <div className="flex items-center gap-6 justify-end">
           <div className="h-px flex-grow bg-white/5" />
           <div className="h-16 w-16 glass-cosmic rounded-2xl flex items-center justify-center text-primary border-primary/20 shadow-2xl">
              <BookOpen className="h-8 w-8" />
           </div>
        </div>
        <h1 className="text-5xl md:text-7xl font-black text-white tracking-tighter">المكتبة <span className="text-gradient">السيادية</span></h1>
        <p className="text-xl md:text-2xl text-white/30 font-bold max-w-3xl ml-auto leading-relaxed">أكبر أرشيف عربي للنماذج القانونية المعتمدة، جاهزة للتخصيص الفوري بأمان سيادي مطلق.</p>
      </header>

      <div className="grid lg:grid-cols-12 gap-12">
        {/* Forms Config Side */}
        <div className="lg:col-span-4 space-y-8">
          <Card className="glass-cosmic border-none rounded-[4rem] overflow-hidden sticky top-32 shadow-2xl">
            <CardHeader className="bg-white/[0.02] border-b border-white/5 p-10">
              <CardTitle className="text-2xl font-black flex items-center gap-4 justify-end text-white">
                مخصص الوثائق <FileType className="h-6 w-6 text-primary" />
              </CardTitle>
              <CardDescription className="text-right text-white/30 font-bold">املأ البيانات لتضمينها في صلب الوثيقة.</CardDescription>
            </CardHeader>
            <CardContent className="p-10 space-y-8">
              <div className="bg-primary/5 p-6 rounded-3xl border border-primary/20 flex items-center justify-between">
                 <div className="h-12 w-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary shadow-inner">
                    <Wallet className="h-6 w-6" />
                 </div>
                 <div className="text-left">
                    <p className="text-[9px] text-white/20 font-black uppercase mb-1 tracking-widest">رصيدك المتاح</p>
                    <p className="text-2xl font-black text-white tabular-nums">{profile?.balance || 0} <span className="text-xs text-primary">EGP</span></p>
                 </div>
              </div>
              <div className="space-y-3">
                <Label className="text-white/40 text-xs px-2 font-bold">الاسم الكامل رباعي</Label>
                <Input value={data.name} onChange={e => setData({...data, name: e.target.value})} className="glass border-white/10 h-14 rounded-2xl text-lg font-bold" placeholder="أدخل اسمك كما في الهوية" />
              </div>
              <div className="space-y-3">
                <Label className="text-white/40 text-xs px-2 font-bold">رقم الهوية / السجل التجاري</Label>
                <Input value={data.idNumber} onChange={e => setData({...data, idNumber: e.target.value})} className="glass border-white/10 h-14 rounded-2xl text-lg font-black tracking-widest text-center" placeholder="١٤ رقم" />
              </div>
              <div className="space-y-3">
                <Label className="text-white/40 text-xs px-2 font-bold">بنود خاصة (اختياري)</Label>
                <Textarea value={data.details} onChange={e => setData({...data, details: e.target.value})} className="glass border-white/10 min-h-[180px] rounded-2xl p-5 text-sm font-medium leading-relaxed" placeholder="أضف أي تفاصيل أو اشتراطات تود دمجها في صياغة العقد..." />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Templates Catalog */}
        <div className="lg:col-span-8 space-y-10">
          <div className="flex flex-col md:flex-row gap-6 items-center glass-cosmic p-3 rounded-[2.5rem] border-white/5">
              <div className="relative w-full md:w-96 group">
                <Search className="absolute right-5 top-1/2 -translate-y-1/2 h-5 w-5 text-white/20 group-focus-within:text-primary transition-colors" />
                <Input 
                  placeholder="ابحث في الأرشيف السيادي..." 
                  className="pr-14 bg-transparent border-none h-14 rounded-2xl text-xl font-bold placeholder:text-white/10"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <div className="h-10 w-px bg-white/5 hidden md:block" />
              <ScrollArea className="flex-grow px-2" dir="rtl">
                <div className="flex gap-2 p-1">
                  {categories.map(cat => (
                    <Button 
                      key={cat} 
                      variant={activeCategory === cat ? "default" : "ghost"}
                      onClick={() => setActiveCategory(cat)}
                      className={`rounded-xl px-6 h-11 text-xs font-black transition-all ${activeCategory === cat ? 'bg-primary text-white shadow-xl shadow-primary/20' : 'text-white/30 hover:bg-white/5'}`}
                    >
                      {cat}
                    </Button>
                  ))}
                </div>
              </ScrollArea>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {filtered.map(t => (
              <motion.div 
                layout
                key={t.id}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="h-full"
              >
                <Card className="glass-cosmic border-none rounded-[3.5rem] group hover:border-primary/30 transition-all flex flex-col h-full relative overflow-hidden shadow-2xl">
                  <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-primary/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                  <CardHeader className="p-10 pb-6">
                    <div className="flex justify-between items-start mb-6">
                      <Badge className="bg-primary/10 text-primary border-none text-[10px] px-4 py-1 font-black rounded-full uppercase tracking-tighter">{t.category}</Badge>
                      <FileType className="h-8 w-8 opacity-10 group-hover:opacity-100 transition-all text-primary" />
                    </div>
                    <CardTitle className="text-2xl font-black text-white leading-tight group-hover:text-primary transition-colors">{t.title}</CardTitle>
                    <CardDescription className="text-right leading-relaxed mt-4 opacity-40 font-medium line-clamp-3">{t.description}</CardDescription>
                  </CardHeader>
                  <CardFooter className="p-10 pt-8 border-t border-white/5 mt-auto flex flex-col gap-4">
                    <div className="flex items-center justify-between w-full px-2 mb-2">
                       <span className="text-[10px] text-white/20 font-black uppercase tracking-widest">تكلفة الإصدار</span>
                       <span className="text-xl font-black text-primary tabular-nums">{TEMPLATE_PRICE} EGP</span>
                    </div>
                    <Button 
                      className="w-full btn-primary h-16 rounded-[1.8rem] gap-4 text-lg font-black shadow-2xl group/btn overflow-hidden relative" 
                      onClick={() => handleDownload(t)}
                      disabled={isProcessing === t.id}
                    >
                      <span className="relative z-10 flex items-center gap-3">
                        {isProcessing === t.id ? (
                          <Loader2 className="h-6 w-6 animate-spin" />
                        ) : (
                          <>
                            <Download className="h-6 w-6 group-hover/btn:translate-y-1 transition-transform" /> إصدار فوري معتمد
                          </>
                        )}
                      </span>
                      <div className="absolute inset-0 bg-white/10 translate-y-full group-hover/btn:translate-y-0 transition-transform duration-500" />
                    </Button>
                  </CardFooter>
                </Card>
              </motion.div>
            ))}
          </div>
          
          {filtered.length === 0 && (
            <div className="py-40 text-center space-y-10 grayscale opacity-20">
               <FileType className="h-32 w-32 mx-auto" />
               <p className="text-3xl font-black">لم نجد وثائق تطابق بحثك</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}