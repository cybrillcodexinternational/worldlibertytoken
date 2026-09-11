import { NextResponse } from "next/server";
import { getUserBySessionToken, SESSION_COOKIE } from "@/lib/auth";
import { startMiningSession } from "@/lib/mining";

export async function POST(request) {
  try {
    const token = request.cookies.get(SESSION_COOKIE)?.value;
    if (!token) {
      return NextResponse.json({ success: false, message: "Unauthorized." }, { status: 401 });
    }

    const user = await getUserBySessionToken(token);
    if (!user) {
      return NextResponse.json({ success: false, message: "Unauthorized." }, { status: 401 });
    }

    const result = await startMiningSession(user.id);
    if (!result.ok) {
      return NextResponse.json({ success: false, message: result.message }, { status: result.code });
    }

    return NextResponse.json({
      success: true,
      message: "Mining cycle started. It will run for 24 hours.",
      ...result,
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: "Unable to start mining.", error: error.message },
      { status: 500 }
    );
  }
}
