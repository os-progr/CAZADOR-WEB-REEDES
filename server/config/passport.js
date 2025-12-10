const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const db = require('./db');

// In production, user needs to set these vars
const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID || 'GET_FROM_GOOGLE_CLOUD_CONSOLE';
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET || 'GET_FROM_GOOGLE_CLOUD_CONSOLE';

// Hardcoded Local Callback or Production Callback
const CALLBACK_URL = process.env.NODE_ENV === 'production'
    ? 'https://el-cazador-production.up.railway.app/api/auth/google/callback'
    : 'http://localhost:3000/api/auth/google/callback';

passport.use(new GoogleStrategy({
    clientID: GOOGLE_CLIENT_ID,
    clientSecret: GOOGLE_CLIENT_SECRET,
    callbackURL: CALLBACK_URL
},
    async (accessToken, refreshToken, profile, done) => {
        try {
            // Check if user exists by Google ID
            let user = await db.findUserByGoogleId(profile.id);

            if (user) {
                return done(null, user);
            }

            // Check if email exists (link account)
            const email = profile.emails[0].value;
            user = await db.findUserByEmail(email);

            if (user) {
                // Setup/Update Google ID for existing user? 
                // For now, simpler to just return user or fail if strict.
                // Let's create a new user if not found.
                return done(null, user);
            }

            // Create new Google User
            const newUser = await db.createGoogleUser(profile.displayName, email, profile.id);
            // Normalize user object structure for done()
            const userObj = { id: newUser.lastInsertRowid || newUser.id, ...newUser };
            return done(null, userObj);

        } catch (err) {
            return done(err, null);
        }
    }
));

passport.serializeUser((user, done) => {
    done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
    // In a real app we would fetch by ID, but for JWT we mostly use payload
    // However, for session auth (if used) we need this.
    // We are mixing JWT and Session a bit here for the callback, 
    // but typically we'll convert the session user to a JWT token in the callback route.
    done(null, { id });
});

module.exports = passport;
