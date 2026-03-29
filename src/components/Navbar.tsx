
"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Menu, Sun, Moon, Languages, User, LayoutDashboard, Sparkles, Lock, Gavel, ShieldCheck } from "lucide-react";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { useUser } from "@/firebase";
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
  const [isArabic, setIsArabic] = useState(true);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  const toggleLanguage = () => {
    setIsArabic(!isArabic);
    document.documentElement.dir = !isArabic ? "rtl" : "ltr";
  };

  const isAdmin = user?.email === "bishoysamy390@gmail.com";

  return (
    <nav className="fixed top-6 left-1/2 -translate-x-1/2 z-[100] w-[95%] max-w-7xl">
      <div className="glass-cosmic h-20 px-8 rounded-[2.5rem] flex items-center justify-between border-white/10 shadow-[0_0_50px_rgba(0,0,0,0.4)]">
        
        {/* Modernized Logo */}
        <Link href="/" className="flex items-center gap-4 group">
          <div className="relative">
            <div className="bg-primary p-3 rounded-2xl shadow-[0_0_30px_rgba(37,99,235,0.5)] group-hover:rotate-[360deg] transition-transform duration-1000 flex items-center justify-center relative z-10">
              <Gavel className="h-6 w-6 text-white" />
            </div>
            <div className="absolute inset-0 bg-primary blur-[20px] opacity-20 animate-pulse" />
          </div>
          <span className="font-black text-2xl tracking-tighter text-white flex items-baseline gap-1">
            المستشار <span className="text-primary text-3xl">AI</span>
          </span>
        </Link>

        <div className="hidden lg:flex items-center gap-10">
          <NavLink href="/consultants" label={isArabic ? "الاستشارات" : "Consultants"} />
          <NavLink href="/templates" label={isArabic ? "المكتبة" : "Templates"} />
          <NavLink href="/match" label={isArabic ? "المطابقة" : "Match"} />
          <Link href="/bot" className="flex items-center gap-3 bg-primary/5 hover:bg-primary text-white px-8 py-3 rounded-2xl font-black transition-all border border-primary/20 group shadow-lg">
            <Sparkles className="h-4 w-4 animate-pulse text-primary group-hover:text-white" />
            {isArabic ? "مركز القيادة" : "AI Hub"}
          </Link>
        </div>

        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" className="rounded-2xl h-11 w-11 glass hover:bg-white/10 border-white/5" onClick={() => setTheme(theme === "dark" ? "light" : "dark")}>
            {theme === "dark" ? <Sun className="h-5 w-5 text-primary" /> : <Moon className="h-5 w-5 text-primary" />}
          </Button>
          
          <Button variant="ghost" size="icon" className="rounded-2xl h-11 w-11 glass hover:bg-white/10 border-white/5" onClick={toggleLanguage}>
            <Languages className="h-5 w-5 text-primary" />
          </Button>

          <div className="h-8 w-px bg-white/10 mx-1 hidden sm:block" />

          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button className="rounded-2xl h-11 gap-3 px-6 glass-cosmic border-primary/20 hover:bg-primary hover:text-white transition-all shadow-xl font-black text-xs">
                  <User className="h-4 w-4" /> 
                  <span className="hidden sm:inline-block">{isArabic ? "حسابي" : "Account"}</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-64 rounded-[2.5rem] p-4 glass-cosmic border-white/10 shadow-2xl mt-4">
                <DropdownMenuItem asChild>
                  <Link href="/dashboard" className="flex items-center gap-4 p-4 rounded-2xl cursor-pointer hover:bg-white/10 font-bold">
                    <LayoutDashboard className="h-4 w-4 text-primary" /> {isArabic ? "لوحة التحكم" : "Dashboard"}
                  </Link>
                </DropdownMenuItem>
                {isAdmin && (
                  <DropdownMenuItem asChild>
                    <Link href="/admin" className="flex items-center gap-4 p-4 rounded-2xl text-primary font-black cursor-pointer bg-primary/10 hover:bg-primary/20">
                      <Lock className="h-4 w-4" /> {isArabic ? "غرفة القيادة" : "Admin Panel"}
                    </Link>
                  </DropdownMenuItem>
                )}
                <DropdownMenuSeparator className="bg-white/5 my-2" />
                <DropdownMenuItem onClick={() => window.location.href = "/auth/login"} className="text-red-500 p-4 rounded-2xl cursor-pointer hover:bg-red-500/10 font-bold">
                  {isArabic ? "تسجيل الخروج" : "Logout"}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Link href="/auth/signup">
              <Button className="rounded-2xl h-12 px-10 font-black cosmic-gradient hover:scale-105 shadow-[0_0_30px_rgba(37,99,235,0.3)] transition-all">
                {isArabic ? "ابدأ الآن" : "Launch"}
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
    <Link href={href} className="text-[10px] font-black text-white/40 hover:text-white hover:tracking-widest transition-all uppercase tracking-[0.2em]">
      {label}
    </Link>
  );
}
