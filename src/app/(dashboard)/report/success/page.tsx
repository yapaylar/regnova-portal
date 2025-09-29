"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";

function ReportSuccessContent() {
  const searchParams = useSearchParams();
  const trackingId = searchParams.get("trackingId") ?? "";

  return (
    <div className="flex h-full flex-col items-center justify-center gap-6 py-10 text-center">
      <Card className="max-w-lg text-left">
        <CardHeader>
          <CardTitle>Report submitted successfully</CardTitle>
          <CardDescription>
            Thank you. We received your report and assigned a tracking ID.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {trackingId ? (
            <div className="rounded-md border bg-muted/40 p-4">
              <p className="text-xs font-medium uppercase text-muted-foreground">Tracking ID</p>
              <p className="text-lg font-semibold">{trackingId}</p>
              <p className="text-xs text-muted-foreground">
                Please save this ID to follow the status of your report.
              </p>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">
              You can track the status later from the Track Complaint page.
            </p>
          )}
        </CardContent>
        <CardFooter className="flex flex-col gap-2 sm:flex-row sm:justify-end">
          <Button variant="outline" asChild>
            <Link href="/">Go to Dashboard</Link>
          </Button>
          <Button asChild>
            <Link href={trackingId ? `/track?id=${trackingId}` : "/track"}>Track Now</Link>
          </Button>
        </CardFooter>
      </Card>
      <p className="text-xs text-muted-foreground">Need to submit another? Start a new report from the dashboard.</p>
    </div>
  );
}

export default function ReportSuccessPage() {
  return (
    <Suspense fallback={<LoadingState />}>
      <ReportSuccessContent />
    </Suspense>
  );
}

function LoadingState() {
  return (
    <div className="flex h-full flex-col items-center justify-center gap-6 py-10 text-center">
      <Card className="max-w-lg text-left">
        <CardHeader>
          <CardTitle>Loading report status…</CardTitle>
          <CardDescription>Please wait while we prepare your confirmation.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-24 animate-pulse rounded-md bg-muted/40" />
        </CardContent>
      </Card>
    </div>
  );
}

