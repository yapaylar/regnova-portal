"use client";

import { useMemo, useState } from "react";
import { Download, Loader2, Search } from "lucide-react";
import { format } from "date-fns";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { useFacilityResources } from "@/hooks/use-facility-resources";

const TYPE_LABELS: Record<string, string> = {
  FDA: "FDA Clearance",
  IFU: "Instructions for Use",
  FCSA: "FCSA Document",
  GENERAL: "General Document",
};

const TYPE_OPTIONS = [
  { value: "ALL", label: "All Types" },
  { value: "FDA", label: "FDA Clearance" },
  { value: "IFU", label: "Instructions for Use" },
  { value: "FCSA", label: "FCSA Document" },
];

export default function FacilityResourcesPage() {
  const [search, setSearch] = useState("");
  const [type, setType] = useState("ALL");

  const { data, isLoading, isError, refetch, isRefetching } = useFacilityResources({
    search: search.length ? search : undefined,
    type: type !== "ALL" ? type : undefined,
  });

  const resources = useMemo(() => data?.data ?? [], [data?.data]);
  const typeSummary = useMemo(() => {
    const counts: Record<string, number> = {};
    resources.forEach((resource) => {
      const key = resource.type ?? "GENERAL";
      counts[key] = (counts[key] ?? 0) + 1;
    });
    return counts;
  }, [resources]);

  return (
    <div className="flex flex-col gap-6">
      <Card>
        <CardHeader>
          <CardTitle>Device Resources</CardTitle>
          <CardDescription>FDA clearances, IFUs, and safety documentation shared by manufacturers.</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="flex flex-wrap gap-3 md:items-center">
            <div className="relative w-full md:w-72">
              <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                className="pl-9"
                placeholder="Search documents"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
              />
            </div>
            <Select value={type} onValueChange={setType}>
              <SelectTrigger className="w-full md:w-56">
                <SelectValue placeholder="Filter by type" />
              </SelectTrigger>
              <SelectContent>
                {TYPE_OPTIONS.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <Button variant="outline" onClick={() => refetch()} disabled={isRefetching}>
            {isRefetching ? <Loader2 className="mr-2 size-4 animate-spin" /> : null}
            Refresh
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Available Documents</CardTitle>
          <CardDescription>Filter and download documents applicable to devices assigned to your facility.</CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <Separator className="mb-4" />
          {isLoading ? (
            <StateMessage state="loading" />
          ) : isError ? (
            <StateMessage state="error" />
          ) : resources.length === 0 ? (
            <StateMessage state="empty" />
          ) : (
            <ScrollArea className="max-h-[560px]">
              <div className="divide-y">
                {resources.map((resource) => (
                  <ResourceRow key={resource.id} resource={resource} />
                ))}
              </div>
            </ScrollArea>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Summary by Document Type</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-3 md:grid-cols-2 lg:grid-cols-4">
          {TYPE_OPTIONS.filter((option) => option.value !== "ALL").map((option) => (
            <SummaryCard key={option.value} label={option.label} value={typeSummary[option.value] ?? 0} />
          ))}
        </CardContent>
      </Card>
    </div>
  );
}

function ResourceRow({ resource }: { resource: FacilityResourceListItem }) {
  return (
    <div className="flex flex-col gap-3 p-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h3 className="text-sm font-semibold text-foreground">{resource.title}</h3>
          <p className="text-xs text-muted-foreground">
            {resource.device ? `${resource.device.name}${resource.device.modelNumber ? ` · ${resource.device.modelNumber}` : ""}` : "General"}
          </p>
        </div>
        <Badge variant="outline">{TYPE_LABELS[resource.type] ?? resource.type}</Badge>
      </div>

      <div className="grid gap-3 text-xs text-muted-foreground md:grid-cols-4">
        <div>
          <span className="font-medium text-foreground">Manufacturer:</span> {resource.device?.manufacturer.name ?? "—"}
        </div>
        <div>
          <span className="font-medium text-foreground">Uploaded:</span> {format(new Date(resource.uploadedAt), "PP")}
        </div>
        <div>
          <span className="font-medium text-foreground">Version:</span> {resource.version ?? "—"}
        </div>
        <div>
          <span className="font-medium text-foreground">File Size:</span> {formatBytes(resource.sizeBytes)}
        </div>
      </div>

      <div className="flex gap-2">
        <Button asChild size="sm" className="gap-2">
          <a href={resource.url} target="_blank" rel="noreferrer">
            <Download className="size-4" /> Download
          </a>
        </Button>
        <Button variant="outline" size="sm" disabled title="Share link coming soon">
          Share
        </Button>
      </div>
    </div>
  );
}

function SummaryCard({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-lg border bg-card p-4 shadow-sm">
      <p className="text-xs font-medium uppercase text-muted-foreground">{label}</p>
      <p className="mt-2 text-2xl font-semibold text-foreground">{value}</p>
    </div>
  );
}

function StateMessage({ state }: { state: "loading" | "error" | "empty" }) {
  if (state === "loading") {
    return (
      <div className="flex h-48 items-center justify-center gap-2 text-sm text-muted-foreground">
        <Loader2 className="size-4 animate-spin" />
        Loading resources…
      </div>
    );
  }

  if (state === "error") {
    return <div className="flex h-48 items-center justify-center text-sm text-destructive">Failed to load resources.</div>;
  }

  return <div className="flex h-48 items-center justify-center text-sm text-muted-foreground">No documents available yet.</div>;
}

function formatBytes(bytes: number) {
  if (bytes === 0) return "0 B";
  const units = ["B", "KB", "MB", "GB", "TB"];
  const k = 1024;
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${(bytes / Math.pow(k, i)).toFixed(1)} ${units[i]}`;
}

