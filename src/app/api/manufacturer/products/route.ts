import { NextResponse } from "next/server";

import { requireManufacturerUser } from "@/lib/auth/guards";
import { toHttpError, createErrorResponse } from "@/lib/http/errors";
import { createManufacturerProduct, fetchManufacturerProductList } from "@/lib/manufacturer/data-access";
import { manufacturerProductCreateSchema, manufacturerProductQuerySchema } from "@/lib/manufacturer/schemas";
import { toPaginatedResponse } from "@/lib/http/response";

export const runtime = "nodejs";

export async function GET(request: Request) {
  try {
    const user = await requireManufacturerUser();
    const url = new URL(request.url);
    const params = Object.fromEntries(url.searchParams.entries());
    const query = manufacturerProductQuerySchema.parse(params);

    const data = await fetchManufacturerProductList(
      {
        manufacturerId: user.manufacturerId,
        search: query.search,
      },
      { page: query.page, pageSize: query.pageSize },
    );

    return NextResponse.json(toPaginatedResponse(data));
  } catch (error) {
    const httpError = toHttpError(error);
    return NextResponse.json(createErrorResponse(httpError), { status: httpError.status });
  }
}

export async function POST(request: Request) {
  try {
    const user = await requireManufacturerUser();
    const body = await request.json();
    const input = manufacturerProductCreateSchema.parse(body);

    const product = await createManufacturerProduct(user.manufacturerId, input);

    return NextResponse.json(product, { status: 201 });
  } catch (error) {
    const httpError = toHttpError(error);
    return NextResponse.json(createErrorResponse(httpError), { status: httpError.status });
  }
}

