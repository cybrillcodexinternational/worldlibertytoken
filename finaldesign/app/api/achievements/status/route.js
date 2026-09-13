import { NextResponse } from "next/server";
import { getUserBySessionToken, SESSION_COOKIE } from "@/lib/auth";
import { getAchievementStatus } from "@/lib/achievements";

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

    return NextResponse.json(await getAchievementStatus(user.id));
  } catch (error) {
    return NextResponse.json(
      { message: "Could not load achievements.", error: error.message },
      { status: 500 }
    );
  }
}
