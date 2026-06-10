import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Eye, EyeOff, Shield, Car, User, Lock, Activity } from 'lucide-react';

const Login = () => {
  const { login } = useApp();
  const [role, setRole] = useState('driver'); // 'driver' or 'admin'
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!username.trim() || !password.trim()) {
      setError('Please fill in all fields.');
      return;
    }

    // Basic Mock Validation
    if (role === 'admin' && username.toLowerCase() !== 'admin') {
      setError('Admin username must be "admin" for testing.');
      return;
    }

    login(username, role);
  };

  const handleQuickLogin = (selectedRole, userVal) => {
    login(userVal, selectedRole);
  };

  return (
    <div className="min-h-screen relative flex items-center justify-center bg-darkBg px-4 py-12 overflow-hidden">
      {/* Background Neon Gradients */}
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-glowCyan/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-glowBlue/10 rounded-full blur-[120px] pointer-events-none" />

      {/* Grid Pattern Overlay */}
      <div className="absolute inset-0 bg-[radial-gradient(#ffffff04_1px,transparent_1px)] [background-size:24px_24px] pointer-events-none" />

      <div className="w-full max-w-md relative z-10">
        {/* Branding header */}
        <div className="text-center mb-8 flex flex-col items-center">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center shadow-lg shadow-cyan-500/20 mb-4 animate-pulse-slow">
            <Activity className="w-9 h-9 text-white" />
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-cyan-400 via-blue-400 to-indigo-500 bg-clip-text text-transparent">
            SDDDS
          </h1>
          <p className="text-slate-400 text-sm mt-2">
            Smart Driver Drowsiness Detection System
          </p>
        </div>

        {/* Login Glass Card */}
        <div className="glass-panel p-8 rounded-3xl shadow-2xl relative border border-slate-800">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-48 h-[2px] bg-gradient-to-r from-transparent via-cyan-500 to-transparent" />
          
          <h2 className="text-2xl font-bold text-center text-slate-100 mb-6">
            Welcome Back
          </h2>

          {/* Role selector Tabs */}
          <div className="grid grid-cols-2 p-1.5 bg-slate-950/60 rounded-xl mb-6 border border-slate-800/80">
            <button
              onClick={() => { setRole('driver'); setError(''); }}
              className={`flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-semibold transition-all duration-300 ${
                role === 'driver'
                  ? 'bg-gradient-to-r from-cyan-500 to-blue-500 text-white shadow-md'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Car className="w-4 h-4" />
              Driver
            </button>
            <button
              onClick={() => { setRole('admin'); setError(''); }}
              className={`flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-semibold transition-all duration-300 ${
                role === 'admin'
                  ? 'bg-gradient-to-r from-cyan-500 to-blue-500 text-white shadow-md'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Shield className="w-4 h-4" />
              Administrator
            </button>
          </div>

          {error && (
            <div className="mb-4 p-3.5 rounded-xl bg-red-500/10 border border-red-500/25 text-red-400 text-xs font-medium text-center">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Username Field */}
            <div>
              <label className="block text-slate-400 text-xs font-semibold uppercase tracking-wider mb-2">
                Username
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-500">
                  <User className="w-4 h-4" />
                </span>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder={role === 'driver' ? 'john_doe' : 'admin'}
                  className="w-full bg-slate-950/45 border border-slate-800 rounded-xl py-3 pl-10 pr-4 text-slate-100 placeholder-slate-600 focus:outline-none focus:border-cyan-500/75 transition-all text-sm"
                />
              </div>
            </div>

            {/* Password Field */}
            <div>
              <label className="block text-slate-400 text-xs font-semibold uppercase tracking-wider mb-2">
                Password
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-500">
                  <Lock className="w-4 h-4" />
                </span>
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-slate-950/45 border border-slate-800 rounded-xl py-3 pl-10 pr-10 text-slate-100 placeholder-slate-600 focus:outline-none focus:border-cyan-500/75 transition-all text-sm"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-500 hover:text-slate-300"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              className="w-full bg-gradient-to-r from-cyan-500 to-blue-500 text-white font-semibold py-3.5 px-4 rounded-xl hover:from-cyan-400 hover:to-blue-400 focus:outline-none focus:ring-2 focus:ring-cyan-500/25 active:scale-[0.98] transition-all text-sm glow-btn-cyan mt-3"
            >
              Sign In to Dashboard
            </button>
          </form>

          {/* Quick Login Section */}
          <div className="mt-8 pt-6 border-t border-slate-800/80">
            <span className="block text-center text-xs text-slate-500 font-semibold mb-3">
              DEMO CREDENTIALS
            </span>
            <div className="flex gap-3 justify-center">
              <button
                type="button"
                onClick={() => handleQuickLogin('driver', 'john_doe')}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-300 text-xs hover:border-cyan-500 hover:text-cyan-400 transition-all"
              >
                <Car className="w-3.5 h-3.5" />
                Driver Demo
              </button>
              <button
                type="button"
                onClick={() => handleQuickLogin('admin', 'admin')}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-300 text-xs hover:border-blue-500 hover:text-blue-400 transition-all"
              >
                <Shield className="w-3.5 h-3.5" />
                Admin Demo
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
