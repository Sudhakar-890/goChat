import { z } from 'zod';

export const createRoomSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  is_group: z.boolean().default(false),
  participant_ids: z
    .array(z.string().uuid())
    .min(1, 'At least one participant is required'),
});

export const addParticipantSchema = z.object({
  user_id: z.string().uuid('Invalid user ID'),
});

export const roomIdParamSchema = z.object({
  id: z.string().uuid('Invalid room ID'),
});

export type CreateRoomInput = z.infer<typeof createRoomSchema>;
export type AddParticipantInput = z.infer<typeof addParticipantSchema>;
