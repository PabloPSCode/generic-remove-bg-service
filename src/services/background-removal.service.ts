import { removeBackground } from "@imgly/background-removal-node";
import sharp from "sharp";
import fs from "fs/promises";
import os from "os";
import path from "path";
import { FastifyBaseLogger } from "fastify";

export interface ProcessingResult {
  buffer: Buffer;
  processingTime: number;
}

export class BackgroundRemovalService {
  async removeBackgroundFromUrl(imageUrl: string, logger: FastifyBaseLogger): Promise<ProcessingResult> {
    const startTime = Date.now();
    logger.info('Processing image from URL');

    try {
      const blob = await removeBackground(imageUrl);
      const arrayBuffer = await blob.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);

      const processingTime = Date.now() - startTime;
      logger.info({ processingTime, outputSize: buffer.length }, 'Background removal successful');
      return { buffer, processingTime };
    } catch (error) {
      const processingTime = Date.now() - startTime;
      logger.error({ processingTime }, 'Background removal failed');
      throw new Error("Failed to process image");
    }
  }

  async removeBackgroundFromBuffer(imageBuffer: Buffer, logger: FastifyBaseLogger): Promise<ProcessingResult> {
    const startTime = Date.now();
    const tempDir = os.tmpdir();
    const tempFilePath = path.join(tempDir, `temp-image-${Date.now()}.png`);

    logger.info({ inputSize: imageBuffer.length }, 'Processing image from buffer');

    try {
      const pngBuffer = await sharp(imageBuffer).png().toBuffer();
      logger.info({ pngSize: pngBuffer.length }, 'Converted to PNG');

      await fs.writeFile(tempFilePath, pngBuffer);

      const blob = await removeBackground(tempFilePath);
      const arrayBuffer = await blob.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);

      const processingTime = Date.now() - startTime;
      logger.info({ processingTime, outputSize: buffer.length }, 'Background removal successful');
      return { buffer, processingTime };
    } catch (error) {
      const processingTime = Date.now() - startTime;
      logger.error({ processingTime }, 'Background removal failed');
      throw error;
    } finally {
      await fs.unlink(tempFilePath).catch(() => {});
    }
  }
}
