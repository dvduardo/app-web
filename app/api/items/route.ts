import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/server/db/prisma";
import { requireUser } from "@/server/auth/require-user";
import { parseItemInput } from "@/server/validation/items";
import { logRequest, logRequestError } from "@/server/logging/request";

const ITEMS_PER_PAGE = 12;
export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const startedAt = Date.now();
  try {
    const auth = await requireUser();
    if (auth.response) {
      logRequest(req, startedAt, auth.response);
      return auth.response;
    }

    const searchParams = req.nextUrl.searchParams;
    const search = searchParams.get("search") || "";
    const categoryId = searchParams.get("categoryId") || "";
    const page = Math.max(1, parseInt(searchParams.get("page") ?? "1", 10));
    const limit = Math.min(50, Math.max(1, parseInt(searchParams.get("limit") ?? String(ITEMS_PER_PAGE), 10)));

    const where = {
      userId: auth.user.userId,
      deletedAt: null,
      ...(categoryId && { categoryId }),
      ...(search && {
        OR: [
          { title: { contains: search, mode: "insensitive" as const } },
          { description: { contains: search, mode: "insensitive" as const } },
        ],
      }),
    };

    const [items, totalCount] = await prisma.$transaction([
      prisma.item.findMany({
        where,
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
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.item.count({ where }),
    ]);

    const totalPages = Math.ceil(totalCount / limit);
    const response = NextResponse.json(
      { items, totalCount, totalPages, page, limit, search, categoryId },
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
    const input = parseItemInput(body);

    if (!input) {
      const response = NextResponse.json(
        { error: "Categoria e título são obrigatórios" },
        { status: 400 }
      );
      logRequest(req, startedAt, response, { userId: auth.user.userId });
      return response;
    }

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

    const item = await prisma.item.create({
      data: {
        userId: auth.user.userId,
        categoryId: input.categoryId,
        title: input.title,
        description: input.description,
        customData: JSON.stringify(input.customData),
      },
      include: {
        category: {
          select: {
            id: true,
            name: true,
          },
        },
        photos: true,
      },
    });

    const response = NextResponse.json({ item }, { status: 201 });
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
