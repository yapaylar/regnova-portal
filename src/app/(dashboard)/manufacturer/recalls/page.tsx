"use client";

import { useMemo, useState } from "react";
import { AlertTriangle, Filter, Loader2, Plus, Search } from "lucide-react";
import { format } from "date-fns";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { useManufacturerRecalls } from "@/hooks/use-manufacturer-recalls";
import { useDebounce } from "@/hooks/use-debounce";

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

type FilterState = {
  status: string;
  actionType: string;
  region: string;
  search: string;
};

const defaultFilters: FilterState = {
  status: "all",
  actionType: "all",
  region: "all",
  search: "",
};

export default function ManufacturerRecallsPage() {
  const [filters, setFilters] = useState(defaultFilters);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const debouncedSearch = useDebounce(filters.search, 300);

  const { data, isLoading, isError } = useManufacturerRecalls({
    search: debouncedSearch,
    status: filters.status === "all" ? undefined : filters.status,
    actionType: filters.actionType === "all" ? undefined : filters.actionType,
    region: filters.region === "all" ? undefined : filters.region,
  });

  const recalls = useMemo(() => data?.items ?? [], [data?.items]);
  const selected = recalls.find((recall) => recall.id === selectedId) ?? null;

  const uniqueOptions = useMemo(() => {
    const status = new Set<string>();
    const actionType = new Set<string>();
    const region = new Set<string>();

    recalls.forEach((recall) => {
      status.add(recall.status);
      actionType.add(recall.actionType);
      region.add(recall.region);
    });

    return {
      status: Array.from(status).sort(),
      actionType: Array.from(actionType).sort(),
      region: Array.from(region).sort(),
    };
  }, [recalls]);

  const tableContent = () => {
    if (isLoading) {
      return <StateMessage state="loading" />;
    }

    if (isError) {
      return <StateMessage state="error" />;
    }

    if (recalls.length === 0) {
      return <StateMessage state="empty" />;
    }

    return (
      <ScrollArea className="max-h-[600px]">
        <div className="min-w-[960px]">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Reference</TableHead>
                <TableHead>Title</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Action Type</TableHead>
                <TableHead>Region</TableHead>
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
                    <Badge variant={recall.status === "ACTIVE" ? "default" : recall.status === "DRAFT" ? "outline" : "secondary"}>
                      {STATUS_LABELS[recall.status] ?? recall.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">{ACTION_LABELS[recall.actionType] ?? recall.actionType}</Badge>
                  </TableCell>
                  <TableCell>{recall.region}</TableCell>
                  <TableCell>{recall.device ? `${recall.device.name}${recall.device.modelNumber ? ` · ${recall.device.modelNumber}` : ""}` : "—"}</TableCell>
                  <TableCell>{format(new Date(recall.createdAt), "PP")}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </ScrollArea>
    );
  };

  return (
    <div className="flex flex-col gap-6">
      <header className="flex flex-col gap-2">
        <h1 className="text-2xl font-semibold">Recall Management</h1>
        <p className="text-sm text-muted-foreground">
          Track field safety notices and recalls initiated for your devices. Coordinate corrective actions and share FSN packages with facilities.
        </p>
      </header>

      <Card>
        <CardHeader>
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div className="flex flex-col gap-1">
              <CardTitle>Recall Registry</CardTitle>
              <CardDescription>Filtered to recalls initiated by your organization.</CardDescription>
            </div>
            <Button type="button" className="gap-2">
              <Plus className="size-4" />
              Initiate Recall
            </Button>
          </div>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
            <Button type="button" variant="outline" className="shrink-0 sm:hidden" onClick={() => setShowFilters(true)}>
              <Filter className="mr-2 size-4" />
              Filters
            </Button>
            <div className="relative flex-1">
              <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search recalls"
                className="w-full pl-10"
                value={filters.search}
                onChange={(event) => setFilters((prev) => ({ ...prev, search: event.target.value }))}
              />
            </div>
          </div>

          <div className="hidden gap-3 sm:grid sm:grid-cols-3">
            <FilterSelect
              label="Status"
              value={filters.status}
              options={uniqueOptions.status}
              onChange={(value) => setFilters((prev) => ({ ...prev, status: value }))}
            />
            <FilterSelect
              label="Action Type"
              value={filters.actionType}
              options={uniqueOptions.actionType}
              onChange={(value) => setFilters((prev) => ({ ...prev, actionType: value }))}
            />
            <FilterSelect
              label="Region"
              value={filters.region}
              options={uniqueOptions.region}
              onChange={(value) => setFilters((prev) => ({ ...prev, region: value }))}
            />
          </div>
        </CardContent>
        <CardContent className="p-0">{tableContent()}</CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Recall Details</CardTitle>
        </CardHeader>
        <CardContent>
          {selected ? <RecallDetail recall={selected} /> : <p className="text-sm text-muted-foreground">Select a recall to view details.</p>}
        </CardContent>
      </Card>

      <Sheet open={showFilters} onOpenChange={setShowFilters}>
        <SheetContent side="left" className="w-full max-w-sm">
          <SheetHeader>
            <SheetTitle>Filters</SheetTitle>
          </SheetHeader>
          <div className="mt-6 flex flex-col gap-4">
            <FilterSelect
              label="Status"
              value={filters.status}
              options={uniqueOptions.status}
              onChange={(value) => setFilters((prev) => ({ ...prev, status: value }))}
            />
            <FilterSelect
              label="Action Type"
              value={filters.actionType}
              options={uniqueOptions.actionType}
              onChange={(value) => setFilters((prev) => ({ ...prev, actionType: value }))}
            />
            <FilterSelect
              label="Region"
              value={filters.region}
              options={uniqueOptions.region}
              onChange={(value) => setFilters((prev) => ({ ...prev, region: value }))}
            />
            <Button type="button" variant="outline" onClick={() => setFilters(defaultFilters)}>
              Reset filters
            </Button>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}

type FilterSelectProps = {
  label: string;
  value: string;
  options: string[];
  onChange: (value: string) => void;
};

function FilterSelect({ label, value, options, onChange }: FilterSelectProps) {
  return (
    <div className="space-y-1">
      <label className="text-xs font-medium text-muted-foreground">{label}</label>
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger>
          <SelectValue placeholder={`Filter by ${label}`} />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All</SelectItem>
          {options.map((option) => (
            <SelectItem key={option} value={option}>
              {STATUS_LABELS[option] ?? ACTION_LABELS[option] ?? option}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}

function RecallDetail({ recall }: { recall: ManufacturerRecallItem }) {
  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-2 text-sm font-semibold">
          <AlertTriangle className="size-4 text-primary" />
          {recall.title}
        </div>
        <p className="text-xs text-muted-foreground">Reference {recall.reference}</p>
      </div>

      <div className="grid gap-3 text-sm md:grid-cols-2">
        <DetailItem label="Status" value={STATUS_LABELS[recall.status] ?? recall.status} />
        <DetailItem label="Action Type" value={ACTION_LABELS[recall.actionType] ?? recall.actionType} />
        <DetailItem label="Region" value={recall.region} />
        <DetailItem label="Created" value={format(new Date(recall.createdAt), "PP")}
        />
        <DetailItem label="Effective From" value={recall.effectiveStart ? format(new Date(recall.effectiveStart), "PP") : "—"} />
        <DetailItem label="Effective To" value={recall.effectiveEnd ? format(new Date(recall.effectiveEnd), "PP") : "—"} />
        <DetailItem label="Device" value={recall.device ? `${recall.device.name}${recall.device.modelNumber ? ` · ${recall.device.modelNumber}` : ""}` : "—"} />
      </div>

      <section className="space-y-2">
        <h2 className="text-sm font-semibold">Description</h2>
        <p className="text-sm text-muted-foreground whitespace-pre-wrap">{recall.description}</p>
      </section>

      <section className="space-y-2">
        <h2 className="text-sm font-semibold">FSN Links</h2>
        {recall.fsnLinks.length > 0 ? (
          <ul className="space-y-1 text-sm">
            {recall.fsnLinks.map((link) => (
              <li key={`${link.label}-${link.url}`}>
                <a href={link.url} target="_blank" rel="noreferrer" className="text-primary underline-offset-4 hover:underline">
                  {link.label}
                </a>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-xs text-muted-foreground">No FSN documents attached.</p>
        )}
      </section>

      <section className="grid gap-2 md:grid-cols-2">
        <div className="space-y-2">
          <h3 className="text-sm font-semibold">Affected Lots</h3>
          {recall.affectedLots.length > 0 ? (
            <ul className="list-disc space-y-1 pl-4 text-sm">
              {recall.affectedLots.map((lot) => (
                <li key={lot}>{lot}</li>
              ))}
            </ul>
          ) : (
            <p className="text-xs text-muted-foreground">Not specified.</p>
          )}
        </div>
        <div className="space-y-2">
          <h3 className="text-sm font-semibold">Corrective Actions</h3>
          {recall.correctiveActions.length > 0 ? (
            <ul className="list-disc space-y-1 pl-4 text-sm">
              {recall.correctiveActions.map((action, index) => (
                <li key={`${action}-${index}`}>{action}</li>
              ))}
            </ul>
          ) : (
            <p className="text-xs text-muted-foreground">No corrective actions provided.</p>
          )}
        </div>
      </section>
    </div>
  );
}

function DetailItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-start justify-between gap-4">
      <span className="text-xs font-medium uppercase text-muted-foreground">{label}</span>
      <span className="text-sm font-medium text-right">{value}</span>
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

  return <div className="flex h-48 items-center justify-center text-sm text-muted-foreground">No recalls found.</div>;
}

