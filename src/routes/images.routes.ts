import { FastifyInstance } from "fastify";
import { imageSchema } from "../schemas/images.schema";
import { BackgroundRemovalService } from "../services/background-removal.service";
import { authMiddleware } from "../middlewares/auth.middleware";
import { FastifyMultipartError } from "../types/fastify-errors";

const bgRemovalService = new BackgroundRemovalService();

export async function imagesRoutes(app: FastifyInstance) {
  app.post("/process", {
    preHandler: authMiddleware
  }, async (req, reply) => {
    try {
      if (req.isMultipart()) {
        const data = await req.file();

        if (!data) {
          return reply.status(400).send({ error: "No file uploaded" });
        }

        let fileBuffer;
        try {
          fileBuffer = await data.toBuffer();
        } catch (bufferError) {
          const error = bufferError as FastifyMultipartError;
          if (error.code === 'FST_REQ_FILE_TOO_LARGE' || error.statusCode === 413) {
            return reply.status(413).send({ error: "Image size must be 5MB or less" });
          }
          throw bufferError;
        }

        const result = await bgRemovalService.removeBackgroundFromBuffer(fileBuffer, req.log);

        return reply
          .header("Content-Type", "image/png")
          .header("Content-Disposition", "attachment; filename=image-no-bg.png")
          .header("X-Processing-Time", result.processingTime.toString())
          .send(result.buffer);
      }

      const parseResult = imageSchema.safeParse(req.body);
      if (!parseResult.success) {
        return reply.status(400).send({
          error: "Invalid request",
          details: parseResult.error,
        });
      }

      const data = parseResult.data;

      switch (data.type) {
        case "url": {
          const result = await bgRemovalService.removeBackgroundFromUrl(data.url, req.log);
          return reply
            .header("Content-Type", "image/png")
            .header("Content-Disposition", "attachment; filename=image-no-bg.png")
            .header("X-Processing-Time", result.processingTime.toString())
            .send(result.buffer);
        }

        case "blob": {
          const imageBuffer = Buffer.from(data.blob, "base64");
          const result = await bgRemovalService.removeBackgroundFromBuffer(imageBuffer, req.log);
          return reply
            .header("Content-Type", "image/png")
            .header("Content-Disposition", "attachment; filename=image-no-bg.png")
            .header("X-Processing-Time", result.processingTime.toString())
            .send(result.buffer);
        }

        default:
          return reply.status(400).send({ error: "Invalid input type" });
      }
    } catch (err) {
      app.log.error(err);

      if (err instanceof Error) {
        if (err.message.includes('premature end') || err.message.includes('truncated')) {
          return reply.status(413).send({ error: "Image size must be 5MB or less" });
        }
      }

      return reply.status(500).send({ error: "Failed to process image" });
    }
  });
}
