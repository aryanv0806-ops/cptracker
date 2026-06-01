const mongoose = require('mongoose');

const SubmissionHistorySchema = new mongoose.Schema({
  date: { type: String, required: true }, // Format: YYYY-MM-DD
  count: { type: Number, default: 0 },
  platforms: {
    leetcode: { type: Number, default: 0 },
    codechef: { type: Number, default: 0 },
    codeforces: { type: Number, default: 0 }
  }
});

const UserSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true, trim: true },
  email: { type: String, required: true, unique: true, trim: true, lowercase: true },
  password: { type: String, required: true },
  profilePic: { type: String, default: '' },
  
  // Platform Handles
  handles: {
    leetcode: { type: String, default: '' },
    codechef: { type: String, default: '' },
    codeforces: { type: String, default: '' }
  },

  // Cached Platform Stats (to prevent rate limits and speed up dashboard load)
  stats: {
    leetcode: {
      solved: { type: Number, default: 0 },
      easy: { type: Number, default: 0 },
      medium: { type: Number, default: 0 },
      hard: { type: Number, default: 0 },
      lastUpdated: { type: Date }
    },
    codechef: {
      rating: { type: Number, default: 0 },
      globalRank: { type: Number, default: 0 },
      stars: { type: String, default: '1★' },
      solved: { type: Number, default: 0 },
      lastUpdated: { type: Date }
    },
    codeforces: {
      rating: { type: Number, default: 0 },
      maxRating: { type: Number, default: 0 },
      rank: { type: String, default: 'unrated' },
      solved: { type: Number, default: 0 },
      lastUpdated: { type: Date }
    }
  },

  // Daily tracker data aggregated for heatmaps & charts
  submissionHistory: [SubmissionHistorySchema]
}, { timestamps: true });

module.exports = mongoose.model('User', UserSchema);
