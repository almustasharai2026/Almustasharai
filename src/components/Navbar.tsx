
"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Scale, Menu, BrainCircuit, Sun, Moon, Languages, User, LayoutDashboard, FileText, MessageSquare } from "lucide-react";
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
      document.documentElement.lang = savedLang;
    }
  }, []);

  if (!mounted) return null;

  const toggleLanguage = () => {
    const newLang = !isArabic ? "ar" : "en";
    setIsArabic(!isArabic);
    localStorage.setItem("app_lang", newLang);
    document.documentElement.dir = !isArabic ? "rtl" : "ltr";
    document.documentElement.lang = newLang;
  };

  const isAdmin = user?.email === "bishoysamy390@gmail.com";

  return (
    <nav className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 shadow-sm">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 font-headline font-bold text-primary text-2xl tracking-tight">
          <Scale className="h-7 w-7 text-accent" />
          <span className="hidden sm:inline-block">{isArabic ? "المستشار" : "Almustashar"}</span>
        </Link>

        <div className="hidden md:flex items-center gap-8">
          <Link href="/consultants" className="text-sm font-medium hover:text-accent transition-colors">
            {isArabic ? "المستشارون" : "Consultants"}
          </Link>
          <Link href="/match" className="text-sm font-medium hover:text-accent transition-colors flex items-center gap-1">
            <BrainCircuit className="h-4 w-4" /> {isArabic ? "المطابقة" : "AI Match"}
          </Link>
          <Link href="/templates" className="text-sm font-medium hover:text-accent transition-colors flex items-center gap-1">
            <FileText className="h-4 w-4" /> {isArabic ? "النماذج" : "Templates"}
          </Link>
          <Link href="/bot" className="text-sm font-bold text-accent hover:text-accent/80 transition-colors flex items-center gap-1">
            <MessageSquare className="h-4 w-4" /> {isArabic ? "البوت الذكي" : "Smart Bot"}
          </Link>
        </div>

        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" className="rounded-full" onClick={() => setTheme(theme === "dark" ? "light" : "dark")}>
            {theme === "dark" ? <Sun className="h-5 w-5 text-yellow-500" /> : <Moon className="h-5 w-5 text-primary" />}
          </Button>
          
          <Button variant="ghost" size="icon" className="rounded-full" onClick={toggleLanguage}>
            <Languages className="h-5 w-5 text-accent" />
          </Button>

          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="gap-2 rounded-xl border-accent/20 bg-accent/5 hover:bg-accent/10">
                  <User className="h-4 w-4 text-accent" /> <span className="hidden sm:inline-block">{isArabic ? "حسابي" : "My Account"}</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56 rounded-xl shadow-xl" dir={isArabic ? "rtl" : "ltr"}>
                <DropdownMenuItem asChild>
                  <Link href="/dashboard" className="flex items-center gap-2 cursor-pointer">
                    <LayoutDashboard className="h-4 w-4" /> {isArabic ? "لوحة التحكم" : "Dashboard"}
                  </Link>
                </DropdownMenuItem>
                {isAdmin && (
                  <DropdownMenuItem asChild>
                    <Link href="/admin" className="flex items-center gap-2 text-accent font-bold cursor-pointer">
                      <Scale className="h-4 w-4" /> {isArabic ? "إدارة المنصة" : "Admin Panel"}
                    </Link>
                  </DropdownMenuItem>
                )}
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => window.location.href = "/auth/login"} className="text-red-500 cursor-pointer">
                  {isArabic ? "تسجيل الخروج" : "Logout"}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <div className="flex gap-2">
              <Link href="/auth/login" className="hidden sm:inline-flex">
                <Button variant="ghost" size="sm">{isArabic ? "دخول" : "Login"}</Button>
              </Link>
              <Link href="/auth/signup">
                <Button size="sm" className="bg-primary hover:bg-primary/90 rounded-xl">{isArabic ? "اشترك" : "Sign Up"}</Button>
              </Link>
            </div>
          )}
          
          <div className="md:hidden">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="rounded-full">
                  <Menu className="h-6 w-6" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56 text-right rounded-xl" dir={isArabic ? "rtl" : "ltr"}>
                <DropdownMenuItem asChild><Link href="/consultants" className="cursor-pointer">{isArabic ? "المستشارون" : "Consultants"}</Link></DropdownMenuItem>
                <DropdownMenuItem asChild><Link href="/match" className="cursor-pointer">{isArabic ? "المطابقة الذكية" : "AI Match"}</Link></DropdownMenuItem>
                <DropdownMenuItem asChild><Link href="/templates" className="cursor-pointer">{isArabic ? "النماذج" : "Templates"}</Link></DropdownMenuItem>
                <DropdownMenuItem asChild><Link href="/bot" className="cursor-pointer font-bold text-accent">{isArabic ? "البوت الذكي" : "Bot"}</Link></DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
    </nav>
  );
}
