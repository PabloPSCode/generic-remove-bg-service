export interface FastifyMultipartError extends Error {
  code?: string;
  statusCode?: number;
}
