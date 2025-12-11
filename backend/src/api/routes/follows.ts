import { Router, Request, Response } from 'express';
import { prisma } from '../../config/database';
import { authenticateJWT } from '../middleware/auth';

const router = Router();

// All routes require authentication
router.use(authenticateJWT);

/**
 * POST /api/follows/:userId
 * Follow a user
 */
router.post('/:userId', async (req: Request, res: Response) => {
  try {
    const { userId: followingId } = req.params;
    const followerId = (req.user as any).id;

    // Cannot follow yourself
    if (followerId === followingId) {
      return res.status(400).json({
        error: 'Bad request',
        message: 'You cannot follow yourself',
      });
    }

    // Check if user exists
    const userToFollow = await prisma.user.findUnique({
      where: { id: followingId },
    });

    if (!userToFollow) {
      return res.status(404).json({
        error: 'Not found',
        message: 'User not found',
      });
    }

    // Check if already following
    const existingFollow = await prisma.follow.findUnique({
      where: {
        followerId_followingId: {
          followerId,
          followingId,
        },
      },
    });

    if (existingFollow) {
      return res.status(400).json({
        error: 'Bad request',
        message: 'You are already following this user',
      });
    }

    // Create follow relationship
    const follow = await prisma.follow.create({
      data: {
        followerId,
        followingId,
      },
      include: {
        following: {
          select: {
            id: true,
            username: true,
            displayName: true,
            profileImage: true,
            creatorReputation: true,
          },
        },
      },
    });

    res.status(201).json({
      message: 'Successfully followed user',
      follow,
    });
  } catch (error) {
    console.error('Error following user:', error);
    res.status(500).json({
      error: 'Server error',
      message: error instanceof Error ? error.message : 'Failed to follow user',
    });
  }
});

/**
 * DELETE /api/follows/:userId
 * Unfollow a user
 */
router.delete('/:userId', async (req: Request, res: Response) => {
  try {
    const { userId: followingId } = req.params;
    const followerId = (req.user as any).id;

    // Find the follow relationship
    const follow = await prisma.follow.findUnique({
      where: {
        followerId_followingId: {
          followerId,
          followingId,
        },
      },
    });

    if (!follow) {
      return res.status(404).json({
        error: 'Not found',
        message: 'You are not following this user',
      });
    }

    // Delete the follow relationship
    await prisma.follow.delete({
      where: {
        id: follow.id,
      },
    });

    res.json({
      message: 'Successfully unfollowed user',
    });
  } catch (error) {
    console.error('Error unfollowing user:', error);
    res.status(500).json({
      error: 'Server error',
      message: error instanceof Error ? error.message : 'Failed to unfollow user',
    });
  }
});

/**
 * GET /api/follows/following
 * Get list of users the current user is following
 */
router.get('/following', async (req: Request, res: Response) => {
  try {
    const userId = (req.user as any).id;

    const following = await prisma.follow.findMany({
      where: { followerId: userId },
      include: {
        following: {
          select: {
            id: true,
            username: true,
            displayName: true,
            profileImage: true,
            bio: true,
            creatorReputation: true,
            _count: {
              select: {
                createdLists: true,
                followers: true,
              },
            },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    const users = following.map((f) => ({
      ...f.following,
      followedAt: f.createdAt,
    }));

    res.json({
      following: users,
      total: users.length,
    });
  } catch (error) {
    console.error('Error fetching following:', error);
    res.status(500).json({
      error: 'Server error',
      message: error instanceof Error ? error.message : 'Failed to fetch following',
    });
  }
});

/**
 * GET /api/follows/followers
 * Get list of users following the current user
 */
router.get('/followers', async (req: Request, res: Response) => {
  try {
    const userId = (req.user as any).id;

    const followers = await prisma.follow.findMany({
      where: { followingId: userId },
      include: {
        follower: {
          select: {
            id: true,
            username: true,
            displayName: true,
            profileImage: true,
            bio: true,
            creatorReputation: true,
            _count: {
              select: {
                createdLists: true,
                followers: true,
              },
            },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    const users = followers.map((f) => ({
      ...f.follower,
      followedAt: f.createdAt,
    }));

    res.json({
      followers: users,
      total: users.length,
    });
  } catch (error) {
    console.error('Error fetching followers:', error);
    res.status(500).json({
      error: 'Server error',
      message: error instanceof Error ? error.message : 'Failed to fetch followers',
    });
  }
});

/**
 * GET /api/follows/feed
 * Get activity feed from users you follow (their recent lists)
 */
router.get('/feed', async (req: Request, res: Response) => {
  try {
    const userId = (req.user as any).id;
    const { limit = '20' } = req.query;

    // Get users the current user is following
    const following = await prisma.follow.findMany({
      where: { followerId: userId },
      select: { followingId: true },
    });

    const followingIds = following.map((f) => f.followingId);

    if (followingIds.length === 0) {
      return res.json({
        lists: [],
        total: 0,
      });
    }

    // Get recent public lists from followed users
    const lists = await prisma.list.findMany({
      where: {
        creatorId: { in: followingIds },
        isPublic: true,
      },
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
        _count: {
          select: {
            places: true,
            purchases: true,
            stakes: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
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
    console.error('Error fetching feed:', error);
    res.status(500).json({
      error: 'Server error',
      message: error instanceof Error ? error.message : 'Failed to fetch feed',
    });
  }
});

export default router;
