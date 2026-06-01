import React, { useContext, useState } from 'react';
import { AuthContext } from '../context/AuthContext';
import { ThemeContext } from '../context/ThemeContext';
import SkeuoButton from './SkeuoButton';
import cpLogoImg from '../assets/cplogo.png';
import { RefreshCw, LogOut, User as UserIcon, Sun, Moon } from 'lucide-react';

export default function Navbar() {
  const { user, logout, syncPlatforms } = useContext(AuthContext);
  const { theme, toggleTheme } = useContext(ThemeContext);
  const [syncing, setSyncing] = useState(false);

  const handleSync = async () => {
    setSyncing(true);
    try {
      await syncPlatforms();
    } catch (err) {
      alert(err.message || 'Sync failed');
    } finally {
      setSyncing(false);
    }
  };

  return (
    <nav className="mb-8 px-6 py-4 rounded-2xl skeuo-raised flex justify-between items-center border border-white/5">
      <div className="flex items-center gap-3">
        <div className="p-1 rounded-xl skeuo-sunken flex items-center justify-center overflow-hidden w-11 h-11 bg-skeuo-dark">
          <img src={cpLogoImg} alt="CP Tracker Logo" className="w-full h-full object-cover rounded-lg" />
        </div>
        <div>
          <span className="text-lg font-bold bg-gradient-to-r from-blue-600 to-indigo-500 dark:from-blue-400 dark:to-indigo-300 bg-clip-text text-transparent tracking-wide">
            CP Tracker
          </span>
          <span className="text-[10px] block text-slate-500 font-mono tracking-widest leading-none mt-0.5">
            Track daily progress
          </span>
        </div>
      </div>

      <div className="flex items-center gap-3">
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

        {user && (
          <div className="flex items-center gap-3">
            <div className="hidden sm:flex items-center gap-2.5 px-4 py-2.5 rounded-xl skeuo-sunken">
              <UserIcon size={16} className="text-slate-400" />
              <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                {user.username}
              </span>
            </div>

            <SkeuoButton
              onClick={handleSync}
              disabled={syncing}
              variant="accent"
              className="px-4 py-2.5 text-sm"
            >
              <RefreshCw size={14} className={syncing ? 'animate-spin' : ''} />
              <span>{syncing ? 'Syncing...' : 'Sync'}</span>
            </SkeuoButton>

            <SkeuoButton
              onClick={logout}
              variant="danger"
              className="px-4 py-2.5 text-sm"
            >
              <LogOut size={14} />
              <span className="hidden sm:inline">Logout</span>
            </SkeuoButton>
          </div>
        )}
      </div>
    </nav>
  );
}
