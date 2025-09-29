"use client";

import { Control } from "react-hook-form";

import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { ReportFormValues } from "@/lib/validation";

type FacilityStepProps = {
  control: Control<ReportFormValues>;
};

export function FacilityStep({ control }: FacilityStepProps) {
  return (
    <section className="grid gap-4 sm:grid-cols-2">
      <FormField
        control={control}
        name="facility.name"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Facility Name</FormLabel>
            <FormControl>
              <Input placeholder="Enter facility name" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      <FormField
        control={control}
        name="facility.department"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Department / Unit</FormLabel>
            <FormControl>
              <Input placeholder="Enter department or unit" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      <FormField
        control={control}
        name="facility.address"
        render={({ field }) => (
          <FormItem className="sm:col-span-2">
            <FormLabel>Address</FormLabel>
            <FormControl>
              <Input placeholder="Enter address" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      <FormField
        control={control}
        name="facility.region"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Region</FormLabel>
            <FormControl>
              <Input placeholder="Enter region" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      <FormField
        control={control}
        name="facility.contactPerson"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Contact Person</FormLabel>
            <FormControl>
              <Input placeholder="Enter contact person" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      <FormField
        control={control}
        name="facility.phone"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Phone</FormLabel>
            <FormControl>
              <Input placeholder="Enter phone number" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      <FormField
        control={control}
        name="facility.email"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Email</FormLabel>
            <FormControl>
              <Input type="email" placeholder="Enter email" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </section>
  );
}

