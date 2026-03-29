
"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { FileText, Download, Search, Info, CheckCircle2, FileType } from "lucide-react";
import { jsPDF } from "jspdf";
import { useToast } from "@/hooks/use-toast";

const LEGAL_TEMPLATES = [
  { id: "1", title: "عقد إيجار سكني", description: "نموذج عقد إيجار موحد للأغراض السكنية متوافق مع القوانين المحلية.", type: "PDF", category: "عقاري" },
  { id: "2", title: "اتفاقية عدم إفصاح (NDA)", description: "حماية المعلومات السرية والتجارية بين طرفين أو أكثر.", type: "Word", category: "تجاري" },
  { id: "3", title: "توكيل قانوني عام", description: "نموذج توكيل رسمي لمتابعة الإجراءات القانونية والقضائية.", type: "PDF", category: "عام" },
  { id: "4", title: "عقد عمل موحد", description: "عقد عمل متوافق مع أنظمة العمل والعمال الحديثة.", type: "PDF", category: "عمالي" },
  { id: "5", title: "مذكرة تفاهم (MoU)", description: "إطار عمل للتعاون المستقبلي بين شركاء العمل.", type: "Word", category: "تجاري" },
  { id: "6", title: "إقرار وتنازل", description: "نموذج إقرار قانوني بالتنازل عن حقوق معينة.", type: "PDF", category: "عام" },
];

