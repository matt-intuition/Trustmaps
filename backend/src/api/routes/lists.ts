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

    // Transform data to match frontend interface
    const transformedLists = lists.map((list) => ({
      ...list,
      placeCount: list._count.places,
    }));

    res.json({ lists: transformedLists });
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
      isFree,
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

    // Price filter (isFree parameter)
    if (isFree !== undefined) {
      where.isFree = isFree === 'true';
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
 * GET /api/lists/saved
 * Get user's saved (bookmarked) lists
 */
router.get('/saved', async (req: Request, res: Response) => {
  try {
    const userId = (req.user as any).id;

    const savedLists = await prisma.savedList.findMany({
      where: {
        userId,
      },
      include: {
        list: {
          include: {
            creator: {
              select: {
                id: true,
                username: true,
                displayName: true,
                profileImage: true,
              },
            },
            _count: {
              select: {
                places: true,
              },
            },
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    // Transform data to match frontend interface
    const lists = savedLists.map((saved) => ({
      ...saved.list,
      placeCount: saved.list._count.places,
    }));
    res.json({ lists });
  } catch (error) {
    console.error('Error fetching saved lists:', error);
    res.status(500).json({
      error: 'Server error',
      message: error instanceof Error ? error.message : 'Failed to fetch saved lists',
    });
  }
});

/**
 * GET /api/lists/purchased
 * Get user's purchased lists
 */
router.get('/purchased', async (req: Request, res: Response) => {
  try {
    const userId = (req.user as any).id;

    const purchases = await prisma.purchase.findMany({
      where: {
        userId,
      },
      include: {
        list: {
          include: {
            creator: {
              select: {
                id: true,
                username: true,
                displayName: true,
                profileImage: true,
              },
            },
            _count: {
              select: {
                places: true,
              },
            },
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    // Transform data to match frontend interface
    const lists = purchases.map((purchase) => ({
      ...purchase.list,
      placeCount: purchase.list._count.places,
    }));
    res.json({ lists });
  } catch (error) {
    console.error('Error fetching purchased lists:', error);
    res.status(500).json({
      error: 'Server error',
      message: error instanceof Error ? error.message : 'Failed to fetch purchased lists',
    });
  }
});

/**
 * GET /api/lists/:id
 * Get list details with places (respects access control for paid lists)
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
            profileImage: true,
            creatorReputation: true,
          },
        },
        _count: {
          select: {
            purchases: true,
            stakes: true,
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

    // Check access for paid lists
    const isOwner = list.creatorId === userId;
    let hasAccess = isOwner || list.isFree;

    if (!hasAccess && !list.isFree) {
      // Check if user has purchased this list
      const purchase = await prisma.purchase.findFirst({
        where: {
          userId,
          listId: id,
        },
      });
      hasAccess = !!purchase;
    }

    // Check if user has saved this list
    const saved = await prisma.savedList.findFirst({
      where: {
        userId,
        listId: id,
      },
    });

    // For paid lists without access, show only 3 preview places
    const totalPlaces = list.places.length;
    const previewPlaces = 3;
    let places = list.places;
    if (!hasAccess && !list.isFree) {
      places = list.places.slice(0, previewPlaces);
    }

    res.json({
      list: {
        ...list,
        places,
      },
      meta: {
        isOwner,
        hasAccess,
        isSaved: !!saved,
        totalPlaces: list.places.length,
        previewPlaces: places.length,
      },
    });
  } catch (error) {
    console.error('Error fetching list:', error);
    res.status(500).json({
      error: 'Server error',
      message: error instanceof Error ? error.message : 'Failed to fetch list',
    });
  }
});

/**
 * POST /api/lists/:id/save
 * Save (bookmark) a free list
 */
router.post('/:id/save', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const userId = (req.user as any).id;

    // Check if list exists and is free
    const list = await prisma.list.findUnique({
      where: { id },
      select: { isFree: true, isPublic: true },
    });

    if (!list) {
      return res.status(404).json({
        error: 'Not found',
        message: 'List not found',
      });
    }

    if (!list.isPublic) {
      return res.status(403).json({
        error: 'Forbidden',
        message: 'Cannot save private lists',
      });
    }

    if (!list.isFree) {
      return res.status(400).json({
        error: 'Bad request',
        message: 'Cannot save paid lists. Please purchase instead.',
      });
    }

    // Check if already saved
    const existing = await prisma.savedList.findUnique({
      where: {
        userId_listId: {
          userId,
          listId: id,
        },
      },
    });

    if (existing) {
      return res.status(400).json({
        error: 'Bad request',
        message: 'List already saved',
      });
    }

    // Save the list
    await prisma.savedList.create({
      data: {
        userId,
        listId: id,
      },
    });

    res.json({
      message: 'List saved successfully',
      saved: true,
    });
  } catch (error) {
    console.error('Error saving list:', error);
    res.status(500).json({
      error: 'Server error',
      message: error instanceof Error ? error.message : 'Failed to save list',
    });
  }
});

/**
 * DELETE /api/lists/:id/save
 * Unsave (unbookmark) a list
 */
router.delete('/:id/save', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const userId = (req.user as any).id;

    const deleted = await prisma.savedList.deleteMany({
      where: {
        userId,
        listId: id,
      },
    });

    if (deleted.count === 0) {
      return res.status(404).json({
        error: 'Not found',
        message: 'Saved list not found',
      });
    }

    res.json({
      message: 'List unsaved successfully',
      saved: false,
    });
  } catch (error) {
    console.error('Error unsaving list:', error);
    res.status(500).json({
      error: 'Server error',
      message: error instanceof Error ? error.message : 'Failed to unsave list',
    });
  }
});

/**
 * PUT /api/lists/:id
 * Update list details (owner only)
 */
router.put('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const userId = (req.user as any).id;
    const { title, description, category, isFree, price } = req.body;

    // Check ownership
    const list = await prisma.list.findUnique({
      where: { id },
      select: { creatorId: true },
    });

    if (!list) {
      return res.status(404).json({
        error: 'Not found',
        message: 'List not found',
      });
    }

    if (list.creatorId !== userId) {
      return res.status(403).json({
        error: 'Forbidden',
        message: 'You can only edit your own lists',
      });
    }

    // Validate price for paid lists
    if (isFree === false && (!price || price <= 0)) {
      return res.status(400).json({
        error: 'Bad request',
        message: 'Price must be greater than 0 for paid lists',
      });
    }

    // Update list
    const updatedList = await prisma.list.update({
      where: { id },
      data: {
        ...(title && { title }),
        ...(description !== undefined && { description }),
        ...(category && { category }),
        ...(isFree !== undefined && { isFree }),
        ...(price !== undefined && { price: isFree ? null : price }),
      },
    });

    res.json({
      message: 'List updated successfully',
      list: updatedList,
    });
  } catch (error) {
    console.error('Error updating list:', error);
    res.status(500).json({
      error: 'Server error',
      message: error instanceof Error ? error.message : 'Failed to update list',
    });
  }
});

/**
 * POST /api/lists/:id/purchase
 * Purchase a paid list
 */
router.post('/:id/purchase', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const userId = (req.user as any).id;

    // Get list and user in parallel
    const [list, user] = await Promise.all([
      prisma.list.findUnique({
        where: { id },
        include: {
          creator: {
            select: { id: true },
          },
          stakes: {
            select: { amount: true },
          },
        },
      }),
      prisma.user.findUnique({
        where: { id: userId },
        select: { trustBalance: true },
      }),
    ]);

    if (!list) {
      return res.status(404).json({
        error: 'Not found',
        message: 'List not found',
      });
    }

    if (list.isFree) {
      return res.status(400).json({
        error: 'Bad request',
        message: 'This list is free. Use save instead.',
      });
    }

    if (!list.price) {
      return res.status(400).json({
        error: 'Bad request',
        message: 'List price not set',
      });
    }

    if (list.creatorId === userId) {
      return res.status(400).json({
        error: 'Bad request',
        message: 'You cannot purchase your own list',
      });
    }

    // Check if already purchased
    const existing = await prisma.purchase.findUnique({
      where: {
        userId_listId: {
          userId,
          listId: id,
        },
      },
    });

    if (existing) {
      return res.status(400).json({
        error: 'Bad request',
        message: 'You have already purchased this list',
      });
    }

    // Check user balance
    if (!user || user.trustBalance < list.price) {
      return res.status(400).json({
        error: 'Insufficient balance',
        message: `You need ${list.price} TRUST tokens. Current balance: ${user?.trustBalance || 0}`,
      });
    }

    // Calculate revenue distribution (65% creator, 25% stakers, 10% protocol)
    const revenueToCreator = Math.floor(list.price * 0.65);
    const revenueToStakers = Math.floor(list.price * 0.25);
    const revenueToProtocol = list.price - revenueToCreator - revenueToStakers;

    // Execute transaction
    await prisma.$transaction(async (tx) => {
      // Deduct from buyer
      await tx.user.update({
        where: { id: userId },
        data: {
          trustBalance: {
            decrement: list.price!,
          },
        },
      });

      // Pay creator
      await tx.user.update({
        where: { id: list.creatorId },
        data: {
          trustBalance: {
            increment: revenueToCreator,
          },
        },
      });

      // Distribute to stakers proportionally
      const totalStaked = list.stakes.reduce((sum, stake) => sum + stake.amount, 0);
      if (totalStaked > 0) {
        for (const stake of list.stakes) {
          const stakeShare = Math.floor((stake.amount / totalStaked) * revenueToStakers);
          await tx.stake.update({
            where: {
              userId_listId: {
                userId: (stake as any).userId,
                listId: id,
              },
            },
            data: {
              earnedRevenue: {
                increment: stakeShare,
              },
            },
          });
        }
      }

      // Record purchase
      await tx.purchase.create({
        data: {
          userId,
          listId: id,
          price: list.price!,
          revenueToCreator,
          revenueToStakers,
          revenueToProtocol,
        },
      });

      // Update list stats
      await tx.list.update({
        where: { id },
        data: {
          totalSales: {
            increment: 1,
          },
          totalEarnings: {
            increment: list.price!,
          },
        },
      });
    });

    res.json({
      message: 'Purchase successful',
      purchased: true,
      price: list.price,
      newBalance: user.trustBalance - list.price,
    });
  } catch (error) {
    console.error('Error purchasing list:', error);
    res.status(500).json({
      error: 'Server error',
      message: error instanceof Error ? error.message : 'Failed to purchase list',
    });
  }
});

/**
 * GET /api/lists/purchases/history
 * Get user's purchase history
 */
router.get('/purchases/history', async (req: Request, res: Response) => {
  try {
    const userId = (req.user as any).id;

    const purchases = await prisma.purchase.findMany({
      where: { userId },
      include: {
        list: {
          select: {
            id: true,
            title: true,
            description: true,
            category: true,
            isFree: true,
            price: true,
            coverImage: true,
            placeCount: true,
            creator: {
              select: {
                id: true,
                username: true,
                displayName: true,
                profileImage: true,
              },
            },
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    res.json({
      purchases: purchases.map((p) => ({
        id: p.id,
        price: p.price,
        revenueToCreator: p.revenueToCreator,
        revenueToStakers: p.revenueToStakers,
        revenueToProtocol: p.revenueToProtocol,
        purchasedAt: p.createdAt,
        list: p.list,
      })),
    });
  } catch (error) {
    console.error('Error fetching purchase history:', error);
    res.status(500).json({
      error: 'Server error',
      message: error instanceof Error ? error.message : 'Failed to fetch purchases',
    });
  }
});

export default router;
