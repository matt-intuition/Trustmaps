import { Router, Request, Response } from 'express';
import { param, query, validationResult } from 'express-validator';
import { prisma } from '../../config/database';
import { authenticateJWT } from '../middleware/auth';
import {
  generateKML,
  generateGeoJSON,
  generateCSV,
  getFileExtension,
  getMimeType
} from '../../services/exportService';

const router = Router();

// All routes require authentication
router.use(authenticateJWT);

/**
 * Helper function to check if user has access to a list
 */
async function hasListAccess(userId: string, listId: string): Promise<boolean> {
  const list = await prisma.list.findUnique({
    where: { id: listId }
  });

  if (!list) {
    return false;
  }

  // User has access if:
  // 1. They own the list
  if (list.creatorId === userId) {
    return true;
  }

  // 2. The list is free
  if (list.isFree) {
    return true;
  }

  // 3. They purchased the list
  const purchase = await prisma.purchase.findUnique({
    where: {
      userId_listId: {
        userId,
        listId
      }
    }
  });

  return !!purchase;
}

/**
 * Helper function to get list with places for export
 */
async function getListForExport(listId: string) {
  return await prisma.list.findUnique({
    where: { id: listId },
    include: {
      places: {
        include: {
          place: true
        },
        orderBy: {
          order: 'asc'
        }
      },
      creator: {
        select: {
          username: true,
          displayName: true
        }
      }
    }
  });
}

// GET /api/export/list/:listId/kml - Export list as KML
router.get(
  '/list/:listId/kml',
  [param('listId').isUUID().withMessage('Invalid list ID')],
  async (req: Request, res: Response) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { listId } = req.params;
      const userId = req.user!.id;

      // Check access
      const hasAccess = await hasListAccess(userId, listId);
      if (!hasAccess) {
        return res.status(403).json({
          error: 'Access denied',
          message: 'You must own or purchase this list to export it'
        });
      }

      // Get list with places
      const list = await getListForExport(listId);
      if (!list) {
        return res.status(404).json({ error: 'List not found' });
      }

      // Generate KML
      const kml = generateKML(list as any);

      // Set headers for file download
      const filename = `${list.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.kml`;
      res.setHeader('Content-Type', getMimeType('kml'));
      res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);

      return res.send(kml);
    } catch (error) {
      console.error('Error exporting KML:', error);
      return res.status(500).json({ error: 'Failed to export list as KML' });
    }
  }
);

// GET /api/export/list/:listId/geojson - Export list as GeoJSON
router.get(
  '/list/:listId/geojson',
  [param('listId').isUUID().withMessage('Invalid list ID')],
  async (req: Request, res: Response) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { listId } = req.params;
      const userId = req.user!.id;

      // Check access
      const hasAccess = await hasListAccess(userId, listId);
      if (!hasAccess) {
        return res.status(403).json({
          error: 'Access denied',
          message: 'You must own or purchase this list to export it'
        });
      }

      // Get list with places
      const list = await getListForExport(listId);
      if (!list) {
        return res.status(404).json({ error: 'List not found' });
      }

      // Generate GeoJSON
      const geojson = generateGeoJSON(list as any);

      // Set headers for file download
      const filename = `${list.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.geojson`;
      res.setHeader('Content-Type', getMimeType('geojson'));
      res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);

      return res.send(geojson);
    } catch (error) {
      console.error('Error exporting GeoJSON:', error);
      return res.status(500).json({ error: 'Failed to export list as GeoJSON' });
    }
  }
);

// GET /api/export/list/:listId/csv - Export list as CSV
router.get(
  '/list/:listId/csv',
  [param('listId').isUUID().withMessage('Invalid list ID')],
  async (req: Request, res: Response) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { listId } = req.params;
      const userId = req.user!.id;

      // Check access
      const hasAccess = await hasListAccess(userId, listId);
      if (!hasAccess) {
        return res.status(403).json({
          error: 'Access denied',
          message: 'You must own or purchase this list to export it'
        });
      }

      // Get list with places
      const list = await getListForExport(listId);
      if (!list) {
        return res.status(404).json({ error: 'List not found' });
      }

      // Generate CSV
      const csv = generateCSV(list as any);

      // Set headers for file download
      const filename = `${list.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.csv`;
      res.setHeader('Content-Type', getMimeType('csv'));
      res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);

      return res.send(csv);
    } catch (error) {
      console.error('Error exporting CSV:', error);
      return res.status(500).json({ error: 'Failed to export list as CSV' });
    }
  }
);

export default router;
