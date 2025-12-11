import { Router, Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import fs from 'fs';
import { upload } from '../middleware/upload';
import { processZip, importJobs } from '../import/processZip';
import { authenticateJWT } from '../middleware/auth';

const router = Router();

// Protect all import routes with authentication
router.use(authenticateJWT);

/**
 * Async function to process ZIP file in the background
 * @param selectedLists - Optional array of selected lists with pricing:
 *   [{ name: string, displayName?: string, isPaid: boolean, price: number }]
 */
async function processZipAsync(
  filePath: string,
  userId: string,
  jobId: string,
  selectedLists?: Array<{ name: string; displayName?: string; isPaid: boolean; price: number }>
): Promise<void> {
  try {
    // Process ZIP with progress tracking
    await processZip(filePath, userId, jobId, (job) => {
      // Update job in map (already done in processZip, but this is the callback)
      importJobs.set(jobId, job);
    }, selectedLists);

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
 * Upload a Google Takeout ZIP file (without processing)
 * Returns file ID for later analysis and processing
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

    // Generate file ID
    const fileId = uuidv4();

    console.log(`File uploaded: ${fileId} for user ${userId}, path: ${req.file.path}`);

    // Return file info (file stays on disk for later processing)
    res.json({
      fileId,
      filePath: req.file.path,
      filename: req.file.originalname,
      size: req.file.size,
      message: 'File uploaded successfully. Use /api/import/analyze/:fileId to see available lists.',
    });

  } catch (error) {
    console.error('Upload error:', error);
    return res.status(500).json({
      error: 'Server error',
      message: error instanceof Error ? error.message : 'Failed to upload file',
    });
  }
});

/**
 * POST /api/import/analyze
 * Analyze uploaded ZIP file and return list of available lists
 * Does NOT import anything, just extracts metadata
 */
router.post('/analyze', async (req: Request, res: Response) => {
  try {
    const userId = (req.user as any).id;
    const { filePath } = req.body;

    if (!filePath) {
      return res.status(400).json({
        error: 'Missing filePath',
        message: 'Please provide a filePath in the request body.',
      });
    }

    console.log(`Analyzing ZIP file: ${filePath}`);

    if (!fs.existsSync(filePath)) {
      return res.status(404).json({
        error: 'File not found',
        message: 'The uploaded file could not be found. It may have expired.',
      });
    }

    // Import dynamically to avoid circular dependency
    const AdmZip = require('adm-zip');
    const { parse } = require('csv-parse/sync');
    const path = require('path');

    const zip = new AdmZip(filePath);
    const entries = zip.getEntries();

    // Find CSV files in Saved/ directory
    const csvEntries = entries.filter((e: any) =>
      e.entryName.includes('Saved/') &&
      e.entryName.endsWith('.csv') &&
      !e.isDirectory
    );

    if (csvEntries.length === 0) {
      return res.status(400).json({
        error: 'No saved lists found',
        message: 'This ZIP file does not contain any saved lists (Saved/*.csv files).',
      });
    }

    // Extract metadata for each list
    const lists = csvEntries.map((entry: any) => {
      const listName = path.basename(entry.entryName, '.csv');
      const csvContent = entry.getData().toString('utf8');

      try {
        const records = parse(csvContent, {
          columns: true,
          skip_empty_lines: true,
          trim: true,
        });

        const placeCount = records.filter((r: any) => r.Title && r.Title.trim() !== '').length;

        return {
          name: listName,
          placeCount,
          csvPath: entry.entryName,
        };
      } catch (parseError) {
        console.error(`Error parsing ${listName}:`, parseError);
        return {
          name: listName,
          placeCount: 0,
          csvPath: entry.entryName,
          error: 'Failed to parse CSV',
        };
      }
    });

    res.json({
      totalLists: lists.length,
      lists,
      filePath,
    });

  } catch (error) {
    console.error('Analyze error:', error);
    return res.status(500).json({
      error: 'Server error',
      message: error instanceof Error ? error.message : 'Failed to analyze file',
    });
  }
});

/**
 * POST /api/import/process
 * Process selected lists from an uploaded ZIP file
 * Accepts list of selected lists with pricing info
 */
router.post('/process', async (req: Request, res: Response) => {
  try {
    const userId = (req.user as any).id;
    const { filePath, selectedLists } = req.body;

    if (!filePath || !selectedLists || !Array.isArray(selectedLists)) {
      return res.status(400).json({
        error: 'Invalid request',
        message: 'Missing filePath or selectedLists',
      });
    }

    if (!fs.existsSync(filePath)) {
      return res.status(404).json({
        error: 'File not found',
        message: 'The uploaded file could not be found.',
      });
    }

    // Generate job ID
    const jobId = uuidv4();

    console.log(`Starting selective import job ${jobId} for user ${userId}`);
    console.log(`Importing ${selectedLists.length} selected lists`);

    // Return job ID immediately
    res.json({
      jobId,
      message: 'Processing started. Use /api/import/status/:jobId to check progress.',
    });

    // Process asynchronously with selected lists
    processZipAsync(filePath, userId, jobId, selectedLists);

  } catch (error) {
    console.error('Process error:', error);
    return res.status(500).json({
      error: 'Server error',
      message: error instanceof Error ? error.message : 'Failed to start processing',
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
