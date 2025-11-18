import { NextRequest, NextResponse } from "next/server";

export interface RequestSizeLimitConfig {
  maxBodySize?: number;
  maxJsonSize?: number;
  maxFileSize?: number;
}

const DEFAULT_MAX_BODY_SIZE = 1 * 1024 * 1024;
const DEFAULT_MAX_JSON_SIZE = 1 * 1024 * 1024;
const DEFAULT_MAX_FILE_SIZE = 100 * 1024 * 1024;

export function checkRequestSize(
  request: NextRequest,
  config: RequestSizeLimitConfig = {},
): { allowed: boolean; error?: string } {
  const contentLength = request.headers.get("content-length");

  if (!contentLength) {
    return { allowed: true };
  }

  const size = parseInt(contentLength, 10);

  if (isNaN(size)) {
    return { allowed: true };
  }

  const contentType = request.headers.get("content-type") || "";

  if (contentType.includes("application/json")) {
    const maxSize = config.maxJsonSize || DEFAULT_MAX_JSON_SIZE;
    if (size > maxSize) {
      return {
        allowed: false,
        error: `JSON body exceeds maximum size of ${maxSize} bytes`,
      };
    }
  } else if (contentType.includes("multipart/form-data")) {
    const maxSize = config.maxFileSize || DEFAULT_MAX_FILE_SIZE;
    if (size > maxSize) {
      return {
        allowed: false,
        error: `File upload exceeds maximum size of ${maxSize} bytes`,
      };
    }
  } else {
    const maxSize = config.maxBodySize || DEFAULT_MAX_BODY_SIZE;
    if (size > maxSize) {
      return {
        allowed: false,
        error: `Request body exceeds maximum size of ${maxSize} bytes`,
      };
    }
  }

  return { allowed: true };
}

export function createSizeLimitResponse(
  maxSize: number,
  type: string = "request",
): NextResponse {
  return new NextResponse(
    JSON.stringify({
      error: `${type} exceeds maximum size of ${maxSize} bytes`,
    }),
    {
      status: 413,
      headers: {
        "Content-Type": "application/json",
      },
    },
  );
}
