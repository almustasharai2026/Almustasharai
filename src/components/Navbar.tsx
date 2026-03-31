"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Scale, Coins, LayoutDashboard } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { motion } from "framer-motion";

export function Navbar() {
  const { user, profile } = useAuth();

  return (
    <motion.nav 
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className="fixed top-6 left-1/2 -translate-x-1/2 z-[150] w-full max-w-6xl px-6"
    >
      <div className="glass-cosmic bg-[#0A192F]/90 border-white/10 h-20 rounded-[2rem] px-8 flex items-center justify-between shadow-2xl">
        <Link href="/">
          <div className="flex items-center gap-4 group">
            <div className="h-12 w-12 rounded-2xl bg-indigo-600 flex items-center justify-center shadow-xl border border-white/10">
              <Scale className="h-6 w-6 text-white" />
            </div>
            <div className="flex flex-col -space-y-1">
              <span className="font-black text-2xl tracking-tighter text-white">المستشار</span>
              <span className="text-[9px] font-black uppercase tracking-[0.4em] text-indigo-400">AI Sovereign</span>
            </div>
          </div>
        </Link>

        <div className="flex items-center gap-6">
          {user ? (
            <>
              <div className="hidden md:flex items-center gap-3 bg-white/5 border border-white/5 px-5 py-2.5 rounded-2xl">
                 <Coins className="h-4 w-4 text-amber-400" />
                 <span className="text-sm font-black text-white tabular-nums">
                   {profile?.balance ?? 0} <span className="text-[10px] text-white/30 mr-1">EGP</span>
                 </span>
              </div>
              <Link href="/dashboard">
                <Button variant="outline" className="h-12 px-6 rounded-2xl border-primary/20 bg-primary/5 text-primary font-black gap-2 hover:bg-primary/10">
                  <LayoutDashboard className="h-4 w-4" />
                  لوحة التحكم
                </Button>
              </Link>
            </>
          ) : (
            <Link href="/auth/login">
              <Button className="btn-primary h-12 px-8 rounded-2xl text-[10px]">دخول سيادي</Button>
            </Link>
          )}
        </div>
      </div>
    </motion.nav>
  );
}
