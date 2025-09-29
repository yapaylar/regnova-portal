"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";

import { loginSchema } from "@/lib/auth/schemas";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/components/ui/use-toast";

export default function LoginPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
      rememberMe: false,
      fingerprint: undefined,
    },
  });

  const onSubmit = form.handleSubmit(async (values) => {
    try {
      setIsSubmitting(true);
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(values),
      });

      const data = await response.json();

      if (!response.ok) {
        toast.error("Login failed", {
          description: data?.error?.message ?? "Unable to sign in with those credentials.",
        });
        return;
      }

      toast.success("Welcome back", {
        description: "You are now signed in.",
      });
      router.push("/");
    } catch (error) {
      console.error("Login request failed", error);
      toast.error("Unexpected error", {
        description: "Please try again in a few moments.",
      });
    } finally {
      setIsSubmitting(false);
    }
  });

  return (
    <div className="space-y-6">
      <div className="space-y-2 text-center">
        <h1 className="text-2xl font-semibold">Sign in to your account</h1>
        <p className="text-sm text-muted-foreground">Access the Regnova Portal to monitor complaints, recalls, and PMS workflows.</p>
      </div>
      <Form {...form}>
        <form onSubmit={onSubmit} className="space-y-4">
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email</FormLabel>
                <FormControl>
                  <Input type="email" placeholder="you@example.com" autoComplete="email" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Password</FormLabel>
                <FormControl>
                  <Input type="password" placeholder="********" autoComplete="current-password" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="rememberMe"
            render={({ field }) => (
              <FormItem className="flex items-center justify-between rounded-lg border bg-card px-4 py-3">
                <div>
                  <FormLabel className="text-sm font-medium">Stay signed in</FormLabel>
                  <p className="text-xs text-muted-foreground">Remember this device for easier access next time.</p>
                </div>
                <FormControl>
                  <Switch checked={field.value} onCheckedChange={field.onChange} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <Button type="submit" className="w-full" disabled={isSubmitting}>
            {isSubmitting ? "Signing in..." : "Sign in"}
          </Button>
        </form>
      </Form>
      <div className="text-center text-sm text-muted-foreground">
        Don't have an account? <Link href="/signup" className="font-medium text-primary hover:underline">Create one</Link>
      </div>
    </div>
  );
}

