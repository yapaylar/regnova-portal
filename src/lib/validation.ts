import { z } from "zod";

const phoneRegex = /^[+]?[(]?[0-9]{1,4}[)]?[-\s./0-9]*$/;

export const reportSchema = z.object({
  reportType: z.enum(["complaint", "adverse-event"], {
    errorMap: () => ({ message: "Please select a report type" }),
  }),
  device: z.object({
    name: z
      .string({ required_error: "Device name is required" })
      .min(2, "Device name is required"),
    model: z
      .string({ required_error: "Model is required" })
      .min(1, "Model is required"),
    manufacturer: z
      .string({ required_error: "Manufacturer is required" })
      .min(1, "Manufacturer is required"),
    serialLotNumber: z
      .string({ required_error: "Serial or lot number is required" })
      .min(1, "Serial or lot number is required"),
    udi: z.string().optional().or(z.literal("")),
    purchaseDate: z
      .string({ required_error: "Purchase or installation date is required" })
      .refine((value) => !Number.isNaN(Date.parse(value)), "Enter a valid date"),
  }),
  event: z.object({
    date: z
      .string({ required_error: "Event date is required" })
      .refine((value) => !Number.isNaN(Date.parse(value)), "Enter a valid date"),
    location: z
      .string({ required_error: "Location is required" })
      .min(2, "Location is required"),
    description: z
      .string({ required_error: "Description is required" })
      .min(10, "Enter at least 10 characters"),
    severity: z.enum(["low", "medium", "high"], {
      errorMap: () => ({ message: "Please select a severity" }),
    }),
    outcome: z.enum(["recovered", "ongoing", "fatal", "unknown"], {
      errorMap: () => ({ message: "Please select an outcome" }),
    }),
    patientInvolved: z.boolean(),
    actionsTaken: z
      .string({ required_error: "Enter the actions taken" })
      .min(5, "Enter the actions taken"),
  }),
  facility: z.object({
    name: z
      .string({ required_error: "Facility name is required" })
      .min(2, "Facility name is required"),
    department: z
      .string({ required_error: "Department or unit is required" })
      .min(2, "Department or unit is required"),
    address: z
      .string({ required_error: "Address is required" })
      .min(5, "Address is required"),
    region: z
      .string({ required_error: "Region is required" })
      .min(2, "Region is required"),
    contactPerson: z
      .string({ required_error: "Contact person is required" })
      .min(2, "Contact person is required"),
    phone: z
      .string({ required_error: "Phone number is required" })
      .regex(phoneRegex, "Enter a valid phone number"),
    email: z
      .string({ required_error: "Email is required" })
      .email("Enter a valid email"),
  }),
  reporter: z.object({
    name: z
      .string({ required_error: "Reporter name is required" })
      .min(2, "Reporter name is required"),
    title: z
      .string({ required_error: "Role or title is required" })
      .min(2, "Role or title is required"),
    email: z
      .string({ required_error: "Reporter email is required" })
      .email("Enter a valid email"),
    phone: z
      .string({ required_error: "Reporter phone is required" })
      .regex(phoneRegex, "Enter a valid phone number"),
    organization: z
      .string({ required_error: "Organization is required" })
      .min(2, "Organization is required"),
  }),
  attachments: z
    .array(
      z.object({
        id: z.string(),
        name: z.string(),
        size: z.number().max(10 * 1024 * 1024, "File must be 10MB or less"),
        type: z
          .string()
          .refine(
            (value) =>
              ["application/pdf", "image/png", "image/jpeg"].includes(value),
            "Unsupported file type",
          ),
        uploadedAt: z.string(),
      }),
    )
    .max(10, "You can upload up to 10 files"),
  confirmation: z.object({
    agreed: z.literal(true, {
      errorMap: () => ({ message: "Please confirm the information is accurate" }),
    }),
  }),
});

export type ReportFormValues = z.infer<typeof reportSchema>;

export const defaultReportValues: ReportFormValues = {
  reportType: "complaint",
  device: {
    name: "",
    model: "",
    manufacturer: "",
    serialLotNumber: "",
    udi: "",
    purchaseDate: "",
  },
  event: {
    date: "",
    location: "",
    description: "",
    severity: "medium",
    outcome: "ongoing",
    patientInvolved: false,
    actionsTaken: "",
  },
  facility: {
    name: "",
    department: "",
    address: "",
    region: "",
    contactPerson: "",
    phone: "",
    email: "",
  },
  reporter: {
    name: "",
    title: "",
    email: "",
    phone: "",
    organization: "",
  },
  attachments: [],
  confirmation: {
    agreed: false,
  },
};

export const reportStepOrder = [
  "report-type",
  "device-information",
  "event-details",
  "facility-details",
  "reporter-details",
  "attachments",
  "review",
] as const;

export type ReportStep = (typeof reportStepOrder)[number];

