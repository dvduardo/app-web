import { NextRequest, NextResponse } from "next/server";
import { requireUser } from "@/backend/auth/require-user";
import { prisma } from "@/backend/db/prisma";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const auth = await requireUser();
    if (auth.response) {
      return auth.response;
    }

    const { id } = await params;
    const formData = await req.formData();
    const file = formData.get("photo") as File;

    if (!file) {
      return NextResponse.json(
        { error: "No file provided" },
        { status: 400 }
      );
    }

    const item = await prisma.item.findUnique({ where: { id } });
    if (!item || item.userId !== auth.user.userId) {
      return NextResponse.json({ error: "Item not found" }, { status: 404 });
    }

    // Convert file to base64
    const buffer = await file.arrayBuffer();
    const base64 = Buffer.from(buffer).toString("base64");
    const mimeType = file.type || "image/jpeg";

    // Get the current order count for this item
    const photoCount = await prisma.photo.count({
      where: { itemId: id },
    });

    // Check if we already have 2 photos
    if (photoCount >= 2) {
      return NextResponse.json(
        { error: "Maximum 2 photos allowed per item" },
        { status: 400 }
      );
    }

    const photo = await prisma.photo.create({
      data: {
        itemId: id,
        data: base64,
        mimeType,
        order: photoCount,
      },
    });

    return NextResponse.json({ photo }, { status: 201 });
  } catch (error) {
    console.error("Error uploading photo:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
