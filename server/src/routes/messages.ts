import { Router, Request, Response } from 'express';
import { requireAuth } from '../middleware/auth';
import { validate } from '../middleware/validate';
import {
  sendMessageSchema,
  updateMessageStatusSchema,
  messageQuerySchema,
  roomIdParamSchema,
} from '../schemas/message.schema';
import { messageService } from '../services/messageService';

const router = Router();

// Get paginated messages for a room
router.get(
  '/:roomId',
  requireAuth,
  validate({ params: roomIdParamSchema, query: messageQuerySchema }),
  async (req: Request, res: Response): Promise<void> => {
    try {
      const limit = Number(req.query.limit) || 50;
      const before = req.query.before as string | undefined;
      const messages = await messageService.getMessages(
        req.params.roomId as string,
        limit,
        before
      );
      res.json({ data: messages });
    } catch (error: any) {
      res.status(500).json({ error: error.message || 'Failed to fetch messages' });
    }
  }
);

// Send a new message
router.post(
  '/',
  requireAuth,
  validate({ body: sendMessageSchema }),
  async (req: Request, res: Response): Promise<void> => {
    try {
      const message = await messageService.sendMessage(req.user!.id, req.body);
      res.status(201).json({ data: message });
    } catch (error: any) {
      res.status(500).json({ error: error.message || 'Failed to send message' });
    }
  }
);

// Update message status (delivered / seen)
router.patch(
  '/:id/status',
  requireAuth,
  validate({ body: updateMessageStatusSchema }),
  async (req: Request, res: Response): Promise<void> => {
    try {
      const message = await messageService.updateStatus(
        req.params.id as string,
        req.body.status
      );
      res.json({ data: message });
    } catch (error: any) {
      res
        .status(500)
        .json({ error: error.message || 'Failed to update message status' });
    }
  }
);

// Mark all messages in a room as seen
router.post(
  '/:roomId/seen',
  requireAuth,
  validate({ params: roomIdParamSchema }),
  async (req: Request, res: Response): Promise<void> => {
    try {
      const result = await messageService.markRoomAsSeen(
        req.params.roomId as string,
        req.user!.id
      );
      res.json({ data: result });
    } catch (error: any) {
      res.status(500).json({ error: error.message || 'Failed to mark as seen' });
    }
  }
);

export default router;
