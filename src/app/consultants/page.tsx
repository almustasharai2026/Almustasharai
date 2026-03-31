"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Search, Star, Loader2, Sparkles, CalendarCheck, Activity, Video } from "lucide-react";
import { useFirestore, useCollection, useUser } from "@/firebase";
import { collection } from "firebase/firestore";
import { useMemoFirebase } from "@/firebase/provider";
import { motion, AnimatePresence } from "framer-motion";
import { createSovereignBooking } from "@/lib/sovereign-booking";
import { payForSovereignSession } from "@/lib/sovereign-wallet";
import { useToast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";

export default function ConsultantsMarketplace() {
  const [searchTerm, setSearchTerm] = useState("");
  const db = useFirestore();
  const { user, profile } = useUser();
  const { toast } = useToast();
  const router = useRouter();

  const consultantsQuery = useMemoFirebase(() => {
    if (!db) return null;
    return collection(db, "consultants");
  }, [db]);

  const { data: consultants, isLoading } = useCollection(consultantsQuery);

  const filtered = consultants?.filter(c => 
    c.name?.toLowerCase().includes(searchTerm.toLowerCase()) || 
    c.specialization?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleBooking = (consultant: any) => {
    if (!user || !db) {
      toast({ variant: "destructive", title: "بروتوكول مجهول", description: "يجب تسجيل الدخول لتفعيل ميزات الحجز السيادي." });
      router.push("/auth/login");
      return;
    }

    const price = 50; 
    const currentBalance = profile?.balance || 0;
    if (currentBalance < price && profile?.role !== 'admin') {
      toast({ variant: "destructive", title: "رصيد غير كافٍ", description: `تكلفة الجلسة ${price} EGP. رصيدك الحالي: ${currentBalance} EGP.` });
      router.push("/pricing");
      return;
    }

    try {
      payForSovereignSession(db, user.uid, consultant.id, price);
      createSovereignBooking(db, user.uid, consultant.id, price);
      toast({ title: "تم الحجز بنجاح 🚀", description: `تم خصم ${price} EGP وتوثيق طلبك مع المستشار ${consultant.name}.` });
    } catch (error: any) {
      toast({ variant: "destructive", title: "فشل في البروتوكول" });
    }
  };

  return (
    <div className="min-h-screen bg-[#f8f9fc] dark:bg-[#02040a] text-slate-900 dark:text-white p-8 lg:p-20 font-sans" dir="rtl">
      <header className="max-w-7xl mx-auto mb-24 relative">
        <div className="absolute -top-40 right-0 w-[600px] h-[600px] bg-primary/5 blur-[200px] -z-10" />
        <div className="flex flex-col md:flex-row items-start md:items-end justify-between gap-12 text-right">
          <div className="space-y-6">
            <div className="sovereign-badge">
               <Activity className="h-3 w-3 animate-pulse" /> مجلس الخبراء المعتمدين
            </div>
            <h1 className="text-6xl md:text-8xl font-black text-slate-900 dark:text-white tracking-tighter leading-none">
              سوق الخبراء <br /><span className="text-gradient">السياديين</span>
            </h1>
          </div>
          <div className="relative w-full md:w-[450px]">
            <Search className="absolute right-6 top-1/2 -translate-y-1/2 h-6 w-6 text-slate-400 dark:text-white/20" />
            <Input 
              placeholder="ابحث عن خبير أو تخصص..." 
              className="bg-white dark:bg-white/5 border-border dark:border-white/5 h-20 rounded-[2rem] pr-16 text-xl font-bold placeholder:text-slate-300 dark:placeholder:text-white/10 shadow-3xl text-right"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto">
        <AnimatePresence mode="popLayout">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-40 gap-8 opacity-20 text-primary">
               <Loader2 className="h-20 w-20 animate-spin" />
               <p className="text-2xl font-black tracking-[0.5em] uppercase">Authenticating Experts...</p>
            </div>
          ) : (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12">
              {filtered?.map((c, i) => (
                <motion.div key={c.id} initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}>
                  <Card className="border-none rounded-[4rem] overflow-hidden group hover:scale-[1.03] transition-all duration-700 shadow-2xl relative bg-white dark:bg-slate-950/40 border border-border dark:border-white/5">
                    <div className="relative h-80 w-full bg-slate-100 dark:bg-[#050505]">
                      <Image 
                        src={`https://picsum.photos/seed/${c.id}/800/800`} 
                        alt={c.name} 
                        fill 
                        className="object-cover opacity-80 dark:opacity-40 group-hover:opacity-100 transition-all duration-1000 grayscale group-hover:grayscale-0" 
                        data-ai-hint="expert portrait"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-white dark:from-[#050505] via-transparent to-transparent" />
                    </div>
                    <CardHeader className="p-10 pb-4 text-right">
                      <div className="flex justify-between items-center mb-6">
                        <div className="flex items-center gap-2 bg-slate-100 dark:bg-white/5 px-4 py-1.5 rounded-full text-xs font-black text-primary border border-border dark:border-white/5">
                          <Star className="h-3.5 w-3.5 fill-primary" />
                          {c.rating || "5.0"}
                        </div>
                        <Badge className="bg-primary/10 text-primary border-none font-black">٥٠ EGP / جلسة</Badge>
                      </div>
                      <CardTitle className="text-3xl font-black text-slate-900 dark:text-white">{c.name}</CardTitle>
                      <p className="text-primary font-black text-xs mt-3 uppercase tracking-widest flex items-center gap-2 justify-end">
                         {c.specialization} <Sparkles className="h-3 w-3" />
                      </p>
                    </CardHeader>
                    <CardFooter className="p-10 pt-0 flex flex-col gap-4">
                      <Button 
                        onClick={() => handleBooking(c)}
                        className="w-full bg-gradient-to-r from-primary to-indigo-700 hover:from-primary hover:to-indigo-800 text-white h-20 rounded-[2rem] text-xl font-black shadow-2xl gap-3 group/btn overflow-hidden relative"
                      >
                        <span className="relative z-10 flex items-center gap-3">
                          <CalendarCheck className="h-6 w-6" /> حجز جلسة (٥٠ EGP)
                        </span>
                        <div className="absolute inset-0 bg-white/10 translate-y-full group-hover/btn:translate-y-0 transition-transform duration-500" />
                      </Button>
                      <Link href={`/consultants/${c.id}/call`} className="w-full">
                        <Button variant="outline" className="w-full h-14 rounded-2xl border-border dark:border-white/5 text-slate-400 dark:text-white/40 hover:text-primary dark:hover:text-white font-black text-xs uppercase tracking-widest transition-all">
                          دخول الغرفة (للحالات النشطة)
                        </Button>
                      </Link>
                    </CardFooter>
                  </Card>
                </motion.div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}