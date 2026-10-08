type RateLimitOptions = {
  windowMs: number;
  max: number;
};

// In-memory fallback (ephemeral in serverless, but better than nothing)
const store = new Map<string, { count: number; resetAt: number }>();

/**
 * A generic rate limiter structure designed to be easily swapped with Upstash Redis or Vercel KV.
 * Returns true if the request is ALLOWED, false if it is BLOCKED.
 */
export async function checkRateLimit(ip: string, action: string, options: RateLimitOptions): Promise<boolean> {
  const now = Date.now();
  const key = `${action}:${ip}`;

  // NOTE: To upgrade to Redis (Upstash/Vercel KV) in the future:
  // const data = await redis.get(key);
  // ... increment and expire logic using redis.incr and redis.pexpire

  const data = store.get(key);

  if (data && data.resetAt > now) {
    if (data.count >= options.max) {
      return false; // Blocked
    }
    data.count += 1;
    return true; // Allowed
  } else {
    store.set(key, { count: 1, resetAt: now + options.windowMs });
    return true; // Allowed
  }
}
