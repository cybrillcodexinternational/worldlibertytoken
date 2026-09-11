import { NextResponse } from "next/server";
import { getUserBySessionToken, SESSION_COOKIE } from "@/lib/auth";
import { getAdminReferralOverview, getReferralStatus } from "@/lib/referral";
import { getAdminPresaleOverview, getPresaleStatus } from "@/lib/presale";

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

    const status = await getReferralStatus(user.id);
    const presale = await getPresaleStatus(user.id);
    const payload = { ...status, role: user.role, presale };

    if (user.role === "admin") {
      payload.admin = await getAdminReferralOverview();
      payload.adminPresale = await getAdminPresaleOverview();
    }

    return NextResponse.json(payload);
  } catch (error) {
    return NextResponse.json(
      { message: "Could not load referral network.", error: error.message },
      { status: 500 }
    );
  }
}
