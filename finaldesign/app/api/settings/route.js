import { NextResponse } from "next/server";
import { getUserBySessionToken, SESSION_COOKIE } from "@/lib/auth";
import { updateSettings } from "@/lib/settings";

export async function POST(request) {
  try {
    const token = request.cookies.get(SESSION_COOKIE)?.value;
    if (!token) {
      return NextResponse.json({ message: "Sign in required." }, { status: 401 });
    }

    const user = await getUserBySessionToken(token);
    if (!user) {
      return NextResponse.json({ message: "Sign in required." }, { status: 401 });
    }

    const body = await request.json();
    const result = await updateSettings(user.id, token, body);
    if (!result.ok) {
      return NextResponse.json({ message: result.message }, { status: result.code || 400 });
    }
    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json(
      { message: "Could not update settings.", error: error.message },
      { status: 500 }
    );
  }
}
