import fastify from "fastify";
import cors from "@fastify/cors";
import { healthRoutes } from "./routes/health.routes";
import { imagesRoutes } from "./routes/images.routes";
import multipart from "@fastify/multipart";
import rateLimit from "@fastify/rate-limit";
import { rateLimitConfig } from "./middlewares/rate-limit.middleware";
import { config } from "./config/env";

export const app = fastify({
  logger: true,
  requestTimeout: config.server.requestTimeout,
  bodyLimit: config.server.bodyLimit
});

app.register(cors, {
  origin: true,
  credentials: true,
});

app.register(healthRoutes);

app.register(rateLimit, rateLimitConfig);

app.register(multipart, {
  limits: {
    fileSize: config.upload.maxFileSize,
    files: 1,
  },
});

app.setErrorHandler((error, request, reply) => {
  if (error.statusCode === 413 || error.code === 'FST_REQ_FILE_TOO_LARGE') {
    return reply.status(413).send({
      error: "File Too Large",
    });
  }

  if (error.statusCode === 429) {
    return reply.status(429).send({
      error: "Rate Limit Exceeded",
    });
  }

  app.log.error(error);
  return reply.status(500).send({
    error: "Internal Server Error",
  });
});

app.register(imagesRoutes);
