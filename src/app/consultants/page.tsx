
"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Search, Star, Scale, Clock, Video, Activity, Gavel, Sparkles } from "lucide-react";
import { useFirestore, useCollection } from "@/firebase";
import { collection, query, where } from "firebase/firestore";
import { useMemoFirebase } from "@/firebase/provider";
import { motion } from "framer-motion";

export default function ConsultantsDirectory() {
  const [searchTerm, setSearchTerm] = useState("");
  const db = useFirestore();

  const consultantsQuery = useMemoFirebase(() => collection(db!, "consultantProfiles"), [db]);
  const { data: consultants, isLoading } = useCollection(consultantsQuery);

  const filtered = consultants?.filter(c => 
    c.name.includes(searchTerm) || 
    c.specialty.includes(searchTerm)
  );

  return (
    <div className="container mx-auto px-8 py-24 max-w-7xl text-right" dir="rtl">
      
      {/* Directory Hero */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-12 mb-24 relative">
        <div className="absolute -top-32 right-0 w-[500px] h-[500px] bg-primary/5 blur-[150px] -z-10" />
        <div className="space-y-6">
          <div className="inline-flex items-center gap-3 px-6 py-2 rounded-full bg-primary/10 text-primary text-[10px] font-black uppercase tracking-widest border border-primary/20">
             <Activity className="h-3 w-3 animate-pulse" /> Live Consultants Active
          </div>
          <h1 className="text-5xl md:text-7xl font-black text-white tracking-tighter leading-none">
            مجلس الخبراء <br /><span className="text-gradient">السياديين</span>
          </h1>
          <p className="text-white/30 text-2xl font-bold max-w-2xl leading-relaxed">
            تحدث مباشرة مع نخبة من كبار المستشارين والقضاة السابقين في غرف مشفرة سيادياً.
          </p>
        </div>
        <div className="relative w-full md:w-[450px]">
          <Search className="absolute right-6 top-1/2 -translate-y-1/2 h-6 w-6 text-white/20" />
          <Input 
            placeholder="ابحث عن خبير أو تخصص..." 
            className="pr-16 text-xl h-20 rounded-[2rem] glass-cosmic border-white/5 shadow-2xl placeholder:text-white/10"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* Grid of Experts */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-12">
        {filtered?.map((c, i) => (
          <motion.div
            key={c.id}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
          >
            <Card className="glass-cosmic border-none rounded-[4rem] overflow-hidden group hover:scale-[1.03] transition-all duration-700 shadow-2xl relative">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-primary to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              
              {/* Expert Profile Pic */}
              <div className="relative h-80 w-full bg-[#0a0a0a]">
                <Image 
                  src={c.image || `https://picsum.photos/seed/${c.id}/800/800`} 
                  alt={c.name} 
                  fill 
                  className="object-cover opacity-60 group-hover:opacity-100 group-hover:scale-110 transition-all duration-1000 grayscale group-hover:grayscale-0"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#050505] via-transparent to-transparent" />
                <div className="absolute top-6 right-6 bg-primary/90 text-slate-950 px-6 py-2 rounded-full text-xs font-black shadow-2xl">
                   {c.hourlyRate} EGP / ساعة
                </div>
                {c.isOnline && (
                  <div className="absolute top-6 left-6 flex items-center gap-2 bg-emerald-500/20 backdrop-blur-xl px-4 py-2 rounded-full border border-emerald-500/30">
                    <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                    <span className="text-[9px] font-black text-emerald-500 uppercase tracking-widest">Online</span>
                  </div>
                )}
              </div>

              <CardHeader className="p-10 pb-4 relative">
                <div className="flex justify-between items-center mb-6">
                  <div className="flex items-center gap-2 bg-white/5 px-4 py-1.5 rounded-full text-xs font-black text-primary border border-white/5">
                    <Star className="h-3.5 w-3.5 fill-primary" />
                    {c.rating}
                  </div>
                  <Gavel className="h-6 w-6 text-white/10 group-hover:text-primary transition-colors" />
                </div>
                <CardTitle className="text-3xl font-black text-white">{c.name}</CardTitle>
                <p className="text-primary font-black text-sm mt-3 uppercase tracking-tighter flex items-center gap-2">
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
                  <Button className="w-full btn-primary h-20 rounded-[2rem] text-xl font-black shadow-2xl group/btn overflow-hidden relative">
                    <span className="relative z-10 flex items-center justify-center gap-4">
                      <Video className="h-6 w-6 group-hover/btn:animate-bounce" /> انضم للغرفة الآن
                    </span>
                    <div className="absolute inset-0 bg-white/10 translate-y-full group-hover/btn:translate-y-0 transition-transform duration-500" />
                  </Button>
                </Link>
              </CardFooter>
            </Card>
          </motion.div>
        ))}
      </div>

      {isLoading && (
        <div className="flex flex-col items-center justify-center py-60 gap-8 opacity-20">
           <Loader2 className="h-24 w-24 animate-spin text-primary" />
           <p className="text-3xl font-black tracking-widest uppercase">Summoning Experts Hub...</p>
        </div>
      )}

      {filtered?.length === 0 && !isLoading && (
        <div className="text-center py-60 space-y-10 opacity-20">
          <Scale className="h-32 w-32 mx-auto" />
          <p className="text-4xl font-black">لم يتم العثور على خبير يطابق هذا البرتوكول.</p>
          <Button variant="outline" className="rounded-2xl h-14 px-10 font-black border-white/10" onClick={() => setSearchTerm("")}>إعادة ضبط البحث</Button>
        </div>
      )}
    </div>
  );
}
