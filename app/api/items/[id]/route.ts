import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/server/db/prisma";
import { requireUser } from "@/server/auth/require-user";
import {
  parseItemUpdateInput,
} from "@/server/validation/items";
import { logRequest, logRequestError } from "@/server/logging/request";

export async function GET(
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

    const item = await prisma.item.findFirst({
      where: {
        id,
        userId: auth.user.userId,
        deletedAt: null,
      },
      include: {
        category: {
          select: {
            id: true,
            name: true,
          },
        },
        photos: {
          orderBy: { order: "asc" },
        },
      },
    });

    if (!item) {
      const response = NextResponse.json({ error: "Not found" }, { status: 404 });
      logRequest(req, startedAt, response, { userId: auth.user.userId });
      return response;
    }

    const response = NextResponse.json({ item }, { status: 200 });
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

export async function PUT(
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
    const body = await req.json();
    const input = parseItemUpdateInput(body);

    if (!input) {
      const response = NextResponse.json({ error: "Invalid payload" }, { status: 400 });
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
      const response = NextResponse.json({ error: "Not found" }, { status: 404 });
      logRequest(req, startedAt, response, { userId: auth.user.userId });
      return response;
    }

    if (input.categoryId !== undefined) {
      const category = await prisma.category.findFirst({
        where: {
          id: input.categoryId,
          userId: auth.user.userId,
        },
        select: { id: true },
      });

      if (!category) {
        const response = NextResponse.json(
          { error: "Categoria inválida" },
          { status: 400 }
        );
        logRequest(req, startedAt, response, { userId: auth.user.userId });
        return response;
      }
    }

    const updated = await prisma.item.update({
      where: { id },
      data: {
        categoryId: input.categoryId ?? item.categoryId,
        title: input.title ?? item.title,
        description:
          input.description !== undefined ? input.description : item.description,
        status: input.status ?? item.status,
        isFavorite: input.isFavorite ?? item.isFavorite,
        customData:
          input.customData !== undefined
            ? JSON.stringify(input.customData)
            : item.customData,
      },
      include: {
        category: {
          select: {
            id: true,
            name: true,
          },
        },
        photos: {
          orderBy: { order: "asc" },
        },
      },
    });

    const response = NextResponse.json({ item: updated }, { status: 200 });
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

export async function DELETE(
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

    const item = await prisma.item.findFirst({
      where: {
        id,
        userId: auth.user.userId,
        deletedAt: null,
      },
    });
    if (!item) {
      const response = NextResponse.json({ error: "Not found" }, { status: 404 });
      logRequest(req, startedAt, response, { userId: auth.user.userId });
      return response;
    }

    await prisma.item.update({
      where: { id },
      data: { deletedAt: new Date() },
    });

    const response = NextResponse.json({ message: "Item deleted" }, { status: 200 });
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
