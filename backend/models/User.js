const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: [true, 'Username is required'],
    unique: true,
    trim: true,
    minlength: [3, 'Username must be at least 3 characters']
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    match: [/^\S+@\S+\.\S+$/, 'Please enter a valid email']
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: [6, 'Password must be at least 6 characters']
  },
  profile: {
    major: {
      type: String,
      default: 'Undeclared'
    },
    year: {
      type: Number,
      default: 1,
      min: 1,
      max: 4
    },
    bio: {
      type: String,
      maxlength: 500
    },
    avatar: {
      type: String,
      default: function() {
        return `https://ui-avatars.com/api/?background=667eea&color=fff&name=${this.username}`;
      }
    }
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Index for faster queries
userSchema.index({ email: 1 });
userSchema.index({ username: 1 });

module.exports = mongoose.model('User', userSchema);