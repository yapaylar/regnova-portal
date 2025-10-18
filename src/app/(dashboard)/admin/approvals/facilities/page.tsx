"use client";

import { useMemo, useState } from "react";
import { Check, Filter, Loader2, RefreshCcw, Search, ShieldCheck, X } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAdminFacilityRegistrations, useFacilityOptions } from "@/hooks/use-admin-facility-registrations";
import { formatDateTime } from "@/lib/formatters";
import { useToast } from "@/components/ui/use-toast";

const STATUS_TABS = [
  { value: "PENDING", label: "Pending" },
  { value: "APPROVED", label: "Approved" },
  { value: "REJECTED", label: "Rejected" },
];

export default function FacilityApprovalsPage() {
  const { toast } = useToast();
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<string | undefined>("PENDING");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [isActionDialogOpen, setIsActionDialogOpen] = useState(false);
  const [actionType, setActionType] = useState<"approve" | "reject" | null>(null);
  const [selectedFacilityId, setSelectedFacilityId] = useState<string | null>(null);

  const { data, isLoading, isError, refetch, isRefetching } = useAdminFacilityRegistrations({
    status,
    search: search.length ? search : undefined,
    pageSize: 50,
  });

  const selectedRegistration = useMemo(() => data?.data.find((item) => item.id === selectedId) ?? null, [data, selectedId]);

  const { data: facilityOptions, isLoading: isLoadingOptions } = useFacilityOptions();

  const handleOpenAction = (registrationId: string, action: "approve" | "reject") => {
    setSelectedId(registrationId);
    setActionType(action);
    setIsActionDialogOpen(true);
  };

  const handleCloseAction = () => {
    setIsActionDialogOpen(false);
    setSelectedFacilityId(null);
  };

  const handleApprove = async () => {
    if (!selectedId) return;

    try {
      const response = await fetch(`/api/admin/facilities/${selectedId}/approve`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ facilityId: selectedFacilityId }),
      });

      if (!response.ok) {
        throw new Error("Failed to approve registration");
      }

      toast({ title: "Facility registration approved" });
      await refetch();
      handleCloseAction();
    } catch (error) {
      console.error(error);
      toast({ title: "Approval failed", variant: "destructive" });
    }
  };

  const handleReject = async () => {
    if (!selectedId) return;

    try {
      const response = await fetch(`/api/admin/facilities/${selectedId}/reject`, {
        method: "POST",
      });

      if (!response.ok) {
        throw new Error("Failed to reject registration");
      }

      toast({ title: "Facility registration rejected" });
      await refetch();
      handleCloseAction();
    } catch (error) {
      console.error(error);
      toast({ title: "Rejection failed", variant: "destructive" });
    }
  };

  return (
    <div className="flex flex-col gap-6">
      <Card>
        <CardHeader className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="space-y-2">
            <CardTitle className="flex items-center gap-2 text-xl font-semibold">
              <ShieldCheck className="size-5" /> Facility Approvals
            </CardTitle>
            <CardDescription>Review facility signup requests and link them to existing records.</CardDescription>
          </div>
          <div className="flex w-full flex-col gap-3 md:w-auto md:flex-row md:items-center">
            <div className="relative w-full md:w-64">
              <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                className="pl-9"
                placeholder="Search by name or email"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
              />
            </div>
            <Button variant="outline" onClick={() => refetch()} disabled={isRefetching}>
              {isRefetching ? <Loader2 className="mr-2 size-4 animate-spin" /> : <RefreshCcw className="mr-2 size-4" />} Refresh
            </Button>
          </div>
        </CardHeader>
        <CardContent className="pt-0">
          <Tabs value={status ?? "ALL"} onValueChange={(value) => setStatus(value === "ALL" ? undefined : value)}>
            <div className="flex flex-wrap items-center justify-between gap-3">
              <TabsList>
                <TabsTrigger value="ALL">All</TabsTrigger>
                {STATUS_TABS.map((tab) => (
                  <TabsTrigger key={tab.value} value={tab.value}>
                    {tab.label}
                  </TabsTrigger>
                ))}
              </TabsList>
              <Button variant="outline" size="sm">
                <Filter className="mr-2 size-4" />
                Advanced Filters
              </Button>
            </div>
            <Separator className="my-4" />

            <TabsContent value={status ?? "ALL"} className="mt-0">
              {isLoading ? (
                <div className="flex h-48 items-center justify-center text-sm text-muted-foreground">Loading registrations…</div>
              ) : isError ? (
                <div className="flex h-48 items-center justify-center text-sm text-destructive">Failed to load registrations.</div>
              ) : !data || data.data.length === 0 ? (
                <div className="flex h-48 items-center justify-center text-sm text-muted-foreground">No registrations found.</div>
              ) : (
                <div className="grid gap-4 md:grid-cols-[320px,1fr]">
                  <ScrollArea className="max-h-[560px] rounded-lg border bg-muted/20">
                    <div className="divide-y">
                      {data.data.map((registration) => {
                        const isSelected = registration.id === selectedId;
                        return (
                          <button
                            key={registration.id}
                            type="button"
                            onClick={() => setSelectedId(registration.id)}
                            className={`flex w-full flex-col items-start gap-2 p-4 text-left transition ${
                              isSelected ? "bg-background shadow-sm" : "hover:bg-background/60"
                            }`}
                          >
                            <div className="flex w-full items-center justify-between gap-2">
                              <div className="text-sm font-medium">
                                {registration.user.name ?? registration.user.email}
                              </div>
                              <Badge variant={registration.status === "PENDING" ? "default" : "secondary"}>
                                {registration.status}
                              </Badge>
                            </div>
                            <div className="text-xs text-muted-foreground">
                              Requested {formatDateTime(registration.submittedAt)}
                            </div>
                            <div className="text-xs text-muted-foreground">{registration.organization || "No organization"}</div>
                          </button>
                        );
                      })}
                    </div>
                  </ScrollArea>

                  <Card className="border bg-background">
                    <CardContent className="space-y-4 p-6">
                      {selectedRegistration ? (
                        <>
                          <div className="space-y-1">
                            <CardTitle className="text-lg">
                              {selectedRegistration.user.name ?? selectedRegistration.user.email}
                            </CardTitle>
                            <CardDescription>{selectedRegistration.user.email}</CardDescription>
                          </div>
                          <Separator />
                          <div className="space-y-3 text-sm">
                            <div>
                              <span className="font-medium">Organization:</span> {selectedRegistration.organization || "—"}
                            </div>
                            <div className="space-y-1">
                              <span className="font-medium">Submitted:</span>
                              <div className="text-muted-foreground">{formatDateTime(selectedRegistration.submittedAt)}</div>
                            </div>
                            {selectedRegistration.reviewedAt ? (
                              <div className="space-y-1">
                                <span className="font-medium">Reviewed:</span>
                                <div className="text-muted-foreground">{formatDateTime(selectedRegistration.reviewedAt)}</div>
                                {selectedRegistration.reviewer ? (
                                  <div className="text-xs text-muted-foreground">
                                    by {selectedRegistration.reviewer.email}
                                  </div>
                                ) : null}
                              </div>
                            ) : null}
                          </div>

                          <Separator />

                          <div className="flex flex-wrap gap-3">
                            <Button
                              size="sm"
                              disabled={selectedRegistration.status !== "PENDING"}
                              onClick={() => handleOpenAction(selectedRegistration.id, "approve")}
                            >
                              <Check className="mr-2 size-4" /> Approve
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              disabled={selectedRegistration.status !== "PENDING"}
                              onClick={() => handleOpenAction(selectedRegistration.id, "reject")}
                            >
                              <X className="mr-2 size-4" /> Reject
                            </Button>
                          </div>
                        </>
                      ) : (
                        <div className="flex h-48 items-center justify-center text-sm text-muted-foreground">
                          Select a registration to review
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      <Dialog open={isActionDialogOpen} onOpenChange={setIsActionDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {actionType === "approve" ? "Approve Facility Registration" : "Reject Facility Registration"}
            </DialogTitle>
            <DialogDescription>
              {actionType === "approve"
                ? "Link the signup to an existing facility or create a new one."
                : "This will mark the registration as rejected."}
            </DialogDescription>
          </DialogHeader>

          {actionType === "approve" ? (
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Select Facility</label>
                <Select
                  value={selectedFacilityId ?? undefined}
                  onValueChange={(value) => setSelectedFacilityId(value)}
                  disabled={isLoadingOptions}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder={isLoadingOptions ? "Loading facilities..." : "Choose facility"} />
                  </SelectTrigger>
                  <SelectContent>
                    {facilityOptions?.map((facility) => (
                      <SelectItem key={facility.id} value={facility.id}>
                        {facility.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground">
                  Leave empty to create a new facility using the organization name.
                </p>
              </div>
            </div>
          ) : null}

          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={handleCloseAction}>
              Cancel
            </Button>
            {actionType === "approve" ? (
              <Button onClick={handleApprove}>
                <Check className="mr-2 size-4" /> Approve
              </Button>
            ) : (
              <Button variant="destructive" onClick={handleReject}>
                <X className="mr-2 size-4" /> Reject
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
