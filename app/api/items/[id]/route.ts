import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/server/db/prisma";
import { requireUser } from "@/server/auth/require-user";
import {
  parseItemUpdateInput,
} from "@/server/validation/items";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const auth = await requireUser();
    if (auth.response) {
      return auth.response;
    }

    const { id } = await params;

    const item = await prisma.item.findUnique({
      where: { id },
      include: {
        photos: {
          orderBy: { order: "asc" },
        },
      },
    });

    if (!item || item.userId !== auth.user.userId) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    return NextResponse.json({ item }, { status: 200 });
  } catch (error) {
    console.error("Error fetching item:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const auth = await requireUser();
    if (auth.response) {
      return auth.response;
    }

    const { id } = await params;
    const body = await req.json();
    const input = parseItemUpdateInput(body);

    if (!input) {
      return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
    }

    const item = await prisma.item.findUnique({ where: { id } });
    if (!item || item.userId !== auth.user.userId) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    const updated = await prisma.item.update({
      where: { id },
      data: {
        title: input.title ?? item.title,
        description:
          input.description !== undefined ? input.description : item.description,
        customData:
          input.customData !== undefined
            ? JSON.stringify(input.customData)
            : item.customData,
      },
      include: {
        photos: {
          orderBy: { order: "asc" },
        },
      },
    });

    return NextResponse.json({ item: updated }, { status: 200 });
  } catch (error) {
    console.error("Error updating item:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const auth = await requireUser();
    if (auth.response) {
      return auth.response;
    }

    const { id } = await params;

    const item = await prisma.item.findUnique({ where: { id } });
    if (!item || item.userId !== auth.user.userId) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    await prisma.item.delete({ where: { id } });

    return NextResponse.json({ message: "Item deleted" }, { status: 200 });
  } catch (error) {
    console.error("Error deleting item:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
