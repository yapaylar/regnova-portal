import { NextResponse } from "next/server";

import { requireAdminUser } from "@/lib/auth/guards";
import { toHttpError, createErrorResponse } from "@/lib/http/errors";
import { fetchAdminDeviceList, createAdminDevice } from "@/lib/admin/data-access";
import { adminDevicesQuerySchema, adminDevicesCreateSchema } from "@/lib/admin/schemas";

export const runtime = "nodejs";

export async function GET(request: Request) {
  try {
    await requireAdminUser();

    const url = new URL(request.url);
    const params = Object.fromEntries(url.searchParams.entries());
    const query = adminDevicesQuerySchema.parse(params);

    const data = await fetchAdminDeviceList(
      {
        manufacturerId: query.manufacturerId,
        facilityId: query.facilityId,
        registrationStatus: query.registrationStatus,
        class: query.class,
        search: query.search,
      },
      { page: query.page, pageSize: query.pageSize },
    );

    return NextResponse.json(data);
  } catch (error) {
    const httpError = toHttpError(error);
    return NextResponse.json(createErrorResponse(httpError), { status: httpError.status });
  }
}

export async function POST(request: Request) {
  try {
    const adminUser = await requireAdminUser();
    const body = await request.json();
    const payload = adminDevicesCreateSchema.parse(body);

    const { device } = await createAdminDevice(
      {
        name: payload.name,
        modelNumber: payload.modelNumber ?? null,
        manufacturerId: payload.manufacturerId,
        udi: payload.udi ?? null,
        deviceClass: payload.deviceClass,
        registrationStatus: payload.registrationStatus,
        notes: payload.notes ?? null,
        assignments: payload.assignments?.map((assignment) => ({
          facilityId: assignment.facilityId,
          status: assignment.status,
          notes: assignment.notes ?? null,
        })),
      },
      adminUser.id,
    );

    return NextResponse.json({
      device: {
        id: device.id,
        name: device.name,
        modelNumber: device.modelNumber,
        udi: device.udi,
        deviceClass: device.deviceClass,
        registrationStatus: device.registrationStatus,
        notes: device.notes,
        createdAt: device.createdAt,
        updatedAt: device.updatedAt,
        manufacturer: device.manufacturer,
        assignments: device.assignments,
      },
    }, { status: 201 });
  } catch (error) {
    const httpError = toHttpError(error);
    return NextResponse.json(createErrorResponse(httpError), { status: httpError.status });
  }
}


