"use client";

import { useMemo, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2 } from "lucide-react";
import { format } from "date-fns";

import { useManufacturerReports } from "@/hooks/use-manufacturer-reports";
import { useDebounce } from "@/hooks/use-debounce";

const STATUS_LABELS: Record<string, string> = {
  DRAFT: "Draft",
  SUBMITTED: "Submitted",
  IN_REVIEW: "In Review",
  ACTION_REQUIRED: "Action Required",
  RESOLVED: "Resolved",
  CLOSED: "Closed",
};

const SEVERITY_VARIANTS: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
  LOW: "secondary",
  MEDIUM: "outline",
  HIGH: "default",
  CRITICAL: "destructive",
};

export default function ManufacturerComplaintsPage() {
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<string | undefined>(undefined);
  const debouncedSearch = useDebounce(search, 300);

  const { data, isLoading, isError } = useManufacturerReports({
    search: debouncedSearch,
    status,
  });

  const rows = useMemo(() => data?.items ?? [], [data]);

  return (
    <div className="flex flex-col gap-6">
      <header className="flex flex-col gap-2">
        <h1 className="text-2xl font-semibold">Complaints & Reports</h1>
        <p className="text-sm text-muted-foreground">
          Monitor complaint activity for your devices, track status, and coordinate responses with facilities.
        </p>
      </header>

      <Card>
        <CardHeader className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div className="flex flex-col gap-1">
            <CardTitle>Complaint Registry</CardTitle>
            <CardDescription>Filtered to reports involving your devices.</CardDescription>
          </div>
          <div className="flex w-full flex-col gap-2 sm:flex-row sm:items-center sm:justify-end">
            <Input
              className="w-full sm:w-72"
              placeholder="Search by tracking ID or summary"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
            />
          </div>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="all" onValueChange={(value) => setStatus(value === "all" ? undefined : value)}>
            <TabsList className="flex w-full flex-wrap gap-2">
              {[{ value: "all", label: "All" }, ...Object.entries(STATUS_LABELS).map(([key, value]) => ({ value: key, label: value }))].map((tab) => (
                <TabsTrigger key={tab.value} value={tab.value} className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                  {tab.label}
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>
        </CardContent>
        <CardContent className="p-0">
          {isLoading ? (
            <StateMessage state="loading" />
          ) : isError ? (
            <StateMessage state="error" />
          ) : rows.length === 0 ? (
            <StateMessage state="empty" />
          ) : (
            <ScrollArea className="max-h-[600px]">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Tracking ID</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Facility</TableHead>
                    <TableHead>Device</TableHead>
                    <TableHead>Submitted</TableHead>
                    <TableHead>Summary</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {rows.map((report) => (
                    <TableRow key={report.id}>
                      <TableCell className="font-medium">{report.trackingId}</TableCell>
                      <TableCell>
                        <Badge>{STATUS_LABELS[report.status] ?? report.status}</Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{report.reportType.replace("_", " ")}</Badge>
                      </TableCell>
                      <TableCell>{report.facility?.name ?? "—"}</TableCell>
                      <TableCell>{report.device?.name ? `${report.device.name}${report.device.modelNumber ? ` · ${report.device.modelNumber}` : ""}` : "—"}</TableCell>
                      <TableCell>{report.submittedAt ? format(new Date(report.submittedAt), "PP") : format(new Date(report.createdAt), "PP")}</TableCell>
                      <TableCell className="max-w-md whitespace-pre-wrap text-sm text-muted-foreground">{report.summary ?? "—"}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </ScrollArea>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function StateMessage({ state }: { state: "loading" | "error" | "empty" }) {
  if (state === "loading") {
    return (
      <div className="flex h-48 items-center justify-center gap-2 text-sm text-muted-foreground">
        <Loader2 className="size-4 animate-spin" />
        Loading complaints…
      </div>
    );
  }

  if (state === "error") {
    return <div className="flex h-48 items-center justify-center text-sm text-destructive">Failed to load complaints.</div>;
  }

  return <div className="flex h-48 items-center justify-center text-sm text-muted-foreground">No complaints found.</div>;
}

