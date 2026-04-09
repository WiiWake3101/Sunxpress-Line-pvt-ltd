/**
 * Rate Limiting Middleware
 * Prevents spam and abuse
 */

const rateLimitStore = new Map();

export const checkRateLimit = (ip, endpoint, maxRequests = 5, windowMinutes = 60) => {
  const key = `${ip}:${endpoint}`;
  const now = Date.now();
  const windowMs = windowMinutes * 60 * 1000;

  let record = rateLimitStore.get(key);

  // Create new record if doesn't exist
  if (!record) {
    rateLimitStore.set(key, {
      count: 1,
      firstRequest: now,
    });
    return { allowed: true, remaining: maxRequests - 1, retryAfter: null };
  }

  // Check if window has expired
  if (now - record.firstRequest > windowMs) {
    // Reset window
    rateLimitStore.set(key, {
      count: 1,
      firstRequest: now,
    });
    return { allowed: true, remaining: maxRequests - 1, retryAfter: null };
  }

  // Increment counter
  record.count++;

  // Check if limit exceeded
  if (record.count > maxRequests) {
    const retryAfter = Math.ceil((record.firstRequest + windowMs - now) / 1000);
    return { allowed: false, remaining: 0, retryAfter };
  }

  return {
    allowed: true,
    remaining: maxRequests - record.count,
    retryAfter: null,
  };
};

// Clean up old entries periodically
setInterval(() => {
  const now = Date.now();
  const windowMs = 60 * 60 * 1000; // 1 hour

  for (const [key, record] of rateLimitStore.entries()) {
    if (now - record.firstRequest > windowMs) {
      rateLimitStore.delete(key);
    }
  }
}, 5 * 60 * 1000); // Cleanup every 5 minutes
