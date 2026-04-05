import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/server/db/prisma";
import { requireUser } from "@/server/auth/require-user";
import {
  parseCustomFieldInput,
  parseDeleteCustomFieldInput,
} from "@/server/validation/items";
import { logRequest, logRequestError } from "@/server/logging/request";

export async function GET(req: NextRequest) {
  const startedAt = Date.now();
  try {
    const auth = await requireUser();
    if (auth.response) {
      logRequest(req, startedAt, auth.response);
      return auth.response;
    }

    const customFields = await prisma.customField.findMany({
      where: { userId: auth.user.userId },
      orderBy: { createdAt: "asc" },
    });

    const response = NextResponse.json({ customFields }, { status: 200 });
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
    const input = parseCustomFieldInput(body);

    if (!input) {
      const response = NextResponse.json(
        { error: "Field name is required" },
        { status: 400 }
      );
      logRequest(req, startedAt, response, { userId: auth.user.userId });
      return response;
    }

    // Check if field already exists
    const existing = await prisma.customField.findUnique({
      where: {
        userId_fieldName: {
          userId: auth.user.userId,
          fieldName: input.fieldName,
        },
      },
    });

    if (existing) {
      const response = NextResponse.json(
        { error: "Field already exists" },
        { status: 409 }
      );
      logRequest(req, startedAt, response, { userId: auth.user.userId });
      return response;
    }

    const customField = await prisma.customField.create({
      data: {
        userId: auth.user.userId,
        fieldName: input.fieldName,
        fieldType: input.fieldType,
      },
    });

    const response = NextResponse.json({ customField }, { status: 201 });
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

export async function DELETE(req: NextRequest) {
  const startedAt = Date.now();
  try {
    const auth = await requireUser();
    if (auth.response) {
      logRequest(req, startedAt, auth.response);
      return auth.response;
    }

    const body = await req.json();
    const input = parseDeleteCustomFieldInput(body);

    if (!input) {
      const response = NextResponse.json(
        { error: "Field ID is required" },
        { status: 400 }
      );
      logRequest(req, startedAt, response, { userId: auth.user.userId });
      return response;
    }

    // Verify field belongs to user
    const customField = await prisma.customField.findUnique({
      where: { id: input.fieldId },
    });

    if (!customField || customField.userId !== auth.user.userId) {
      const response = NextResponse.json(
        { error: "Field not found or unauthorized" },
        { status: 404 }
      );
      logRequest(req, startedAt, response, { userId: auth.user.userId });
      return response;
    }

    await prisma.customField.delete({
      where: { id: input.fieldId },
    });

    const response = NextResponse.json({ success: true }, { status: 200 });
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
