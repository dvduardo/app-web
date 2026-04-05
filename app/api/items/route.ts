import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/server/db/prisma";
import { requireUser } from "@/server/auth/require-user";
import { parseItemInput } from "@/server/validation/items";

export async function GET(req: NextRequest) {
  try {
    const auth = await requireUser();
    if (auth.response) {
      return auth.response;
    }

    const searchParams = req.nextUrl.searchParams;
    const search = searchParams.get("search") || "";

    const items = await prisma.item.findMany({
      where: {
        userId: auth.user.userId,
        ...(search && {
          OR: [
            { title: { contains: search } },
            { description: { contains: search } },
          ],
        }),
      },
      include: {
        photos: {
          orderBy: { order: "asc" },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ items }, { status: 200 });
  } catch (error) {
    console.error("Error fetching items:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const auth = await requireUser();
    if (auth.response) {
      return auth.response;
    }

    const body = await req.json();
    const input = parseItemInput(body);

    if (!input) {
      return NextResponse.json(
        { error: "Title is required" },
        { status: 400 }
      );
    }

    const item = await prisma.item.create({
      data: {
        userId: auth.user.userId,
        title: input.title,
        description: input.description,
        customData: JSON.stringify(input.customData),
      },
      include: {
        photos: true,
      },
    });

    return NextResponse.json({ item }, { status: 201 });
  } catch (error) {
    console.error("Error creating item:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
