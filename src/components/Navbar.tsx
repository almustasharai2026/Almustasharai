
"use client";

import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { Scale, User, Bell, Search, Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";

/**
 * الشريط العلوي السيادي المتقدم.
 * يضم محرك البحث، نظام الإشعارات، ومبدل المظهر.
 */
export default function Navbar() {
  const { user } = useAuth();
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  return (
    <nav className="flex flex-col border-b border-border bg-white dark:bg-slate-900 sticky top-0 z-[100]">
      <div className="flex justify-between items-center p-4">
        <Link href="/" className="flex items-center gap-2 group">
          <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center shadow-md group-hover:scale-105 transition-transform text-primary-foreground font-black">
            <Scale className="h-4 w-4" />
          </div>
          <h1 className="font-display font-black text-lg text-primary tracking-tighter">المستشار AI</h1>
        </Link>

        <div className="flex items-center gap-2">
          {mounted && (
            <button 
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              className="p-2 hover:bg-secondary rounded-xl transition-all text-muted-foreground"
            >
              {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </button>
          )}
          
          <div className="relative">
            <button className="p-2 hover:bg-secondary rounded-xl transition-all text-muted-foreground">
              <Bell className="h-4 w-4" />
              <span className="absolute top-1 right-1 h-3 w-3 bg-red-500 border-2 border-white dark:border-slate-900 rounded-full text-[7px] text-white font-black flex items-center justify-center">
                ٣
              </span>
            </button>
          </div>

          {user ? (
            <Link
              href="/dashboard"
              className="text-sm text-accent font-bold flex items-center gap-1.5 hover:opacity-80 transition-opacity bg-accent/5 px-3 py-1.5 rounded-xl border border-accent/10"
            >
              <User className="h-4 w-4" />
              حسابي
            </Link>
          ) : (
            <Link
              href="/auth/login"
              className="text-xs text-primary font-black uppercase tracking-widest hover:underline"
            >
              دخول
            </Link>
          )}
        </div>
      </div>
      
      {/* Sovereign Search Bar */}
      <div className="px-4 pb-3">
        <div className="relative group">
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground group-focus-within:text-primary transition-colors" />
          <Input 
            placeholder="بحث سيادي في الأنظمة والخبراء..." 
            className="h-9 bg-secondary/30 border-none rounded-xl pr-9 text-xs font-bold"
          />
        </div>
      </div>
    </nav>
  );
}
