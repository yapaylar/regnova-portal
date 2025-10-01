import { HttpError } from "@/lib/http/errors";
import { getSessionUser } from "@/lib/auth/session";

export async function requireAuthenticatedUser() {
  const user = await getSessionUser();
  if (!user) {
    throw new HttpError({ code: "UNAUTHORIZED", message: "Authentication required", status: 401 });
  }
  return user;
}

export async function requireAdminUser() {
  const user = await requireAuthenticatedUser();
  if (user.profileType !== "admin") {
    throw new HttpError({ code: "FORBIDDEN", message: "Admin access required", status: 403 });
  }
  return user;
}


