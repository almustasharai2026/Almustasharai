
"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Search, Star, MapPin, Scale, Clock, Video } from "lucide-react";
import { useFirestore, useCollection } from "@/firebase";
import { collection } from "firebase/firestore";
import { useMemoFirebase } from "@/firebase/provider";

export default function ConsultantsPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const db = useFirestore();

  const consultantsQuery = useMemoFirebase(() => collection(db!, "consultantProfiles"), [db]);
  const { data: consultants, isLoading } = useCollection(consultantsQuery);

  const filtered = consultants?.filter(c => 
    c.name.includes(searchTerm) || 
    c.specialty.includes(searchTerm)
  );

  return (
    <div className="container mx-auto px-4 py-20 text-right" dir="rtl">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-16">
        <div className="space-y-4">
          <h1 className="text-4xl md:text-6xl font-black text-white">الاستشارة <span className="text-primary">الفورية</span></h1>
          <p className="text-muted-foreground text-xl">تحدث مباشرة مع نخبة من المستشارين المعتمدين صوتاً وصورة.</p>
        </div>
        <div className="relative w-full md:w-[400px]">
          <Search className="absolute right-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
          <Input 
            placeholder="ابحث عن مستشار أو تخصص..." 
            className="pr-12 text-lg h-14 rounded-2xl glass border-white/10"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-10">
        {filtered?.map((c) => (
          <Card key={c.id} className="glass-card border-none rounded-[3rem] overflow-hidden group hover:scale-[1.02] transition-all duration-500">
            <div className="relative h-64 w-full bg-slate-900">
              <Image 
                src={c.image || `https://picsum.photos/seed/${c.id}/600/400`} 
                alt={c.name} 
                fill 
                className="object-cover opacity-80 group-hover:opacity-100 transition-opacity"
              />
              <div className="absolute top-4 right-4 bg-primary/90 text-slate-950 px-4 py-1.5 rounded-full text-xs font-black shadow-xl">
                 {c.hourlyRate} EGP / ساعة
              </div>
            </div>
            <CardHeader className="p-8">
              <div className="flex justify-between items-start">
                <div className="flex items-center gap-1 bg-white/5 px-3 py-1.5 rounded-2xl text-xs font-bold text-primary">
                  <Star className="h-3.5 w-3.5 fill-primary" />
                  {c.rating}
                </div>
                <div className="text-right">
                  <CardTitle className="text-2xl font-black text-white">{c.name}</CardTitle>
                  <p className="text-primary font-bold text-sm mt-1">{c.specialty}</p>
                </div>
              </div>
            </CardHeader>
            <CardContent className="px-8 pb-8 space-y-4">
              <p className="text-sm text-white/40 line-clamp-2 leading-relaxed font-medium">
                {c.bio || "خبير قانوني متخصص يسعى لتقديم أفضل الاستشارات والحلول المبتكرة للقضايا المعقدة."}
              </p>
              <div className="flex items-center justify-end gap-2 text-xs text-white/30 font-bold">
                متاح الآن للاستصال المباشر <Clock className="h-4 w-4 text-emerald-500 animate-pulse" />
              </div>
            </CardContent>
            <CardFooter className="p-8 pt-0">
              <Link href={`/consultants/${c.id}/call`} className="w-full">
                <Button className="w-full cosmic-gradient h-16 rounded-2xl text-lg font-black shadow-xl group/btn">
                  <Video className="h-5 w-5 ml-2 group-hover:animate-bounce" /> حجز اتصال مباشر
                </Button>
              </Link>
            </CardFooter>
          </Card>
        ))}
      </div>

      {isLoading && (
        <div className="flex flex-col items-center justify-center py-40 gap-6 opacity-30">
           <div className="h-20 w-20 border-4 border-primary border-t-transparent rounded-full animate-spin" />
           <p className="text-2xl font-black">جاري استدعاء الخبراء...</p>
        </div>
      )}

      {filtered?.length === 0 && !isLoading && (
        <div className="text-center py-40 space-y-8 opacity-40 grayscale">
          <Scale className="h-20 w-20 mx-auto" />
          <p className="text-2xl font-black">لم نعثر على مستشار يطابق بحثك حالياً.</p>
          <Button variant="outline" className="rounded-2xl" onClick={() => setSearchTerm("")}>مسح البحث</Button>
        </div>
      )}
    </div>
  );
}
