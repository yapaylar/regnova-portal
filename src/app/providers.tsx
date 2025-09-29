"use client";

import { QueryClientProvider } from "@tanstack/react-query";
import { useState } from "react";

import dynamic from "next/dynamic";
import { Toaster } from "sonner";

import { ThemeProvider } from "@/context/theme-context";
import { AuthProvider } from "@/context/auth-context";
import { createQueryClient } from "@/lib/query-client";

type ProvidersProps = {
  children: React.ReactNode;
};

const ReactQueryDevtools = dynamic(
  () => import("@tanstack/react-query-devtools").then((mod) => mod.ReactQueryDevtools),
  { ssr: false },
);

export function Providers({ children }: ProvidersProps) {
  const [queryClient] = useState(() => createQueryClient());

  return (
    <ThemeProvider defaultTheme="slate">
      <AuthProvider>
        <QueryClientProvider client={queryClient}>
          {children}
          <ReactQueryDevtools initialIsOpen={false} buttonPosition="bottom-right" />
          <Toaster richColors position="bottom-right" closeButton />
        </QueryClientProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}


