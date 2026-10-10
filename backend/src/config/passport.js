const passport = require('passport');
const { Strategy: GoogleStrategy } = require('passport-google-oauth20');
const env = require('./env');
const User = require('../models/User');

const googleOAuthConfigured = Boolean(env.GOOGLE_CLIENT_ID && env.GOOGLE_CLIENT_SECRET);

function createGoogleVerify(UserModel) {
  return async (req, accessToken, refreshToken, profile, done) => {
    try {
      const verifiedEmail = profile.emails?.find((email) => email.verified === true)?.value;
      if (!profile.id || !verifiedEmail || profile._json?.email_verified !== true) {
        return done(null, false, { code: 'unverified_email' });
      }

      const email = verifiedEmail.trim().toLowerCase();
      const intent = req.session?.googleAuthIntent;
      const existingUser = await UserModel.findOne({
        $or: [{ googleId: profile.id }, { email }]
      });

      if (intent === 'signup') {
        if (existingUser) {
          return done(null, false, { code: 'account_exists' });
        }

        const user = await UserModel.create({
          name: profile.displayName?.trim() || 'Google Customer',
          email,
          profileImage: profile.photos?.[0]?.value || '',
          provider: 'google',
          googleId: profile.id,
          isVerified: true,
          role: 'CUSTOMER',
          passwordHash: '',
          isActive: true
        });

        return done(null, user);
      }

      if (intent !== 'login' || !existingUser || existingUser.googleId !== profile.id) {
        return done(null, false, { code: 'account_not_found' });
      }

      if (!existingUser.isActive) {
        return done(null, false, { code: 'account_inactive' });
      }

      if (existingUser.isLocked()) {
        return done(null, false, { code: 'account_locked' });
      }

      existingUser.lastLoginAt = new Date();
      await existingUser.save();
      return done(null, existingUser);
    } catch (error) {
      if (error.code === 11000) {
        return done(null, false, { code: 'account_exists' });
      }
      return done(error);
    }
  };
}

passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id);
    done(null, user?.isActive ? user : false);
  } catch (error) {
    done(error);
  }
});

if (googleOAuthConfigured) {
  passport.use(
    new GoogleStrategy(
      {
        clientID: env.GOOGLE_CLIENT_ID,
        clientSecret: env.GOOGLE_CLIENT_SECRET,
        callbackURL: new URL('/api/auth/google/callback', env.API_URL).toString(),
        passReqToCallback: true,
        state: true
      },
      createGoogleVerify(User)
    )
  );
}

module.exports = { passport, googleOAuthConfigured, createGoogleVerify };
