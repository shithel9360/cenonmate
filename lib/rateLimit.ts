type RateLimitOptions = {
  windowMs: number;
  max: number;
};

// Known Limitation: This is an in-memory fallback limiter. 
// It is ephemeral in serverless environments and does not share state across distributed edge nodes.
// To achieve global, persistent rate limiting, integrate Upstash Redis or Vercel KV.
const store = new Map<string, { count: number; resetAt: number }>();

/**
 * Extracts a robust IP address, prioritizing headers set by trusted proxies (e.g. Vercel, Cloudflare).
 */
export function getClientIp(request: Request): string {
  // x-real-ip is typically set by Vercel / Nginx and cannot be easily spoofed by the client 
  // if the infrastructure overwrites it.
  const realIp = request.headers.get('x-real-ip');
  if (realIp) return realIp;

  const cfIp = request.headers.get('cf-connecting-ip');
  if (cfIp) return cfIp;

  const forwarded = request.headers.get('x-forwarded-for');
  if (forwarded) {
    // Return only the first (client) IP in the chain, safely split
    return forwarded.split(',')[0].trim();
  }

  return '127.0.0.1';
}

/**
 * Periodically cleans up expired entries to prevent memory leaks.
 */
function cleanupStore() {
  const now = Date.now();
  Array.from(store.entries()).forEach(([key, data]) => {
    if (data.resetAt <= now) {
      store.delete(key);
    }
  });
}

/**
 * A generic rate limiter structure.
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
    // Before setting a new one, occasionally clean up
    if (store.size > 1000) {
      cleanupStore();
    }
    store.set(key, { count: 1, resetAt: now + options.windowMs });
    return true; // Allowed
  }
}
