
"use client";

import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { Scale, User, Bell, Search, Moon, Sun, Settings, LogOut } from "lucide-react";
import { useTheme } from "next-themes";
import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";

export default function Navbar() {
  const { user, profile, signOut } = useAuth();
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  const isAdmin = profile?.role === "admin" || profile?.email === "bishoysamy390@gmail.com";

  if (!user) return null; // لا يظهر الشريط العلوي إلا بعد الدخول السيادي

  return (
    <nav className="flex flex-col border-b border-white/10 top-bar-gradient text-white sticky top-0 z-[100] shadow-xl">
      <div className="flex justify-between items-center p-4">
        <Link href="/" className="flex items-center gap-3 group">
          <div className="h-10 w-10 rounded-2xl bg-white/10 flex items-center justify-center shadow-inner group-hover:rotate-12 transition-transform text-white font-black border border-white/5">
            <Scale className="h-6 w-6" />
          </div>
          <div>
            <h1 className="font-display font-black text-xl tracking-tighter leading-none">المستشار AI</h1>
            <p className="text-[8px] font-black text-white/40 uppercase tracking-widest mt-1">Sovereign Law Planet</p>
          </div>
        </Link>

        <div className="flex items-center gap-3">
          {mounted && (
            <button 
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              className="p-2.5 bg-white/10 rounded-xl hover:bg-white/20 transition-all text-white border border-white/5"
            >
              {theme === "dark" ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
            </button>
          )}

          <div className="h-10 w-px bg-white/10 mx-1 hidden sm:block" />

          {user && (
            <div className="flex items-center gap-3">
              <Link
                href="/dashboard"
                className="text-xs font-black flex items-center gap-2 bg-white/10 px-4 py-2.5 rounded-xl border border-white/10 hover:bg-white/20 transition-all shadow-md"
              >
                <User className="h-4 w-4 text-accent" />
                {profile?.fullName?.split(' ')[0] || "الحساب"}
              </Link>
              
              <button 
                onClick={signOut}
                className="p-2.5 bg-red-500/20 text-red-200 rounded-xl hover:bg-red-500/40 transition-all border border-red-500/20"
                title="تسجيل خروج"
              >
                <LogOut className="h-5 w-5" />
              </button>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}
