interface RateLimitConfig {
  windowMs: number;
  maxRequests: number;
}

const rateLimitStore = new Map<string, { count: number; resetTime: number }>();

export function rateLimit(identifier: string, config: RateLimitConfig): boolean {
  const now = Date.now();
  const record = rateLimitStore.get(identifier);

  if (!record || now > record.resetTime) {
    rateLimitStore.set(identifier, {
      count: 1,
      resetTime: now + config.windowMs,
    });
    return true;
  }

  if (record.count >= config.maxRequests) {
    return false;
  }

  record.count++;
  return true;
}

export function getRateLimitHeaders(identifier: string, config: RateLimitConfig) {
  const record = rateLimitStore.get(identifier);
  const remaining = record ? Math.max(0, config.maxRequests - record.count) : config.maxRequests;
  const resetTime = record ? Math.ceil(record.resetTime / 1000) : Math.ceil((Date.now() + config.windowMs) / 1000);

  return {
    'X-RateLimit-Limit': config.maxRequests.toString(),
    'X-RateLimit-Remaining': remaining.toString(),
    'X-RateLimit-Reset': resetTime.toString(),
  };
}

export function createRateLimitResponse() {
  return new Response(
    JSON.stringify({
      error: 'Too many requests',
      message: 'لقد تجاوزت الحد المسموح من الطلبات. يرجى المحاولة لاحقاً.',
    }),
    {
      status: 429,
      headers: {
        'Content-Type': 'application/json',
        'Retry-After': '60',
      },
    }
  );
}
