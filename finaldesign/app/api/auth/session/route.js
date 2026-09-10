import { NextResponse } from "next/server";
import { ensureAuthSchema, getUserBySessionToken, SESSION_COOKIE } from "@/lib/auth";

export async function GET(request) {
  await ensureAuthSchema();

  const token = request.cookies.get(SESSION_COOKIE)?.value;
  if (!token) {
    return NextResponse.json({ authenticated: false });
  }

  const user = await getUserBySessionToken(token);
  if (!user) {
    return NextResponse.json({ authenticated: false });
  }

  return NextResponse.json({
    authenticated: true,
    user: {
      id: user.id,
      fullName: user.full_name,
      email: user.email,
      role: user.role,
    },
  });
}
