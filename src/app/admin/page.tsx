
"use client";

import { useUser, useFirestore, useCollection } from "@/firebase";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  LineChart,
  Line
} from "recharts";
import { 
  Users, 
  Scale,
  Plus,
  Trash2,
  Database,
  CheckCircle,
  Activity,
  Loader2,
  ShieldCheck,
  UserPlus,
  Wallet,
  Settings2,
  Gavel,
  XCircle
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { collection, deleteDoc, doc, addDoc, updateDoc, increment, query, orderBy } from "firebase/firestore";
import { useToast } from "@/hooks/use-toast";
import { useMemoFirebase } from "@/firebase/provider";

const chartData = [
  { name: "السبت", users: 400, consultations: 240 },
  { name: "الأحد", users: 300, consultations: 139 },
  { name: "الإثنين", users: 200, consultations: 980 },
  { name: "الثلاثاء", users: 278, consultations: 390 },
  { name: "الأربعاء", users: 189, consultations: 480 },
  { name: "الخميس", users: 239, consultations: 380 },
  { name: "الجمعة", users: 349, consultations: 430 },
];

export default function AdminDashboard() {
  const { user, isUserLoading } = useUser();
  const db = useFirestore();
  const router = useRouter();
  const { toast } = useToast();
  
  const isAdmin = user?.email === "bishoysamy390@gmail.com";

  // Queries
  const usersQuery = useMemoFirebase(() => collection(db!, "users"), [db]);
  const { data: allUsers } = useCollection(usersQuery);

  const consultantQuery = useMemoFirebase(() => collection(db!, "consultantProfiles"), [db]);
  const { data: consultants } = useCollection(consultantQuery);

  const paymentQuery = useMemoFirebase(() => query(collection(db!, "paymentRequests"), orderBy("createdAt", "desc")), [db]);
  const { data: paymentRequests } = useCollection(paymentQuery);

  // States
  const [newConsultant, setNewConsultant] = useState({ name: "", specialty: "", hourlyRate: "", bio: "", image: "" });
  const [isProcessing, setIsProcessing] = useState<string | null>(null);

  if (!isUserLoading && !isAdmin) {
    router.push("/dashboard");
    return null;
  }

  const handleAddConsultant = async () => {
    if (!newConsultant.name || !newConsultant.specialty) return;
    try {
      await addDoc(collection(db!, "consultantProfiles"), {
        ...newConsultant,
        hourlyRate: Number(newConsultant.hourlyRate),
        rating: 5.0,
        reviews: 0,
        createdAt: new Date().toISOString()
      });
      setNewConsultant({ name: "", specialty: "", hourlyRate: "", bio: "", image: "" });
      toast({ title: "تم التثبيت", description: "تم إضافة المستشار الجديد للمنصة بنجاح." });
    } catch (e) {
      toast({ variant: "destructive", title: "خطأ سيادي", description: "فشل في تسجيل المستشار." });
    }
  };

  const handleApproveCredit = async (requestId: string, userId: string, amount: number) => {
    setIsProcessing(requestId);
    try {
      await updateDoc(doc(db!, "users", userId), { balance: increment(amount) });
      await updateDoc(doc(db!, "paymentRequests", requestId), {
        status: "approved",
        approvedAt: new Date().toISOString()
      });
      toast({ title: "تم التصديق", description: `تم شحن ${amount} EGP لمحفظة المستخدم.` });
    } catch (e) {
      toast({ variant: "destructive", title: "خطأ", description: "فشل في تحديث الرصيد." });
    } finally {
      setIsProcessing(null);
    }
  };

  const handleRejectCredit = async (requestId: string) => {
    setIsProcessing(requestId);
    try {
      await updateDoc(doc(db!, "paymentRequests", requestId), {
        status: "rejected",
        rejectedAt: new Date().toISOString()
      });
      toast({ title: "تم الرفض", description: "تم إلغاء طلب الشحن بنجاح." });
    } catch (e) {
      toast({ variant: "destructive", title: "خطأ", description: "فشل في تحديث حالة الطلب." });
    } finally {
      setIsProcessing(null);
    }
  };

  return (
    <div className="container mx-auto px-6 py-16 max-w-7xl" dir="rtl">
      <header className="glass-cosmic p-12 rounded-[4rem] flex flex-col md:flex-row justify-between items-center gap-10 mb-16 border-primary/20 relative overflow-hidden shadow-[0_0_80px_rgba(37,99,235,0.1)]">
        <div className="absolute top-0 right-0 w-96 h-96 bg-primary/20 blur-[150px] -z-10" />
        <div className="text-right">
          <div className="flex items-center gap-4 justify-end mb-4">
            <Badge className="bg-primary text-white border-none px-8 py-2 rounded-full text-[10px] font-black uppercase tracking-widest shadow-xl shadow-primary/20">SUPREME ADMIN CORE</Badge>
            <h1 className="text-5xl font-black text-white flex items-center gap-6">
               غرفة القيادة العليا
               <Gavel className="h-14 w-14 text-primary" />
            </h1>
          </div>
          <p className="text-white/40 text-xl font-black">أهلاً بك يا سيادة المالك. نظام التحكم السيادي بالكامل تحت تصرفك لإدارة الكوكب.</p>
        </div>
      </header>

      <Tabs defaultValue="overview" className="space-y-12">
        <TabsList className="glass p-3 rounded-[2.5rem] w-full md:w-auto flex flex-wrap border-white/5 gap-4">
          <TabsTrigger value="overview" className="rounded-2xl px-12 py-5 data-[state=active]:bg-primary transition-all font-black text-lg">تحليلات الأداء</TabsTrigger>
          <TabsTrigger value="consultants" className="rounded-2xl px-12 py-5 data-[state=active]:bg-primary transition-all font-black text-lg">إدارة الخبراء</TabsTrigger>
          <TabsTrigger value="payments" className="rounded-2xl px-12 py-5 data-[state=active]:bg-primary transition-all font-black text-lg">المدفوعات</TabsTrigger>
          <TabsTrigger value="settings" className="rounded-2xl px-12 py-5 data-[state=active]:bg-primary transition-all font-black text-lg">إدارة المحتوى</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-12 animate-in fade-in zoom-in duration-700">
          <div className="grid md:grid-cols-4 gap-8">
            <StatCard label="إجمالي المواطنين" value={allUsers?.length || "0"} icon={<Users className="text-blue-400" />} trend="نمو مستمر" />
            <StatCard label="نخبة المستشارين" value={consultants?.length || "0"} icon={<Scale className="text-amber-400" />} trend="خبراء معتمدون" />
            <StatCard label="طلبات معلقة" value={paymentRequests?.filter(r => r.status === "pending").length || "0"} icon={<Wallet className="text-emerald-400" />} trend="تحتاج موافقة" />
            <StatCard label="استقرار النظام" value="١٠٠٪" icon={<ShieldCheck className="text-primary" />} trend="آمن سيادياً" />
          </div>

          <div className="grid lg:grid-cols-2 gap-10">
            <Card className="glass-card border-none rounded-[4rem] p-12 shadow-2xl">
              <h3 className="text-2xl font-black mb-12 flex items-center gap-4 text-white">نشاط المنصة الأسبوعي <Activity className="h-8 w-8 text-primary animate-pulse" /></h3>
              <div className="h-[350px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" vertical={false} />
                    <XAxis dataKey="name" stroke="#ffffff40" fontSize={12} tickLine={false} axisLine={false} />
                    <YAxis stroke="#ffffff40" fontSize={12} tickLine={false} axisLine={false} />
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#0f172a', borderRadius: '25px', border: '1px solid #ffffff10', textAlign: 'right' }}
                      itemStyle={{ color: '#fff' }}
                    />
                    <Bar dataKey="consultations" fill="#2563eb" radius={[15, 15, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </Card>

            <Card className="glass-card border-none rounded-[4rem] p-12 shadow-2xl">
              <h3 className="text-2xl font-black mb-12 flex items-center gap-4 text-white">توسع قاعدة البيانات <Database className="h-8 w-8 text-emerald-400" /></h3>
              <div className="h-[350px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" vertical={false} />
                    <XAxis dataKey="name" stroke="#ffffff40" fontSize={12} tickLine={false} axisLine={false} />
                    <YAxis stroke="#ffffff40" fontSize={12} tickLine={false} axisLine={false} />
                    <Tooltip 
                       contentStyle={{ backgroundColor: '#0f172a', borderRadius: '25px', border: '1px solid #ffffff10' }}
                    />
                    <Line type="monotone" dataKey="users" stroke="#10b981" strokeWidth={6} dot={{ fill: '#10b981', r: 8, strokeWidth: 0 }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="consultants" className="space-y-12">
          <Card className="glass-card border-none rounded-[4rem] p-16 shadow-2xl">
            <h3 className="text-4xl font-black mb-12 flex items-center gap-6 text-white">إضافة مستشار جديد <UserPlus className="h-10 w-10 text-primary" /></h3>
            <div className="grid md:grid-cols-2 gap-10 mb-12">
              <div className="space-y-3">
                <label className="text-xs font-black text-white/30 px-2 uppercase tracking-widest">الاسم الكامل</label>
                <Input placeholder="مثال: د. أحمد المحامي" value={newConsultant.name} onChange={e => setNewConsultant({...newConsultant, name: e.target.value})} className="glass border-white/10 h-16 rounded-[1.8rem] text-xl px-8" />
              </div>
              <div className="space-y-3">
                <label className="text-xs font-black text-white/30 px-2 uppercase tracking-widest">التخصص القانوني</label>
                <Input placeholder="مثال: قانون جنائي" value={newConsultant.specialty} onChange={e => setNewConsultant({...newConsultant, specialty: e.target.value})} className="glass border-white/10 h-16 rounded-[1.8rem] text-xl px-8" />
              </div>
              <div className="space-y-3">
                <label className="text-xs font-black text-white/30 px-2 uppercase tracking-widest">سعر الساعة (EGP)</label>
                <Input placeholder="500" type="number" value={newConsultant.hourlyRate} onChange={e => setNewConsultant({...newConsultant, hourlyRate: e.target.value})} className="glass border-white/10 h-16 rounded-[1.8rem] text-xl px-8" />
              </div>
              <div className="space-y-3">
                <label className="text-xs font-black text-white/30 px-2 uppercase tracking-widest">رابط الصورة الشخصية</label>
                <Input placeholder="https://..." value={newConsultant.image} onChange={e => setNewConsultant({...newConsultant, image: e.target.value})} className="glass border-white/10 h-16 rounded-[1.8rem] text-xl px-8" />
              </div>
              <div className="md:col-span-2 space-y-3">
                 <label className="text-xs font-black text-white/30 px-2 uppercase tracking-widest">النبذة المهنية</label>
                 <Textarea placeholder="اكتب تفاصيل الخبرات والمؤهلات..." value={newConsultant.bio} onChange={e => setNewConsultant({...newConsultant, bio: e.target.value})} className="glass border-white/10 min-h-[200px] rounded-[2rem] p-8 text-xl leading-relaxed" />
              </div>
            </div>
            <Button onClick={handleAddConsultant} className="cosmic-gradient rounded-[2.5rem] w-full h-24 font-black text-3xl shadow-3xl hover:scale-[1.01] transition-all">إضافة المستشار للمنظومة</Button>
          </Card>
          
          <div className="grid md:grid-cols-2 gap-10">
            {consultants?.map(c => (
              <div key={c.id} className="p-10 glass rounded-[3.5rem] flex justify-between items-center border-white/5 group hover:border-primary/40 transition-all shadow-xl">
                <Button variant="ghost" size="icon" className="h-16 w-16 rounded-[1.8rem] hover:bg-red-500/10 text-red-500/40 hover:text-red-500" onClick={() => deleteDoc(doc(db!, "consultantProfiles", c.id))}>
                  <Trash2 className="h-8 w-8" />
                </Button>
                <div className="text-right">
                  <h4 className="font-black text-3xl text-white">{c.name}</h4>
                  <p className="text-xl text-primary font-black mt-2">{c.specialty} | {c.hourlyRate} EGP/ساعة</p>
                </div>
              </div>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="payments" className="space-y-10">
          <Card className="glass-card border-none rounded-[4rem] p-16 shadow-2xl">
             <div className="space-y-8">
                {paymentRequests?.filter(r => r.status === "pending").map((request) => (
                  <div key={request.id} className="p-12 glass rounded-[3.5rem] flex flex-col md:flex-row justify-between items-center gap-12 border-white/5 hover:bg-white/[0.03] transition-all">
                    <div className="flex gap-5 w-full md:w-auto">
                      <Button onClick={() => handleApproveCredit(request.id, request.userId, request.amount)} disabled={!!isProcessing} className="flex-1 md:flex-none bg-emerald-600 hover:bg-emerald-700 rounded-[1.8rem] h-20 px-16 font-black text-xl shadow-2xl">
                        {isProcessing === request.id ? <Loader2 className="animate-spin" /> : "قبول وشحن"}
                      </Button>
                      <Button onClick={() => handleRejectCredit(request.id)} disabled={!!isProcessing} variant="outline" className="flex-1 md:flex-none text-red-500 border-red-500/20 rounded-[1.8rem] h-20 px-16 font-black text-xl">
                        {isProcessing === request.id ? <Loader2 className="animate-spin" /> : "رفض الطلب"}
                      </Button>
                    </div>
                    <div className="text-right">
                      <h4 className="font-black text-3xl text-white">{request.userName}</h4>
                      <p className="text-primary text-2xl font-black mt-2">{request.amount} EGP</p>
                      <p className="text-[10px] text-white/20 mt-4 font-black uppercase tracking-[0.3em]">{new Date(request.createdAt).toLocaleString('ar-EG')}</p>
                    </div>
                  </div>
                ))}
                {paymentRequests?.filter(r => r.status === "pending").length === 0 && (
                  <div className="text-center py-32 opacity-20">
                    <CheckCircle className="h-24 w-24 mx-auto mb-8" />
                    <p className="text-3xl font-black">لا توجد طلبات شحن معلقة حالياً</p>
                  </div>
                )}
             </div>
          </Card>
        </TabsContent>

        <TabsContent value="settings" className="space-y-12">
           <Card className="glass-card border-none rounded-[4rem] p-16 shadow-2xl text-center">
              <Settings2 className="h-20 w-20 text-primary mx-auto mb-10 opacity-30" />
              <h3 className="text-3xl font-black text-white mb-6">إدارة محتوى المنصة</h3>
              <p className="text-xl text-white/40 max-w-2xl mx-auto mb-12 font-black leading-relaxed">
                قريباً ستتمكن من تعديل كافة النصوص، العروض، والأسعار مباشرة من هنا دون الحاجة لتعديل الكود.
              </p>
              <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto opacity-40 grayscale">
                 <div className="p-10 glass rounded-[2.5rem] border-white/5">تعديل باقات الوقت</div>
                 <div className="p-10 glass rounded-[2.5rem] border-white/5">تعديل نصوص الواجهة</div>
              </div>
           </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

function StatCard({ label, value, icon, trend }: any) {
  return (
    <Card className="glass-card border-none rounded-[3.5rem] p-12 flex items-center justify-between group overflow-hidden shadow-xl">
      <div className="h-24 w-24 glass rounded-[2rem] flex items-center justify-center text-5xl shadow-inner group-hover:scale-110 transition-transform duration-1000">
        {icon}
      </div>
      <div className="text-right">
        <p className="text-[10px] text-white/30 font-black mb-3 uppercase tracking-widest">{label}</p>
        <p className="text-5xl font-black text-white">{value}</p>
        <Badge className="bg-primary/10 text-primary border-none text-[10px] mt-4 font-black px-4 py-1.5 rounded-full">{trend}</Badge>
      </div>
    </Card>
  );
}
