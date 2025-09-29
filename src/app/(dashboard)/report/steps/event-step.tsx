"use client";

import { Control } from "react-hook-form";

import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Textarea } from "@/components/ui/textarea";
import { ReportFormValues } from "@/lib/validation";

type EventStepProps = {
  control: Control<ReportFormValues>;
};

const severityOptions = [
  { label: "Low", value: "low" },
  { label: "Medium", value: "medium" },
  { label: "High", value: "high" },
];

const outcomeOptions = [
  { label: "Recovered", value: "recovered" },
  { label: "Ongoing", value: "ongoing" },
  { label: "Fatal", value: "fatal" },
  { label: "Unknown", value: "unknown" },
];

export function EventStep({ control }: EventStepProps) {
  return (
    <section className="grid gap-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <FormField
          control={control}
          name="event.date"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Event Date</FormLabel>
              <FormControl>
                <Input type="date" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={control}
          name="event.location"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Location</FormLabel>
              <FormControl>
                <Input placeholder="Enter facility location" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
      <FormField
        control={control}
        name="event.description"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Description</FormLabel>
            <FormControl>
              <Textarea placeholder="Enter a short description…" rows={5} {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      <div className="grid gap-4 sm:grid-cols-2">
        <FormField
          control={control}
          name="event.severity"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Severity</FormLabel>
              <FormControl>
                <RadioGroup
                  className="flex gap-2"
                  value={field.value}
                  onValueChange={field.onChange}
                >
                  {severityOptions.map((option) => (
                    <label
                      key={option.value}
                      className="flex cursor-pointer items-center gap-2 rounded-full border px-3 py-1 text-sm"
                    >
                      <RadioGroupItem value={option.value} />
                      {option.label}
                    </label>
                  ))}
                </RadioGroup>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={control}
          name="event.outcome"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Outcome</FormLabel>
              <FormControl>
                <RadioGroup
                  className="flex flex-wrap gap-2"
                  value={field.value}
                  onValueChange={field.onChange}
                >
                  {outcomeOptions.map((option) => (
                    <label
                      key={option.value}
                      className="flex cursor-pointer items-center gap-2 rounded-full border px-3 py-1 text-sm"
                    >
                      <RadioGroupItem value={option.value} />
                      {option.label}
                    </label>
                  ))}
                </RadioGroup>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
      <FormField
        control={control}
        name="event.patientInvolved"
        render={({ field }) => (
          <FormItem className="flex items-center justify-between rounded-lg border p-4">
            <FormLabel>Patient involved?</FormLabel>
            <FormControl>
              <input
                type="checkbox"
                className="size-4 rounded border focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/30"
                checked={field.value}
                onChange={(event) => field.onChange(event.target.checked)}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      <FormField
        control={control}
        name="event.actionsTaken"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Actions Taken</FormLabel>
            <FormControl>
              <Textarea placeholder="Describe the immediate actions taken" rows={4} {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </section>
  );
}

