"use client";

import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { Scale, User, Bell, Search, Moon, Sun, Settings } from "lucide-react";
import { useTheme } from "next-themes";
import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";

export default function Navbar() {
  const { user, profile } = useAuth();
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  const isOwner = profile?.role === "admin" || profile?.email === "bishoysamy390@gmail.com";

  return (
    <nav className="flex flex-col border-b border-white/10 top-bar-gradient text-white sticky top-0 z-[100] shadow-lg">
      <div className="flex justify-between items-center p-4">
        <Link href="/" className="flex items-center gap-2 group">
          <div className="h-9 w-9 rounded-xl bg-white/10 flex items-center justify-center shadow-inner group-hover:scale-105 transition-transform text-white font-black">
            <Scale className="h-5 w-5" />
          </div>
          <h1 className="font-display font-black text-xl tracking-tighter">المستشار AI</h1>
        </Link>

        <div className="flex items-center gap-3">
          <div className="hidden sm:flex relative group w-48">
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/50" />
            <Input 
              placeholder="ابحث..." 
              className="h-9 bg-white/20 border-none rounded-lg pr-9 text-xs font-bold text-white placeholder:text-white/40 focus:ring-1 focus:ring-white/30"
            />
          </div>

          <button className="p-2 bg-white/10 rounded-xl hover:bg-white/20 transition-all text-white relative">
            <Bell className="h-5 w-5" />
            <span className="absolute top-1 right-1 h-4 w-4 bg-red-500 border-2 border-primary rounded-full text-[8px] flex items-center justify-center font-black">0</span>
          </button>

          {mounted && (
            <button 
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              className="p-2 bg-white/10 rounded-xl hover:bg-white/20 transition-all text-white"
            >
              {theme === "dark" ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
            </button>
          )}

          {user && (
            <Link
              href="/dashboard"
              className="text-sm font-black flex items-center gap-2 bg-white/10 px-4 py-2 rounded-xl border border-white/20 hover:bg-white/20 transition-all"
            >
              <User className="h-4 w-4" />
              حسابي
            </Link>
          )}
          
          {!user && (
            <Link
              href="/auth/login"
              className="text-xs font-black uppercase tracking-widest hover:bg-white/10 px-4 py-2 rounded-xl border border-white/20"
            >
              دخول
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
}