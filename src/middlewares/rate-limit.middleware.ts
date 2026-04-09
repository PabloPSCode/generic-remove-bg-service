import { FastifyRequest } from "fastify";
import { config } from "../config/env";

export const rateLimitConfig = {
  max: config.rateLimit.max,
  timeWindow: config.rateLimit.timeWindow,
  cache: config.rateLimit.cache,
  allowList: [],
  redis: undefined,
  skipOnError: false,

  keyGenerator: (request: FastifyRequest) => {
    const forwardedFor = request.headers['x-forwarded-for'];

    if (forwardedFor) {
      const firstIp = Array.isArray(forwardedFor)
        ? forwardedFor[0]
        : forwardedFor.split(',')[0].trim();
      return firstIp;
    }

    const realIp = request.headers['x-real-ip'];
    if (realIp) {
      return Array.isArray(realIp) ? realIp[0] : realIp;
    }

    return request.ip;
  },

  errorResponseBuilder: () => {
    return {
      statusCode: 429,
      error: 'Rate Limit Exceeded',
    };
  },

  onExceeding: (request: FastifyRequest, key: string) => {
    request.log.warn({ ip: key, path: request.url }, 'Rate limit warning');
  },

  onExceeded: (request: FastifyRequest, key: string) => {
    request.log.warn({ ip: key, path: request.url }, 'Rate limit exceeded');
  }
};
