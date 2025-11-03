const Post = require('../models/Post');

// @desc    Create new post
// @route   POST /api/posts
// @access  Private
exports.createPost = async (req, res) => {
  try {
    const { title, content, category, tags } = req.body;

    const post = await Post.create({
      userId: req.user.userId,
      title,
      content,
      category,
      tags: tags || [],
      comments: [],
      likes: []
    });

    await post.populate('userId', 'username profile');

    res.status(201).json({ 
      success: true,
      post 
    });
  } catch (error) {
    res.status(500).json({ 
      success: false,
      error: error.message 
    });
  }
};

// @desc    Get all posts
// @route   GET /api/posts
// @access  Private
exports.getAllPosts = async (req, res) => {
  try {
    const { category, search } = req.query;
    
    let query = {};
    
    // Filter by category
    if (category && category !== 'All') {
      query.category = category;
    }
    
    // Search in title and content
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { content: { $regex: search, $options: 'i' } },
        { tags: { $in: [new RegExp(search, 'i')] } }
      ];
    }

    const posts = await Post.find(query)
      .populate('userId', 'username profile')
      .populate('comments.userId', 'username')
      .sort({ createdAt: -1 });

    res.json({ 
      success: true,
      count: posts.length,
      posts 
    });
  } catch (error) {
    res.status(500).json({ 
      success: false,
      error: error.message 
    });
  }
};

// @desc    Get single post
// @route   GET /api/posts/:postId
// @access  Private
exports.getPost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.postId)
      .populate('userId', 'username profile')
      .populate('comments.userId', 'username');

    if (!post) {
      return res.status(404).json({ 
        success: false,
        error: 'Post not found' 
      });
    }

    res.json({ 
      success: true,
      post 
    });
  } catch (error) {
    res.status(500).json({ 
      success: false,
      error: error.message 
    });
  }
};

// @desc    Update post
// @route   PUT /api/posts/:postId
// @access  Private
exports.updatePost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.postId);

    if (!post) {
      return res.status(404).json({ 
        success: false,
        error: 'Post not found' 
      });
    }

    // Check authorization
    if (post.userId.toString() !== req.user.userId) {
      return res.status(403).json({ 
        success: false,
        error: 'Unauthorized to update this post' 
      });
    }

    const { title, content, category, tags } = req.body;
    
    post.title = title || post.title;
    post.content = content || post.content;
    post.category = category || post.category;
    post.tags = tags || post.tags;

    await post.save();
    await post.populate('userId', 'username profile');

    res.json({ 
      success: true,
      post 
    });
  } catch (error) {
    res.status(500).json({ 
      success: false,
      error: error.message 
    });
  }
};

// @desc    Delete post
// @route   DELETE /api/posts/:postId
// @access  Private
exports.deletePost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.postId);

    if (!post) {
      return res.status(404).json({ 
        success: false,
        error: 'Post not found' 
      });
    }

    // Check authorization
    if (post.userId.toString() !== req.user.userId) {
      return res.status(403).json({ 
        success: false,
        error: 'Unauthorized to delete this post' 
      });
    }

    await Post.findByIdAndDelete(req.params.postId);

    res.json({ 
      success: true,
      message: 'Post deleted successfully' 
    });
  } catch (error) {
    res.status(500).json({ 
      success: false,
      error: error.message 
    });
  }
};

// @desc    Add comment to post
// @route   POST /api/posts/:postId/comments
// @access  Private
exports.addComment = async (req, res) => {
  try {
    const { text } = req.body;
    const post = await Post.findById(req.params.postId);

    if (!post) {
      return res.status(404).json({ 
        success: false,
        error: 'Post not found' 
      });
    }

    post.comments.push({
      userId: req.user.userId,
      text,
      createdAt: new Date()
    });

    await post.save();
    await post.populate('comments.userId', 'username');

    res.status(201).json({ 
      success: true,
      post 
    });
  } catch (error) {
    res.status(500).json({ 
      success: false,
      error: error.message 
    });
  }
};

// @desc    Delete comment
// @route   DELETE /api/posts/:postId/comments/:commentId
// @access  Private
exports.deleteComment = async (req, res) => {
  try {
    const post = await Post.findById(req.params.postId);

    if (!post) {
      return res.status(404).json({ 
        success: false,
        error: 'Post not found' 
      });
    }

    const comment = post.comments.id(req.params.commentId);

    if (!comment) {
      return res.status(404).json({ 
        success: false,
        error: 'Comment not found' 
      });
    }

    // Check authorization
    if (comment.userId.toString() !== req.user.userId) {
      return res.status(403).json({ 
        success: false,
        error: 'Unauthorized to delete this comment' 
      });
    }

    comment.remove();
    await post.save();

    res.json({ 
      success: true,
      message: 'Comment deleted successfully' 
    });
  } catch (error) {
    res.status(500).json({ 
      success: false,
      error: error.message 
    });
  }
};

// @desc    Toggle like on post
// @route   POST /api/posts/:postId/like
// @access  Private
exports.toggleLike = async (req, res) => {
  try {
    const post = await Post.findById(req.params.postId);

    if (!post) {
      return res.status(404).json({ 
        success: false,
        error: 'Post not found' 
      });
    }

    const userIndex = post.likes.indexOf(req.user.userId);

    if (userIndex === -1) {
      // Add like
      post.likes.push(req.user.userId);
    } else {
      // Remove like
      post.likes.splice(userIndex, 1);
    }

    await post.save();

    res.json({ 
      success: true,
      likes: post.likes.length,
      isLiked: userIndex === -1
    });
  } catch (error) {
    res.status(500).json({ 
      success: false,
      error: error.message 
    });
  }
};