export default function TemplatesPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const { toast } = useToast();
  const [fillingData, setFillingData] = useState({ name: "", date: "", idNumber: "", details: "" });
  const [selectedCategory, setSelectedCategory] = useState("الكل");

  const categories = ["الكل", "عقاري", "تجاري", "عام", "عمالي"];

  const filtered = LEGAL_TEMPLATES.filter(t => 
    (t.title.includes(searchTerm) || t.description.includes(searchTerm)) &&
    (selectedCategory === "الكل" || t.category === selectedCategory)
  );

  const handleDownload = (template: typeof LEGAL_TEMPLATES[0]) => {
    if (!fillingData.name || !fillingData.idNumber) {
      toast({ 
        variant: "destructive", 
        title: "بيانات ناقصة", 
        description: "يرجى إدخال اسمك ورقم الهوية لتخصيص النموذج." 
      });
      return;
    }

    // PDF Generation
    const doc = new jsPDF();
    doc.setFont("helvetica");
    doc.text("ALMUSTASHAR LEGAL SERVICES", 70, 20);
    doc.line(20, 25, 190, 25);
    
    doc.text(`Document: ${template.title}`, 20, 40);
    doc.text(`Full Name: ${fillingData.name}`, 20, 50);
    doc.text(`ID Number: ${fillingData.idNumber}`, 20, 60);
    doc.text(`Date: ${fillingData.date || new Date().toLocaleDateString()}`, 20, 70);
    
    doc.text("Details:", 20, 90);
    const splitDetails = doc.splitTextToSize(fillingData.details || "No additional details provided.", 160);
    doc.text(splitDetails, 20, 100);

    doc.text("Signature: ___________________", 20, 250);
    
    doc.save(`${template.title}.pdf`);
    toast({ 
      title: "تم التحميل بنجاح", 
      description: `تم إنشاء وتحميل نموذج ${template.title}.`,
    });
  };

  return (
    <div className="container mx-auto px-4 py-12 text-right" dir="rtl">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
        <div className="space-y-2">
          <h1 className="text-4xl font-headline font-bold text-primary flex items-center gap-3 justify-end">
            النماذج الذكية
            <FileText className="h-10 w-10 text-accent" />
          </h1>
          <p className="text-muted-foreground text-lg">قم بتخصيص وتحميل نماذج قانونية احترافية في ثوانٍ.</p>
        </div>
        <div className="relative w-full md:w-96">
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
          <Input 
            placeholder="ابحث عن اسم النموذج أو الكلمة المفتاحية..." 
            className="pr-10 text-right h-12 rounded-xl"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="flex flex-wrap gap-2 mb-8 justify-end">
        {categories.map(cat => (
          <Button 
            key={cat} 
            variant={selectedCategory === cat ? "default" : "outline"}
            onClick={() => setSelectedCategory(cat)}
            className="rounded-full"
          >
            {cat}
          </Button>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-8 mb-12">
        <div className="lg:col-span-1">
          <Card className="border-accent/20 sticky top-24 shadow-lg">
            <CardHeader className="bg-muted/30">
              <CardTitle className="text-xl flex items-center gap-2 justify-end">
                تخصيص البيانات
                <CheckCircle2 className="h-5 w-5 text-accent" />
              </CardTitle>
              <CardDescription>هذه البيانات ستظهر في النسخة المطبوعة من النموذج</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6 pt-6">
              <div className="space-y-2 text-right">
                <Label>الاسم الكامل للطرف الأول</Label>
                <Input value={fillingData.name} onChange={e => setFillingData({...fillingData, name: e.target.value})} placeholder="أدخل اسمك كما في الهوية" />
              </div>
              <div className="space-y-2 text-right">
                <Label>رقم الهوية / السجل التجاري</Label>
                <Input value={fillingData.idNumber} onChange={e => setFillingData({...fillingData, idNumber: e.target.value})} placeholder="رقم الهوية الوطنية أو السجل" />
              </div>
              <div className="space-y-2 text-right">
                <Label>تاريخ المحرر</Label>
                <Input type="date" value={fillingData.date} onChange={e => setFillingData({...fillingData, date: e.target.value})} />
              </div>
              <div className="space-y-2 text-right">
                <Label>ملاحظات إضافية (اختياري)</Label>
                <Textarea value={fillingData.details} onChange={e => setFillingData({...fillingData, details: e.target.value})} placeholder="أي شروط أو تفاصيل تود إضافتها للنموذج" />
              </div>
            </CardContent>
          </Card>
          <div className="mt-6 bg-accent/5 p-4 rounded-xl flex gap-3 text-sm text-primary items-start border border-accent/20">
            <Info className="h-5 w-5 text-accent shrink-0" />
            <p>جميع النماذج قانونية استرشادية. لضمان أقصى درجات الحماية، يرجى مراجعة أحد مستشارينا عبر صفحة "المستشارون" قبل التوقيع الرسمي.</p>
          </div>
        </div>

        <div className="lg:col-span-2 grid md:grid-cols-2 gap-6 h-fit">
          {filtered.map(template => (
            <Card key={template.id} className="hover:border-accent transition-all hover:shadow-xl shadow-sm border-muted flex flex-col group">
              <CardHeader>
                <div className="flex justify-between items-start mb-2">
                  <div className="bg-primary/10 text-primary px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider flex items-center gap-1">
                    <FileType className="h-3 w-3" />
                    {template.type}
                  </div>
                  <span className="text-[10px] text-accent font-bold px-2 py-1 bg-accent/5 rounded-lg">{template.category}</span>
                </div>
                <CardTitle className="text-xl group-hover:text-accent transition-colors">{template.title}</CardTitle>
                <CardDescription className="text-right leading-relaxed">{template.description}</CardDescription>
              </CardHeader>
              <CardFooter className="mt-auto pt-4 border-t">
                <Button className="w-full gap-2 bg-primary hover:bg-accent text-white transition-colors h-11" onClick={() => handleDownload(template)}>
                  <Download className="h-4 w-4" /> تخصيص وتحميل
                </Button>
              </CardFooter>
            </Card>
          ))}
          {filtered.length === 0 && (
            <div className="col-span-2 py-20 text-center space-y-4 bg-muted/20 rounded-3xl border-2 border-dashed">
              <FileText className="h-12 w-12 text-muted-foreground mx-auto opacity-30" />
              <p className="text-muted-foreground">لا توجد نماذج تطابق بحثك حالياً.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
