import { Router, Request, Response } from 'express';
import passport from 'passport';
import { upload } from '../middleware/upload';
import { processZip } from '../import/processZip';

const router = Router();

// Protect all import routes with authentication
router.use(passport.authenticate('jwt', { session: false }));

/**
 * POST /api/import/upload
 * Upload and process a Google Takeout ZIP file
 */
router.post('/upload', upload.single('file'), async (req: Request, res: Response) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        error: 'No file uploaded',
        message: 'Please upload a ZIP file',
      });
    }

    const userId = (req.user as any).id;

    // Process ZIP file asynchronously
    const result = await processZip(req.file.path, userId);

    if (result.success) {
      return res.json({
        message: 'Import successful',
        listsCreated: result.listsCreated,
        placesImported: result.placesImported,
        warnings: result.errors,
      });
    } else {
      return res.status(400).json({
        error: 'Import failed',
        message: 'Failed to process ZIP file',
        errors: result.errors,
      });
    }
  } catch (error) {
    console.error('Import error:', error);
    return res.status(500).json({
      error: 'Server error',
      message: error instanceof Error ? error.message : 'Failed to process import',
    });
  }
});

/**
 * GET /api/import/status
 * Get import queue status (for progress tracking)
 */
router.get('/status', (req: Request, res: Response) => {
  // TODO: Implement job queue status tracking
  res.json({
    message: 'Import status endpoint',
    // jobId: req.query.jobId,
    // status: 'processing',
    // progress: 50,
  });
});

export default router;
