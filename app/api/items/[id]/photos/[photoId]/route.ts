import { NextRequest, NextResponse } from "next/server";
import { requireUser } from "@/backend/auth/require-user";
import { prisma } from "@/backend/db/prisma";

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string; photoId: string }> }
) {
  try {
    const auth = await requireUser();
    if (auth.response) {
      return auth.response;
    }

    const { id, photoId } = await params;

    const item = await prisma.item.findUnique({ where: { id } });
    if (!item || item.userId !== auth.user.userId) {
      return NextResponse.json({ error: "Item not found" }, { status: 404 });
    }

    const photo = await prisma.photo.findUnique({ where: { id: photoId } });
    if (!photo || photo.itemId !== id) {
      return NextResponse.json({ error: "Photo not found" }, { status: 404 });
    }

    await prisma.photo.delete({ where: { id: photoId } });

    return NextResponse.json({ message: "Photo deleted" }, { status: 200 });
  } catch (error) {
    console.error("Error deleting photo:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
