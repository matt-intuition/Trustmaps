import { Request, Response, NextFunction } from 'express';
import passport from 'passport';

/**
 * Custom JWT authentication middleware that returns JSON errors
 * instead of plain text "Unauthorized" responses
 */
export const authenticateJWT = (req: Request, res: Response, next: NextFunction) => {
  passport.authenticate('jwt', { session: false }, (err: any, user: any, info: any) => {
    if (err) {
      return res.status(500).json({
        error: 'Authentication error',
        message: err.message
      });
    }
    if (!user) {
      return res.status(401).json({
        error: 'Unauthorized',
        message: 'Please login to continue'
      });
    }
    req.user = user;
    next();
  })(req, res, next);
};
