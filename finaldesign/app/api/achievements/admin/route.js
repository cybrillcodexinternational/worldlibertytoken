import { NextResponse } from "next/server";
import { getUserBySessionToken, SESSION_COOKIE } from "@/lib/auth";
import {
  deleteAchievementBadge,
  getAdminAchievementOverview,
  saveAchievementBadge,
} from "@/lib/achievements";

async function requireAdmin(request) {
  const token = request.cookies.get(SESSION_COOKIE)?.value;
  if (!token) {
    return { error: NextResponse.json({ message: "Sign in required." }, { status: 401 }) };
  }
  const user = await getUserBySessionToken(token);
  if (!user) {
    return { error: NextResponse.json({ message: "Sign in required." }, { status: 401 }) };
  }
  if (user.role !== "admin") {
    return { error: NextResponse.json({ message: "Admin access required." }, { status: 403 }) };
  }
  return { user };
}

export async function GET(request) {
  try {
    const auth = await requireAdmin(request);
    if (auth.error) {
      return auth.error;
    }
    return NextResponse.json(await getAdminAchievementOverview());
  } catch (error) {
    return NextResponse.json(
      { message: "Could not load achievement admin.", error: error.message },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  try {
    const auth = await requireAdmin(request);
    if (auth.error) {
      return auth.error;
    }

    const body = await request.json();
    if (body.action === "delete") {
      return NextResponse.json(await deleteAchievementBadge(body.id));
    }
    return NextResponse.json(await saveAchievementBadge(body));
  } catch (error) {
    return NextResponse.json(
      { message: "Achievement admin action failed.", error: error.message },
      { status: 500 }
    );
  }
}
