import { NextRequest, NextResponse } from "next/server";
import { requireUser } from "@/server/auth/require-user";
import { prisma } from "@/server/db/prisma";
import { parseItemInput } from "@/server/validation/items";

export async function POST(req: NextRequest) {
  try {
    const auth = await requireUser();
    if (auth.response) {
      return auth.response;
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

    for (const rawItem of items) {
      const item = parseItemInput(rawItem);
      if (!item) continue;

      const photos =
        rawItem && typeof rawItem === "object" && Array.isArray(rawItem.photos)
          ? rawItem.photos
          : [];

      const created = await prisma.item.create({
        data: {
          userId: auth.user.userId,
          title: item.title,
          description: item.description,
          customData: JSON.stringify(item.customData),
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
