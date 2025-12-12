import { Router, Request, Response } from 'express';
import passport from 'passport';
import { prisma } from '../../config/database';

const router = Router();

// Protect all routes with authentication
router.use(passport.authenticate('jwt', { session: false }));

/**
 * GET /api/users
 * Browse and search all users with sorting and pagination
 */
router.get('/', async (req: Request, res: Response) => {
  try {
    const currentUserId = (req.user as any).id;
    const {
      sortBy = 'reputation',
      search = '',
      page = '1',
      limit = '20',
    } = req.query;

    const pageNum = parseInt(page as string, 10);
    const limitNum = parseInt(limit as string, 10);
    const skip = (pageNum - 1) * limitNum;

    // Build where clause for search
    const whereClause: any = {
      AND: [
        { id: { not: currentUserId } }, // Exclude current user
      ],
    };

    if (search && (search as string).trim()) {
      whereClause.AND.push({
        OR: [
          { username: { contains: search as string, mode: 'insensitive' } },
          { displayName: { contains: search as string, mode: 'insensitive' } },
          { bio: { contains: search as string, mode: 'insensitive' } },
        ],
      });
    }

    // Build orderBy clause
    let orderBy: any = {};
    switch (sortBy) {
      case 'followers':
        orderBy = { followers: { _count: 'desc' } };
        break;
      case 'lists':
        orderBy = { createdLists: { _count: 'desc' } };
        break;
      case 'recent':
        // Order by most recent list creation
        orderBy = { createdAt: 'desc' };
        break;
      case 'reputation':
      default:
        orderBy = { creatorReputation: 'desc' };
        break;
    }

    // Get total count for pagination
    const total = await prisma.user.count({
      where: whereClause,
    });

    // Fetch users
    const users = await prisma.user.findMany({
      where: whereClause,
      select: {
        id: true,
        username: true,
        displayName: true,
        bio: true,
        profileImage: true,
        creatorReputation: true,
        _count: {
          select: {
            createdLists: true,
            followers: true,
            following: true,
          },
        },
      },
      orderBy,
      skip,
      take: limitNum,
    });

    // Check follow status for each user
    const followStatuses = await Promise.all(
      users.map(async (user) => {
        const isFollowing = await prisma.follow.findUnique({
          where: {
            followerId_followingId: {
              followerId: currentUserId,
              followingId: user.id,
            },
          },
        });
        return !!isFollowing;
      })
    );

    // Combine user data with follow status
    const usersWithMeta = users.map((user, index) => ({
      ...user,
      meta: {
        isFollowing: followStatuses[index],
      },
    }));

    res.json({
      users: usersWithMeta,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        hasMore: skip + limitNum < total,
      },
    });
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({
      error: 'Server error',
      message: error instanceof Error ? error.message : 'Failed to fetch users',
    });
  }
});

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
