
"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Sun, Moon, Languages, User, LayoutDashboard, Sparkles, Lock, Gavel, Coins } from "lucide-react";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { useUser, useFirestore } from "@/firebase";
import { doc, onSnapshot } from "firebase/firestore";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";

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

  const isAdmin = user?.email === "bishoysamy390@gmail.com";

  return (
    <nav className="fixed top-6 left-1/2 -translate-x-1/2 z-[100] w-[95%] max-w-7xl">
      <div className="glass-cosmic h-20 px-8 rounded-[2.5rem] flex items-center justify-between border-white/10 shadow-[0_0_50px_rgba(0,0,0,0.4)]">
        
        {/* Modern Sovereign Gavel Logo */}
        <Link href="/" className="flex items-center gap-4 group">
          <div className="relative">
            <div className="bg-primary p-3.5 rounded-2xl shadow-[0_0_30px_rgba(37,99,235,0.4)] group-hover:rotate-[360deg] transition-transform duration-1000 flex items-center justify-center relative z-10">
              <Gavel className="h-6 w-6 text-white" />
            </div>
            <div className="absolute inset-0 bg-primary blur-[20px] opacity-20 animate-pulse" />
          </div>
          <span className="font-black text-2xl tracking-tighter text-white flex items-baseline gap-1">
            المستشار <span className="text-primary text-3xl">AI</span>
          </span>
        </Link>

        {/* Central Hub Links */}
        <div className="hidden lg:flex items-center gap-10">
          <NavLink href="/consultants" label="الاستشارات" />
          <NavLink href="/templates" label="المكتبة" />
          <NavLink href="/pricing" label="العروض" />
          <Link href="/bot" className="flex items-center gap-3 bg-primary/5 hover:bg-primary text-white px-8 py-3 rounded-2xl font-black transition-all border border-primary/20 group shadow-lg active:scale-95">
            <Sparkles className="h-4 w-4 text-primary group-hover:text-white" />
            مركز القيادة الذكي
          </Link>
        </div>

        {/* Global Controls */}
        <div className="flex items-center gap-4">
          
          {user && userData && (
            <Link href="/pricing" className="hidden sm:flex items-center gap-2 px-4 py-2 bg-white/5 rounded-2xl border border-white/5 hover:bg-white/10 transition-all">
               <Coins className="h-3.5 w-3.5 text-primary" />
               <span className="text-xs font-black text-white tabular-nums">{userData.balance} <span className="text-[8px] text-white/30">EGP</span></span>
            </Link>
          )}

          <Button variant="ghost" size="icon" className="rounded-2xl h-11 w-11 glass border-white/5" onClick={() => setTheme(theme === "dark" ? "light" : "dark")}>
            {theme === "dark" ? <Sun className="h-5 w-5 text-primary" /> : <Moon className="h-5 w-5 text-primary" />}
          </Button>
          
          <Button variant="ghost" size="icon" className="rounded-2xl h-11 w-11 glass border-white/5 hidden sm:flex">
            <Languages className="h-5 w-5 text-primary" />
          </Button>

          <div className="h-8 w-px bg-white/10 mx-1 hidden sm:block" />

          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button className="rounded-2xl h-11 gap-3 px-6 glass border-primary/10 hover:bg-primary transition-all font-black text-xs group">
                  <User className="h-4 w-4 group-hover:animate-bounce" /> 
                  <span className="hidden sm:inline-block">حسابي السيادي</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-64 rounded-[2.5rem] p-4 glass-cosmic border-white/10 shadow-2xl mt-4">
                <DropdownMenuItem asChild>
                  <Link href="/dashboard" className="flex items-center gap-4 p-4 rounded-2xl cursor-pointer hover:bg-white/10 font-bold transition-colors text-right">
                    <LayoutDashboard className="h-4 w-4 text-primary ml-4" /> لوحة التحكم
                  </Link>
                </DropdownMenuItem>
                {isAdmin && (
                  <DropdownMenuItem asChild>
                    <Link href="/admin" className="flex items-center gap-4 p-4 rounded-2xl text-primary font-black cursor-pointer bg-primary/10 hover:bg-primary/20 border border-primary/20 mt-1 transition-all text-right">
                      <Lock className="h-4 w-4 ml-4" /> غرفة القيادة العليا
                    </Link>
                  </DropdownMenuItem>
                )}
                <DropdownMenuSeparator className="bg-white/5 my-3" />
                <DropdownMenuItem onClick={() => window.location.href = "/auth/login"} className="text-red-500 p-4 rounded-2xl cursor-pointer hover:bg-red-500/10 font-black transition-colors text-right justify-end">
                  تسجيل الخروج
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Link href="/auth/signup">
              <Button className="rounded-2xl h-12 px-10 font-black cosmic-gradient hover:scale-105 shadow-xl transition-all border border-white/5 active:scale-95">
                ابدأ رحلتك
              </Button>
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
}

function NavLink({ href, label }: { href: string; label: string }) {
  return (
    <Link href={href} className="text-[10px] font-black text-white/30 hover:text-primary hover:tracking-[0.25em] transition-all uppercase tracking-[0.2em]">
      {label}
    </Link>
  );
}
