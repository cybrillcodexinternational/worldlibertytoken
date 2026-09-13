import { NextResponse } from "next/server";
import { getUserBySessionToken, SESSION_COOKIE } from "@/lib/auth";
import {
  getAdminAirdropOverview,
  releaseAirdropNow,
  saveAirdropTiers,
  updateAirdropSettings,
} from "@/lib/airdrop";

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
    return NextResponse.json(await getAdminAirdropOverview());
  } catch (error) {
    return NextResponse.json(
      { message: "Could not load airdrop admin.", error: error.message },
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
    const action = String(body.action || "");

    if (action === "settings") {
      await updateAirdropSettings({
        solUsdRate: body.solUsdRate,
        saturdayHour: body.saturdayHour,
        autoRelease: body.autoRelease,
      });
      return NextResponse.json(await getAdminAirdropOverview());
    }

    if (action === "tiers") {
      const result = await saveAirdropTiers(body.tiers);
      if (!result.ok && result.code) {
        return NextResponse.json({ message: result.message }, { status: result.code });
      }
      return NextResponse.json(result);
    }

    if (action === "release") {
      const result = await releaseAirdropNow(body.eventId);
      if (!result.ok) {
        return NextResponse.json({ message: result.message }, { status: result.code || 400 });
      }
      return NextResponse.json({ ...result, ...(await getAdminAirdropOverview()) });
    }

    return NextResponse.json({ message: "Unknown action." }, { status: 400 });
  } catch (error) {
    return NextResponse.json(
      { message: "Airdrop admin action failed.", error: error.message },
      { status: 500 }
    );
  }
}
