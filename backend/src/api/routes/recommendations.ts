import { Router, Request, Response } from 'express';
import { prisma } from '../../config/database';
import { authenticateJWT } from '../middleware/auth';

const router = Router();

// All routes require authentication
router.use(authenticateJWT);

/**
 * GET /api/recommendations
 * Get personalized list recommendations based on user activity
 */
router.get('/', async (req: Request, res: Response) => {
  try {
    const userId = (req.user as any).id;
    const { limit = '10' } = req.query;
    const maxResults = parseInt(limit as string, 10);

    // Get user's purchase history to understand their interests
    const purchases = await prisma.purchase.findMany({
      where: { userId },
      select: {
        list: {
          select: {
            category: true,
            city: true,
          },
        },
      },
    });

    // Get categories and cities user is interested in
    const interestedCategories = [...new Set(purchases.map(p => p.list.category).filter(Boolean))];
    const interestedCities = [...new Set(purchases.map(p => p.list.city).filter(Boolean))];

    // Get creators user has staked on (shows trust)
    const stakes = await prisma.stake.findMany({
      where: { userId },
      select: {
        list: {
          select: { creatorId: true },
        },
      },
    });

    const trustedCreatorIds = [...new Set(stakes.map(s => s.list.creatorId))];

    // Get creators user follows
    const following = await prisma.follow.findMany({
      where: { followerId: userId },
      select: { followingId: true },
    });

    const followedCreatorIds = following.map(f => f.followingId);

    // Get lists user already owns or has access to
    const ownedListIds = await prisma.list.findMany({
      where: {
        OR: [
          { creatorId: userId },
          {
            purchases: {
              some: { userId },
            },
          },
          {
            savedLists: {
              some: { userId },
            },
          },
        ],
      },
      select: { id: true },
    });

    const ownedIds = ownedListIds.map(l => l.id);

    // Build recommendation query
    const recommendations = await prisma.list.findMany({
      where: {
        isPublic: true,
        id: { notIn: ownedIds }, // Exclude already owned
        OR: [
          // Lists from followed creators
          ...(followedCreatorIds.length > 0
            ? [{ creatorId: { in: followedCreatorIds } }]
            : []),
          // Lists from trusted creators (staked on)
          ...(trustedCreatorIds.length > 0
            ? [{ creatorId: { in: trustedCreatorIds } }]
            : []),
          // Lists in interested categories
          ...(interestedCategories.length > 0
            ? [{ category: { in: interestedCategories as string[] } }]
            : []),
          // Lists in interested cities
          ...(interestedCities.length > 0
            ? [{ city: { in: interestedCities as string[] } }]
            : []),
          // High trust rank lists (fallback)
          { trustRank: { gte: 7.0 } },
        ],
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
      orderBy: [
        { trustRank: 'desc' },
        { totalStaked: 'desc' },
        { createdAt: 'desc' },
      ],
      take: maxResults * 2, // Get extra for scoring
    });

    // Score recommendations based on multiple factors
    const scoredRecommendations = recommendations.map(list => {
      let score = 0;
      let reasons: string[] = [];

      // High score for followed creators
      if (followedCreatorIds.includes(list.creatorId)) {
        score += 50;
        reasons.push('From a creator you follow');
      }

      // High score for trusted creators (staked)
      if (trustedCreatorIds.includes(list.creatorId)) {
        score += 40;
        reasons.push('From a creator you trust');
      }

      // Medium score for matching categories
      if (list.category && interestedCategories.includes(list.category)) {
        score += 30;
        reasons.push(`Similar to your ${list.category} interests`);
      }

      // Medium score for matching cities
      if (list.city && interestedCities.includes(list.city)) {
        score += 25;
        reasons.push(`In ${list.city}`);
      }

      // Trust rank contribution
      score += list.trustRank * 2;

      // Popularity contribution
      score += list.totalStaked / 100;
      score += list._count.purchases / 10;

      // Add general reason if no specific ones
      if (reasons.length === 0) {
        reasons.push('Popular in the community');
      }

      return {
        ...list,
        placeCount: list._count.places,
        recommendationScore: score,
        recommendationReasons: reasons,
      };
    });

    // Sort by score and take top results
    const topRecommendations = scoredRecommendations
      .sort((a, b) => b.recommendationScore - a.recommendationScore)
      .slice(0, maxResults);

    res.json({
      recommendations: topRecommendations,
      total: topRecommendations.length,
      meta: {
        basedOn: {
          categories: interestedCategories,
          cities: interestedCities,
          followedCreators: followedCreatorIds.length,
          trustedCreators: trustedCreatorIds.length,
        },
      },
    });
  } catch (error) {
    console.error('Error fetching recommendations:', error);
    res.status(500).json({
      error: 'Server error',
      message: error instanceof Error ? error.message : 'Failed to fetch recommendations',
    });
  }
});

export default router;
