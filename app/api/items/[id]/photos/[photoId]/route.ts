import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/app/lib/auth";
import { prisma } from "@/app/lib/prisma";

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string; photoId: string }> }
) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id, photoId } = await params;

    const item = await prisma.item.findUnique({ where: { id } });
    if (!item || item.userId !== user.userId) {
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
