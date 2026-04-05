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
    const status = searchParams.get("status") || "";
    const favoritesOnly = searchParams.get("favoritesOnly") === "true";
    const page = Math.max(1, parseInt(searchParams.get("page") ?? "1", 10));
    const limit = Math.min(50, Math.max(1, parseInt(searchParams.get("limit") ?? String(ITEMS_PER_PAGE), 10)));

    const where = {
      userId: auth.user.userId,
      deletedAt: null,
      ...(categoryId && { categoryId }),
      ...(status && { status }),
      ...(favoritesOnly && { isFavorite: true }),
      ...(search && {
        OR: [
          { title: { contains: search } },
          { description: { contains: search } },
        ],
      }),
    };

    const statsWhere = {
      userId: auth.user.userId,
      deletedAt: null,
    };

    const [items, totalCount, totalItems, favoriteItems, wishlistItems, ownedItems, loanedItems] = await prisma.$transaction([
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
      prisma.item.count({ where: statsWhere }),
      prisma.item.count({ where: { ...statsWhere, isFavorite: true } }),
      prisma.item.count({ where: { ...statsWhere, status: "wishlist" } }),
      prisma.item.count({ where: { ...statsWhere, status: "owned" } }),
      prisma.item.count({ where: { ...statsWhere, status: "loaned" } }),
    ]);

    const totalPages = Math.ceil(totalCount / limit);
    const response = NextResponse.json(
      {
        items,
        totalCount,
        totalPages,
        page,
        limit,
        search,
        categoryId,
        status,
        favoritesOnly,
        stats: {
          totalItems,
          favoriteItems,
          wishlistItems,
          ownedItems,
          loanedItems,
        },
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
        status: input.status,
        isFavorite: input.isFavorite,
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
