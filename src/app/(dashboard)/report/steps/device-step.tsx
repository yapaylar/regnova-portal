"use client";

import { Control } from "react-hook-form";

import { FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { ReportFormValues } from "@/lib/validation";

type DeviceStepProps = {
  control: Control<ReportFormValues>;
};

export function DeviceStep({ control }: DeviceStepProps) {
  return (
    <section className="grid gap-4 sm:grid-cols-2">
      <FormField
        control={control}
        name="device.name"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Device Name</FormLabel>
            <FormControl>
              <Input placeholder="Enter device name" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      <FormField
        control={control}
        name="device.model"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Model</FormLabel>
            <FormControl>
              <Input placeholder="Enter device model" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      <FormField
        control={control}
        name="device.manufacturer"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Manufacturer</FormLabel>
            <FormControl>
              <Input placeholder="Enter manufacturer name" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      <FormField
        control={control}
        name="device.serialLotNumber"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Serial / Lot Number</FormLabel>
            <FormControl>
              <Input placeholder="Enter serial or lot number" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      <FormField
        control={control}
        name="device.udi"
        render={({ field }) => (
          <FormItem>
            <FormLabel>UDI (optional)</FormLabel>
            <FormControl>
              <Input placeholder="Enter UDI" {...field} />
            </FormControl>
            <FormDescription>Unique Device Identifier if available.</FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />
      <FormField
        control={control}
        name="device.purchaseDate"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Purchase / Installation Date</FormLabel>
            <FormControl>
              <Input type="date" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </section>
  );
}

