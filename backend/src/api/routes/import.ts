import { Router, Request, Response } from 'express';
import passport from 'passport';
import { v4 as uuidv4 } from 'uuid';
import fs from 'fs';
import { upload } from '../middleware/upload';
import { processZip, importJobs } from '../import/processZip';

const router = Router();

// Protect all import routes with authentication
router.use(passport.authenticate('jwt', { session: false }));

/**
 * Async function to process ZIP file in the background
 */
async function processZipAsync(filePath: string, userId: string, jobId: string): Promise<void> {
  try {
    // Process ZIP with progress tracking
    await processZip(filePath, userId, jobId, (job) => {
      // Update job in map (already done in processZip, but this is the callback)
      importJobs.set(jobId, job);
    });

    // Mark job as complete (already done in processZip)
    const job = importJobs.get(jobId);
    if (job && job.stage !== 'complete') {
      job.stage = 'complete';
      job.progress = 100;
      job.completedAt = new Date();
      importJobs.set(jobId, job);
    }
  } catch (error) {
    console.error('Import error:', error);

    // Mark job as error
    const job = importJobs.get(jobId);
    if (job) {
      job.stage = 'error';
      job.errors.push(error instanceof Error ? error.message : 'Unknown error');
      importJobs.set(jobId, job);
    }
  } finally {
    // Cleanup ZIP file
    try {
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    } catch (cleanupError) {
      console.error('Error cleaning up ZIP file:', cleanupError);
    }
  }
}

/**
 * POST /api/import/upload
 * Upload a Google Takeout ZIP file and start processing
 * Returns job ID immediately for progress tracking
 */
router.post('/upload', upload.single('file'), async (req: Request, res: Response) => {
  try {
    const userId = (req.user as any).id;

    if (!req.file) {
      return res.status(400).json({
        error: 'No file uploaded',
        message: 'Please upload a ZIP file',
      });
    }

    // Generate job ID
    const jobId = uuidv4();

    console.log(`Starting import job ${jobId} for user ${userId}`);

    // Return job ID immediately
    res.json({
      jobId,
      message: 'Processing started. Use /api/import/status/:jobId to check progress.',
    });

    // Process asynchronously (don't await)
    processZipAsync(req.file.path, userId, jobId);

  } catch (error) {
    console.error('Upload error:', error);
    return res.status(500).json({
      error: 'Server error',
      message: error instanceof Error ? error.message : 'Failed to start import',
    });
  }
});

/**
 * GET /api/import/status/:jobId
 * Get real-time import progress for a specific job
 */
router.get('/status/:jobId', (req: Request, res: Response) => {
  const { jobId } = req.params;
  const userId = (req.user as any).id;

  const job = importJobs.get(jobId);

  if (!job) {
    return res.status(404).json({
      error: 'Job not found',
      message: `Import job ${jobId} not found. It may have expired or never existed.`,
    });
  }

  // Security: Only return job status to owner
  if (job.userId !== userId) {
    return res.status(403).json({
      error: 'Unauthorized',
      message: 'You do not have permission to view this import job.',
    });
  }

  // Return job status
  return res.json({
    jobId: job.id,
    stage: job.stage,
    progress: job.progress,
    listsProcessed: job.listsProcessed,
    placesProcessed: job.placesProcessed,
    totalLists: job.totalLists,
    totalPlaces: job.totalPlaces,
    errors: job.errors,
    startedAt: job.startedAt,
    completedAt: job.completedAt,
  });
});

export default router;
