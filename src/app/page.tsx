
"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Plus, Mic, ArrowUp, Star, MoreHorizontal, 
  LayoutGrid, Clock, BookOpen, Search, Menu, 
  Scale, Share2, Sparkles, Map, Paperclip
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useUser, useFirestore, useCollection } from "@/firebase";
import { collection, query, orderBy, limit } from "firebase/firestore";
import { useMemoFirebase } from "@/firebase/provider";
import Image from "next/image";

export default function LovableInspiredPage() {
  const { user } = useUser();
  const db = useFirestore();
  const [activeTab, setActiveTab] = useState("my-projects");
  const [prompt, setInput] = useState("");

  const sessionsQuery = useMemoFirebase(() => user ? query(
    collection(db!, "users", user.uid, "chatSessions"), 
    orderBy("lastMessageAt", "desc"),
    limit(6)
  ) : null, [db, user]);
  
  const { data: recentSessions } = useCollection(sessionsQuery);

  return (
    <div className="min-h-screen bg-[#050505] text-white overflow-x-hidden" dir="rtl">
      
      {/* Background Ambient Glows */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-1/2 -translate-x-1/2 w-[1000px] h-[600px] bg-blue-600/10 blur-[120px] rounded-full opacity-50" />
        <div className="absolute bottom-[-20%] left-[-10%] w-[600px] h-[600px] bg-purple-600/10 blur-[100px] rounded-full opacity-30" />
        <div className="absolute top-[20%] right-[-10%] w-[500px] h-[500px] bg-amber-500/5 blur-[100px] rounded-full opacity-20" />
      </div>

      {/* Main Container */}
      <div className="relative z-10 max-w-5xl mx-auto px-6 pt-32 pb-40">
        
        {/* Hero Header */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center space-y-12 mb-16"
        >
          <h1 className="text-4xl md:text-5xl font-black tracking-tight text-white/90 leading-tight">
            ما الذي يشغل بالك، يا مستشار؟
          </h1>

          {/* Magic Prompt Box */}
          <div className="max-w-2xl mx-auto relative group">
            <div className="absolute -inset-1 bg-gradient-to-r from-blue-600/20 to-purple-600/20 rounded-[2.5rem] blur opacity-25 group-hover:opacity-100 transition duration-1000 group-hover:duration-200" />
            <div className="relative glass-cosmic rounded-[2rem] border-white/5 p-2 flex items-center gap-2 shadow-2xl shadow-black/50">
              <Button variant="ghost" size="icon" className="h-12 w-12 rounded-2xl text-white/20 hover:text-white transition-all">
                <Plus className="h-6 w-6" />
              </Button>
              
              <input 
                value={prompt}
                onChange={(e) => setInput(e.target.value)}
                placeholder="اسأل المستشار للبدء في استشارة أو صياغة عقد..."
                className="flex-1 bg-transparent border-none focus:ring-0 text-lg font-medium p-4 placeholder:text-white/10"
              />

              <div className="flex items-center gap-1 ml-2">
                <Button variant="ghost" size="icon" className="h-10 w-10 rounded-xl text-white/20 hover:text-white">
                  <Map className="h-5 w-5" />
                </Button>
                <Button variant="ghost" size="icon" className="h-10 w-10 rounded-xl text-white/20 hover:text-white">
                  <Mic className="h-5 w-5" />
                </Button>
                <Link href={`/bot?q=${encodeURIComponent(prompt)}`}>
                  <Button className="h-12 w-12 rounded-2xl bg-white text-black hover:bg-white/90 shadow-xl ml-1">
                    <ArrowUp className="h-6 w-6" />
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Content Section */}
        <section className="space-y-10">
          
          {/* Tabs */}
          <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-hide">
            <TabButton 
              active={activeTab === "my-projects"} 
              onClick={() => setActiveTab("my-projects")}
              label="استشاراتي"
            />
            <TabButton 
              active={activeTab === "recently-viewed"} 
              onClick={() => setActiveTab("recently-viewed")}
              label="تمت مشاهدتها مؤخراً"
            />
            <TabButton 
              active={activeTab === "templates"} 
              onClick={() => setActiveTab("templates")}
              label="نماذج جاهزة"
            />
          </div>

          {/* Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-8">
            {recentSessions?.map((session, i) => (
              <motion.div
                key={session.id}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.1 }}
              >
                <Link href={`/bot?sessionId=${session.id}`}>
                  <CardProject session={session} />
                </Link>
              </motion.div>
            ))}
            
            {/* If empty, show placeholders */}
            {(!recentSessions || recentSessions.length === 0) && (
              <>
                <PlaceholderCard title="استشارة قانونية في العقارات" />
                <PlaceholderCard title="مراجعة عقد توريد تجاري" />
              </>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}

function TabButton({ active, onClick, label }: any) {
  return (
    <button 
      onClick={onClick}
      className={`px-6 py-2.5 rounded-xl text-sm font-bold transition-all whitespace-nowrap border ${
        active 
        ? 'bg-white text-black border-white shadow-lg' 
        : 'bg-white/5 text-white/40 border-white/5 hover:bg-white/10 hover:text-white'
      }`}
    >
      {label}
    </button>
  );
}

function CardProject({ session }: any) {
  return (
    <div className="group space-y-4">
      <div className="relative aspect-video rounded-[2.5rem] overflow-hidden glass border border-white/5 shadow-2xl">
        <Image 
          src={`https://picsum.photos/seed/${session.id}/800/450`} 
          alt="Preview" 
          fill 
          className="object-cover opacity-40 group-hover:opacity-60 group-hover:scale-105 transition-all duration-700 grayscale group-hover:grayscale-0"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-60" />
        <button className="absolute top-6 right-6 h-10 w-10 glass border border-white/10 rounded-xl flex items-center justify-center text-white/20 hover:text-amber-400 transition-colors">
          <Star className="h-5 w-5" />
        </button>
      </div>
      
      <div className="flex items-center justify-between px-4">
        <div className="flex items-center gap-4">
          <div className="h-10 w-10 rounded-full bg-indigo-600 flex items-center justify-center font-black text-sm shadow-lg border border-white/10">
            {session.title?.charAt(0) || "M"}
          </div>
          <div className="space-y-0.5">
            <h3 className="font-bold text-lg text-white/90 group-hover:text-primary transition-colors truncate max-w-[200px]">
              {session.title || "عنوان الاستشارة"}
            </h3>
            <p className="text-[10px] text-white/20 font-black uppercase tracking-widest">
              عدلت منذ {new Date(session.lastMessageAt).toLocaleDateString('ar-EG')}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3 text-white/10">
          <button className="hover:text-white transition-colors"><Share2 className="h-4 w-4" /></button>
          <button className="hover:text-white transition-colors"><MoreHorizontal className="h-4 w-4" /></button>
        </div>
      </div>
    </div>
  );
}

function PlaceholderCard({ title }: { title: string }) {
  return (
    <div className="group space-y-4 opacity-40 hover:opacity-100 transition-opacity">
      <div className="relative aspect-video rounded-[2.5rem] overflow-hidden glass border border-white/5 shadow-2xl bg-white/5 flex items-center justify-center">
        <Scale className="h-16 w-16 text-white/5" />
      </div>
      <div className="flex items-center gap-4 px-4">
        <div className="h-10 w-10 rounded-full bg-white/5 flex items-center justify-center" />
        <div className="space-y-1 flex-1">
          <div className="h-4 bg-white/10 rounded-full w-2/3" />
          <div className="h-2 bg-white/5 rounded-full w-1/3" />
        </div>
      </div>
    </div>
  );
}
