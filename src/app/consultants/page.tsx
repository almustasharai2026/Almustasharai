
"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Search, Star, Scale, Video, Activity, Gavel, Sparkles, Loader2, UserCheck } from "lucide-react";
import { useFirestore, useCollection, useUser } from "@/firebase";
import { collection } from "firebase/firestore";
import { useMemoFirebase } from "@/firebase/provider";
import { motion, AnimatePresence } from "framer-motion";

export default function ConsultantsMarketplace() {
  const [searchTerm, setSearchTerm] = useState("");
  const db = useFirestore();

  // جلب الخبراء من مسار /consultants الجديد
  const consultantsQuery = useMemoFirebase(() => {
    if (!db) return null;
    return collection(db, "consultants");
  }, [db]);

  const { data: consultants, isLoading } = useCollection(consultantsQuery);

  const filtered = consultants?.filter(c => 
    c.name?.toLowerCase().includes(searchTerm.toLowerCase()) || 
    c.specialization?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-[#02040a] text-white p-8 lg:p-20 font-sans" dir="rtl">
      <header className="max-w-7xl mx-auto mb-24 relative">
        <div className="absolute -top-40 right-0 w-[600px] h-[600px] bg-primary/5 blur-[200px] -z-10" />
        <div className="flex flex-col md:flex-row items-start md:items-end justify-between gap-12">
          <div className="space-y-6">
            <div className="sovereign-badge">
               <Activity className="h-3 w-3 animate-pulse" /> Verified Experts Network
            </div>
            <h1 className="text-6xl md:text-8xl font-black text-white tracking-tighter leading-none">
              مجلس الخبراء <br /><span className="text-gradient">السياديين</span>
            </h1>
          </div>
          <div className="relative w-full md:w-[450px]">
            <Search className="absolute right-6 top-1/2 -translate-y-1/2 h-6 w-6 text-white/20" />
            <Input 
              placeholder="ابحث عن خبير أو تخصص..." 
              className="glass-cosmic border-white/5 h-20 rounded-[2rem] pr-16 text-xl font-bold placeholder:text-white/10 shadow-3xl"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto">
        <AnimatePresence mode="popLayout">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-40 gap-8 opacity-20">
               <Loader2 className="h-20 w-20 animate-spin text-primary" />
               <p className="text-2xl font-black tracking-[0.5em] uppercase">Authenticating Experts...</p>
            </div>
          ) : (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12">
              {filtered?.map((c, i) => (
                <motion.div key={c.id} initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}>
                  <Card className="glass-card border-none rounded-[4rem] overflow-hidden group hover:scale-[1.03] transition-all duration-700 shadow-2xl relative bg-slate-950/40">
                    <div className="relative h-80 w-full bg-[#050505]">
                      <Image src={`https://picsum.photos/seed/${c.id}/800/800`} alt={c.name} fill className="object-cover opacity-40 group-hover:opacity-100 transition-all duration-1000 grayscale group-hover:grayscale-0" />
                      <div className="absolute inset-0 bg-gradient-to-t from-[#050505] via-transparent to-transparent" />
                    </div>
                    <CardHeader className="p-10 pb-4">
                      <div className="flex justify-between items-center mb-6">
                        <div className="flex items-center gap-2 bg-white/5 px-4 py-1.5 rounded-full text-xs font-black text-primary border border-white/5">
                          <Star className="h-3.5 w-3.5 fill-primary" />
                          {c.rating || "5.0"}
                        </div>
                      </div>
                      <CardTitle className="text-3xl font-black text-white">{c.name}</CardTitle>
                      <p className="text-primary font-black text-xs mt-3 uppercase tracking-widest flex items-center gap-2">
                         <Sparkles className="h-3 w-3" /> {c.specialization}
                      </p>
                    </CardHeader>
                    <CardFooter className="p-10 pt-0">
                      <Link href={`/consultants/${c.id}/call`} className="w-full">
                        <Button className="w-full btn-primary h-20 rounded-[2rem] text-xl font-black shadow-2xl">
                          انضم للغرفة السيادية
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
