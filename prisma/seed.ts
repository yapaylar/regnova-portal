import { PrismaClient, DeviceAssignmentStatus, DeviceClass, DeviceRegistrationStatus } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const manufacturers = [
    {
      slug: "regnova-medical",
      name: "Regnova Medical Systems",
      registrationNumber: "RN-2025-001",
      contactEmail: "support@regnova.com",
      contactPhone: "+1-555-0100",
    },
    {
      slug: "healthtech-labs",
      name: "HealthTech Labs",
      registrationNumber: "HT-2025-044",
      contactEmail: "contact@healthtechlabs.com",
      contactPhone: "+1-555-0115",
    },
  ];

  for (const manufacturer of manufacturers) {
    await prisma.manufacturer.upsert({
      where: { slug: manufacturer.slug },
      update: manufacturer,
      create: manufacturer,
    });
  }

  const facilities = [
    {
      slug: "central-valley-hospital",
      name: "Central Valley Hospital",
      region: "California",
      address: "1200 Health Ave, Fresno, CA",
      contactEmail: "admin@centralvalley.org",
      contactPhone: "+1-555-1000",
    },
    {
      slug: "northview-hospital",
      name: "Northview Hospital",
      region: "Washington",
      address: "200 Northview Rd, Seattle, WA",
      contactEmail: "info@northview.org",
      contactPhone: "+1-555-1010",
    },
    {
      slug: "st-marys-medical",
      name: "St. Mary's Medical Center",
      region: "Illinois",
      address: "450 Mercy St, Chicago, IL",
      contactEmail: "contact@stmarysmed.org",
      contactPhone: "+1-555-1025",
    },
  ];

  for (const facility of facilities) {
    await prisma.facility.upsert({
      where: { slug: facility.slug },
      update: facility,
      create: facility,
    });
  }

  const manufacturerRecords = await prisma.manufacturer.findMany({
    where: { slug: { in: manufacturers.map((m) => m.slug) } },
    select: { id: true, slug: true },
  });
  const manufacturerBySlug = new Map(manufacturerRecords.map((item) => [item.slug, item.id]));

  const facilityRecords = await prisma.facility.findMany({
    where: { slug: { in: facilities.map((f) => f.slug) } },
    select: { id: true, slug: true },
  });
  const facilityBySlug = new Map(facilityRecords.map((item) => [item.slug, item.id]));

  const devices = [
    {
      udi: "UDI-REG-0001",
      name: "Regnova Guardian Monitor",
      modelNumber: "RG-500",
      deviceClass: DeviceClass.II,
      registrationStatus: DeviceRegistrationStatus.REGISTERED,
      manufacturerSlug: "regnova-medical",
      notes: "Firmware v2.3 deployed",
      assignments: [
        { facilitySlug: "central-valley-hospital", status: DeviceAssignmentStatus.ACTIVE },
        { facilitySlug: "northview-hospital", status: DeviceAssignmentStatus.MAINTENANCE },
      ],
    },
    {
      udi: "UDI-REG-0002",
      name: "Regnova Infusion Pump",
      modelNumber: "RI-220",
      deviceClass: DeviceClass.II,
      registrationStatus: DeviceRegistrationStatus.PENDING,
      manufacturerSlug: "regnova-medical",
      notes: "Awaiting final validation",
      assignments: [{ facilitySlug: "st-marys-medical", status: DeviceAssignmentStatus.ACTIVE }],
    },
    {
      udi: "UDI-HT-0001",
      name: "HealthTech Analyzer",
      modelNumber: "HT-A900",
      deviceClass: DeviceClass.III,
      registrationStatus: DeviceRegistrationStatus.REGISTERED,
      manufacturerSlug: "healthtech-labs",
      notes: "Calibration due Q4",
      assignments: [{ facilitySlug: "central-valley-hospital", status: DeviceAssignmentStatus.ACTIVE }],
    },
    {
      udi: "UDI-HT-0002",
      name: "HealthTech Imaging Suite",
      modelNumber: "HT-IM-80",
      deviceClass: DeviceClass.III,
      registrationStatus: DeviceRegistrationStatus.SUSPENDED,
      manufacturerSlug: "healthtech-labs",
      notes: "Investigating recall",
      assignments: [],
    },
    {
      udi: "UDI-REG-0003",
      name: "Regnova Vital Patch",
      modelNumber: "RV-15",
      deviceClass: DeviceClass.I,
      registrationStatus: DeviceRegistrationStatus.REGISTERED,
      manufacturerSlug: "regnova-medical",
      notes: "Wearable patch for continuous monitoring",
      assignments: [{ facilitySlug: "northview-hospital", status: DeviceAssignmentStatus.ACTIVE }],
    },
  ];

  for (const device of devices) {
    const manufacturerId = manufacturerBySlug.get(device.manufacturerSlug);
    if (!manufacturerId) continue;

    const created = await prisma.device.upsert({
      where: { udi: device.udi },
      update: {
        name: device.name,
        modelNumber: device.modelNumber ?? null,
        deviceClass: device.deviceClass,
        registrationStatus: device.registrationStatus,
        notes: device.notes ?? null,
        manufacturerId,
      },
      create: {
        udi: device.udi,
        name: device.name,
        modelNumber: device.modelNumber ?? null,
        deviceClass: device.deviceClass,
        registrationStatus: device.registrationStatus,
        notes: device.notes ?? null,
        manufacturerId,
      },
    });

    if (device.assignments && device.assignments.length > 0) {
      for (const assignment of device.assignments) {
        const facilityId = facilityBySlug.get(assignment.facilitySlug);
        if (!facilityId) continue;

        await prisma.deviceAssignment.upsert({
          where: {
            deviceId_facilityId: {
              deviceId: created.id,
              facilityId,
            },
          },
          update: {
            status: assignment.status,
          },
          create: {
            deviceId: created.id,
            facilityId,
            status: assignment.status,
          },
        });
      }
    }
  }

  const pmsVisits = [
    {
      facilitySlug: "central-valley-hospital",
      organization: "Central Valley Hospital",
      visitDate: new Date("2025-08-15"),
      notes: "Quarterly surveillance review; documentation updated.",
      attachments: ["CVH_PMS_Report_Aug2025.pdf"],
    },
    {
      facilitySlug: "northview-hospital",
      organization: "Northview Hospital",
      visitDate: new Date("2025-07-10"),
      notes: "Follow-up on infusion pump corrective actions; all closed.",
      attachments: ["Northview_Followup_July2025.pdf"],
    },
    {
      facilitySlug: "st-marys-medical",
      organization: "St. Mary's Medical Center",
      visitDate: new Date("2025-06-28"),
      notes: "Initial onboarding visit; staff training completed.",
      attachments: [],
    },
    {
      facilitySlug: "central-valley-hospital",
      organization: "Central Valley Hospital",
      visitDate: new Date("2025-09-05"),
      notes: "Unscheduled audit after device suspension; corrective plan drafted.",
      attachments: ["CVH_Audit_Sept2025.pdf"],
    },
  ];

  for (const visit of pmsVisits) {
    const facilityId = facilityBySlug.get(visit.facilitySlug) ?? null;
    await prisma.pmsVisit.upsert({
      where: {
        organization_visitDate: {
          organization: visit.organization,
          visitDate: visit.visitDate,
        },
      },
      update: {
        facilityId,
        notes: visit.notes,
        attachments: visit.attachments,
      },
      create: {
        facilityId,
        organization: visit.organization,
        visitDate: visit.visitDate,
        notes: visit.notes,
        attachments: visit.attachments,
      },
    });
  }

  console.log("Seed data applied successfully.");
}

main()
  .catch((error) => {
    console.error("Failed to seed database", error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
