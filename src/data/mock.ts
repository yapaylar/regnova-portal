import { Role } from "@/context/role-context";

export type Metric = {
  id: string;
  label: string;
  value: string;
  trend?: string;
};

export const DASHBOARD_METRICS: Metric[] = [
  { id: "active-complaints", label: "Active Complaints", value: "28", trend: "+3 this week" },
  { id: "recalls", label: "Recalls This Month", value: "5", trend: "+1 vs last month" },
  { id: "devices", label: "Devices Monitored", value: "184", trend: "+12 since last audit" },
  { id: "pending", label: "Pending Reviews", value: "12", trend: "4 due today" },
];

export type Complaint = {
  id: string;
  patientName: string;
  facility: string;
  status: "Submitted" | "In Review" | "Action Required" | "Closed";
  submittedAt: string;
  summary: string;
};

export const RECENT_COMPLAINTS: Complaint[] = [
  {
    id: "CMP-2025-0012",
    patientName: "John Doe",
    facility: "St. Mary Medical Center",
    status: "In Review",
    submittedAt: "2025-09-18",
    summary: "Unexpected device shutdown during procedure.",
  },
  {
    id: "CMP-2025-0009",
    patientName: "Sarah Jenkins",
    facility: "Northview Hospital",
    status: "Submitted",
    submittedAt: "2025-09-15",
    summary: "Delayed alert notification on monitoring device.",
  },
  {
    id: "CMP-2025-0003",
    patientName: "Michael Lee",
    facility: "Westside Clinic",
    status: "Action Required",
    submittedAt: "2025-09-10",
    summary: "Battery overheating reported by clinical staff.",
  },
];

export type Recall = {
  id: string;
  device: string;
  manufacturer: string;
  actionType: "Safety Notice" | "Field Action" | "Full Recall" | "Software Patch";
  region: string;
  date: string;
  status: "Open" | "Closed" | "Monitoring";
  description: string;
  fsnLinks: { label: string; url: string }[];
  affectedLots: string[];
  correctiveActions: string[];
};

export const RECALLS: Recall[] = Array.from({ length: 25 }).map((_, index) => {
  const types = ["Safety Notice", "Field Action", "Full Recall", "Software Patch"] as const;
  const statuses = ["Open", "Closed", "Monitoring"] as const;
  const actions = ["Inspect devices", "Notify clinical teams", "Apply software update"];
  const lotBase = `LOT-${2025 + index}`;

  return {
    id: `RC-${2025 + index}`,
    device: `Regnova Monitor ${index + 1}`,
    manufacturer: index % 2 === 0 ? "Regnova" : "HealthTech Corp",
    actionType: types[index % types.length],
    region: index % 3 === 0 ? "EMEA" : index % 3 === 1 ? "North America" : "APAC",
    date: `2025-09-${(index % 28) + 1}`,
    status: statuses[index % statuses.length],
    description:
      "Routine post-market surveillance identified a potential issue requiring customer notification and corrective action.",
    fsnLinks: [
      { label: "View FSN", url: "https://example.com/fsn" },
      { label: "Regulatory Notice", url: "https://example.com/regulatory" },
    ],
    affectedLots: [lotBase, `${lotBase}-A`, `${lotBase}-B`],
    correctiveActions: actions,
  } satisfies Recall;
});

export type ResourceItem = {
  title: string;
  description: string;
  size: string;
  url: string;
};

export const RESOURCES = [
  {
    category: "SOPs",
    items: [
      {
        title: "Device Intake SOP",
        description: "Standard process for registering new medical devices.",
        size: "1.2 MB PDF",
        url: "https://example.com/sop-device-intake",
      },
      {
        title: "Complaint Handling SOP",
        description: "Step-by-step workflow for complaint triage and investigation.",
        size: "2.4 MB PDF",
        url: "https://example.com/sop-complaint",
      },
    ],
  },
  {
    category: "Guidelines",
    items: [
      {
        title: "Recall Communication Guideline",
        description: "Template for communicating recalls to facilities.",
        size: "850 KB PDF",
        url: "https://example.com/guidelines-recall",
      },
      {
        title: "Post-Market Surveillance Checklist",
        description: "Quarterly PMS audit checklist for facilities.",
        size: "640 KB PDF",
        url: "https://example.com/guidelines-pms",
      },
    ],
  },
  {
    category: "Forms",
    items: [
      {
        title: "Incident Report Form",
        description: "Form to capture adverse event details for escalation.",
        size: "520 KB DOCX",
        url: "https://example.com/form-incident",
      },
      {
        title: "Device Removal Authorization",
        description: "Approval form for device removal from inventory.",
        size: "470 KB PDF",
        url: "https://example.com/form-removal",
      },
    ],
  },
] as const;

export type TrackStatus = "Submitted" | "In Review" | "Action Required" | "Closed";

