"use client";

import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { Scale, User, LogOut, LayoutDashboard, Sun, Moon, Crown } from "lucide-react";
import { useTheme } from "next-themes";
import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import { roles as ROLES_LIST } from "@/lib/roles";

export default function Navbar() {
  const { user, profile, signOut, role } = useAuth();
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const pathname = usePathname();

  useEffect(() => setMounted(true), []);

  if (pathname === "/auth/login" || pathname === "/auth/signup") return null;

  return (
    <nav className="flex flex-col border-b border-border bg-white/80 dark:bg-slate-950/80 backdrop-blur-md sticky top-0 z-[100] shadow-sm">
      <div className="max-w-7xl mx-auto w-full flex justify-between items-center p-4 px-6 md:px-10">
        <Link href="/" className="flex items-center gap-3 group">
          <div className="h-10 w-10 rounded-2xl bg-gradient-to-br from-primary to-indigo-700 flex items-center justify-center shadow-lg text-white font-black border border-white/10 group-hover:scale-110 transition-all">
            <Scale className="h-6 w-6" />
          </div>
          <div className="hidden sm:block">
            <h1 className="font-display font-black text-xl tracking-tighter leading-none text-slate-900 dark:text-white">المستشار <span className="text-primary">AI</span></h1>
            <p className="text-[8px] font-black text-muted-foreground uppercase tracking-widest mt-1">Sovereign Law Planet</p>
          </div>
        </Link>

        <div className="flex items-center gap-4">
          <div className="hidden md:flex items-center gap-6 mr-8 text-xs font-black uppercase tracking-widest text-muted-foreground">
             <Link href="/bot" className="hover:text-primary transition-colors">البوت الذكي</Link>
             <Link href="/consultants" className="hover:text-primary transition-colors">مجلس الخبراء</Link>
             <Link href="/templates" className="hover:text-primary transition-colors">المكتبة</Link>
          </div>

          {mounted && (
            <button 
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              className="p-2.5 bg-slate-100 dark:bg-white/5 rounded-xl hover:bg-primary/10 transition-all border border-border dark:border-white/5 text-primary"
            >
              {theme === 'dark' ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
            </button>
          )}

          {user ? (
            <div className="flex items-center gap-3">
              <Link
                href="/bot"
                className="text-xs font-black flex items-center gap-3 bg-gradient-to-r from-primary to-indigo-600 text-white px-5 py-3 rounded-xl border-none hover:scale-105 transition-all shadow-xl shadow-primary/20"
              >
                {role === ROLES_LIST.ADMIN ? <Crown className="h-4 w-4" /> : <LayoutDashboard className="h-4 w-4" />}
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
              <button className="text-xs font-black bg-primary text-white px-8 py-3 rounded-xl shadow-xl shadow-primary/20 hover:scale-105 transition-all">
                دخول سيادي
              </button>
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
}