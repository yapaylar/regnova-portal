"use client";

import dynamic from "next/dynamic";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const AreaAnalytics = dynamic(() => import("@/components/manufacturer/charts/area-analytics"), { ssr: false });
const BarAnalytics = dynamic(() => import("@/components/manufacturer/charts/bar-analytics"), { ssr: false });
const DonutAnalytics = dynamic(() => import("@/components/manufacturer/charts/donut-analytics"), { ssr: false });
const TimelineAnalytics = dynamic(() => import("@/components/manufacturer/charts/timeline-analytics"), { ssr: false });

export default function ManufacturerAnalyticsPage() {
  return (
    <div className="flex flex-col gap-6">
      <header className="flex flex-col gap-2">
        <h1 className="text-2xl font-semibold">Analytics Dashboard</h1>
        <p className="text-sm text-muted-foreground">
          Monitor device performance, complaint trends, and recall response in realtime dashboards.
        </p>
      </header>

      <section className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Complaint Volume</CardTitle>
            <CardDescription>Rolling 6 month trend across all device families.</CardDescription>
          </CardHeader>
          <CardContent>
            <AreaAnalytics />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Complaint Category Breakdown</CardTitle>
            <CardDescription>Distribution of complaint types by severity.</CardDescription>
          </CardHeader>
          <CardContent>
            <DonutAnalytics />
          </CardContent>
        </Card>
      </section>

      <section className="grid gap-4 lg:grid-cols-[1.5fr_1fr]">
        <Card>
          <CardHeader>
            <CardTitle>Device Performance</CardTitle>
            <CardDescription>Top-performing devices with lowest complaint-per-unit ratios.</CardDescription>
          </CardHeader>
          <CardContent>
            <BarAnalytics />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Recall Timeline</CardTitle>
            <CardDescription>Active recalls and completion window progress.</CardDescription>
          </CardHeader>
          <CardContent>
            <TimelineAnalytics />
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
