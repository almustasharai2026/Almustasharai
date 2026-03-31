'use client';

import { useEffect, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { useUser } from "@/firebase";
import { Loading } from "./Loading";

/**
 * مكون حماية المسارات.
 * يضمن عدم دخول أي مواطن للمناطق السيادية بدون هوية رقمية مفعلة.
 */
export function ProtectedRoute({ children, adminOnly = false }: { children: ReactNode, adminOnly?: boolean }) {
  const { user, role, isUserLoading } = useUser();
  const router = useRouter();

  useEffect(() => {
    if (!isUserLoading) {
      if (!user) {
        router.push("/auth/login");
      } else if (adminOnly && role !== "admin") {
        router.push("/dashboard");
      }
    }
  }, [user, role, isUserLoading, adminOnly, router]);

  if (isUserLoading) return <Loading />;
  if (!user) return null;
  if (adminOnly && role !== "admin") return null;

  return <>{children}</>;
}
