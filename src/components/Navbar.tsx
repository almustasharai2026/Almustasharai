
"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Scale, Menu, BrainCircuit } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export function Navbar() {
  return (
    <nav className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 font-headline font-bold text-primary text-xl tracking-tight">
          <Scale className="h-6 w-6 text-accent" />
          <span>المستشار</span>
        </Link>

        <div className="hidden md:flex items-center gap-8">
          <Link href="/consultants" className="text-sm font-medium hover:text-accent transition-colors">ابحث عن مستشار</Link>
          <Link href="/match" className="text-sm font-medium hover:text-accent transition-colors flex items-center gap-1">
            <BrainCircuit className="h-4 w-4" /> المطابقة بالذكاء الاصطناعي
          </Link>
          <Link href="/about" className="text-sm font-medium hover:text-accent transition-colors">من نحن</Link>
        </div>

        <div className="flex items-center gap-2">
          <Link href="/auth/login" className="hidden sm:inline-flex">
            <Button variant="ghost" size="sm">تسجيل الدخول</Button>
          </Link>
          <Link href="/auth/signup">
            <Button size="sm" className="bg-primary hover:bg-primary/90">إنشاء حساب</Button>
          </Link>
          <div className="md:hidden">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon">
                  <Menu className="h-5 w-5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuItem asChild>
                  <Link href="/consultants">ابحث عن مستشار</Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/match">المطابقة الذكية</Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/dashboard">لوحة التحكم</Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/about">من نحن</Link>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
    </nav>
  );
}
