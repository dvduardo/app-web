import {
  customFieldSchema,
  deleteCustomFieldSchema,
  importedItemSchema,
  itemSchema,
  itemUpdateSchema,
} from "@/lib/schemas/item";

export type ItemInput = typeof itemSchema._output;
export type ItemUpdateInput = typeof itemUpdateSchema._output;
export type CustomFieldInput = typeof customFieldSchema._output;

export function parseItemInput(body: unknown): ItemInput | null {
  const result = itemSchema.safeParse(body);
  return result.success ? result.data : null;
}

export function parseItemUpdateInput(body: unknown): ItemUpdateInput | null {
  const result = itemUpdateSchema.safeParse(body);
  return result.success ? result.data : null;
}

export function parseCustomFieldInput(body: unknown): CustomFieldInput | null {
  const result = customFieldSchema.safeParse(body);
  return result.success ? result.data : null;
}

export function parseDeleteCustomFieldInput(body: unknown) {
  const result = deleteCustomFieldSchema.safeParse(body);
  return result.success ? result.data : null;
}

export function parseImportedItem(body: unknown) {
  const result = importedItemSchema.safeParse(body);
  return result.success ? result.data : null;
}
