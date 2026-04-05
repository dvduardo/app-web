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

export const itemSchema = z.object({
  title: z.preprocess(
    normalizeString,
    z.string().min(1, "Título é obrigatório")
  ),
  description: z.preprocess(normalizeNullableString, z.string().nullable()).default(null),
  customData: z.preprocess(
    normalizeCustomData,
    z.record(z.string(), z.string()).default({})
  ),
});

export const itemUpdateSchema = z
  .object({
    title: z.preprocess(
      normalizeString,
      z.string().min(1, "Título é obrigatório")
    ).optional(),
    description: z.preprocess(normalizeNullableString, z.string().nullable()).optional(),
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

export const photoImportSchema = z.object({
  data: z.string().min(1),
  mimeType: z.string().min(1).default("image/jpeg"),
  order: z.number().int().nonnegative().default(0),
});

export const importedItemSchema = itemSchema.extend({
  photos: z.array(photoImportSchema).max(2).optional().default([]),
});

export type ItemFormInput = z.infer<typeof itemSchema>;
export type ItemUpdateInput = z.infer<typeof itemUpdateSchema>;
export type CustomFieldInput = z.infer<typeof customFieldSchema>;
