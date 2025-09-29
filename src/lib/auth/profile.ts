import crypto from "node:crypto";

type ResolveProfileParams = {
  profileType: "admin" | "facility" | "manufacturer";
  organization: string;
  metadata?: Record<string, unknown>;
};

type ProfileResult = {
  organization: string;
  facilityConnectId?: string | null;
  manufacturerConnectId?: string | null;
  createFacility?: { slug: string; name: string } | null;
  createManufacturer?: { slug: string; name: string } | null;
};

export function resolveProfile({ profileType, organization, metadata }: ResolveProfileParams): ProfileResult {
  const trimmedOrg = organization.trim();

  if (profileType === "admin") {
    return {
      organization: trimmedOrg,
      facilityConnectId: null,
      manufacturerConnectId: null,
      createFacility: null,
      createManufacturer: null,
    };
  }

  if (profileType === "facility") {
    const facilityId = metadata?.facilityId;
    const facilitySlug = metadata?.facilitySlug ?? generateSlug(trimmedOrg);

    if (typeof facilityId === "string" && facilityId.length > 0) {
      return {
        organization: trimmedOrg,
        facilityConnectId: facilityId,
        manufacturerConnectId: null,
        createFacility: null,
        createManufacturer: null,
      };
    }

    return {
      organization: trimmedOrg,
      facilityConnectId: null,
      manufacturerConnectId: null,
      createFacility: {
        name: trimmedOrg,
        slug: facilitySlug,
      },
      createManufacturer: null,
    };
  }

  const manufacturerId = metadata?.manufacturerId;
  const manufacturerSlug = metadata?.manufacturerSlug ?? generateSlug(trimmedOrg);

  if (typeof manufacturerId === "string" && manufacturerId.length > 0) {
    return {
      organization: trimmedOrg,
      facilityConnectId: null,
      manufacturerConnectId: manufacturerId,
      createFacility: null,
      createManufacturer: null,
    };
  }

  return {
    organization: trimmedOrg,
    facilityConnectId: null,
    manufacturerConnectId: null,
    createFacility: null,
    createManufacturer: {
      name: trimmedOrg,
      slug: manufacturerSlug,
    },
  };
}

function slugifyBase(value: string) {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function generateSlug(value: unknown) {
  const base = typeof value === "string" ? slugifyBase(value) : "";
  const segment = base.length > 0 ? base : randomSegment();
  return `${segment}-${randomSegment()}`;
}

function randomSegment() {
  return crypto.randomBytes(4).toString("hex");
}

