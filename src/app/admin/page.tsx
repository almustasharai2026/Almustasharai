"use client";

import { useUser, useFirestore, useCollection } from "@/firebase";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Users, Wallet, Gavel, CheckCircle, XCircle, 
  Loader2, TrendingUp, Activity, Search, ShieldAlert,
  ArrowUpRight, Users2, DollarSign, MessageSquare
} from "lucide-react";
import { collection, updateDoc, doc, increment, query, orderBy, onSnapshot } from "firebase/firestore";
import { useMemoFirebase } from "@/firebase/provider";
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area
} from "recharts";
import { Input } from "@/components/ui/input";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";

const REVENUE_DATA = [
  { name: 'السبت', val: 1400 },
  { name: 'الأحد', val: 2300 },
  { name: 'الإثنين', val: 1600 },
  { name: 'الثلاثاء', val: 3800 },
  { name: 'الأربعاء', val: 2500 },
  { name: 'الخميس', val: 4900 },
  { name: 'الجمعة', val: 3700 },
];

export default function SupremeSaaSAdmin() {
  const { user } = useUser();
  const db = useFirestore();
  const { toast } = useToast();
  const [isProcessing, setIsProcessing] = useState<string | null>(null);
  const [searchQuery, setSearchTerm] = useState("");

  const paymentQuery = useMemoFirebase(() => query(collection(db!, "paymentRequests"), orderBy("createdAt", "desc")), [db]);
  const { data: requests } = useCollection(paymentQuery);

  const usersQuery = useMemoFirebase(() => collection(db!, "users"), [db]);
  const { data: allUsers } = useCollection(usersQuery);

  if (user?.email !== "bishoysamy390@gmail.com") {
    return (
      <div className="h-screen flex flex-col items-center justify-center gap-6 bg-slate-950 p-10 text-center" dir="rtl">
        <div className="h-32 w-32 rounded-[3rem] bg-red-500/10 flex items-center justify-center border-2 border-red-500/20 shadow-[0_0_50px_rgba(239,68,68,0.2)]">
           <ShieldAlert className="h-16 w-16 text-red-500" />
        </div>
        <h1 className="text-4xl font-black text-white tracking-tighter uppercase">Forbidden Sovereign Zone</h1>
        <p className="text-xl text-white/30 font-bold max-w-md">هذه المنطقة محمية ببروتوكولات الأمان السيادي. لا تملك صلاحية الوصول.</p>
        <Link href="/">
          <Button className="btn-primary px-10 h-14 rounded-2xl font-black">العودة للأمان</Button>
        </Link>
      </div>
    );
  }

  const handleApprove = async (req: any) => {
    setIsProcessing(req.id);
    try {
      await updateDoc(doc(db!, "users", req.userId), { 
        balance: increment(req.amount),
        updatedAt: new Date().toISOString()
      });
      await updateDoc(doc(db!, "paymentRequests", req.id), { 
        status: "approved",
        updatedAt: new Date().toISOString()
      });
      toast({ title: "تم التصديق المالي", description: `تم شحن رصيد ${req.userName} بنجاح.` });
    } catch (e) {
      toast({ variant: "destructive", title: "خطأ في البروتوكول", description: "فشل تحديث السجل المالي." });
    } finally {
      setIsProcessing(null);
    }
  };

  const handleReject = async (reqId: string) => {
    setIsProcessing(reqId);
    try {
      await updateDoc(doc(db!, "paymentRequests", reqId), { 
        status: "rejected",
        updatedAt: new Date().toISOString()
      });
      toast({ title: "تم الرفض", description: "تم استبعاد طلب الشحن." });
    } catch (e) {
      toast({ variant: "destructive", title: "خطأ", description: "فشل تحديث الحالة." });
    } finally {
      setIsProcessing(null);
    }
  };

  return (
    <div className="container mx-auto px-8 py-20 max-w-7xl" dir="rtl">
      
      {/* Supreme Admin Header */}
      <header className="glass-cosmic p-16 rounded-[5rem] mb-20 relative overflow-hidden flex flex-col md:flex-row items-center justify-between gap-12 border-primary/20 shadow-[0_0_100px_rgba(37,99,235,0.1)]">
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-primary/5 blur-[150px] -z-10" />
        <div className="text-right space-y-6">
          <div className="inline-flex items-center gap-3 px-6 py-2 rounded-full bg-primary/10 text-primary text-[10px] font-black uppercase tracking-widest border border-primary/20">
             <Activity className="h-3 w-3 animate-pulse" /> Supreme Sovereign Control
          </div>
          <h1 className="text-6xl md:text-7xl font-black text-white tracking-tighter">
            غرفة القيادة <span className="text-primary">المالية</span>
          </h1>
          <p className="text-2xl text-white/30 font-bold max-w-2xl leading-relaxed">
            السيطرة الكاملة على التدفق المالي، إدارة المواطنين، ومراقبة استقرار الأنظمة الرقمية.
          </p>
        </div>
        <div className="h-48 w-48 rounded-[4rem] glass-cosmic flex items-center justify-center border-primary/30 shadow-2xl relative group">
           <Gavel className="h-20 w-20 text-primary group-hover:scale-110 transition-transform duration-700" />
           <div className="absolute inset-0 rounded-[4rem] border border-primary/50 animate-ping opacity-20" />
        </div>
      </header>

      {/* Global Intel Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-20">
        <IntelCard title="إجمالي المواطنين" val={allUsers?.length || 0} icon={<Users2 />} color="blue" />
        <IntelCard title="طلبات معلقة" val={requests?.filter(r => r.status === 'pending').length || 0} icon={<Wallet />} color="amber" />
        <IntelCard title="إجمالي الإيرادات" val="١٢٤,٥٠٠" icon={<DollarSign />} color="emerald" suffix="EGP" />
        <IntelCard title="المحادثات الحية" val="٥٤٢" icon={<MessageSquare />} color="violet" />
      </div>

      <div className="grid lg:grid-cols-12 gap-12">
        {/* Main Console: Requests */}
        <div className="lg:col-span-8 space-y-12">
          <Card className="glass-cosmic border-none rounded-[4rem] p-12 shadow-2xl relative overflow-hidden">
            <div className="flex items-center justify-between mb-12">
               <div className="space-y-2">
                 <h3 className="text-3xl font-black text-white flex items-center gap-5">
                   طلبات الشحن النشطة <div className="h-3 w-3 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_15px_rgba(16,185,129,0.5)]" />
                 </h3>
                 <p className="text-sm text-white/20 font-bold">انتظار التصديق المالي النهائي.</p>
               </div>
               <div className="relative w-64">
                  <Search className="absolute right-4 top-1/2 -translate-y-1/2 h-4 w-4 text-white/20" />
                  <Input 
                    placeholder="بحث في السجلات..." 
                    className="glass border-white/5 h-12 rounded-2xl pr-12 text-xs"
                    value={searchQuery}
                    onChange={e => setSearchTerm(e.target.value)}
                  />
               </div>
            </div>

            <div className="space-y-6">
              {requests?.filter(r => r.status === "pending" && r.userName.includes(searchQuery)).map(req => (
                <motion.div 
                  key={req.id} 
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="p-8 glass-cosmic rounded-[2.5rem] flex flex-col md:flex-row justify-between items-center border-white/5 hover:bg-white/[0.03] transition-all group"
                >
                  <div className="flex items-center gap-8 mb-6 md:mb-0">
                    <div className="h-16 w-16 rounded-3xl bg-primary/10 flex items-center justify-center text-primary font-black text-xl shadow-xl">
                       {req.userName.charAt(0)}
                    </div>
                    <div>
                      <p className="text-2xl font-black text-white group-hover:text-primary transition-colors">{req.userName}</p>
                      <div className="flex items-center gap-3 mt-2">
                        <Badge className="bg-white/5 text-white/40 border-none font-bold text-[9px] px-3">{new Date(req.createdAt).toLocaleDateString('ar')}</Badge>
                        <span className="text-white/20 text-xs font-bold">UID: {req.userId.slice(0, 8)}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-10">
                    <div className="text-left">
                       <p className="text-[10px] text-white/20 font-black uppercase mb-1">المبلغ المطلوب</p>
                       <p className="text-3xl font-black text-emerald-400 tabular-nums">{req.amount} <span className="text-xs">EGP</span></p>
                    </div>
                    <div className="h-12 w-px bg-white/5" />
                    <div className="flex gap-3">
                      <button 
                        onClick={() => handleApprove(req)} 
                        disabled={isProcessing === req.id}
                        className="h-14 px-8 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-sm transition-all shadow-xl shadow-emerald-900/20"
                      >
                        {isProcessing === req.id ? <Loader2 className="animate-spin" /> : "تصديق وشحن"}
                      </button>
                      <button 
                        onClick={() => handleReject(req.id)}
                        disabled={isProcessing === req.id}
                        className="h-14 px-6 rounded-2xl text-red-500 font-bold hover:bg-red-500/10 transition-all"
                      >
                        رفض
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))}
              
              {requests?.filter(r => r.status === "pending").length === 0 && (
                <div className="py-32 text-center opacity-10">
                   <CheckCircle className="h-24 w-24 mx-auto mb-6" />
                   <p className="text-2xl font-black">كافة السجلات المالية نظيفة ومصدقة</p>
                </div>
              )}
            </div>
          </Card>
        </div>

        {/* Intelligence Side Console */}
        <div className="lg:col-span-4 space-y-12">
          <Card className="glass-cosmic border-none rounded-[4rem] p-12 h-full relative overflow-hidden">
             <div className="absolute bottom-0 left-0 w-full h-1/2 bg-gradient-to-t from-primary/5 to-transparent -z-10" />
             <div className="flex items-center justify-between mb-12">
                <h3 className="text-xl font-black text-white">النمو الاستراتيجي</h3>
                <TrendingUp className="h-5 w-5 text-primary" />
             </div>
             
             <div className="space-y-10">
                <div className="h-[300px] w-full mt-10">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={REVENUE_DATA}>
                      <defs>
                        <linearGradient id="colorVal" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#2563eb" stopOpacity={0.3}/>
                          <stop offset="95%" stopColor="#2563eb" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <Tooltip 
                        contentStyle={{ backgroundColor: '#0a0a0a', border: '1px solid #ffffff10', borderRadius: '20px', padding: '15px' }}
                        itemStyle={{ color: '#2563eb', fontWeight: 'bold' }}
                      />
                      <Area type="monotone" dataKey="val" stroke="#2563eb" strokeWidth={4} fillOpacity={1} fill="url(#colorVal)" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>

                <div className="space-y-6">
                   <p className="text-[10px] text-white/30 font-black uppercase tracking-widest">توزيع الأدوار</p>
                   <RoleStat label="المستشارين" percent={85} color="blue" />
                   <RoleStat label="المحامين" percent={62} color="emerald" />
                   <RoleStat label="الموثقين" percent={40} color="amber" />
                </div>
             </div>
          </Card>
        </div>
      </div>
    </div>
  );
}

