import { z } from 'zod';

export const sendMessageSchema = z.object({
  room_id: z.string().uuid('Invalid room ID'),
  content: z.string().max(5000).optional(),
  type: z.enum(['text', 'image', 'video', 'file']).default('text'),
  media_url: z.string().url().optional(),
  media_metadata: z
    .object({
      width: z.number().optional(),
      height: z.number().optional(),
      duration: z.number().optional(),
      mimetype: z.string().optional(),
      size: z.number().optional(),
    })
    .optional(),
  reply_to: z.string().uuid().optional(),
});

export const updateMessageStatusSchema = z.object({
  status: z.enum(['delivered', 'seen']),
});

export const messageQuerySchema = z.object({
  limit: z.coerce.number().min(1).max(100).default(50),
  before: z.string().datetime().optional(),
});

export const roomIdParamSchema = z.object({
  roomId: z.string().uuid('Invalid room ID'),
});

export type SendMessageInput = z.infer<typeof sendMessageSchema>;
export type UpdateMessageStatusInput = z.infer<typeof updateMessageStatusSchema>;
