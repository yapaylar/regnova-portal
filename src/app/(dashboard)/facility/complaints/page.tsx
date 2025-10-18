"use client";

import { useState } from "react";
import Link from "next/link";
import { Filter, Loader2, RefreshCcw, Search } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useFacilityReports } from "@/hooks/use-facility-reports";
import { formatDate, formatDateTime } from "@/lib/formatters";

const STATUS_FILTERS = [
  { value: "ALL", label: "All" },
  { value: "SUBMITTED", label: "Submitted" },
  { value: "IN_REVIEW", label: "In Review" },
  { value: "ACTION_REQUIRED", label: "Action Required" },
  { value: "RESOLVED", label: "Resolved" },
  { value: "CLOSED", label: "Closed" },
];

const REPORT_TYPES = [
  { value: "ALL", label: "All Types" },
  { value: "COMPLAINT", label: "Complaint" },
  { value: "ADVERSE_EVENT", label: "Adverse Event" },
];

export default function FacilityComplaintsPage() {
  const [status, setStatus] = useState("ALL");
  const [reportType, setReportType] = useState("ALL");
  const [search, setSearch] = useState("");

  const { data, isLoading, isError, refetch, isRefetching } = useFacilityReports({
    status: status !== "ALL" ? status : undefined,
    reportType: reportType !== "ALL" ? reportType : undefined,
    search: search.length ? search : undefined,
  });

  return (
    <div className="flex flex-col gap-6">
      <Card>
        <CardHeader className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <CardTitle>Complaints &amp; Report Issue</CardTitle>
            <CardDescription>Open the report wizard to submit a complaint or adverse event.</CardDescription>
          </div>
          <Button asChild>
            <Link href="/report">Report an issue</Link>
          </Button>
        </CardHeader>
      </Card>

      <Card>
        <CardHeader className="space-y-3">
          <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
            <div>
              <CardTitle>Submitted Complaints</CardTitle>
              <CardDescription>Track the status of complaints submitted by your facility.</CardDescription>
            </div>
            <div className="flex flex-wrap gap-3">
              <div className="relative w-full md:w-64">
                <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  className="pl-9"
                  placeholder="Search by tracking ID or summary"
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                />
              </div>
              <Button variant="outline" onClick={() => refetch()} disabled={isRefetching}>
                {isRefetching ? <Loader2 className="mr-2 size-4 animate-spin" /> : <RefreshCcw className="mr-2 size-4" />} Refresh
              </Button>
            </div>
          </div>

          <div className="flex flex-wrap gap-3">
            <Tabs value={status} onValueChange={setStatus} className="w-full md:w-auto">
              <TabsList>
                {STATUS_FILTERS.map((filter) => (
                  <TabsTrigger key={filter.value} value={filter.value}>
                    {filter.label}
                  </TabsTrigger>
                ))}
              </TabsList>
            </Tabs>

            <Select value={reportType} onValueChange={setReportType}>
              <SelectTrigger className="w-full md:w-48">
                <SelectValue placeholder="Report type" />
              </SelectTrigger>
              <SelectContent>
                {REPORT_TYPES.map((type) => (
                  <SelectItem key={type.value} value={type.value}>
                    {type.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Button variant="outline" size="sm">
              <Filter className="mr-2 size-4" />
              Advanced Filters
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <Separator className="my-4" />

          {isLoading ? (
            <div className="flex h-48 items-center justify-center text-sm text-muted-foreground">Loading complaints…</div>
          ) : isError ? (
            <div className="flex h-48 items-center justify-center text-sm text-destructive">Failed to load complaints.</div>
          ) : !data || data.data.length === 0 ? (
            <div className="flex h-48 items-center justify-center text-sm text-muted-foreground">No complaints submitted yet.</div>
          ) : (
            <ScrollArea className="max-h-[560px]">
              <div className="divide-y">
                {data.data.map((report) => (
                  <div key={report.id} className="flex flex-col gap-3 py-4">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <div>
                        <div className="text-sm font-semibold">Tracking ID {report.trackingId}</div>
                        <div className="text-xs text-muted-foreground">
                          Submitted {formatDateTime(report.submittedAt ?? report.createdAt)}
                        </div>
                      </div>
                      <Badge>{report.status}</Badge>
                    </div>

                    <div className="grid gap-3 text-xs text-muted-foreground md:grid-cols-2 lg:grid-cols-4">
                      <div>
                        <span className="font-medium text-foreground">Report Type:</span> {report.reportType}
                      </div>
                      <div>
                        <span className="font-medium text-foreground">Device:</span> {report.device?.name ?? "—"}
                      </div>
                      <div>
                        <span className="font-medium text-foreground">Manufacturer:</span> {report.device?.manufacturer?.name ?? "—"}
                      </div>
                      <div>
                        <span className="font-medium text-foreground">Occurred:</span> {report.occurredAt ? formatDate(report.occurredAt) : "—"}
                      </div>
                    </div>

                    {report.summary ? (
                      <div className="text-sm text-muted-foreground">{report.summary}</div>
                    ) : null}

                    <Button asChild className="w-fit" variant="outline" size="sm">
                      <Link href={`/track?id=${report.trackingId}`}>Track status</Link>
                    </Button>
                  </div>
                ))}
              </div>
            </ScrollArea>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

