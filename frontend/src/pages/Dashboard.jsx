import React, { useContext, useState } from 'react';
import { AuthContext } from '../context/AuthContext';
import Navbar from '../components/Navbar';
import PlatformCard from '../components/PlatformCard';
import Heatmap from '../components/Heatmap';
import SkeuoCard from '../components/SkeuoCard';
import UpcomingContests from '../components/UpcomingContests';
import { Code2, BarChart2, Flame } from 'lucide-react';

export default function Dashboard() {
  const { user, connectPlatform, disconnectPlatform } = useContext(AuthContext);
  const [loadingPlatform, setLoadingPlatform] = useState('');

  const handleConnect = async (platform, handle) => {
    setLoadingPlatform(platform);
    try {
      await connectPlatform(platform, handle);
    } catch (err) {
      throw err; // Passed to the card component to handle display
    } finally {
      setLoadingPlatform('');
    }
  };

  const handleDisconnect = async (platform) => {
    if (window.confirm(`Are you sure you want to disconnect your ${platform} account?`)) {
      setLoadingPlatform(platform);
      try {
        await disconnectPlatform(platform);
      } catch (err) {
        alert(err.message || 'Disconnect failed');
      } finally {
        setLoadingPlatform('');
      }
    }
  };

  // Calculations
  const lcSolved = user?.stats?.leetcode?.solved || 0;
  const ccSolved = user?.stats?.codechef?.solved || 0;
  const cfSolved = user?.stats?.codeforces?.solved || 0;
  const totalSolved = lcSolved + ccSolved + cfSolved;

  // Streak calculations
  const calculateStreak = (history = []) => {
    if (!history || history.length === 0) return { current: 0, max: 0 };
    
    const activeDates = new Set(
      history.filter(h => h.count > 0).map(h => h.date)
    );
    
    if (activeDates.size === 0) return { current: 0, max: 0 };
    
    const todayStr = new Date().toISOString().split('T')[0];
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toISOString().split('T')[0];
    
    let currentStreak = 0;
    let checkDate = new Date();
    
    if (activeDates.has(todayStr)) {
      while (activeDates.has(checkDate.toISOString().split('T')[0])) {
        currentStreak++;
        checkDate.setDate(checkDate.getDate() - 1);
      }
    } else if (activeDates.has(yesterdayStr)) {
      checkDate.setDate(checkDate.getDate() - 1); // Start from yesterday
      while (activeDates.has(checkDate.toISOString().split('T')[0])) {
        currentStreak++;
        checkDate.setDate(checkDate.getDate() - 1);
      }
    }
    
    // Max Streak
    const sortedActive = [...history]
      .filter(h => h.count > 0)
      .sort((a, b) => new Date(a.date) - new Date(b.date));
      
    let maxStreak = 0;
    let tempStreak = 0;
    let prevDate = null;
    
    sortedActive.forEach(item => {
      const currentDate = new Date(item.date);
      if (!prevDate) {
        tempStreak = 1;
      } else {
        const diffTime = Math.abs(currentDate - prevDate);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        if (diffDays === 1) {
          tempStreak++;
        } else if (diffDays > 1) {
          maxStreak = Math.max(maxStreak, tempStreak);
          tempStreak = 1;
        }
      }
      prevDate = currentDate;
    });
    maxStreak = Math.max(maxStreak, tempStreak);
    
    return { current: currentStreak, max: maxStreak };
  };

  const { current: currentStreak, max: maxStreak } = calculateStreak(user?.submissionHistory || []);

  const ratings = [];
  if (user?.handles?.codechef && user?.stats?.codechef?.rating) ratings.push(user.stats.codechef.rating);
  if (user?.handles?.codeforces && user?.stats?.codeforces?.rating) ratings.push(user.stats.codeforces.rating);
  const avgRating = ratings.length > 0 
    ? Math.round(ratings.reduce((a, b) => a + b, 0) / ratings.length) 
    : null;

  return (
    <div className="min-h-screen bg-skeuo-bg py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Navbar */}
        <Navbar />

        {/* Global Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <SkeuoCard className="flex items-center gap-5 p-6">
            <div className="p-4 rounded-2xl skeuo-sunken text-blue-500">
              <Code2 size={28} className="glow-blue" />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Total Solved</p>
              <h2 className="text-3xl font-black text-slate-800 dark:text-slate-200 mt-1">{totalSolved}</h2>
              <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">Across all platforms</p>
            </div>
          </SkeuoCard>

          <SkeuoCard className="flex items-center gap-5 p-6">
            <div className="p-4 rounded-2xl skeuo-sunken text-orange-500">
              <Flame size={28} className="glow-red" />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Submission Streak</p>
              <h2 className="text-3xl font-black text-slate-800 dark:text-slate-200 mt-1">{currentStreak} {currentStreak === 1 ? 'Day' : 'Days'}</h2>
              <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">Max Streak: {maxStreak} {maxStreak === 1 ? 'day' : 'days'}</p>
            </div>
          </SkeuoCard>

          <SkeuoCard className="flex items-center gap-5 p-6">
            <div className="p-4 rounded-2xl skeuo-sunken text-yellow-500">
              <BarChart2 size={28} className="glow-yellow" />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Average Rating</p>
              <h2 className="text-3xl font-black text-slate-800 dark:text-slate-200 mt-1">
                {avgRating !== null ? `${avgRating}` : 'N/A'}
              </h2>
              <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">Competitive platforms</p>
            </div>
          </SkeuoCard>
        </div>

        {/* Heatmap */}
        <Heatmap history={user?.submissionHistory || []} />

        {/* Upcoming Contests */}
        <UpcomingContests />

        {/* Platform Grid Header */}
        <div className="border-b border-slate-200 dark:border-white/5 pb-2">
          <h2 className="text-xl font-bold tracking-tight text-slate-800 dark:text-slate-200">Supported Coding Platforms</h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Select a connected platform card to view detailed progress charts and submissions.</p>
        </div>


        {/* Platform Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <PlatformCard
            platformId="leetcode"
            name="LeetCode"
            connected={!!user?.handles?.leetcode}
            handle={user?.handles?.leetcode}
            stats={user?.stats?.leetcode}
            onConnect={handleConnect}
            onDisconnect={handleDisconnect}
            isLoading={loadingPlatform === 'leetcode'}
          />

          <PlatformCard
            platformId="codechef"
            name="CodeChef"
            connected={!!user?.handles?.codechef}
            handle={user?.handles?.codechef}
            stats={user?.stats?.codechef}
            onConnect={handleConnect}
            onDisconnect={handleDisconnect}
            isLoading={loadingPlatform === 'codechef'}
          />

          <PlatformCard
            platformId="codeforces"
            name="Codeforces"
            connected={!!user?.handles?.codeforces}
            handle={user?.handles?.codeforces}
            stats={user?.stats?.codeforces}
            onConnect={handleConnect}
            onDisconnect={handleDisconnect}
            isLoading={loadingPlatform === 'codeforces'}
          />
        </div>
      </div>
    </div>
  );
}
