import { Strategy as JwtStrategy, ExtractJwt, StrategyOptions } from 'passport-jwt';
import { Strategy as LocalStrategy } from 'passport-local';
import { PassportStatic } from 'passport';
import bcrypt from 'bcryptjs';
import { prisma } from '../../config/database';

const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-jwt-key';

// JWT Strategy Options
const jwtOptions: StrategyOptions = {
  jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
  secretOrKey: JWT_SECRET
};

// Initialize Passport with JWT and Local strategies
export const initializePassport = (passport: PassportStatic) => {
  // JWT Strategy - for authenticating API requests
  passport.use(
    new JwtStrategy(jwtOptions, async (jwtPayload, done) => {
      try {
        const user = await prisma.user.findUnique({
          where: { id: jwtPayload.userId },
          select: {
            id: true,
            email: true,
            username: true,
            displayName: true,
            bio: true,
            profileImage: true,
            trustBalance: true,
            creatorReputation: true,
            totalStaked: true,
            createdAt: true
          }
        });

        if (user) {
          return done(null, user);
        } else {
          return done(null, false);
        }
      } catch (error) {
        return done(error, false);
      }
    })
  );

  // Local Strategy - for login with username/email and password
  passport.use(
    new LocalStrategy(
      {
        usernameField: 'email', // Can be email or username
        passwordField: 'password'
      },
      async (emailOrUsername, password, done) => {
        try {
          // Find user by email or username
          const user = await prisma.user.findFirst({
            where: {
              OR: [
                { email: emailOrUsername },
                { username: emailOrUsername }
              ]
            }
          });

          if (!user) {
            return done(null, false, { message: 'Incorrect credentials' });
          }

          // Check password
          const isPasswordValid = await bcrypt.compare(password, user.password);
          if (!isPasswordValid) {
            return done(null, false, { message: 'Incorrect credentials' });
          }

          // Return user without password
          const { password: _, ...userWithoutPassword } = user;
          return done(null, userWithoutPassword);
        } catch (error) {
          return done(error);
        }
      }
    )
  );
};
