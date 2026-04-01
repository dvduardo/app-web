import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/app/lib/auth";
import { prisma } from "@/app/lib/prisma";

export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { items } = body;

    if (!Array.isArray(items)) {
      return NextResponse.json(
        { error: "Items must be an array" },
        { status: 400 }
      );
    }

    let importedCount = 0;

    for (const item of items) {
      const { title, description, customData, photos } = item;

      if (!title) continue;

      const created = await prisma.item.create({
        data: {
          userId: user.userId,
          title,
          description: description || null,
          customData: customData ? JSON.stringify(customData) : "{}",
        },
      });

      if (Array.isArray(photos)) {
        for (const photo of photos) {
          if (photo.data) {
            await prisma.photo.create({
              data: {
                itemId: created.id,
                data: photo.data,
                mimeType: photo.mimeType || "image/jpeg",
                order: photo.order || 0,
              },
            });
          }
        }
      }

      importedCount++;
    }

    return NextResponse.json(
      { message: `Imported ${importedCount} items`, importedCount },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error importing items:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
