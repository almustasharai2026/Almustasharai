
"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Scale } from "lucide-react";
import { useState } from "react";
import { useAuth } from "@/firebase";
import { initiateEmailSignIn } from "@/firebase/non-blocking-login";

export default function LoginPage() {
  const [email, setEmail] = useState("bishoysamy390@gmail.com");
  const [password, setPassword] = useState("Bishoysamy2020");
  const auth = useAuth();

  const handleLogin = () => {
    if (auth) {
      initiateEmailSignIn(auth, email, password);
    }
  };

  return (
    <div className="container flex items-center justify-center min-h-[calc(100vh-10rem)] py-12">
      <Card className="w-full max-w-md shadow-lg border-muted">
        <CardHeader className="space-y-2 text-center">
          <div className="flex justify-center mb-4">
            <Scale className="h-12 w-12 text-accent" />
          </div>
          <CardTitle className="text-2xl font-headline font-bold text-primary">تسجيل الدخول</CardTitle>
          <CardDescription>أدخل بياناتك للوصول إلى حسابك</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">البريد الإلكتروني</Label>
            <Input 
              id="email" 
              type="email" 
              placeholder="name@example.com" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="password">كلمة المرور</Label>
              <Link href="#" className="text-xs text-accent hover:underline">نسيت كلمة المرور؟</Link>
            </div>
            <Input 
              id="password" 
              type="password" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          <Button 
            className="w-full bg-primary hover:bg-primary/90 py-6 text-lg"
            onClick={handleLogin}
          >
            دخول
          </Button>
        </CardContent>
        <CardFooter className="flex flex-col space-y-4 border-t pt-6">
          <div className="text-sm text-center text-muted-foreground">
            ليس لديك حساب؟{" "}
            <Link href="/auth/signup" className="text-accent font-medium hover:underline">إنشاء حساب جديد</Link>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
}
