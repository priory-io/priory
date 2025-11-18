import { NextRequest, NextResponse } from "next/server";

const rateLimitStore = new Map<
  string,
  { requests: number[]; blockedUntil?: number }
>();

setInterval(() => {
  const now = Date.now();
  for (const [key, data] of rateLimitStore.entries()) {
    data.requests = data.requests.filter((time) => now - time < 3600000);

    if (
      data.requests.length === 0 &&
      (!data.blockedUntil || data.blockedUntil < now)
    ) {
      rateLimitStore.delete(key);
    }
  }
}, 300000);

export interface RateLimitConfig {
  windowMs: number;
  maxRequests: number;
  blockDurationMs?: number;
  keyGenerator?: (request: NextRequest) => string;
}

export const defaultRateLimitConfigs = {
  auth: {
    windowMs: 15 * 60 * 1000,
    maxRequests: 5,
    blockDurationMs: 60 * 60 * 1000,
  },
  fileUpload: {
    windowMs: 60 * 1000,
    maxRequests: 10,
    blockDurationMs: 5 * 60 * 1000,
  },
  api: {
    windowMs: 60 * 1000,
    maxRequests: 30,
    blockDurationMs: 5 * 60 * 1000,
  },
  shortlinkCreate: {
    windowMs: 60 * 1000,
    maxRequests: 20,
    blockDurationMs: 5 * 60 * 1000,
  },
  analytics: {
    windowMs: 60 * 1000,
    maxRequests: 60,
    blockDurationMs: 5 * 60 * 1000,
  },
  inviteValidation: {
    windowMs: 15 * 60 * 1000,
    maxRequests: 20,
    blockDurationMs: 60 * 60 * 1000,
  },
};

export function getClientIp(request: NextRequest): string {
  const forwardedFor = request.headers.get("x-forwarded-for");
  if (forwardedFor) {
    return forwardedFor.split(",")[0]!.trim();
  }

  const realIp = request.headers.get("x-real-ip");
  if (realIp) {
    return realIp;
  }

  return "unknown";
}

export function checkRateLimit(
  key: string,
  config: RateLimitConfig,
): {
  allowed: boolean;
  remaining: number;
  resetTime: number;
  retryAfter?: number;
} {
  const now = Date.now();
  let data = rateLimitStore.get(key);

  if (!data) {
    data = { requests: [] };
    rateLimitStore.set(key, data);
  }

  if (data.blockedUntil && data.blockedUntil > now) {
    const retryAfter = Math.ceil((data.blockedUntil - now) / 1000);
    return {
      allowed: false,
      remaining: 0,
      resetTime: data.blockedUntil,
      retryAfter,
    };
  }

  const windowStart = now - config.windowMs;
  data.requests = data.requests.filter((time) => time > windowStart);

  if (data.requests.length >= config.maxRequests) {
    const blockDuration = config.blockDurationMs || config.windowMs;
    data.blockedUntil = now + blockDuration;

    const retryAfter = Math.ceil(blockDuration / 1000);
    return {
      allowed: false,
      remaining: 0,
      resetTime: data.blockedUntil,
      retryAfter,
    };
  }

  data.requests.push(now);
  const remaining = Math.max(0, config.maxRequests - data.requests.length);

  return {
    allowed: true,
    remaining,
    resetTime: windowStart + config.windowMs,
  };
}

export async function withRateLimit(
  request: NextRequest,
  config: RateLimitConfig,
  keyOverride?: string,
): Promise<NextResponse | null> {
  const key =
    keyOverride ||
    (config.keyGenerator ? config.keyGenerator(request) : getClientIp(request));
  const result = checkRateLimit(key, config);

  const headers = new Headers({
    "X-RateLimit-Limit": String(config.maxRequests),
    "X-RateLimit-Remaining": String(result.remaining),
    "X-RateLimit-Reset": String(Math.ceil(result.resetTime / 1000)),
  });

  if (!result.allowed) {
    if (result.retryAfter) {
      headers.set("Retry-After", String(result.retryAfter));
    }

    return new NextResponse(
      JSON.stringify({
        error: "Rate limit exceeded",
        retryAfter: result.retryAfter,
      }),
      {
        status: 429,
        headers,
      },
    );
  }

  return null;
}

export function getRateLimitHeaders(
  key: string,
  config: RateLimitConfig,
): Record<string, string> {
  const result = checkRateLimit(key, config);

  const headers: Record<string, string> = {
    "X-RateLimit-Limit": String(config.maxRequests),
    "X-RateLimit-Remaining": String(result.remaining),
    "X-RateLimit-Reset": String(Math.ceil(result.resetTime / 1000)),
  };

  if (result.retryAfter) {
    headers["Retry-After"] = String(result.retryAfter);
  }

  return headers;
}

export function resetRateLimit(key: string): void {
  rateLimitStore.delete(key);
}

export function getRateLimitStatus(key: string, config: RateLimitConfig) {
  const data = rateLimitStore.get(key);

  if (!data) {
    return {
      requests: 0,
      maxRequests: config.maxRequests,
      isBlocked: false,
    };
  }

  const now = Date.now();
  const windowStart = now - config.windowMs;
  const recentRequests = data.requests.filter((time) => time > windowStart);
  const isBlocked = data.blockedUntil ? data.blockedUntil > now : false;

  return {
    requests: recentRequests.length,
    maxRequests: config.maxRequests,
    isBlocked,
    blockedUntil: data.blockedUntil,
  };
}
