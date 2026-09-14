import { NextResponse } from "next/server";
import {
  deleteSessionByToken,
  getUserBySessionToken,
  IMPERSONATOR_COOKIE,
  SESSION_COOKIE,
} from "@/lib/auth";
import { cookieOptions } from "@/lib/admin-users";

export async function POST(request) {
  try {
    const adminToken = request.cookies.get(IMPERSONATOR_COOKIE)?.value;
    const currentToken = request.cookies.get(SESSION_COOKIE)?.value;

    if (!adminToken) {
      return NextResponse.json({ message: "Not impersonating." }, { status: 400 });
    }

    const admin = await getUserBySessionToken(adminToken);
    if (!admin || admin.role !== "admin") {
      return NextResponse.json({ message: "Admin session expired. Sign in again." }, { status: 401 });
    }

    if (currentToken && currentToken !== adminToken) {
      await deleteSessionByToken(currentToken);
    }

    const response = NextResponse.json({
      ok: true,
      message: "Returned to admin panel.",
      redirectTo: "/admin/users",
    });
    response.cookies.set(SESSION_COOKIE, adminToken, cookieOptions(30 * 24 * 60 * 60));
    response.cookies.set(IMPERSONATOR_COOKIE, "", cookieOptions(0));
    return response;
  } catch (error) {
    return NextResponse.json(
      { message: "Could not return to admin.", error: error.message },
      { status: 500 }
    );
  }
}
