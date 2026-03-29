
"use client";

import { useUser, useFirestore, useCollection } from "@/firebase";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { 
  Users, 
  TrendingUp, 
  ShieldCheck,
  CreditCard,
  History,
  Scale,
  Plus,
  Trash2,
  Edit2,
  Settings,
  Activity,
  UserPlus,
  Lock,
  Database,
  Search,
  CheckCircle,
  XCircle
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { collection, deleteDoc, doc, addDoc } from "firebase/firestore";
import { useToast } from "@/hooks/use-toast";
import { useMemoFirebase } from "@/firebase/provider";

export default function SupremeAdminPanel() {
  const { user, isUserLoading } = useUser();
  const db = useFirestore();
  const router = useRouter();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("overview");

  // Admin access check
  const isAdmin = user?.email === "bishoysamy390@gmail.com";

  // Firestore Queries
  const specQuery = useMemoFirebase(() => collection(db!, "specializations"), [db]);
  const { data: specializations } = useCollection(specQuery);

  const [newSpec, setNewSpec] = useState({ name: "", description: "" });

  if (!isUserLoading && !isAdmin) {
    router.push("/dashboard");
    return null;
  }

  const handleAddSpec = async () => {
    if (!newSpec.name) return;
    try {
      await addDoc(collection(db!, "specializations"), newSpec);
      setNewSpec({ name: "", description: "" });
      toast({ title: "تمت العملية", description: "تم إضافة التخصص القانوني بنجاح." });
    } catch (e) {
      toast({ variant: "destructive", title: "خطأ", description: "فشل تحديث قاعدة البيانات." });
    }
  };

  const handleDeleteSpec = async (id: string) => {
    try {
      await deleteDoc(doc(db!, "specializations", id));
      toast({ title: "تم الحذف", description: "تم إزالة التخصص من النظام." });
    } catch (e) {
      toast({ variant: "destructive", title: "خطأ", description: "فشل الحذف." });
    }
  };

  return (
    <div className="container mx-auto px-4 py-12 max-w-7xl h-full flex flex-col gap-12" dir="rtl">
      {/* Supreme Admin Header */}
      <header className="glass-cosmic p-12 rounded-[4rem] flex flex-col md:flex-row justify-between items-center gap-10 relative overflow-hidden border-accent/30 shadow-[0_0_50px_rgba(255,107,0,0.1)]">
        <div className="absolute top-0 right-0 w-64 h-64 bg-accent/10 blur-[100px] rounded-full" />
        <div className="text-right space-y-4 relative z-10">
          <div className="flex items-center gap-4 justify-end">
            <Badge className="bg-accent/20 text-accent border-accent/40 px-6 py-1.5 rounded-full font-black text-sm uppercase tracking-widest">المشرف الأعلى</Badge>
            <h1 className="text-6xl font-black text-white flex items-center gap-6">
               غرفة العمليات المركزية
               <Lock className="h-14 w-14 text-accent animate-pulse" />
            </h1>
          </div>
          <p className="text-2xl text-white/60 font-medium">أهلاً بيشوي سامي، لديك السيطرة المطلقة على كوكب المستشار.</p>
        </div>
        <div className="flex gap-6 relative z-10">
           <Button className="h-16 px-10 rounded-2xl glass-cosmic border-white/10 hover:bg-white/10 text-white font-black text-lg gap-3">
              <Database className="h-6 w-6 text-accent" /> نسخة احتياطية كوانتم
           </Button>
           <Button className="h-16 px-12 rounded-2xl cosmic-gradient font-black text-xl shadow-[0_10px_40px_rgba(255,107,0,0.4)]">تصدير تقرير الجدوى</Button>
        </div>
      </header>

      <div className="grid lg:grid-cols-4 gap-12 flex-grow">
        {/* Navigation Command Sidebar */}
        <aside className="lg:col-span-1 space-y-4">
          <AdminNavButton label="مركز المعلومات" active={activeTab === "overview"} onClick={() => setActiveTab("overview")} icon={<Activity className="h-7 w-7" />} />
          <AdminNavButton label="هندسة التخصصات" active={activeTab === "specialties"} onClick={() => setActiveTab("specialties")} icon={<Scale className="h-7 w-7" />} />
          <AdminNavButton label="مراجعة المدفوعات" active={activeTab === "payments"} onClick={() => setActiveTab("payments")} icon={<CreditCard className="h-7 w-7" />} count={3} />
          <AdminNavButton label="سجل المستخدمين" active={activeTab === "users"} onClick={() => setActiveTab("users")} icon={<Users className="h-7 w-7" />} />
          <AdminNavButton label="إعدادات الكون" active={activeTab === "settings"} onClick={() => setActiveTab("settings")} icon={<Settings className="h-7 w-7" />} />
        </aside>

        {/* Dynamic Operational Content */}
        <main className="lg:col-span-3 space-y-12">
          {activeTab === "overview" && (
            <div className="grid md:grid-cols-3 gap-10">
              <StatCard label="إجمالي السكان" value="3,152" icon={<Users className="text-blue-400" />} trend="+15%" />
              <StatCard label="إيرادات الكوكب" value="62,800 EGP" icon={<TrendingUp className="text-green-400" />} trend="+22%" />
              <StatCard label="استشارات حية" value="24" icon={<Activity className="text-orange-400" />} trend="LIVE" />
            </div>
          )}

          {activeTab === "specialties" && (
            <Card className="glass-cosmic border-none rounded-[4rem] overflow-hidden shadow-2xl">
              <CardHeader className="p-12 border-b border-white/5 bg-white/[0.02]">
                <CardTitle className="text-4xl font-black text-white">إدارة التخصصات القانونية</CardTitle>
                <CardDescription className="text-xl text-white/50">قم بتطوير خوارزميات التخصص في قاعدة البيانات.</CardDescription>
              </CardHeader>
              <CardContent className="p-12 space-y-10">
                <div className="flex gap-6 glass-cosmic p-8 rounded-[2.5rem] border-accent/20">
                  <Input 
                    placeholder="اسم التخصص القانوني الجديد..." 
                    value={newSpec.name}
                    onChange={(e) => setNewSpec({...newSpec, name: e.target.value})}
                    className="bg-transparent border-none text-2xl h-20 text-right text-white placeholder:text-white/20 focus-visible:ring-0"
                  />
                  <Button onClick={handleAddSpec} className="cosmic-gradient rounded-3xl px-12 h-20 font-black text-xl gap-3 shadow-2xl hover:scale-105 transition-all">
                    <Plus className="h-8 w-8" /> إضافة فورية
                  </Button>
                </div>
                <div className="grid gap-6">
                  {specializations?.map((spec) => (
                    <div key={spec.id} className="p-10 glass-cosmic rounded-[3rem] flex justify-between items-center group hover:bg-white/[0.05] transition-all border border-white/5 hover:border-accent/20">
                      <div className="flex gap-4">
                        <Button variant="ghost" size="icon" className="h-14 w-14 text-red-500 hover:bg-red-500/20 rounded-2xl" onClick={() => handleDeleteSpec(spec.id)}>
                          <Trash2 className="h-6 w-6" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-14 w-14 text-blue-400 hover:bg-blue-400/20 rounded-2xl">
                          <Edit2 className="h-6 w-6" />
                        </Button>
                      </div>
                      <div className="text-right">
                        <h4 className="font-black text-3xl text-white">{spec.name}</h4>
                        <p className="text-lg opacity-60 text-white/60 mt-2">{spec.description || "لا يوجد وصف فني مسجل لهذا التخصص"}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {activeTab === "payments" && (
            <Card className="glass-cosmic border-none rounded-[4rem] p-12 shadow-2xl">
              <CardHeader className="mb-10 text-right">
                <CardTitle className="text-4xl font-black text-white">طلبات التحقق المالية</CardTitle>
                <CardDescription className="text-xl text-white/50">راجع إيصالات التحويل وأكد شحن الرصيد للعملاء.</CardDescription>
              </CardHeader>
              <div className="space-y-8">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="p-10 glass-cosmic rounded-[3.5rem] flex flex-col md:flex-row justify-between items-center gap-10 hover:border-accent/30 transition-all border border-white/5">
                    <div className="flex gap-6">
                      <Button className="bg-green-600 hover:bg-green-700 rounded-2xl h-16 px-10 font-black text-lg gap-2">
                         <CheckCircle className="h-6 w-6" /> تأكيد العملية
                      </Button>
                      <Button variant="outline" className="text-red-500 border-red-500/30 h-16 px-10 rounded-2xl font-black bg-red-500/5 hover:bg-red-500 hover:text-white">
                         <XCircle className="h-6 w-6" /> رفض
                      </Button>
                    </div>
                    <div className="text-right space-y-2">
                      <h4 className="font-black text-3xl text-white">{i === 1 ? "بيشوي سامي" : i === 2 ? "سارة محمود" : "أحمد علي"}</h4>
                      <p className="text-xl font-bold text-accent tracking-wide">{i * 250 + 500} EGP - محفظة إلكترونية</p>
                      <p className="text-sm opacity-40 font-bold">الرقم المرسل: 01026****01</p>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          )}
        </main>
      </div>
    </div>
  );
}

function StatCard({ label, value, icon, trend }: any) {
  return (
    <Card className="glass-cosmic border-none rounded-[3.5rem] p-10 flex items-center justify-between relative overflow-hidden group shadow-2xl">
      <div className="absolute top-0 left-0 w-32 h-32 bg-white/[0.02] translate-x-[-20%] translate-y-[-20%] rounded-full group-hover:scale-150 transition-transform duration-1000" />
      <div className="h-24 w-24 glass-cosmic rounded-[2rem] flex items-center justify-center text-5xl shadow-2xl relative z-10 bg-white/5 border-white/10">
        {icon}
      </div>
      <div className="text-right relative z-10">
        <div className="flex items-center gap-3 justify-end mb-2">
           <Badge className="bg-green-500/20 text-green-400 border-none text-xs font-black">{trend}</Badge>
           <p className="text-xs text-white/40 font-black uppercase tracking-[0.2em]">{label}</p>
        </div>
        <p className="text-5xl font-black text-white tracking-tighter">{value}</p>
      </div>
    </Card>
  );
}

function AdminNavButton({ label, active, onClick, icon, count }: any) {
  return (
    <Button 
      variant={active ? "default" : "ghost"} 
      className={`w-full justify-end gap-8 h-24 rounded-[2.5rem] transition-all duration-700 ${
        active 
        ? 'cosmic-gradient shadow-[0_15px_40px_rgba(255,107,0,0.3)] scale-105' 
        : 'hover:bg-white/[0.05] text-white/50 border border-transparent hover:border-white/10'
      }`}
      onClick={onClick}
    >
      {count && <Badge className="bg-white/20 text-white ml-auto font-black px-3 py-1 rounded-lg">{count}</Badge>}
      <span className="font-black text-2xl tracking-tighter">{label}</span>
      <div className={active ? 'text-white' : 'text-accent'}>{icon}</div>
    </Button>
  );
}
