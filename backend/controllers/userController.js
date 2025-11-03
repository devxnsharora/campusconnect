const User = require('../models/User');

// @desc    Get user profile
// @route   GET /api/users/:userId
// @access  Private
exports.getUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.params.userId).select('-password');
    
    if (!user) {
      return res.status(404).json({ 
        success: false,
        error: 'User not found' 
      });
    }

    res.json({ 
      success: true,
      user 
    });
  } catch (error) {
    res.status(500).json({ 
      success: false,
      error: error.message 
    });
  }
};

// @desc    Update user profile
// @route   PUT /api/users/:userId
// @access  Private
exports.updateUserProfile = async (req, res) => {
  try {
    // Check authorization
    if (req.user.userId !== req.params.userId) {
      return res.status(403).json({ 
        success: false,
        error: 'Unauthorized to update this profile' 
      });
    }

    const { major, year, bio, avatar } = req.body;
    
    const user = await User.findByIdAndUpdate(
      req.params.userId,
      { 
        $set: { 
          'profile.major': major,
          'profile.year': year,
          'profile.bio': bio,
          'profile.avatar': avatar
        } 
      },
      { new: true, runValidators: true }
    ).select('-password');

    res.json({ 
      success: true,
      user 
    });
  } catch (error) {
    res.status(500).json({ 
      success: false,
      error: error.message 
    });
  }
};

// @desc    Delete user account
// @route   DELETE /api/users/:userId
// @access  Private
exports.deleteUser = async (req, res) => {
  try {
    // Check authorization
    if (req.user.userId !== req.params.userId) {
      return res.status(403).json({ 
        success: false,
        error: 'Unauthorized to delete this account' 
      });
    }

    await User.findByIdAndDelete(req.params.userId);
    
    // Also delete user's posts
    const Post = require('../models/Post');
    await Post.deleteMany({ userId: req.params.userId });

    res.json({ 
      success: true,
      message: 'User account deleted successfully' 
    });
  } catch (error) {
    res.status(500).json({ 
      success: false,
      error: error.message 
    });
  }
};