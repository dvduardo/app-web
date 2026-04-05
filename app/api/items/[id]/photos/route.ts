import { NextRequest, NextResponse } from "next/server";
import { requireUser } from "@/server/auth/require-user";
import { prisma } from "@/server/db/prisma";
import {
  ALLOWED_ITEM_PHOTO_TYPES,
  MAX_ITEM_PHOTO_BYTES,
  MAX_ITEM_PHOTO_COUNT,
} from "@/lib/photo-upload";
import { logRequest, logRequestError } from "@/server/logging/request";

const allowedImageMimeTypes = new Set<string>(ALLOWED_ITEM_PHOTO_TYPES);

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const startedAt = Date.now();
  try {
    const auth = await requireUser();
    if (auth.response) {
      logRequest(req, startedAt, auth.response);
      return auth.response;
    }

    const { id } = await params;
    const formData = await req.formData();
    const file = formData.get("photo") as File;

    if (!file) {
      const response = NextResponse.json(
        { error: "No file provided" },
        { status: 400 }
      );
      logRequest(req, startedAt, response, { userId: auth.user.userId });
      return response;
    }

    if (!allowedImageMimeTypes.has(file.type)) {
      const response = NextResponse.json(
        { error: "Unsupported file type. Use JPEG, PNG, WEBP, or GIF." },
        { status: 400 }
      );
      logRequest(req, startedAt, response, { userId: auth.user.userId });
      return response;
    }

    if (file.size > MAX_ITEM_PHOTO_BYTES) {
      const response = NextResponse.json(
        { error: `File too large. Maximum size is ${Math.floor(MAX_ITEM_PHOTO_BYTES / (1024 * 1024))}MB.` },
        { status: 400 }
      );
      logRequest(req, startedAt, response, { userId: auth.user.userId });
      return response;
    }

    const item = await prisma.item.findFirst({
      where: {
        id,
        userId: auth.user.userId,
        deletedAt: null,
      },
    });
    if (!item) {
      const response = NextResponse.json({ error: "Item not found" }, { status: 404 });
      logRequest(req, startedAt, response, { userId: auth.user.userId });
      return response;
    }

    // Convert file to base64
    const buffer = await file.arrayBuffer();
    const base64 = Buffer.from(buffer).toString("base64");
    const mimeType = file.type;

    // Get the current order count for this item
    const photoCount = await prisma.photo.count({
      where: { itemId: id },
    });

    // Check if we already have 2 photos
    if (photoCount >= MAX_ITEM_PHOTO_COUNT) {
      const response = NextResponse.json(
        { error: "Maximum 2 photos allowed per item" },
        { status: 400 }
      );
      logRequest(req, startedAt, response, { userId: auth.user.userId });
      return response;
    }

    const photo = await prisma.photo.create({
      data: {
        itemId: id,
        data: base64,
        mimeType,
        order: photoCount,
      },
    });

    const response = NextResponse.json({ photo }, { status: 201 });
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
