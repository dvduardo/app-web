import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "./auth";

export async function withAuth(
  handler: (
    req: NextRequest,
    context: { userId: string }
  ) => Promise<NextResponse>
) {
  return async (req: NextRequest) => {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    return handler(req, { userId: user.userId });
  };
}
