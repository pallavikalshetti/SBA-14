const express = require('express');
const router = express.Router();
const Bookmark = require('../models/Bookmark');
const { authMiddleware } = require('../utils/auth');

router.use(authMiddleware);

router.get('/',async (req, res) =>{
  try {
    const bookmarks = await Bookmark.find({user: req.user._id});
    res.json(bookmarks);
  } catch (err) {
    res.status(500).json({ message:'failed to fetch bookmarks'});
  }
});

router.get('/:id', async(req,res) =>{
  try {
    const bookmark = await Bookmark.findById(req.params.id);
    if (!bookmark) return res.status(404).json({message:'Bookmark not found'});

    if (!bookmark.user.equals(req.user._id)) {
      return res.status(403).json({message: 'not authorized'});
    }

    res.json(bookmark);
  } catch (err) {
    res.status(500).json({message:'failed bookmark'});
  }
});

router.post('/', async (req, res) =>{
  try {
    const newBookmark = new Bookmark({...req.body,user: req.user._id});

    const saved = await newBookmark.save();
    res.status(201).json(saved);
  } catch (err) {
    res.status(400).json({message:'failed to create bookmark', error: err.message});
  }
});

router.put('/:id', async(req, res) =>{
  try {
    const bookmark = await Bookmark.findById(req.params.id);
    if (!bookmark) return res.status(404).json({ message:'bookmark not found'});

    if (!bookmark.user.equals(req.user._id)) {
      return res.status(403).json({message:'not authorized'});
    }

    Object.assign(bookmark,req.body);
    const updated = await bookmark.save();
    res.json(updated);
  } catch (err) {
    res.status(400).json({message:'failed to update', error: err.message});
  }
});

router.delete('/:id', async (req, res) =>{
  try {
    const bookmark = await Bookmark.findById(req.params.id);
    if (!bookmark) return res.status(404).json({message:'bookmark not found'});

    if (!bookmark.user.equals(req.user._id)) {
      return res.status(403).json({message: 'not authorized to delete'});
    }

    await bookmark.deleteOne();
    res.json({message:'deleted'});
  } catch (err) {
    res.status(500).json({message:'failed to delete'});
  }
});

module.exports = router;