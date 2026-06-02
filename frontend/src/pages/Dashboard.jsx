import React, { useContext, useState, useEffect, useRef } from 'react';
import { AuthContext } from '../context/AuthContext';
import Navbar from '../components/Navbar';
import PlatformCard from '../components/PlatformCard';
import Heatmap from '../components/Heatmap';
import SkeuoCard from '../components/SkeuoCard';
import UpcomingContests from '../components/UpcomingContests';
import { Code2, Flame } from 'lucide-react';

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

  // Fire Particles cursor effect
  const [particles, setParticles] = useState([]);
  const lastPosRef = useRef({ x: 0, y: 0 });

  const getRandomFireColor = () => {
    const r = Math.floor(Math.random() * 55) + 200; // 200-255 (Red)
    const g = Math.floor(Math.random() * 155) + 50;  // 50-205 (Green)
    const b = Math.floor(Math.random() * 50);        // 0-50 (Blue)
    return `rgb(${r}, ${g}, ${b})`;
  };

  const handleMouseMove = (e) => {
    const card = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - card.left;
    const y = e.clientY - card.top;

    const dx = x - lastPosRef.current.x;
    const dy = y - lastPosRef.current.y;
    const dist = Math.sqrt(dx * dx + dy * dy);

    if (dist < 6) return; // distance throttle
    lastPosRef.current = { x, y };

    // Minimum 1 emoji spawned, scales up with streak days
    const count = Math.min(6, Math.ceil(currentStreak / 4) + 1);

    const newParticles = [];
    for (let i = 0; i < count; i++) {
      const vx = (Math.random() * 2 - 1) * (currentStreak * 0.05 + 1.2);
      const vy = -Math.random() * (currentStreak * 0.06 + 2) - 1.2;
      const size = Math.random() * (Math.min(24, currentStreak * 0.4 + 8)) + 14;
      newParticles.push({
        id: Math.random() + Date.now(),
        x,
        y,
        vx,
        vy,
        size,
        color: getRandomFireColor(),
        alpha: 1.0,
        life: 1.0
      });
    }
    setParticles(prev => [...prev, ...newParticles].slice(-60));
  };

  useEffect(() => {
    if (particles.length === 0) return;

    const interval = setInterval(() => {
      setParticles(prev =>
        prev
          .map(p => ({
            ...p,
            x: p.x + p.vx,
            y: p.y + p.vy,
            life: p.life - 0.06, // decay rate
            alpha: p.life - 0.06,
            size: Math.max(0, p.size - 0.4)
          }))
          .filter(p => p.life > 0 && p.size > 0)
      );
    }, 30);

    return () => clearInterval(interval);
  }, [particles]);

  return (
    <div className="min-h-screen bg-skeuo-bg py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Navbar */}
        <Navbar />

        {/* Global Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <SkeuoCard className="flex items-center gap-5 p-6 min-h-[140px]">
            <div className="p-4 rounded-2xl skeuo-sunken text-blue-500">
              <Code2 size={28} className="glow-blue" />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Total Solved</p>
              <h2 className="text-3xl font-black text-slate-800 dark:text-slate-200 mt-1">{totalSolved}</h2>
              <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">Across all platforms</p>
            </div>
          </SkeuoCard>

          <SkeuoCard 
            className="flex items-center gap-5 p-6 relative overflow-visible select-none cursor-default min-h-[140px]"
            onMouseMove={handleMouseMove}
          >
            {/* Fire Emojis */}
            {particles.map(p => (
              <span
                key={p.id}
                className="absolute pointer-events-none select-none text-center"
                style={{
                  left: p.x,
                  top: p.y,
                  fontSize: `${p.size}px`,
                  transform: 'translate(-50%, -50%)',
                  opacity: p.alpha,
                  zIndex: 50,
                  filter: `drop-shadow(0 0 ${p.size / 3}px ${p.color})`,
                  transition: 'opacity 25ms linear, transform 25ms linear'
                }}
              >
                🔥
              </span>
            ))}

            <div className="p-4 rounded-2xl skeuo-sunken text-orange-500 z-10 relative">
              <Flame size={28} className="glow-red" />
            </div>
            <div className="z-10 relative">
              <p className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Submission Streak</p>
              <h2 className="text-3xl font-black text-slate-800 dark:text-slate-200 mt-1">{currentStreak} {currentStreak === 1 ? 'Day' : 'Days'}</h2>
              <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">Max Streak: {maxStreak} {maxStreak === 1 ? 'day' : 'days'}</p>
            </div>
          </SkeuoCard>

          <SkeuoCard className="flex items-center justify-center p-2 overflow-hidden min-h-[140px]">
            <img 
              src="https://media1.tenor.com/m/UIhGo3CFbxsAAAAC/anime-happy.gif" 
              alt="Proud of you!" 
              className="h-[120px] rounded-xl object-contain drop-shadow-[0_0_15px_rgba(244,143,143,0.5)]"
            />
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
