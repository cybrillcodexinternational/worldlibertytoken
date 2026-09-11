import { NextResponse } from "next/server";
import { getUserBySessionToken, SESSION_COOKIE } from "@/lib/auth";
import { getMiningStatus } from "@/lib/mining";

export async function GET(request) {
  try {
    const token = request.cookies.get(SESSION_COOKIE)?.value;
    if (!token) {
      return NextResponse.json({ success: false, message: "Unauthorized." }, { status: 401 });
    }

    const user = await getUserBySessionToken(token);
    if (!user) {
      return NextResponse.json({ success: false, message: "Unauthorized." }, { status: 401 });
    }

    const status = await getMiningStatus(user.id);
    return NextResponse.json({ success: true, ...status });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: "Unable to load mining status.", error: error.message },
      { status: 500 }
    );
  }
}
