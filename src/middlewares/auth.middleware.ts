import { FastifyRequest, FastifyReply } from "fastify";
import { RequestWithToken } from "../types/auth.types";
import { config } from "../config/env";

export async function authMiddleware(
  request: FastifyRequest,
  reply: FastifyReply
) {
  const expectedToken = config.auth.verifyToken;

  if (!expectedToken) {
    return;
  }

  let receivedToken: string | undefined;

  receivedToken = request.headers['x-verify-token'] as string;

  if (!receivedToken && request.body && typeof request.body === 'object') {
    receivedToken = (request.body as RequestWithToken).token;
  }

  if (!receivedToken) {
    return reply.status(403).send({
      error: "Unauthorized",
    });
  }

  if (receivedToken !== expectedToken) {
    return reply.status(403).send({
      error: "Unauthorized",
    });
  }
}
