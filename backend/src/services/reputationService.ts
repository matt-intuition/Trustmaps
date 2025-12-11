import { prisma } from '../config/database';

/**
 * Calculate and update creator reputation based on multiple factors:
 * - TRUST staked on user's lists (30% weight)
 * - TRUST staked on user profile (20% weight)
 * - Average ratings on user's lists (weighted by list trustRank)
 * - Total sales revenue (50% weight)
 * - Staker ROI percentage (20% weight)
 * - Number of unique stakers (10% weight per staker)
 * - High-quality lists count (trustRank > 80, 5 points each)
 */
export async function updateCreatorReputation(userId: string): Promise<number> {
  try {
    // Get creator's published lists
    const lists = await prisma.list.findMany({
      where: {
        creatorId: userId,
        isPublic: true
      },
      include: {
        stakes: true,
        reviews: true
      }
    });

    // Calculate total TRUST staked on creator's lists
    const totalListStakes = lists.reduce((sum, list) => sum + list.totalStaked, 0);

    // Calculate total TRUST staked on creator profile
    const userStakes = await prisma.userStake.findMany({
      where: { creatorId: userId }
    });
    const totalProfileStakes = userStakes.reduce((sum, stake) => sum + stake.amount, 0);

    // Calculate weighted average rating (weighted by trustRank)
    let totalWeightedRating = 0;
    let totalWeight = 0;
    lists.forEach(list => {
      if (list.averageRating) {
        const weight = Math.max(list.trustRank, 1); // Minimum weight of 1
        totalWeightedRating += list.averageRating * weight;
        totalWeight += weight;
      }
    });
    const avgRating = totalWeight > 0 ? totalWeightedRating / totalWeight : 0;

    // Get user's total sales
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        purchases: true
      }
    });

    if (!user) {
      throw new Error(`User ${userId} not found`);
    }

    const totalSales = lists.reduce((sum, list) => sum + list.totalEarnings, 0);

    // Calculate staker ROI
    let totalStakerROI = 0;
    let stakerCount = 0;

    // Get all stakes on creator's lists
    const allListStakes = lists.flatMap(list => list.stakes);
    allListStakes.forEach(stake => {
      if (stake.amount > 0) {
        const roi = (stake.earnedRevenue / stake.amount) * 100;
        totalStakerROI += roi;
        stakerCount++;
      }
    });

    // Add user stakes
    userStakes.forEach(stake => {
      // For user stakes, we don't have earned revenue tracked yet
      // So we'll use a simplified calculation based on creator's performance
      stakerCount++;
    });

    const avgStakerROI = stakerCount > 0 ? totalStakerROI / stakerCount : 0;

    // Count unique stakers across all lists and user stakes
    const uniqueStakerIds = new Set([
      ...allListStakes.map(s => s.userId),
      ...userStakes.map(s => s.stakerId)
    ]);
    const uniqueStakerCount = uniqueStakerIds.size;

    // Count high-quality lists (trustRank > 80)
    const highQualityListCount = lists.filter(list => list.trustRank > 80).length;

    // Calculate reputation score
    const reputation =
      totalListStakes * 0.3 +                  // TRUST on lists (30% weight)
      totalProfileStakes * 0.2 +               // TRUST on profile (20% weight)
      avgRating * 10 +                         // Ratings (scaled by 10)
      totalSales * 0.5 +                       // Sales (50% weight)
      avgStakerROI * 0.2 +                     // Staker ROI (20% weight)
      uniqueStakerCount * 0.1 +                // Unique stakers (0.1 per staker)
      highQualityListCount * 5;                // High-quality lists (5 points each)

    // Update user's reputation
    await prisma.user.update({
      where: { id: userId },
      data: {
        creatorReputation: Math.max(0, reputation) // Ensure non-negative
      }
    });

    console.log(`Updated reputation for user ${userId}: ${reputation.toFixed(2)}`);

    return reputation;
  } catch (error) {
    console.error(`Error updating reputation for user ${userId}:`, error);
    throw error;
  }
}

/**
 * Update reputation for both the buyer and creator after a purchase
 */
export async function updateReputationAfterPurchase(
  buyerId: string,
  creatorId: string
): Promise<void> {
  try {
    // Update creator's reputation (primary impact)
    await updateCreatorReputation(creatorId);

    // Optionally update buyer's reputation if they become a curator
    // For now, we focus on creator reputation
  } catch (error) {
    console.error('Error updating reputation after purchase:', error);
    // Don't throw - we don't want purchase to fail if reputation update fails
  }
}

/**
 * Update reputation after a stake is created or removed
 */
export async function updateReputationAfterStake(
  stakerId: string,
  targetId: string,
  targetType: 'list' | 'creator'
): Promise<void> {
  try {
    if (targetType === 'list') {
      // Get the list to find the creator
      const list = await prisma.list.findUnique({
        where: { id: targetId },
        select: { creatorId: true }
      });

      if (list) {
        await updateCreatorReputation(list.creatorId);
      }
    } else if (targetType === 'creator') {
      // Direct stake on creator
      await updateCreatorReputation(targetId);
    }

    // Optionally update staker's reputation
    // await updateCreatorReputation(stakerId);
  } catch (error) {
    console.error('Error updating reputation after stake:', error);
    // Don't throw - we don't want stake to fail if reputation update fails
  }
}

/**
 * Update reputation after a review is submitted or updated
 */
export async function updateReputationAfterReview(
  listId: string
): Promise<void> {
  try {
    // Get the list to find the creator
    const list = await prisma.list.findUnique({
      where: { id: listId },
      select: { creatorId: true }
    });

    if (list) {
      await updateCreatorReputation(list.creatorId);
    }
  } catch (error) {
    console.error('Error updating reputation after review:', error);
    // Don't throw - we don't want review to fail if reputation update fails
  }
}

/**
 * Update reputation after a list is published
 */
export async function updateReputationAfterPublish(
  creatorId: string
): Promise<void> {
  try {
    await updateCreatorReputation(creatorId);
  } catch (error) {
    console.error('Error updating reputation after publish:', error);
    // Don't throw - we don't want publish to fail if reputation update fails
  }
}
