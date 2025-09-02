const GitHubStrategy = require('passport-github2').Strategy;
const User = require('../models/User');
const dotenv = require('dotenv');

dotenv.config();

module.exports = (passport) =>{
  passport.use(new GitHubStrategy(
      {
        clientID: process.env.GITHUB_CLIENT_ID,
        clientSecret: process.env.GITHUB_CLIENT_SECRET,
        callbackURL: process.env.GITHUB_CALLBACK_URL
      },
      async (accessToken, refreshToken, profile, done) =>{
        try {
          const existingUser =await User.findOne({githubId: profile.id});

          if (existingUser){
            return done(null, existingUser);
          }

          const email =profile.emails?.[0]?.value;
          let user =await User.findOne({email});

          if (user) {
            user.githubId = profile.id;
            await user.save();
            return done(null,user);
          }
          const newUser =await User.create({
            githubId: profile.id,
            email: email || `github_${profile.id}@no-email.com`,
            username: profile.username || profile.displayName
          });

          done(null, newUser);
        } catch (err) {done(err,false);}
      }
    )
  );

  passport.serializeUser((user,done) =>{done(null, user.id);});

  passport.deserializeUser(async (id, done) =>{
    try {
      const user =await User.findById(id);
      done(null, user);
    } catch (err){
      done(err,null);
    }
  });
};