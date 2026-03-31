"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Scale, Coins, LayoutDashboard, Menu, X } from "lucide-react";
import { useUser } from "@/firebase";
import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import { cn } from "@/lib/utils";

/**
 * شريط التنقل السيادي (Sovereign Navbar).
 * تم تحديثه ليعتمد الخلفية الكحلية #0A192F والوصول السهل للوحة التحكم.
 */
export function Navbar() {
  const { user, profile } = useUser();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <motion.nav 
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className="fixed top-6 left-1/2 -translate-x-1/2 z-[150] w-full max-w-6xl px-6"
    >
      <div className="glass-cosmic bg-[#0A192F]/90 border-white/10 h-20 rounded-[2rem] px-8 flex items-center justify-between shadow-[0_30px_100px_rgba(0,0,0,0.5)]">
        
        {/* Logo & Identity Section */}
        <div className="flex items-center gap-10">
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
          </div>
        </div>

        {/* Action & Auth Section */}
        <div className="flex items-center gap-6">
          <AnimatePresence mode="wait">
            {user ? (
              <motion.div 
                key="auth-active"
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                className="flex items-center gap-6"
              >
                <div className="hidden md:flex items-center gap-3 bg-white/5 border border-white/5 px-5 py-2.5 rounded-2xl shadow-inner">
                   <Coins className="h-4 w-4 text-amber-400 animate-pulse" />
                   <span className="text-sm font-black tabular-nums text-white">
                     {profile?.balance ?? 0} <span className="text-[10px] text-white/30 uppercase mr-1">EGP</span>
                   </span>
                </div>
                
                <Link href="/dashboard">
                  <Button variant="outline" className="h-12 px-6 rounded-2xl border-primary/20 bg-primary/5 text-primary font-black gap-2 hover:bg-primary/10 transition-all">
                    <LayoutDashboard className="h-4 w-4" />
                    <span className="hidden sm:inline">لوحة التحكم</span>
                  </Button>
                </Link>
              </motion.div>
            ) : (
              <motion.div 
                key="auth-guest"
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                className="flex items-center gap-4"
              >
                <Link href="/auth/login" className="hidden sm:block">
                  <Button variant="ghost" className="text-white/40 font-black text-xs hover:text-white tracking-widest uppercase">دخول</Button>
                </Link>
                <Link href="/auth/signup">
                  <Button className="btn-primary h-12 px-8 rounded-2xl text-[10px] shadow-xl">انضمام سيادي</Button>
                </Link>
              </motion.div>
            )}
          </AnimatePresence>
          
          <button 
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} 
            className="lg:hidden h-12 w-12 rounded-2xl bg-white/5 flex items-center justify-center text-white/40 hover:text-white transition-colors"
          >
            {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </div>

      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div 
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            className="absolute top-24 left-6 right-6 glass-cosmic bg-[#0A192F] rounded-[2.5rem] p-8 lg:hidden border-white/10 shadow-3xl"
          >
            <div className="grid gap-6">
              <MobileNavLink href="/bot" onClick={() => setIsMobileMenuOpen(false)}>محرك القرار</MobileNavLink>
              <MobileNavLink href="/templates" onClick={() => setIsMobileMenuOpen(false)}>المكتبة السيادية</MobileNavLink>
              <MobileNavLink href="/consultants" onClick={() => setIsMobileMenuOpen(false)}>مجلس الخبراء</MobileNavLink>
              <MobileNavLink href="/pricing" onClick={() => setIsMobileMenuOpen(false)}>باقات الرصيد</MobileNavLink>
              <div className="h-px bg-white/5 w-full my-2" />
              <MobileNavLink href="/dashboard" onClick={() => setIsMobileMenuOpen(false)} className="text-primary">
                <div className="flex items-center gap-3">
                  <LayoutDashboard className="h-5 w-5" /> لوحة التحكم
                </div>
              </MobileNavLink>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  );
}

function NavLink({ href, children }: { href: string, children: React.ReactNode }) {
  return (
    <Link href={href} className="text-[10px] font-black uppercase tracking-[0.2em] text-white/30 hover:text-white transition-all relative group py-2">
      {children}
      <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-primary group-hover:w-full transition-all duration-500 rounded-full shadow-[0_0_10px_rgba(99,102,241,0.8)]" />
    </Link>
  );
}

function MobileNavLink({ href, children, onClick, className }: any) {
  return (
    <Link 
      href={href} 
      onClick={onClick} 
      className={cn(
        "text-xl font-black text-white/60 hover:text-primary block py-3 border-b border-white/5 last:border-0 transition-all active:translate-x-2 text-right",
        className
      )}
    >
      {children}
    </Link>
  );
}
