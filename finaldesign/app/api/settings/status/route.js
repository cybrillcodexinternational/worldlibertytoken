import { NextResponse } from "next/server";
import { getUserBySessionToken, SESSION_COOKIE } from "@/lib/auth";
import { getSettingsStatus } from "@/lib/settings";

export async function GET(request) {
  try {
    const token = request.cookies.get(SESSION_COOKIE)?.value;
    if (!token) {
      return NextResponse.json({ message: "Sign in required." }, { status: 401 });
    }

    const user = await getUserBySessionToken(token);
    if (!user) {
      return NextResponse.json({ message: "Sign in required." }, { status: 401 });
    }

    const status = await getSettingsStatus(user.id, token);
    if (!status.ok) {
      return NextResponse.json({ message: status.message }, { status: status.code || 400 });
    }
    return NextResponse.json(status);
  } catch (error) {
    return NextResponse.json(
      { message: "Could not load settings.", error: error.message },
      { status: 500 }
    );
  }
}