export const TRACKING_TIMELINE: Record<string, { status: TrackStatus; date: string; note: string }[]> = {
  "CMP-2025-0012": [
    { status: "Submitted", date: "2025-09-18", note: "Report received and logged." },
    { status: "In Review", date: "2025-09-19", note: "Clinical review in progress." },
    { status: "Action Required", date: "2025-09-21", note: "Awaiting facility action plan." },
  ],
  "CMP-2025-0009": [
    { status: "Submitted", date: "2025-09-15", note: "Report submitted by facility admin." },
    { status: "In Review", date: "2025-09-16", note: "Complaint assigned to investigator." },
  ],
};

export const ROLE_ORGANIZATIONS: Record<Role, string> = {
  admin: "Regnova HQ",
  facility: "Central Valley Hospital",
  manufacturer: "Regnova Manufacturing",
};

export type User = {
  id: string;
  name: string;
  email: string;
  role: "Admin" | "Facility" | "Manufacturer";
  organization: string;
};

export const USERS: User[] = [
  {
    id: "USR-001",
    name: "Laura Wright",
    email: "laura.wright@regnova.com",
    role: "Admin",
    organization: "Regnova HQ",
  },
  {
    id: "USR-002",
    name: "David Kim",
    email: "david.kim@centralvalley.org",
    role: "Facility",
    organization: "Central Valley Hospital",
  },
  {
    id: "USR-003",
    name: "Priya Nair",
    email: "priya.nair@northview.org",
    role: "Facility",
    organization: "Northview Hospital",
  },
  {
    id: "USR-004",
    name: "Ethan Martinez",
    email: "ethan.martinez@regnova.com",
    role: "Manufacturer",
    organization: "Regnova Manufacturing",
  },
  {
    id: "USR-005",
    name: "Sophia Chen",
    email: "sophia.chen@westsideclinic.org",
    role: "Facility",
    organization: "Westside Clinic",
  },
  {
    id: "USR-006",
    name: "Mark Rossi",
    email: "mark.rossi@healthtech.com",
    role: "Manufacturer",
    organization: "HealthTech Corp",
  },
];

export type Device = {
  id: string;
  name: string;
  manufacturer: string;
  class: "I" | "II" | "III";
  registrationStatus: "Registered" | "Pending" | "Suspended";
  notes?: string;
};

export const DEVICES: Device[] = [
  {
    id: "DEV-001",
    name: "Regnova Monitor 5",
    manufacturer: "Regnova",
    class: "II",
    registrationStatus: "Registered",
    notes: "Firmware 2.3 deployed",
  },
  {
    id: "DEV-002",
    name: "HealthScan Analyzer",
    manufacturer: "HealthTech Corp",
    class: "III",
    registrationStatus: "Registered",
    notes: "Annual maintenance due Nov 2025",
  },
  {
    id: "DEV-003",
    name: "SterileFlow Pump",
    manufacturer: "Regnova",
    class: "II",
    registrationStatus: "Pending",
    notes: "Awaiting final validation",
  },
  {
    id: "DEV-004",
    name: "Insight Imaging Suite",
    manufacturer: "Mediview",
    class: "III",
    registrationStatus: "Suspended",
    notes: "Recall investigation in progress",
  },
];

export type PmsVisit = {
  id: string;
  visitDate: string;
  organization: string;
  notes: string;
  files: string[];
};

export const PMS_VISITS: PmsVisit[] = [
  {
    id: "PMS-001",
    visitDate: "2025-08-30",
    organization: "Central Valley Hospital",
    notes: "Quarterly audit completed. Minor documentation updates required.",
    files: ["AuditSummary_Aug2025.pdf"],
  },
  {
    id: "PMS-002",
    visitDate: "2025-07-14",
    organization: "Northview Hospital",
    notes: "Follow-up on corrective actions; all items closed.",
    files: ["FollowUpReport_July2025.pdf"],
  },
];

export type AuditLogEntry = {
  id: string;
  timestamp: string;
  user: string;
  action: string;
  entity: string;
  before?: string;
  after?: string;
};

export const AUDIT_LOG: AuditLogEntry[] = [
  {
    id: "LOG-001",
    timestamp: "2025-09-20T10:15:00Z",
    user: "Laura Wright",
    action: "Updated",
    entity: "Device",
    before: '{"registrationStatus":"Pending"}',
    after: '{"registrationStatus":"Registered"}',
  },
  {
    id: "LOG-002",
    timestamp: "2025-09-19T16:32:00Z",
    user: "David Kim",
    action: "Created",
    entity: "Complaint",
    after: '{"id":"CMP-2025-0012"}',
  },
  {
    id: "LOG-003",
    timestamp: "2025-09-18T09:42:00Z",
    user: "Priya Nair",
    action: "Uploaded",
    entity: "PMS Report",
    after: '{"file":"PMS_Audit_Priya.pdf"}',
  },
];

