'use client';

import { useEffect, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { useSovereignAuth } from "@/context/AuthContext";
import { Loading } from "./Loading";

/**
 * مكون حماية المسارات السيادية.
 * يقوم بمراقبة حالة الهوية الرقمية ومنع الوصول غير المصرح به للمناطق المحصنة.
 */
export default function ProtectedRoute({ children }: { children: ReactNode }) {
  const { user, isUserLoading } = useSovereignAuth();
  const router = useRouter();

  useEffect(() => {
    // بروتوكول التوجيه: في حال اكتمال التحميل وغياب الهوية، يتم التوجه لبوابة الدخول
    if (!isUserLoading && !user) {
      router.push("/auth/login");
    }
  }, [user, isUserLoading, router]);

  // عرض واجهة التحميل السيادية أثناء فحص الصلاحيات
  if (isUserLoading) {
    return <Loading />;
  }

  // في حال وجود هوية صالحة، يتم السماح بعبور المكونات التابعة
  return user ? <>{children}</> : null;
}
