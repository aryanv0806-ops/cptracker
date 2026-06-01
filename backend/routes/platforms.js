const router = require('express').Router();
const User = require('../models/User');
const authMiddleware = require('../middleware/auth');
const { 
  fetchLeetCodeStats, 
  fetchLeetCodeHistory,
  fetchLeetCodeRatingHistory,
  fetchLeetCodeRecentSubmissions,
  fetchCodeforcesStats,
  fetchCodeforcesHistory,
  fetchCodeforcesRatingHistory,
  fetchCodeforcesRecentSubmissions,
  fetchCodeChefStats,
  fetchCodeChefHistory,
  fetchCodeChefRatingHistory,
  fetchCodeChefRecentSubmissions,
  fetchUpcomingContests
} = require('../utils/scrapers');

// Helper to merge daily submission history from a platform into the user document
function mergeHistoryForUser(user, platform, historyMap) {
  const today = new Date();
  const oneYearAgo = new Date();
  oneYearAgo.setDate(today.getDate() - 366);
  const oneYearAgoStr = oneYearAgo.toISOString().split('T')[0];

  // 1. Keep only history items from the past 366 days
  if (!user.submissionHistory) {
    user.submissionHistory = [];
  }
  user.submissionHistory = user.submissionHistory.filter(h => h.date >= oneYearAgoStr);

  // 2. Iterate over all dates in the past 366 days
  for (let i = 365; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(today.getDate() - i);
    const dateStr = d.toISOString().split('T')[0];

    const platformCount = historyMap[dateStr] || 0;

    const existingIdx = user.submissionHistory.findIndex(h => h.date === dateStr);
    if (existingIdx >= 0) {
      user.submissionHistory[existingIdx].platforms[platform] = platformCount;
      user.submissionHistory[existingIdx].count =
        (user.submissionHistory[existingIdx].platforms.leetcode || 0) +
        (user.submissionHistory[existingIdx].platforms.codechef || 0) +
        (user.submissionHistory[existingIdx].platforms.codeforces || 0);
    } else {
      if (platformCount > 0) {
        const platforms = { leetcode: 0, codechef: 0, codeforces: 0 };
        platforms[platform] = platformCount;
        user.submissionHistory.push({
          date: dateStr,
          count: platformCount,
          platforms
        });
      }
    }
  }
}

// Link Handle
router.post('/connect', authMiddleware, async (req, res) => {
  try {
    const { platform, handle } = req.body;
    if (!['leetcode', 'codechef', 'codeforces'].includes(platform)) {
      return res.status(400).json({ message: 'Invalid platform' });
    }
    if (!handle || handle.trim() === '') {
      return res.status(400).json({ message: 'Handle is required' });
    }

    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    user.handles[platform] = handle;
    
    // Perform initial fetch
    let stats = {};
    let historyMap = {};
    if (platform === 'leetcode') {
      stats = await fetchLeetCodeStats(handle);
      historyMap = await fetchLeetCodeHistory(handle);
    } else if (platform === 'codechef') {
      stats = await fetchCodeChefStats(handle);
      historyMap = await fetchCodeChefHistory(handle);
    } else if (platform === 'codeforces') {
      stats = await fetchCodeforcesStats(handle);
      historyMap = await fetchCodeforcesHistory(handle);
    }
    
    user.stats[platform] = { ...stats, lastUpdated: new Date() };

    // Merge history into user document
    mergeHistoryForUser(user, platform, historyMap);

    await user.save();
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: err.message || 'Server error linking handle' });
  }
});

