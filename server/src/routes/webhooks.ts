import { Router, Request, Response } from 'express';

const router = Router();

/**
 * Webhook handler for Supabase database events.
 * Configure in Supabase Dashboard > Database > Webhooks
 * to POST to this endpoint on message inserts.
 */
router.post(
  '/message',
  async (req: Request, res: Response): Promise<void> => {
    try {
      const { type, record, old_record } = req.body;

      console.log(`[Webhook] Message event: ${type}`, {
        id: record?.id,
        room_id: record?.room_id,
      });

      // Handle different event types
      switch (type) {
        case 'INSERT':
          // Process new message: could trigger push notifications,
          // update analytics, process media metadata, etc.
          break;
        case 'UPDATE':
          // Handle message updates (e.g., status changes)
          break;
        case 'DELETE':
          // Handle message deletion
          break;
      }

      res.json({ received: true });
    } catch (error: any) {
      console.error('[Webhook] Error:', error);
      res.status(500).json({ error: 'Webhook processing failed' });
    }
  }
);

export default router;
