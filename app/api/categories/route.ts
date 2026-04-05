import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/server/db/prisma";
import { requireUser } from "@/server/auth/require-user";
import { getOrCreateCategoryByName } from "@/server/data/categories";
import { parseCategoryInput } from "@/server/validation/items";
import { logRequest, logRequestError } from "@/server/logging/request";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const startedAt = Date.now();
  try {
    const auth = await requireUser();
    if (auth.response) {
      logRequest(req, startedAt, auth.response);
      return auth.response;
    }

    const categories = await prisma.category.findMany({
      where: { userId: auth.user.userId },
      include: {
        items: {
          where: { deletedAt: null },
          select: { id: true },
        },
      },
      orderBy: { name: "asc" },
    });

    const response = NextResponse.json(
      {
        categories: categories.map((category) => ({
          id: category.id,
          name: category.name,
          itemCount: category.items.length,
        })),
      },
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

export async function POST(req: NextRequest) {
  const startedAt = Date.now();
  try {
    const auth = await requireUser();
    if (auth.response) {
      logRequest(req, startedAt, auth.response);
      return auth.response;
    }

    const body = await req.json();
    const input = parseCategoryInput(body);

    if (!input) {
      const response = NextResponse.json(
        { error: "Nome da categoria é obrigatório" },
        { status: 400 }
      );
      logRequest(req, startedAt, response, { userId: auth.user.userId });
      return response;
    }

    const category = await getOrCreateCategoryByName(auth.user.userId, input.name);

    const response = NextResponse.json(
      {
        category: {
          id: category.id,
          name: category.name,
          itemCount: 0,
        },
      },
      { status: 201 }
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
