"use client";

import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { Scale, User } from "lucide-react";

/**
 * شريط التنقل السيادي.
 * يوفر وصولاً سريعاً للهوية الرقمية واللوحة المركزية.
 */
export default function Navbar() {
  const { user } = useAuth();

  return (
    <nav className="flex justify-between items-center p-4 border-b border-border bg-white dark:bg-slate-900 sticky top-0 z-[100]">
      <Link href="/" className="flex items-center gap-2 group">
        <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center shadow-md group-hover:scale-105 transition-transform">
          <Scale className="h-4 w-4 text-primary-foreground" />
        </div>
        <h1 className="font-display font-black text-lg text-primary tracking-tighter">المستشار AI</h1>
      </Link>

      <div className="flex items-center gap-4">
        {user ? (
          <Link
            href="/dashboard"
            className="text-sm text-accent font-bold flex items-center gap-1.5 hover:opacity-80 transition-opacity"
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
    </nav>
  );
}