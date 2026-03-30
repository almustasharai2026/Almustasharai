"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Scale, Fingerprint, Coins, Bell, Terminal, Menu, X } from "lucide-react";
import { useUser } from "@/firebase";
import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";

export function Navbar() {
  const { user, profile } = useUser();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <motion.nav 
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className="fixed top-8 left-1/2 -translate-x-1/2 z-[150] w-full max-w-6xl px-6"
    >
      <div className="glass-cosmic border-white/10 h-20 rounded-[2rem] px-10 flex items-center justify-between shadow-[0_30px_100px_rgba(0,0,0,0.5)]">
        
        <div className="flex items-center gap-12">
          <Link href="/">
            <div className="flex items-center gap-4 group">
              <div className="h-12 w-12 rounded-2xl bg-indigo-600 flex items-center justify-center shadow-[0_0_30px_rgba(99,102,241,0.5)] group-hover:scale-110 transition-all duration-500 border border-white/10">
                <Scale className="h-6 w-6 text-white" />
              </div>
              <div className="flex flex-col -space-y-1">
                <span className="font-black text-2xl tracking-tighter text-white">المستشار</span>
                <span className="text-[9px] font-black uppercase tracking-[0.4em] text-indigo-400">AI Sovereign</span>
              </div>
            </div>
          </Link>
          
          <div className="hidden lg:flex items-center gap-8">
            <NavLink href="/bot">محرك القرار</NavLink>
            <NavLink href="/templates">المكتبة</NavLink>
            <NavLink href="/consultants">مجلس الخبراء</NavLink>
            <NavLink href="/pricing">الباقات</NavLink>
          </div>
        </div>

        <div className="flex items-center gap-6">
          {user ? (
            <div className="flex items-center gap-6">
              <div className="hidden md:flex items-center gap-3 bg-white/5 border border-white/5 px-5 py-2 rounded-2xl">
                 <Coins className="h-4 w-4 text-amber-400" />
                 <span className="text-sm font-black tabular-nums">{profile?.balance || 0} <span className="text-[10px] text-white/30">EGP</span></span>
              </div>
              
              <Link href="/dashboard">
                <div className="h-12 w-12 rounded-2xl border-2 border-indigo-500/30 overflow-hidden hover:scale-110 transition-all p-0.5 shadow-2xl">
                  <div className="h-full w-full rounded-xl bg-indigo-600 flex items-center justify-center font-black text-sm text-white">
                    {user.email?.charAt(0).toUpperCase()}
                  </div>
                </div>
              </Link>
            </div>
          ) : (
            <div className="flex items-center gap-4">
              <Link href="/auth/login" className="hidden sm:block">
                <Button variant="ghost" className="text-white/40 font-black text-xs hover:text-white tracking-widest">دخول</Button>
              </Link>
              <Link href="/auth/signup">
                <Button className="btn-primary h-12 px-8 rounded-2xl text-[10px]">انضمام سيادي</Button>
              </Link>
            </div>
          )}
          
          <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="lg:hidden h-12 w-12 rounded-2xl bg-white/5 flex items-center justify-center text-white/40">
            {isMobileMenuOpen ? <X /> : <Menu />}
          </button>
        </div>
      </div>

      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="absolute top-24 left-6 right-6 glass-cosmic rounded-[2.5rem] p-8 lg:hidden border-white/10"
          >
            <div className="grid gap-6">
              <MobileNavLink href="/bot" onClick={() => setIsMobileMenuOpen(false)}>محرك القرار</MobileNavLink>
              <MobileNavLink href="/templates" onClick={() => setIsMobileMenuOpen(false)}>المكتبة</MobileNavLink>
              <MobileNavLink href="/consultants" onClick={() => setIsMobileMenuOpen(false)}>مجلس الخبراء</MobileNavLink>
              <MobileNavLink href="/pricing" onClick={() => setIsMobileMenuOpen(false)}>الباقات</MobileNavLink>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  );
}

function NavLink({ href, children }: { href: string, children: React.ReactNode }) {
  return (
    <Link href={href} className="text-[10px] font-black uppercase tracking-[0.2em] text-white/30 hover:text-white transition-all relative group">
      {children}
      <span className="absolute -bottom-2 left-0 w-0 h-0.5 bg-primary group-hover:w-full transition-all duration-500" />
    </Link>
  );
}

function MobileNavLink({ href, children, onClick }: any) {
  return (
    <Link href={href} onClick={onClick} className="text-xl font-black text-white/60 hover:text-primary block py-2 border-b border-white/5 last:border-0 transition-colors">
      {children}
    </Link>
  );
}