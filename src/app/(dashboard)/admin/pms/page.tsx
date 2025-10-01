"use client";

import { useState } from "react";
import { Plus } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useAdminPmsVisits, useCreatePmsVisitMutation } from "@/hooks/use-admin-pms";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useToast } from "@/components/ui/use-toast";

const visitSchema = z.object({
  visitDate: z.string({ required_error: "Visit date is required" }),
  organization: z.string().min(2, "Organization is required"),
  facilityId: z.string().optional().nullable(),
  notes: z.string().min(5, "Enter visit summary"),
  attachments: z.string().optional(),
});

export default function PmsPage() {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const { toast } = useToast();
  const { data, isLoading, isError } = useAdminPmsVisits({ search: search.length ? search : undefined });
  const createVisit = useCreatePmsVisitMutation();
  const form = useForm({
    resolver: zodResolver(visitSchema),
    defaultValues: {
      visitDate: "",
      organization: "",
      facilityId: "",
      notes: "",
      attachments: "",
    },
  });

  const onSubmit = form.handleSubmit(async (values) => {
    try {
      await createVisit.mutateAsync({
        visitDate: values.visitDate,
        organization: values.organization,
        facilityId: values.facilityId ? values.facilityId : null,
        notes: values.notes,
        attachments: values.attachments,
      });
      toast.success("Visit logged");
      setOpen(false);
      form.reset();
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to log visit";
      toast.error("Could not log visit", { description: message });
    }
  });

  return (
    <div className="flex flex-col gap-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between gap-4">
          <div className="flex w-full flex-col gap-2 md:flex-row md:items-center md:justify-between">
            <div>
              <CardTitle>PMS Visits</CardTitle>
              <CardDescription>Track post-market surveillance visits and documentation.</CardDescription>
            </div>
            <Input
              className="w-full md:w-64"
              placeholder="Search visits"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
            />
          </div>
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 size-4" />
                Log Visit
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Log PMS Visit</DialogTitle>
                <DialogDescription>Record visit notes and attach relevant files.</DialogDescription>
              </DialogHeader>
              <Form {...form}>
                <form className="space-y-4" onSubmit={onSubmit}>
                  <FormField
                    control={form.control}
                    name="visitDate"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Visit Date</FormLabel>
                        <FormControl>
                          <Input type="date" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="organization"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Organization</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter organization" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="facilityId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Facility ID (optional)</FormLabel>
                        <FormControl>
                          <Input placeholder="Facility identifier" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="notes"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Notes</FormLabel>
                        <FormControl>
                          <Input placeholder="Summary of visit" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="attachments"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Attachments (comma separated)</FormLabel>
                        <FormControl>
                          <Input placeholder="AuditReport.pdf, VisitNotes.docx" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <DialogFooter>
                    <Button type="submit" disabled={createVisit.isPending}>
                      {createVisit.isPending ? "Saving..." : "Save Visit"}
                    </Button>
                  </DialogFooter>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
        </CardHeader>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="flex h-48 items-center justify-center text-sm text-muted-foreground">Loading visits…</div>
          ) : isError ? (
            <div className="flex h-48 items-center justify-center text-sm text-destructive">Failed to load visits.</div>
          ) : !data || data.items.length === 0 ? (
            <div className="flex h-48 items-center justify-center text-sm text-muted-foreground">No visits found.</div>
          ) : (
            <ScrollArea className="max-h-[600px]">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Organization</TableHead>
                    <TableHead>Notes</TableHead>
                    <TableHead>Facility</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data.items.map((visit) => (
                    <TableRow key={visit.id}>
                      <TableCell>{new Date(visit.visitDate).toLocaleDateString()}</TableCell>
                      <TableCell>{visit.organization}</TableCell>
                      <TableCell className="max-w-xs whitespace-pre-wrap text-sm text-muted-foreground">
                        {visit.notes}
                      </TableCell>
                      <TableCell>{visit.facility?.name ?? "—"}</TableCell>
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

