"use client";

import { ReactNode } from "react";
import { Control, useWatch } from "react-hook-form";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Checkbox } from "@/components/ui/checkbox";
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { ReportFormValues } from "@/lib/validation";

type ReviewStepProps = {
  control: Control<ReportFormValues>;
};

export function ReviewStep({ control }: ReviewStepProps) {
  const values = useWatch({ control });

  return (
    <section className="space-y-6">
      <Alert>
        <AlertTitle>Review & Submit</AlertTitle>
        <AlertDescription>
          Please review the information below before submitting. Use the Back button if you need to make changes.
        </AlertDescription>
      </Alert>

      <ConfirmationCard title="Report Type" description="The selected report category.">
        <ReviewField label="Type" value={values.reportType === "complaint" ? "Complaint" : "Adverse Event"} />
      </ConfirmationCard>

      <ConfirmationCard title="Device Information" description="Details of the device involved.">
        <ReviewField label="Device Name" value={values.device.name} />
        <ReviewField label="Model" value={values.device.model} />
        <ReviewField label="Manufacturer" value={values.device.manufacturer} />
        <ReviewField label="Serial / Lot Number" value={values.device.serialLotNumber} />
        {values.device.udi ? <ReviewField label="UDI" value={values.device.udi} /> : null}
        <ReviewField label="Purchase / Installation Date" value={values.device.purchaseDate} />
      </ConfirmationCard>

      <ConfirmationCard title="Event Details" description="Timeline and actions.">
        <ReviewField label="Event Date" value={values.event.date} />
        <ReviewField label="Location" value={values.event.location} />
        <ReviewField label="Severity" value={capitalize(values.event.severity)} />
        <ReviewField label="Outcome" value={capitalize(values.event.outcome)} />
        <ReviewField label="Patient Involved" value={values.event.patientInvolved ? "Yes" : "No"} />
        <ReviewField label="Description" value={values.event.description} multiline />
        <ReviewField label="Actions Taken" value={values.event.actionsTaken} multiline />
      </ConfirmationCard>

      <ConfirmationCard title="Facility Details" description="Facility contact information.">
        <ReviewField label="Facility" value={values.facility.name} />
        <ReviewField label="Department / Unit" value={values.facility.department} />
        <ReviewField label="Address" value={values.facility.address} multiline />
        <ReviewField label="Region" value={values.facility.region} />
        <ReviewField label="Contact Person" value={values.facility.contactPerson} />
        <ReviewField label="Phone" value={values.facility.phone} />
        <ReviewField label="Email" value={values.facility.email} />
      </ConfirmationCard>

      <ConfirmationCard title="Reporter Details" description="Reporter contact.">
        <ReviewField label="Name" value={values.reporter.name} />
        <ReviewField label="Role / Title" value={values.reporter.title} />
        <ReviewField label="Email" value={values.reporter.email} />
        <ReviewField label="Phone" value={values.reporter.phone} />
        <ReviewField label="Organization" value={values.reporter.organization} />
      </ConfirmationCard>

      <ConfirmationCard title="Attachments" description="Uploaded supporting files.">
        {values.attachments.length ? (
          <ul className="space-y-2 text-sm">
            {values.attachments.map((file) => (
              <li key={file.id} className="flex items-center justify-between gap-3 rounded border bg-muted/40 px-3 py-2">
                <span>{file.name}</span>
                <span className="text-xs text-muted-foreground">{formatBytes(file.size)}</span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-muted-foreground">No attachments provided.</p>
        )}
      </ConfirmationCard>

      <FormField
        control={control}
        name="confirmation.agreed"
        render={({ field }) => (
          <FormItem className="flex items-start gap-3 rounded-lg border p-4">
            <FormControl>
              <Checkbox
                checked={field.value}
                onCheckedChange={(checked) => field.onChange(checked === true)}
                aria-label="Confirm information is accurate"
              />
            </FormControl>
            <div className="space-y-1">
              <FormLabel className="text-sm font-medium">
                I confirm that the information provided is accurate to the best of my knowledge.
              </FormLabel>
              <FormMessage />
            </div>
          </FormItem>
        )}
      />
    </section>
  );
}

type ConfirmationCardProps = {
  title: string;
  description: string;
  children: ReactNode;
};

function ConfirmationCard({ title, description, children }: ConfirmationCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        {children}
      </CardContent>
    </Card>
  );
}

type ReviewFieldProps = {
  label: string;
  value: string;
  multiline?: boolean;
};

function ReviewField({ label, value, multiline = false }: ReviewFieldProps) {
  return (
    <div className="space-y-1">
      <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">{label}</p>
      <p className={multiline ? "whitespace-pre-wrap text-sm" : "text-sm font-medium"}>{value}</p>
      <Separator />
    </div>
  );
}

function capitalize(value: string) {
  return value.charAt(0).toUpperCase() + value.slice(1);
}

function formatBytes(bytes: number) {
  if (bytes === 0) return "0 Bytes";
  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB", "TB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
}

