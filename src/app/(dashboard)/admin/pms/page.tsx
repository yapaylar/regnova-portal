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
import { PMS_VISITS } from "@/data/mock";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

const visitSchema = z.object({
  visitDate: z.string({ required_error: "Visit date is required" }),
  organization: z.string().min(2, "Organization is required"),
  notes: z.string().min(5, "Enter visit summary"),
  files: z.string().optional(),
});

export default function PmsPage() {
  const [open, setOpen] = useState(false);
  const form = useForm({
    resolver: zodResolver(visitSchema),
    defaultValues: {
      visitDate: "",
      organization: "",
      notes: "",
      files: "",
    },
  });

  const onSubmit = form.handleSubmit((values) => {
    console.log("Log visit", values);
    setOpen(false);
    form.reset();
  });

  return (
    <div className="flex flex-col gap-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between gap-4">
          <div>
            <CardTitle>PMS Visits</CardTitle>
            <CardDescription>Track post-market surveillance visits and documentation.</CardDescription>
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
                    name="files"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Files (optional)</FormLabel>
                        <FormControl>
                          <Input placeholder="AuditReport.pdf" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <DialogFooter>
                    <Button type="submit">Save Visit</Button>
                  </DialogFooter>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
        </CardHeader>
        <CardContent className="p-0">
          <ScrollArea className="max-h-[600px]">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Organization</TableHead>
                  <TableHead>Notes</TableHead>
                  <TableHead>Files</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {PMS_VISITS.map((visit) => (
                  <TableRow key={visit.id}>
                    <TableCell>{visit.visitDate}</TableCell>
                    <TableCell>{visit.organization}</TableCell>
                    <TableCell className="max-w-xs whitespace-normal text-sm text-muted-foreground">
                      {visit.notes}
                    </TableCell>
                    <TableCell>
                      {visit.files.length ? (
                        <ul className="space-y-1 text-xs text-primary">
                          {visit.files.map((file) => (
                            <li key={file}>{file}</li>
                          ))}
                        </ul>
                      ) : (
                        <span className="text-xs text-muted-foreground">No files</span>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  );
}

