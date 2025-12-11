import { Router, Request, Response } from 'express';
import passport from 'passport';
import { prisma } from '../../config/database';
import { generateListImageUrl } from '../../services/imageService';

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
 * GET /api/lists/marketplace
 * Get public lists for marketplace with filtering, sorting, and pagination
 */
router.get('/marketplace', async (req: Request, res: Response) => {
  try {
    const {
      category,
      search,
      page = '1',
      limit = '20',
      sortBy = 'trustRank', // trustRank, price, newest, popular
    } = req.query;

    const pageNum = parseInt(page as string, 10);
    const limitNum = parseInt(limit as string, 10);
    const skip = (pageNum - 1) * limitNum;

    // Build where clause
    const where: any = {
      isPublic: true, // Only show public lists
    };

    // Category filter
    if (category && category !== 'All') {
      where.category = category;
    }

    // Search filter (title, city, description)
    if (search) {
      where.OR = [
        { title: { contains: search as string, mode: 'insensitive' } },
        { city: { contains: search as string, mode: 'insensitive' } },
        { description: { contains: search as string, mode: 'insensitive' } },
      ];
    }

    // Build orderBy clause
    let orderBy: any = {};
    switch (sortBy) {
      case 'price':
        orderBy = { price: 'asc' };
        break;
      case 'newest':
        orderBy = { createdAt: 'desc' };
        break;
      case 'popular':
        orderBy = { totalSales: 'desc' };
        break;
      case 'trustRank':
      default:
        orderBy = { trustRank: 'desc' };
        break;
    }

    // Fetch lists with pagination
    const [lists, total] = await Promise.all([
      prisma.list.findMany({
        where,
        include: {
          creator: {
            select: {
              id: true,
              username: true,
              displayName: true,
              profileImage: true,
              creatorReputation: true,
            },
          },
        },
        orderBy,
        skip,
        take: limitNum,
      }),
      prisma.list.count({ where }),
    ]);

    // Calculate trust rank if needed and generate image URLs
    const listsWithImages = lists.map((list) => {
      // Calculate trust rank if not set
      let trustRank = list.trustRank;
      if (trustRank === 0 && list.averageRating) {
        // Base: rating * 20 (convert 5-star to 100-point scale)
        trustRank = list.averageRating * 20;
        // Staking boost (logarithmic, max +15)
        trustRank += Math.min(15, Math.log10(list.totalStaked + 1) * 5);
        // Sales boost (logarithmic, max +9)
        trustRank += Math.min(9, Math.log10(list.totalSales + 1) * 3);
        // Creator reputation boost (max +10)
        trustRank += Math.min(10, list.creator.creatorReputation * 0.1);
        // Clamp to 0-100
        trustRank = Math.max(0, Math.min(100, trustRank));
      }

      // Generate image URL based on available data
      const { url: imageUrl, type: imageType } = generateListImageUrl({
        centerLatitude: list.centerLatitude,
        centerLongitude: list.centerLongitude,
        city: list.city,
        category: list.category,
        coverImage: list.coverImage,
      });

      return {
        ...list,
        trustRank,
        imageUrl,
        imageType,
      };
    });

    res.json({
      lists: listsWithImages,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        hasMore: skip + limitNum < total,
      },
    });
  } catch (error) {
    console.error('Error fetching marketplace lists:', error);
    res.status(500).json({
      error: 'Server error',
      message: error instanceof Error ? error.message : 'Failed to fetch marketplace lists',
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
