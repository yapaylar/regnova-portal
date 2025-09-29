"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

type TimelineResponse = {
  report: {
    trackingId: string;
    status: string;
    reportType: string;
    submittedAt: string | null;
    createdAt: string;
    details: unknown;
  };
};

type TrackFormValues = {
  trackingId: string;
};

type StatusStep = {
  status: string;
  date: string;
  note: string;
};

const defaultValues = {
  trackingId: "",
};

function TrackComplaintContent() {
  const searchParams = useSearchParams();
  const searchTrackingId = searchParams.get("id");
  const form = useForm<TrackFormValues>({ defaultValues });
  const [history, setHistory] = useState<StatusStep[] | null>(null);
  const [submittedId, setSubmittedId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const onSubmit = form.handleSubmit(async ({ trackingId }) => {
    const cleaned = trackingId.trim().toUpperCase();
    form.setValue("trackingId", cleaned);
    if (!cleaned) return;
    setLoading(true);
    try {
      const response = await fetch(`/api/report/${cleaned}`);
      if (!response.ok) {
        const payload = await response.json().catch(() => null);
        toast.error("Tracking ID not found", {
          description: payload?.error?.message ?? "Please check the ID and try again.",
        });
        setHistory(null);
        setSubmittedId(cleaned);
        return;
      }
      const data = (await response.json()) as TimelineResponse;
      setSubmittedId(cleaned);
      setHistory([
        {
          status: `Status: ${data.report.status}`,
          date: (data.report.submittedAt ?? data.report.createdAt) ?? new Date().toISOString(),
          note: "Report submitted to Regnova.",
        },
      ]);
    } catch (error) {
      console.error("Track request failed", error);
      toast.error("Unable to fetch report", {
        description: "Please try again later.",
      });
    } finally {
      setLoading(false);
    }
  });

  useEffect(() => {
    if (searchTrackingId) {
      const cleaned = searchTrackingId.trim().toUpperCase();
      form.setValue("trackingId", cleaned);
      void onSubmit({ trackingId: cleaned });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchTrackingId]);

  return (
    <div className="flex flex-col gap-6">
      <Card>
        <CardHeader>
          <CardTitle>Track Complaint</CardTitle>
          <CardDescription>Enter your tracking ID to view the status timeline.</CardDescription>
        </CardHeader>
        <Form {...form}>
          <form onSubmit={onSubmit}>
            <CardContent className="space-y-4 pb-6">
              <FormField
                control={form.control}
                name="trackingId"
                rules={{ required: "Tracking ID is required" }}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tracking ID</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter your tracking ID…" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
            <CardFooter className="flex gap-2">
              <Button type="submit" disabled={loading}>
                {loading ? "Searching…" : "Track Now"}
              </Button>
              <Button
                type="button"
                variant="ghost"
                onClick={() => {
                  form.reset(defaultValues);
                  setHistory(null);
                  setSubmittedId(null);
                }}
              >
                Reset
              </Button>
            </CardFooter>
          </form>
        </Form>
      </Card>

      {submittedId ? (
        <Timeline trackingId={submittedId} history={history} />
      ) : (
        <EmptyState message="Enter a tracking ID to view the complaint status." />
      )}
    </div>
  );
}

export default function TrackComplaintPage() {
  return (
    <Suspense fallback={<LoadingState />}>
      <TrackComplaintContent />
    </Suspense>
  );
}

function LoadingState() {
  return (
    <div className="flex flex-col gap-6">
      <Card>
        <CardHeader>
          <CardTitle>Track Complaint</CardTitle>
          <CardDescription>Loading tracking form…</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-24 animate-pulse rounded-lg bg-muted/50" />
        </CardContent>
      </Card>
      <div className="h-40 animate-pulse rounded-lg border border-dashed bg-muted/50" />
    </div>
  );
}

type TimelineProps = {
  trackingId: string;
  history: StatusStep[] | null;
};

function Timeline({ trackingId, history }: TimelineProps) {
  if (!history) {
    return <EmptyState message="No record found for this tracking ID." trackingId={trackingId} />;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Status Timeline</CardTitle>
        <CardDescription>Tracking ID: {trackingId}</CardDescription>
      </CardHeader>
      <CardContent>
        <ol className="space-y-4">
          {history.map((step, index) => (
            <li key={`${step.status}-${index}`} className="flex gap-3">
              <span className="mt-1 size-2 rounded-full bg-primary" aria-hidden />
              <div>
                <p className="text-sm font-medium">{step.status}</p>
                <p className="text-xs text-muted-foreground">{step.date}</p>
                <p className="mt-1 text-sm text-muted-foreground">{step.note}</p>
              </div>
            </li>
          ))}
        </ol>
      </CardContent>
    </Card>
  );
}

type EmptyStateProps = {
  message: string;
  trackingId?: string;
};

function EmptyState({ message, trackingId }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center gap-2 rounded-lg border border-dashed bg-muted/30 p-8 text-center">
      <p className="text-sm font-medium">{message}</p>
      {trackingId ? (
        <p className="text-xs text-muted-foreground">Tracking ID: {trackingId}</p>
      ) : null}
    </div>
  );
}

