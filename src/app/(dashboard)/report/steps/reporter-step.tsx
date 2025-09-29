"use client";

import { Control } from "react-hook-form";

import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { ReportFormValues } from "@/lib/validation";

type ReporterStepProps = {
  control: Control<ReportFormValues>;
  role: string;
};

export function ReporterStep({ control }: ReporterStepProps) {
  return (
    <section className="grid gap-4 sm:grid-cols-2">
      <FormField
        control={control}
        name="reporter.name"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Reporter Name</FormLabel>
            <FormControl>
              <Input placeholder="Enter reporter name" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      <FormField
        control={control}
        name="reporter.title"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Role / Title</FormLabel>
            <FormControl>
              <Input placeholder="Enter role or title" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      <FormField
        control={control}
        name="reporter.email"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Email</FormLabel>
            <FormControl>
              <Input type="email" placeholder="Enter reporter email" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      <FormField
        control={control}
        name="reporter.phone"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Phone</FormLabel>
            <FormControl>
              <Input placeholder="Enter reporter phone" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      <FormField
        control={control}
        name="reporter.organization"
        render={({ field }) => (
          <FormItem className="sm:col-span-2">
            <FormLabel>Organization</FormLabel>
            <FormControl>
              <Input placeholder="Enter organization" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </section>
  );
}

