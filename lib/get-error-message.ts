import axios from "axios";

function translateApiMessage(message: string): string {
  const normalizedMessage = message.trim().toLowerCase();

  switch (normalizedMessage) {
    case "invalid credentials":
      return "Email ou senha incorretos.";
    case "internal server error":
      return "Erro interno do servidor. Tente novamente.";
    case "invalid payload":
      return "Dados inválidos. Revise as informações enviadas.";
    case "email and password are required":
      return "Email e senha são obrigatórios.";
    default:
      return message;
  }
}

export function getErrorMessage(
  error: unknown,
  fallbackMessage: string
): string {
  if (axios.isAxiosError(error)) {
    if (error.response?.status === 413) {
      return "A foto é grande demais para upload. Use uma imagem de até 4MB.";
    }

    const apiMessage = error.response?.data?.error;
    if (typeof apiMessage === "string" && apiMessage.trim()) {
      return translateApiMessage(apiMessage);
    }
  }

  if (error instanceof Error && error.message.trim()) {
    return translateApiMessage(error.message);
  }

  return fallbackMessage;
}
