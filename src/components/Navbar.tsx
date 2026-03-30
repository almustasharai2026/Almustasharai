
"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Sun, Moon, User, LayoutDashboard, Sparkles, Lock, Coins, ChevronDown, LogOut, Gavel, Menu } from "lucide-react";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { useUser, useFirestore } from "@/firebase";
import { doc, onSnapshot } from "firebase/firestore";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";

const SovereignLogo = () => (
  <div className="flex items-center gap-2">
    <div className="h-10 w-10 rounded-2xl bg-gradient-to-br from-pink-500 via-orange-500 to-orange-600 flex items-center justify-center shadow-lg shadow-orange-500/20">
      <div className="h-5 w-5 bg-white rounded-full opacity-90 shadow-inner" style={{ clipPath: 'path("M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 2 7.5 2c1.74 0 3.41.81 4.5 2.09C13.09 2.81 14.76 2 16.5 2 19.58 2 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z")' }} />
    </div>
    <span className="font-bold text-2xl tracking-tighter text-white">المستشار</span>
  </div>
);

export function Navbar() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const { user } = useUser();
  const db = useFirestore();
  const [userData, setUserData] = useState<any>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!db || !user) {
      setUserData(null);
      return;
    }
    const unsub = onSnapshot(doc(db, "users", user.uid), (doc) => {
      setUserData(doc.data());
    });
    return () => unsub();
  }, [db, user]);

  if (!mounted) return null;

  return (
    <nav className="fixed top-0 left-0 right-0 z-[100] border-b border-white/5 bg-black/40 backdrop-blur-xl">
      <div className="max-w-7xl mx-auto h-16 px-6 flex items-center justify-between">
        
        <div className="flex items-center gap-6">
          <Button variant="ghost" size="icon" className="text-white/40 hover:text-white lg:hidden">
            <Menu className="h-6 w-6" />
          </Button>
          <Link href="/">
            <SovereignLogo />
          </Link>
        </div>

        <div className="flex items-center gap-4">
          {user ? (
            <div className="flex items-center gap-3">
              <div className="hidden sm:flex h-8 w-8 rounded-full bg-indigo-600 items-center justify-center text-[10px] font-black border border-white/10 shadow-lg">
                V
              </div>
              <div className="h-2 w-2 rounded-full bg-red-500 animate-pulse" />
            </div>
          ) : (
            <Link href="/auth/login">
              <Button variant="ghost" className="text-white/60 font-bold hover:text-white">دخول</Button>
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
}
