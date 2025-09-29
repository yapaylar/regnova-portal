"use client";

import { useState } from "react";
import { Plus } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { DEVICES } from "@/data/mock";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

const deviceSchema = z.object({
  name: z.string().min(2, "Device name is required"),
  model: z.string().min(1, "Model is required"),
  manufacturer: z.string().min(2, "Manufacturer is required"),
  class: z.enum(["I", "II", "III"], {
    errorMap: () => ({ message: "Select a class" }),
  }),
  notes: z.string().optional(),
});

export default function DevicesPage() {
  const [open, setOpen] = useState(false);
  const form = useForm({
    resolver: zodResolver(deviceSchema),
    defaultValues: {
      name: "",
      model: "",
      manufacturer: "Regnova",
      class: "II",
      notes: "",
    },
  });

  const onSubmit = form.handleSubmit((values) => {
    console.log("New device", values);
    setOpen(false);
    form.reset();
  });

  return (
    <div className="flex flex-col gap-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between gap-4">
          <div>
            <CardTitle>Devices</CardTitle>
            <CardDescription>Manage devices registered for monitoring and PMS activities.</CardDescription>
          </div>
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 size-4" />
                New Device
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Register Device</DialogTitle>
                <DialogDescription>Add a device to the inventory registry.</DialogDescription>
              </DialogHeader>
              <Form {...form}>
                <form className="space-y-4" onSubmit={onSubmit}>
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Device Name</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter device name" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="model"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Model</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter device model" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="manufacturer"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Manufacturer</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter manufacturer" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="class"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Device Class</FormLabel>
                        <Select value={field.value} onValueChange={field.onChange}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select class" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="I">Class I</SelectItem>
                            <SelectItem value="II">Class II</SelectItem>
                            <SelectItem value="III">Class III</SelectItem>
                          </SelectContent>
                        </Select>
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
                          <Input placeholder="Optional notes" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <DialogFooter>
                    <Button type="submit">Save Device</Button>
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
                  <TableHead>Device</TableHead>
                  <TableHead>Manufacturer</TableHead>
                  <TableHead>Class</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Notes</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {DEVICES.map((device) => (
                  <TableRow key={device.id}>
                    <TableCell>{device.name}</TableCell>
                    <TableCell>{device.manufacturer}</TableCell>
                    <TableCell>{device.class}</TableCell>
                    <TableCell>{device.registrationStatus}</TableCell>
                    <TableCell className="max-w-xs whitespace-normal text-sm text-muted-foreground">
                      {device.notes ?? "—"}
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

