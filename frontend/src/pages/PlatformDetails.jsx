import React, { useEffect, useState, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import SkeuoCard from '../components/SkeuoCard';
import SkeuoButton from '../components/SkeuoButton';
import Heatmap from '../components/Heatmap';
import { ThemeContext } from '../context/ThemeContext';
import { LeetCodeLogo, CodeforcesLogo, CodeChefLogo } from '../components/Logos';
import { ArrowLeft, ShieldAlert, CheckCircle, XCircle, Sun, Moon } from 'lucide-react';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, Cell, PieChart, Pie } from 'recharts';

export default function PlatformDetails() {
  const { platformId } = useParams();
  const navigate = useNavigate();
  const { theme, toggleTheme } = useContext(ThemeContext);
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchDetails = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await axios.get(`/api/platforms/details/${platformId}`);
      setData(res.data);
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || 'Failed to load platform details');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDetails();
  }, [platformId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-skeuo-bg flex flex-col items-center justify-center gap-4">
        <img src="https://media1.tenor.com/m/dIPinX-49CsAAAAC/anime-vtuber.gif" alt="Loading..." className="w-20 h-20 rounded-2xl skeuo-raised" />
        <p className="text-[10px] font-bold text-slate-500 dark:text-slate-400 font-mono tracking-widest uppercase">Fetching Analytics...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-skeuo-bg flex items-center justify-center p-4">
        <SkeuoCard className="max-w-md w-full p-8 text-center border border-red-500/10">
          <ShieldAlert size={48} className="text-red-400 mx-auto mb-4" />
          <h2 className="text-2xl font-black text-slate-800 dark:text-slate-200">Error Occurred</h2>
          <p className="text-slate-600 dark:text-slate-400 text-sm mt-2 mb-6">{error}</p>
          <SkeuoButton onClick={() => navigate('/dashboard')} variant="accent" className="mx-auto">
            <ArrowLeft size={16} />
            <span>Back to Dashboard</span>
          </SkeuoButton>
        </SkeuoCard>
      </div>
    );
  }

  const { stats, handle, ratingHistory, recentSubmissions, submissionHistory } = data;

  // Filter submission history for this platform only
  const platformHistory = (submissionHistory || []).map(h => ({
    date: h.date,
    count: h.platforms?.[platformId] || 0,
    platforms: h.platforms
  }));

  // Sort and filter platform history chronologically
  const sortedHistory = [...platformHistory]
    .filter(h => h.count > 0)
    .sort((a, b) => a.date.localeCompare(b.date));

  const totalSubmissions = sortedHistory.reduce((sum, h) => sum + h.count, 0);
  const totalSolved = stats?.solved || 0;

  let cumulativeSubmissions = 0;
  const solvedProgression = sortedHistory.map(h => {
    cumulativeSubmissions += h.count;
    const solvedCount = totalSubmissions > 0
      ? Math.min(totalSolved, Math.round((cumulativeSubmissions / totalSubmissions) * totalSolved))
      : 0;
    const dateObj = new Date(h.date);
    const formattedDate = dateObj.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
    return {
      name: formattedDate,
      solved: solvedCount,
      date: h.date
    };
  });

  // Fallback if no history exists but solved count is non-zero
  if (solvedProgression.length === 0 && totalSolved > 0) {
    const today = new Date();
    const d = new Date();
    d.setDate(d.getDate() - 30);
    solvedProgression.push(
      {
        name: d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' }),
        solved: Math.max(0, totalSolved - 5),
        date: d.toISOString().split('T')[0]
      },
      {
        name: today.toLocaleDateString(undefined, { month: 'short', day: 'numeric' }),
        solved: totalSolved,
        date: today.toISOString().split('T')[0]
      }
    );
  } else if (solvedProgression.length === 1) {
    const d = new Date(solvedProgression[0].date);
    d.setDate(d.getDate() - 30);
    solvedProgression.unshift({
      name: d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' }),
      solved: Math.max(0, totalSolved - 5),
      date: d.toISOString().split('T')[0]
    });
  }

  const getPlatformColor = () => {
    if (platformId === 'leetcode') return '#f7a01b';
    if (platformId === 'codechef') return '#eab308';
    if (platformId === 'codeforces') return '#31649f';
    return '#3b82f6';
  };

  // Pie chart data for LeetCode difficulty
  const leetcodeDifficultyData = [
    { name: 'Easy', value: stats?.easy || 0, color: '#10b981' }, 
    { name: 'Medium', value: stats?.medium || 0, color: '#eab308' }, 
    { name: 'Hard', value: stats?.hard || 0, color: '#ef4444' }
  ].filter(d => d.value > 0);

  // Platform details formatting
  const getPlatformName = () => {
    if (platformId === 'leetcode') return 'LeetCode';
    if (platformId === 'codechef') return 'CodeChef';
    if (platformId === 'codeforces') return 'Codeforces';
    return 'Platform';
  };

  return (
    <div className="min-h-screen bg-skeuo-bg py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Header Section */}
        <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 border-b border-slate-200 dark:border-white/5 pb-6">
          <div className="flex items-center gap-4">
            <SkeuoButton onClick={() => navigate('/dashboard')} className="p-3 rounded-xl">
              <ArrowLeft size={20} />
            </SkeuoButton>
            <div className="p-2.5 rounded-xl skeuo-sunken flex items-center justify-center bg-skeuo-dark">
              {platformId === 'leetcode' && <LeetCodeLogo className="w-8 h-8 drop-shadow-[0_0_8px_rgba(247,160,27,0.4)]" />}
              {platformId === 'codeforces' && <CodeforcesLogo className="w-8 h-8 drop-shadow-[0_0_8px_rgba(49,100,159,0.4)]" />}
              {platformId === 'codechef' && <CodeChefLogo className="w-8 h-8 drop-shadow-[0_0_8px_rgba(91,70,54,0.4)]" />}
            </div>
            <div>
              <h1 className="text-3xl font-black tracking-tight text-slate-800 dark:text-slate-200">
                {getPlatformName()} Analytics
              </h1>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                Detailed stats and metrics for <span className="font-bold text-blue-500">@{handle}</span>
              </p>
            </div>
          </div>
          <div className="self-end sm:self-auto">
            <SkeuoButton
              onClick={toggleTheme}
              variant="default"
              className="px-3 py-2.5 text-sm"
              title={theme === 'light' ? 'Switch to Dark Mode' : 'Switch to Light Mode'}
            >
              {theme === 'light' ? (
                <Moon size={15} className="text-slate-700" />
              ) : (
                <Sun size={15} className="text-yellow-400 glow-yellow" />
              )}
            </SkeuoButton>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          <div className="p-5 rounded-2xl skeuo-sunken">
            <p className="text-[10px] uppercase tracking-wider font-bold text-slate-500 dark:text-slate-400">Solved Problems</p>
            <p className="text-3xl font-black text-blue-500 glow-blue mt-2">{stats?.solved || 0}</p>
          </div>

          {platformId === 'leetcode' && (
            <>
              <div className="p-5 rounded-2xl skeuo-sunken">
                <p className="text-[10px] uppercase tracking-wider font-bold text-slate-500 dark:text-slate-400">Easy Solved</p>
                <p className="text-3xl font-black text-emerald-500 glow-green mt-2">{stats?.easy || 0}</p>
              </div>
              <div className="p-5 rounded-2xl skeuo-sunken">
                <p className="text-[10px] uppercase tracking-wider font-bold text-slate-500 dark:text-slate-400">Medium Solved</p>
                <p className="text-3xl font-black text-yellow-600 glow-yellow mt-2">{stats?.medium || 0}</p>
              </div>
              <div className="p-5 rounded-2xl skeuo-sunken">
                <p className="text-[10px] uppercase tracking-wider font-bold text-slate-500 dark:text-slate-400">Hard Solved</p>
                <p className="text-3xl font-black text-red-500 glow-red mt-2">{stats?.hard || 0}</p>
              </div>
            </>
          )}

          {platformId === 'codechef' && (
            <>
              <div className="p-5 rounded-2xl skeuo-sunken">
                <p className="text-[10px] uppercase tracking-wider font-bold text-slate-500 dark:text-slate-400">Current Rating</p>
                <p className="text-3xl font-black text-yellow-600 glow-yellow mt-2">{stats?.rating || 0}</p>
              </div>
              <div className="p-5 rounded-2xl skeuo-sunken">
                <p className="text-[10px] uppercase tracking-wider font-bold text-slate-500 dark:text-slate-400">Stars</p>
                <p className="text-3xl font-black text-amber-500 glow-yellow mt-2">{stats?.stars || '1★'}</p>
              </div>
              <div className="p-5 rounded-2xl skeuo-sunken">
                <p className="text-[10px] uppercase tracking-wider font-bold text-slate-500 dark:text-slate-400">Global Rank</p>
                <p className="text-3xl font-black text-purple-600 dark:text-purple-400 mt-2">#{stats?.globalRank || 0}</p>
              </div>
            </>
          )}

          {platformId === 'codeforces' && (
            <>
              <div className="p-5 rounded-2xl skeuo-sunken">
                <p className="text-[10px] uppercase tracking-wider font-bold text-slate-500 dark:text-slate-400">Current Rating</p>
                <p className="text-3xl font-black text-green-600 glow-green mt-2">{stats?.rating || 0}</p>
              </div>
              <div className="p-5 rounded-2xl skeuo-sunken">
                <p className="text-[10px] uppercase tracking-wider font-bold text-slate-500 dark:text-slate-400">Max Rating</p>
                <p className="text-3xl font-black text-red-500 glow-red mt-2">{stats?.maxRating || 0}</p>
              </div>
              <div className="p-5 rounded-2xl skeuo-sunken">
                <p className="text-[10px] uppercase tracking-wider font-bold text-slate-500 dark:text-slate-400">Rank Badge</p>
                <p className="text-xl font-bold text-slate-700 dark:text-slate-200 mt-3 truncate capitalize">{stats?.rank || 'Unrated'}</p>
              </div>
            </>
          )}
        </div>

        {/* Platform Heatmap */}
        <Heatmap history={platformHistory} />

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Difficulty/Rating Chart */}
          <SkeuoCard className="p-6">
            <h3 className="text-lg font-bold text-slate-800 dark:text-slate-200 mb-6">
              {platformId === 'leetcode' ? 'Difficulty Distribution' : 'Rating Progression'}
            </h3>

            <div className="h-72 w-full rounded-2xl skeuo-sunken p-4 flex items-center justify-center">
              {platformId === 'leetcode' ? (
                leetcodeDifficultyData.length > 0 ? (
                  <div className="w-full h-full flex flex-col sm:flex-row items-center justify-around gap-4">
                    <div className="w-48 h-48">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={leetcodeDifficultyData}
                            innerRadius={60}
                            outerRadius={80}
                            paddingAngle={5}
                            dataKey="value"
                          >
                            {leetcodeDifficultyData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                          </Pie>
                          <Tooltip 
                            contentStyle={{ backgroundColor: 'var(--bg-color)', border: '1px solid var(--border-color)', borderRadius: '12px' }}
                            itemStyle={{ color: 'var(--text-color)' }}
                          />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                    <div className="space-y-3 font-mono text-sm">
                      {leetcodeDifficultyData.map((entry, index) => (
                        <div key={index} className="flex items-center gap-3">
                          <div className="w-3.5 h-3.5 rounded-md" style={{ backgroundColor: entry.color }}></div>
                          <span className="text-slate-600 dark:text-slate-400 w-16">{entry.name}:</span>
                          <span className="text-slate-800 dark:text-white font-bold">{entry.value} Solved</span>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <p className="text-slate-500 text-sm">No submission data available.</p>
                )
              ) : (
                ratingHistory && ratingHistory.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={ratingHistory} margin={{ top: 10, right: 20, left: -20, bottom: 0 }}>
                      <XAxis 
                        dataKey="name" 
                        stroke="#64748b" 
                        fontSize={11}
                        tickLine={false} 
                      />
                      <YAxis 
                        stroke="#64748b" 
                        fontSize={11}
                        tickLine={false}
                        domain={['auto', 'auto']}
                      />
                      <Tooltip
                        contentStyle={{ backgroundColor: 'var(--bg-color)', border: '1px solid var(--border-color)', borderRadius: '12px', fontFamily: 'monospace' }}
                        itemStyle={{ color: 'var(--text-color)' }}
                        labelStyle={{ color: 'var(--text-muted)' }}
                      />
                      <Line
                        type="monotone"
                        dataKey="rating"
                        stroke={platformId === 'codechef' ? '#eab308' : '#22c55e'}
                        strokeWidth={3}
                        dot={{ r: 5, fill: 'var(--bg-color)', stroke: 'var(--accent-blue)', strokeWidth: 2 }}
                        activeDot={{ r: 7 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                ) : (
                  <p className="text-slate-500 text-sm">No rating data available.</p>
                )
              )}
            </div>
          </SkeuoCard>

          {/* Solved Problems Progression Chart */}
          <SkeuoCard className="p-6">
            <h3 className="text-lg font-bold text-slate-800 dark:text-slate-200 mb-6">
              Solved Problems Progression
            </h3>

            <div className="h-72 w-full rounded-2xl skeuo-sunken p-4 flex items-center justify-center">
              {solvedProgression && solvedProgression.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={solvedProgression} margin={{ top: 10, right: 20, left: -20, bottom: 0 }}>
                    <XAxis 
                      dataKey="name" 
                      stroke="#64748b" 
                      fontSize={11}
                      tickLine={false} 
                    />
                    <YAxis 
                      stroke="#64748b" 
                      fontSize={11}
                      tickLine={false}
                      domain={['auto', 'auto']}
                    />
                    <Tooltip
                      contentStyle={{ backgroundColor: 'var(--bg-color)', border: '1px solid var(--border-color)', borderRadius: '12px', fontFamily: 'monospace' }}
                      itemStyle={{ color: 'var(--text-color)' }}
                      labelStyle={{ color: 'var(--text-muted)' }}
                    />
                    <Line
                      type="monotone"
                      dataKey="solved"
                      stroke={getPlatformColor()}
                      strokeWidth={3}
                      dot={{ r: 4, fill: 'var(--bg-color)', stroke: getPlatformColor(), strokeWidth: 2 }}
                      activeDot={{ r: 6 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <p className="text-slate-500 text-sm">No solved problems history available.</p>
              )}
            </div>
          </SkeuoCard>
        </div>

        {/* Submissions Section */}
        <SkeuoCard className="p-6">
          <h3 className="text-lg font-bold text-slate-800 dark:text-slate-200 mb-6">Recent Submissions</h3>
          
          <div className="overflow-x-auto rounded-2xl skeuo-sunken">
            <table className="min-w-full text-sm text-left">
              <thead className="bg-skeuo-dark text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider border-b border-slate-200 dark:border-white/5">
                <tr>
                  <th className="px-6 py-4">Problem Name</th>
                  <th className="px-6 py-4">Language</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4">Execution Time</th>
                  <th className="px-6 py-4">Submitted At</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-white/5 font-medium text-slate-700 dark:text-slate-300">
                {recentSubmissions && recentSubmissions.length > 0 ? (
                  recentSubmissions.map((sub) => (
                    <tr key={sub.id} className="hover:bg-black/[0.02] dark:hover:bg-white/[0.01] transition-colors">
                      <td className="px-6 py-4 font-bold text-slate-800 dark:text-slate-200">{sub.problemName}</td>
                      <td className="px-6 py-4 font-mono text-xs text-slate-600 dark:text-slate-400">{sub.language}</td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold ${
                          sub.status === 'Accepted' 
                            ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400' 
                            : 'bg-red-500/10 text-red-600 dark:text-red-400'
                        }`}>
                          {sub.status === 'Accepted' ? (
                            <CheckCircle size={12} />
                          ) : (
                            <XCircle size={12} />
                          )}
                          <span>{sub.status}</span>
                        </span>
                      </td>
                      <td className="px-6 py-4 font-mono text-xs text-slate-600 dark:text-slate-400">{sub.runTime}</td>
                      <td className="px-6 py-4 text-xs text-slate-500 dark:text-slate-400">{sub.time}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="5" className="text-center py-8 text-slate-500">
                      No submissions linked.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </SkeuoCard>

      </div>
    </div>
  );
}
