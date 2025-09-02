const express = require('express');
const router = express.Router();
const User = require('../models/User');
const { signToken } = require('../utils/auth');
const passport = require('passport');

router.post('/register', async(req, res)=>{
  try {
    const {email, password, username} =req.body;

    if (!email || !password) {
      return res.status(400).json({message:'email and password are required.'});
    }

    const existing = await User.findOne({email});
    if (existing) {
      return res.status(409).json({ message:'user already exists'});
    }

    const user = new User({email, password, username});
    await user.save();

    const token = signToken(user);
    res.status(201).json({token});
  } catch (err) {
    res.status(500).json({message:'server error during registration'});
  }
});

router.post('/login',async(req,res) =>{
  try {
    const {email, password}=req.body;

    const user = await User.findOne({email});
    if (!user || !user.password) {
      return res.status(401).json({ message:'invalid credentials'});
    }

    const isValid = await user.comparePassword(password);
    if (!isValid) {
      return res.status(401).json({ message: 'invalid credentials'});
    }

    const token = signToken(user);
    res.json({ token });
  } catch (err) {
    res.status(500).json({ message: 'server error during login.'});
  }
});
router.get('/auth/github',passport.authenticate('github', {scope: ['user:email']}));

router.get('/auth/github/callback',passport.authenticate('github', {session: false, failureRedirect:'/login'}),
  (req, res) => {
        const token = signToken(req.user);
    res.redirect(`http://localhost:3001/oauth-success?token=${token}`);
}
);

module.exports = router;