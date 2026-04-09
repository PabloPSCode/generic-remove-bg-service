import { z } from "zod";

export const fileSchema = z.object({
  type: z.literal("file"),
  file: z.instanceof(Buffer),
  token: z.string().optional(),
});

export const urlSchema = z.object({
  type: z.literal("url"),
  url: z.string().url("Invalid URL format"),
  token: z.string().optional(),
});

export const blobSchema = z.object({
  type: z.literal("blob"),
  blob: z.string().min(1, "Base64 blob cannot be empty"),
  token: z.string().optional(),
});

export const imageSchema = z.discriminatedUnion("type", [
  urlSchema,
  blobSchema,
]);

export type ImageSource = z.infer<typeof imageSchema>;
