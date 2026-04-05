import { NextRequest, NextResponse } from "next/server";
import { requireUser } from "@/server/auth/require-user";
import { prisma } from "@/server/db/prisma";
import { logRequest, logRequestError } from "@/server/logging/request";

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string; photoId: string }> }
) {
  const startedAt = Date.now();
  try {
    const auth = await requireUser();
    if (auth.response) {
      logRequest(req, startedAt, auth.response);
      return auth.response;
    }

    const { id, photoId } = await params;

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

    const photo = await prisma.photo.findUnique({ where: { id: photoId } });
    if (!photo || photo.itemId !== id) {
      const response = NextResponse.json({ error: "Photo not found" }, { status: 404 });
      logRequest(req, startedAt, response, { userId: auth.user.userId });
      return response;
    }

    await prisma.photo.delete({ where: { id: photoId } });

    const response = NextResponse.json({ message: "Photo deleted" }, { status: 200 });
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
