import { firestore } from './firebase-admin';

interface RateLimitResult {
  success: boolean;
  limit: number;
  reset: number;
}

export async function rateLimit(
  identifier: string,
  maxAttempts: number,
  windowSeconds: number
): Promise<RateLimitResult> {
  const rateLimitRef = firestore.collection('rate_limits').doc(identifier);

  // Run in transaction to ensure accuracy
  const result = await firestore.runTransaction(async (transaction) => {
    const doc = await transaction.get(rateLimitRef);
    const now = Date.now();

    if (!doc.exists) {
      // First attempt
      transaction.set(rateLimitRef, {
        attempts: 1,
        firstAttempt: now,
        lastAttempt: now
      });
      return {
        success: true,
        limit: maxAttempts,
        reset: now + (windowSeconds * 1000)
      };
    }

    const data = doc.data()!;
    const windowStart = data.firstAttempt;
    const windowEnd = windowStart + (windowSeconds * 1000);

    if (now > windowEnd) {
      // Window has expired, reset counter
      transaction.set(rateLimitRef, {
        attempts: 1,
        firstAttempt: now,
        lastAttempt: now
      });
      return {
        success: true,
        limit: maxAttempts,
        reset: now + (windowSeconds * 1000)
      };
    }

    if (data.attempts >= maxAttempts) {
      // Rate limit exceeded
      return {
        success: false,
        limit: maxAttempts,
        reset: windowEnd
      };
    }

    // Increment attempt counter
    transaction.update(rateLimitRef, {
      attempts: data.attempts + 1,
      lastAttempt: now
    });

    return {
      success: true,
      limit: maxAttempts,
      reset: windowEnd
    };
  });

  return result;
}
