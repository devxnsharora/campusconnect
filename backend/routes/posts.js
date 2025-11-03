const express = require('express');
const router = express.Router();
const authenticateToken = require('../middleware/auth');
const {
  createPost,
  getAllPosts,
  getPost,
  updatePost,
  deletePost,
  addComment,
  deleteComment,
  toggleLike
} = require('../controllers/postController');

// Post routes
router.post('/', authenticateToken, createPost);
router.get('/', authenticateToken, getAllPosts);
router.get('/:postId', authenticateToken, getPost);
router.put('/:postId', authenticateToken, updatePost);
router.delete('/:postId', authenticateToken, deletePost);

// Comment routes
router.post('/:postId/comments', authenticateToken, addComment);
router.delete('/:postId/comments/:commentId', authenticateToken, deleteComment);

// Like routes
router.post('/:postId/like', authenticateToken, toggleLike);

module.exports = router;