import { Router, Request, Response } from 'express';
import { requireAuth } from '../middleware/auth';
import { validate } from '../middleware/validate';
import {
  createRoomSchema,
  addParticipantSchema,
  roomIdParamSchema,
} from '../schemas/room.schema';
import { roomService } from '../services/roomService';

const router = Router();

// Create a new room (DM or group)
router.post(
  '/',
  requireAuth,
  validate({ body: createRoomSchema }),
  async (req: Request, res: Response): Promise<void> => {
    try {
      const room = await roomService.createRoom(req.user!.id, req.body);
      res.status(201).json({ data: room });
    } catch (error: any) {
      res.status(500).json({ error: error.message || 'Failed to create room' });
    }
  }
);

// Get all rooms for the authenticated user
router.get(
  '/',
  requireAuth,
  async (req: Request, res: Response): Promise<void> => {
    try {
      const rooms = await roomService.getUserRooms(req.user!.id);
      res.json({ data: rooms });
    } catch (error: any) {
      res.status(500).json({ error: error.message || 'Failed to fetch rooms' });
    }
  }
);

// Add a participant to a room
router.post(
  '/:id/participants',
  requireAuth,
  validate({ params: roomIdParamSchema, body: addParticipantSchema }),
  async (req: Request, res: Response): Promise<void> => {
    try {
      const participant = await roomService.addParticipant(
        req.params.id as string,
        req.body.user_id
      );
      res.status(201).json({ data: participant });
    } catch (error: any) {
      res
        .status(500)
        .json({ error: error.message || 'Failed to add participant' });
    }
  }
);

export default router;
