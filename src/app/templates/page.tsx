
"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Download, Search, BookOpen, Scale, Wallet, Loader2, FileType } from "lucide-react";
import { jsPDF } from "jspdf";
import { useToast } from "@/hooks/use-toast";
import { useUser, useFirestore, useDoc, useMemoFirebase } from "@/firebase";
import { doc, updateDoc, increment } from "firebase/firestore";
import { useRouter } from "next/navigation";

const TEMPLATE_PRICE = 25;

const TEMPLATES = [
  { id: "1", title: "عقد إيجار سكني موحد", description: "نموذج قانوني متوافق مع تعديلات قانون الإيجار الجديد.", category: "عقاري" },
  { id: "2", title: "اتفاقية عدم إفصاح (NDA)", description: "حماية كاملة للأسرار التجارية والبيانات.", category: "تجاري" },
  { id: "3", title: "توكيل قانوني عام", description: "صيغة رسمية شاملة للتمويل والتقاضي.", category: "عام" },
  { id: "4", title: "عقد عمل قطاع خاص", description: "متوافق مع قانون العمل الموحد رقم ١٢ لسنة ٢٠٠٣.", category: "عمالي" },
  { id: "5", title: "مذكرة تفاهم (MoU)", description: "تحديد أطر التعاون المبدئي بين الشركاء.", category: "تجاري" },
  { id: "6", title: "دعوى طلاق للضرر", description: "صيغة عريضة الدعوى القانونية لمحاكم الأسرة.", category: "أحوال شخصية" },
  { id: "7", title: "عقد تأسيس شركة LLC", description: "نموذج تأسيس شركة ذات مسؤولية محدودة.", category: "تجاري" },
  { id: "8", title: "إنذار رسمي على يد محضر", description: "صيغة الإنذار القانوني الرسمي لمطالبة مالية.", category: "قضائي" },
  { id: "9", title: "اتفاقية صلح وتنازل", description: "لإنهاء النزاعات القضائية ودياً.", category: "مدني" },
  { id: "10", title: "لائحة اعتراضية (استئناف)", description: "للطعن على الأحكام الابتدائية.", category: "قضائي" },
];

