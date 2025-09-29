"use client";

import { useEffect, useMemo, useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form } from "@/components/ui/form";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ROLE_ORGANIZATIONS } from "@/data/mock";
import { useRole } from "@/context/role-context";
import { useDraftReport } from "@/hooks/use-draft-report";
import { defaultReportValues, ReportStep, reportSchema, reportStepOrder } from "@/lib/validation";

import { AttachmentsStep } from "./steps/attachments-step";
import { DeviceStep } from "./steps/device-step";
import { EventStep } from "./steps/event-step";
import { FacilityStep } from "./steps/facility-step";
import { ReportTypeStep } from "./steps/report-type-step";
import { ReporterStep } from "./steps/reporter-step";
import { ReviewStep } from "./steps/review-step";

export default function ReportWizardPage() {
  const router = useRouter();
  const { role } = useRole();
  const { data, hydrated, updateDraft, clearDraft } = useDraftReport();
  const [activeStep, setActiveStep] = useState<ReportStep>("report-type");

  const form = useForm({
    resolver: zodResolver(reportSchema),
    defaultValues: {
      ...defaultReportValues,
      ...data,
      reporter: {
        ...defaultReportValues.reporter,
        ...(data?.reporter ?? {}),
        organization:
          data?.reporter?.organization ?? ROLE_ORGANIZATIONS[role] ?? "",
      },
    },
    mode: "onChange",
  });

  useEffect(() => {
    if (!hydrated) return;
    const organization = ROLE_ORGANIZATIONS[role] ?? "";

    form.reset({
      ...defaultReportValues,
      ...data,
      reporter: {
        ...defaultReportValues.reporter,
        ...(data?.reporter ?? {}),
        organization: data?.reporter?.organization ?? organization,
      },
    });

    const nextStep = data?.step && reportStepOrder.includes(data.step as ReportStep) ? data.step : "report-type";
    setActiveStep(nextStep as ReportStep);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hydrated, role]);

  const currentIndex = reportStepOrder.indexOf(activeStep);

  const nextStep = () => {
    const next = reportStepOrder[currentIndex + 1];
    if (next) {
      setActiveStep(next);
    }
  };

  const prevStep = () => {
    const prev = reportStepOrder[currentIndex - 1];
    if (prev) {
      setActiveStep(prev);
    }
  };

  const onSubmit = form.handleSubmit((values) => {
    const trackingId = generateTrackingId();
    toast.success("Report submitted successfully", {
      description: `Your tracking ID is ${trackingId}. Please save this ID to follow the status.`,
      action: {
        label: "Track Now",
        onClick: () => router.push(`/track?id=${trackingId}`),
      },
    });
    clearDraft();
    router.push(`/report/success?trackingId=${trackingId}`);
  });

  const stepContent = useMemo(() => {
    switch (activeStep) {
      case "report-type":
        return <ReportTypeStep control={form.control} />;
      case "device-information":
        return <DeviceStep control={form.control} />;
      case "event-details":
        return <EventStep control={form.control} />;
      case "facility-details":
        return <FacilityStep control={form.control} />;
      case "reporter-details":
        return <ReporterStep control={form.control} role={role} />;
      case "attachments":
        return <AttachmentsStep control={form.control} />;
      case "review":
        return <ReviewStep control={form.control} />;
      default:
        return null;
    }
  }, [activeStep, form.control, role]);

  const handleSaveProgress = () => {
    updateDraft({
      step: activeStep,
      data: form.getValues(),
    });
    toast.success("Your progress is saved as a draft");
  };

  const isReviewStep = activeStep === "review";
  const isFirstStep = currentIndex === 0;
  const isLastStep = currentIndex === reportStepOrder.length - 1;

  return (
    <Form {...form}>
      <form className="flex flex-col gap-6" onSubmit={onSubmit}>
        <Card>
          <CardHeader>
            <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
              <div>
                <CardTitle>Report Issue</CardTitle>
                <CardDescription>
                  Complete the steps below to submit a complaint or adverse event report.
                </CardDescription>
              </div>
              <div className="flex gap-2">
                <Button type="button" variant="outline" onClick={handleSaveProgress}>
                  Save Draft
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => {
                    clearDraft();
                    form.reset(defaultReportValues);
                    setActiveStep("report-type");
                  }}
                >
                  Reset
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <Tabs value={activeStep} className="w-full">
              <TabsList className="grid w-full grid-cols-1 gap-2 sm:grid-cols-4 lg:grid-cols-7">
                {reportStepOrder.map((step) => (
                  <TabsTrigger
                    key={step}
                    value={step}
                    className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
                    onClick={() => setActiveStep(step)}
                  >
                    {stepLabels[step]}
                  </TabsTrigger>
                ))}
              </TabsList>
              {reportStepOrder.map((step) => (
                <TabsContent key={step} value={step} className="mt-6">
                  {activeStep === step ? stepContent : null}
                </TabsContent>
              ))}
            </Tabs>

            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <div className="text-xs text-muted-foreground">
                Step {currentIndex + 1} of {reportStepOrder.length}
              </div>
              <div className="flex flex-wrap gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={prevStep}
                  disabled={isFirstStep}
                >
                  Previous
                </Button>
                {!isLastStep ? (
                  <Button
                    type="button"
                    onClick={async () => {
                      const fields = stepFieldMap[activeStep] ?? [];
                      const valid = await form.trigger(fields);
                      if (!valid) {
                        toast.error("Please fix the highlighted fields");
                        return;
                      }
                      updateDraft({
                        step: reportStepOrder[currentIndex + 1],
                        data: form.getValues(),
                      });
                      nextStep();
                    }}
                  >
                    Next
                  </Button>
                ) : null}
                {isReviewStep ? (
                  <Button type="submit">Submit report</Button>
                ) : null}
              </div>
            </div>
          </CardContent>
        </Card>
      </form>
    </Form>
  );
}

const stepLabels: Record<ReportStep, string> = {
  "report-type": "Report Type",
  "device-information": "About Device",
  "event-details": "Event Details",
  "facility-details": "Facility Details",
  "reporter-details": "Reporter Details",
  attachments: "Attachments",
  review: "Review & Submit",
};

const stepFieldMap: Record<ReportStep, (keyof ReportFormValues | `${string}.${string}`)[]> = {
  "report-type": ["reportType"],
  "device-information": [
    "device.name",
    "device.model",
    "device.manufacturer",
    "device.serialLotNumber",
    "device.purchaseDate",
  ],
  "event-details": [
    "event.date",
    "event.location",
    "event.description",
    "event.severity",
    "event.outcome",
    "event.patientInvolved",
    "event.actionsTaken",
  ],
  "facility-details": [
    "facility.name",
    "facility.department",
    "facility.address",
    "facility.region",
    "facility.contactPerson",
    "facility.phone",
    "facility.email",
  ],
  "reporter-details": [
    "reporter.name",
    "reporter.title",
    "reporter.email",
    "reporter.phone",
    "reporter.organization",
  ],
  attachments: ["attachments"],
  review: [],
};

function generateTrackingId() {
  const base = Math.floor(Math.random() * 9000) + 1000;
  return `CMP-2025-${base}`;
}

