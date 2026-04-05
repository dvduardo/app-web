import { NextRequest, NextResponse } from "next/server";
import { requireUser } from "@/server/auth/require-user";
import { prisma } from "@/server/db/prisma";
import { parseImportedItem } from "@/server/validation/items";
import { logRequest, logRequestError } from "@/server/logging/request";

export async function POST(req: NextRequest) {
  const startedAt = Date.now();
  try {
    const auth = await requireUser();
    if (auth.response) {
      logRequest(req, startedAt, auth.response);
      return auth.response;
    }

    const body = await req.json();
    const { items } = body;

    if (!Array.isArray(items)) {
      const response = NextResponse.json(
        { error: "Items must be an array" },
        { status: 400 }
      );
      logRequest(req, startedAt, response, { userId: auth.user.userId });
      return response;
    }

    let importedCount = 0;

    for (const rawItem of items) {
      const item = parseImportedItem(rawItem);
      if (!item) continue;

      const created = await prisma.item.create({
        data: {
          userId: auth.user.userId,
          title: item.title,
          description: item.description,
          customData: JSON.stringify(item.customData),
        },
      });

      for (const photo of item.photos) {
        await prisma.photo.create({
          data: {
            itemId: created.id,
            data: photo.data,
            mimeType: photo.mimeType,
            order: photo.order,
          },
        });
      }

      importedCount++;
    }

    const response = NextResponse.json(
      { message: `Imported ${importedCount} items`, importedCount },
      { status: 200 }
    );
    logRequest(req, startedAt, response, { userId: auth.user.userId });
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
