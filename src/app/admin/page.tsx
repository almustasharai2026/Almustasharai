
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
  UserPlus
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
      toast({ title: "تمت الإضافة", description: "تم إضافة المستشار الجديد إلى المنصة بنجاح." });
    } catch (e) {
      toast({ variant: "destructive", title: "خطأ", description: "فشل في إضافة المستشار." });
    }
  };

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

  const handleApproveCredit = async (requestId: string, userId: string, amount: number) => {
    setIsProcessing(requestId);
    try {
      await updateDoc(doc(db!, "users", userId), { balance: increment(amount) });
      await updateDoc(doc(db!, "paymentRequests", requestId), {
        status: "approved",
        approvedAt: new Date().toISOString()
      });
      toast({ title: "تم القبول", description: `تم إضافة ${amount} EGP لرصيد المستخدم.` });
    } catch (e) {
      toast({ variant: "destructive", title: "خطأ", description: "فشل في التحديث." });
    } finally {
      setIsProcessing(null);
    }
  };

  return (
    <div className="container mx-auto px-4 py-12 max-w-7xl" dir="rtl">
      <header className="glass-cosmic p-10 rounded-[3rem] flex flex-col md:flex-row justify-between items-center gap-8 mb-12 border-white/5 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 blur-[100px] -z-10" />
        <div className="text-right">
          <div className="flex items-center gap-3 justify-end mb-3">
            <Badge className="bg-primary/20 text-primary border-primary/30 px-4 py-1 rounded-full text-xs font-bold">السيادة المطلقة</Badge>
            <h1 className="text-4xl font-black text-white flex items-center gap-4">
               غرفة العمليات المركزية
               <Lock className="h-10 w-10 text-primary" />
            </h1>
          </div>
          <p className="text-muted-foreground text-lg">أهلاً بك يا سيد بيشوي سامي. كل السلطات مفعلة لك لإدارة الكوكب.</p>
        </div>
      </header>

      <Tabs defaultValue="overview" className="space-y-10">
        <TabsList className="glass p-2 rounded-3xl w-full md:w-auto flex flex-wrap border-white/5 gap-2">
          <TabsTrigger value="overview" className="rounded-2xl px-8 py-4 data-[state=active]:bg-primary transition-all">إحصائيات</TabsTrigger>
          <TabsTrigger value="consultants" className="rounded-2xl px-8 py-4 data-[state=active]:bg-primary transition-all">إدارة المستشارين</TabsTrigger>
          <TabsTrigger value="payments" className="rounded-2xl px-8 py-4 data-[state=active]:bg-primary transition-all">طلبات الشحن</TabsTrigger>
          <TabsTrigger value="users" className="rounded-2xl px-8 py-4 data-[state=active]:bg-primary transition-all">المستخدمين</TabsTrigger>
          <TabsTrigger value="specialties" className="rounded-2xl px-8 py-4 data-[state=active]:bg-primary transition-all">التخصصات</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-10">
          <div className="grid md:grid-cols-4 gap-6">
            <StatCard label="المشتركين" value={allUsers?.length || "0"} icon={<Users className="text-indigo-400" />} trend="نشط" />
            <StatCard label="المستشارين" value={consultants?.length || "0"} icon={<Scale className="text-amber-400" />} trend="خبير" />
            <StatCard label="طلبات معلقة" value={paymentRequests?.filter(r => r.status === "pending").length || "0"} icon={<CreditCard className="text-emerald-400" />} trend="انتظار" />
            <StatCard label="حالة النظام" value="سيادي" icon={<ShieldCheck className="text-primary" />} trend="آمن" />
          </div>
        </TabsContent>

        <TabsContent value="consultants" className="space-y-8">
          <Card className="glass-card border-none rounded-[3rem] p-10">
            <h3 className="text-2xl font-black mb-8 flex items-center gap-3">إضافة مستشار جديد <UserPlus className="h-6 w-6 text-primary" /></h3>
            <div className="grid md:grid-cols-2 gap-6 mb-8">
              <Input placeholder="الاسم الكامل" value={newConsultant.name} onChange={e => setNewConsultant({...newConsultant, name: e.target.value})} className="glass border-white/10 h-14" />
              <Input placeholder="التخصص" value={newConsultant.specialty} onChange={e => setNewConsultant({...newConsultant, specialty: e.target.value})} className="glass border-white/10 h-14" />
              <Input placeholder="سعر الساعة (EGP)" type="number" value={newConsultant.hourlyRate} onChange={e => setNewConsultant({...newConsultant, hourlyRate: e.target.value})} className="glass border-white/10 h-14" />
              <Input placeholder="رابط الصورة (اختياري)" value={newConsultant.image} onChange={e => setNewConsultant({...newConsultant, image: e.target.value})} className="glass border-white/10 h-14" />
              <div className="md:col-span-2">
                <Textarea placeholder="نبذة مهنية عن المستشار..." value={newConsultant.bio} onChange={e => setNewConsultant({...newConsultant, bio: e.target.value})} className="glass border-white/10 min-h-[120px]" />
              </div>
            </div>
            <Button onClick={handleAddConsultant} className="cosmic-gradient rounded-2xl w-full h-16 font-black text-xl">إضافة المستشار للقائمة</Button>
          </Card>
          
          <div className="grid md:grid-cols-2 gap-6">
            {consultants?.map(c => (
              <div key={c.id} className="p-6 glass rounded-[2.5rem] flex justify-between items-center border-white/5">
                <Button variant="ghost" size="icon" className="text-red-500" onClick={() => deleteDoc(doc(db!, "consultantProfiles", c.id))}>
                  <Trash2 className="h-5 w-5" />
                </Button>
                <div className="text-right">
                  <h4 className="font-bold text-xl text-white">{c.name}</h4>
                  <p className="text-sm text-primary">{c.specialty} | {c.hourlyRate} EGP/ساعة</p>
                </div>
              </div>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="payments" className="space-y-6">
          <Card className="glass-card border-none rounded-[3rem] p-10">
             <div className="space-y-4">
                {paymentRequests?.filter(r => r.status === "pending").map((request) => (
                  <div key={request.id} className="p-8 glass rounded-[2.5rem] flex flex-col md:flex-row justify-between items-center gap-8 border-white/5">
                    <div className="flex gap-4">
                      <Button onClick={() => handleApproveCredit(request.id, request.userId, request.amount)} disabled={!!isProcessing} className="bg-emerald-600 rounded-2xl px-10 h-14 font-bold">
                        {isProcessing === request.id ? <Loader2 className="animate-spin" /> : "قبول وشحن"}
                      </Button>
                      <Button variant="outline" className="text-red-500 rounded-2xl px-10 h-14 font-bold">رفض</Button>
                    </div>
                    <div className="text-right">
                      <h4 className="font-black text-xl text-white">{request.userName}</h4>
                      <p className="text-primary font-black">{request.amount} EGP</p>
                      <p className="text-[10px] opacity-40">{new Date(request.createdAt).toLocaleString('ar-EG')}</p>
                    </div>
                  </div>
                ))}
             </div>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

function StatCard({ label, value, icon, trend }: any) {
  return (
    <Card className="glass-card border-none rounded-[2rem] p-8 flex items-center justify-between group overflow-hidden">
      <div className="h-16 w-16 glass rounded-2xl flex items-center justify-center text-3xl">
        {icon}
      </div>
      <div className="text-right">
        <p className="text-xs text-muted-foreground font-black mb-1 opacity-60 uppercase">{label}</p>
        <p className="text-3xl font-black text-white">{value}</p>
        <Badge className="bg-primary/10 text-primary border-none text-[10px] mt-2">{trend}</Badge>
      </div>
    </Card>
  );
}
