
"use client";

import { useUser, useFirestore, useCollection } from "@/firebase";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { 
  Users, 
  CheckCircle, 
  XCircle, 
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
  UserPlus
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, useMemo } from "react";
import { collection, deleteDoc, doc, addDoc, updateDoc } from "firebase/firestore";
import { useToast } from "@/hooks/use-toast";
import { useMemoFirebase } from "@/firebase/provider";

export default function SuperAdminPanel() {
  const { user, isUserLoading } = useUser();
  const db = useFirestore();
  const router = useRouter();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("overview");

  // Firestore Queries
  const specQuery = useMemoFirebase(() => collection(db!, "specializations"), [db]);
  const { data: specializations } = useCollection(specQuery);

  const [newSpec, setNewSpec] = useState({ name: "", description: "" });

  // Admin access check
  if (!isUserLoading && user?.email !== "bishoysamy390@gmail.com") {
    router.push("/dashboard");
    return null;
  }

  const handleAddSpec = async () => {
    if (!newSpec.name) return;
    try {
      await addDoc(collection(db!, "specializations"), newSpec);
      setNewSpec({ name: "", description: "" });
      toast({ title: "تمت الإضافة", description: "تم إضافة التخصص الجديد بنجاح." });
    } catch (e) {
      toast({ variant: "destructive", title: "خطأ", description: "فشل إضافة التخصص." });
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
    <div className="container mx-auto px-4 py-8 max-w-7xl h-full flex flex-col gap-8" dir="rtl">
      {/* Super Header */}
      <header className="glass-cosmic p-8 rounded-[2.5rem] flex flex-col md:flex-row justify-between items-center gap-6">
        <div className="text-right">
          <h1 className="text-4xl font-black text-primary flex items-center gap-3 justify-end">
            مركز القيادة العليا
            <ShieldCheck className="h-10 w-10 text-accent animate-pulse" />
          </h1>
          <p className="text-muted-foreground mt-2">مرحباً بيشوي، لديك السيطرة المطلقة على كوكب المستشار.</p>
        </div>
        <div className="flex gap-4">
          <Button variant="outline" className="rounded-2xl border-2">إحصائيات حية</Button>
          <Button className="cosmic-gradient rounded-2xl px-8 shadow-lg shadow-primary/20">تصدير قاعدة البيانات</Button>
        </div>
      </header>

      <div className="grid lg:grid-cols-4 gap-8 flex-grow">
        {/* Navigation Sidebar */}
        <aside className="lg:col-span-1 space-y-3">
          <AdminNavButton label="نظرة عامة" active={activeTab === "overview"} onClick={() => setActiveTab("overview")} icon={<Activity className="h-5 w-5" />} />
          <AdminNavButton label="إدارة التخصصات" active={activeTab === "specialties"} onClick={() => setActiveTab("specialties")} icon={<Scale className="h-5 w-5" />} />
          <AdminNavButton label="طلبات الشحن" active={activeTab === "payments"} onClick={() => setActiveTab("payments")} icon={<CreditCard className="h-5 w-5" />} count={2} />
          <AdminNavButton label="المستخدمين" active={activeTab === "users"} onClick={() => setActiveTab("users")} icon={<Users className="h-5 w-5" />} />
          <AdminNavButton label="الإعدادات" active={activeTab === "settings"} onClick={() => setActiveTab("settings")} icon={<Settings className="h-5 w-5" />} />
        </aside>

        {/* Dynamic Main Content */}
        <main className="lg:col-span-3 space-y-8">
          {activeTab === "overview" && (
            <div className="grid md:grid-cols-3 gap-6">
              <StatCard label="المستخدمين النشطين" value="1,420" icon={<Users className="text-blue-500" />} />
              <StatCard label="إجمالي الأرباح" value="32,500 EGP" icon={<TrendingUp className="text-green-500" />} />
              <StatCard label="استشارات اليوم" value="14" icon={<History className="text-orange-500" />} />
            </div>
          )}

          {activeTab === "specialties" && (
            <Card className="glass-cosmic border-none rounded-[2rem] overflow-hidden">
              <CardHeader className="border-b bg-muted/20">
                <CardTitle>تخصصات القانون</CardTitle>
                <CardDescription>أضف أو عدل التخصصات المتاحة للمستشارين.</CardDescription>
              </CardHeader>
              <CardContent className="p-6 space-y-6">
                <div className="flex gap-4 bg-muted/30 p-4 rounded-2xl">
                  <Input 
                    placeholder="اسم التخصص الجديد" 
                    value={newSpec.name}
                    onChange={(e) => setNewSpec({...newSpec, name: e.target.value})}
                    className="bg-background border-none text-right"
                  />
                  <Button onClick={handleAddSpec} className="cosmic-gradient rounded-xl gap-2">
                    <Plus className="h-4 w-4" /> إضافة
                  </Button>
                </div>
                <div className="divide-y">
                  {specializations?.map((spec) => (
                    <div key={spec.id} className="py-4 flex justify-between items-center group">
                      <div className="flex gap-2">
                        <Button variant="ghost" size="icon" className="text-red-500 hover:bg-red-50 rounded-xl" onClick={() => handleDeleteSpec(spec.id)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" className="text-blue-500 hover:bg-blue-50 rounded-xl">
                          <Edit2 className="h-4 w-4" />
                        </Button>
                      </div>
                      <div className="text-right">
                        <h4 className="font-bold text-lg">{spec.name}</h4>
                        <p className="text-xs text-muted-foreground">{spec.description || "لا يوجد وصف"}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {activeTab === "payments" && (
            <Card className="glass-cosmic border-none rounded-[2rem]">
              <CardHeader className="border-b">
                <CardTitle>مراجعة المدفوعات</CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <div className="divide-y">
                  {[1, 2].map((i) => (
                    <div key={i} className="p-6 flex flex-col md:flex-row justify-between items-center gap-6 hover:bg-muted/30 transition-all">
                      <div className="flex gap-3">
                        <Button className="bg-green-600 hover:bg-green-700 rounded-xl">قبول</Button>
                        <Button variant="outline" className="text-red-500 border-red-200 rounded-xl">رفض</Button>
                        <Button variant="ghost" className="text-accent underline">إيصال</Button>
                      </div>
                      <div className="text-right">
                        <h4 className="font-bold">مستخدم رقم {i}</h4>
                        <p className="text-sm text-muted-foreground">500 EGP - فودافون كاش</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </main>
      </div>
    </div>
  );
}

function StatCard({ label, value, icon }: any) {
  return (
    <Card className="glass-cosmic border-none rounded-3xl p-6 flex items-center justify-between">
      <div className="h-14 w-14 bg-muted rounded-2xl flex items-center justify-center text-2xl shadow-inner">
        {icon}
      </div>
      <div className="text-right">
        <p className="text-xs text-muted-foreground font-bold mb-1">{label}</p>
        <p className="text-2xl font-black text-primary">{value}</p>
      </div>
    </Card>
  );
}

function AdminNavButton({ label, active, onClick, icon, count }: any) {
  return (
    <Button 
      variant={active ? "default" : "ghost"} 
      className={`w-full justify-end gap-4 h-14 rounded-2xl transition-all duration-300 ${active ? 'cosmic-gradient shadow-lg scale-105' : 'hover:bg-muted/50'}`}
      onClick={onClick}
    >
      {count && <Badge className="bg-accent text-white ml-auto">{count}</Badge>}
      <span className="font-bold">{label}</span>
      {icon}
    </Button>
  );
}
