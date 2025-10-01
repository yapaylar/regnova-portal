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
import { useAdminDevices, useCreateDeviceMutation } from "@/hooks/use-admin-devices";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { DeviceClass, DeviceRegistrationStatus } from "@prisma/client";
import { useToast } from "@/components/ui/use-toast";

const deviceSchema = z.object({
  name: z.string().min(2, "Device name is required"),
  modelNumber: z.string().min(1, "Model is required"),
  manufacturerId: z.string().min(1, "Manufacturer is required"),
  udi: z.string().optional().nullable(),
  deviceClass: z.nativeEnum(DeviceClass, {
    errorMap: () => ({ message: "Select a class" }),
  }),
  registrationStatus: z.nativeEnum(DeviceRegistrationStatus, {
    errorMap: () => ({ message: "Select status" }),
  }),
  notes: z.string().optional().nullable(),
});

export default function DevicesPage() {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const { toast } = useToast();
  const { data, isLoading, isError } = useAdminDevices({ search: search.length ? search : undefined });
  const createDevice = useCreateDeviceMutation();
  const form = useForm({
    resolver: zodResolver(deviceSchema),
    defaultValues: {
      name: "",
      modelNumber: "",
      manufacturerId: "",
      udi: "",
      deviceClass: DeviceClass.II,
      registrationStatus: DeviceRegistrationStatus.REGISTERED,
      notes: "",
    },
  });

  const onSubmit = form.handleSubmit(async (values) => {
    try {
      await createDevice.mutateAsync({
        name: values.name,
        modelNumber: values.modelNumber,
        manufacturerId: values.manufacturerId,
        udi: values.udi ? values.udi : undefined,
        deviceClass: values.deviceClass,
        registrationStatus: values.registrationStatus,
        notes: values.notes ?? undefined,
      });
      toast.success("Device created");
      setOpen(false);
      form.reset();
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to create device";
      toast.error("Could not create device", { description: message });
    }
  });

  return (
    <div className="flex flex-col gap-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between gap-4">
          <div className="flex w-full flex-col gap-2 md:flex-row md:items-center md:justify-between">
            <div>
              <CardTitle>Devices</CardTitle>
              <CardDescription>Manage devices registered for monitoring and PMS activities.</CardDescription>
            </div>
            <Input
              className="w-full md:w-64"
              placeholder="Search devices"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
            />
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
                    name="modelNumber"
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
                    name="manufacturerId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Manufacturer ID</FormLabel>
                        <FormControl>
                          <Input placeholder="Manufacturer ID" {...field} />
                        </FormControl>
                        <p className="text-xs text-muted-foreground">
                          Sample manufacturer IDs: <code className="font-mono">70734e3c9d51e9348aa2f90dc1dc0ad4</code>,
                          <code className="font-mono">3fae36383a80ea55bd85bb334e83f563</code>
                        </p>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="udi"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>UDI (optional)</FormLabel>
                        <FormControl>
                          <Input placeholder="Unique Device Identifier" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="deviceClass"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Device Class</FormLabel>
                        <Select value={field.value} onValueChange={(value) => field.onChange(value as DeviceClass)}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select class" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {Object.values(DeviceClass).map((classType) => (
                              <SelectItem key={classType} value={classType}>
                                {classType}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="registrationStatus"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Registration Status</FormLabel>
                        <Select
                          value={field.value}
                          onValueChange={(value) => field.onChange(value as DeviceRegistrationStatus)}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select status" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {Object.values(DeviceRegistrationStatus).map((status) => (
                              <SelectItem key={status} value={status}>
                                {status}
                              </SelectItem>
                            ))}
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
                    <Button type="submit" disabled={createDevice.isPending}>
                      {createDevice.isPending ? "Saving..." : "Save Device"}
                    </Button>
                  </DialogFooter>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
        </CardHeader>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="flex h-48 items-center justify-center text-sm text-muted-foreground">Loading devices…</div>
          ) : isError ? (
            <div className="flex h-48 items-center justify-center text-sm text-destructive">Failed to load devices.</div>
          ) : !data || data.items.length === 0 ? (
            <div className="flex h-48 items-center justify-center text-sm text-muted-foreground">No devices found.</div>
          ) : (
            <ScrollArea className="max-h-[600px]">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Device</TableHead>
                    <TableHead>Manufacturer</TableHead>
                    <TableHead>Class</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Assignments</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data.items.map((device) => (
                    <TableRow key={device.id}>
                      <TableCell>
                        <div className="flex flex-col">
                          <span className="font-medium">{device.name}</span>
                          {device.modelNumber ? (
                            <span className="text-xs text-muted-foreground">Model {device.modelNumber}</span>
                          ) : null}
                        </div>
                      </TableCell>
                      <TableCell>{device.manufacturer.name}</TableCell>
                      <TableCell>{device.deviceClass}</TableCell>
                      <TableCell>{device.registrationStatus}</TableCell>
                      <TableCell className="max-w-xs whitespace-pre-wrap text-xs text-muted-foreground">
                        {device.assignments.length > 0
                          ? device.assignments.map((assignment) => `${assignment.facility.name} (${assignment.status})`).join(", ")
                          : "—"}
                      </TableCell>
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

