import { Router, Request, Response } from 'express';
import { body, param, validationResult } from 'express-validator';
import { prisma } from '../../config/database';
import { authenticateJWT } from '../middleware/auth';
import { updateReputationAfterReview } from '../../services/reputationService';

const router = Router();

// All routes require authentication
router.use(authenticateJWT);

// POST /api/reviews/list/:listId - Submit or update a review
router.post(
  '/list/:listId',
  [
    param('listId').isUUID().withMessage('Invalid list ID'),
    body('rating')
      .isInt({ min: 1, max: 5 })
      .withMessage('Rating must be between 1 and 5'),
    body('comment')
      .optional()
      .isString()
      .isLength({ max: 500 })
      .withMessage('Comment must be 500 characters or less')
  ],
  async (req: Request, res: Response) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { listId } = req.params;
      const { rating, comment } = req.body;
      const userId = req.user!.id;

      // Validate list exists
      const list = await prisma.list.findUnique({
        where: { id: listId },
        include: { creator: true }
      });

      if (!list) {
        return res.status(404).json({ error: 'List not found' });
      }

      // Cannot review own list
      if (list.creatorId === userId) {
        return res.status(400).json({ error: 'Cannot review your own list' });
      }

      // Check if user has already reviewed this list
      const existingReview = await prisma.review.findUnique({
        where: {
          userId_listId: {
            userId,
            listId
          }
        }
      });

      let review;
      if (existingReview) {
        // Update existing review
        review = await prisma.review.update({
          where: { id: existingReview.id },
          data: {
            rating,
            comment: comment || null
          },
          include: {
            user: {
              select: {
                id: true,
                username: true,
                displayName: true,
                profileImage: true
              }
            }
          }
        });
      } else {
        // Create new review
        review = await prisma.review.create({
          data: {
            userId,
            listId,
            rating,
            comment: comment || null
          },
          include: {
            user: {
              select: {
                id: true,
                username: true,
                displayName: true,
                profileImage: true
              }
            }
          }
        });
      }

      // Recalculate average rating for the list
      const reviews = await prisma.review.findMany({
        where: { listId },
        select: { rating: true }
      });

      const averageRating = reviews.length > 0
        ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
        : null;

      // Update list with new average rating
      await prisma.list.update({
        where: { id: listId },
        data: { averageRating }
      });

      // Update reputation for list creator
      await updateReputationAfterReview(listId);

      return res.status(existingReview ? 200 : 201).json({
        message: existingReview ? 'Review updated successfully' : 'Review submitted successfully',
        review,
        listAverageRating: averageRating
      });
    } catch (error) {
      console.error('Error submitting review:', error);
      return res.status(500).json({ error: 'Failed to submit review' });
    }
  }
);

// GET /api/reviews/list/:listId - Get all reviews for a list
router.get(
  '/list/:listId',
  [param('listId').isUUID().withMessage('Invalid list ID')],
  async (req: Request, res: Response) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { listId } = req.params;

      // Validate list exists
      const list = await prisma.list.findUnique({
        where: { id: listId }
      });

      if (!list) {
        return res.status(404).json({ error: 'List not found' });
      }

      // Get all reviews with user information
      const reviews = await prisma.review.findMany({
        where: { listId },
        include: {
          user: {
            select: {
              id: true,
              username: true,
              displayName: true,
              profileImage: true
            }
          }
        },
        orderBy: { createdAt: 'desc' }
      });

      // Calculate rating distribution
      const ratingCounts = [0, 0, 0, 0, 0]; // Index 0-4 for ratings 1-5
      reviews.forEach(review => {
        ratingCounts[review.rating - 1]++;
      });

      const averageRating = reviews.length > 0
        ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
        : null;

      return res.json({
        reviews,
        totalReviews: reviews.length,
        averageRating,
        ratingDistribution: {
          1: ratingCounts[0],
          2: ratingCounts[1],
          3: ratingCounts[2],
          4: ratingCounts[3],
          5: ratingCounts[4]
        }
      });
    } catch (error) {
      console.error('Error fetching reviews:', error);
      return res.status(500).json({ error: 'Failed to fetch reviews' });
    }
  }
);

// PUT /api/reviews/:reviewId - Edit own review
router.put(
  '/:reviewId',
  [
    param('reviewId').isUUID().withMessage('Invalid review ID'),
    body('rating')
      .isInt({ min: 1, max: 5 })
      .withMessage('Rating must be between 1 and 5'),
    body('comment')
      .optional()
      .isString()
      .isLength({ max: 500 })
      .withMessage('Comment must be 500 characters or less')
  ],
  async (req: Request, res: Response) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { reviewId } = req.params;
      const { rating, comment } = req.body;
      const userId = req.user!.id;

      // Find the review
      const existingReview = await prisma.review.findUnique({
        where: { id: reviewId }
      });

      if (!existingReview) {
        return res.status(404).json({ error: 'Review not found' });
      }

      // Verify ownership
      if (existingReview.userId !== userId) {
        return res.status(403).json({ error: 'You can only edit your own reviews' });
      }

      // Update the review
      const updatedReview = await prisma.review.update({
        where: { id: reviewId },
        data: {
          rating,
          comment: comment || null
        },
        include: {
          user: {
            select: {
              id: true,
              username: true,
              displayName: true,
              profileImage: true
            }
          }
        }
      });

      // Recalculate average rating for the list
      const reviews = await prisma.review.findMany({
        where: { listId: existingReview.listId },
        select: { rating: true }
      });

      const averageRating = reviews.length > 0
        ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
        : null;

      // Update list with new average rating
      await prisma.list.update({
        where: { id: existingReview.listId },
        data: { averageRating }
      });

      // Update reputation for list creator
      await updateReputationAfterReview(existingReview.listId);

      return res.json({
        message: 'Review updated successfully',
        review: updatedReview,
        listAverageRating: averageRating
      });
    } catch (error) {
      console.error('Error updating review:', error);
      return res.status(500).json({ error: 'Failed to update review' });
    }
  }
);

// DELETE /api/reviews/:reviewId - Delete own review
router.delete(
  '/:reviewId',
  [param('reviewId').isUUID().withMessage('Invalid review ID')],
  async (req: Request, res: Response) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { reviewId } = req.params;
      const userId = req.user!.id;

      // Find the review
      const existingReview = await prisma.review.findUnique({
        where: { id: reviewId }
      });

      if (!existingReview) {
        return res.status(404).json({ error: 'Review not found' });
      }

      // Verify ownership
      if (existingReview.userId !== userId) {
        return res.status(403).json({ error: 'You can only delete your own reviews' });
      }

      const listId = existingReview.listId;

      // Delete the review
      await prisma.review.delete({
        where: { id: reviewId }
      });

      // Recalculate average rating for the list
      const reviews = await prisma.review.findMany({
        where: { listId },
        select: { rating: true }
      });

      const averageRating = reviews.length > 0
        ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
        : null;

      // Update list with new average rating
      await prisma.list.update({
        where: { id: listId },
        data: { averageRating }
      });

      // Update reputation for list creator
      await updateReputationAfterReview(listId);

      return res.json({
        message: 'Review deleted successfully',
        listAverageRating: averageRating
      });
    } catch (error) {
      console.error('Error deleting review:', error);
      return res.status(500).json({ error: 'Failed to delete review' });
    }
  }
);

export default router;
