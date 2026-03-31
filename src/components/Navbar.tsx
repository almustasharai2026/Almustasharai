"use client";

import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { Scale, User, LogOut, LayoutDashboard, Sun, Moon } from "lucide-react";
import { useTheme } from "next-themes";
import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";

/**
 * شريط التنقل السيادي المطورة.
 * تضمن تجربة مستخدم انسيابية مع دعم كامل لتغيير المظهر.
 */
export default function Navbar() {
  const { user, profile, signOut } = useAuth();
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const pathname = usePathname();

  useEffect(() => setMounted(true), []);

  if (pathname === "/bot" || pathname === "/auth/login" || pathname === "/auth/signup") return null;

  return (
    <nav className="flex flex-col border-b border-border bg-white/80 dark:bg-slate-950/80 backdrop-blur-md sticky top-0 z-[100] shadow-sm">
      <div className="flex justify-between items-center p-4">
        <Link href="/" className="flex items-center gap-3 group">
          <div className="h-10 w-10 rounded-2xl bg-primary flex items-center justify-center shadow-lg text-white font-black border border-white/10">
            <Scale className="h-6 w-6" />
          </div>
          <div className="hidden sm:block">
            <h1 className="font-display font-black text-xl tracking-tighter leading-none text-primary">المستشار AI</h1>
            <p className="text-[8px] font-black text-muted-foreground uppercase tracking-widest mt-1">Sovereign Law Planet</p>
          </div>
        </Link>

        <div className="flex items-center gap-3">
          {mounted && (
            <button 
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              className="p-2.5 bg-secondary/50 dark:bg-white/5 rounded-xl hover:bg-primary/10 transition-all border border-border dark:border-white/5"
            >
              {theme === 'dark' ? <Sun className="h-5 w-5 text-primary" /> : <Moon className="h-5 w-5 text-primary" />}
            </button>
          )}

          {user ? (
            <div className="flex items-center gap-3">
              <Link
                href="/bot"
                className="text-xs font-black flex items-center gap-2 bg-gradient-to-r from-primary to-amber-600 text-white px-4 py-2.5 rounded-xl border-none hover:scale-105 transition-all shadow-lg"
              >
                <LayoutDashboard className="h-4 w-4" />
                <span className="hidden xs:inline">{profile?.fullName?.split(' ')[0] || "القيادة"}</span>
              </Link>
              
              <button 
                onClick={() => signOut()}
                className="p-2.5 bg-red-500/10 text-red-600 rounded-xl hover:bg-red-500/20 transition-all border border-red-500/10"
                title="تسجيل خروج"
              >
                <LogOut className="h-5 w-5" />
              </button>
            </div>
          ) : (
            <Link href="/auth/login">
              <button className="text-xs font-black bg-primary text-white px-6 py-2.5 rounded-xl shadow-lg hover:scale-105 transition-all">
                دخول سيادي
              </button>
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
}