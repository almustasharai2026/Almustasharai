
"use client";

import { useUser, useFirestore, useCollection } from "@/firebase";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Users, 
  TrendingUp, 
  ShieldCheck,
  CreditCard,
  Scale,
  Plus,
  Trash2,
  Settings,
  Activity,
  Lock,
  Database,
  CheckCircle,
  XCircle,
  AlertCircle,
  BarChart3,
  FileText
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { collection, deleteDoc, doc, addDoc, updateDoc } from "firebase/firestore";
import { useToast } from "@/hooks/use-toast";
import { useMemoFirebase } from "@/firebase/provider";

export default function AdminDashboard() {
  const { user, isUserLoading } = useUser();
  const db = useFirestore();
  const router = useRouter();
  const { toast } = useToast();
  
  // Admin access check (Hardcoded for current owner email)
  const isAdmin = user?.email === "bishoysamy390@gmail.com";

  // Firestore Queries
  const specQuery = useMemoFirebase(() => collection(db!, "specializations"), [db]);
  const { data: specializations, isLoading: isSpecLoading } = useCollection(specQuery);

  const usersQuery = useMemoFirebase(() => collection(db!, "users"), [db]);
  const { data: allUsers, isLoading: isUsersLoading } = useCollection(usersQuery);

  const [newSpec, setNewSpec] = useState({ name: "", description: "" });

  if (!isUserLoading && !isAdmin) {
    router.push("/dashboard");
    return null;
  }

  const handleAddSpec = async () => {
    if (!newSpec.name) return;
    try {
      await addDoc(collection(db!, "specializations"), {
        ...newSpec,
        createdAt: new Date().toISOString()
      });
      setNewSpec({ name: "", description: "" });
      toast({ title: "تمت الإضافة", description: "تم إضافة التخصص القانوني الجديد بنجاح." });
    } catch (e) {
      toast({ variant: "destructive", title: "خطأ", description: "فشل في الإضافة." });
    }
  };

  const handleDeleteSpec = async (id: string) => {
    try {
      await deleteDoc(doc(db!, "specializations", id));
      toast({ title: "تم الحذف", description: "تم إزالة التخصص بنجاح." });
    } catch (e) {
      toast({ variant: "destructive", title: "خطأ", description: "فشل في الحذف." });
    }
  };

  const handleApprovePayment = async (userId: string, amount: number) => {
    // Mock payment approval logic
    toast({ title: "تم القبول", description: "تم شحن الرصيد للمستخدم بنجاح." });
  };

  return (
    <div className="container mx-auto px-4 py-12 max-w-7xl" dir="rtl">
      {/* Admin Header */}
      <header className="glass-cosmic p-10 rounded-[3rem] flex flex-col md:flex-row justify-between items-center gap-8 mb-12 border-white/5 overflow-hidden relative">
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 blur-[100px] -z-10" />
        <div className="text-right">
          <div className="flex items-center gap-3 justify-end mb-3">
            <Badge className="bg-primary/20 text-primary border-primary/30 px-4 py-1 rounded-full text-xs font-bold">السيادة الكاملة</Badge>
            <h1 className="text-4xl font-black text-white flex items-center gap-4">
               مركز القيادة المركزية
               <Lock className="h-10 w-10 text-primary" />
            </h1>
          </div>
          <p className="text-muted-foreground text-lg">أهلاً بك يا بيشوي. أنت تدير كوكب المستشار الآن.</p>
        </div>
        <div className="flex gap-4">
           <Button variant="outline" className="rounded-2xl glass h-14 px-6 gap-3 border-white/10 hover:bg-white/5">
              <Database className="h-5 w-5" /> إدارة النسخ
           </Button>
           <Button className="cosmic-gradient rounded-2xl px-10 h-14 font-bold shadow-2xl">تصدير التقارير</Button>
        </div>
      </header>

      <Tabs defaultValue="overview" className="space-y-10">
        <TabsList className="glass p-2 rounded-3xl w-full md:w-auto flex overflow-x-auto justify-start border-white/5 gap-2">
          <TabsTrigger value="overview" className="rounded-2xl px-10 py-4 data-[state=active]:bg-primary data-[state=active]:text-white transition-all">
            <BarChart3 className="h-5 w-5 ml-2" /> الإحصائيات الحية
          </TabsTrigger>
          <TabsTrigger value="specialties" className="rounded-2xl px-10 py-4 data-[state=active]:bg-primary transition-all">
            <Scale className="h-5 w-5 ml-2" /> إدارة التخصصات
          </TabsTrigger>
          <TabsTrigger value="payments" className="rounded-2xl px-10 py-4 data-[state=active]:bg-primary transition-all">
            <CreditCard className="h-5 w-5 ml-2" /> طلبات الشحن
          </TabsTrigger>
          <TabsTrigger value="users" className="rounded-2xl px-10 py-4 data-[state=active]:bg-primary transition-all">
            <Users className="h-5 w-5 ml-2" /> إدارة المستخدمين
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-10 animate-in fade-in duration-700">
          <div className="grid md:grid-cols-4 gap-6">
            <StatCard label="إجمالي المستخدمين" value={allUsers?.length || "0"} icon={<Users className="text-indigo-400" />} trend="+8% هذا الشهر" />
            <StatCard label="إيرادات اليوم" value="4,250 EGP" icon={<TrendingUp className="text-emerald-400" />} trend="+15%" />
            <StatCard label="الاستشارات الجارية" value="12" icon={<Activity className="text-cyan-400" />} trend="بث مباشر" />
            <StatCard label="نماذج تم إصدارها" value="1,240" icon={<FileText className="text-amber-400" />} trend="إجمالي" />
          </div>

          <Card className="glass-card border-none rounded-[3rem] p-10">
             <div className="flex items-center justify-between mb-8">
                <Button variant="ghost" className="text-primary font-bold">عرض الكل</Button>
                <h3 className="text-2xl font-bold flex items-center gap-3">آخر العمليات <Activity className="h-6 w-6 text-primary" /></h3>
             </div>
             <div className="space-y-4 opacity-50 text-center py-20 border-2 border-dashed border-white/5 rounded-3xl">
                <AlertCircle className="h-12 w-12 mx-auto mb-4 opacity-20" />
                <p className="text-lg">لا توجد عمليات مريبة حالياً. النظام مستقر.</p>
             </div>
          </Card>
        </TabsContent>

        <TabsContent value="specialties" className="space-y-8 animate-in slide-in-from-bottom-5 duration-700">
          <Card className="glass-card border-none rounded-[3rem]">
            <CardHeader className="p-10 pb-4">
              <CardTitle className="text-3xl font-black">إدارة هيكلية الخبرات</CardTitle>
              <CardDescription className="text-lg opacity-60">تحكم في التصنيفات القانونية المتاحة للجمهور.</CardDescription>
            </CardHeader>
            <CardContent className="p-10 pt-0 space-y-10">
              <div className="flex flex-col md:flex-row gap-4 glass p-6 rounded-[2rem] border-primary/20 bg-primary/5">
                <div className="flex-grow space-y-2">
                  <Input 
                    placeholder="اسم التخصص الجديد (مثلاً: قانون الفضاء)..." 
                    value={newSpec.name}
                    onChange={(e) => setNewSpec({...newSpec, name: e.target.value})}
                    className="bg-transparent border-white/10 text-xl h-14 text-right rounded-2xl"
                  />
                </div>
                <Button onClick={handleAddSpec} className="cosmic-gradient rounded-2xl px-12 h-14 text-lg font-bold shadow-xl">
                  <Plus className="h-6 w-6 ml-2" /> إضافة التخصص
                </Button>
              </div>
              
              <div className="grid md:grid-cols-2 gap-4">
                {isSpecLoading ? (
                  <div className="col-span-2 text-center py-20 opacity-30 animate-pulse">جاري فحص قاعدة البيانات...</div>
                ) : (
                  specializations?.map((spec) => (
                    <div key={spec.id} className="p-8 glass-card rounded-[2rem] flex justify-between items-center group">
                      <div className="flex gap-2">
                        <Button variant="ghost" size="icon" className="h-12 w-12 rounded-xl text-red-500 hover:bg-red-500/10 opacity-0 group-hover:opacity-100 transition-all" onClick={() => handleDeleteSpec(spec.id)}>
                          <Trash2 className="h-6 w-6" />
                        </Button>
                      </div>
                      <div className="text-right">
                        <h4 className="font-bold text-2xl text-white mb-1">{spec.name}</h4>
                        <p className="text-sm opacity-50">{spec.description || "تخصص قانوني معتمد لدى المنصة"}</p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="payments" className="animate-in fade-in duration-700">
          <Card className="glass-card border-none rounded-[3rem] p-10">
            <div className="space-y-8">
              <div className="flex items-center justify-between mb-6">
                <Badge variant="outline" className="text-primary border-primary/20">قيد المراجعة</Badge>
                <h3 className="text-2xl font-black">طلبات التمويل الجارية</h3>
              </div>
              {[1, 2].map((i) => (
                <div key={i} className="p-8 glass rounded-[2.5rem] flex flex-col md:flex-row justify-between items-center gap-8 border-white/5 hover:bg-white/5 transition-all">
                  <div className="flex gap-4">
                    <Button onClick={() => handleApprovePayment('uid', 500)} className="bg-emerald-600 hover:bg-emerald-700 rounded-2xl px-10 h-14 font-bold shadow-lg shadow-emerald-500/20">
                       <CheckCircle className="h-5 w-5 ml-2" /> قبول العملية
                    </Button>
                    <Button variant="outline" className="text-red-500 border-red-500/20 hover:bg-red-500/10 rounded-2xl px-10 h-14 font-bold">
                       <XCircle className="h-5 w-5 ml-2" /> رفض
                    </Button>
                  </div>
                  <div className="text-right flex items-center gap-6">
                    <div className="text-right">
                      <h4 className="font-black text-2xl text-white">{i === 1 ? "أحمد محمد" : "سارة علي"}</h4>
                      <p className="text-primary font-black text-xl">{i * 750} EGP</p>
                      <p className="text-xs opacity-40 mt-1">محفظة رقم: 01020030405</p>
                    </div>
                    <div className="h-20 w-20 glass rounded-2xl flex items-center justify-center border-white/10 overflow-hidden">
                       <img src="https://picsum.photos/seed/payment/100/100" alt="receipt" className="object-cover opacity-50 hover:opacity-100 transition-all cursor-pointer" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="users" className="animate-in fade-in duration-700">
           <Card className="glass-card border-none rounded-[3rem] p-10 overflow-hidden">
              <div className="relative overflow-x-auto">
                <table className="w-full text-right text-lg">
                  <thead className="text-muted-foreground border-b border-white/5 uppercase">
                    <tr>
                      <th className="px-6 py-4 font-bold">الاسم</th>
                      <th className="px-6 py-4 font-bold">البريد</th>
                      <th className="px-6 py-4 font-bold">الرصيد</th>
                      <th className="px-6 py-4 font-bold">الحالة</th>
                      <th className="px-6 py-4 font-bold">إجراءات</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {allUsers?.map((u) => (
                      <tr key={u.id} className="hover:bg-white/5 transition-all">
                        <td className="px-6 py-6 font-bold">{u.fullName || "مستخدم جديد"}</td>
                        <td className="px-6 py-6 opacity-60">{u.email}</td>
                        <td className="px-6 py-6 text-primary font-black">{u.balance || 0} EGP</td>
                        <td className="px-6 py-6">
                          <Badge className="bg-emerald-500/20 text-emerald-500 border-none">نشط</Badge>
                        </td>
                        <td className="px-6 py-6">
                          <Button variant="ghost" className="text-red-400 hover:bg-red-400/10 rounded-xl">حظر</Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
           </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

function StatCard({ label, value, icon, trend }: any) {
  return (
    <Card className="glass-card border-none rounded-[2rem] p-8 flex items-center justify-between relative overflow-hidden group">
      <div className="absolute -top-10 -right-10 w-32 h-32 bg-primary/5 blur-3xl rounded-full" />
      <div className="h-20 w-20 glass rounded-2xl flex items-center justify-center text-4xl shadow-2xl border-white/10 bg-white/5 relative z-10 transition-transform group-hover:scale-110">
        {icon}
      </div>
      <div className="text-right relative z-10">
        <p className="text-xs text-muted-foreground font-black uppercase mb-2 tracking-widest opacity-60">{label}</p>
        <p className="text-4xl font-black text-white">{value}</p>
        <Badge className="bg-emerald-500/10 text-emerald-500 border-none text-[10px] mt-3 py-1 px-3 rounded-full">{trend}</Badge>
      </div>
    </Card>
  );
}
