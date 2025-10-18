"use client";

import { useMemo, useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useManufacturerProducts } from "@/hooks/use-manufacturer-products";
import { useDebounce } from "@/hooks/use-debounce";
import { Loader2, Plus, FileText } from "lucide-react";
import { format } from "date-fns";
import { separator } from "@/lib/formatters";
import { manufacturerProductCreateSchema, ManufacturerProductCreateInput } from "@/lib/manufacturer/schemas";
import { manufacturerKeys } from "@/lib/query-keys";
import { useAuth } from "@/context/auth-context";
import { toast } from "sonner";

const CLASS_LABELS: Record<string, string> = {
  I: "Class I",
  II: "Class II",
  III: "Class III",
};

const STATUS_VARIANTS: Record<string, { label: string; variant: "default" | "secondary" | "destructive" | "outline" }> = {
  REGISTERED: { label: "Registered", variant: "default" },
  PENDING: { label: "Pending", variant: "secondary" },
  SUSPENDED: { label: "Suspended", variant: "destructive" },
  RETIRED: { label: "Retired", variant: "outline" },
};

const DEFAULT_FORM_VALUES: ManufacturerProductCreateInput = {
  name: "",
  modelNumber: undefined,
  udi: undefined,
  deviceClass: "I",
  registrationStatus: "PENDING",
};

const FORM_FIELD_IDS = {
  name: "product-name",
  modelNumber: "product-model",
  udi: "product-udi",
  deviceClass: "product-device-class",
  registrationStatus: "product-registration-status",
};

