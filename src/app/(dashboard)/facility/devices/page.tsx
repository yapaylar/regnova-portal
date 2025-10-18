"use client";

import { useMemo, useState } from "react";
import { Filter, Loader2, RefreshCcw, Search } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useFacilityDevices } from "@/hooks/use-facility-devices";
import { formatDate } from "@/lib/formatters";

const STATUS_TABS: Array<{ value: string; label: string }> = [
  { value: "ALL", label: "All" },
  { value: "ACTIVE", label: "Active" },
  { value: "INACTIVE", label: "Inactive" },
  { value: "MAINTENANCE", label: "Maintenance" },
];

export default function FacilityDevicesPage() {
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<string>("ALL");

  const { data, isLoading, isError, refetch, isRefetching } = useFacilityDevices({
    search: search.length ? search : undefined,
    status: status !== "ALL" ? status : undefined,
    pageSize: 50,
  });

  const totals = useMemo(() => {
    if (!data) {
      return { total: 0, active: 0, maintenance: 0, recalls: 0 };
    }

    let active = 0;
    let maintenance = 0;
    let recalls = 0;

    for (const item of data.data) {
      if (item.status === "ACTIVE") active += 1;
      if (item.status === "MAINTENANCE") maintenance += 1;
      if (item.activeRecalls > 0) recalls += 1;
    }

    return {
      total: data.data.length,
      active,
      maintenance,
      recalls,
    };
  }, [data]);

  return (
    <div className="flex flex-col gap-6">
      <Card>
        <CardHeader className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="space-y-2">
            <CardTitle className="text-xl font-semibold">My Devices</CardTitle>
            <CardDescription>Review the devices currently assigned to your facility.</CardDescription>
          </div>
          <div className="flex w-full flex-col gap-3 md:w-auto md:flex-row md:items-center">
            <div className="relative w-full md:w-72">
              <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                className="pl-9"
                placeholder="Search devices, UDI, manufacturer"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
              />
            </div>
            <Button variant="outline" onClick={() => refetch()} disabled={isRefetching}>
              {isRefetching ? <Loader2 className="mr-2 size-4 animate-spin" /> : <RefreshCcw className="mr-2 size-4" />} Refresh
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-4">
            <SummaryCard label="Total Devices" value={totals.total} />
            <SummaryCard label="Active" value={totals.active} />
            <SummaryCard label="Maintenance" value={totals.maintenance} />
            <SummaryCard label="Recalls" value={totals.recalls} />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Assignments</CardTitle>
          <CardDescription>Track status, maintenance, and recall information for each device.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <Tabs value={status} onValueChange={setStatus} className="w-full md:w-auto">
              <TabsList>
                {STATUS_TABS.map((tab) => (
                  <TabsTrigger key={tab.value} value={tab.value}>
                    {tab.label}
                  </TabsTrigger>
                ))}
              </TabsList>
            </Tabs>
            <Button variant="outline" size="sm">
              <Filter className="mr-2 size-4" />
              Advanced Filters
            </Button>
          </div>

          <Separator />

          {isLoading ? (
            <div className="flex h-48 items-center justify-center text-sm text-muted-foreground">Loading devices…</div>
          ) : isError ? (
            <div className="flex h-48 items-center justify-center text-sm text-destructive">Failed to load devices.</div>
          ) : !data || data.data.length === 0 ? (
            <div className="flex h-48 items-center justify-center text-sm text-muted-foreground">No devices assigned.</div>
          ) : (
            <ScrollArea className="max-h-[560px]">
              <div className="divide-y">
                {data.data.map((item) => (
                  <div key={item.assignmentId} className="flex flex-col gap-3 py-4">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <div>
                        <div className="text-sm font-semibold">{item.device.name}</div>
                        <div className="text-xs text-muted-foreground">
                          {item.device.manufacturer.name} • {item.device.modelNumber ?? "No model"}
                        </div>
                      </div>
                      <Badge variant={item.status === "ACTIVE" ? "default" : "secondary"}>{item.status}</Badge>
                    </div>

                    <div className="grid gap-3 text-xs text-muted-foreground md:grid-cols-2 lg:grid-cols-4">
                      <div>
                        <span className="font-medium text-foreground">UDI:</span> {item.device.udi ?? "—"}
                      </div>
                      <div>
                        <span className="font-medium text-foreground">Device Class:</span> {item.device.deviceClass}
                      </div>
                      <div>
                        <span className="font-medium text-foreground">Registration:</span> {item.device.registrationStatus}
                      </div>
                      <div>
                        <span className="font-medium text-foreground">Assigned:</span> {formatDate(item.assignedAt)}
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-3 text-xs text-muted-foreground">
                      <span>
                        <span className="font-medium text-foreground">Reports:</span> {item.reportsCount}
                      </span>
                      <span>
                        <span className="font-medium text-foreground">Active Recalls:</span> {item.activeRecalls}
                      </span>
                      {item.notes ? (
                        <span>
                          <span className="font-medium text-foreground">Notes:</span> {item.notes}
                        </span>
                      ) : null}
                    </div>
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

function SummaryCard({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-lg border bg-card p-4 shadow-sm">
      <div className="text-sm text-muted-foreground">{label}</div>
      <div className="mt-1 text-2xl font-semibold text-foreground">{value}</div>
    </div>
  );
}

