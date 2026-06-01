import React, { useState, useContext, useRef, useEffect } from 'react';
import { AuthContext } from '../context/AuthContext';
import { ThemeContext } from '../context/ThemeContext';
import SkeuoCard from '../components/SkeuoCard';
import SkeuoInput from '../components/SkeuoInput';
import SkeuoButton from '../components/SkeuoButton';
import cpLogoImg from '../assets/cplogo.png';
import { ShieldAlert, Sun, Moon, ArrowRight } from 'lucide-react';

export default function Landing() {
  const { login, register } = useContext(AuthContext);
  const { theme, toggleTheme } = useContext(ThemeContext);
  const [isLogin, setIsLogin] = useState(true);
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [loading, setLoading] = useState(false);

  const canvasRef = useRef(null);
  const containerRef = useRef(null);
  const [mouse, setMouse] = useState({ x: null, y: null });

  // Canvas Animation Effect
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let animationFrameId;

    const resizeCanvas = () => {
      const container = containerRef.current;
      if (!container) return;
      const rect = container.getBoundingClientRect();
      canvas.width = rect.width;
      canvas.height = rect.height;
    };

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    const chars = ['{', '}', ';', '0', '1', '<', '>', '/', '+', '=', '[', ']', '(', ')'];
    const particles = [];
    const particleCount = 65;

    for (let i = 0; i < particleCount; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        vx: (Math.random() - 0.5) * 0.9,
        vy: (Math.random() - 0.5) * 0.9,
        size: Math.random() * 8 + 8,
        char: chars[Math.floor(Math.random() * chars.length)],
        opacity: Math.random() * 0.6 + 0.15,
        speedFactor: Math.random() * 0.4 + 0.6
      });
    }

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const isDark = theme === 'dark';

      particles.forEach((p, idx) => {
        // Slow continuous drift
        p.x += p.vx * p.speedFactor;
        p.y += p.vy * p.speedFactor;

        // Attracted force when mouse is near
        if (mouse.x !== null && mouse.y !== null) {
          const dx = mouse.x - p.x;
          const dy = mouse.y - p.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 160) {
            const force = (160 - dist) / 160;
            p.x += (dx / dist) * force * 1.5;
            p.y += (dy / dist) * force * 1.5;
          }
        }

        // Loop boundaries
        if (p.x < 0) p.x = canvas.width;
        if (p.x > canvas.width) p.x = 0;
        if (p.y < 0) p.y = canvas.height;
        if (p.y > canvas.height) p.y = 0;

        // Render code character
        ctx.font = `bold ${p.size}px monospace`;
        ctx.fillStyle = isDark 
          ? `rgba(255, 255, 255, ${p.opacity})` 
          : `rgba(99, 102, 241, ${p.opacity * 0.85})`;
        ctx.fillText(p.char, p.x, p.y);

        // Constellation links
        for (let j = idx + 1; j < particles.length; j++) {
          const p2 = particles[j];
          const dx = p.x - p2.x;
          const dy = p.y - p2.y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < 80) {
            ctx.beginPath();
            ctx.moveTo(p.x, p.y - p.size / 3);
            ctx.lineTo(p2.x, p2.y - p2.size / 3);
            ctx.strokeStyle = isDark 
              ? `rgba(99, 102, 241, ${(1 - dist / 80) * 0.12})` 
              : `rgba(99, 102, 241, ${(1 - dist / 80) * 0.06})`;
            ctx.lineWidth = 1;
            ctx.stroke();
          }
        }
      });

      animationFrameId = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      window.removeEventListener('resize', resizeCanvas);
      cancelAnimationFrame(animationFrameId);
    };
  }, [mouse, theme]);

  const handleMouseMove = (e) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    setMouse({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    });
  };

  const handleMouseLeave = () => {
    setMouse({ x: null, y: null });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setLoading(true);

    try {
      if (isLogin) {
        const res = await login(email, password);
        if (!res.success) {
          setErrorMsg(res.message);
        }
      } else {
        const res = await register(username, email, password);
        if (!res.success) {
          setErrorMsg(res.message);
        }
      }
    } catch (err) {
      setErrorMsg('An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-screen h-screen flex flex-col md:flex-row relative overflow-hidden transition-all duration-300 bg-white dark:bg-[#181622]">
      {/* Floating Theme Toggle Switch */}
      <div className="absolute top-6 right-6 z-20">
        <SkeuoButton
          onClick={toggleTheme}
          variant="default"
          className="px-3 py-2.5 text-sm shadow-md"
          title={theme === 'light' ? 'Switch to Dark Mode' : 'Switch to Light Mode'}
        >
          {theme === 'light' ? (
            <Moon size={15} className="text-slate-700" />
          ) : (
            <Sun size={15} className="text-yellow-400 glow-yellow" />
          )}
        </SkeuoButton>
      </div>

      {/* Left Visual Dynamic Panel */}
      <div 
        ref={containerRef}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        className="relative hidden md:flex md:w-[46%] bg-gradient-to-br from-indigo-50 via-purple-50 to-blue-50 dark:from-[#12101e] dark:via-[#201c35] dark:to-[#12101e] border-r border-slate-200 dark:border-white/5 p-12 flex-col justify-between overflow-hidden"
      >
        {/* Canvas overlay */}
        <canvas ref={canvasRef} className="absolute inset-0 z-0 pointer-events-none" />

        {/* Top Panel Branding */}
        <div className="flex justify-between items-center relative z-10">
          <div className="flex items-center gap-2.5">
            <img src={cpLogoImg} alt="App Logo" className="w-8 h-8 object-cover rounded-lg shadow-sm" />
            <span className="text-sm font-extrabold tracking-wider text-indigo-900 dark:text-white font-sans uppercase">
              CP Tracker
            </span>
          </div>
          <button 
            type="button" 
            onClick={() => setIsLogin(prev => !prev)}
            className="text-xs bg-indigo-600/10 hover:bg-indigo-600/20 text-indigo-700 dark:bg-white/10 dark:hover:bg-white/20 dark:text-white font-semibold px-3 py-1.5 rounded-full flex items-center gap-1.5 transition-all shadow-sm"
          >
            <span>{isLogin ? 'Register' : 'Log in'}</span>
            <ArrowRight size={11} />
          </button>
        </div>

        {/* Bottom Panel Marketing Text */}
        <div className="relative z-10">
          <h2 className="text-2xl lg:text-3xl font-black leading-tight text-slate-800 dark:text-white max-w-sm drop-shadow-sm font-sans">
            Mastering Algorithms, Tracking Daily Milestones.
          </h2>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-2.5 font-mono uppercase tracking-widest leading-none">
            leetcode · codeforces · codechef
          </p>
          
          {/* Visual Indicator Dots */}
          <div className="flex gap-1.5 mt-8">
            <span className="w-6 h-1 rounded-full bg-indigo-600 dark:bg-indigo-500"></span>
            <span className="w-1.5 h-1 rounded-full bg-slate-350 dark:bg-slate-700"></span>
            <span className="w-1.5 h-1 rounded-full bg-slate-350 dark:bg-slate-700"></span>
          </div>
        </div>
      </div>

      {/* Right Authentication Form Panel */}
      <div className="flex-1 p-8 sm:p-12 md:p-16 lg:p-24 flex flex-col justify-center bg-white dark:bg-[#181622] relative h-full overflow-y-auto">
        <div className="max-w-md w-full mx-auto md:mx-0">
          {/* Mobile Branding (Shows only on collapsed layouts) */}
          <div className="md:hidden flex items-center gap-2.5 mb-8">
            <img src={cpLogoImg} alt="App Logo" className="w-8 h-8 object-cover rounded-lg shadow-sm" />
            <span className="text-sm font-extrabold tracking-wider text-indigo-900 dark:text-white font-sans uppercase">
              CP Tracker
            </span>
          </div>

          {/* Main Headers */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold tracking-tight text-slate-800 dark:text-white">
              {isLogin ? 'Welcome back' : 'Create an account'}
            </h1>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-2 font-medium">
              {isLogin ? "New here? " : "Already have an account? "}
              <button 
                onClick={() => { setIsLogin(prev => !prev); setErrorMsg(''); }}
                className="text-indigo-600 dark:text-indigo-400 font-bold hover:underline"
              >
                {isLogin ? 'Create an account' : 'Log in'}
              </button>
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            {errorMsg && (
              <div className="p-3.5 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/30 text-red-600 dark:text-red-400 text-xs font-semibold flex items-center gap-2.5">
                <ShieldAlert size={16} className="shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            {!isLogin && (
              <SkeuoInput
                label="Username"
                type="text"
                placeholder="e.g. tourist_cp"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
              />
            )}

            <SkeuoInput
              label="Email Address"
              type="email"
              placeholder="e.g. name@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />

            <SkeuoInput
              label="Password"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />

            {!isLogin && (
              <div className="flex items-center gap-2.5 py-1">
                <input 
                  type="checkbox" 
                  id="agree" 
                  required 
                  className="w-4.5 h-4.5 rounded border-slate-350 dark:border-slate-650 bg-slate-50 dark:bg-slate-800 text-indigo-600 focus:ring-indigo-500/20" 
                />
                <label htmlFor="agree" className="text-xs text-slate-500 dark:text-slate-400 font-semibold">
                  I agree to the <span className="text-indigo-600 dark:text-indigo-400 hover:underline cursor-pointer">Terms & Conditions</span>
                </label>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-6 py-3.5 rounded-xl font-bold bg-[#635bff] hover:bg-[#5249f0] text-white active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none transition-all duration-150 flex items-center justify-center gap-2 shadow-lg shadow-indigo-600/10"
            >
              <span>{loading ? 'Processing...' : isLogin ? 'Sign In' : 'Create Account'}</span>
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
