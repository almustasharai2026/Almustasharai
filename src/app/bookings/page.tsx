"use client";

import { useUser, useFirestore, useCollection } from "@/firebase";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  CalendarDays, User, Gavel, Clock, CheckCircle2, XCircle, AlertCircle, Loader2, ArrowRight, BookOpen
} from "lucide-react";
import { collection, query, where, orderBy } from "firebase/firestore";
import { useMemoFirebase } from "@/firebase/provider";
import { motion } from "framer-motion";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function SovereignBookingsPage() {
  const { user, role } = useUser();
  const db = useFirestore();

  // بناء استعلام سيادي: المدير يرى الكل، المواطن يرى حجوزاته فقط
  const bookingsQuery = useMemoFirebase(() => {
    if (!db || !user) return null;
    const baseRef = collection(db, "bookings");
    if (role === "admin") {
      return query(baseRef, orderBy("createdAt", "desc"));
    }
    return query(baseRef, where("userId", "==", user.uid), orderBy("createdAt", "desc"));
  }, [db, user, role]);

  const { data: bookings, isLoading } = useCollection(bookingsQuery);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "confirmed":
        return <Badge className="bg-emerald-500/10 text-emerald-500 border-none px-4 py-1 font-black text-[10px] uppercase">Confirmed</Badge>;
      case "completed":
        return <Badge className="bg-blue-500/10 text-blue-500 border-none px-4 py-1 font-black text-[10px] uppercase">Completed</Badge>;
      case "cancelled":
        return <Badge className="bg-red-500/10 text-red-500 border-none px-4 py-1 font-black text-[10px] uppercase">Cancelled</Badge>;
      default:
        return <Badge className="bg-amber-500/10 text-amber-500 border-none px-4 py-1 font-black text-[10px] uppercase animate-pulse">Pending Review</Badge>;
    }
  };

  return (
    <div className="min-h-screen bg-[#02040a] text-white p-8 lg:p-20 font-sans" dir="rtl">
      <header className="max-w-6xl mx-auto mb-20 flex flex-col md:flex-row justify-between items-start md:items-end gap-8 relative">
        <div className="absolute -top-20 right-0 w-64 h-64 bg-primary/10 blur-[120px] -z-10" />
        <div className="space-y-6">
          <div className="sovereign-badge">
             <CalendarDays className="h-3 w-3" /> سجل التعاملات السيادية
          </div>
          <h1 className="text-5xl md:text-7xl font-black text-white tracking-tighter">أرشيف <span className="text-gradient">الحجوزات</span></h1>
          <p className="text-white/30 text-xl font-bold max-w-xl">توثيق كامل لكافة الجلسات الاستشارية المجدولة والمنفذة ضمن النظام.</p>
        </div>
        <Link href="/dashboard">
          <Button variant="ghost" className="text-white/40 hover:text-white gap-3 font-bold">
            <ArrowRight className="h-4 w-4" /> العودة للمركز
          </Button>
        </Link>
      </header>

      <main className="max-w-6xl mx-auto">
        {isLoading ? (
          <div className="py-40 flex flex-col items-center gap-8 opacity-20">
             <Loader2 className="h-16 w-16 animate-spin text-primary" />
             <p className="text-2xl font-black uppercase tracking-[0.5em]">Synchronizing Archive...</p>
          </div>
        ) : (
          <div className="grid gap-6">
            {bookings && bookings.length > 0 ? (
              bookings.map((b, i) => (
                <motion.div 
                  initial={{ opacity: 0, x: 20 }} 
                  animate={{ opacity: 1, x: 0 }} 
                  transition={{ delay: i * 0.05 }}
                  key={b.id}
                >
                  <Card className="glass-cosmic border-none rounded-[2.5rem] overflow-hidden group hover:border-primary/20 transition-all shadow-xl">
                    <CardContent className="p-8 flex flex-col md:flex-row items-center justify-between gap-8">
                      <div className="flex flex-col md:flex-row items-center gap-10">
                        <div className="h-20 w-20 rounded-[2rem] bg-white/5 flex items-center justify-center border border-white/10 group-hover:bg-primary/10 transition-colors">
                           <BookOpen className="h-10 w-10 text-primary" />
                        </div>
                        <div className="space-y-3 text-center md:text-right">
                           <div className="flex items-center justify-center md:justify-start gap-3">
                              <h3 className="text-2xl font-black text-white">حجز جلسة استشارية</h3>
                              {getStatusBadge(b.status)}
                           </div>
                           <div className="flex flex-wrap justify-center md:justify-start gap-6 text-white/40 text-sm font-bold">
                              <span className="flex items-center gap-2"><User className="h-4 w-4 text-primary" /> المواطن: {b.userId.substring(0, 8).toUpperCase()}</span>
                              <span className="flex items-center gap-2"><Gavel className="h-4 w-4 text-primary" /> الخبير: {b.consultantId.substring(0, 8).toUpperCase()}</span>
                              <span className="flex items-center gap-2"><Clock className="h-4 w-4 text-primary" /> {b.createdAt?.toDate ? b.createdAt.toDate().toLocaleString('ar-EG') : 'قيد المعالجة'}</span>
                           </div>
                        </div>
                      </div>
                      
                      <div className="flex flex-col items-center md:items-end gap-4">
                         <p className="text-3xl font-black text-white tabular-nums">{b.price} <span className="text-xs text-primary font-black">EGP</span></p>
                         <Button variant="outline" className="rounded-xl border-white/10 text-[10px] font-black uppercase tracking-widest hover:bg-white/5">
                           عرض التفاصيل السيادية
                         </Button>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))
            ) : (
              <div className="py-40 text-center glass rounded-[4rem] border-dashed border-white/5 space-y-8">
                 <AlertCircle className="h-20 w-20 mx-auto text-white/5" />
                 <div className="space-y-2">
                    <p className="text-3xl font-black text-white/20">لا توجد حجوزات مسجلة</p>
                    <p className="text-white/10 font-bold">ابدأ بحجز أول جلسة استشارية لك من سوق الخبراء.</p>
                 </div>
                 <Link href="/consultants">
                    <Button className="btn-primary h-14 px-10 rounded-2xl">استعرض الخبراء المعتمدين</Button>
                 </Link>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
