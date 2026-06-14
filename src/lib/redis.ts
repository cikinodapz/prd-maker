import { Redis } from '@upstash/redis';
import { Ratelimit } from '@upstash/ratelimit';

// Create a new redis client using the environment variables
// It will automatically pick up UPSTASH_REDIS_REST_URL and UPSTASH_REDIS_REST_TOKEN
export const redis = Redis.fromEnv();

// Create a new ratelimiter for Guest Users (by IP address)
// Limit: 1 request per day (24 hours)
export const guestRatelimit = new Ratelimit({
  redis: redis,
  limiter: Ratelimit.slidingWindow(1, '24 h'),
  analytics: true,
  prefix: '@upstash/ratelimit/guest',
});

// Create a new ratelimiter for Logged-in Free Users (by User ID)
// Limit: 3 requests per day (24 hours)
export const freeUserRatelimit = new Ratelimit({
  redis: redis,
  limiter: Ratelimit.slidingWindow(3, '24 h'),
  analytics: true,
  prefix: '@upstash/ratelimit/free_user',
});
