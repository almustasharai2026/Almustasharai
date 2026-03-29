
"use client";

import { useUser, useFirestore, useCollection } from "@/firebase";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Users, 
  TrendingUp, 
  CreditCard,
  Scale,
  Plus,
  Trash2,
  Lock,
  Database,
  CheckCircle,
  XCircle,
  AlertCircle,
  BarChart3,
  Activity,
  Loader2,
  Image as ImageIcon,
  ShieldCheck,
  UserPlus,
  ArrowUpRight,
  ShieldAlert
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { collection, deleteDoc, doc, addDoc, updateDoc, increment, query, orderBy } from "firebase/firestore";
import { useToast } from "@/hooks/use-toast";
import { useMemoFirebase } from "@/firebase/provider";

export default function AdminDashboard() {
  const { user, isUserLoading } = useUser();
  const db = useFirestore();
  const router = useRouter();
  const { toast } = useToast();
  
  const isAdmin = user?.email === "bishoysamy390@gmail.com";

  // Queries
  const specQuery = useMemoFirebase(() => collection(db!, "specializations"), [db]);
  const { data: specializations } = useCollection(specQuery);

  const usersQuery = useMemoFirebase(() => collection(db!, "users"), [db]);
  const { data: allUsers } = useCollection(usersQuery);

  const consultantQuery = useMemoFirebase(() => collection(db!, "consultantProfiles"), [db]);
  const { data: consultants } = useCollection(consultantQuery);

  const paymentQuery = useMemoFirebase(() => query(collection(db!, "paymentRequests"), orderBy("createdAt", "desc")), [db]);
  const { data: paymentRequests } = useCollection(paymentQuery);

  // States
  const [newSpec, setNewSpec] = useState({ name: "", description: "" });
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
      toast({ title: "تم التثبيت", description: "تم إضافة المستشار الجديد إلى المنصة بنجاح." });
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

  return (
    <div className="container mx-auto px-6 py-16 max-w-7xl" dir="rtl">
      <header className="glass-cosmic p-12 rounded-[3.5rem] flex flex-col md:flex-row justify-between items-center gap-10 mb-16 border-white/5 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-primary/20 blur-[150px] -z-10" />
        <div className="text-right">
          <div className="flex items-center gap-4 justify-end mb-4">
            <Badge className="bg-primary/20 text-primary border-primary/30 px-6 py-1.5 rounded-full text-xs font-black uppercase tracking-widest">Supreme Command</Badge>
            <h1 className="text-5xl font-black text-white flex items-center gap-5">
               غرفة العمليات المركزية
               <ShieldAlert className="h-12 w-12 text-primary" />
            </h1>
          </div>
          <p className="text-white/40 text-xl font-medium">أهلاً بك يا سيادة المدير. كامل صلاحيات المنصة مفعلة لك لإدارة الكوكب القانوني.</p>
        </div>
      </header>

      <Tabs defaultValue="overview" className="space-y-12">
        <TabsList className="glass p-2.5 rounded-[2.5rem] w-full md:w-auto flex flex-wrap border-white/5 gap-3">
          <TabsTrigger value="overview" className="rounded-2xl px-10 py-5 data-[state=active]:bg-primary transition-all font-black">إحصائيات حية</TabsTrigger>
          <TabsTrigger value="consultants" className="rounded-2xl px-10 py-5 data-[state=active]:bg-primary transition-all font-black">إدارة المستشارين</TabsTrigger>
          <TabsTrigger value="payments" className="rounded-2xl px-10 py-5 data-[state=active]:bg-primary transition-all font-black">طلبات الشحن</TabsTrigger>
          <TabsTrigger value="users" className="rounded-2xl px-10 py-5 data-[state=active]:bg-primary transition-all font-black">المستخدمين</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-12 animate-in fade-in zoom-in duration-700">
          <div className="grid md:grid-cols-4 gap-8">
            <StatCard label="إجمالي المواطنين" value={allUsers?.length || "0"} icon={<Users className="text-blue-400" />} trend="نشطون الآن" />
            <StatCard label="نخبة المستشارين" value={consultants?.length || "0"} icon={<Scale className="text-amber-400" />} trend="خبراء معتمدون" />
            <StatCard label="طلبات معلقة" value={paymentRequests?.filter(r => r.status === "pending").length || "0"} icon={<CreditCard className="text-emerald-400" />} trend="تحتاج موافقتك" />
            <StatCard label="استقرار النظام" value="١٠٠٪" icon={<ShieldCheck className="text-primary" />} trend="آمن سيادياً" />
          </div>
        </TabsContent>

        <TabsContent value="consultants" className="space-y-10">
          <Card className="glass-card border-none rounded-[3.5rem] p-12">
            <h3 className="text-3xl font-black mb-10 flex items-center gap-4 text-white">إضافة مستشار جديد <UserPlus className="h-8 w-8 text-primary" /></h3>
            <div className="grid md:grid-cols-2 gap-8 mb-10">
              <Input placeholder="الاسم الكامل" value={newConsultant.name} onChange={e => setNewConsultant({...newConsultant, name: e.target.value})} className="glass border-white/10 h-16 rounded-[1.5rem] text-lg px-6" />
              <Input placeholder="التخصص القانوني" value={newConsultant.specialty} onChange={e => setNewConsultant({...newConsultant, specialty: e.target.value})} className="glass border-white/10 h-16 rounded-[1.5rem] text-lg px-6" />
              <Input placeholder="سعر الساعة (EGP)" type="number" value={newConsultant.hourlyRate} onChange={e => setNewConsultant({...newConsultant, hourlyRate: e.target.value})} className="glass border-white/10 h-16 rounded-[1.5rem] text-lg px-6" />
              <Input placeholder="رابط الصورة الشخصية" value={newConsultant.image} onChange={e => setNewConsultant({...newConsultant, image: e.target.value})} className="glass border-white/10 h-16 rounded-[1.5rem] text-lg px-6" />
              <div className="md:col-span-2">
                <Textarea placeholder="النبذة المهنية والخبرات..." value={newConsultant.bio} onChange={e => setNewConsultant({...newConsultant, bio: e.target.value})} className="glass border-white/10 min-h-[150px] rounded-[1.5rem] p-6 text-lg" />
              </div>
            </div>
            <Button onClick={handleAddConsultant} className="cosmic-gradient rounded-[2rem] w-full h-20 font-black text-2xl shadow-2xl hover:scale-[1.01] transition-all">إضافة المستشار للمنظومة</Button>
          </Card>
          
          <div className="grid md:grid-cols-2 gap-8">
            {consultants?.map(c => (
              <div key={c.id} className="p-8 glass rounded-[3rem] flex justify-between items-center border-white/5 group hover:border-primary/30 transition-all">
                <Button variant="ghost" size="icon" className="h-14 w-14 rounded-2xl hover:bg-red-500/10 text-red-500/40 hover:text-red-500" onClick={() => deleteDoc(doc(db!, "consultantProfiles", c.id))}>
                  <Trash2 className="h-6 w-6" />
                </Button>
                <div className="text-right">
                  <h4 className="font-black text-2xl text-white">{c.name}</h4>
                  <p className="text-lg text-primary font-bold">{c.specialty} | {c.hourlyRate} EGP/ساعة</p>
                </div>
              </div>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="payments" className="space-y-8">
          <Card className="glass-card border-none rounded-[3.5rem] p-12">
             <div className="space-y-6">
                {paymentRequests?.filter(r => r.status === "pending").map((request) => (
                  <div key={request.id} className="p-10 glass rounded-[3rem] flex flex-col md:flex-row justify-between items-center gap-10 border-white/5 hover:bg-white/[0.02] transition-all">
                    <div className="flex gap-4 w-full md:w-auto">
                      <Button onClick={() => handleApproveCredit(request.id, request.userId, request.amount)} disabled={!!isProcessing} className="flex-1 md:flex-none bg-emerald-600 hover:bg-emerald-700 rounded-2xl h-16 px-12 font-black text-lg shadow-xl">
                        {isProcessing === request.id ? <Loader2 className="animate-spin" /> : "قبول وشحن"}
                      </Button>
                      <Button variant="outline" className="flex-1 md:flex-none text-red-500 border-red-500/20 rounded-2xl h-16 px-12 font-black text-lg">رفض</Button>
                    </div>
                    <div className="text-right">
                      <h4 className="font-black text-2xl text-white">{request.userName}</h4>
                      <p className="text-primary text-xl font-black mt-1">{request.amount} EGP</p>
                      <p className="text-[10px] text-white/20 mt-2 font-bold uppercase tracking-widest">{new Date(request.createdAt).toLocaleString('ar-EG')}</p>
                    </div>
                  </div>
                ))}
                {paymentRequests?.filter(r => r.status === "pending").length === 0 && (
                  <div className="text-center py-20 opacity-30">
                    <CheckCircle className="h-16 w-16 mx-auto mb-4" />
                    <p className="text-2xl font-black">لا توجد طلبات معلقة حالياً</p>
                  </div>
                )}
             </div>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

function StatCard({ label, value, icon, trend }: any) {
  return (
    <Card className="glass-card border-none rounded-[2.5rem] p-10 flex items-center justify-between group overflow-hidden">
      <div className="h-20 w-20 glass rounded-3xl flex items-center justify-center text-4xl shadow-inner group-hover:scale-110 transition-transform duration-700">
        {icon}
      </div>
      <div className="text-right">
        <p className="text-xs text-white/30 font-black mb-2 uppercase tracking-tighter">{label}</p>
        <p className="text-4xl font-black text-white">{value}</p>
        <Badge className="bg-primary/10 text-primary border-none text-[10px] mt-3 font-black">{trend}</Badge>
      </div>
    </Card>
  );
}
