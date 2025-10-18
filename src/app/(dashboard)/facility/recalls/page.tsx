"use client";

import { useMemo, useState } from "react";
import { AlertTriangle, Filter, Loader2, Search } from "lucide-react";
import { format } from "date-fns";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Separator } from "@/components/ui/separator";
import { FacilityRecallListItem, useFacilityRecalls } from "@/hooks/use-facility-recalls";

const STATUS_LABELS: Record<string, string> = {
  DRAFT: "Draft",
  ACTIVE: "Active",
  COMPLETED: "Completed",
  CANCELLED: "Cancelled",
};

const ACTION_LABELS: Record<string, string> = {
  SAFETY_NOTICE: "Safety Notice",
  FIELD_ACTION: "Field Action",
  FULL_RECALL: "Full Recall",
  SOFTWARE_UPDATE: "Software Update",
};

const STATUS_FILTERS = [
  { value: "ALL", label: "All" },
  { value: "ACTIVE", label: "Active" },
  { value: "COMPLETED", label: "Completed" },
  { value: "CANCELLED", label: "Cancelled" },
];

const ACTION_FILTERS = [
  { value: "ALL", label: "All Actions" },
  { value: "SAFETY_NOTICE", label: "Safety Notice" },
  { value: "FIELD_ACTION", label: "Field Action" },
  { value: "FULL_RECALL", label: "Full Recall" },
  { value: "SOFTWARE_UPDATE", label: "Software Update" },
];

