import { z } from "zod";

export const urlSchema = z
  .string()
  .url("Invalid URL")
  .max(2048, "URL too long");

export const emailSchema = z
  .string()
  .email("Invalid email")
  .max(254, "Email too long");

export const nameSchema = z
  .string()
  .min(1, "Name is required")
  .max(50, "Name must be at most 50 characters")
  .regex(
    /^[a-zA-Z0-9 _.-]+$/,
    "Name can only contain letters, numbers, spaces, and _ . -",
  );

export const shortCodeSchema = z
  .string()
  .min(1, "Short code is required")
  .max(128, "Short code too long")
  .regex(
    /^[a-zA-Z0-9_-]+$/,
    "Short code can only contain alphanumeric characters, hyphens, and underscores",
  );

export const titleSchema = z.string().max(200, "Title too long").optional();
export const descriptionSchema = z
  .string()
  .max(1000, "Description too long")
  .optional();

export const passwordSchema = z
  .string()
  .min(1, "Password is required")
  .max(128, "Password too long")
  .optional();

export const authPasswordSchema = z
  .string()
  .min(8, "Password must be at least 8 characters")
  .max(128, "Password too long");

export const filenameSchema = z
  .string()
  .min(1, "Filename is required")
  .max(255, "Filename too long");

export const shortlinkCreateSchema = z.preprocess(
  (data) => {
    if (typeof data === "object" && data !== null) {
      const obj = data as Record<string, unknown>;
      return {
        ...obj,
        customCode: obj["customCode"] === "" ? undefined : obj["customCode"],
        password: obj["password"] === "" ? undefined : obj["password"],
        title: obj["title"] === "" ? undefined : obj["title"],
        description: obj["description"] === "" ? undefined : obj["description"],
        expiresAt: obj["expiresAt"] === "" ? undefined : obj["expiresAt"],
      };
    }
    return data;
  },
  z.object({
    originalUrl: urlSchema,
    customCode: shortCodeSchema.optional(),
    title: titleSchema,
    description: descriptionSchema,
    password: passwordSchema.optional(),
    expiresAt: z.string().optional(),
  }),
);

export const accountUpdateSchema = z.object({
  name: nameSchema.optional(),
  email: emailSchema.optional(),
});

export const inviteValidationSchema = z.object({
  inviteCode: z
    .string()
    .min(1, "Invite code is required")
    .max(50, "Invite code too long"),
});

export const inviteConsumeSchema = z.object({
  inviteCode: z
    .string()
    .min(1, "Invite code is required")
    .max(50, "Invite code too long"),
  userId: z.string().min(1, "User ID is required"),
});

export function sanitizeString(
  input: string,
  maxLength: number = 1000,
): string {
  return input
    .slice(0, maxLength)
    .replace(/[<>"']/g, (char) => {
      const escapeMap: Record<string, string> = {
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#x27;",
      };
      return escapeMap[char] || char;
    })
    .trim();
}

export async function parseJsonBody<T>(
  request: Request,
  schema: z.ZodSchema<T>,
): Promise<T> {
  try {
    const body = await request.json();
    return schema.parse(body);
  } catch (error) {
    if (error instanceof z.ZodError) {
      throw new Error(
        `Validation error: ${error.issues.map((e) => e.message).join(", ")}`,
      );
    }
    throw new Error("Invalid JSON body");
  }
}

export function getQueryParam(
  url: URL,
  param: string,
  options?: {
    type?: "string" | "number" | "boolean";
    min?: number;
    max?: number;
    default?: string | number | boolean;
  },
): string | number | boolean | null {
  const value = url.searchParams.get(param);

  if (value === null) {
    return options?.default ?? null;
  }

  if (options?.type === "number") {
    const num = parseInt(value, 10);
    if (isNaN(num)) return options?.default ?? null;

    if (options?.min !== undefined && num < options.min) {
      return options.min;
    }
    if (options?.max !== undefined && num > options.max) {
      return options.max;
    }

    return num;
  }

  if (options?.type === "boolean") {
    return value === "true" || value === "1";
  }

  if (options?.max !== undefined && value.length > options.max) {
    return options?.default ?? null;
  }

  return value;
}

export function getPaginationParams(url: URL, maxLimit: number = 100) {
  const page = Math.max(
    1,
    (getQueryParam(url, "page", { type: "number", default: 1 }) as number) || 1,
  );
  const limit = Math.min(
    maxLimit,
    Math.max(
      1,
      (getQueryParam(url, "limit", {
        type: "number",
        default: 20,
      }) as number) || 20,
    ),
  );

  return { page, limit, offset: (page - 1) * limit };
}

export function validateFileMetadata(
  filename: string,
  size: number,
  mimeType: string,
  maxFileSize: number,
  allowedMimeTypes: string[],
): { valid: boolean; error?: string } {
  if (!filename || filename.length > 255) {
    return { valid: false, error: "Invalid filename" };
  }

  if (size > maxFileSize) {
    return {
      valid: false,
      error: `File exceeds maximum size of ${maxFileSize} bytes`,
    };
  }

  if (size < 1) {
    return { valid: false, error: "File size must be greater than 0" };
  }

  if (!allowedMimeTypes.includes(mimeType)) {
    return { valid: false, error: "File type not allowed" };
  }

  return { valid: true };
}

export function sanitizeFilename(filename: string): string {
  return (
    filename
      .replace(/\.\./g, "")
      .replace(/[/\\]/g, "")
      .replace(/^\.+/, "")
      .slice(0, 255)
      .trim() || "file"
  );
}
