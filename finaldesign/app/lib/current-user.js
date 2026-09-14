import "server-only";
import { cookies } from "next/headers";
import { getUserBySessionToken, IMPERSONATOR_COOKIE, SESSION_COOKIE } from "@/lib/auth";

export async function getCurrentUser() {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE)?.value;

  if (!token) {
    return null;
  }

  const user = await getUserBySessionToken(token);
  if (!user) {
    return null;
  }

  const adminToken = cookieStore.get(IMPERSONATOR_COOKIE)?.value;
  if (adminToken && adminToken !== token) {
    const impersonator = await getUserBySessionToken(adminToken);
    if (impersonator?.role === "admin") {
      user.impersonator = {
        id: impersonator.id,
        full_name: impersonator.full_name,
        email: impersonator.email,
      };
    }
  }

  return user;
}
