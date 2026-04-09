import { FastifyInstance } from "fastify";
import os from "os";

export async function healthRoutes(app: FastifyInstance) {
  app.get("/health", async (req, reply) => {
    return reply.status(200).send({
      status: "healthy",
      timestamp: new Date().toISOString(),
      uptime: Math.floor(process.uptime()),
    });
  });
}
