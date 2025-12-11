import { Router, Request, Response } from 'express';
import { body, param, validationResult } from 'express-validator';
import { prisma } from '../../config/database';
import { authenticateJWT } from '../middleware/auth';
import { updateReputationAfterStake } from '../../services/reputationService';

const router = Router();

// All routes require authentication
router.use(authenticateJWT);

// POST /api/stakes/list/:listId - Stake TRUST on a list
router.post(
  '/list/:listId',
  [
    param('listId').isUUID().withMessage('Invalid list ID'),
    body('amount')
      .isInt({ min: 1 })
      .withMessage('Stake amount must be a positive integer')
  ],
  async (req: Request, res: Response) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { listId } = req.params;
      const { amount } = req.body;
      const userId = req.user!.id;

      // Validate list exists and is published
      const list = await prisma.list.findUnique({
        where: { id: listId },
        include: { creator: true }
      });

      if (!list) {
        return res.status(404).json({ error: 'List not found' });
      }

      if (!list.isPublic) {
        return res.status(400).json({ error: 'Cannot stake on unpublished lists' });
      }

      // Check if user has sufficient TRUST balance
      const user = await prisma.user.findUnique({
        where: { id: userId }
      });

      if (!user || user.trustBalance < amount) {
        return res.status(400).json({
          error: 'Insufficient TRUST balance',
          available: user?.trustBalance || 0,
          required: amount
        });
      }

      // For paid lists, verify user has purchased before allowing stake
      if (!list.isFree) {
        const purchase = await prisma.purchase.findUnique({
          where: {
            userId_listId: {
              userId,
              listId
            }
          }
        });

        if (!purchase) {
          return res.status(403).json({
            error: 'You must purchase this list before staking on it'
          });
        }
      }

      // Check if user already has a stake on this list
      const existingStake = await prisma.stake.findUnique({
        where: {
          userId_listId: {
            userId,
            listId
          }
        }
      });

      if (existingStake) {
        // Update existing stake
        const [updatedStake, updatedUser, updatedList] = await prisma.$transaction([
          prisma.stake.update({
            where: { id: existingStake.id },
            data: {
              amount: existingStake.amount + amount
            }
          }),
          prisma.user.update({
            where: { id: userId },
            data: {
              trustBalance: { decrement: amount },
              totalStaked: { increment: amount }
            }
          }),
          prisma.list.update({
            where: { id: listId },
            data: {
              totalStaked: { increment: amount }
            }
          })
        ]);

        // Update reputation after stake
        await updateReputationAfterStake(userId, listId, 'list');

        return res.json({
          message: 'Stake increased successfully',
          stake: updatedStake,
          newBalance: updatedUser.trustBalance
        });
      } else {
        // Create new stake
        const [newStake, updatedUser, updatedList] = await prisma.$transaction([
          prisma.stake.create({
            data: {
              userId,
              listId,
              amount
            }
          }),
          prisma.user.update({
            where: { id: userId },
            data: {
              trustBalance: { decrement: amount },
              totalStaked: { increment: amount }
            }
          }),
          prisma.list.update({
            where: { id: listId },
            data: {
              totalStaked: { increment: amount }
            }
          })
        ]);

        // Update reputation after stake
        await updateReputationAfterStake(userId, listId, 'list');

        return res.status(201).json({
          message: 'Staked successfully',
          stake: newStake,
          newBalance: updatedUser.trustBalance
        });
      }
    } catch (error) {
      console.error('Error staking on list:', error);
      return res.status(500).json({ error: 'Failed to stake on list' });
    }
  }
);

// POST /api/stakes/user/:userId - Stake TRUST on a creator
router.post(
  '/user/:userId',
  [
    param('userId').isUUID().withMessage('Invalid user ID'),
    body('amount')
      .isInt({ min: 1 })
      .withMessage('Stake amount must be a positive integer')
  ],
  async (req: Request, res: Response) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { userId: creatorId } = req.params;
      const { amount } = req.body;
      const stakerId = req.user!.id;

      // Cannot stake on yourself
      if (stakerId === creatorId) {
        return res.status(400).json({ error: 'Cannot stake on yourself' });
      }

      // Validate creator exists
      const creator = await prisma.user.findUnique({
        where: { id: creatorId }
      });

      if (!creator) {
        return res.status(404).json({ error: 'Creator not found' });
      }

      // Check if staker has sufficient TRUST balance
      const staker = await prisma.user.findUnique({
        where: { id: stakerId }
      });

      if (!staker || staker.trustBalance < amount) {
        return res.status(400).json({
          error: 'Insufficient TRUST balance',
          available: staker?.trustBalance || 0,
          required: amount
        });
      }

      // Check if staker already has a stake on this creator
      const existingStake = await prisma.userStake.findUnique({
        where: {
          stakerId_creatorId: {
            stakerId,
            creatorId
          }
        }
      });

      if (existingStake) {
        // Update existing stake
        const [updatedStake, updatedStaker, updatedCreator] = await prisma.$transaction([
          prisma.userStake.update({
            where: { id: existingStake.id },
            data: {
              amount: existingStake.amount + amount
            }
          }),
          prisma.user.update({
            where: { id: stakerId },
            data: {
              trustBalance: { decrement: amount },
              totalStaked: { increment: amount }
            }
          }),
          prisma.user.update({
            where: { id: creatorId },
            data: {
              totalStaked: { increment: amount }
            }
          })
        ]);

        // Update reputation after stake
        await updateReputationAfterStake(stakerId, creatorId, 'creator');

        return res.json({
          message: 'Stake increased successfully',
          stake: updatedStake,
          newBalance: updatedStaker.trustBalance
        });
      } else {
        // Create new stake
        const [newStake, updatedStaker, updatedCreator] = await prisma.$transaction([
          prisma.userStake.create({
            data: {
              stakerId,
              creatorId,
              amount
            }
          }),
          prisma.user.update({
            where: { id: stakerId },
            data: {
              trustBalance: { decrement: amount },
              totalStaked: { increment: amount }
            }
          }),
          prisma.user.update({
            where: { id: creatorId },
            data: {
              totalStaked: { increment: amount }
            }
          })
        ]);

        // Update reputation after stake
        await updateReputationAfterStake(stakerId, creatorId, 'creator');

        return res.status(201).json({
          message: 'Staked successfully',
          stake: newStake,
          newBalance: updatedStaker.trustBalance
        });
      }
    } catch (error) {
      console.error('Error staking on creator:', error);
      return res.status(500).json({ error: 'Failed to stake on creator' });
    }
  }
);

