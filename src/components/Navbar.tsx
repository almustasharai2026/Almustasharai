"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Sun, Moon, User, LayoutDashboard, Sparkles, Lock, Coins, ChevronDown, LogOut, Gavel } from "lucide-react";
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

const SovereignLogo = () => (
  <svg viewBox="0 0 100 100" className="h-12 w-12 drop-shadow-[0_0_20px_rgba(37,99,235,0.6)]">
    <path d="M50 5 L90 25 L90 75 L50 95 L10 75 L10 25 Z" fill="none" stroke="currentColor" strokeWidth="2" className="text-white/10" />
    <path d="M50 15 L80 30 L80 70 L50 85 L20 70 L20 30 Z" fill="none" stroke="currentColor" strokeWidth="4" className="text-primary" />
    <path d="M35 45 H65 M50 45 V70 M35 45 L30 55 M65 45 L70 55" stroke="currentColor" strokeWidth="5" strokeLinecap="round" className="text-primary" />
    <circle cx="50" cy="35" r="4" fill="currentColor" className="text-accent" />
  </svg>
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

  const isAdmin = user?.email === "bishoysamy390@gmail.com";

  return (
    <nav className="fixed top-6 left-1/2 -translate-x-1/2 z-[100] w-[95%] max-w-7xl">
      <div className="glass-cosmic h-20 px-8 rounded-[2.5rem] flex items-center justify-between border-white/10 shadow-[0_0_50px_rgba(0,0,0,0.4)]">
        
        <Link href="/" className="flex items-center gap-4 group">
          <SovereignLogo />
          <div className="flex flex-col -space-y-1">
            <span className="font-black text-2xl tracking-tighter text-white">المستشار <span className="text-primary">AI</span></span>
            <span className="text-primary text-[8px] font-black uppercase tracking-[0.4em] opacity-50">Sovereign Legal SaaS</span>
          </div>
        </Link>

        <div className="hidden lg:flex items-center gap-10">
          <NavLink href="/consultants" label="هيئة الخبراء" />
          <NavLink href="/templates" label="المكتبة" />
          <NavLink href="/pricing" label="الباقات" />
          <Link href="/bot" className="flex items-center gap-3 bg-primary/10 hover:bg-primary text-white px-8 py-3 rounded-2xl font-black transition-all border border-primary/20 group shadow-lg active:scale-95">
            <Sparkles className="h-4 w-4 text-primary group-hover:text-white" />
            مركز القيادة الذكي
          </Link>
        </div>

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
          
          <div className="h-8 w-px bg-white/10 mx-1 hidden sm:block" />

          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button className="rounded-2xl h-11 gap-3 px-6 glass border-primary/10 hover:bg-primary transition-all font-black text-xs">
                  <User className="h-4 w-4" /> 
                  <span className="hidden sm:inline-block">حسابي</span>
                  <ChevronDown className="h-3 w-3 opacity-50" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-64 rounded-[2.5rem] p-4 glass-cosmic border-white/10 shadow-2xl mt-4">
                <div className="px-4 py-3 mb-2">
                   <p className="text-[10px] font-black text-white/20 uppercase tracking-widest mb-1">المواطن</p>
                   <p className="text-sm font-black text-white truncate">{userData?.fullName || user.email}</p>
                </div>
                <DropdownMenuSeparator className="bg-white/5 mb-2" />
                <DropdownMenuItem asChild>
                  <Link href="/dashboard" className="flex items-center gap-4 p-4 rounded-xl cursor-pointer hover:bg-white/5 font-bold transition-colors">
                    <LayoutDashboard className="h-4 w-4 text-primary" /> لوحة التحكم
                  </Link>
                </DropdownMenuItem>
                {isAdmin && (
                  <DropdownMenuItem asChild>
                    <Link href="/admin" className="flex items-center gap-4 p-4 rounded-xl text-primary font-black cursor-pointer bg-primary/10 hover:bg-primary/20 border border-primary/20 mt-1 transition-all">
                      <Lock className="h-4 w-4" /> غرفة القيادة العليا
                    </Link>
                  </DropdownMenuItem>
                )}
                <DropdownMenuSeparator className="bg-white/5 my-2" />
                <DropdownMenuItem onClick={() => window.location.href = "/auth/login"} className="text-red-500 p-4 rounded-xl cursor-pointer hover:bg-red-500/10 font-black transition-colors">
                  <LogOut className="h-4 w-4 ml-4" /> تسجيل الخروج
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Link href="/auth/signup">
              <Button className="rounded-2xl h-12 px-10 font-black btn-primary active:scale-95 shadow-xl transition-all">
                انضم للسيادة
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
    <Link href={href} className="text-[10px] font-black text-white/30 hover:text-primary hover:tracking-widest transition-all uppercase tracking-[0.2em]">
      {label}
    </Link>
  );
}