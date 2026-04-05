export interface ItemInput {
  title: string;
  description: string | null;
  customData: Record<string, string>;
}

export interface ItemUpdateInput {
  title?: string;
  description?: string | null;
  customData?: Record<string, string>;
}

export interface CustomFieldInput {
  fieldName: string;
  fieldType: string;
}

export function parseItemInput(body: unknown): ItemInput | null {
  if (!body || typeof body !== "object") {
    return null;
  }

  const { title, description, customData } = body as {
    title?: unknown;
    description?: unknown;
    customData?: unknown;
  };

  if (typeof title !== "string" || !title.trim()) {
    return null;
  }

  return {
    title: title.trim(),
    description: typeof description === "string" ? description : null,
    customData: isRecordOfStrings(customData) ? customData : {},
  };
}

export function parseItemUpdateInput(body: unknown): ItemUpdateInput | null {
  if (!body || typeof body !== "object") {
    return null;
  }

  const { title, description, customData } = body as {
    title?: unknown;
    description?: unknown;
    customData?: unknown;
  };

  if (title !== undefined && typeof title !== "string") {
    return null;
  }

  if (description !== undefined && description !== null && typeof description !== "string") {
    return null;
  }

  if (customData !== undefined && !isRecordOfStrings(customData)) {
    return null;
  }

  return {
    ...(typeof title === "string" ? { title: title.trim() } : {}),
    ...(description !== undefined ? { description: description ?? null } : {}),
    ...(customData !== undefined ? { customData } : {}),
  };
}

export function parseCustomFieldInput(body: unknown): CustomFieldInput | null {
  if (!body || typeof body !== "object") {
    return null;
  }

  const { fieldName, fieldType } = body as {
    fieldName?: unknown;
    fieldType?: unknown;
  };

  if (typeof fieldName !== "string" || !fieldName.trim()) {
    return null;
  }

  return {
    fieldName: fieldName.trim(),
    fieldType:
      typeof fieldType === "string" && fieldType.trim() ? fieldType : "text",
  };
}

function isRecordOfStrings(value: unknown): value is Record<string, string> {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return false;
  }

  return Object.values(value).every((entry) => typeof entry === "string");
}
