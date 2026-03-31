import { z } from 'zod';

export const signedUrlSchema = z.object({
  file_path: z.string().min(1, 'File path is required'),
  content_type: z.string().optional(),
});

export const downloadUrlParamSchema = z.object({
  path: z.string().min(1),
});

export type SignedUrlInput = z.infer<typeof signedUrlSchema>;