export default function ManufacturerProductsPage() {
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounce(search, 300);
  const queryClient = useQueryClient();
  const { fetchWithAuth } = useAuth();
  const { data, isLoading, isError } = useManufacturerProducts({ search: debouncedSearch });

  const form = useForm<ManufacturerProductCreateInput>({
    resolver: zodResolver(manufacturerProductCreateSchema),
    defaultValues: DEFAULT_FORM_VALUES,
  });

  const addProductMutation = useMutation({
    mutationFn: async (input: ManufacturerProductCreateInput) => {
      const response = await fetchWithAuth("/api/manufacturer/products", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(input),
      });

      if (!response.ok) {
        const payload = await response.json().catch(() => null);
        throw new Error(payload?.error?.message ?? "Failed to create product");
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: manufacturerKeys.all() });
      toast.success("Product added", { description: "New product added to your portfolio." });
      form.reset(DEFAULT_FORM_VALUES);
      setDialogOpen(false);
    },
    onError: (error: unknown) => {
      const message = error instanceof Error ? error.message : "Failed to create product";
      toast.error("Unable to add product", { description: message });
    },
  });

  const [dialogOpen, setDialogOpen] = useState(false);

  const summary = useMemo(() => {
    if (!data)
      return { total: 0, registered: 0, pending: 0, suspended: 0, retired: 0, expectedComplaints: 0, reports: 0 };
    return data.data.reduce(
      (acc, item) => {
        acc.total += 1;
        const status = item.registrationStatus?.toLowerCase();
        if (status === "registered") acc.registered += 1;
        if (status === "pending") acc.pending += 1;
        if (status === "suspended") acc.suspended += 1;
        if (status === "retired") acc.retired += 1;
        acc.expectedComplaints += item.expectedComplaints;
        acc.reports += item.reportsCount;
        return acc;
      },
      { total: 0, registered: 0, pending: 0, suspended: 0, retired: 0, expectedComplaints: 0, reports: 0 },
    );
  }, [data]);

  const handleSubmit = form.handleSubmit((values) => {
    addProductMutation.mutate(values);
  });

  return (
    <div className="flex flex-col gap-6">
      <header className="flex flex-col gap-2">
        <h1 className="text-2xl font-semibold">Product Portfolio</h1>
        <p className="text-sm text-muted-foreground">
          Review your devices, FDA registration status, and supporting documentation overview.
        </p>
      </header>

      <section className="grid gap-4 lg:grid-cols-[2fr_1fr]">
        <Card>
          <CardHeader className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <CardTitle>Device Inventory</CardTitle>
              <CardDescription>Filter devices and review post-market readiness at a glance.</CardDescription>
            </div>
            <div className="flex w-full flex-col gap-2 sm:flex-row sm:items-center sm:justify-end">
              <Input
                className="w-full sm:w-64"
                placeholder="Search by name, model, or UDI"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
              />
              <Dialog open={dialogOpen} onOpenChange={(open) => {
                setDialogOpen(open);
                if (!open) {
                  form.reset(DEFAULT_FORM_VALUES);
                  addProductMutation.reset();
                }
              }}>
                <DialogTrigger asChild>
                  <Button className="sm:w-auto">
                    <Plus className="mr-2 size-4" />
                    Add Product
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Add Product</DialogTitle>
                    <DialogDescription>Provide core details to register a device in your portfolio.</DialogDescription>
                  </DialogHeader>
                  <form className="space-y-4" onSubmit={handleSubmit} id="add-product-form">
                    <div className="space-y-2">
                      <Label htmlFor={FORM_FIELD_IDS.name}>Product name</Label>
                      <Input id={FORM_FIELD_IDS.name} placeholder="Device name" {...form.register("name")} />
                      <FieldError message={form.formState.errors.name?.message} />
                    </div>
                    <div className="grid gap-4 sm:grid-cols-2">
                      <div className="space-y-2">
                        <Label htmlFor={FORM_FIELD_IDS.modelNumber}>Model number</Label>
                        <Input id={FORM_FIELD_IDS.modelNumber} placeholder="Optional" {...form.register("modelNumber")} />
                        <FieldError message={form.formState.errors.modelNumber?.message} />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor={FORM_FIELD_IDS.udi}>UDI</Label>
                        <Input id={FORM_FIELD_IDS.udi} placeholder="Optional" {...form.register("udi")} />
                        <FieldError message={form.formState.errors.udi?.message} />
                      </div>
                    </div>
                    <div className="grid gap-4 sm:grid-cols-2">
                      <div className="space-y-2">
                        <Label htmlFor={FORM_FIELD_IDS.deviceClass}>Device class</Label>
                        <Select
                          value={form.watch("deviceClass")}
                          onValueChange={(value) => form.setValue("deviceClass", value as ManufacturerProductCreateInput["deviceClass"])}
                        >
                          <SelectTrigger id={FORM_FIELD_IDS.deviceClass} aria-label="Device class">
                            <SelectValue placeholder="Select class" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="I">Class I</SelectItem>
                            <SelectItem value="II">Class II</SelectItem>
                            <SelectItem value="III">Class III</SelectItem>
                          </SelectContent>
                        </Select>
                        <FieldError message={form.formState.errors.deviceClass?.message} />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor={FORM_FIELD_IDS.registrationStatus}>Registration status</Label>
                        <Select
                          value={form.watch("registrationStatus")}
                          onValueChange={(value) =>
                            form.setValue("registrationStatus", value as ManufacturerProductCreateInput["registrationStatus"])
                          }
                        >
                          <SelectTrigger id={FORM_FIELD_IDS.registrationStatus} aria-label="Registration status">
                            <SelectValue placeholder="Select status" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="REGISTERED">Registered</SelectItem>
                            <SelectItem value="PENDING">Pending</SelectItem>
                            <SelectItem value="SUSPENDED">Suspended</SelectItem>
                            <SelectItem value="RETIRED">Retired</SelectItem>
                          </SelectContent>
                        </Select>
                        <FieldError message={form.formState.errors.registrationStatus?.message} />
                      </div>
                    </div>
                  </form>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setDialogOpen(false)} disabled={addProductMutation.isLoading}>
                      Cancel
                    </Button>
                    <Button form="add-product-form" type="submit" disabled={addProductMutation.isLoading}>
                      {addProductMutation.isLoading ? <Loader2 className="mr-2 size-4 animate-spin" /> : null}
                      Save product
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            {isLoading ? (
              <StateMessage state="loading" />
            ) : isError ? (
              <StateMessage state="error" />
            ) : !data || data.data.length === 0 ? (
              <StateMessage state="empty" />
            ) : (
              <ScrollArea className="max-h-[600px]">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Device</TableHead>
                      <TableHead>Classification</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Expected Complaints</TableHead>
                      <TableHead>Active Reports</TableHead>
                      <TableHead className="text-right">Last Updated</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {data.data.map((item) => {
                      const classLabel = CLASS_LABELS[item.deviceClass] ?? item.deviceClass;
                      const status = STATUS_VARIANTS[item.registrationStatus] ?? {
                        label: item.registrationStatus,
                        variant: "secondary" as const,
                      };
                      return (
                        <TableRow key={item.id}>
                          <TableCell>
                            <div className="flex flex-col gap-1">
                              <span className="font-medium">{item.name}</span>
                              <span className="text-xs text-muted-foreground">
                                {item.modelNumber ? `Model ${item.modelNumber}` : "Model not specified"}
                                {item.udi ? ` · UDI ${item.udi}` : ""}
                              </span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline">{classLabel}</Badge>
                          </TableCell>
                          <TableCell>
                            <Badge variant={status.variant}>{status.label}</Badge>
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline">{separator(item.expectedComplaints)}</Badge>
                          </TableCell>
                          <TableCell>
                            <Badge variant="secondary">{separator(item.reportsCount)}</Badge>
                          </TableCell>
                          <TableCell className="text-right text-xs text-muted-foreground">
                            {format(new Date(item.updatedAt), "dd MMM yyyy")}
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </ScrollArea>
            )}
          </CardContent>
        </Card>
        <ProductHighlights summary={summary} />
      </section>
    </div>
  );
}

function FieldError({ message }: { message?: string }) {
  if (!message) return null;
  return <p className="text-xs text-destructive">{message}</p>;
}

function ProductHighlights({ summary }: { summary: { total: number; registered: number; pending: number; suspended: number; retired: number; expectedComplaints: number; reports: number } }) {
  return (
    <Card className="flex flex-col gap-4 p-4">
      <div className="space-y-3">
        <CardTitle className="text-base">Portfolio Snapshot</CardTitle>
        <div className="grid gap-3">
          <HighlightStat label="Total Devices" value={separator(summary.total)} helper="Currently monitored" />
          <HighlightStat label="Registered" value={separator(summary.registered)} helper="Cleared for market" />
          <HighlightStat label="Pending" value={separator(summary.pending)} helper="Awaiting approval" />
          <HighlightStat label="Suspended" value={separator(summary.suspended)} helper="Requires corrective action" variant="destructive" />
        </div>
      </div>
      <div className="rounded-lg border bg-muted/40 p-4 space-y-3">
        <div className="flex items-center gap-2 text-sm font-medium">
          <FileText className="size-4" />
          Regulatory Outlook
        </div>
        <p className="text-xs text-muted-foreground">
          Forecasted complaints help prioritize vigilance reports. Track active investigations to align corrective actions
          with facility partners.
        </p>
        <div className="grid gap-3 text-sm">
          <div className="flex items-center justify-between">
            <span>Forecasted complaints</span>
            <Badge variant="outline">{separator(summary.expectedComplaints)}</Badge>
          </div>
          <div className="flex items-center justify-between">
            <span>Active reports</span>
            <Badge variant="secondary">{separator(summary.reports)}</Badge>
          </div>
        </div>
      </div>
    </Card>
  );
}

type HighlightVariant = "default" | "destructive";

function HighlightStat({ label, value, helper, variant = "default" }: { label: string; value: string; helper: string; variant?: HighlightVariant }) {
  return (
    <div className={`rounded-lg border p-3 ${variant === "destructive" ? "border-destructive/40 bg-destructive/5" : "border-muted"}`}>
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="text-2xl font-semibold">{value}</p>
      <p className="text-xs text-muted-foreground">{helper}</p>
    </div>
  );
}

function StateMessage({ state }: { state: "loading" | "error" | "empty" }) {
  if (state === "loading") {
    return (
      <div className="flex h-48 items-center justify-center gap-2 text-sm text-muted-foreground">
        <Loader2 className="size-4 animate-spin" />
        Loading product catalog…
      </div>
    );
  }

  if (state === "error") {
    return <div className="flex h-48 items-center justify-center text-sm text-destructive">Failed to load products.</div>;
  }

  return <div className="flex h-48 items-center justify-center text-sm text-muted-foreground">No products found.</div>;
}

