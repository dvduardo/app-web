import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/server/db/prisma";
import { hashPassword, verifyPassword } from "@/server/security/password";
import { getAuthenticatedUser } from "@/server/auth/get-authenticated-user";
import { addCorsHeaders, handleCorsPreFlight } from "@/server/http/cors";
import { logRequest, logRequestError } from "@/server/logging/request";

export async function OPTIONS(req: NextRequest) {
  return handleCorsPreFlight(req.headers.get("origin"));
}

export async function PATCH(req: NextRequest) {
  const startedAt = Date.now();
  try {
    const authUser = await getAuthenticatedUser();
    if (!authUser) {
      const response = addCorsHeaders(
        NextResponse.json({ error: "Unauthorized" }, { status: 401 }),
        req.headers.get("origin")
      );
      logRequest(req, startedAt, response);
      return response;
    }

    const body = await req.json();
    const { currentPassword, newPassword } = body as {
      currentPassword?: string;
      newPassword?: string;
    };

    if (!newPassword || newPassword.length < 6) {
      const response = addCorsHeaders(
        NextResponse.json(
          { error: "Nova senha deve ter no mínimo 6 caracteres" },
          { status: 400 }
        ),
        req.headers.get("origin")
      );
      logRequest(req, startedAt, response);
      return response;
    }

    const user = await prisma.user.findUnique({
      where: { id: authUser.userId },
      select: { id: true, password: true },
    });

    if (!user) {
      const response = addCorsHeaders(
        NextResponse.json({ error: "Usuário não encontrado" }, { status: 404 }),
        req.headers.get("origin")
      );
      logRequest(req, startedAt, response);
      return response;
    }

    // Se o usuário já tem senha, exige confirmação da senha atual
    if (user.password !== null) {
      if (!currentPassword) {
        const response = addCorsHeaders(
          NextResponse.json(
            { error: "Senha atual é obrigatória" },
            { status: 400 }
          ),
          req.headers.get("origin")
        );
        logRequest(req, startedAt, response);
        return response;
      }

      const isValid = await verifyPassword(currentPassword, user.password);
      if (!isValid) {
        const response = addCorsHeaders(
          NextResponse.json(
            { error: "Senha atual incorreta" },
            { status: 400 }
          ),
          req.headers.get("origin")
        );
        logRequest(req, startedAt, response, { userId: user.id });
        return response;
      }
    }

    const hashed = await hashPassword(newPassword);

    await prisma.user.update({
      where: { id: user.id },
      data: { password: hashed },
    });

    const response = addCorsHeaders(
      NextResponse.json({ success: true }, { status: 200 }),
      req.headers.get("origin")
    );
    logRequest(req, startedAt, response, { userId: user.id });
    return response;
  } catch (error) {
    logRequestError(req, startedAt, error);
    const response = addCorsHeaders(
      NextResponse.json({ error: "Internal server error" }, { status: 500 }),
      req.headers.get("origin")
    );
    logRequest(req, startedAt, response);
    return response;
  }
}
