import { z } from "zod";

const emailSchema = z
  .string()
  .trim()
  .min(1, "Email é obrigatório")
  .email("Email inválido");

const passwordSchema = z
  .string()
  .min(1, "Senha é obrigatória");

export const loginSchema = z.object({
  email: emailSchema,
  password: passwordSchema,
});

const registerSchemaBase = z.object({
  name: z.string().trim().min(1, "Nome é obrigatório"),
  email: emailSchema,
  password: passwordSchema.min(6, "Senha deve ter no mínimo 6 caracteres"),
  confirmPassword: z.string().min(1, "Confirmação de senha é obrigatória"),
});

export const registerSchema = registerSchemaBase
  .refine((data) => data.password === data.confirmPassword, {
    message: "As senhas não correspondem",
    path: ["confirmPassword"],
  });

export const registerServerSchema = registerSchemaBase.omit({
  confirmPassword: true,
});

const newPasswordSchema = z
  .string()
  .min(6, "Nova senha deve ter no mínimo 6 caracteres");

// Para usuários que já têm senha: exige confirmação da senha atual
export const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, "Senha atual é obrigatória"),
    newPassword: newPasswordSchema,
    confirmNewPassword: z.string().min(1, "Confirmação de senha é obrigatória"),
  })
  .refine((data) => data.newPassword === data.confirmNewPassword, {
    message: "As senhas não correspondem",
    path: ["confirmNewPassword"],
  });

// Para usuários OAuth que ainda não têm senha: apenas define uma nova
export const setPasswordSchema = z
  .object({
    newPassword: newPasswordSchema,
    confirmNewPassword: z.string().min(1, "Confirmação de senha é obrigatória"),
  })
  .refine((data) => data.newPassword === data.confirmNewPassword, {
    message: "As senhas não correspondem",
    path: ["confirmNewPassword"],
  });

export type LoginInput = z.infer<typeof loginSchema>;
export type RegisterInput = z.infer<typeof registerSchema>;
export type RegisterServerInput = z.infer<typeof registerServerSchema>;
export type ChangePasswordInput = z.infer<typeof changePasswordSchema>;
export type SetPasswordInput = z.infer<typeof setPasswordSchema>;
