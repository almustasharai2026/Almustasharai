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

/**
 * بوابة مجلس الخبراء السياديين:
 * تعرض قائمة المستشارين المعتمدين مع نظام مطابقة ذكي.
 */
export default function ConsultantsMarketplace() {
  const [searchTerm, setSearchTerm] = useState("");
  const { profile } = useUser();
  const db = useFirestore();

  // جلب الخبراء من المجموعة السيادية (Real-time)
  const consultantsQuery = useMemoFirebase(() => {
    if (!db) return null;
    return collection(db, "consultantProfiles");
  }, [db]);

  const { data: consultants, isLoading } = useCollection(consultantsQuery);

  // منطق البحث الذكي
  const filtered = consultants?.filter(c => 
    c.name?.toLowerCase().includes(searchTerm.toLowerCase()) || 
    c.specialty?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-[#02040a] text-white p-8 lg:p-20 font-sans" dir="rtl">
      
      {/* Directory Hero Section */}
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
            <p className="text-white/30 text-2xl font-bold max-w-2xl leading-relaxed">
              تحدث مباشرة مع كبار المستشارين في غرف فيديو مشفرة سيادياً.
            </p>
          </div>

          <div className="relative w-full md:w-[450px] group">
            <div className="absolute inset-0 bg-primary/10 blur-2xl opacity-0 group-focus-within:opacity-100 transition-opacity" />
            <Search className="absolute right-6 top-1/2 -translate-y-1/2 h-6 w-6 text-white/20 group-focus-within:text-primary transition-colors" />
            <Input 
              placeholder="ابحث عن خبير أو تخصص..." 
              className="glass-cosmic border-white/5 h-20 rounded-[2rem] pr-16 text-xl font-bold placeholder:text-white/10 shadow-3xl"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
      </header>

      {/* Main Marketplace Grid */}
      <main className="max-w-7xl mx-auto">
        <AnimatePresence mode="popLayout">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-40 gap-8 opacity-20">
               <Loader2 className="h-20 w-20 animate-spin text-primary" />
               <p className="text-2xl font-black tracking-[0.5em] uppercase">Authenticating Experts...</p>
            </div>
          ) : (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12"
            >
              {filtered?.map((c, i) => (
                <motion.div
                  key={c.id}
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1 }}
                >
                  <Card className="glass-card border-none rounded-[4rem] overflow-hidden group hover:scale-[1.03] transition-all duration-700 shadow-2xl relative bg-slate-950/40">
                    <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-transparent via-primary to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                    
                    {/* Portrait Area */}
                    <div className="relative h-80 w-full bg-[#050505]">
                      <Image 
                        src={`https://picsum.photos/seed/${c.id}/800/800`} 
                        alt={c.name} 
                        fill 
                        className="object-cover opacity-40 group-hover:opacity-100 group-hover:scale-110 transition-all duration-1000 grayscale group-hover:grayscale-0"
                        data-ai-hint="consultant portrait"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-[#050505] via-transparent to-transparent" />
                      
                      {/* Expert Badges */}
                      <div className="absolute top-6 right-6 flex flex-col gap-3 items-end">
                        <Badge className="bg-primary text-slate-950 px-6 py-2 rounded-full text-[10px] font-black shadow-2xl uppercase border-none">
                           {c.hourlyRate || 150} EGP / ساعة
                        </Badge>
                        {c.isOnline && (
                          <div className="flex items-center gap-2 bg-emerald-500/20 backdrop-blur-xl px-4 py-1.5 rounded-full border border-emerald-500/30">
                            <div className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                            <span className="text-[8px] font-black text-emerald-500 uppercase tracking-widest">Active Now</span>
                          </div>
                        )}
                      </div>
                    </div>

                    <CardHeader className="p-10 pb-4 relative">
                      <div className="flex justify-between items-center mb-6">
                        <div className="flex items-center gap-2 bg-white/5 px-4 py-1.5 rounded-full text-xs font-black text-primary border border-white/5">
                          <Star className="h-3.5 w-3.5 fill-primary" />
                          {c.rating || "5.0"}
                        </div>
                        <UserCheck className="h-6 w-6 text-white/10 group-hover:text-primary transition-colors" />
                      </div>
                      <CardTitle className="text-3xl font-black text-white">{c.name}</CardTitle>
                      <p className="text-primary font-black text-xs mt-3 uppercase tracking-widest flex items-center gap-2">
                         <Sparkles className="h-3 w-3" /> {c.specialty}
                      </p>
                    </CardHeader>

                    <CardContent className="px-10 pb-10">
                      <p className="text-sm text-white/30 leading-relaxed font-bold line-clamp-3">
                        {c.bio || "خبير قانوني بمرتبة سيادية، متخصص في فك شيفرات النزاعات المعقدة وصياغة المسارات القانونية الاستراتيجية."}
                      </p>
                    </CardContent>

                    <CardFooter className="p-10 pt-0">
                      <Link href={`/consultants/${c.id}/call`} className="w-full">
                        <Button className="w-full btn-primary h-20 rounded-[2rem] text-xl font-black shadow-2xl group/btn overflow-hidden relative border-none">
                          <span className="relative z-10 flex items-center justify-center gap-4">
                            <Video className="h-6 w-6 group-hover/btn:animate-bounce" /> انضم للغرفة السيادية
                          </span>
                          <div className="absolute inset-0 bg-white/10 translate-y-full group-hover/btn:translate-y-0 transition-transform duration-500" />
                        </Button>
                      </Link>
                    </CardFooter>
                  </Card>
                </motion.div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>

        {filtered?.length === 0 && !isLoading && (
          <div className="text-center py-60 space-y-10 grayscale opacity-20">
            <Gavel className="h-32 w-32 mx-auto" />
            <p className="text-4xl font-black">لم يتم العثور على خبير يطابق هذا البروتوكول.</p>
            <Button 
              variant="outline" 
              className="rounded-2xl h-14 px-10 font-black border-white/10" 
              onClick={() => setSearchTerm("")}
            >
              إعادة ضبط البحث
            </Button>
          </div>
        )}
      </main>

      {/* Footer Info */}
      <footer className="max-w-7xl mx-auto mt-40 pt-16 border-t border-white/5 flex justify-between items-center opacity-20">
         <div className="flex items-center gap-4 text-[9px] font-black uppercase tracking-[0.4em]">
            <Scale className="h-4 w-4" /> Sovereign Marketplace Protocol v4.5
         </div>
         <div className="text-[9px] font-black uppercase tracking-[0.4em]">
            Total Experts: {consultants?.length || 0}
         </div>
      </footer>
    </div>
  );
}