// Disconnect Handle
router.post('/disconnect', authMiddleware, async (req, res) => {
  try {
    const { platform } = req.body;
    if (!['leetcode', 'codechef', 'codeforces'].includes(platform)) {
      return res.status(400).json({ message: 'Invalid platform' });
    }

    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    user.handles[platform] = '';
    
    // Clear stats
    if (platform === 'leetcode') {
      user.stats.leetcode = { solved: 0, easy: 0, medium: 0, hard: 0, lastUpdated: null };
    } else if (platform === 'codechef') {
      user.stats.codechef = { rating: 0, globalRank: 0, stars: '1★', solved: 0, lastUpdated: null };
    } else if (platform === 'codeforces') {
      user.stats.codeforces = { rating: 0, maxRating: 0, rank: 'unrated', solved: 0, lastUpdated: null };
    }

    // Clear submission history for this platform
    if (user.submissionHistory) {
      user.submissionHistory.forEach(item => {
        if (item.platforms && item.platforms[platform] !== undefined) {
          item.platforms[platform] = 0;
          item.count = 
            (item.platforms.leetcode || 0) +
            (item.platforms.codechef || 0) +
            (item.platforms.codeforces || 0);
        }
      });
      // Filter out entries that have 0 count to save database space
      user.submissionHistory = user.submissionHistory.filter(h => h.count > 0);
    }

    await user.save();
    res.json(user);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error disconnecting handle' });
  }
});

// Sync/Refresh Platform data
router.post('/sync', authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: 'User not found' });
    let updated = false;

    for (const platform of ['leetcode', 'codechef', 'codeforces']) {
      const handle = user.handles[platform];
      if (handle) {
        let stats = {};
        let historyMap = {};
        try {
          if (platform === 'leetcode') {
            stats = await fetchLeetCodeStats(handle);
            historyMap = await fetchLeetCodeHistory(handle);
          } else if (platform === 'codechef') {
            stats = await fetchCodeChefStats(handle);
            historyMap = await fetchCodeChefHistory(handle);
          } else if (platform === 'codeforces') {
            stats = await fetchCodeforcesStats(handle);
            historyMap = await fetchCodeforcesHistory(handle);
          }
          
          user.stats[platform] = { ...stats, lastUpdated: new Date() };
          mergeHistoryForUser(user, platform, historyMap);
          updated = true;
        } catch (e) {
          console.error(`Sync failed for ${platform} (${handle}):`, e.message);
          // Continue syncing other platforms even if one fails
        }
      }
    }
    if (updated) await user.save();
    res.json(user);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to sync platform handles' });
  }
});

// Get detailed platform history, stats, and submissions
router.get('/details/:platform', authMiddleware, async (req, res) => {
  try {
    const { platform } = req.params;
    if (!['leetcode', 'codechef', 'codeforces'].includes(platform)) {
      return res.status(400).json({ message: 'Invalid platform' });
    }

    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    const handle = user.handles[platform];
    if (!handle) {
      return res.status(400).json({ message: 'Platform not linked' });
    }

    const stats = user.stats[platform];
    
    // Fetch real-time rating history and recent submissions
    let ratingHistory = [];
    let recentSubmissions = [];

    if (platform === 'leetcode') {
      ratingHistory = await fetchLeetCodeRatingHistory(handle);
      recentSubmissions = await fetchLeetCodeRecentSubmissions(handle, 10);
    } else if (platform === 'codeforces') {
      ratingHistory = await fetchCodeforcesRatingHistory(handle);
      recentSubmissions = await fetchCodeforcesRecentSubmissions(handle, 10);
    } else if (platform === 'codechef') {
      ratingHistory = await fetchCodeChefRatingHistory(handle);
      recentSubmissions = await fetchCodeChefRecentSubmissions(handle, 10);
    }

    res.json({
      handle,
      stats,
      ratingHistory,
      recentSubmissions,
      submissionHistory: user.submissionHistory || []
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error fetching platform details' });
  }
});

// Get upcoming contests from all platforms
router.get('/upcoming-contests', authMiddleware, async (req, res) => {
  try {
    const contests = await fetchUpcomingContests();
    res.json(contests);
  } catch (err) {
    console.error('Failed to retrieve upcoming contests:', err);
    res.status(500).json({ message: err.message || 'Failed to fetch contests' });
  }
});

module.exports = router;
