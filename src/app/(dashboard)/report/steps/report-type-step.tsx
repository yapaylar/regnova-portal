"use client";

import { Control } from "react-hook-form";

import { FormControl, FormField, FormItem, FormLabel } from "@/components/ui/form";
import { RadioGroup } from "@/components/ui/radio-group";
import { cn } from "@/lib/utils";
import { ReportFormValues } from "@/lib/validation";

type ReportTypeStepProps = {
  control: Control<ReportFormValues>;
};

export function ReportTypeStep({ control }: ReportTypeStepProps) {
  return (
    <section className="space-y-6">
      <FormField
        control={control}
        name="reportType"
        render={({ field }) => (
          <FormItem className="space-y-3">
            <FormLabel>Report Type</FormLabel>
            <FormControl>
              <RadioGroup
                onValueChange={field.onChange}
                value={field.value}
                className="grid gap-4 sm:grid-cols-2"
              >
                <ReportTypeOption
                  value="complaint"
                  title="Complaint"
                  description="General device complaint reported by a facility or manufacturer."
                  selected={field.value === "complaint"}
                  onSelect={() => field.onChange("complaint")}
                />
                <ReportTypeOption
                  value="adverse-event"
                  title="Adverse Event"
                  description="Serious incident involving patient harm or safety risk."
                  selected={field.value === "adverse-event"}
                  onSelect={() => field.onChange("adverse-event")}
                />
              </RadioGroup>
            </FormControl>
          </FormItem>
        )}
      />
    </section>
  );
}

type ReportTypeOptionProps = {
  value: "complaint" | "adverse-event";
  title: string;
  description: string;
  selected: boolean;
  onSelect: () => void;
};

function ReportTypeOption({
  value,
  title,
  description,
  selected,
  onSelect,
}: ReportTypeOptionProps) {
  return (
    <button
      type="button"
      onClick={onSelect}
      className={cn(
        "flex w-full flex-col gap-2 rounded-lg border p-4 text-left transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/30",
        selected ? "border-primary bg-primary/10" : "hover:border-primary/40"
      )}
      aria-pressed={selected}
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-semibold">{title}</p>
          <p className="text-xs text-muted-foreground">{description}</p>
        </div>
        <span
          className={cn(
            "mt-1 flex size-4 items-center justify-center rounded-full border",
            selected ? "border-primary" : "border-muted"
          )}
        >
          <span
            className={cn(
              "rounded-full bg-primary transition",
              selected ? "size-2" : "size-0"
            )}
          />
        </span>
      </div>
    </button>
  )
}

