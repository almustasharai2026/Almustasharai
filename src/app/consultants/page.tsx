
"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Search, Loader2, Video, Users, Star } from "lucide-react";
import SovereignLayout from "@/components/SovereignLayout";
import { useFirestore, useCollection, useUser } from "@/firebase";
import { collection } from "firebase/firestore";
import { useMemoFirebase } from "@/firebase/provider";
import { motion } from "framer-motion";

export default function ConsultantsPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const db = useFirestore();
  const { data: consultants, isLoading } = useCollection(useMemoFirebase(() => db ? collection(db, "consultants") : null, [db]));

  const filtered = consultants?.filter(c => 
    c.name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <SovereignLayout activeId="consultants">
      <div className="space-y-10 py-4">
        <header className="space-y-4">
          <h1 className="text-4xl font-black text-white tracking-tight">مجلس الخبراء</h1>
          <div className="relative">
            <Search className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-600 h-4 w-4" />
            <input 
              placeholder="ابحث عن خبير.."
              className="w-full bg-[#252525] border border-white/5 h-14 rounded-2xl pr-12 pl-4 text-sm font-bold text-white outline-none focus:border-primary/30"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </header>

        <main className="space-y-4">
          {isLoading ? (
            <div className="flex justify-center py-20 opacity-20"><Loader2 className="animate-spin text-primary" /></div>
          ) : (
            <div className="grid gap-4">
              {filtered?.map((c) => (
                <Link key={c.id} href={`/consultants/${c.id}/call`}>
                  <Card className="bg-[#252525] border-white/5 rounded-[2.5rem] p-6 hover:border-primary/20 transition-all">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center text-primary font-black text-xl border border-primary/10">
                          {c.name?.charAt(0)}
                        </div>
                        <div>
                          <h3 className="text-lg font-black text-white">{c.name}</h3>
                          <p className="text-[10px] text-zinc-500 uppercase font-black tracking-widest">{c.specialization}</p>
                        </div>
                      </div>
                      <div className="flex flex-col items-end gap-2">
                        <div className="flex items-center gap-1 text-primary text-xs font-black">
                          <Star size={12} fill="currentColor" /> {c.rating || "5.0"}
                        </div>
                        <div className="bg-emerald-500/10 text-emerald-500 text-[8px] font-black uppercase px-2 py-1 rounded-full border border-emerald-500/20">
                          Online
                        </div>
                      </div>
                    </div>
                  </Card>
                </Link>
              ))}
            </div>
          )}
        </main>
      </div>
    </SovereignLayout>
  );
}
