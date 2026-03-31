import { Router, Request, Response } from 'express';
import { requireAuth } from '../middleware/auth';
import { validate } from '../middleware/validate';
import { signedUrlSchema } from '../schemas/media.schema';
import { mediaService } from '../services/mediaService';

const router = Router();

// Generate signed upload URL
router.post(
  '/signed-url',
  requireAuth,
  validate({ body: signedUrlSchema }),
  async (req: Request, res: Response): Promise<void> => {
    try {
      const result = await mediaService.createSignedUploadUrl(
        req.user!.id,
        req.body.file_path
      );
      res.json({ data: result });
    } catch (error: any) {
      res
        .status(500)
        .json({ error: error.message || 'Failed to generate upload URL' });
    }
  }
);

// Generate signed download URL
router.get(
  '/signed-url/{*path}',
  requireAuth,
  async (req: Request, res: Response): Promise<void> => {
    try {
      // Get the path after /signed-url/
      let filePath = (req.params as any).path;
      if (Array.isArray(filePath)) {
        filePath = filePath.join('/');
      }
      
      if (!filePath) {
        res.status(400).json({ error: 'File path is required' });
        return;
      }
      const result = await mediaService.createSignedDownloadUrl(filePath);
      res.json({ data: result });
    } catch (error: any) {
      res
        .status(500)
        .json({ error: error.message || 'Failed to generate download URL' });
    }
  }
);

export default router;
