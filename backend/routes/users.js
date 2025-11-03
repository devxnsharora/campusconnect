const express = require('express');
const router = express.Router();
const authenticateToken = require('../middleware/auth');
const { 
  getUserProfile, 
  updateUserProfile, 
  deleteUser 
} = require('../controllers/userController');

router.get('/:userId', authenticateToken, getUserProfile);
router.put('/:userId', authenticateToken, updateUserProfile);
router.delete('/:userId', authenticateToken, deleteUser);

module.exports = router;