// GET /api/stakes - Get user's staking positions
router.get('/', async (req: Request, res: Response) => {
  try {
    const userId = req.user!.id;

    // Get stakes on lists
    const listStakes = await prisma.stake.findMany({
      where: { userId },
      include: {
        list: {
          include: {
            creator: {
              select: {
                id: true,
                username: true,
                displayName: true,
                profileImage: true
              }
            }
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    // Get stakes on creators
    const creatorStakes = await prisma.userStake.findMany({
      where: { stakerId: userId },
      include: {
        creator: {
          select: {
            id: true,
            username: true,
            displayName: true,
            profileImage: true,
            creatorReputation: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    // Calculate APR for each stake
    const listStakesWithAPR = listStakes.map(stake => {
      const apr = stake.amount > 0
        ? ((stake.earnedRevenue / stake.amount) * 100).toFixed(2)
        : '0.00';

      return {
        ...stake,
        apr: parseFloat(apr)
      };
    });

    return res.json({
      listStakes: listStakesWithAPR,
      creatorStakes,
      totalStaked: listStakes.reduce((sum, s) => sum + s.amount, 0) +
                   creatorStakes.reduce((sum, s) => sum + s.amount, 0),
      totalEarned: listStakes.reduce((sum, s) => sum + s.earnedRevenue, 0)
    });
  } catch (error) {
    console.error('Error fetching stakes:', error);
    return res.status(500).json({ error: 'Failed to fetch stakes' });
  }
});

// DELETE /api/stakes/list/:listId - Unstake from a list
router.delete(
  '/list/:listId',
  [param('listId').isUUID().withMessage('Invalid list ID')],
  async (req: Request, res: Response) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { listId } = req.params;
      const userId = req.user!.id;

      // Find the stake
      const stake = await prisma.stake.findUnique({
        where: {
          userId_listId: {
            userId,
            listId
          }
        }
      });

      if (!stake) {
        return res.status(404).json({ error: 'Stake not found' });
      }

      // Return TRUST tokens to user and remove stake
      const [deletedStake, updatedUser, updatedList] = await prisma.$transaction([
        prisma.stake.delete({
          where: { id: stake.id }
        }),
        prisma.user.update({
          where: { id: userId },
          data: {
            trustBalance: { increment: stake.amount },
            totalStaked: { decrement: stake.amount }
          }
        }),
        prisma.list.update({
          where: { id: listId },
          data: {
            totalStaked: { decrement: stake.amount }
          }
        })
      ]);

      return res.json({
        message: 'Unstaked successfully',
        returnedAmount: stake.amount,
        earnedRevenue: stake.earnedRevenue,
        newBalance: updatedUser.trustBalance
      });
    } catch (error) {
      console.error('Error unstaking from list:', error);
      return res.status(500).json({ error: 'Failed to unstake from list' });
    }
  }
);

// DELETE /api/stakes/user/:userId - Unstake from a creator
router.delete(
  '/user/:userId',
  [param('userId').isUUID().withMessage('Invalid user ID')],
  async (req: Request, res: Response) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { userId: creatorId } = req.params;
      const stakerId = req.user!.id;

      // Find the stake
      const stake = await prisma.userStake.findUnique({
        where: {
          stakerId_creatorId: {
            stakerId,
            creatorId
          }
        }
      });

      if (!stake) {
        return res.status(404).json({ error: 'Stake not found' });
      }

      // Return TRUST tokens to staker and remove stake
      const [deletedStake, updatedStaker, updatedCreator] = await prisma.$transaction([
        prisma.userStake.delete({
          where: { id: stake.id }
        }),
        prisma.user.update({
          where: { id: stakerId },
          data: {
            trustBalance: { increment: stake.amount },
            totalStaked: { decrement: stake.amount }
          }
        }),
        prisma.user.update({
          where: { id: creatorId },
          data: {
            totalStaked: { decrement: stake.amount }
          }
        })
      ]);

      return res.json({
        message: 'Unstaked successfully',
        returnedAmount: stake.amount,
        newBalance: updatedStaker.trustBalance
      });
    } catch (error) {
      console.error('Error unstaking from creator:', error);
      return res.status(500).json({ error: 'Failed to unstake from creator' });
    }
  }
);

export default router;
