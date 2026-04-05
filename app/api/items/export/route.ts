import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/server/auth/jwt";
import { prisma } from "@/server/db/prisma";
import { logRequest, logRequestError } from "@/server/logging/request";

export async function GET(req: NextRequest) {
  const startedAt = Date.now();
  try {
    const user = await getCurrentUser();
    if (!user) {
      const response = NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      logRequest(req, startedAt, response);
      return response;
    }

    const items = await prisma.item.findMany({
      where: {
        userId: user.userId,
        deletedAt: null,
      },
      include: {
        category: {
          select: {
            id: true,
            name: true,
          },
        },
        photos: {
          orderBy: { order: "asc" },
        },
      },
    });

    const exportItems = items.map((item) => ({
      ...item,
      categoryName: item.category?.name ?? null,
    }));

    const jsonData = JSON.stringify(exportItems, null, 2);
    const response = new NextResponse(jsonData, {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        "Content-Disposition": 'attachment; filename="collection.json"',
      },
    });
    logRequest(req, startedAt, response, { userId: user.userId });
    return response;
  } catch (error) {
    logRequestError(req, startedAt, error);
    const response = NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
    logRequest(req, startedAt, response);
    return response;
  }
}
