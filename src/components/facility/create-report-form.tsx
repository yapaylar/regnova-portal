"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/components/ui/use-toast";
import { useFacilityDevices } from "@/hooks/use-facility-devices";
import { useCreateFacilityReport } from "@/hooks/use-facility-reports";

const reportFormSchema = z.object({
  deviceId: z.string().min(1, "Please select a device"),
  reportType: z.enum(["COMPLAINT", "ADVERSE_EVENT"], {
    required_error: "Please select a report type",
  }),
  severity: z.enum(["LOW", "MEDIUM", "HIGH", "CRITICAL"], {
    required_error: "Please select severity level",
  }),
  summary: z.string().min(10, "Summary must be at least 10 characters"),
  description: z.string().min(20, "Description must be at least 20 characters"),
  dateOccurred: z.string().optional(),
});

type ReportFormValues = z.infer<typeof reportFormSchema>;

export function CreateReportForm({ onSuccess }: { onSuccess?: () => void }) {
  const { toast } = useToast();
  const { data: devicesData, isLoading: devicesLoading } = useFacilityDevices({ pageSize: 100 });
  const createReport = useCreateFacilityReport();

  const form = useForm<ReportFormValues>({
    resolver: zodResolver(reportFormSchema),
    defaultValues: {
      deviceId: "",
      reportType: "COMPLAINT",
      severity: "MEDIUM",
      summary: "",
      description: "",
      dateOccurred: "",
    },
  });

  const onSubmit = async (values: ReportFormValues) => {
    try {
      await createReport.mutateAsync(values);
      toast.success("Report submitted successfully");
      form.reset();
      onSuccess?.();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to submit report");
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Report an Issue</CardTitle>
        <CardDescription>Submit a complaint or adverse event report for one of your devices.</CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="deviceId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Device *</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value} disabled={devicesLoading}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder={devicesLoading ? "Loading devices..." : "Select device"} />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {devicesData?.data.map((device) => (
                        <SelectItem key={device.assignmentId} value={device.device.id}>
                          {device.device.name} - {device.device.manufacturer.name}
                          {device.device.modelNumber && ` (${device.device.modelNumber})`}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid gap-4 md:grid-cols-2">
              <FormField
                control={form.control}
                name="reportType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Report Type *</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="COMPLAINT">Complaint</SelectItem>
                        <SelectItem value="ADVERSE_EVENT">Adverse Event</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="severity"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Severity *</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="LOW">Low</SelectItem>
                        <SelectItem value="MEDIUM">Medium</SelectItem>
                        <SelectItem value="HIGH">High</SelectItem>
                        <SelectItem value="CRITICAL">Critical</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="dateOccurred"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Date Occurred (Optional)</FormLabel>
                  <FormControl>
                    <Input type="date" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="summary"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Summary *</FormLabel>
                  <FormControl>
                    <Input placeholder="Brief summary of the issue" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description *</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Detailed description of the issue, including what happened, when it occurred, and any relevant context..."
                      className="min-h-[120px]"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-end gap-3">
              <Button type="button" variant="outline" onClick={() => form.reset()}>
                Clear
              </Button>
              <Button type="submit" disabled={createReport.isPending}>
                {createReport.isPending && <Loader2 className="mr-2 size-4 animate-spin" />}
                Submit Report
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}

