"use client";

import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { Scale, User, LogOut } from "lucide-react";
import { useTheme } from "next-themes";
import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";

/**
 * شريط التنقل العلوي البسيط (يظهر في الصفحات العامة فقط).
 * في صفحة البوت المتقدمة، يتم استخدام Top-Bar المدمج.
 */
export default function Navbar() {
  const { user, profile, signOut } = useAuth();
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const pathname = usePathname();

  useEffect(() => setMounted(true), []);

  // عدم عرض النافبار التقليدي داخل صفحة البوت المتقدمة لتجنب التكرار
  if (pathname === "/bot") return null;

  return (
    <nav className="flex flex-col border-b border-border bg-white/80 dark:bg-slate-900/80 backdrop-blur-md sticky top-0 z-[100] shadow-sm">
      <div className="flex justify-between items-center p-4">
        <Link href="/" className="flex items-center gap-3 group">
          <div className="h-10 w-10 rounded-2xl bg-primary flex items-center justify-center shadow-lg text-white font-black border border-white/10">
            <Scale className="h-6 w-6" />
          </div>
          <div>
            <h1 className="font-display font-black text-xl tracking-tighter leading-none text-primary">المستشار AI</h1>
            <p className="text-[8px] font-black text-muted-foreground uppercase tracking-widest mt-1">Sovereign Law Planet</p>
          </div>
        </Link>

        {user && (
          <div className="flex items-center gap-3">
            <Link
              href="/bot"
              className="text-xs font-black flex items-center gap-2 bg-primary text-white px-4 py-2.5 rounded-xl border border-primary hover:scale-105 transition-all shadow-md"
            >
              <User className="h-4 w-4" />
              {profile?.fullName?.split(' ')[0] || "لوحة التحكم"}
            </Link>
            
            <button 
              onClick={signOut}
              className="p-2.5 bg-red-500/10 text-red-600 rounded-xl hover:bg-red-500/20 transition-all border border-red-500/10"
              title="تسجيل خروج"
            >
              <LogOut className="h-5 w-5" />
            </button>
          </div>
        )}
      </div>
    </nav>
  );
}