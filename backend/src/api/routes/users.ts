import { Router, Request, Response } from 'express';
import passport from 'passport';
import { prisma } from '../../config/database';

const router = Router();

// Protect all routes with authentication
router.use(passport.authenticate('jwt', { session: false }));

/**
 * GET /api/users/:id
 * Get public profile data for a creator
 */
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const currentUserId = (req.user as any).id;

    const user = await prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        username: true,
        displayName: true,
        bio: true,
        profileImage: true,
        creatorReputation: true,
        totalStaked: true,
        createdAt: true,
        _count: {
          select: {
            createdLists: true,
            purchases: true,
            stakes: true,
            stakesReceived: true,
            followers: true,
            following: true,
          },
        },
      },
    });

    if (!user) {
      return res.status(404).json({
        error: 'Not found',
        message: 'User not found',
      });
    }

    // Calculate total sales from user's lists
    const salesData = await prisma.list.aggregate({
      where: {
        creatorId: id,
      },
      _sum: {
        totalSales: true,
        totalEarnings: true,
      },
    });

    // Check if current user is following this user
    const isFollowing = await prisma.follow.findUnique({
      where: {
        followerId_followingId: {
          followerId: currentUserId,
          followingId: id,
        },
      },
    });

    res.json({
      user: {
        ...user,
        totalSales: salesData._sum.totalSales || 0,
        totalEarnings: salesData._sum.totalEarnings || 0,
      },
      meta: {
        isFollowing: !!isFollowing,
      },
    });
  } catch (error) {
    console.error('Error fetching user profile:', error);
    res.status(500).json({
      error: 'Server error',
      message: error instanceof Error ? error.message : 'Failed to fetch user',
    });
  }
});

/**
 * GET /api/users/:id/lists
 * Get creator's published lists
 */
router.get('/:id/lists', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { sortBy = 'trustRank', limit = '20' } = req.query;

    // Verify user exists
    const user = await prisma.user.findUnique({
      where: { id },
      select: { id: true },
    });

    if (!user) {
      return res.status(404).json({
        error: 'Not found',
        message: 'User not found',
      });
    }

    // Build orderBy clause
    let orderBy: any = {};
    switch (sortBy) {
      case 'newest':
        orderBy = { createdAt: 'desc' };
        break;
      case 'sales':
        orderBy = { totalSales: 'desc' };
        break;
      case 'staked':
        orderBy = { totalStaked: 'desc' };
        break;
      case 'trustRank':
      default:
        orderBy = { trustRank: 'desc' };
        break;
    }

    const lists = await prisma.list.findMany({
      where: {
        creatorId: id,
        isPublic: true,
      },
      include: {
        _count: {
          select: {
            places: true,
            purchases: true,
            stakes: true,
          },
        },
      },
      orderBy,
      take: parseInt(limit as string, 10),
    });

    // Transform data
    const transformedLists = lists.map((list) => ({
      ...list,
      placeCount: list._count.places,
    }));

    res.json({
      lists: transformedLists,
      total: transformedLists.length,
    });
  } catch (error) {
    console.error('Error fetching user lists:', error);
    res.status(500).json({
      error: 'Server error',
      message: error instanceof Error ? error.message : 'Failed to fetch lists',
    });
  }
});

export default router;
