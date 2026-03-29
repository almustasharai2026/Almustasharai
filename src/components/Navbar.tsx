
"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Scale, Menu, Sun, Moon, Languages, User, LayoutDashboard, Sparkles } from "lucide-react";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { useUser } from "@/firebase";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";

export function Navbar() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const { user } = useUser();
  const [isArabic, setIsArabic] = useState(true);

  useEffect(() => {
    setMounted(true);
    const savedLang = localStorage.getItem("app_lang");
    if (savedLang) {
      const isAr = savedLang === "ar";
      setIsArabic(isAr);
      document.documentElement.dir = isAr ? "rtl" : "ltr";
    }
  }, []);

  if (!mounted) return null;

  const toggleLanguage = () => {
    const newLang = !isArabic ? "ar" : "en";
    setIsArabic(!isArabic);
    localStorage.setItem("app_lang", newLang);
    document.documentElement.dir = !isArabic ? "rtl" : "ltr";
  };

  const isAdmin = user?.email === "bishoysamy390@gmail.com";

  return (
    <nav className="fixed top-0 left-0 right-0 z-[100] border-b bg-background/80 backdrop-blur-md">
      <div className="container mx-auto h-16 px-4 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 group">
          <div className="bg-orange-500 p-1.5 rounded-lg shadow-lg shadow-orange-500/20">
            <Scale className="h-5 w-5 text-white" />
          </div>
          <span className="font-black text-xl tracking-tight text-foreground">
            المستشار <span className="text-orange-500">AI</span>
          </span>
        </Link>

        <div className="hidden lg:flex items-center gap-8">
          <NavLink href="/consultants" label={isArabic ? "المستشارون" : "Consultants"} />
          <NavLink href="/match" label={isArabic ? "المطابقة" : "AI Match"} />
          <NavLink href="/templates" label={isArabic ? "النماذج" : "Templates"} />
          <Link href="/bot" className="bg-orange-500/10 text-orange-600 px-4 py-1.5 rounded-full text-sm font-black hover:bg-orange-500 hover:text-white transition-all">
            <Sparkles className="h-4 w-4 inline-block ml-1" />
            {isArabic ? "العميل" : "Agent"}
            <span className="bg-orange-500 text-white px-2 py-0.5 rounded-md text-[10px] mr-2">٤</span>
          </Link>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" className="rounded-xl" onClick={() => setTheme(theme === "dark" ? "light" : "dark")}>
            {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </Button>
          
          <Button variant="ghost" size="icon" className="rounded-xl" onClick={toggleLanguage}>
            <Languages className="h-4 w-4" />
          </Button>

          <div className="h-4 w-px bg-border mx-1 hidden sm:block" />

          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="rounded-xl h-10 gap-2 px-3 border">
                  <User className="h-4 w-4" /> 
                  <span className="hidden sm:inline-block font-bold text-xs">{isArabic ? "حسابي" : "Account"}</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56 rounded-2xl p-2 shadow-2xl">
                <DropdownMenuItem asChild>
                  <Link href="/dashboard" className="flex items-center gap-2 p-3 rounded-xl cursor-pointer">
                    <LayoutDashboard className="h-4 w-4" /> {isArabic ? "لوحة التحكم" : "Dashboard"}
                  </Link>
                </DropdownMenuItem>
                {isAdmin && (
                  <DropdownMenuItem asChild>
                    <Link href="/admin" className="flex items-center gap-2 p-3 rounded-xl text-orange-500 font-black cursor-pointer">
                      <Scale className="h-4 w-4" /> {isArabic ? "إدارة المنصة" : "Admin Panel"}
                    </Link>
                  </DropdownMenuItem>
                )}
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => window.location.href = "/auth/login"} className="text-red-500 p-3 rounded-xl cursor-pointer">
                  {isArabic ? "تسجيل الخروج" : "Logout"}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <div className="flex gap-2">
              <Link href="/auth/signup">
                <Button className="rounded-xl h-10 px-6 font-black bg-orange-500 hover:bg-orange-600 text-white shadow-lg shadow-orange-500/20">{isArabic ? "ابدأ الآن" : "Start now"}</Button>
              </Link>
            </div>
          )}
          
          <div className="lg:hidden">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="rounded-xl">
                  <Menu className="h-5 w-5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56 rounded-2xl p-2 shadow-2xl">
                <DropdownMenuItem asChild><Link href="/consultants" className="p-3 rounded-xl">{isArabic ? "المستشارون" : "Consultants"}</Link></DropdownMenuItem>
                <DropdownMenuItem asChild><Link href="/match" className="p-3 rounded-xl">{isArabic ? "المطابقة" : "AI Match"}</Link></DropdownMenuItem>
                <DropdownMenuItem asChild><Link href="/templates" className="p-3 rounded-xl">{isArabic ? "النماذج" : "Templates"}</Link></DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
    </nav>
  );
}

function NavLink({ href, label }: { href: string; label: string }) {
  return (
    <Link href={href} className="text-sm font-bold text-muted-foreground hover:text-foreground transition-colors">
      {label}
    </Link>
  );
}