export default function FacilityRecallsPage() {
  const [status, setStatus] = useState("ALL");
  const [actionType, setActionType] = useState("ALL");
  const [search, setSearch] = useState("");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [showFilters, setShowFilters] = useState(false);

  const { data, isLoading, isError, refetch, isRefetching } = useFacilityRecalls({
    status: status !== "ALL" ? status : undefined,
    actionType: actionType !== "ALL" ? actionType : undefined,
    search: search.length ? search : undefined,
  });

  const recalls = useMemo(() => data?.data ?? [], [data?.data]);
  const selected = recalls.find((recall) => recall.id === selectedId) ?? null;

  return (
    <div className="flex flex-col gap-6">
      <Card>
        <CardHeader className="space-y-3">
          <CardTitle>Active Recalls</CardTitle>
          <CardDescription>Monitor safety notices and recalls impacting devices at your facility.</CardDescription>
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div className="relative w-full md:w-72">
              <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                className="pl-9"
                placeholder="Search by reference or title"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
              />
            </div>
            <Button variant="outline" onClick={() => refetch()} disabled={isRefetching}>
              {isRefetching ? <Loader2 className="mr-2 size-4 animate-spin" /> : null}
              Refresh
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="hidden gap-4 sm:flex">
            <Select value={status} onValueChange={setStatus}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                {STATUS_FILTERS.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={actionType} onValueChange={setActionType}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Action Type" />
              </SelectTrigger>
              <SelectContent>
                {ACTION_FILTERS.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button variant="outline" size="sm" className="gap-2">
              <Filter className="size-4" />
              Advanced Filters
            </Button>
          </div>

          <div className="sm:hidden">
            <Button variant="outline" className="w-full gap-2" onClick={() => setShowFilters(true)}>
              <Filter className="size-4" />
              Filters
            </Button>
          </div>

          <Separator />

          {isLoading ? (
            <StateMessage state="loading" />
          ) : isError ? (
            <StateMessage state="error" />
          ) : recalls.length === 0 ? (
            <StateMessage state="empty" />
          ) : (
            <ScrollArea className="max-h-[560px]">
              <div className="min-w-[960px]">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Reference</TableHead>
                      <TableHead>Title</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Action Type</TableHead>
                      <TableHead>Device</TableHead>
                      <TableHead>Created</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {recalls.map((recall) => (
                      <TableRow key={recall.id} className="cursor-pointer" onClick={() => setSelectedId(recall.id)}>
                        <TableCell className="font-medium">{recall.reference}</TableCell>
                        <TableCell>{recall.title}</TableCell>
                        <TableCell>
                          <Badge variant={recall.status === "ACTIVE" ? "default" : "secondary"}>{STATUS_LABELS[recall.status] ?? recall.status}</Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">{ACTION_LABELS[recall.actionType] ?? recall.actionType}</Badge>
                        </TableCell>
                        <TableCell>
                          {recall.device ? `${recall.device.name}${recall.device.modelNumber ? ` · ${recall.device.modelNumber}` : ""}` : "—"}
                        </TableCell>
                        <TableCell>{format(new Date(recall.createdAt), "PP")}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </ScrollArea>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Recall Details</CardTitle>
        </CardHeader>
        <CardContent>
          {selected ? <RecallDetails recall={selected} /> : <p className="text-sm text-muted-foreground">Select a recall to view its details.</p>}
        </CardContent>
      </Card>

      <Sheet open={showFilters} onOpenChange={setShowFilters}>
        <SheetContent side="left" className="w-full max-w-sm">
          <SheetHeader>
            <SheetTitle>Filters</SheetTitle>
          </SheetHeader>
          <div className="mt-6 space-y-4">
            <FilterSection
              label="Status"
              value={status}
              options={STATUS_FILTERS}
              onChange={(value) => setStatus(value)}
            />
            <FilterSection
              label="Action Type"
              value={actionType}
              options={ACTION_FILTERS}
              onChange={(value) => setActionType(value)}
            />
            <Button variant="outline" onClick={() => {
              setStatus("ALL");
              setActionType("ALL");
            }}>
              Reset Filters
            </Button>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}

type FilterOption = {
  value: string;
  label: string;
};

function FilterSection({ label, value, options, onChange }: { label: string; value: string; options: FilterOption[]; onChange: (value: string) => void }) {
  return (
    <div className="space-y-2">
      <p className="text-xs font-semibold text-muted-foreground">{label}</p>
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger>
          <SelectValue placeholder={`Filter by ${label}`} />
        </SelectTrigger>
        <SelectContent>
          {options.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}

function RecallDetails({ recall }: { recall: FacilityRecallListItem }) {
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 text-sm font-semibold">
        <AlertTriangle className="size-4 text-primary" />
        {recall.title}
      </div>
      <div className="text-xs text-muted-foreground">Reference {recall.reference}</div>
      <div className="grid gap-3 text-sm md:grid-cols-2">
        <DetailItem label="Status" value={STATUS_LABELS[recall.status] ?? recall.status} />
        <DetailItem label="Action Type" value={ACTION_LABELS[recall.actionType] ?? recall.actionType} />
        <DetailItem label="Region" value={recall.region} />
        <DetailItem label="Created" value={format(new Date(recall.createdAt), "PP")} />
        <DetailItem
          label="Effective Start"
          value={recall.effectiveStart ? format(new Date(recall.effectiveStart), "PP") : "—"}
        />
        <DetailItem label="Effective End" value={recall.effectiveEnd ? format(new Date(recall.effectiveEnd), "PP") : "—"} />
        <DetailItem
          label="Device"
          value={recall.device ? `${recall.device.name}${recall.device.modelNumber ? ` · ${recall.device.modelNumber}` : ""}` : "—"}
        />
        <DetailItem label="Manufacturer" value={recall.device?.manufacturer.name ?? "—"} />
      </div>
      <section className="space-y-2">
        <h3 className="text-sm font-semibold">Description</h3>
        <p className="text-sm text-muted-foreground whitespace-pre-wrap">{recall.description}</p>
      </section>
    </div>
  );
}

function DetailItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-start justify-between gap-3">
      <p className="text-xs font-semibold uppercase text-muted-foreground">{label}</p>
      <p className="text-sm text-foreground text-right">{value}</p>
    </div>
  );
}

function StateMessage({ state }: { state: "loading" | "error" | "empty" }) {
  if (state === "loading") {
    return (
      <div className="flex h-48 items-center justify-center gap-2 text-sm text-muted-foreground">
        <Loader2 className="size-4 animate-spin" />
        Loading recalls…
      </div>
    );
  }

  if (state === "error") {
    return <div className="flex h-48 items-center justify-center text-sm text-destructive">Failed to load recalls.</div>;
  }

  return <div className="flex h-48 items-center justify-center text-sm text-muted-foreground">No recalls affecting your devices.</div>;
}

