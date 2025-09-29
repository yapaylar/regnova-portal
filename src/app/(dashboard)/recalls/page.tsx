"use client";

import { useMemo, useState } from "react";
import { Download, Filter, Search } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useRecalls } from "@/hooks/use-recalls";

type FilterState = {
  device: string;
  manufacturer: string;
  actionType: string;
  region: string;
  search: string;
};

const defaultFilters: FilterState = {
  device: "all",
  manufacturer: "all",
  actionType: "all",
  region: "all",
  search: "",
};

export default function RecallsPage() {
  const { data: recalls = [] } = useRecalls();
  const [filters, setFilters] = useState(defaultFilters);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [showFilters, setShowFilters] = useState(false);

  const filteredRecalls = useMemo(() => {
    return recalls.filter((recall) => {
      const matchesDevice = filters.device === "all" || recall.device === filters.device;
      const matchesManufacturer =
        filters.manufacturer === "all" || recall.manufacturer === filters.manufacturer;
      const matchesActionType = filters.actionType === "all" || recall.actionType === filters.actionType;
      const matchesRegion = filters.region === "all" || recall.region === filters.region;
      const matchesSearch = filters.search
        ? `${recall.device} ${recall.manufacturer} ${recall.id} ${recall.actionType}`
            .toLowerCase()
            .includes(filters.search.toLowerCase())
        : true;

      return matchesDevice && matchesManufacturer && matchesActionType && matchesRegion && matchesSearch;
    });
  }, [filters, recalls]);

  const uniqueValues = useMemo(() => {
    const device = new Set<string>();
    const manufacturer = new Set<string>();
    const actionType = new Set<string>();
    const region = new Set<string>();

    recalls.forEach((recall) => {
      device.add(recall.device);
      manufacturer.add(recall.manufacturer);
      actionType.add(recall.actionType);
      region.add(recall.region);
    });

    return {
      device: Array.from(device).sort(),
      manufacturer: Array.from(manufacturer).sort(),
      actionType: Array.from(actionType).sort(),
      region: Array.from(region).sort(),
    };
  }, [recalls]);

  const selectedRecall = filteredRecalls.find((recall) => recall.id === selectedId) ?? null;

  return (
    <div className="flex flex-col gap-6">
      <Card>
        <CardHeader>
          <CardTitle>Recalls & Alerts</CardTitle>
          <CardDescription>Monitor recall activity, filter by region, and review corrective actions.</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
            <Button
              type="button"
              variant="outline"
              className="shrink-0 sm:hidden"
              onClick={() => setShowFilters(true)}
            >
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
            <Button type="button" variant="outline" onClick={() => downloadCsv(filteredRecalls)}>
              <Download className="mr-2 size-4" />
              Download CSV
            </Button>
          </div>

          <div className="hidden gap-3 sm:grid sm:grid-cols-4">
            <FilterSelect
              label="Device"
              value={filters.device}
              onChange={(value) => setFilters((prev) => ({ ...prev, device: value }))}
              options={uniqueValues.device}
            />
            <FilterSelect
              label="Manufacturer"
              value={filters.manufacturer}
              onChange={(value) => setFilters((prev) => ({ ...prev, manufacturer: value }))}
              options={uniqueValues.manufacturer}
            />
            <FilterSelect
              label="Action Type"
              value={filters.actionType}
              onChange={(value) => setFilters((prev) => ({ ...prev, actionType: value }))}
              options={uniqueValues.actionType}
            />
            <FilterSelect
              label="Region"
              value={filters.region}
              onChange={(value) => setFilters((prev) => ({ ...prev, region: value }))}
              options={uniqueValues.region}
            />
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-4 lg:grid-cols-[2fr_1fr]">
        <Card className="overflow-hidden">
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <ScrollArea className="max-h-[600px]">
                <div className="min-w-[960px]">
                  <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Recall ID</TableHead>
                      <TableHead>Device / Model</TableHead>
                      <TableHead>Manufacturer</TableHead>
                      <TableHead>Action Type</TableHead>
                      <TableHead>Region</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredRecalls.map((recall) => (
                      <TableRow
                        key={recall.id}
                        className="cursor-pointer"
                        onClick={() => setSelectedId(recall.id)}
                      >
                        <TableCell>{recall.id}</TableCell>
                        <TableCell>{recall.device}</TableCell>
                        <TableCell>{recall.manufacturer}</TableCell>
                        <TableCell>{recall.actionType}</TableCell>
                        <TableCell>{recall.region}</TableCell>
                        <TableCell>{recall.date}</TableCell>
                        <TableCell>{recall.status}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                  </Table>
                </div>
              </ScrollArea>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recall Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {selectedRecall ? (
              <div className="space-y-3">
                <div>
                  <p className="text-sm font-semibold">Overview</p>
                  <p className="text-xs text-muted-foreground">{selectedRecall.description}</p>
                </div>
                <div className="space-y-2 text-sm">
                  <DetailItem label="Device" value={selectedRecall.device} />
                  <DetailItem label="Manufacturer" value={selectedRecall.manufacturer} />
                  <DetailItem label="Action Type" value={selectedRecall.actionType} />
                  <DetailItem label="Region" value={selectedRecall.region} />
                  <DetailItem label="Status" value={selectedRecall.status} />
                  <DetailItem label="Date" value={selectedRecall.date} />
                </div>
                <div className="space-y-2">
                  <p className="text-sm font-semibold">FSN Documents</p>
                  <ul className="space-y-1 text-sm">
                    {selectedRecall.fsnLinks.map((link) => (
                      <li key={link.url}>
                        <a
                          href={link.url}
                          target="_blank"
                          rel="noreferrer"
                          className="text-primary underline-offset-4 hover:underline"
                        >
                          {link.label}
                        </a>
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="space-y-2 text-sm">
                  <p className="text-sm font-semibold">Affected Lots / Serials</p>
                  <ul className="list-disc space-y-1 pl-4">
                    {selectedRecall.affectedLots.map((lot) => (
                      <li key={lot}>{lot}</li>
                    ))}
                  </ul>
                </div>
                <div className="space-y-2 text-sm">
                  <p className="text-sm font-semibold">Corrective Actions</p>
                  <ul className="list-disc space-y-1 pl-4">
                    {selectedRecall.correctiveActions.map((action, index) => (
                      <li key={`${action}-${index}`}>{action}</li>
                    ))}
                  </ul>
                </div>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">Select a recall to view details.</p>
            )}
          </CardContent>
        </Card>
      </div>

      <Sheet open={showFilters} onOpenChange={setShowFilters}>
        <SheetContent side="left" className="w-full max-w-sm">
          <SheetHeader>
            <SheetTitle>Filters</SheetTitle>
          </SheetHeader>
          <div className="mt-6 flex flex-col gap-4">
            <FilterSelect
              label="Device"
              value={filters.device}
              onChange={(value) => setFilters((prev) => ({ ...prev, device: value }))}
              options={uniqueValues.device}
            />
            <FilterSelect
              label="Manufacturer"
              value={filters.manufacturer}
              onChange={(value) => setFilters((prev) => ({ ...prev, manufacturer: value }))}
              options={uniqueValues.manufacturer}
            />
            <FilterSelect
              label="Action Type"
              value={filters.actionType}
              onChange={(value) => setFilters((prev) => ({ ...prev, actionType: value }))}
              options={uniqueValues.actionType}
            />
            <FilterSelect
              label="Region"
              value={filters.region}
              onChange={(value) => setFilters((prev) => ({ ...prev, region: value }))}
              options={uniqueValues.region}
            />
            <Button type="button" variant="outline" onClick={() => setFilters(defaultFilters)}>
              Clear filters
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
  onChange: (value: string) => void;
  options: string[];
};

function FilterSelect({ label, value, onChange, options }: FilterSelectProps) {
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
              {option}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}

type DetailItemProps = {
  label: string;
  value: string;
};

function DetailItem({ label, value }: DetailItemProps) {
  return (
    <div className="flex items-start justify-between gap-4">
      <span className="text-xs font-medium uppercase text-muted-foreground">{label}</span>
      <span className="text-sm font-medium text-right">{value}</span>
    </div>
  );
}

function downloadCsv(recalls: typeof import("@/data/mock").RECALLS) {
  if (!recalls.length) return;
  const headers = [
    "Recall ID",
    "Device",
    "Manufacturer",
    "Action Type",
    "Region",
    "Date",
    "Status",
    "Description",
  ];
  const rows = recalls.map((recall) => [
    recall.id,
    recall.device,
    recall.manufacturer,
    recall.actionType,
    recall.region,
    recall.date,
    recall.status,
    recall.description,
  ]);

  const csvContent = [headers, ...rows]
    .map((row) => row.map((cell) => `"${cell.replace(/"/g, '""')}"`).join(","))
    .join("\n");

  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.setAttribute("download", "recalls.csv");
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

