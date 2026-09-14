import { NextResponse } from "next/server";
import { getUserBySessionToken, IMPERSONATOR_COOKIE, SESSION_COOKIE } from "@/lib/auth";
import {
  blockUser,
  cookieOptions,
  deleteUserAccount,
  listAdminUsers,
  resetUserAccount,
  resetUserPassword,
  revokeUserSessions,
  setUserRole,
  startImpersonation,
  unblockUser,
} from "@/lib/admin-users";

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
  return { user, token };
}

export async function GET(request) {
  try {
    const auth = await requireAdmin(request);
    if (auth.error) {
      return auth.error;
    }

    const { searchParams } = request.nextUrl;
    const result = await listAdminUsers({
      q: searchParams.get("q") || "",
      status: searchParams.get("status") || "all",
      role: searchParams.get("role") || "all",
      page: Number(searchParams.get("page") || 1),
    });
    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json(
      { message: "Could not load users.", error: error.message },
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
    const userId = Number(body.userId || 0);
    let result;

    if (action === "block") {
      result = await blockUser(auth.user.id, userId, body.reason);
    } else if (action === "unblock") {
      result = await unblockUser(auth.user.id, userId);
    } else if (action === "delete") {
      result = await deleteUserAccount(auth.user.id, userId);
    } else if (action === "resetPassword") {
      result = await resetUserPassword(auth.user.id, userId, body.password);
    } else if (action === "resetAccount") {
      result = await resetUserAccount(auth.user.id, userId);
    } else if (action === "revokeSessions") {
      result = await revokeUserSessions(auth.user.id, userId);
    } else if (action === "setRole") {
      result = await setUserRole(auth.user.id, userId, body.role);
    } else if (action === "impersonate") {
      result = await startImpersonation(auth.user.id, userId);
      if (!result.ok) {
        return NextResponse.json({ message: result.message }, { status: result.code || 400 });
      }
      const response = NextResponse.json({
        ok: true,
        message: result.message,
        redirectTo: result.redirectTo,
      });
      response.cookies.set(SESSION_COOKIE, result.session.token, cookieOptions(result.session.maxAge));
      response.cookies.set(IMPERSONATOR_COOKIE, auth.token, cookieOptions(30 * 24 * 60 * 60));
      return response;
    } else {
      return NextResponse.json({ message: "Unknown action." }, { status: 400 });
    }

    if (!result?.ok) {
      return NextResponse.json({ message: result?.message || "Action failed." }, { status: result?.code || 400 });
    }
    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json(
      { message: "Could not update user.", error: error.message },
      { status: 500 }
    );
  }
}