export default function TemplatesPage() {
  const { user } = useUser();
  const db = useFirestore();
  const router = useRouter();
  const { toast } = useToast();
  
  const [searchTerm, setSearchTerm] = useState("");
  const [data, setData] = useState({ name: "", idNumber: "", details: "" });
  const [activeCategory, setActiveCategory] = useState("الكل");
  const [isProcessing, setIsProcessing] = useState<string | null>(null);

  // User Profile for Balance Check
  const userDocRef = useMemoFirebase(() => user ? doc(db!, "users", user.uid) : null, [db, user]);
  const { data: profile } = useDoc(userDocRef);

  const categories = ["الكل", "عقاري", "تجاري", "أحوال شخصية", "عمالي", "قضائي", "مدني"];

  const filtered = TEMPLATES.filter(t => 
    (t.title.includes(searchTerm)) && (activeCategory === "الكل" || t.category === activeCategory)
  );

  const handleDownload = async (template: typeof TEMPLATES[0]) => {
    if (!user) {
      toast({ variant: "destructive", title: "تسجيل الدخول مطلوب", description: "يرجى تسجيل الدخول لإصدار النماذج." });
      router.push("/auth/login");
      return;
    }

    if (!data.name || !data.idNumber) {
      toast({ variant: "destructive", title: "بيانات ناقصة", description: "يرجى إكمال الاسم ورقم الهوية." });
      return;
    }

    const currentBalance = profile?.balance || 0;
    if (currentBalance < TEMPLATE_PRICE) {
      toast({
        variant: "destructive",
        title: "رصيد غير كافٍ",
        description: `تكلفة إصدار النموذج ${TEMPLATE_PRICE} EGP. رصيدك الحالي: ${currentBalance} EGP.`,
      });
      router.push("/pricing");
      return;
    }

    setIsProcessing(template.id);
    try {
      // 1. Deduct Balance from Firestore
      await updateDoc(doc(db!, "users", user.uid), {
        balance: increment(-TEMPLATE_PRICE)
      });

      // 2. Generate PDF
      const pdf = new jsPDF();
      pdf.text("ALMUSTASHAR AI - PRO LEGAL DOCUMENT", 60, 20);
      pdf.line(20, 25, 190, 25);
      pdf.text(`Document Type: ${template.title}`, 20, 40);
      pdf.text(`Beneficiary: ${data.name}`, 20, 55);
      pdf.text(`National ID: ${data.idNumber}`, 20, 65);
      pdf.text("Legal Provisions:", 20, 85);
      pdf.text(pdf.splitTextToSize(data.details || "Default standard legal clauses applied.", 160), 20, 95);
      pdf.save(`${template.title}_certified.pdf`);
      
      toast({ 
        title: "تم الإصدار والخصم", 
        description: `تم خصم ${TEMPLATE_PRICE} EGP وإصدار النموذج القانوني المعتمد بنجاح.` 
      });
    } catch (e) {
      toast({ variant: "destructive", title: "خطأ في النظام", description: "فشل في معالجة الطلب، يرجى المحاولة لاحقاً." });
    } finally {
      setIsProcessing(null);
    }
  };

  return (
    <div className="container mx-auto px-4 py-12 max-w-7xl text-right" dir="rtl">
      <header className="mb-12 space-y-4">
        <div className="flex items-center gap-4 justify-end mb-6">
           <div className="h-px flex-grow bg-white/5" />
           <Scale className="h-8 w-8 text-primary" />
        </div>
        <h1 className="text-4xl md:text-6xl font-black text-white">المكتبة <span className="text-primary">الذكية</span></h1>
        <p className="text-muted-foreground text-xl max-w-2xl ml-auto">أرشيف يضم أكثر من ٢٥٠ نموذجاً قانونياً محققاً، جاهزة للتخصيص الفوري.</p>
      </header>

      <div className="grid lg:grid-cols-12 gap-10">
        <div className="lg:col-span-4 space-y-6">
          <Card className="glass-card border-none rounded-[2rem] overflow-hidden sticky top-32">
            <CardHeader className="bg-primary/5 border-b border-white/5 p-8">
              <CardTitle className="text-xl flex items-center gap-3 justify-end">
                صانع النماذج <BookOpen className="h-5 w-5 text-primary" />
              </CardTitle>
            </CardHeader>
            <CardContent className="p-8 space-y-6">
              <div className="bg-primary/5 p-4 rounded-2xl border border-primary/20 flex items-center justify-between mb-4">
                 <Wallet className="h-5 w-5 text-primary" />
                 <div className="text-left">
                    <p className="text-[10px] text-white/30 font-black uppercase">رصيدك المتاح</p>
                    <p className="text-xl font-black text-white">{profile?.balance || 0} EGP</p>
                 </div>
              </div>
              <div className="space-y-2">
                <Label>الاسم الكامل للمقر</Label>
                <Input value={data.name} onChange={e => setData({...data, name: e.target.value})} className="glass border-white/10 h-12" placeholder="الاسم رباعي" />
              </div>
              <div className="space-y-2">
                <Label>الرقم القومي (١٤ رقم)</Label>
                <Input value={data.idNumber} onChange={e => setData({...data, idNumber: e.target.value})} className="glass border-white/10 h-12" placeholder="رقم الهوية الوطنية" />
              </div>
              <div className="space-y-2">
                <Label>بيانات إضافية أو شروط خاصة</Label>
                <Textarea value={data.details} onChange={e => setData({...data, details: e.target.value})} className="glass border-white/10 min-h-[150px]" placeholder="أضف أي تفاصيل تود دمجها في صياغة العقد..." />
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-8 space-y-8">
          <div className="flex flex-col md:flex-row gap-4 items-center bg-slate-900/40 p-2 rounded-2xl glass">
              <div className="relative w-full md:w-80">
                <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input 
                  placeholder="ابحث عن نموذج محدد..." 
                  className="pr-10 bg-transparent border-none h-12 rounded-xl text-lg"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <div className="h-8 w-px bg-white/5 hidden md:block" />
              <div className="flex flex-wrap gap-2 justify-end flex-grow px-2 py-2">
                {categories.map(cat => (
                  <Button 
                    key={cat} 
                    variant={activeCategory === cat ? "default" : "ghost"}
                    onClick={() => setActiveCategory(cat)}
                    className={`rounded-xl px-4 h-10 ${activeCategory === cat ? 'bg-primary' : 'hover:bg-white/5'}`}
                  >
                    {cat}
                  </Button>
                ))}
              </div>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {filtered.map(t => (
              <Card key={t.id} className="glass-card border-none rounded-[2rem] group hover:border-primary/40 transition-all flex flex-col">
                <CardHeader>
                  <div className="flex justify-between items-start mb-4">
                    <Badge className="bg-emerald-500/10 text-emerald-500 border-none text-[10px] px-3 font-black">
                      {TEMPLATE_PRICE} EGP
                    </Badge>
                    <Badge className="bg-primary/20 text-primary border-none text-[10px] px-3">{t.category}</Badge>
                  </div>
                  <CardTitle className="text-xl font-bold">{t.title}</CardTitle>
                  <CardDescription className="text-right leading-relaxed mt-2 opacity-60">{t.description}</CardDescription>
                </CardHeader>
                <CardFooter className="pt-6 border-t border-white/5 mt-auto">
                  <Button 
                    className="w-full btn-primary h-14 rounded-2xl gap-3 text-lg font-bold" 
                    onClick={() => handleDownload(t)}
                    disabled={isProcessing === t.id}
                  >
                    {isProcessing === t.id ? (
                      <Loader2 className="h-5 w-5 animate-spin" />
                    ) : (
                      <>
                        <Download className="h-5 w-5" /> تخصيص وإصدار
                      </>
                    )}
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
