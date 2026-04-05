import { NextResponse } from "next/server";
import { getCurrentUser } from "@/backend/auth/jwt";
import { prisma } from "@/backend/db/prisma";

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const items = await prisma.item.findMany({
      where: { userId: user.userId },
      include: {
        photos: {
          orderBy: { order: "asc" },
        },
      },
    });

    const jsonData = JSON.stringify(items, null, 2);
    return new NextResponse(jsonData, {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        "Content-Disposition": 'attachment; filename="collection.json"',
      },
    });
  } catch (error) {
    console.error("Error exporting items:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
