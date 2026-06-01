import React, { useEffect, useState } from 'react';
import axios from 'axios';
import SkeuoCard from './SkeuoCard';
import { Calendar, Clock, ExternalLink, Flame, Trophy, Code } from 'lucide-react';
import { LeetCodeLogo, CodeforcesLogo, CodeChefLogo } from './Logos';

export default function UpcomingContests() {
  const [contests, setContests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const getContests = async () => {
      try {
        const res = await axios.get('/api/platforms/upcoming-contests');
        setContests(res.data);
      } catch (err) {
        console.error('Error loading contests:', err);
        setError('Could not retrieve upcoming contests.');
      } finally {
        setLoading(false);
      }
    };
    getContests();
  }, []);

  const formatLocalTime = (isoString) => {
    const date = new Date(isoString);
    return date.toLocaleString(undefined, {
      month: 'short',
      day: 'numeric',
      weekday: 'short',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatDuration = (seconds) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    if (minutes === 0) return `${hours} hrs`;
    return `${hours}h ${minutes}m`;
  };

  const getPlatformIcon = (platform) => {
    switch (platform) {
      case 'leetcode':
        return <LeetCodeLogo className="w-4 h-4" />;
      case 'codeforces':
        return <CodeforcesLogo className="w-4 h-4" />;
      case 'codechef':
        return <CodeChefLogo className="w-4 h-4" />;
      default:
        return <Code size={14} />;
    }
  };

  const getPlatformBadge = (platform) => {
    let name = '';
    let style = '';
    switch (platform) {
      case 'leetcode':
        name = 'LeetCode';
        style = 'bg-yellow-500/10 text-yellow-600 dark:text-yellow-400 border-yellow-500/20';
        break;
      case 'codeforces':
        name = 'Codeforces';
        style = 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20';
        break;
      case 'codechef':
        name = 'CodeChef';
        style = 'bg-orange-500/10 text-orange-600 dark:text-orange-400 border-orange-500/20';
        break;
      default:
        name = 'Platform';
        style = 'bg-slate-500/10 text-slate-600 dark:text-slate-400 border-slate-500/20';
    }

    return (
      <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wider border ${style}`}>
        {getPlatformIcon(platform)}
        {name}
      </span>
    );
  };

  return (
    <SkeuoCard className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h3 className="text-lg font-bold text-slate-800 dark:text-slate-200">Upcoming Coding Contests</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Cross-platform contest schedule (LeetCode, Codeforces, CodeChef)
          </p>
        </div>
      </div>

      <div className="rounded-2xl skeuo-sunken p-4">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-8 gap-3">
            <img src="https://media1.tenor.com/m/dIPinX-49CsAAAAC/anime-vtuber.gif" alt="Loading..." className="w-16 h-16 rounded-xl skeuo-raised" />
            <p className="text-[10px] text-slate-500 dark:text-slate-400 font-mono uppercase tracking-wider">Fetching Schedules...</p>
          </div>
        ) : error ? (
          <p className="text-center py-6 text-sm text-red-500 dark:text-red-400 font-semibold">{error}</p>
        ) : contests.length === 0 ? (
          <p className="text-center py-8 text-sm text-slate-500">No upcoming contests found.</p>
        ) : (
          <div className="divide-y divide-slate-200 dark:divide-white/5 max-h-80 overflow-y-auto pr-1">
            {contests.slice(0, 10).map((contest, idx) => (
              <div 
                key={idx}
                onClick={() => window.open(contest.link, '_blank')}
                className="py-4 first:pt-1 last:pb-1 flex flex-col md:flex-row md:items-center justify-between gap-4 cursor-pointer hover:bg-black/[0.02] dark:hover:bg-white/[0.01] rounded-xl px-3 -mx-2 transition-all duration-150 group"
              >
                <div className="flex flex-col gap-2 flex-1">
                  <div className="flex items-center gap-2.5 flex-wrap">
                    {getPlatformBadge(contest.platform)}
                    <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 font-mono flex items-center gap-1 bg-slate-200/50 dark:bg-skeuo-dark px-2 py-0.5 rounded-md">
                      <Clock size={11} />
                      {formatDuration(contest.duration)}
                    </span>
                  </div>
                  <h4 className="text-sm font-bold text-slate-800 dark:text-slate-100 group-hover:text-blue-500 transition-colors">
                    {contest.title}
                  </h4>
                </div>

                <div className="flex items-center justify-between md:justify-end gap-6 shrink-0">
                  <div className="flex items-center gap-2 text-xs font-semibold text-slate-600 dark:text-slate-400">
                    <Calendar size={13} className="text-slate-400" />
                    <span>{formatLocalTime(contest.startTime)}</span>
                  </div>
                  
                  <div className="p-2 rounded-lg skeuo-raised text-slate-500 group-hover:text-blue-500 dark:group-hover:text-blue-400 group-hover:scale-105 transition-all">
                    <ExternalLink size={13} />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </SkeuoCard>
  );
}
