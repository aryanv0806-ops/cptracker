import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import SkeuoCard from './SkeuoCard';
import SkeuoInput from './SkeuoInput';
import SkeuoButton from './SkeuoButton';
import { motion } from 'framer-motion';
import { Code, Flame, Trophy, Link2, Unlink } from 'lucide-react';
import { LeetCodeLogo, CodeforcesLogo, CodeChefLogo } from './Logos';

export default function PlatformCard({ 
  platformId, 
  name, 
  connected, 
  handle, 
  stats, 
  onConnect, 
  onDisconnect, 
  isLoading 
}) {
  const navigate = useNavigate();
  const [inputHandle, setInputHandle] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [connecting, setConnecting] = useState(false);

  const getIcon = () => {
    switch (platformId) {
      case 'leetcode':
        return <LeetCodeLogo className="w-7 h-7 drop-shadow-[0_0_8px_rgba(247,160,27,0.4)]" />;
      case 'codeforces':
        return <CodeforcesLogo className="w-7 h-7 drop-shadow-[0_0_8px_rgba(49,100,159,0.4)]" />;
      case 'codechef':
        return <CodeChefLogo className="w-7 h-7 drop-shadow-[0_0_8px_rgba(91,70,54,0.4)]" />;
      default:
        return <Code size={24} />;
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    if (!inputHandle.trim()) return;

    setConnecting(true);
    try {
      await onConnect(platformId, inputHandle.trim());
    } catch (err) {
      setErrorMsg(err.message || 'Handle verification failed');
    } finally {
      setConnecting(false);
    }
  };

  const handleCardClick = () => {
    if (connected && !isLoading && !connecting) {
      navigate(`/platform/${platformId}`);
    }
  };

  return (
    <motion.div 
      whileHover={connected ? { scale: 1.02 } : {}}
      className={connected ? "cursor-pointer" : ""}
      onClick={handleCardClick}
    >
      <SkeuoCard className="p-6 min-h-[300px] flex flex-col justify-between transition-all duration-200">
        <div>
          <div className="flex justify-between items-center mb-5" onClick={(e) => connected && e.stopPropagation()}>
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-xl skeuo-sunken">
                {getIcon()}
              </div>
              <h3 className="text-xl font-bold tracking-tight text-slate-800 dark:text-slate-200">{name}</h3>
            </div>
            {connected && (
              <button 
                onClick={(e) => { 
                  e.stopPropagation(); 
                  onDisconnect(platformId); 
                }}
                className="text-xs text-red-600 hover:text-red-700 dark:text-red-400/70 dark:hover:text-red-400 font-semibold px-3 py-1.5 rounded-lg skeuo-raised skeuo-button-active flex items-center gap-1 transition-all"
              >
                <Unlink size={12} />
                <span>Disconnect</span>
              </button>
            )}
          </div>

          {connected ? (
            <div className="space-y-4">
              <div>
                <p className="text-[10px] uppercase tracking-wider font-bold text-slate-500 dark:text-slate-400">Handle</p>
                <p className="text-lg font-bold text-slate-800 dark:text-slate-200">@{handle}</p>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                {platformId === 'leetcode' && (
                  <>
                    <div className="p-3 rounded-xl skeuo-sunken">
                      <p className="text-xs font-medium text-slate-600 dark:text-slate-400">Solved</p>
                      <p className="text-2xl font-black text-blue-500 dark:text-blue-400 glow-blue">{stats?.solved || 0}</p>
                    </div>
                    <div className="p-3 rounded-xl skeuo-sunken">
                      <p className="text-xs font-medium text-slate-600 dark:text-slate-400">Hard Solved</p>
                      <p className="text-2xl font-black text-red-600 dark:text-red-500 glow-red">{stats?.hard || 0}</p>
                    </div>
                  </>
                )}
                {platformId === 'codechef' && (
                  <>
                    <div className="p-3 rounded-xl skeuo-sunken">
                      <p className="text-xs font-medium text-slate-600 dark:text-slate-400">Rating</p>
                      <p className="text-2xl font-black text-yellow-600 dark:text-yellow-500 glow-yellow">{stats?.rating || 0}</p>
                    </div>
                    <div className="p-3 rounded-xl skeuo-sunken">
                      <p className="text-xs font-medium text-slate-600 dark:text-slate-400">Stars</p>
                      <p className="text-2xl font-black text-amber-600 dark:text-amber-500 glow-yellow">{stats?.stars || '1★'}</p>
                    </div>
                  </>
                )}
                {platformId === 'codeforces' && (
                  <>
                    <div className="p-3 rounded-xl skeuo-sunken">
                      <p className="text-xs font-medium text-slate-600 dark:text-slate-400">Rating</p>
                      <p className="text-2xl font-black text-green-600 dark:text-green-500 glow-green">{stats?.rating || 0}</p>
                    </div>
                    <div className="p-3 rounded-xl skeuo-sunken">
                      <p className="text-xs font-medium text-slate-600 dark:text-slate-400">Rank</p>
                      <p className="text-sm font-black text-slate-800 dark:text-slate-200 truncate capitalize" title={stats?.rank}>
                        {stats?.rank || 'Unrated'}
                      </p>
                    </div>
                  </>
                )}
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4" onClick={(e) => e.stopPropagation()}>
              <SkeuoInput
                label={`Link ${name} Handle`}
                placeholder="Enter handle..."
                value={inputHandle}
                onChange={(e) => setInputHandle(e.target.value)}
                required
              />
              {errorMsg && <p className="text-xs text-red-400 font-semibold">{errorMsg}</p>}
              <SkeuoButton 
                type="submit" 
                disabled={isLoading || connecting}
                variant="accent"
                className="w-full mt-2"
              >
                <Link2 size={16} />
                <span>{isLoading || connecting ? 'Connecting...' : 'Connect'}</span>
              </SkeuoButton>
            </form>
          )}
        </div>
        
        {connected && stats?.lastUpdated && (
          <p className="text-[10px] text-slate-500 text-right mt-4 font-mono">
            Synced: {new Date(stats.lastUpdated).toLocaleTimeString()}
          </p>
        )}
      </SkeuoCard>
    </motion.div>
  );
}
