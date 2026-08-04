import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

type LimitResult = { success: boolean; remaining?: number };

const memoryStore = new Map<string, { count: number; resetAt: number }>();

const redis =
  process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN
    ? new Redis({
        url: process.env.UPSTASH_REDIS_REST_URL,
        token: process.env.UPSTASH_REDIS_REST_TOKEN,
      })
    : null;

const upstashLimiter = redis ? new Ratelimit({ redis, limiter: Ratelimit.slidingWindow(8, "1 m") }) : null;

export function getClientIp(req: Request) {
  return req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "local";
}

export async function rateLimit(key: string, limit = 8, windowMs = 60_000): Promise<LimitResult> {
  if (upstashLimiter) {
    return upstashLimiter.limit(key);
  }

  const now = Date.now();
  const current = memoryStore.get(key);
  if (!current || current.resetAt <= now) {
    memoryStore.set(key, { count: 1, resetAt: now + windowMs });
    return { success: true, remaining: limit - 1 };
  }

  current.count += 1;
  return { success: current.count <= limit, remaining: Math.max(0, limit - current.count) };
}
