"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

import { useAuth } from "@/context/auth-context";
type ProtectedRouteProps = {
  children: React.ReactNode;
};

export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const router = useRouter();
  const { isAuthenticated, isBootstrapping } = useAuth();

  useEffect(() => {
    if (isBootstrapping) return;
    if (!isAuthenticated) {
      router.replace("/login");
    }
  }, [isAuthenticated, isBootstrapping, router]);

  if (isBootstrapping) {
    return <div className="h-screen w-full" />;
  }

  if (!isAuthenticated) {
    return null;
  }

  return <>{children}</>;
}


