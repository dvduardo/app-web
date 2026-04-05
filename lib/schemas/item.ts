import { z } from "zod";

function normalizeString(value: unknown) {
  return typeof value === "string" ? value.trim() : value;
}

function normalizeNullableString(value: unknown) {
  if (value === undefined || value === null) {
    return null;
  }

  if (typeof value !== "string") {
    return value;
  }

  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
}

function normalizeCustomData(value: unknown) {
  if (typeof value === "string") {
    try {
      return JSON.parse(value);
    } catch {
      return value;
    }
  }

  return value ?? {};
}

function normalizeBoolean(value: unknown) {
  if (typeof value === "boolean") {
    return value;
  }

  if (typeof value === "string") {
    const normalized = value.trim().toLowerCase();
    if (normalized === "true") {
      return true;
    }
    if (normalized === "false") {
      return false;
    }
  }

  return value;
}

export const itemStatusValues = ["owned", "wishlist", "loaned"] as const;
export const itemStatusSchema = z.enum(itemStatusValues, {
  error: "Status inválido",
});

export const itemSchema = z.object({
  categoryId: z.preprocess(
    normalizeString,
    z.string().min(1, "Categoria é obrigatória")
  ),
  title: z.preprocess(
    normalizeString,
    z.string().min(1, "Título é obrigatório")
  ),
  description: z.preprocess(normalizeNullableString, z.string().nullable()).default(null),
  status: z.preprocess(
    normalizeString,
    itemStatusSchema.default("owned")
  ),
  isFavorite: z.preprocess(normalizeBoolean, z.boolean().default(false)),
  customData: z.preprocess(
    normalizeCustomData,
    z.record(z.string(), z.string()).default({})
  ),
});

export const itemUpdateSchema = z
  .object({
    categoryId: z.preprocess(
      normalizeString,
      z.string().min(1, "Categoria é obrigatória")
    ).optional(),
    title: z.preprocess(
      normalizeString,
      z.string().min(1, "Título é obrigatório")
    ).optional(),
    description: z.preprocess(normalizeNullableString, z.string().nullable()).optional(),
    status: z.preprocess(normalizeString, itemStatusSchema).optional(),
    isFavorite: z.preprocess(normalizeBoolean, z.boolean()).optional(),
    customData: z.preprocess(
      normalizeCustomData,
      z.record(z.string(), z.string())
    ).optional(),
  })
  .refine((data) => Object.keys(data).length > 0, {
    message: "Nenhum campo para atualizar foi enviado",
  });

export const customFieldSchema = z.object({
  fieldName: z.preprocess(
    normalizeString,
    z.string().min(1, "Nome do campo é obrigatório")
  ),
  fieldType: z.preprocess(
    normalizeString,
    z.string().min(1).default("text")
  ),
});

export const deleteCustomFieldSchema = z.object({
  fieldId: z.preprocess(
    normalizeString,
    z.string().min(1, "Field ID is required")
  ),
});

export const categorySchema = z.object({
  name: z.preprocess(
    normalizeString,
    z.string().min(1, "Nome da categoria é obrigatório")
  ),
});

export type ItemFormInput = z.infer<typeof itemSchema>;
export type ItemUpdateInput = z.infer<typeof itemUpdateSchema>;
export type CustomFieldInput = z.infer<typeof customFieldSchema>;
export type CategoryInput = z.infer<typeof categorySchema>;