function IntelCard({ title, val, icon, color, suffix }: any) {
  const colors: any = {
    blue: "text-blue-400 bg-blue-500/10",
    amber: "text-amber-400 bg-amber-500/10",
    emerald: "text-emerald-400 bg-emerald-500/10",
    violet: "text-violet-400 bg-violet-500/10"
  };

  return (
    <Card className="glass-cosmic border-none rounded-[3.5rem] p-10 group hover:scale-105 transition-all duration-500 cursor-default">
       <div className={`h-16 w-16 rounded-[1.8rem] ${colors[color]} flex items-center justify-center mb-8 group-hover:scale-110 group-hover:rotate-6 transition-all duration-500`}>
          {icon}
       </div>
       <p className="text-[10px] text-white/20 font-black uppercase mb-2 tracking-[0.2em]">{title}</p>
       <p className="text-4xl font-black text-white tabular-nums">
         {val} {suffix && <span className="text-xs text-white/20">{suffix}</span>}
       </p>
    </Card>
  );
}

function RoleStat({ label, percent, color }: any) {
  const colors: any = {
    blue: "bg-blue-500",
    emerald: "bg-emerald-500",
    amber: "bg-amber-500"
  };

  return (
    <div className="space-y-3">
      <div className="flex justify-between text-xs font-bold">
        <span className="text-white/40">{label}</span>
        <span className="text-white">{percent}%</span>
      </div>
      <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden">
        <motion.div 
          initial={{ width: 0 }}
          whileInView={{ width: `${percent}%` }}
          transition={{ duration: 1.5, ease: "easeOut" }}
          className={`h-full ${colors[color]} shadow-[0_0_10px_rgba(0,0,0,0.5)]`} 
        />
      </div>
    </div>
  );
}