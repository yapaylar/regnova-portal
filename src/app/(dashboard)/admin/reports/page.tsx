"use client";

import { useMemo, useState } from "react";
import { ArrowUpRight } from "lucide-react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { RECENT_COMPLAINTS, RECALLS } from "@/data/mock";
import { formatDate } from "@/lib/formatters";
import { useAdminReports } from "@/hooks/use-admin-reports";
import { format } from "date-fns";

const TAB_TRIGGER_CLASSES = "data-[state=active]:bg-primary data-[state=active]:text-primary-foreground";

export default function AdminReportsPage() {
  const [search, setSearch] = useState("");
  const { data, isLoading, isError } = useAdminReports({ search: search.length ? search : undefined });

  const rows = useMemo(() => data?.items ?? [], [data]);

  return (
    <div className="flex flex-col gap-6">
      <Card>
        <CardHeader>
          <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
            <div>
              <CardTitle>Reports</CardTitle>
              <CardDescription>Review complaints and adverse events submitted through the portal.</CardDescription>
            </div>
            <Input
              className="w-full md:w-64"
              placeholder="Search by tracking ID or summary"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
            />
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="flex h-48 items-center justify-center text-sm text-muted-foreground">Loading reports…</div>
          ) : isError ? (
            <div className="flex h-48 items-center justify-center text-sm text-destructive">Failed to fetch reports.</div>
          ) : rows.length === 0 ? (
            <div className="flex h-48 items-center justify-center text-sm text-muted-foreground">No reports found.</div>
          ) : (
            <ScrollArea className="max-h-[600px]">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Tracking ID</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Submitted</TableHead>
                    <TableHead>Summary</TableHead>
                    <TableHead>Facility</TableHead>
                    <TableHead>Manufacturer</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {rows.map((report) => (
                    <TableRow key={report.id}>
                      <TableCell className="font-medium">{report.trackingId}</TableCell>
                      <TableCell>
                        <Badge variant="outline">{report.reportType.replace("_", " ")}</Badge>
                      </TableCell>
                      <TableCell>
                        <Badge>{report.status.replace("_", " ")}</Badge>
                      </TableCell>
                      <TableCell>
                        {report.submittedAt
                          ? format(new Date(report.submittedAt), "PP p")
                          : format(new Date(report.createdAt), "PP p")}
                      </TableCell>
                      <TableCell className="max-w-xs whitespace-pre-wrap text-sm text-muted-foreground">
                        {report.summary ?? "—"}
                      </TableCell>
                      <TableCell>{report.facility?.name ?? "—"}</TableCell>
                      <TableCell>{report.manufacturer?.name ?? "—"}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </ScrollArea>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Operations Snapshot</CardTitle>
          <CardDescription>Monitor recent activity and take quick actions.</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="complaints" className="space-y-4">
            <TabsList className="grid w-full gap-2 rounded-xl bg-muted p-1 sm:w-auto sm:grid-cols-3">
              <TabsTrigger value="complaints" className={TAB_TRIGGER_CLASSES}>
                Recent Complaints
              </TabsTrigger>
              <TabsTrigger value="recalls" className={TAB_TRIGGER_CLASSES}>
                Recent Recalls
              </TabsTrigger>
              <TabsTrigger value="quick" className={TAB_TRIGGER_CLASSES}>
                Quick Actions
              </TabsTrigger>
            </TabsList>

            <TabsContent value="complaints" className="space-y-3">
              {RECENT_COMPLAINTS.map((complaint) => (
                <Card key={complaint.id} className="border-muted bg-muted/10">
                  <CardHeader className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <CardTitle className="text-base">{complaint.patientName}</CardTitle>
                      <CardDescription>
                        {complaint.facility} • {formatDate(complaint.submittedAt)}
                      </CardDescription>
                    </div>
                    <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
                      {complaint.status}
                    </span>
                  </CardHeader>
                  <CardContent className="text-sm text-muted-foreground">
                    {complaint.summary}
                  </CardContent>
                </Card>
              ))}
            </TabsContent>

            <TabsContent value="recalls" className="space-y-3">
              {RECALLS.slice(0, 4).map((recall) => (
                <Card key={recall.id} className="border-muted bg-muted/10">
                  <CardHeader className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <CardTitle className="text-base">{recall.device}</CardTitle>
                      <CardDescription>
                        {recall.manufacturer} • {formatDate(recall.date)}
                      </CardDescription>
                    </div>
                    <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-medium text-amber-700">
                      {recall.actionType}
                    </span>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground">{recall.description}</p>
                    <div className="mt-3 flex flex-wrap gap-2 text-xs text-muted-foreground">
                      <span className="inline-flex items-center gap-1 rounded-full bg-muted px-2 py-1">
                        {recall.region}
                      </span>
                      <span className="inline-flex items-center gap-1 rounded-full bg-muted px-2 py-1">
                        Status: {recall.status}
                      </span>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </TabsContent>

            <TabsContent value="quick">
              <div className="grid gap-3 sm:grid-cols-3">
                <QuickAction
                  href="/report"
                  title="Start Report"
                  description="Log a new complaint or adverse event in minutes."
                />
                <QuickAction
                  href="/recalls"
                  title="View Recalls"
                  description="Review active recalls and corrective actions."
                />
                <QuickAction
                  href="/track"
                  title="Track by ID"
                  description="Monitor complaint progress with a tracking ID."
                />
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}

type QuickActionProps = {
  href: string;
  title: string;
  description: string;
};

function QuickAction({ href, title, description }: QuickActionProps) {
  return (
    <Link
      href={href}
      className="flex h-full flex-col rounded-lg border bg-card p-4 transition hover:border-primary/60 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/30"
    >
      <div className="flex items-center gap-3">
        <span className="flex size-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
          <ArrowUpRight className="size-5" />
        </span>
        <div>
          <p className="text-sm font-semibold">{title}</p>
          <p className="text-xs text-muted-foreground">{description}</p>
        </div>
      </div>
    </Link>
  );
}


