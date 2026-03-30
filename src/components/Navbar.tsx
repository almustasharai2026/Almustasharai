"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Sun, Moon, User, LayoutDashboard, Sparkles, Lock, Coins, ChevronDown, LogOut, Gavel, Menu, Search, Bell, Scale } from "lucide-react";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { useUser, useFirestore } from "@/firebase";
import { doc, onSnapshot } from "firebase/firestore";
import { motion } from "framer-motion";

const SovereignLogo = () => (
  <div className="flex items-center gap-3 group">
    <div className="h-10 w-10 rounded-2xl bg-indigo-600 flex items-center justify-center shadow-[0_0_20px_rgba(99,102,241,0.4)] group-hover:scale-110 transition-all duration-500">
      <Scale className="h-5 w-5 text-white" />
    </div>
    <div className="flex flex-col -space-y-1">
      <span className="font-black text-xl tracking-tight text-white">المستشار</span>
      <span className="text-[8px] font-black uppercase tracking-[0.4em] text-indigo-400">AI Sovereign</span>
    </div>
  </div>
);

export function Navbar() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const { user } = useUser();
  const db = useFirestore();
  const [userData, setUserData] = useState<any>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!db || !user) {
      setUserData(null);
      return;
    }
    const unsub = onSnapshot(doc(db, "users", user.uid), (doc) => {
      setUserData(doc.data());
    });
    return () => unsub();
  }, [db, user]);

  if (!mounted) return null;

  return (
    <motion.nav 
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className="fixed top-6 left-1/2 -translate-x-1/2 z-[100] w-full max-w-6xl px-6"
    >
      <div className="glass-cosmic border-white/10 h-16 rounded-[1.8rem] px-6 flex items-center justify-between shadow-2xl">
        
        <div className="flex items-center gap-8">
          <Link href="/">
            <SovereignLogo />
          </Link>
          
          <div className="hidden lg:flex items-center gap-6">
            <NavLink href="/bot">البوت</NavLink>
            <NavLink href="/templates">المكتبة</NavLink>
            <NavLink href="/consultants">الخبراء</NavLink>
            <NavLink href="/pricing">الباقات</NavLink>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="hidden md:flex items-center gap-1.5 glass bg-white/5 rounded-2xl px-4 h-10 border-white/5">
             <Search className="h-3.5 w-3.5 text-white/20" />
             <input placeholder="بحث..." className="bg-transparent border-none text-[10px] font-bold focus:ring-0 w-24 placeholder:text-white/10" />
          </div>

          <div className="h-10 w-px bg-white/5 mx-2" />

          {user ? (
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="icon" className="h-10 w-10 rounded-xl text-white/20 hover:text-white hover:bg-white/5 relative">
                <Bell className="h-5 w-5" />
                <span className="absolute top-2.5 right-2.5 h-1.5 w-1.5 bg-indigo-500 rounded-full border-2 border-slate-950" />
              </Button>
              
              <Link href="/dashboard">
                <div className="h-10 w-10 rounded-2xl border-2 border-indigo-500/30 overflow-hidden hover:scale-105 transition-all p-0.5">
                  <div className="h-full w-full rounded-xl bg-indigo-600 flex items-center justify-center font-black text-xs">
                    {user.email?.charAt(0).toUpperCase()}
                  </div>
                </div>
              </Link>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link href="/auth/login">
                <Button variant="ghost" className="text-white/60 font-black text-xs hover:text-white">دخول</Button>
              </Link>
              <Link href="/auth/signup">
                <Button className="btn-primary h-10 px-6 rounded-xl font-black text-xs">انضمام</Button>
              </Link>
            </div>
          )}
        </div>
      </div>
    </motion.nav>
  );
}

function NavLink({ href, children }: { href: string, children: React.ReactNode }) {
  return (
    <Link href={href} className="text-[10px] font-black uppercase tracking-[0.2em] text-white/40 hover:text-white transition-all">
      {children}
    </Link>
  );
}