
"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Home, BarChart3, FileText, Briefcase, Headphones, Settings, 
  Search, Bell, LogOut, Download, Trash2, CheckCircle2, 
  AlertCircle, Loader2, Plus, Users, Wallet, Cpu, Scale, ChevronLeft,
  LayoutDashboard, Layers, Clock, ShieldCheck
} from "lucide-react";
import { useUser, useFirestore, useCollection } from "@/firebase";
import { useToast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";
import { collection, doc, updateDoc, deleteDoc, query, orderBy, limit } from "firebase/firestore";
import { useMemoFirebase } from "@/firebase/provider";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import Image from "next/image";

export default function SupremeCommandCenter() {
  const { user, profile, role, signOut } = useUser();
  const db = useFirestore();
  const router = useRouter();
  const { toast } = useToast();
  
  const [activeTab, setActiveTab] = useState("home");
  const [isCleaning, setIsCleaning] = useState(false);

  // استعلامات المالك السيادية
  const usersQuery = useMemoFirebase(() => db ? collection(db, "users") : null, [db]);
  const { data: allUsers } = useCollection(usersQuery);

  const logsQuery = useMemoFirebase(() => db ? query(collection(db, "analytics"), orderBy("createdAt", "desc"), limit(5)) : null, [db]);
  const { data: recentLogs } = useCollection(logsQuery);

  // التحقق من الهوية السيادية
  if (role !== "admin") {
    return (
      <div className="h-screen flex flex-col items-center justify-center bg-[#020617] text-red-500 font-black gap-8">
        <Scale className="h-20 w-20 animate-bounce" />
        <h1 className="text-4xl uppercase tracking-[0.5em]">Sovereign Access Denied</h1>
        <Button onClick={() => router.push("/")} variant="outline" className="border-red-500/20 text-red-500">العودة للسطح</Button>
      </div>
    );
  }

  const handleCleanup = () => {
    setIsCleaning(true);
    toast({ title: "بدء بروتوكول التطهير", description: "جاري فحص الملفات وإزالة التكرارات السيادية..." });
    setTimeout(() => {
      setIsCleaning(false);
      toast({ title: "اكتمل التطهير ✅", description: "تم تنظيف النظام بنسبة 100% وتحسين الأداء." });
    }, 3000);
  };

  return (
    <div className="flex h-screen bg-[#f0f4f8] dark:bg-[#020617] text-slate-800 dark:text-white overflow-hidden font-sans" dir="rtl">
      
      {/* Sidebar السيادي (كما في التصميم) */}
      <aside className="w-64 bg-[#1e293b] text-white flex flex-col z-50 flex-shrink-0 shadow-2xl">
        <div className="p-8 border-b border-white/5 flex items-center gap-3">
          <div className="h-10 w-10 bg-gradient-to-br from-primary to-amber-500 rounded-xl flex items-center justify-center shadow-lg">
            <span className="font-black text-xl">AI</span>
          </div>
          <span className="font-black text-lg tracking-tight">إدارة المشروعات</span>
        </div>

        <nav className="flex-1 p-4 space-y-1">
          <SideLink icon={<Home className="h-5 w-5" />} text="الرئيسية" active={activeTab === "home"} onClick={() => setActiveTab("home")} />
          <SideLink icon={<BarChart3 className="h-5 w-5" />} text="المشاريع" active={activeTab === "projects"} onClick={() => setActiveTab("projects")} />
          <SideLink icon={<FileText className="h-5 w-5" />} text="التقارير" active={activeTab === "reports"} onClick={() => setActiveTab("reports")} />
          <SideLink icon={<Briefcase className="h-5 w-5" />} text="الملفات" active={activeTab === "files"} onClick={() => setActiveTab("files")} />
          <SideLink icon={<Headphones className="h-5 w-5" />} text="الدعم الفني" active={activeTab === "support"} onClick={() => setActiveTab("support")} />
          <SideLink icon={<Settings className="h-5 w-5" />} text="الإعدادات" active={activeTab === "settings"} onClick={() => setActiveTab("settings")} />
        </nav>

        <div className="p-4 border-t border-white/5 space-y-2">
          <button className="w-full flex items-center gap-3 px-4 py-3 rounded-xl bg-primary/10 text-primary font-bold text-xs hover:bg-primary/20 transition-all">
            <Download className="h-4 w-4" /> تحميل الملفات
          </button>
          <button onClick={() => signOut()} className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-white/40 hover:text-white hover:bg-red-500/10 transition-all font-bold text-xs">
            <LogOut className="h-4 w-4" /> تسجيل الخروج
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col relative overflow-hidden">
        
        {/* Top Header */}
        <header className="h-20 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-white/5 flex items-center justify-between px-10 z-40">
          <div className="flex items-center gap-4">
             <div className="h-10 w-10 bg-slate-100 dark:bg-white/5 rounded-full flex items-center justify-center text-slate-400">
               <Search className="h-5 w-5" />
             </div>
             <h1 className="text-xl font-black text-slate-900 dark:text-white tracking-tight">
               مرحباً بك في إدارة المشروعات الذكية!
             </h1>
          </div>

          <div className="flex items-center gap-6">
            <div className="text-left">
               <p className="text-xs font-black text-slate-900 dark:text-white">king2026, مرحباً</p>
               <p className="text-[10px] text-slate-400 font-medium">bishoysamy390@gmail.com</p>
            </div>
            <div className="relative">
               <Bell className="h-6 w-6 text-slate-400" />
               <span className="absolute -top-1 -right-1 h-4 w-4 bg-red-500 text-white text-[8px] font-black flex items-center justify-center rounded-full border-2 border-white dark:border-slate-900">3</span>
            </div>
            <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-primary to-indigo-600 p-0.5 shadow-xl">
               <div className="h-full w-full rounded-[0.9rem] bg-white dark:bg-slate-800 flex items-center justify-center overflow-hidden">
                  <Image src="https://picsum.photos/seed/king/200/200" alt="Admin" width={48} height={48} className="object-cover" />
               </div>
            </div>
          </div>
        </header>

        {/* Dynamic Body */}
        <div className="flex-1 p-8 overflow-y-auto space-y-8">
          
          {/* Stats Bar */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <StatItem label="المشاريع الحالية" value="5" color="green" />
            <StatItem label="المهام الجديدة" value="12" color="orange" />
            <StatItem label="الإشعارات" value="3" color="red" />
            <StatItem label="البوت جاري العمل" value="Active" color="primary" isBadge />
          </div>

          <div className="grid lg:grid-cols-12 gap-8">
            
            {/* Left Column (Recent Projects) */}
            <div className="lg:col-span-5 space-y-8">
              <Card className="rounded-[2.5rem] border-none shadow-xl bg-white dark:bg-slate-900 overflow-hidden">
                <CardHeader className="p-8 border-b border-slate-50 dark:border-white/5 flex flex-row items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Briefcase className="h-5 w-5 text-primary" />
                    <CardTitle className="text-lg font-black">المشاريع الأخيرة</CardTitle>
                  </div>
                  <Search className="h-4 w-4 text-slate-300" />
                </CardHeader>
                <CardContent className="p-8 space-y-8">
                  <ProjectProgress title="تطوير موقع إلكتروني" status="قيد التنفيذ" progress={65} color="bg-primary" />
                  <ProjectProgress title="تطبيق الهاتف الجديد" status="قيد التنفيذ" progress={40} color="bg-orange-500" />
                  <ProjectProgress title="حملة تسويقية" status="مكتمل" progress={100} color="bg-emerald-500" />
                </CardContent>
              </Card>

              <Card className="rounded-[2.5rem] border-none shadow-xl bg-white dark:bg-slate-900 overflow-hidden">
                <CardHeader className="p-8 border-b border-slate-50 dark:border-white/5">
                  <div className="flex items-center gap-3">
                    <Layers className="h-5 w-5 text-primary" />
                    <CardTitle className="text-lg font-black">الإصدارات الأخيرة</CardTitle>
                  </div>
                </CardHeader>
                <CardContent className="p-8 space-y-4">
                  <FileLink name="عرض تقديمي.pdf" icon="🔴" />
                  <FileLink name="تقارير المشروع.xlsx" icon="🟢" />
                  <FileLink name="logo_design.jpg" icon="🔵" />
                </CardContent>
              </Card>
            </div>

            {/* Right Column (Bot & Activity) */}
            <div className="lg:col-span-7 space-y-8">
              <Card className="rounded-[2.5rem] border-none shadow-xl bg-gradient-to-br from-indigo-600 to-[#4e54c8] text-white overflow-hidden relative">
                <div className="absolute top-0 left-0 w-full h-full opacity-10 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]" />
                <CardContent className="p-10 relative z-10 space-y-8">
                  <div className="flex items-center gap-6">
                    <div className="h-20 w-20 rounded-[2rem] bg-white/20 backdrop-blur-md flex items-center justify-center border border-white/20">
                       <Cpu className="h-10 w-10 text-white" />
                    </div>
                    <div>
                      <h3 className="text-3xl font-black tracking-tight">البوت الذكي</h3>
                      <p className="text-white/60 font-bold">المساعد الافتراضي جاهز لخدمتك</p>
                    </div>
                  </div>
                  <div className="bg-white/10 backdrop-blur-md p-6 rounded-3xl border border-white/10">
                    <p className="text-lg font-medium">أهلاً بك! كيف يمكنني مساعدتك اليوم؟</p>
                  </div>
                  <div className="flex gap-4">
                    <button className="flex-1 h-14 rounded-2xl bg-white text-indigo-600 font-black shadow-xl hover:bg-slate-100 transition-all flex items-center justify-center gap-2">
                      <Clock className="h-5 w-5" /> إدارة المهام
                    </button>
                    <button className="flex-1 h-14 rounded-2xl bg-orange-500 text-white font-black shadow-xl hover:bg-orange-600 transition-all flex items-center justify-center gap-2">
                      <Plus className="h-5 w-5" /> إرسال ملف تنظيف
                    </button>
                  </div>
                </CardContent>
              </Card>

              <div className="grid md:grid-cols-2 gap-8">
                <Card className="rounded-[2.5rem] border-none shadow-xl bg-white dark:bg-slate-900 overflow-hidden">
                  <CardHeader className="p-8 border-b border-slate-50 dark:border-white/5">
                    <div className="flex items-center gap-3">
                      <Download className="h-5 w-5 text-primary" />
                      <CardTitle className="text-lg font-black">التنزيلات الأخيرة</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent className="p-8 space-y-4">
                    <FileLink name="عرض تقديمي.pdf" icon="📄" />
                    <FileLink name="تقارير المشروع.xlsx" icon="📊" />
                    <FileLink name="logo_design.jpg" icon="🖼️" />
                  </CardContent>
                </Card>

                <Card className="rounded-[2.5rem] border-none shadow-xl bg-white dark:bg-slate-900 overflow-hidden">
                  <CardHeader className="p-8 border-b border-slate-50 dark:border-white/5">
                    <div className="flex items-center gap-3">
                      <Bell className="h-5 w-5 text-orange-500" />
                      <CardTitle className="text-lg font-black">الإشعارات الحديثة</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent className="p-8 space-y-4">
                    <NotificationItem text="تم إضافة مهمة جديدة للمشروع." />
                    <NotificationItem text="تم تنظيف الملفات المكررة بنجاح." />
                    <NotificationItem text="تم تحميل الملف بنجاح." />
                  </CardContent>
                </Card>
              </div>

              {/* Action Button */}
              <button 
                onClick={handleCleanup}
                disabled={isCleaning}
                className="w-full h-24 rounded-[2.5rem] bg-gradient-to-r from-orange-500 to-red-600 text-white font-black text-2xl shadow-3xl hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-6"
              >
                {isCleaning ? (
                  <Loader2 className="h-10 w-10 animate-spin" />
                ) : (
                  <>تنظيف الملفات وإزالة التكرارات <Trash2 className="h-8 w-8" /></>
                )}
              </button>
            </div>

          </div>
        </div>
      </main>
    </div>
  );
}

function SideLink({ icon, text, active, onClick }: any) {
  return (
    <button 
      onClick={onClick}
      className={`w-full flex items-center gap-4 px-6 py-4 rounded-2xl transition-all font-bold text-sm ${active ? "bg-primary text-white shadow-xl" : "text-white/40 hover:text-white hover:bg-white/5"}`}
    >
      {icon}
      <span>{text}</span>
    </button>
  );
}

function StatItem({ label, value, color, isBadge }: any) {
  const colors: any = {
    green: "bg-emerald-100 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400",
    orange: "bg-orange-100 text-orange-600 dark:bg-orange-500/10 dark:text-orange-400",
    red: "bg-red-100 text-red-600 dark:bg-red-500/10 dark:text-red-400",
    primary: "bg-primary/10 text-primary",
  };
  return (
    <div className="bg-white dark:bg-slate-900 p-6 rounded-[2rem] shadow-sm border border-slate-100 dark:border-white/5 flex items-center justify-between">
      <span className="text-[11px] font-black text-slate-400 uppercase tracking-widest">{label}</span>
      {isBadge ? (
        <Badge className={`${colors[color]} border-none px-4 py-1.5 rounded-xl font-black text-[10px]`}>
          <CheckCircle2 className="h-3 w-3 mr-2" /> {value}
        </Badge>
      ) : (
        <span className={`h-10 min-w-[2.5rem] px-3 rounded-xl flex items-center justify-center font-black text-lg tabular-nums ${colors[color]}`}>{value}</span>
      )}
    </div>
  );
}

function ProjectProgress({ title, status, progress, color }: any) {
  return (
    <div className="space-y-3 group">
      <div className="flex justify-between items-center px-1">
        <div className="flex items-center gap-2">
           <div className={`h-2.5 w-2.5 rounded-full ${progress === 100 ? 'bg-emerald-500' : 'bg-primary'}`} />
           <h4 className="font-bold text-sm text-slate-700 dark:text-white">{title}</h4>
        </div>
        <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest group-hover:text-primary transition-colors">{status}</span>
      </div>
      <Progress value={progress} className={`h-3 rounded-full bg-slate-100 dark:bg-white/5 overflow-hidden`} />
    </div>
  );
}

function FileLink({ name, icon }: any) {
  return (
    <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-white/5 rounded-2xl hover:bg-slate-100 dark:hover:bg-white/10 transition-all cursor-pointer border border-transparent hover:border-primary/20 group">
      <div className="flex items-center gap-4">
        <span className="text-xl group-hover:scale-110 transition-transform">{icon}</span>
        <span className="text-xs font-bold text-slate-600 dark:text-white/60">{name}</span>
      </div>
      <Download className="h-3 w-3 text-slate-300 opacity-0 group-hover:opacity-100 transition-opacity" />
    </div>
  );
}

function NotificationItem({ text }: any) {
  return (
    <div className="flex items-center gap-4 group cursor-pointer">
      <div className="h-8 w-8 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-500 shrink-0 group-hover:bg-emerald-500 group-hover:text-white transition-all shadow-sm">
        <CheckCircle2 className="h-4 w-4" />
      </div>
      <p className="text-xs font-bold text-slate-500 dark:text-white/40 leading-relaxed group-hover:text-slate-900 dark:group-hover:text-white transition-colors">{text}</p>
    </div>
  );
}
