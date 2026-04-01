import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/app/lib/auth";
import { prisma } from "@/app/lib/prisma";

export async function GET(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const customFields = await prisma.customField.findMany({
      where: { userId: user.userId },
      orderBy: { createdAt: "asc" },
    });

    return NextResponse.json({ customFields }, { status: 200 });
  } catch (error) {
    console.error("Error fetching custom fields:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { fieldName, fieldType } = body;

    if (!fieldName) {
      return NextResponse.json(
        { error: "Field name is required" },
        { status: 400 }
      );
    }

    // Check if field already exists
    const existing = await prisma.customField.findUnique({
      where: {
        userId_fieldName: {
          userId: user.userId,
          fieldName,
        },
      },
    });

    if (existing) {
      return NextResponse.json(
        { error: "Field already exists" },
        { status: 409 }
      );
    }

    const customField = await prisma.customField.create({
      data: {
        userId: user.userId,
        fieldName,
        fieldType: fieldType || "text",
      },
    });

    return NextResponse.json({ customField }, { status: 201 });
  } catch (error) {
    console.error("Error creating custom field:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { fieldId } = body;

    if (!fieldId) {
      return NextResponse.json(
        { error: "Field ID is required" },
        { status: 400 }
      );
    }

    // Verify field belongs to user
    const customField = await prisma.customField.findUnique({
      where: { id: fieldId },
    });

    if (!customField || customField.userId !== user.userId) {
      return NextResponse.json(
        { error: "Field not found or unauthorized" },
        { status: 404 }
      );
    }

    await prisma.customField.delete({
      where: { id: fieldId },
    });

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error("Error deleting custom field:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
