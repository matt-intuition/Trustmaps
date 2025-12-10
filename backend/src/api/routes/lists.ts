import { Router, Request, Response } from 'express';
import passport from 'passport';
import { prisma } from '../../config/database';

const router = Router();

// Protect all list routes with authentication
router.use(passport.authenticate('jwt', { session: false }));

/**
 * GET /api/lists
 * Get user's created lists
 */
router.get('/', async (req: Request, res: Response) => {
  try {
    const userId = (req.user as any).id;

    const lists = await prisma.list.findMany({
      where: {
        creatorId: userId,
      },
      include: {
        _count: {
          select: {
            places: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    res.json({ lists });
  } catch (error) {
    console.error('Error fetching lists:', error);
    res.status(500).json({
      error: 'Server error',
      message: error instanceof Error ? error.message : 'Failed to fetch lists',
    });
  }
});

/**
 * GET /api/lists/:id
 * Get list details with places
 */
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const userId = (req.user as any).id;

    const list = await prisma.list.findFirst({
      where: {
        id,
        OR: [
          { creatorId: userId }, // User's own list
          { isPublic: true }, // Or public list
        ],
      },
      include: {
        places: {
          include: {
            place: true,
          },
          orderBy: {
            order: 'asc',
          },
        },
        creator: {
          select: {
            id: true,
            username: true,
            displayName: true,
          },
        },
      },
    });

    if (!list) {
      return res.status(404).json({
        error: 'Not found',
        message: 'List not found or you do not have access',
      });
    }

    res.json({ list });
  } catch (error) {
    console.error('Error fetching list:', error);
    res.status(500).json({
      error: 'Server error',
      message: error instanceof Error ? error.message : 'Failed to fetch list',
    });
  }
});

export default router;
